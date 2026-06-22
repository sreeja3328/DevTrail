import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Journal from "@/pages/Journal";
import Projects from "@/pages/Projects";
import Profile from "@/pages/Profile";
import ProjectDetails from "@/pages/ProjectDetails";

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { isLoaded, isSignedIn } = useUser();
  const [, navigate] = useLocation();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    navigate("/");
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />

      <Route path="/dashboard">
        <PrivateRoute component={Dashboard} />
      </Route>

      <Route path="/journal">
        <PrivateRoute component={Journal} />
      </Route>

      <Route path="/projects">
        <PrivateRoute component={Projects} />
      </Route>
<Route path="/projects/:id">
  <PrivateRoute component={ProjectDetails} />
</Route>

      <Route path="/profile">
        <PrivateRoute component={Profile} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;