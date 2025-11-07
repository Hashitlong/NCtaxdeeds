import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Building2, MapPin, TrendingUp, DollarSign, Calendar as CalendarIcon, History } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Statistics() {
  const { data: overview } = trpc.stats.overview.useQuery();
  const { data: countyData } = trpc.stats.countyBreakdown.useQuery();
  const { data: statusData } = trpc.stats.statusDistribution.useQuery();

  // Prepare data for charts
  const topCounties = countyData?.slice(0, 15) || [];
  const chartData = topCounties.map(c => ({
    county: c.county,
    properties: c.count,
    totalBid: c.totalBidAmount,
  }));

  const statusChartData = statusData?.map(s => ({
    name: s.status || 'Unknown',
    value: s.count,
  })) || [];

  // Calculate totals (backend already converts cents to dollars)
  const totalBidAmount = countyData?.reduce((sum, c) => {
    const bidAmount = Number(c.totalBidAmount) || 0;
    return sum + bidAmount;
  }, 0) || 0;
  const avgBidAmount = (overview?.totalProperties && totalBidAmount > 0) 
    ? totalBidAmount / overview.totalProperties 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Statistics" />
      {/* Additional Navigation */}
      <div className="border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Statistics Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Comprehensive analytics and insights across all NC tax deed properties
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/calendar">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  View Calendar
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/recently-sold">
                  <History className="mr-2 h-4 w-4" />
                  Recently Sold
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.totalProperties || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active listings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Counties</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.countiesWithData || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                With active listings
              </p>
              <p className="text-xs text-muted-foreground">
                {overview?.countiesCovered || 82} covered / {overview?.totalCounties || 100} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bid Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${Math.round(totalBidAmount).toLocaleString('en-US')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Combined opening bids
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Bid Amount</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${isNaN(avgBidAmount) ? '0' : Math.round(avgBidAmount).toLocaleString('en-US')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per property
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* County Breakdown Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Properties by County</CardTitle>
              <CardDescription>Top 15 counties with most properties</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="county" 
                    angle={-45} 
                    textAnchor="end" 
                    height={120}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="properties" fill="#3b82f6" name="Properties" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>Properties by sale status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      // Clean up status names for display
                      const displayName = name
                        .replace('in_upset_period', 'In Upset')
                        .replace('scheduled', 'Scheduled')
                        .replace('pending', 'Pending')
                        .replace('postponed', 'Postponed')
                        .replace('sold', 'Sold');
                      return `${displayName}: ${(percent * 100).toFixed(0)}%`;
                    }}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* County Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>County Comparison</CardTitle>
            <CardDescription>Detailed breakdown of all counties with properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Rank</th>
                    <th className="text-left p-2 font-medium">County</th>
                    <th className="text-right p-2 font-medium">Properties</th>
                    <th className="text-right p-2 font-medium">Total Bid Amount</th>
                    <th className="text-right p-2 font-medium">Avg Bid</th>
                  </tr>
                </thead>
                <tbody>
                  {countyData?.map((county, index) => (
                    <tr key={county.county} className="border-b hover:bg-muted/50">
                      <td className="p-2 text-muted-foreground">#{index + 1}</td>
                      <td className="p-2 font-medium">{county.county}</td>
                      <td className="p-2 text-right">{county.count}</td>
                      <td className="p-2 text-right">
                        ${(county.totalBidAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-2 text-right">
                        ${county.count > 0 ? ((county.totalBidAmount || 0) / county.count).toLocaleString('en-US', { maximumFractionDigits: 0 }) : 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
