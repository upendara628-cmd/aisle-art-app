-- Create orders table for sales tracking
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  customer_name text,
  user_id uuid,
  shop_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert orders
CREATE POLICY "Authenticated users can create orders"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Shop owners can view their orders
CREATE POLICY "Shop owners can view their orders"
ON public.orders FOR SELECT TO authenticated
USING (
  auth.uid() IN (
    SELECT s.owner_id FROM public.shops s WHERE s.id = orders.shop_id
  )
);

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT TO authenticated
USING (auth.uid() = user_id);