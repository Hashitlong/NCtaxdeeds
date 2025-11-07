import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import Home from "./pages/Home";
import Statistics from "./pages/Statistics";
import Calendar from "./pages/Calendar";
import Properties from "./pages/Properties";
import Admin from "./pages/Admin";
import MapView from "./pages/MapView";
import SavedSearches from "./pages/SavedSearches";
import Favorites from "./pages/Favorites";
import RecentlySold from "./pages/RecentlySold";
import NotificationSettings from "./pages/NotificationSettings";
import NotificationHistory from "./pages/NotificationHistory";
import AccessDenied from "./pages/AccessDenied";
import Login from "./pages/Login";

function AuthenticatedRoutes() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/properties"} component={Properties} />
      <Route path={"/map"} component={MapView} />
      <Route path={"/statistics"} component={Statistics} />
      <Route path={"/calendar"} component={Calendar} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/saved-searches"} component={SavedSearches} />
      <Route path={"/favorites"} component={Favorites} />
      <Route path={"/recently-sold"} component={RecentlySold} />
      <Route path={"/notification-settings"} component={NotificationSettings} />
      <Route path={"/notification-history"} component={NotificationHistory} />
      <Route path={"/access-denied"} component={AccessDenied} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, only show login page
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path={"/login"} component={Login} />
        {/* All other routes redirect to login */}
        <Route component={Login} />
      </Switch>
    );
  }

  // If authenticated, show all protected routes
  return <AuthenticatedRoutes />;
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
