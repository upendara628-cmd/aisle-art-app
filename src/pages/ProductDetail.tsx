import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, ShoppingBag, Clock, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProduct } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: product, isLoading } = useProduct(id || "");
  const { addItem, items } = useCart();
  const [quantity, setQuantity] = useState(1);

  const cartItem = items.find((i) => i.id === id);
  const alreadyInCart = cartItem?.quantity || 0;
  const maxCanAdd = product ? product.quantity - alreadyInCart : 0;

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      toast.error("Please sign in to add items to cart");
      navigate("/auth?mode=user");
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      maxQuantity: product.quantity,
      imageUrl: product.image_url,
      shopId: product.shop_id,
    });
    toast.success(`Added ${quantity} × ${product.name} to cart 🛒`);
    setQuantity(1);
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
        <button
          onClick={() => navigate("/cart")}
          className="absolute right-4 top-4 rounded-full bg-card/80 p-2 backdrop-blur-sm"
        >
          <ShoppingCart className="h-5 w-5" />
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

        {/* Login prompt */}
        {!user && (
          <div className="mt-6 space-y-3">
            <Button
              className="w-full gradient-fresh text-primary-foreground h-12 text-base font-semibold"
              onClick={() => navigate("/auth?mode=user")}
            >
              <User className="mr-2 h-5 w-5" />
              Sign In to Order
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Sign in to add items to your cart and place orders
            </p>
          </div>
        )}

        {/* Quantity Selector & Add to Cart */}
        {user && product.is_available && product.quantity > 0 && (
          <div className="mt-6 space-y-4">
            {alreadyInCart > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                Already {alreadyInCart} in cart
              </p>
            )}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xl font-bold min-w-[3rem] text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= maxCanAdd}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center">
              <span className="text-lg font-bold text-primary">₹{(product.price * quantity).toFixed(2)}</span>
              <span className="text-sm text-muted-foreground ml-2">for {quantity} item{quantity > 1 ? "s" : ""}</span>
            </div>
            <Button
              className="w-full gradient-fresh text-primary-foreground h-12 text-base font-semibold"
              onClick={handleAddToCart}
              disabled={maxCanAdd <= 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {maxCanAdd <= 0 ? "Max quantity in cart" : "Add to Cart"}
            </Button>
          </div>
        )}

        {/* Out of stock message for logged-in users */}
        {user && (!product.is_available || product.quantity <= 0) && (
          <div className="mt-6 text-center">
            <p className="text-sm font-medium text-destructive">This product is currently out of stock</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
