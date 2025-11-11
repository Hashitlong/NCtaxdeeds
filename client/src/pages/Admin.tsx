import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, RefreshCw, Database, Clock, CheckCircle2, XCircle, TrendingUp, Shield, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";

export default function Admin() {
  const [isRunning, setIsRunning] = useState(false);
  
  const { data: scrapeHistory, isLoading, refetch } = trpc.scraper.history.useQuery(20, {
    refetchInterval: 60000, // Auto-refresh every 60 seconds
  });
  const runScraperMutation = trpc.scraper.runScraper.useMutation();

  const handleRunScraper = async (scraperName: 'kania' | 'hutchens' | 'wake_county' | 'rbcwb' | 'forsyth' | 'gaston' | 'alamance' | 'catawba' | 'cabarrus' | 'rutherford' | 'edgecombe' | 'hoke' | 'yadkin' | 'anson' | 'bladen' | 'cumberland' | 'mcdowell' | 'zls' | 'all', displayName: string) => {
    setIsRunning(true);
    toast.info(`Starting ${displayName} scraper...`);
    
    try {
      const result = await runScraperMutation.mutateAsync({ scraperName });
      
      if (result.success) {
        toast.success(`Successfully scraped ${result.count} properties from ${displayName}`);
        refetch();
      } else {
        toast.error(`Scraper failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      // Check if it's an authorization error
      if (error.message?.includes('Only administrators')) {
        toast.error('Access denied: Only administrators can run scrapers');
      } else {
        toast.error(`Error running scraper: ${error.message}`);
      }
    } finally {
      setIsRunning(false);
    }
  };



  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      success: "default",
      partial: "secondary",
      failed: "destructive",
    };
    
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Admin Panel" />
      <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Scraper Administration</h1>
          <p className="text-muted-foreground mt-1">
            Run scrapers manually and monitor scraping history
          </p>
        </div>

        {/* Health Status Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Scrapers</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
                16
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Active data sources</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Last 24 Hours</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                {scrapeHistory?.filter(h => h.status === 'success' && new Date(h.scrapeStartedAt).getTime() > Date.now() - 86400000).length || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Successful runs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Failed Runs</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <XCircle className="h-6 w-6 text-red-500" />
                {scrapeHistory?.filter(h => h.status === 'failed').length || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Properties Tracked</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-blue-500" />
                344+
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Across 43 counties</p>
            </CardContent>
          </Card>
        </div>

        {/* Scraper Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Kania Law Firm Scraper
              </CardTitle>
              <CardDescription>
                Scrapes tax foreclosure properties from Kania Law Firm website (30+ counties)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleRunScraper('kania', 'Kania Law Firm')} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run Kania Scraper
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                McDowell County
              </CardTitle>
              <CardDescription>
                Scrapes tax foreclosures from McDowell County website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleRunScraper('mcdowell', 'McDowell County')} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run McDowell Scraper
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Hutchens Law Firm
              </CardTitle>
              <CardDescription>
                Scrapes foreclosure sales from Hutchens Law Firm (64 counties, 190+ properties)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleRunScraper('hutchens', 'Hutchens Law Firm')} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run Hutchens Scraper
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                ZLS (Zacchaeus Legal Services)
              </CardTitle>
              <CardDescription>
                Scrapes foreclosure sales from ZLS website (30 counties, 160+ properties)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleRunScraper('zls', 'ZLS')} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run ZLS Scraper
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Wake County
              </CardTitle>
              <CardDescription>
                Scrapes tax foreclosures directly from Wake County website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleRunScraper('wake_county', 'Wake County')} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run Wake County Scraper
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                RBCWB Law Firm
              </CardTitle>
              <CardDescription>
                Scrapes Mecklenburg County foreclosures from Ruff Bond Cobb Wade & Bethune
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleRunScraper('rbcwb', 'RBCWB Law Firm')} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run RBCWB Scraper
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Forsyth County
              </CardTitle>
              <CardDescription>
                Scrapes tax foreclosures directly from Forsyth County website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleRunScraper('forsyth', 'Forsyth County')} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run Forsyth Scraper
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Gaston County
              </CardTitle>
              <CardDescription>
                Scrapes tax foreclosures from Gaston County website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleRunScraper('gaston', 'Gaston County')} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run Gaston Scraper
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Alamance County
              </CardTitle>
              <CardDescription>
                Scrapes tax foreclosures from Alamance County website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleRunScraper('alamance', 'Alamance County')} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run Alamance Scraper
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Catawba County
              </CardTitle>
              <CardDescription>
                Scrapes tax foreclosures from Catawba County website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleRunScraper('catawba', 'Catawba County')} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run Catawba Scraper
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Cabarrus County
              </CardTitle>
              <CardDescription>
                Scrapes tax foreclosures from Cabarrus County foreclosure portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleRunScraper('cabarrus', 'Cabarrus County')} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run Cabarrus Scraper
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Rutherford County
              </CardTitle>
              <CardDescription>
                Scrapes tax foreclosures from Rutherford County website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleRunScraper('rutherford', 'Rutherford County')} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run Rutherford Scraper
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Cumberland County
              </CardTitle>
              <CardDescription>
                Scrapes tax foreclosures from Cumberland County website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleRunScraper('cumberland', 'Cumberland County')} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run Cumberland Scraper
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                All Scrapers
              </CardTitle>
              <CardDescription>
                Run all configured scrapers sequentially (Kania, RBCWB, Forsyth, Gaston, Alamance, Catawba, Cabarrus, Rutherford)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleRunScraper('all', 'All Scrapers')} 
                disabled={isRunning}
                variant="secondary"
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run All Scrapers
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Scrape History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Scrape History
                </CardTitle>
                <CardDescription>Recent scraping operations and their results</CardDescription>
              </div>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
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
            ) : !scrapeHistory || scrapeHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No scrape history yet. Run a scraper to see results here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Found</TableHead>
                      <TableHead className="text-right">New</TableHead>
                      <TableHead className="text-right">Updated</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scrapeHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.sourceName}</TableCell>
                        <TableCell>{formatDate(record.scrapeStartedAt)}</TableCell>
                        <TableCell>{formatDate(record.scrapeCompletedAt)}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell className="text-right">{record.propertiesFound || 0}</TableCell>
                        <TableCell className="text-right">{record.propertiesNew || 0}</TableCell>
                        <TableCell className="text-right">{record.propertiesUpdated || 0}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {record.errorMessage || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Access Management Section */}
        <ManageAccessSection />
      </div>
      </div>
    </div>
  );
}

// Manage Access Section Component
function ManageAccessSection() {
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "user">("user");
  
  const { data: allowedUsers, isLoading, refetch } = trpc.access.getAllowedUsers.useQuery();
  const addUserMutation = trpc.access.addUser.useMutation();
  const removeUserMutation = trpc.access.removeUser.useMutation();

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    try {
      await addUserMutation.mutateAsync({ email: newEmail, role: newRole });
      toast.success(`Added ${newEmail} to allowed users`);
      setNewEmail("");
      setNewRole("user");
      refetch();
    } catch (error: any) {
      toast.error(`Failed to add user: ${error.message}`);
    }
  };

  const handleRemoveUser = async (email: string) => {
    if (!confirm(`Remove ${email} from allowed users?`)) return;

    try {
      await removeUserMutation.mutateAsync({ email });
      toast.success(`Removed ${email} from allowed users`);
      refetch();
    } catch (error: any) {
      toast.error(`Failed to remove user: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Manage Access
        </CardTitle>
        <CardDescription>
          Control who can access this application
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Add User Form */}
        <form onSubmit={handleAddUser} className="mb-6 flex gap-2">
          <input
            type="email"
            placeholder="Email address"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md"
            required
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as "admin" | "user")}
            className="px-3 py-2 border rounded-md"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <Button type="submit" disabled={addUserMutation.isPending}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </form>

        {/* Allowed Users List */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">
            Allowed Users ({allowedUsers?.length || 0})
          </h3>
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Added By</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allowedUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.addedBy || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUser(user.email)}
                        disabled={removeUserMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
