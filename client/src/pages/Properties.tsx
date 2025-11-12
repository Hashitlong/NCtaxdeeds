import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Download, X, Star, Save, Bookmark, History, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Home, Map, BarChart3, Settings, ThumbsUp, ThumbsDown, Eye, EyeOff, CheckCircle, MessageSquare, Globe } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyDetailDialog } from "@/components/PropertyDetailDialog";

// Rating Cell Component
function RatingCell({ property }: { property: any }) {
  const utils = trpc.useUtils();
  const setRatingMutation = trpc.properties.setRating.useMutation({
    onSuccess: () => {
      utils.properties.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to update rating: ${error.message}`);
    },
  });

  const handleRatingClick = (e: React.MouseEvent, rating: "good" | "bad" | "watching" | "needs_viewed" | "viewed" | null) => {
    e.stopPropagation();
    setRatingMutation.mutate({
      propertyId: property.id,
      rating,
    });
  };

  const currentRating = property.teamRating;
  const isBadRating = currentRating === "bad";

  return (
    <TooltipProvider>
      <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => handleRatingClick(e, currentRating === "good" ? null : "good")}
              disabled={isBadRating && currentRating !== "good"}
              className={`hover:scale-125 transition-transform ${
                currentRating === "good" ? "opacity-100" : isBadRating ? "opacity-10 cursor-not-allowed" : "opacity-30 hover:opacity-70"
              }`}
            >
              <ThumbsUp className="h-4 w-4 text-green-600" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Good property - Worth pursuing</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => handleRatingClick(e, currentRating === "watching" ? null : "watching")}
              disabled={isBadRating && currentRating !== "watching"}
              className={`hover:scale-125 transition-transform ${
                currentRating === "watching" ? "opacity-100" : isBadRating ? "opacity-10 cursor-not-allowed" : "opacity-30 hover:opacity-70"
              }`}
            >
              <Eye className="h-4 w-4 text-blue-600" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Watching - Monitoring this property</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => handleRatingClick(e, currentRating === "bad" ? null : "bad")}
              className={`hover:scale-125 transition-transform ${
                currentRating === "bad" ? "opacity-100" : "opacity-30 hover:opacity-70"
              }`}
            >
              <ThumbsDown className="h-4 w-4 text-red-600" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Bad property - Not interested (blocks other ratings)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => handleRatingClick(e, currentRating === "needs_viewed" ? null : "needs_viewed")}
              disabled={isBadRating && currentRating !== "needs_viewed"}
              className={`hover:scale-125 transition-transform ${
                currentRating === "needs_viewed" ? "opacity-100" : isBadRating ? "opacity-10 cursor-not-allowed" : "opacity-30 hover:opacity-70"
              }`}
            >
              <EyeOff className="h-4 w-4 text-orange-600" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Needs Viewed - Requires team review</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => handleRatingClick(e, currentRating === "viewed" ? null : "viewed")}
              disabled={isBadRating && currentRating !== "viewed"}
              className={`hover:scale-125 transition-transform ${
                currentRating === "viewed" ? "opacity-100" : isBadRating ? "opacity-10 cursor-not-allowed" : "opacity-30 hover:opacity-70"
              }`}
            >
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Viewed - Has been reviewed by team</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export default function Properties() {
  const [searchTerm, setSearchTerm] = useState("");
  const [countyFilter, setCountyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [minBid, setMinBid] = useState("");
  const [maxBid, setMaxBid] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [saveSearchDialogOpen, setSaveSearchDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  
  // Load user preferences
  const { data: userPreferences } = trpc.preferences.get.useQuery(undefined, {
    enabled: !preferencesLoaded,
  });

  // Save preferences mutation
  const savePreferencesMutation = trpc.preferences.save.useMutation({
    onSuccess: () => {
      // Silent success - no toast needed for auto-save
    },
  });

  // Reset preferences mutation
  const resetPreferencesMutation = trpc.preferences.reset.useMutation({
    onSuccess: () => {
      // Reset all filters to defaults
      setCountyFilter('all');
      setStatusFilter('all');
      setSourceFilter('all');
      setMinBid('');
      setMaxBid('');
      setStartDate('');
      setEndDate('');
      setSortColumn(null);
      setSortDirection('asc');
      toast.success('Preferences reset to defaults');
    },
    onError: (error) => {
      toast.error(`Failed to reset preferences: ${error.message}`);
    },
  });

  // Load preferences on mount
  useEffect(() => {
    if (userPreferences && !preferencesLoaded) {
      if ((userPreferences as any).defaultCountyFilter) setCountyFilter((userPreferences as any).defaultCountyFilter);
      if ((userPreferences as any).defaultStatusFilter) setStatusFilter((userPreferences as any).defaultStatusFilter);
      if ((userPreferences as any).defaultSourceFilter) setSourceFilter((userPreferences as any).defaultSourceFilter);
      if ((userPreferences as any).defaultMinBid) setMinBid((userPreferences as any).defaultMinBid);
      if ((userPreferences as any).defaultMaxBid) setMaxBid((userPreferences as any).defaultMaxBid);
      if ((userPreferences as any).defaultStartDate) setStartDate((userPreferences as any).defaultStartDate);
      if ((userPreferences as any).defaultEndDate) setEndDate((userPreferences as any).defaultEndDate);
      if ((userPreferences as any).defaultSortColumn) setSortColumn((userPreferences as any).defaultSortColumn);
      if ((userPreferences as any).defaultSortDirection) setSortDirection((userPreferences as any).defaultSortDirection);
      setPreferencesLoaded(true);
    }
  }, [userPreferences, preferencesLoaded]);

  // Auto-save preferences when filters/sort change (debounced)
  useEffect(() => {
    if (!preferencesLoaded) return; // Don't save during initial load

    const timeoutId = setTimeout(() => {
      savePreferencesMutation.mutate({
        defaultCountyFilter: countyFilter !== 'all' ? countyFilter : undefined,
        defaultStatusFilter: statusFilter !== 'all' ? statusFilter : undefined,
        defaultMinBid: minBid || undefined,
        defaultMaxBid: maxBid || undefined,
        defaultStartDate: startDate || undefined,
        defaultEndDate: endDate || undefined,
        defaultSortColumn: sortColumn || undefined,
        defaultSortDirection: sortDirection,
      } as any);
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [countyFilter, statusFilter, minBid, maxBid, startDate, endDate, sortColumn, sortDirection, preferencesLoaded]);

  // Mutations
  const saveSearchMutation = trpc.savedSearches.create.useMutation({
    onSuccess: () => {
      toast.success("Search saved successfully");
      setSaveSearchDialogOpen(false);
      setSearchName("");
    },
    onError: (error) => {
      toast.error(`Failed to save search: ${error.message}`);
    },
  });
  
  const addFavoriteMutation = trpc.favorites.add.useMutation({
    onSuccess: () => {
      toast.success("Added to favorites");
    },
    onError: (error) => {
      toast.error(`Failed to add favorite: ${error.message}`);
    },
  });
  
  const removeFavoriteMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      toast.success("Removed from favorites");
    },
    onError: (error) => {
      toast.error(`Failed to remove favorite: ${error.message}`);
    },
  });
  
  const handleSaveSearch = () => {
    const filters = {
      search: searchTerm,
      county: countyFilter !== "all" ? countyFilter : "",
      status: statusFilter !== "all" ? statusFilter : "",
      minBid,
      maxBid,
      startDate,
      endDate,
    };
    
    saveSearchMutation.mutate({
      name: searchName,
      filters: JSON.stringify(filters),
    });
  };
  
  const utils = trpc.useUtils();
  
  const toggleFavorite = (propertyId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isFavorited = favoriteIds.has(propertyId);
    if (isFavorited) {
      removeFavoriteMutation.mutate(propertyId, {
        onSuccess: () => {
          utils.favorites.list.invalidate();
          refetch();
        },
      });
    } else {
      addFavoriteMutation.mutate(propertyId, {
        onSuccess: () => {
          utils.favorites.list.invalidate();
          refetch();
        },
      });
    }
  };

  // Fetch properties
  const { data: properties, isLoading, refetch } = trpc.properties.list.useQuery();
  
  // Fetch user's favorites to show filled stars
  const { data: myFavorites, isLoading: favoritesLoading } = trpc.favorites.list.useQuery();
  
  // Fetch team favorites to show blue stars
  const { data: teamFavorites, isLoading: teamFavoritesLoading } = trpc.favorites.teamList.useQuery();
  
  // Personal favorites Set
  const favoriteIds = useMemo(() => {
    if (!myFavorites) return new Set();
    return new Set(myFavorites.map(p => p.id));
  }, [myFavorites]);
  
  // Team favorites Set (excluding personal favorites)
  const teamFavoriteIds = useMemo(() => {
    if (!teamFavorites) return new Set();
    return new Set(
      teamFavorites
        .filter(f => !favoriteIds.has(f.property.id))
        .map(f => f.property.id)
    );
  }, [teamFavorites, favoriteIds]);
  
  // Fetch counties for filter
  const { data: counties } = trpc.counties.list.useQuery();

  // Sort handler
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort icon component
  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3 w-3 ml-1 inline opacity-40" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-3 w-3 ml-1 inline" /> : 
      <ArrowDown className="h-3 w-3 ml-1 inline" />;
  };

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    
    let filtered = properties.filter(prop => {
       const matchesSearch = !searchTerm ||
        prop.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.county.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.parcelId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCounty = countyFilter === "all" || prop.county === countyFilter;
      const matchesStatus = statusFilter === "all" || prop.saleStatus === statusFilter;
      const matchesSource = sourceFilter === "all" || prop.sourceType === sourceFilter;
      const matchesRating = ratingFilter === "all" || 
        (ratingFilter === "unrated" && !prop.teamRating) ||
        (ratingFilter !== "unrated" && prop.teamRating === ratingFilter);
      
      // Bid amount filter
      const bidAmount = prop.currentBid || prop.openingBid || 0;
      const matchesMinBid = minBid === "" || bidAmount >= parseFloat(minBid) * 100;
      const matchesMaxBid = maxBid === "" || bidAmount <= parseFloat(maxBid) * 100;
      
      // Date filter
      const saleDate = prop.saleDate ? new Date(prop.saleDate) : null;
      const matchesStartDate = startDate === "" || !saleDate || saleDate >= new Date(startDate);
      const matchesEndDate = endDate === "" || !saleDate || saleDate <= new Date(endDate);
      
      return matchesSearch && matchesCounty && matchesStatus && matchesSource && matchesRating && matchesMinBid && matchesMaxBid && matchesStartDate && matchesEndDate;
    });

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: any;
        let bVal: any;

        switch (sortColumn) {
          case 'county':
            aVal = a.county?.toLowerCase() || '';
            bVal = b.county?.toLowerCase() || '';
            break;
          case 'address':
            aVal = a.address?.toLowerCase() || '';
            bVal = b.address?.toLowerCase() || '';
            break;
          case 'parcelId':
            aVal = a.parcelId?.toLowerCase() || '';
            bVal = b.parcelId?.toLowerCase() || '';
            break;
          case 'propertyType':
            aVal = a.propertyType?.toLowerCase() || '';
            bVal = b.propertyType?.toLowerCase() || '';
            break;
          case 'saleDate':
            aVal = a.saleDate ? new Date(a.saleDate).getTime() : 0;
            bVal = b.saleDate ? new Date(b.saleDate).getTime() : 0;
            break;
          case 'openingBid':
            aVal = a.openingBid || 0;
            bVal = b.openingBid || 0;
            break;
          case 'currentBid':
            aVal = a.currentBid || 0;
            bVal = b.currentBid || 0;
            break;
          case 'status':
            aVal = a.saleStatus || '';
            bVal = b.saleStatus || '';
            break;
          case 'upsetEnd':
            aVal = a.upsetBidCloseDate ? new Date(a.upsetBidCloseDate).getTime() : 0;
            bVal = b.upsetBidCloseDate ? new Date(b.upsetBidCloseDate).getTime() : 0;
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [properties, searchTerm, countyFilter, statusFilter, sourceFilter, ratingFilter, minBid, maxBid, startDate, endDate, sortColumn, sortDirection]);

  const formatCurrency = (cents: number | null) => {
    if (!cents) return "—";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const exportToCSV = () => {
    if (!filteredProperties || filteredProperties.length === 0) return;

    // Define CSV headers
    const headers = [
      "County",
      "Address",
      "Parcel ID",
      "Property Type",
      "Owner",
      "Sale Date",
      "Opening Bid",
      "Current Bid",
      "Status",
      "Upset Bid Close Date",
      "Source URL",
      "First Scraped At",
      "Last Updated At"
    ];

    // Convert properties to CSV rows
    const rows = filteredProperties.map(prop => [
      prop.county,
      prop.address || "",
      prop.parcelId,
      prop.propertyType || "",
      prop.owner || "",
      prop.saleDate ? new Date(prop.saleDate).toLocaleDateString() : "",
      prop.openingBid ? (prop.openingBid / 100).toFixed(2) : "",
      prop.currentBid ? (prop.currentBid / 100).toFixed(2) : "",
      prop.saleStatus || "scheduled",
      prop.upsetBidCloseDate ? new Date(prop.upsetBidCloseDate).toLocaleDateString() : "",
      prop.sourceUrl || "",
      new Date(prop.firstScrapedAt).toLocaleString(),
      new Date(prop.lastUpdatedAt).toLocaleString()
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];
    
    link.setAttribute("href", url);
    link.setAttribute("download", `nc-tax-deed-properties-${timestamp}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      scheduled: "outline",
      in_upset_period: "default",
      sold: "secondary",
      cancelled: "destructive",
    };
    
    const labels: Record<string, string> = {
      scheduled: "Scheduled",
      in_upset_period: "Upset Period",
      sold: "Sold",
      cancelled: "Cancelled",
    };
    
    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="w-full px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Navigation */}
        <div className="flex gap-2 pb-4 border-b">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/map">
              <Map className="h-4 w-4 mr-2" />
              Map
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/statistics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistics
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin">
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Link>
          </Button>
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tax Deed Properties</h1>
            <p className="text-muted-foreground mt-1">
              Browse and search tax foreclosure properties across North Carolina
            </p>
            <div className="flex gap-2 mt-2">
              <Button asChild variant="link" size="sm" className="h-auto p-0">
                <Link href="/saved-searches">
                  <Bookmark className="h-3 w-3 mr-1" />
                  Saved Searches
                </Link>
              </Button>
              <span className="text-muted-foreground">•</span>
              <Button asChild variant="link" size="sm" className="h-auto p-0">
                <Link href="/favorites">
                  <Star className="h-3 w-3 mr-1" />
                  Favorites
                </Link>
              </Button>
              <span className="text-muted-foreground">•</span>
              <Button asChild variant="link" size="sm" className="h-auto p-0">
                <Link href="/recently-sold">
                  <History className="h-3 w-3 mr-1" />
                  Recently Sold
                </Link>
              </Button>
            </div>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Properties</CardDescription>
              <CardTitle className="text-3xl">{properties?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>In Upset Period</CardDescription>
              <CardTitle className="text-3xl">
                {properties?.filter(p => p.saleStatus === 'in_upset_period').length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Scheduled</CardDescription>
              <CardTitle className="text-3xl">
                {properties?.filter(p => p.saleStatus === 'scheduled').length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>New (Last 7 Days)</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Badge variant="default" className="text-lg px-2 py-1">
                  {properties?.filter(p => (p as any).createdAt && new Date((p as any).createdAt).getTime() > Date.now() - 7 * 86400000).length || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>Filters</CardTitle>
                {savePreferencesMutation.isPending && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Saving...
                  </span>
                )}
                {preferencesLoaded && !savePreferencesMutation.isPending && (
                  <span className="text-xs text-muted-foreground">Auto-saved</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setSaveSearchDialogOpen(true)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Search
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setCountyFilter("all");
                    setStatusFilter("all");
                    setMinBid("");
                    setMaxBid("");
                    setStartDate("");
                    setEndDate("");
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resetPreferencesMutation.mutate()}
                  disabled={resetPreferencesMutation.isPending}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${resetPreferencesMutation.isPending ? 'animate-spin' : ''}`} />
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Row 1: Search, County, Status, Source, Rating */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search address, county, or parcel ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select value={countyFilter} onValueChange={setCountyFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Counties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Counties</SelectItem>
                    {Array.from(new Set(properties?.map(p => p.county) || [])).sort().map(county => (
                      <SelectItem key={county} value={county}>{county}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_upset_period">Upset Period</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="kania">Kania Law Firm</SelectItem>
                    <SelectItem value="hutchens">Hutchens Law Firm</SelectItem>
                    <SelectItem value="rbcwb">RBCWB Law Firm</SelectItem>
                    <SelectItem value="zls">ZLS (Zacchaeus)</SelectItem>
                    <SelectItem value="county_website">County Websites</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="good">👍 Good</SelectItem>
                    <SelectItem value="bad">👎 Bad</SelectItem>
                    <SelectItem value="watching">👀 Watching</SelectItem>
                    <SelectItem value="unrated">➖ Unrated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Row 2: Bid Amount Range */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Min Bid Amount ($)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minBid}
                    onChange={(e) => setMinBid(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Max Bid Amount ($)</label>
                  <Input
                    type="number"
                    placeholder="No limit"
                    value={maxBid}
                    onChange={(e) => setMaxBid(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3: Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Sale Date From</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Sale Date To</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Properties ({filteredProperties.length})</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportToCSV}
                disabled={filteredProperties.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No properties found. Try adjusting your filters or run a scraper to import data.
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="text-xs">
                      <TableHead className="px-1 py-1"></TableHead>
                      <TableHead 
                        className="px-1 py-1 cursor-pointer hover:bg-muted/50 select-none text-[10px]"
                        onClick={() => handleSort('county')}
                      >
                        County<SortIcon column="county" />
                      </TableHead>
                      <TableHead 
                        className="px-1 py-1 cursor-pointer hover:bg-muted/50 select-none text-[10px]"
                        onClick={() => handleSort('address')}
                      >
                        Address<SortIcon column="address" />
                      </TableHead>
                      <TableHead 
                        className="px-1 py-1 cursor-pointer hover:bg-muted/50 select-none text-[10px]"
                        onClick={() => handleSort('parcelId')}
                      >
                        Parcel<SortIcon column="parcelId" />
                      </TableHead>
                      <TableHead 
                        className="px-1 py-1 cursor-pointer hover:bg-muted/50 select-none text-[10px]"
                        onClick={() => handleSort('propertyType')}
                      >
                        Type<SortIcon column="propertyType" />
                      </TableHead>
                      <TableHead 
                        className="px-1 py-1 cursor-pointer hover:bg-muted/50 select-none text-[10px]"
                        onClick={() => handleSort('saleDate')}
                      >
                        Sale<SortIcon column="saleDate" />
                      </TableHead>
                      <TableHead 
                        className="px-1 py-1 text-right cursor-pointer hover:bg-muted/50 select-none text-[10px]"
                        onClick={() => handleSort('openingBid')}
                      >
                        Open<SortIcon column="openingBid" />
                      </TableHead>
                      <TableHead 
                        className="px-1 py-1 text-right cursor-pointer hover:bg-muted/50 select-none text-[10px]"
                        onClick={() => handleSort('currentBid')}
                      >
                        Current<SortIcon column="currentBid" />
                      </TableHead>
                      <TableHead 
                        className="px-1 py-1 cursor-pointer hover:bg-muted/50 select-none text-[10px]"
                        onClick={() => handleSort('status')}
                      >
                        Status<SortIcon column="status" />
                      </TableHead>
                      <TableHead 
                        className="px-1 py-1 cursor-pointer hover:bg-muted/50 select-none text-[10px]"
                        onClick={() => handleSort('upsetEnd')}
                      >
                        Upset<SortIcon column="upsetEnd" />
                      </TableHead>
                      <TableHead 
                        className="px-1 py-1 text-right cursor-pointer hover:bg-muted/50 select-none text-[10px]"
                        onClick={() => handleSort('arv')}
                      >
                        ARV<SortIcon column="arv" />
                      </TableHead>
                      <TableHead className="px-1 py-1 text-center text-[10px]">
                        Checked Out
                      </TableHead>
                      <TableHead className="px-1 py-1 text-center text-[10px]">
                        Rating
                      </TableHead>
                      <TableHead className="px-1 py-1 text-center text-[10px]">
                        Notes
                      </TableHead>
                      <TableHead className="px-1 py-1 text-center text-[10px]">
                        Map
                      </TableHead>
                      <TableHead className="px-1 py-1 text-center text-[10px]">
                        Zillow
                      </TableHead>
                      <TableHead className="px-1 py-1 text-[10px]">
                        Link
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.map((property) => (
                       <TableRow 
                        key={property.id} 
                        className="cursor-pointer hover:bg-muted/50 text-xs"
                        onClick={() => {
                          setSelectedProperty(property);
                          setDetailDialogOpen(true);
                        }}
                      >
                        <TableCell className="px-1 py-1">
                <button
                  onClick={(e) => toggleFavorite(property.id, e)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  title={
                    favoriteIds.has(property.id) 
                      ? 'Remove from favorites' 
                      : teamFavoriteIds.has(property.id)
                      ? `Favorited by team member`
                      : 'Add to favorites'
                  }
                >
                  <Star className={`h-3 w-3 ${
                    favoriteIds.has(property.id) 
                      ? 'text-yellow-500 !fill-yellow-500' 
                      : teamFavoriteIds.has(property.id)
                      ? 'text-blue-500 !fill-blue-500'
                      : 'text-yellow-500 hover:fill-yellow-500'
                  }`} />
                </button>
                        </TableCell>
                        <TableCell className="font-medium px-1 py-1 text-[10px]">{property.county}</TableCell>
                        <TableCell className="px-1 py-1 truncate text-[10px]" title={property.address || "—"}>{property.address || "—"}</TableCell>
                        <TableCell className="font-mono px-1 py-1 text-[9px]">{property.parcelId}</TableCell>
                        <TableCell className="px-1 py-1 truncate text-[9px]" title={property.propertyType || "—"}>{property.propertyType || "—"}</TableCell>
                        <TableCell className="px-1 py-1 whitespace-nowrap text-[9px]">{formatDate(property.saleDate)}</TableCell>
                        <TableCell className="text-right px-1 py-1 whitespace-nowrap text-[9px]">{formatCurrency(property.openingBid)}</TableCell>
                        <TableCell className="text-right px-1 py-1 whitespace-nowrap text-[9px]">{formatCurrency(property.currentBid)}</TableCell>
                        <TableCell className="px-1 py-1 text-[9px]">{getStatusBadge(property.saleStatus || 'scheduled')}</TableCell>
                        <TableCell className="px-1 py-1 whitespace-nowrap text-[9px]">{formatDate(property.upsetBidCloseDate)}</TableCell>
                        <TableCell className="text-right px-1 py-1 whitespace-nowrap text-[9px]">
                          {property.arv ? formatCurrency(property.arv) : "—"}
                        </TableCell>
                        <TableCell className="px-1 py-1 text-center text-[9px]">
                          {property.checkedOutBy ? (
                            <span className="text-lg" title={`Checked out by ${property.checkedOutBy} at ${property.checkedOutAt ? new Date(property.checkedOutAt).toLocaleString() : 'Unknown'}`}>
                              ✅
                            </span>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="px-1 py-1 text-center">
                          <RatingCell property={property} />
                        </TableCell>
                        <TableCell className="px-1 py-1 text-center">
                          {(property as any).noteCount && (property as any).noteCount > 0 ? (
                            <div className="flex items-center justify-center gap-1">
                              <MessageSquare className="h-3 w-3 text-blue-600" />
                              <span className="text-[9px] font-medium">{(property as any).noteCount}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-[9px]">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-1 py-1 text-center">
                          {property.address ? (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address + ', ' + property.county + ' County, North Carolina')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-800 underline text-[9px]"
                              title="View in Google Maps"
                            >
                              Map
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-[9px]">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-1 py-1 text-center">
                          {property.address ? (
                            <a
                              href={`https://www.zillow.com/homes/${encodeURIComponent(property.address + ', ' + property.county + ' County, NC')}_rb/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-800 underline text-[9px]"
                              title="Search on Zillow"
                            >
                              Zillow
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-[9px]">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-1 py-1">
                          {property.sourceUrl ? (
                            <a
                              href={property.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-800 underline text-[9px] whitespace-nowrap"
                              title="View original listing"
                            >
                              {property.sourceType === 'kania' ? 'Kania Law' :
                               property.sourceType === 'hutchens' ? 'Hutchens Law' :
                               property.sourceType === 'zls' ? 'ZLS' :
                               property.sourceType === 'rbcwb' ? 'RBCWB Law' :
                               property.sourceType === 'county_website' ? 'County' :
                               property.sourceType === 'pdf' ? 'PDF' :
                               'Source'}
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-[9px]">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Property Detail Dialog */}
      <PropertyDetailDialog
        property={selectedProperty}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
      
      {/* Save Search Dialog */}
      <Dialog open={saveSearchDialogOpen} onOpenChange={setSaveSearchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current Search</DialogTitle>
            <DialogDescription>
              Give this search a name so you can quickly apply these filters later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="e.g., Wake County Under $50k"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchName.trim()) {
                  handleSaveSearch();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveSearchDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSearch}
              disabled={!searchName.trim() || saveSearchMutation.isPending}
            >
              Save Search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
