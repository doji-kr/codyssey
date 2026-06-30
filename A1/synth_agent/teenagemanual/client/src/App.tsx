import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import DeviceDetail from "./pages/DeviceDetail";
import ChatPage from "./pages/ChatPage";
import MasteryPage from "./pages/MasteryPage";
import GuideDetail from "./pages/GuideDetail";
import ProPage from "./pages/ProPage";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/:slug"} component={DeviceDetail} />
      <Route path={"/:slug/ask"} component={ChatPage} />
      <Route path={"/:slug/mastery"} component={MasteryPage} />
      <Route path={"/:slug/guides/:guideSlug"} component={GuideDetail} />
      <Route path={"/pro"} component={ProPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
