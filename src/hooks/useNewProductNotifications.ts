import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useNewProductNotifications = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("new-products")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "products" },
        (payload) => {
          const newProduct = payload.new as { name: string };
          toast.info(`🆕 New item added: ${newProduct.name}`, {
            description: "Check it out in the store!",
            duration: 6000,
          });
          queryClient.invalidateQueries({ queryKey: ["products"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
