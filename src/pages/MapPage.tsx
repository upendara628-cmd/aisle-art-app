import { MapPin, Navigation, Phone, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { useShop } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";

const MapPage = () => {
  const { isAdmin } = useAuth();
  const { data: shop } = useShop();

  return (
    <div className="min-h-screen bg-background safe-bottom">
      <div className="gradient-hero px-4 pb-4 pt-12">
        <h1 className="text-2xl font-bold text-primary-foreground font-display">Find Our Store</h1>
        <p className="mt-1 text-sm text-primary-foreground/70">Get directions to visit us</p>
      </div>

      {/* Map Placeholder */}
      <div className="relative mx-4 mt-4 h-64 overflow-hidden rounded-xl border border-border bg-secondary">
        <div className="flex h-full flex-col items-center justify-center text-center">
          <MapPin className="h-12 w-12 text-primary" />
          <p className="mt-2 text-sm font-medium">Map View</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Connect Google Maps API for live map
          </p>
        </div>
      </div>

      {/* Shop Details */}
      <div className="p-4 space-y-3">
        <Card className="shadow-card">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="rounded-full bg-primary/10 p-2">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Store Address</h3>
              <p className="text-sm text-muted-foreground">
                {shop?.address || "Address not set yet"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="rounded-full bg-accent/10 p-2">
              <Phone className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Contact</h3>
              <p className="text-sm text-muted-foreground">
                {shop?.phone || "Phone not set"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="rounded-full bg-info/10 p-2">
              <Clock className="h-5 w-5 text-info" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Business Hours</h3>
              <p className="text-sm text-muted-foreground">Mon - Sat: 8AM - 9PM</p>
              <p className="text-sm text-muted-foreground">Sunday: 9AM - 6PM</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="rounded-full bg-success/10 p-2">
              <Navigation className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Get Directions</h3>
              <p className="text-sm text-muted-foreground">Tap to open in your maps app</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav isAdmin={isAdmin} />
    </div>
  );
};

export default MapPage;
