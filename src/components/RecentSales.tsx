import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  product_name: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
}

const RecentSales = ({ orders }: { orders: Order[] }) => {
  if (!orders?.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No sales yet. Orders will appear here when customers reserve items.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <Card key={order.id} className="shadow-card">
          <CardContent className="flex items-center justify-between p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{order.product_name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString()} · Qty: {order.quantity}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-primary">₹{Number(order.total_price).toFixed(2)}</span>
              <Badge variant="secondary" className="text-[10px]">
                {order.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RecentSales;
