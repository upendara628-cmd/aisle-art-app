import { Store, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { useShop } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";

const ShopInfo = () => {
  const { isAdmin } = useAuth();
  const { data: shop } = useShop();

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <div className="gradient-hero px-4 pb-8 pt-12 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-card/20 backdrop-blur-sm">
          <Store className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="mt-3 text-2xl font-bold text-primary-foreground font-display">
          {shop?.name || "Your Grocery Store"}
        </h1>
        <Badge className="mt-2 bg-card/20 text-primary-foreground border-0">
          <Shield className="mr-1 h-3 w-3" />
          Verified Store
        </Badge>
      </div>

      {/* About */}
      <div className="p-4 space-y-3 -mt-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">About</h2>
            <p className="mt-2 text-sm leading-relaxed">
              {shop?.description || "A trusted local grocery store serving the community with fresh, quality products at affordable prices."}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="space-y-4 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Contact Details</h2>
            
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{shop?.email || "contact@store.com"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-accent/10 p-2">
                <Phone className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{shop?.phone || "+91 98765 43210"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-info/10 p-2">
                <MapPin className="h-4 w-4 text-info" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm font-medium">{shop?.address || "123 Main Street, Local Area"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-warning/10 p-2">
                <Calendar className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Years in Business</p>
                <p className="text-sm font-medium">{shop?.years_running || 0} years serving the community</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Trust & Quality</h2>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-lg font-bold text-primary">{shop?.years_running || 0}+</p>
                <p className="text-[10px] text-muted-foreground">Years</p>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-lg font-bold text-accent">100%</p>
                <p className="text-[10px] text-muted-foreground">Fresh</p>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-lg font-bold text-info">Local</p>
                <p className="text-[10px] text-muted-foreground">Sourced</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav isAdmin={isAdmin} />
    </div>
  );
};

export default ShopInfo;
