import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, ShoppingBag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProduct } from "@/hooks/useProducts";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id || "");

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
          <Button className="mt-6 w-full gradient-fresh text-primary-foreground h-12 text-base font-semibold">
            Reserve This Item
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
