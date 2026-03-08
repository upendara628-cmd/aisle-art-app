-- Allow shop owners to update orders (accept/reject)
CREATE POLICY "Shop owners can update their orders"
ON public.orders FOR UPDATE TO authenticated
USING (
  auth.uid() IN (
    SELECT s.owner_id FROM public.shops s WHERE s.id = orders.shop_id
  )
);

-- Allow shop owners to delete orders
CREATE POLICY "Shop owners can delete their orders"
ON public.orders FOR DELETE TO authenticated
USING (
  auth.uid() IN (
    SELECT s.owner_id FROM public.shops s WHERE s.id = orders.shop_id
  )
);