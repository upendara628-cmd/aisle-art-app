import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";
import CategoryChip from "@/components/CategoryChip";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";

const Products = () => {
  const { isAdmin } = useAuth();
  const { data: categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: products, isLoading } = useProducts(selectedCategory);

  return (
    <div className="min-h-screen bg-background safe-bottom">
      <div className="gradient-hero px-4 pb-4 pt-12">
        <h1 className="text-2xl font-bold text-primary-foreground font-display">All Products</h1>
        <p className="mt-1 text-sm text-primary-foreground/70">Browse our complete catalog</p>
      </div>

      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <CategoryChip icon={null} name="All" isActive={!selectedCategory} onClick={() => setSelectedCategory(null)} />
          {categories?.map((cat) => (
            <CategoryChip key={cat.id} icon={cat.icon} name={cat.name} isActive={selectedCategory === cat.id} onClick={() => setSelectedCategory(cat.id)} />
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
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
          <div className="flex flex-col items-center py-16 text-center">
            <span className="text-5xl">📦</span>
            <p className="mt-3 text-muted-foreground">No products found</p>
          </div>
        )}
      </div>

      <BottomNav isAdmin={isAdmin} />
    </div>
  );
};

export default Products;
