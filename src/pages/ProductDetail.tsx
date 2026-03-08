import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, ShoppingBag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProduct } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: product, isLoading } = useProduct(id || "");
  const [reserving, setReserving] = useState(false);

  const handleReserve = async () => {
    if (!product || !user) {
      if (!user) {
        toast.error("Please sign in to reserve items");
        navigate("/auth");
        return;
      }
      return;
    }

    setReserving(true);
    try {
      // Insert order
      const { error: orderError } = await supabase.from("orders").insert({
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.price,
        total_price: product.price,
        user_id: user.id,
        shop_id: product.shop_id,
        status: "pending",
      });
      if (orderError) throw orderError;

      // Don't decrement stock yet — admin will accept first

      toast.success("Reservation request sent! The shop will confirm shortly. 📩");
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      toast.success("Item reserved successfully! 🎉");
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["today-sales"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to reserve item");
    } finally {
      setReserving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="aspect-square animate-pulse bg-muted" />
        <div className="space-y-3 p-4">
          <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Image */}
      <div className="relative aspect-square bg-secondary">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-7xl">
            {product.categories?.icon || "🛒"}
          </div>
        )}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 rounded-full bg-card/80 p-2 backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button className="absolute right-4 top-4 rounded-full bg-card/80 p-2 backdrop-blur-sm">
          <Heart className="h-5 w-5" />
        </button>
        {!product.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
            <Badge variant="destructive" className="text-lg px-4 py-1">Out of Stock</Badge>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 animate-slide-up">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display">{product.name}</h1>
            {product.categories && (
              <Badge variant="secondary" className="mt-1">
                {product.categories.icon} {product.categories.name}
              </Badge>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">₹{product.price.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ShoppingBag className="h-4 w-4" />
            <span>{product.quantity > 0 ? `${product.quantity} available` : "Out of stock"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Updated {new Date(product.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        {product.description && (
          <div className="mt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Description</h2>
            <p className="mt-1 text-sm leading-relaxed">{product.description}</p>
          </div>
        )}

        {product.is_available && product.quantity > 0 && (
          <Button
            className="mt-6 w-full gradient-fresh text-primary-foreground h-12 text-base font-semibold"
            onClick={handleReserve}
            disabled={reserving}
          >
            {reserving ? "Reserving..." : "Reserve This Item"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
