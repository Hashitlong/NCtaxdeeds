import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";

export default function Calendar() {
  const [days, setDays] = useState(30);
  const { data: upcomingSales, isLoading } = trpc.stats.upcomingSales.useQuery({ days });

  // Group sales by date
  const salesByDate = upcomingSales?.reduce((acc, sale) => {
    if (!sale.saleDate) return acc;
    const dateKey = format(new Date(sale.saleDate), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(sale);
    return acc;
  }, {} as Record<string, typeof upcomingSales>);

  const sortedDates = Object.keys(salesByDate || {}).sort();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'in_upset_period':
        return 'bg-orange-500';
      case 'sold':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Calendar" />
      {/* Header */}
      <div className="border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Upcoming Sales Calendar</h1>
              <p className="text-muted-foreground mt-2">
                Track all upcoming tax foreclosure sales across North Carolina
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Manual Entry
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-6">
        {/* Time Range Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Time Range</CardTitle>
            <CardDescription>Select how far ahead to view upcoming sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={days === 30 ? "default" : "outline"}
                onClick={() => setDays(30)}
              >
                Next 30 Days
              </Button>
              <Button
                variant={days === 60 ? "default" : "outline"}
                onClick={() => setDays(60)}
              >
                Next 60 Days
              </Button>
              <Button
                variant={days === 90 ? "default" : "outline"}
                onClick={() => setDays(90)}
              >
                Next 90 Days
              </Button>
              <Button
                variant={days === 180 ? "default" : "outline"}
                onClick={() => setDays(180)}
              >
                Next 6 Months
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Upcoming Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingSales?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                In the next {days} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Sale Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sortedDates.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Unique sale dates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Counties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(upcomingSales?.map(s => s.county)).size || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                With upcoming sales
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Calendar View */}
        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Loading upcoming sales...</p>
            </CardContent>
          </Card>
        ) : sortedDates.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No upcoming sales</p>
                <p className="text-muted-foreground mt-2">
                  No properties scheduled for sale in the next {days} days
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedDates.map(dateKey => {
              const sales = salesByDate![dateKey];
              const saleDate = new Date(dateKey);
              
              return (
                <Card key={dateKey}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {format(saleDate, 'EEEE, MMMM d, yyyy')}
                        </CardTitle>
                        <CardDescription>
                          {sales.length} {sales.length === 1 ? 'property' : 'properties'} scheduled
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-sm">
                        {Math.ceil((saleDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days away
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sales.map(sale => (
                        <Link key={sale.id} href={`/properties?id=${sale.id}`}>
                          <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{sale.address || 'Address not available'}</p>
                                <Badge className={getStatusColor(sale.saleStatus || 'scheduled')}>
                                  {sale.saleStatus}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {sale.county} County • {sale.propertyType || 'Type unknown'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {sale.openingBid ? `$${sale.openingBid.toLocaleString()}` : 'TBD'}
                              </p>
                              <p className="text-sm text-muted-foreground">Opening Bid</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Manual Entry Instructions */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Manual Sale Date Tracking</CardTitle>
            <CardDescription>
              For counties not yet covered by automated scrapers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Use the "Add Manual Entry" button above to track sale dates from counties we don't automatically scrape yet. 
              This helps you maintain a complete calendar of all opportunities across North Carolina.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Currently tracking:</strong> 43 counties with automated data, 21 counties available for manual tracking
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
