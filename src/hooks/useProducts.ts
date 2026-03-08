import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProducts = (categoryId?: string | null, searchTerm?: string) => {
  return useQuery({
    queryKey: ["products", categoryId, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, categories(name, icon)")
        .order("created_at", { ascending: false });

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }
      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, icon)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
};

export const useShop = () => {
  return useQuery({
    queryKey: ["shop"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
};

export const useDashboardStats = (shopId?: string) => {
  return useQuery({
    queryKey: ["dashboard-stats", shopId],
    queryFn: async () => {
      if (!shopId) return null;
      const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopId);
      if (error) throw error;

      const total = products?.length || 0;
      const lowStock = products?.filter(p => p.quantity <= (p.low_stock_threshold || 5)).length || 0;
      const outOfStock = products?.filter(p => p.quantity === 0).length || 0;
      const mostViewed = [...(products || [])].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 5);
      const recentlyAdded = [...(products || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

      return { total, lowStock, outOfStock, mostViewed, recentlyAdded, products };
    },
    enabled: !!shopId,
  });
};
