import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import SearchPage from "./pages/SearchPage";
import MapPage from "./pages/MapPage";
import ShopInfo from "./pages/ShopInfo";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import CartPage from "./pages/CartPage";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { App as CapacitorApp } from "@capacitor/app";
import { supabase } from "@/integrations/supabase/client";

function NotificationHandler() {
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        await LocalNotifications.requestPermissions();
      } catch (e) {
        console.log("LocalNotifications permission not available on this platform", e);
      }
    };
    setupNotifications();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products' },
        (payload) => {
          const oldRecord = payload.old as any;
          const newRecord = payload.new as any;

          if (oldRecord && newRecord && oldRecord.quantity === 0 && newRecord.quantity > 0) {
            try {
              LocalNotifications.schedule({
                notifications: [
                  {
                    title: 'Back in Stock! 🎉',
                    body: `${newRecord.name || 'An item'} is now available again!`,
                    id: Math.floor(Math.random() * 1000000),
                    schedule: { at: new Date(Date.now() + 1000) },
                  }
                ]
              });
            } catch (e) {
              console.log("Error scheduling notification", e);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    CapacitorApp.addListener('appUrlOpen', async (event: { url: string }) => {
      if (event.url.includes('google_auth') || event.url.includes('nakiranam-auth.lovable.app')) {
        const url = new URL(event.url.replace("#", "?"));
        const params = new URLSearchParams(url.search);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error) {
            // Success! Redirection to / is usually automatic if state changes
          }
        }
      }
    });

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, []);

  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <NotificationHandler />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/shop-info" element={<ShopInfo />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
