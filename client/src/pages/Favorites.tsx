import React from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink, Download, Users, ThumbsUp, ThumbsDown, Eye, Database } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { PropertyDetailDialog } from "@/components/PropertyDetailDialog";
import { PageHeader } from "@/components/PageHeader";
import { useLocation } from "wouter";

export default function Favorites() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = React.useState<'my' | 'team'>('team');
  const [selectedProperty, setSelectedProperty] = React.useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const { data: myProperties, isLoading: myLoading, refetch: refetchMy } = trpc.favorites.list.useQuery();
  const { data: teamFavorites, isLoading: teamLoading, refetch: refetchTeam } = trpc.favorites.teamList.useQuery();
  
  const properties = viewMode === 'my' ? myProperties : teamFavorites?.map(f => f.property);
  const isLoading = viewMode === 'my' ? myLoading : teamLoading;
  const refetch = viewMode === 'my' ? refetchMy : refetchTeam;
  
  const removeMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      toast.success("Removed from favorites");
      refetchMy();
      refetchTeam();
    },
  });
  
  const formatCurrency = (cents: number | null) => {
    if (!cents) return "—";
    return `$${(cents / 100).toLocaleString()}`;
  };
  
  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Favorites" />
      <div className="border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                <div>
                  <h1 className="text-3xl font-bold">Favorite Properties</h1>
                  <p className="text-muted-foreground mt-1">
                    {viewMode === 'my' ? 'Your' : 'Team'} starred properties for quick access ({properties?.length || 0} properties)
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'team' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('team')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Team Favorites
                </Button>
                <Button
                  variant={viewMode === 'my' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('my')}
                >
                  <Star className="h-4 w-4 mr-2" />
                  My Favorites
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                  onClick={() => setLocation('/properties')}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Browse Properties
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              {properties && properties.length > 0 && (
                <Button
                  onClick={() => {
                  const csv = [
                    ['Address', 'County', 'Property Type', 'Status', 'Opening Bid', 'Current Bid', 'Sale Date', 'Upset Bid Deadline', 'Parcel ID'].join(','),
                    ...properties.map(p => [
                      `"${p.address || ''}",`,
                      `"${p.county}",`,
                      `"${p.propertyType || ''}",`,
                      `"${p.saleStatus || ''}",`,
                      `"${formatCurrency((p as any).openingBidCents || p.openingBid)}",`,
                      `"${formatCurrency((p as any).currentBidCents || p.currentBid)}",`,
                      `"${p.saleDate ? format(new Date(p.saleDate), 'yyyy-MM-dd') : ''}",`,
                      `"${(p as any).upsetBidDeadline ? format(new Date((p as any).upsetBidDeadline), 'yyyy-MM-dd') : ''}",`,
                      `"${p.parcelId || ''}"`,
                    ].join(''))
                  ].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `favorite-properties-${format(new Date(), 'yyyy-MM-dd')}.csv`;
                  a.click();
                  toast.success('Favorites exported to CSV');
                }}
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : !properties || properties.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
              <p className="text-muted-foreground">
                Star properties from the Properties page to save them here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {properties.map((property, idx) => {
              const teamFav = viewMode === 'team' ? teamFavorites?.[idx] : null;
              return (
              <Card 
                key={property.id}
                className="cursor-pointer hover:shadow-md transition-shadow py-2"
                onClick={() => {
                  setSelectedProperty(property);
                  setDetailDialogOpen(true);
                }}
              >
                <CardHeader className="pb-2 pt-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <CardTitle className="text-lg">
                          {property.address || 'Address not available'}
                        </CardTitle>
                        <Badge variant={
                          property.saleStatus === 'scheduled' ? 'default' :
                          property.saleStatus === 'in_upset_period' ? 'secondary' :
                          property.saleStatus === 'sold' ? 'outline' : 'destructive'
                        }>
                          {property.saleStatus?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <CardDescription>
                        {property.county} County • {property.propertyType || 'Type unknown'}
                        {teamFav && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            • Favorited by {teamFav.favoritedBy} on {teamFav.favoritedAt ? format(new Date(teamFav.favoritedAt), 'MMM d, yyyy') : 'Unknown'}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMutation.mutate(property.id);
                      }}
                    >
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-2">
                  <div className="flex items-center gap-4 flex-wrap text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Sale Date:</span>
                      <span className="font-medium">
                        {property.saleDate ? format(new Date(property.saleDate), 'MMM d, yyyy') : '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Opening:</span>
                      <span className="font-medium">{formatCurrency(property.openingBid)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Current:</span>
                      <span className="font-medium">{formatCurrency(property.currentBid)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">ARV:</span>
                      <span className="font-medium text-green-600">{property.arv ? formatCurrency(property.arv) : '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Rating:</span>
                      {property.teamRating === 'good' ? (
                        <ThumbsUp className="h-4 w-4 text-green-600" />
                      ) : property.teamRating === 'bad' ? (
                        <ThumbsDown className="h-4 w-4 text-red-600" />
                      ) : property.teamRating === 'watching' ? (
                        <Eye className="h-4 w-4 text-blue-600" />
                      ) : (
                        <span className="font-medium">—</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Parcel:</span>
                      <span className="font-medium">{property.parcelId}</span>
                    </div>
                    <div className="ml-auto">
                      {property.sourceUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (property.sourceUrl) window.open(property.sourceUrl, '_blank');
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on County Website
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}
      </div>

      {/* Property Detail Dialog */}
      <PropertyDetailDialog
        property={selectedProperty}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
}
