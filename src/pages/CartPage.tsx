import { useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";

const CartPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { items, updateQuantity, removeItem, clearCart, totalPrice, totalItems } = useCart();
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please sign in to place an order");
      navigate("/auth?mode=user");
      return;
    }
    if (items.length === 0) return;

    setPlacing(true);
    try {
      const orders = items.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        user_id: user.id,
        shop_id: item.shopId,
        status: "pending",
      }));

      const { error } = await supabase.from("orders").insert(orders);
      if (error) throw error;

      toast.success(`Order placed! ${totalItems} item${totalItems > 1 ? "s" : ""} reserved. The shop will confirm shortly. 📩`);
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background safe-bottom pb-32">
      {/* Header */}
      <div className="gradient-hero px-4 pb-4 pt-12">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-full bg-primary-foreground/10 p-2">
            <ArrowLeft className="h-5 w-5 text-primary-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground font-display">Your Cart</h1>
            <p className="text-sm text-primary-foreground/70">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-semibold text-muted-foreground">Your cart is empty</p>
          <p className="mt-1 text-sm text-muted-foreground/70">Browse products and add items to get started</p>
          <Button className="mt-6 gradient-fresh text-primary-foreground" onClick={() => navigate("/products")}>
            Browse Products
          </Button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="px-4 pt-4 space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="shadow-card">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-secondary overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">🛒</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">₹{item.price.toFixed(2)} each</p>
                    <p className="text-sm font-bold text-primary mt-0.5">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="min-w-[1.5rem] text-center text-sm font-bold">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.maxQuantity}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="px-4 pt-6">
            <Card className="shadow-card">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold font-display">Order Summary</h3>
                <Separator />
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{totalPrice.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Fixed Bottom Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-bottom">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
            <span className="text-lg font-bold text-primary">₹{totalPrice.toFixed(2)}</span>
          </div>
          <Button
            className="w-full gradient-fresh text-primary-foreground h-12 text-base font-semibold"
            onClick={handlePlaceOrder}
            disabled={placing}
          >
            {placing ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default CartPage;
