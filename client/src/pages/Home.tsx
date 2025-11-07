import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Settings, Database, MapPin, TrendingUp, Star, Bookmark, History, Bell } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

/**
 * All content in this page are only for example, replace with your own feature implementation
 * When building pages, remember your instructions in Frontend Workflow, Frontend Best Practices, Design Guide and Common Pitfalls
 */
export default function Home() {
  // The userAuth hooks provides authentication state
  let { user, logout } = useAuth();
  
  // Fetch system statistics
  const { data: stats } = trpc.stats.overview.useQuery();

  // If theme is switchable in App.tsx, we can implement theme toggling like this:
  // const { theme, toggleTheme } = useTheme();

  // Use APP_LOGO (as image src) and APP_TITLE if needed

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />}
            <h1 className="text-xl font-bold">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
            <Button onClick={logout} variant="outline" size="sm">Logout</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            North Carolina Tax Deed Property Tracker
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Comprehensive database of tax foreclosure properties across all 100 NC counties.
            Track sale dates, upset bid periods, and property details in one place.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg">
              <Link href="/properties">
                <Building2 className="mr-2 h-5 w-5" />
                Browse Properties
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/map">
                <MapPin className="mr-2 h-5 w-5" />
                Map View
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/statistics">
                <TrendingUp className="mr-2 h-5 w-5" />
                Statistics
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/admin">
                <Settings className="mr-2 h-5 w-5" />
                Admin Panel
              </Link>
            </Button>
          </div>
          
          {/* Secondary Actions */}
          <div className="flex gap-3 justify-center flex-wrap mt-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/saved-searches">
                <Bookmark className="mr-2 h-4 w-4" />
                Saved Searches
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/favorites">
                <Star className="mr-2 h-4 w-4" />
                Favorites
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/recently-sold">
                <History className="mr-2 h-4 w-4" />
                Recently Sold
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/notification-settings">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Database className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Automated Scraping</CardTitle>
              <CardDescription>
                Daily automated scraping from law firm websites and county sources ensures you always have the latest property listings.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <MapPin className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Statewide Coverage</CardTitle>
              <CardDescription>
                {stats ? (
                  `Currently tracking ${stats.countiesWithData} counties with active listings (${stats.countiesCovered} counties covered by scrapers / ${stats.totalCounties} total NC counties). Major sources: Kania Law Firm, Zacchaeus Legal Services, and county websites.`
                ) : (
                  'Loading coverage statistics...'
                )}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Building2 className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Upset Bid Tracking</CardTitle>
              <CardDescription>
                Monitor NC's unique 10-day upset bid process with automatic tracking of bid deadlines and current bid amounts.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>NC Tax Deed Property Tracker - Internal Tool</p>
        </div>
      </footer>
    </div>
  );
}
