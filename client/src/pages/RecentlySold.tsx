import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/PageHeader";

export default function RecentlySold() {
  const { data: properties, isLoading } = trpc.properties.list.useQuery();
  
  const soldProperties = properties?.filter(p => p.saleStatus === 'sold') || [];
  
  const formatCurrency = (cents: number | null) => {
    if (!cents) return "—";
    return `$${(cents / 100).toLocaleString()}`;
  };
  
  const getBidChange = (opening: number | null, final: number | null) => {
    if (!opening || !final) return null;
    const change = final - opening;
    const percentChange = ((change / opening) * 100).toFixed(1);
    return { change, percentChange };
  };
  
  const getBidChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };
  
  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Recently Sold" />
      <div className="border-b">
        <div className="container py-6">
          <h1 className="text-3xl font-bold">Recently Sold Properties</h1>
          <p className="text-muted-foreground mt-1">
            Track completed sales and bid changes
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Sold</CardDescription>
              <CardTitle className="text-3xl">{soldProperties.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg Opening Bid</CardDescription>
              <CardTitle className="text-2xl">
                {soldProperties.length > 0
                  ? formatCurrency(
                      Math.round(
                        soldProperties.reduce((sum, p) => sum + (p.openingBid || 0), 0) /
                          soldProperties.length
                      )
                    )
                  : "—"}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg Final Bid</CardDescription>
              <CardTitle className="text-2xl">
                {soldProperties.length > 0
                  ? formatCurrency(
                      Math.round(
                        soldProperties.reduce((sum, p) => sum + (p.currentBid || 0), 0) /
                          soldProperties.length
                      )
                    )
                  : "—"}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Sold Properties List */}
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : soldProperties.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-medium mb-2">No sold properties yet</h3>
              <p className="text-muted-foreground">
                Sold properties will appear here once sales are completed
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {soldProperties.map((property) => {
              const bidChange = getBidChange(property.openingBid, property.currentBid);
              const daysOnMarket = property.saleDate && property.firstScrapedAt
                ? Math.round(
                    (new Date(property.saleDate).getTime() -
                      new Date(property.firstScrapedAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : null;
              
              return (
                <Card key={property.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">
                            {property.address || 'Address not available'}
                          </CardTitle>
                          <Badge variant="secondary">Sold</Badge>
                        </div>
                        <CardDescription>
                          {property.county} County • {property.propertyType || 'Type unknown'}
                          {daysOnMarket && ` • ${daysOnMarket} days on market`}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Sale Date</p>
                        <p className="font-medium">
                          {property.saleDate
                            ? format(new Date(property.saleDate), 'MMM d, yyyy')
                            : '—'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {property.saleDate
                            ? formatDistanceToNow(new Date(property.saleDate), { addSuffix: true })
                            : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Opening Bid</p>
                        <p className="font-medium">{formatCurrency(property.openingBid)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Final Bid</p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(property.currentBid)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bid Change</p>
                        {bidChange ? (
                          <div className="flex items-center gap-1">
                            {getBidChangeIcon(bidChange.change)}
                            <span className="font-medium">
                              {bidChange.change > 0 ? '+' : ''}
                              {formatCurrency(bidChange.change)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({bidChange.percentChange}%)
                            </span>
                          </div>
                        ) : (
                          <p className="font-medium">—</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {property.sourceUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={property.sourceUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on County Website
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
