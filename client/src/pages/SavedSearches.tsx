import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Search, Download } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";

export default function SavedSearches() {
  const [, setLocation] = useLocation();
  const { data: searches, isLoading, refetch } = trpc.savedSearches.list.useQuery();
  const deleteMutation = trpc.savedSearches.delete.useMutation({
    onSuccess: () => {
      toast.success("Search deleted");
      refetch();
    },
  });
  
  const applySearch = (filters: string) => {
    // Parse filters and navigate to properties page with query params
    const filterObj = JSON.parse(filters);
    const params = new URLSearchParams();
    Object.entries(filterObj).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    setLocation(`/properties?${params.toString()}`);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Saved Searches" />
      <div className="border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Saved Searches</h1>
              <p className="text-muted-foreground mt-1">
                Quickly apply your saved filter combinations ({searches?.length || 0} searches)
              </p>
            </div>
            {searches && searches.length > 0 && (
              <Button
                onClick={() => {
                  const csv = [
                    ['Name', 'Filters', 'Created At'].join(','),
                    ...searches.map(s => [
                      `"${s.name}",`,
                      `"${s.filters.replace(/"/g, '""')}",`,
                      `"${new Date(s.createdAt).toLocaleDateString()}"`,
                    ].join(''))
                  ].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `saved-searches-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  toast.success('Saved searches exported to CSV');
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

      <div className="container py-8">
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : !searches || searches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No saved searches</h3>
              <p className="text-muted-foreground mb-4">
                Save your filter combinations from the Properties page for quick access
              </p>
              <Button onClick={() => setLocation('/properties')}>
                Go to Properties
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {searches.map((search) => {
              const filters = JSON.parse(search.filters);
              const filterCount = Object.keys(filters).filter(k => filters[k]).length;
              
              return (
                <Card key={search.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{search.name}</CardTitle>
                        <CardDescription>
                          {filterCount} filter{filterCount !== 1 ? 's' : ''} applied
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => applySearch(search.filters)}
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Apply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMutation.mutate(search.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {filters.county && <span>County: {filters.county} • </span>}
                      {filters.status && <span>Status: {filters.status} • </span>}
                      {filters.minBid && <span>Min Bid: ${filters.minBid} • </span>}
                      {filters.maxBid && <span>Max Bid: ${filters.maxBid} • </span>}
                      {filters.search && <span>Search: "{filters.search}"</span>}
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
