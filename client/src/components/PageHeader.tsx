import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Home } from "lucide-react";
import { Link } from "wouter";

interface PageHeaderProps {
  title?: string;
  showHomeButton?: boolean;
}

export function PageHeader({ title, showHomeButton = true }: PageHeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />}
              <h1 className="text-xl font-bold">{APP_TITLE}</h1>
            </a>
          </Link>
          {title && (
            <>
              <span className="text-muted-foreground">/</span>
              <h2 className="text-lg font-semibold">{title}</h2>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {showHomeButton && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <a className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Home</span>
                </a>
              </Link>
            </Button>
          )}
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground hidden md:inline">
                Welcome, {user?.name}
              </span>
              <Button onClick={logout} variant="outline" size="sm">
                Logout
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <a href={getLoginUrl()}>Login</a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
