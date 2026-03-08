import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useOrders = (shopId?: string) => {
  return useQuery({
    queryKey: ["orders", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!shopId,
  });
};

export const useTodaysSales = (shopId?: string) => {
  return useQuery({
    queryKey: ["today-sales", shopId],
    queryFn: async () => {
      if (!shopId) return { count: 0, revenue: 0 };
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("orders")
        .select("quantity, total_price")
        .eq("shop_id", shopId)
        .gte("created_at", today.toISOString());
      if (error) throw error;

      const count = data?.reduce((sum, o) => sum + o.quantity, 0) || 0;
      const revenue = data?.reduce((sum, o) => sum + Number(o.total_price), 0) || 0;
      return { count, revenue };
    },
    enabled: !!shopId,
  });
};
