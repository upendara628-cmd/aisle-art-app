

## How the App Currently Tracks Items

**Current state:** The app has **no sales tracking**. Here's what exists:
- Products have a `quantity` field that the admin manually adjusts with +/- buttons
- A `reservations` table exists but the "Reserve This Item" button doesn't actually work (no handler)
- There's no concept of "sold items" or sales history

**What's missing:** When a customer reserves/buys an item, nothing happens — no quantity deduction, no order record, no sales history.

## Plan: Add Sales/Order Tracking

### 1. Database: Create `orders` table
```sql
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) NOT NULL,
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
```
With RLS: everyone can insert (walk-in sales), shop owners can view their orders.

### 2. Wire up "Reserve This Item" button
- On `ProductDetail.tsx`, make the Reserve button functional:
  - Insert a row into `orders`
  - Decrement the product's `quantity` by 1
  - Show success toast
  - If user is logged in, attach their `user_id`

### 3. Admin Dashboard: Add Sales section
- Add a "Recent Sales" section below the inventory list showing recent orders
- Add a sales count stat card (today's sales or total sales)
- When admin uses the `-` button on quantity, optionally prompt "Mark as sold?"

### 4. Hook: `useOrders`
- New query hook to fetch orders by `shop_id` for the admin dashboard

This gives the app a complete flow: customer reserves → quantity decreases → admin sees the sale in their dashboard.

