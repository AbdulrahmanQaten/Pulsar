import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Auth from "./pages/Auth";
import Compose from "./pages/Compose";
import PostPage from "./pages/PostPage";
import NotFound from "./pages/NotFound";

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:username" element={<UserProfile />} />
          <Route path="/post/:postId" element={<PostPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/compose" element={<Compose />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
