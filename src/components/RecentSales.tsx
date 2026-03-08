import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Trash2 } from "lucide-react";

interface Order {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
}

interface RecentSalesProps {
  orders: Order[];
  onAccept?: (order: Order) => void;
  onReject?: (orderId: string) => void;
  onDelete?: (orderId: string) => void;
}

const RecentSales = ({ orders, onAccept, onReject, onDelete }: RecentSalesProps) => {
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const rejectedOrders = orders.filter((o) => o.status === "rejected");

  if (!orders?.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No sales yet. Orders will appear here when customers reserve items.
      </p>
    );
  }

  const statusColor: Record<string, string> = {
    pending: "border-warning/30",
    completed: "border-primary/20",
    rejected: "border-destructive/20",
  };

  const statusBadgeVariant: Record<string, "secondary" | "destructive" | "outline"> = {
    pending: "outline",
    completed: "secondary",
    rejected: "destructive",
  };

  return (
    <div className="space-y-4">
      {/* Pending Requests */}
      {pendingOrders.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-warning mb-2">
            🔔 Pending Requests ({pendingOrders.length})
          </h3>
          <div className="space-y-2">
            {pendingOrders.map((order) => (
              <Card key={order.id} className={`shadow-card ${statusColor[order.status]}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{order.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()} · Qty: {order.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary mr-2">₹{Number(order.total_price).toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      className="flex-1 h-8 gradient-fresh text-primary-foreground"
                      onClick={() => onAccept?.(order)}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-destructive border-destructive/30"
                      onClick={() => onReject?.(order.id)}
                    >
                      <X className="h-3.5 w-3.5 mr-1" /> Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Sales */}
      {completedOrders.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            ✅ Completed ({completedOrders.length})
          </h3>
          <div className="space-y-2">
            {completedOrders.map((order) => (
              <Card key={order.id} className={`shadow-card ${statusColor[order.status]}`}>
                <CardContent className="flex items-center justify-between p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{order.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()} · Qty: {order.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary">₹{Number(order.total_price).toFixed(2)}</span>
                    <Badge variant={statusBadgeVariant[order.status]} className="text-[10px]">
                      {order.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => onDelete?.(order.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rejected */}
      {rejectedOrders.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            ❌ Rejected ({rejectedOrders.length})
          </h3>
          <div className="space-y-2">
            {rejectedOrders.map((order) => (
              <Card key={order.id} className={`shadow-card ${statusColor[order.status]} opacity-60`}>
                <CardContent className="flex items-center justify-between p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{order.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()} · Qty: {order.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-[10px]">rejected</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => onDelete?.(order.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentSales;
