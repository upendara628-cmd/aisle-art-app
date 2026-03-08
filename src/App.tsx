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
import { useAuth } from "@/hooks/useAuth";

function NotificationHandler() {
  const { user, isAdmin } = useAuth();
  
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const permissions = await LocalNotifications.checkPermissions();
        if (permissions.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }

        // Create a channel for Android
        await LocalNotifications.createChannel({
          id: 'stock-alerts',
          name: 'Stock & Order Alerts',
          description: 'Notifications for low stock and order status',
          importance: 5,
          visibility: 1,
          vibration: true,
        });

        // TEST NOTIFICATION - Confirm it works on app open
        /*
        await LocalNotifications.schedule({
          notifications: [{
            title: 'Notifications Active! 🔔',
            body: 'You will receive stock and order updates here.',
            id: 123,
            channelId: 'stock-alerts',
            schedule: { at: new Date(Date.now() + 1000) }
          }]
        });
        */
      } catch (e) {
        console.log("LocalNotifications setup error", e);
      }
    };
    setupNotifications();

    // 1. Back in stock notification (existing)
    const productsChannel = supabase
      .channel('products-back-in-stock')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products' },
        (payload) => {
          const oldRecord = payload.old as any;
          const newRecord = payload.new as any;

          if (oldRecord && newRecord && oldRecord.quantity === 0 && newRecord.quantity > 0) {
            LocalNotifications.schedule({
              notifications: [
                {
                  title: 'Back in Stock! 🎉',
                  body: `${newRecord.name || 'An item'} is now available again!`,
                  id: Math.floor(Math.random() * 1000000),
                  channelId: 'stock-alerts',
                  schedule: { at: new Date(Date.now() + 500) },
                }
              ]
            });
          }
        }
      )
      .subscribe();

    // 2. User Order Allotted notification
    let ordersChannel: any;
    if (user) {
      ordersChannel = supabase
        .channel(`user-orders-${user.id}`)
        .on(
          'postgres_changes',
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'orders',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newRecord = payload.new as any;
            const oldRecord = payload.old as any;
            
            if (newRecord.status === 'completed' && oldRecord.status !== 'completed') {
              LocalNotifications.schedule({
                notifications: [
                  {
                    title: 'Order Allotted! ✅',
                    body: `Your order for ${newRecord.product_name} has been accepted.`,
                    id: Math.floor(Math.random() * 1000000),
                    channelId: 'stock-alerts',
                    schedule: { at: new Date(Date.now() + 500) },
                  }
                ]
              });
            }
          }
        )
        .subscribe();
    }

    // 3. Admin 9:00 AM Low Stock Schedule
    const scheduleAdminDailyLowStock = async () => {
      if (!isAdmin || !user) return;

      try {
        const { data: products } = await supabase
          .from("products")
          .select("name, quantity, low_stock_threshold");

        const lowItems = products?.filter(p => p.quantity <= (p.low_stock_threshold || 5)) || [];
        if (lowItems.length === 0) return;

        const body = `Items running low: ${lowItems.map(p => `${p.name} (${p.quantity})`).join(", ")}`;

        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(9, 0, 0, 0);
        
        if (now.getTime() > scheduledTime.getTime()) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        await LocalNotifications.cancel({ notifications: [{ id: 9000 }] });
        await LocalNotifications.schedule({
          notifications: [
            {
              title: 'Low Stock Alert ⚠️',
              body: body.length > 100 ? body.substring(0, 97) + "..." : body,
              id: 9000,
              channelId: 'stock-alerts',
              schedule: { at: scheduledTime, allowWhileIdle: true },
            }
          ]
        });
      } catch (e) {
        console.error("Error scheduling 9AM notification", e);
      }
    };


    if (isAdmin) {
      scheduleAdminDailyLowStock();
    }

    return () => {
      supabase.removeChannel(productsChannel);
      if (ordersChannel) supabase.removeChannel(ordersChannel);
    };
  }, [user, isAdmin]);

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
