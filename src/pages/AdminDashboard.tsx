import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, AlertTriangle, TrendingUp, Plus, Pencil, Trash2, LogOut, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useShop, useDashboardStats, useCategories } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAdmin, signOut } = useAuth();
  const { data: shop } = useShop();
  const { data: stats } = useDashboardStats(shop?.id);
  const { data: categories } = useCategories();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState({
    name: "", description: "", price: "", quantity: "", category_id: "", is_available: true,
  });

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <h1 className="text-2xl font-bold font-display">Admin Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your store</p>
        <Button className="mt-6 gradient-fresh text-primary-foreground" onClick={() => navigate("/auth")}>
          Sign In
        </Button>
      </div>
    );
  }

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", quantity: "", category_id: "", is_available: true });
    setEditProduct(null);
  };

  const handleSave = async () => {
    if (!shop) {
      toast.error("No shop found. Create a shop first.");
      return;
    }
    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }

    const productData = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity) || 0,
      category_id: form.category_id || null,
      is_available: form.is_available,
      shop_id: shop.id,
    };

    if (editProduct) {
      const { error } = await supabase.from("products").update(productData).eq("id", editProduct.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Product updated!");
    } else {
      const { error } = await supabase.from("products").insert(productData);
      if (error) { toast.error(error.message); return; }
      toast.success("Product added!");
    }

    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    setIsAddOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Product deleted");
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  const openEdit = (product: any) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      quantity: String(product.quantity),
      category_id: product.category_id || "",
      is_available: product.is_available,
    });
    setIsAddOpen(true);
  };

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <div className="gradient-hero px-4 pb-4 pt-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground font-display">Dashboard</h1>
            <p className="text-sm text-primary-foreground/70">{shop?.name || "Your Store"}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-4 -mt-2">
        <Card className="shadow-card">
          <CardContent className="p-3 text-center">
            <Package className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-1 text-xl font-bold">{stats?.total || 0}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="mx-auto h-5 w-5 text-warning" />
            <p className="mt-1 text-xl font-bold">{stats?.lowStock || 0}</p>
            <p className="text-[10px] text-muted-foreground">Low Stock</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-3 text-center">
            <TrendingUp className="mx-auto h-5 w-5 text-accent" />
            <p className="mt-1 text-xl font-bold">{stats?.outOfStock || 0}</p>
            <p className="text-[10px] text-muted-foreground">Out of Stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Low stock alerts */}
      {stats?.lowStock ? (
        <div className="px-4 pt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">⚠️ Low Stock Alerts</h2>
          <div className="mt-2 space-y-2">
            {stats.products
              ?.filter((p) => p.quantity <= (p.low_stock_threshold || 5) && p.quantity > 0)
              .map((p) => (
                <Card key={p.id} className="border-warning/30 shadow-card">
                  <CardContent className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">Only {p.quantity} left</p>
                    </div>
                    <Badge variant="outline" className="border-warning text-warning text-xs">Low</Badge>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ) : null}

      {/* Add Product Button */}
      <div className="px-4 pt-4">
        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="w-full gradient-fresh text-primary-foreground h-11">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">{editProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Product Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Fresh Tomatoes" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product description..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Price (₹)</Label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Available</Label>
                <Switch checked={form.is_available} onCheckedChange={(v) => setForm({ ...form, is_available: v })} />
              </div>
              <Button className="w-full gradient-fresh text-primary-foreground" onClick={handleSave}>
                {editProduct ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inventory List */}
      <div className="px-4 pt-4 pb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">All Products</h2>
        <div className="mt-2 space-y-2">
          {stats?.products?.map((product) => (
            <Card key={product.id} className="shadow-card">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-xl">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-full w-full rounded-lg object-cover" />
                  ) : "🛒"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary">₹{product.price}</span>
                    <span className="text-xs text-muted-foreground">Qty: {product.quantity}</span>
                    {product.views_count ? (
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />{product.views_count}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!stats?.products?.length && (
            <p className="py-8 text-center text-sm text-muted-foreground">No products yet. Add your first product above!</p>
          )}
        </div>
      </div>

      <BottomNav isAdmin={true} />
    </div>
  );
};

export default AdminDashboard;
