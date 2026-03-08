import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";
import { useProducts, useCategories } from "@/hooks/useProducts";
import CategoryChip from "@/components/CategoryChip";
import { useAuth } from "@/hooks/useAuth";

const SearchPage = () => {
  const { isAdmin } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: products } = useProducts(selectedCategory, query);
  const { data: categories } = useCategories();

  return (
    <div className="min-h-screen bg-background safe-bottom">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold font-display">Search</h1>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for groceries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11 rounded-full bg-secondary border-0"
          />
        </div>
      </div>

      <div className="px-4">
        <div className="flex gap-2 overflow-x-auto pb-3">
          <CategoryChip icon={null} name="All" isActive={!selectedCategory} onClick={() => setSelectedCategory(null)} />
          {categories?.map((cat) => (
            <CategoryChip key={cat.id} icon={cat.icon} name={cat.name} isActive={selectedCategory === cat.id} onClick={() => setSelectedCategory(cat.id)} />
          ))}
        </div>
      </div>

      <div className="px-4 py-2">
        {products && products.length > 0 ? (
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
        ) : query ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="text-5xl">🔍</span>
            <p className="mt-3 text-muted-foreground">No results for "{query}"</p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="text-5xl">🔍</span>
            <p className="mt-3 text-muted-foreground">Start typing to search products</p>
          </div>
        )}
      </div>

      <BottomNav isAdmin={isAdmin} />
    </div>
  );
};

export default SearchPage;
