import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  category?: string | null;
  categoryIcon?: string | null;
  isAvailable: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const ProductCard = ({
  id,
  name,
  price,
  quantity,
  imageUrl,
  category,
  categoryIcon,
  isAvailable,
  isFavorite = false,
  onToggleFavorite,
}: ProductCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="group animate-fade-in cursor-pointer overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all hover:shadow-elevated"
      onClick={() => navigate(`/products/${id}`)}
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">
            {categoryIcon || "🛒"}
          </div>
        )}
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
            <Badge variant="destructive" className="text-xs font-semibold">Out of Stock</Badge>
          </div>
        )}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="absolute right-2 top-2 rounded-full bg-card/80 p-1.5 backdrop-blur-sm transition-colors hover:bg-card"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"
              )}
            />
          </button>
        )}
        {category && (
          <Badge className="absolute left-2 top-2 bg-card/80 text-foreground backdrop-blur-sm text-[10px]">
            {categoryIcon} {category}
          </Badge>
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-card-foreground">{name}</h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-base font-bold text-primary">₹{price.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">
            {quantity > 0 ? `${quantity} left` : "Sold out"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
