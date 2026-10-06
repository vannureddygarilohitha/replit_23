import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { AppShell } from '@/components/app-shell';
import { WorkspacePages } from '@/pages/workspace-pages';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
function WorkspaceRoute() { const [path]=useLocation(); return path.startsWith('/auth') ? <main className="min-h-[100dvh] bg-[#f5f2e9] p-4 md:p-8"><WorkspacePages/></main> : <AppShell><WorkspacePages /></AppShell>; }
function Router() {
  return <RoutedErrorBoundary><Switch>
    <Route path="/" component={WorkspaceRoute}/>
    <Route path="/dashboard" component={WorkspaceRoute}/>
    <Route path="/employees" component={WorkspaceRoute}/>
    <Route path="/employees/:id" component={WorkspaceRoute}/>
    <Route path="/skills" component={WorkspaceRoute}/>
    <Route path="/certifications" component={WorkspaceRoute}/>
    <Route path="/training" component={WorkspaceRoute}/>
    <Route path="/training/:id" component={WorkspaceRoute}/>
    <Route path="/skill-gaps" component={WorkspaceRoute}/>
    <Route path="/analytics" component={WorkspaceRoute}/>
    <Route path="/settings" component={WorkspaceRoute}/>
    <Route path="/auth" component={WorkspaceRoute}/>
    <Route path="/auth/signup" component={WorkspaceRoute}/>
    <Route component={NotFound}/>
  </Switch></RoutedErrorBoundary>;
}
function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router/></WouterRouter><Toaster/></TooltipProvider></QueryClientProvider>;
}
export default App;
