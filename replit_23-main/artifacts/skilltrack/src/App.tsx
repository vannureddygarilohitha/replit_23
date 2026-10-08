import { type ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { AppShell } from '@/components/app-shell';
import { WorkspacePages } from '@/pages/workspace-pages';
import { LoginPage } from '@/pages/login-page';
import { isAuthenticated } from '@/lib/auth-service';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { toast } from 'sonner';

const queryClient = new QueryClient();

/**
 * Route protection wrapper:
 * If user is not authenticated, rejects access and redirects immediately to the home login page.
 */
function ProtectedWorkspaceRoute() {
  const [, setLocation] = useLocation();
  const authed = isAuthenticated();

  useEffect(() => {
    if (!authed) {
      toast.error('Authentication Required', {
        description: 'Please sign in with a verified corporate account to access this page.',
      });
      setLocation('/');
    }
  }, [authed, setLocation]);

  if (!authed) {
    return null;
  }

  return (
    <AppShell>
      <WorkspacePages />
    </AppShell>
  );
}

/**
 * Front page route:
 * The home page ONLY displays the login page.
 * If already authenticated, smoothly directs to /dashboard.
 */
function FrontPageRoute() {
  const [, setLocation] = useLocation();
  const authed = isAuthenticated();

  useEffect(() => {
    if (authed) {
      setLocation('/dashboard');
    }
  }, [authed, setLocation]);

  if (authed) {
    return null;
  }

  return <LoginPage />;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        {/* Home page ONLY has the login page */}
        <Route path="/" component={FrontPageRoute} />
        <Route path="/login" component={FrontPageRoute} />
        <Route path="/signup" component={FrontPageRoute} />
        <Route path="/auth" component={FrontPageRoute} />
        <Route path="/auth/signup" component={FrontPageRoute} />

        {/* Protected workspace routes - rejects unauthenticated access */}
        <Route path="/dashboard" component={ProtectedWorkspaceRoute} />
        <Route path="/employees" component={ProtectedWorkspaceRoute} />
        <Route path="/employees/:id" component={ProtectedWorkspaceRoute} />
        <Route path="/skills" component={ProtectedWorkspaceRoute} />
        <Route path="/certifications" component={ProtectedWorkspaceRoute} />
        <Route path="/training" component={ProtectedWorkspaceRoute} />
        <Route path="/training/:id" component={ProtectedWorkspaceRoute} />
        <Route path="/skill-gaps" component={ProtectedWorkspaceRoute} />
        <Route path="/analytics" component={ProtectedWorkspaceRoute} />
        <Route path="/settings" component={ProtectedWorkspaceRoute} />

        {/* Fallback */}
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
