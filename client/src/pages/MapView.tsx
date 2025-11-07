import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { MapView as Map } from "@/components/Map";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapIcon, List, RefreshCw } from "lucide-react";
import { PropertyDetailDialog } from "@/components/PropertyDetailDialog";
import { PageHeader } from "@/components/PageHeader";

export default function MapView() {
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [markerCluster, setMarkerCluster] = useState<any>(null);

  // Fetch properties
  const { data: properties, isLoading, refetch } = trpc.properties.list.useQuery();

  // Geocode all properties mutation
  const geocodeAll = trpc.geocoding.geocodeAll.useMutation({
    onSuccess: (result) => {
      console.log('[MapView] Geocoding complete:', result);
      refetch();
    },
  });

  // Get properties with coordinates
  const propertiesWithCoords = properties?.filter(
    p => p.latitude && p.longitude
  ) || [];

  const propertiesWithoutCoords = properties?.filter(
    p => !p.latitude || !p.longitude
  ) || [];

  // Initialize map and markers
  const onMapReady = useCallback((googleMap: any) => {
    console.log('[MapView] Map ready');
    setMap(googleMap);
  }, []);

  // Add markers when map is ready and properties are loaded
  useEffect(() => {
    if (!map || !window.google || !propertiesWithCoords.length) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    if (markerCluster) {
      markerCluster.clearMarkers();
    }

    // Create markers for each property
    const newMarkers = propertiesWithCoords.map(property => {
      const marker = new window.google.maps.Marker({
        position: {
          lat: parseFloat(property.latitude!),
          lng: parseFloat(property.longitude!),
        },
        map: map,
        title: property.address || property.parcelId,
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: createInfoWindowContent(property),
      });

      // Add click listener
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        setSelectedProperty(property);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Add marker clustering if available
    if (window.google.maps.markerClusterer && newMarkers.length > 10) {
      const clusterer = new window.google.maps.markerClusterer.MarkerClusterer({
        map,
        markers: newMarkers,
      });
      setMarkerCluster(clusterer);
    }

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
      map.fitBounds(bounds);
    }
  }, [map, propertiesWithCoords]);

  const createInfoWindowContent = (property: any) => {
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

    return `
      <div style="padding: 8px; max-width: 300px;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
          ${property.address || 'Address Not Available'}
        </h3>
        <p style="margin: 4px 0; font-size: 12px; color: #666;">
          <strong>${property.county} County</strong> • ${property.parcelId}
        </p>
        <p style="margin: 4px 0; font-size: 12px;">
          <strong>Sale Date:</strong> ${formatDate(property.saleDate)}
        </p>
        <p style="margin: 4px 0; font-size: 12px;">
          <strong>Opening Bid:</strong> ${formatCurrency(property.openingBid)}
        </p>
        <p style="margin: 4px 0; font-size: 12px;">
          <strong>Current Bid:</strong> ${formatCurrency(property.currentBid)}
        </p>
        <button 
          onclick="window.dispatchEvent(new CustomEvent('showPropertyDetail', { detail: ${property.id} }))"
          style="margin-top: 8px; padding: 4px 12px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
        >
          View Details
        </button>
      </div>
    `;
  };

  // Listen for custom event from info window
  useEffect(() => {
    const handleShowDetail = (e: any) => {
      const propertyId = e.detail;
      const property = properties?.find(p => p.id === propertyId);
      if (property) {
        setSelectedProperty(property);
        setDetailDialogOpen(true);
      }
    };

    window.addEventListener('showPropertyDetail', handleShowDetail as any);
    return () => window.removeEventListener('showPropertyDetail', handleShowDetail as any);
  }, [properties]);

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

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Map View" />
      <div className="container mx-auto py-8">
        <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Property Map</h1>
            <p className="text-muted-foreground mt-1">
              Visualize tax foreclosure properties across North Carolina
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("map")}
            >
              <MapIcon className="h-4 w-4 mr-2" />
              Map
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Properties
              </CardTitle>
              <div className="text-2xl font-bold">{properties?.length || 0}</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                On Map
              </CardTitle>
              <div className="text-2xl font-bold">{propertiesWithCoords.length}</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Need Geocoding
              </CardTitle>
              <div className="text-2xl font-bold">{propertiesWithoutCoords.length}</div>
            </CardHeader>
          </Card>
        </div>

        {/* Geocoding Alert */}
        {propertiesWithoutCoords.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {propertiesWithoutCoords.length} properties need geocoding
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click the button to convert addresses to map coordinates
                  </p>
                </div>
                <Button
                  onClick={() => geocodeAll.mutate({ limit: 100 })}
                  disabled={geocodeAll.isPending}
                >
                  {geocodeAll.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Geocoding...
                    </>
                  ) : (
                    'Geocode Properties'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Map or List View */}
        {viewMode === "map" ? (
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="h-[600px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Map
                  center={{ lat: 35.7596, lng: -79.0193 }}
                  zoom={7}
                  className="w-full h-[600px] rounded-lg"
                  onMapReady={onMapReady}
                />
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Properties with Coordinates ({propertiesWithCoords.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {propertiesWithCoords.map(property => (
                  <div
                    key={property.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      setSelectedProperty(property);
                      setDetailDialogOpen(true);
                    }}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{property.address || 'Address Not Available'}</p>
                      <p className="text-sm text-muted-foreground">
                        {property.county} County • {property.parcelId}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Sale Date</p>
                        <p className="font-medium">{formatDate(property.saleDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Current Bid</p>
                        <p className="font-medium">{formatCurrency(property.currentBid)}</p>
                      </div>
                      {getStatusBadge(property.saleStatus || 'scheduled')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        </div>

        {/* Property Detail Dialog */}
        <PropertyDetailDialog
          property={selectedProperty}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />
      </div>
    </div>
  );
}
