import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, AlertTriangle, TrendingUp, Plus, Pencil, Trash2, LogOut, Eye, Camera, Upload, X, Bell, Minus, ShoppingBag,
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
import { useOrders, useTodaysSales } from "@/hooks/useOrders";
import RecentSales from "@/components/RecentSales";
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
  const { data: orders } = useOrders(shop?.id);
  const { data: todaySales } = useTodaysSales(shop?.id);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "", description: "", price: "", quantity: "", category_id: "", is_available: true,
  });

  // Low stock notification toast — shown once per session
  useEffect(() => {
    if (stats && stats.lowStock > 0) {
      const shownKey = `low_stock_notified_${stats.lowStock}`;
      if (!sessionStorage.getItem(shownKey)) {
        sessionStorage.setItem(shownKey, "true");
        const lowItems = stats.products
          ?.filter((p) => p.quantity <= (p.low_stock_threshold || 5) && p.quantity > 0) || [];
        toast.warning(
          `⚠️ ${stats.lowStock} product${stats.lowStock > 1 ? "s" : ""} running low on stock!`,
          {
            description: lowItems.slice(0, 3).map(p => `${p.name} (${p.quantity} left)`).join(", "),
            duration: 8000,
          }
        );
      }
    }
    if (stats && stats.outOfStock > 0) {
      const shownKey = `out_of_stock_notified_${stats.outOfStock}`;
      if (!sessionStorage.getItem(shownKey)) {
        sessionStorage.setItem(shownKey, "true");
        toast.error(
          `🚨 ${stats.outOfStock} product${stats.outOfStock > 1 ? "s are" : " is"} out of stock!`,
          { duration: 8000 }
        );
      }
    }
  }, [stats]);

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
    setImagePreview(null);
    setImageFile(null);
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return editProduct?.image_url || null;
    setUploading(true);
    const ext = imageFile.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, imageFile, { contentType: imageFile.type });

    setUploading(false);
    if (error) {
      toast.error("Image upload failed: " + error.message);
      return editProduct?.image_url || null;
    }

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
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

    const imageUrl = await uploadImage();

    const productData = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity) || 0,
      category_id: form.category_id || null,
      is_available: form.is_available,
      shop_id: shop.id,
      image_url: imageUrl,
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

  const handleQuantityChange = async (id: string, currentQty: number, delta: number) => {
    const newQty = Math.max(0, currentQty + delta);
    const { error } = await supabase.from("products").update({ quantity: newQty, is_available: newQty > 0 }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
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
    setImagePreview(product.image_url || null);
    setImageFile(null);
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
          <div className="flex items-center gap-1">
            {stats && stats.lowStock > 0 && (
              <button
                className="relative p-1"
                onClick={() => document.getElementById("low-stock-alerts")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Bell className="h-5 w-5 text-primary-foreground/70" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {stats.lowStock}
                </span>
              </button>
            )}
            <Button variant="ghost" size="icon" onClick={signOut} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 px-4 -mt-2">
        <Card className="shadow-card">
          <CardContent className="p-2 text-center">
            <Package className="mx-auto h-4 w-4 text-primary" />
            <p className="mt-1 text-lg font-bold">{stats?.total || 0}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-2 text-center">
            <AlertTriangle className="mx-auto h-4 w-4 text-warning" />
            <p className="mt-1 text-lg font-bold">{stats?.lowStock || 0}</p>
            <p className="text-[10px] text-muted-foreground">Low</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-2 text-center">
            <TrendingUp className="mx-auto h-4 w-4 text-accent" />
            <p className="mt-1 text-lg font-bold">{stats?.outOfStock || 0}</p>
            <p className="text-[10px] text-muted-foreground">Out</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-primary/20">
          <CardContent className="p-2 text-center">
            <ShoppingBag className="mx-auto h-4 w-4 text-primary" />
            <p className="mt-1 text-lg font-bold">{todaySales?.count || 0}</p>
            <p className="text-[10px] text-muted-foreground">Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Low stock alerts */}
      {stats?.lowStock ? (
        <div className="px-4 pt-4">
          <h2 id="low-stock-alerts" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">⚠️ Low Stock Alerts</h2>
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
              {/* Image Capture Section */}
              <div>
                <Label>Product Image</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="h-40 w-full rounded-lg object-cover border border-border"
                      />
                      <button
                        onClick={() => { setImagePreview(null); setImageFile(null); }}
                        className="absolute right-2 top-2 rounded-full bg-destructive p-1"
                      >
                        <X className="h-3.5 w-3.5 text-destructive-foreground" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-24 flex-col gap-1.5"
                        onClick={() => cameraInputRef.current?.click()}
                      >
                        <Camera className="h-6 w-6 text-primary" />
                        <span className="text-xs">Take Photo</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-24 flex-col gap-1.5"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-6 w-6 text-accent" />
                        <span className="text-xs">Upload</span>
                      </Button>
                    </div>
                  )}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageCapture}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageCapture}
                  />
                </div>
              </div>

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
              <Button className="w-full gradient-fresh text-primary-foreground" onClick={handleSave} disabled={uploading}>
                {uploading ? "Uploading image..." : editProduct ? "Update Product" : "Add Product"}
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
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-xl overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-full w-full rounded-lg object-cover" />
                  ) : "🛒"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <span className="text-xs font-semibold text-primary">₹{product.price}</span>
                </div>
                {/* Quantity +/- controls */}
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => handleQuantityChange(product.id, product.quantity, -1)}
                    disabled={product.quantity <= 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className={`min-w-[2rem] text-center text-sm font-bold ${product.quantity <= (product.low_stock_threshold || 5) ? "text-warning" : ""}`}>
                    {product.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => handleQuantityChange(product.id, product.quantity, 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex gap-0.5">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(product)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-3 w-3" />
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

      {/* Orders & Sales */}
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">📦 Orders & Sales</h2>
          {todaySales && todaySales.revenue > 0 && (
            <span className="text-xs font-semibold text-primary">Today: ₹{todaySales.revenue.toFixed(2)}</span>
          )}
        </div>
        <div className="mt-2">
          <RecentSales
            orders={orders || []}
            onAccept={handleAcceptOrder}
            onReject={handleRejectOrder}
            onDelete={handleDeleteOrder}
          />
        </div>
      </div>

      <BottomNav isAdmin={true} />
    </div>
  );
};

export default AdminDashboard;
