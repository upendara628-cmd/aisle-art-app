import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";
import CategoryChip from "@/components/CategoryChip";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-grocery.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { data: categories } = useCategories();
  const { data: products, isLoading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = selectedCategory
    ? products?.filter((p) => p.category_id === selectedCategory)
    : products;

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Hero */}
      <div className="relative h-56 overflow-hidden">
        <img src={heroImage} alt="Fresh grocery products" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h1 className="text-2xl font-bold text-primary-foreground font-display">
            Fresh & Local
          </h1>
          <p className="mt-1 text-sm text-primary-foreground/80">
            Discover products from your neighborhood store
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold font-display">Categories</h2>
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-1 text-xs font-medium text-primary"
          >
            View All <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <CategoryChip
            icon={null}
            name="All"
            isActive={!selectedCategory}
            onClick={() => setSelectedCategory(null)}
          />
          {categories?.map((cat) => (
            <CategoryChip
              key={cat.id}
              icon={cat.icon}
              name={cat.name}
              isActive={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
            />
          ))}
        </div>
      </div>

      {/* Trending Section */}
      <div className="px-4 pt-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" />
          <h2 className="text-lg font-semibold font-display">Fresh Picks</h2>
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.slice(0, 6).map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                quantity={product.quantity}
                imageUrl={product.image_url}
                category={product.categories?.name}
                categoryIcon={product.categories?.icon}
                isAvailable={product.is_available}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-12 text-center">
            <span className="text-5xl">🛒</span>
            <p className="mt-3 text-muted-foreground">No products yet</p>
            {isAdmin && (
              <Button
                onClick={() => navigate("/admin")}
                className="mt-4 gradient-fresh text-primary-foreground"
              >
                Add Products
              </Button>
            )}
          </div>
        )}
        {filteredProducts && filteredProducts.length > 6 && (
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => navigate("/products")}
          >
            View All Products
          </Button>
        )}
      </div>

      <BottomNav isAdmin={isAdmin} />
    </div>
  );
};

export default Index;
