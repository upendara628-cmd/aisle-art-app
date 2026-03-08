import { MapPin, Navigation, Phone, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { useShop } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";

const MapPage = () => {
  const { isAdmin } = useAuth();
  const { data: shop } = useShop();

  const lat = shop?.latitude || 20.5937;
  const lng = shop?.longitude || 78.9629;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
  const directionsUrl = `https://www.openstreetmap.org/directions?from=&to=${lat},${lng}`;

  return (
    <div className="min-h-screen bg-background safe-bottom">
      <div className="gradient-hero px-4 pb-4 pt-12">
        <h1 className="text-2xl font-bold text-primary-foreground font-display">Find Our Store</h1>
        <p className="mt-1 text-sm text-primary-foreground/70">Get directions to visit us</p>
      </div>

      {/* OpenStreetMap Embed */}
      <div className="mx-4 mt-4 overflow-hidden rounded-xl border border-border" style={{ height: 260 }}>
        <iframe
          title="Store Location"
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* Shop Details */}
      <div className="p-4 space-y-3">
        <Card className="shadow-card">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="rounded-full bg-primary/10 p-2"><MapPin className="h-5 w-5 text-primary" /></div>
            <div>
              <h3 className="text-sm font-semibold">Store Address</h3>
              <p className="text-sm text-muted-foreground">{shop?.address || "Address not set yet"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="rounded-full bg-accent/10 p-2"><Phone className="h-5 w-5 text-accent" /></div>
            <div>
              <h3 className="text-sm font-semibold">Contact</h3>
              <p className="text-sm text-muted-foreground">{shop?.phone || "Phone not set"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="rounded-full bg-info/10 p-2"><Clock className="h-5 w-5 text-info" /></div>
            <div>
              <h3 className="text-sm font-semibold">Business Hours</h3>
              <p className="text-sm text-muted-foreground">Mon - Sat: 8AM - 9PM</p>
              <p className="text-sm text-muted-foreground">Sunday: 9AM - 6PM</p>
            </div>
          </CardContent>
        </Card>

        <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
          <Card className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="rounded-full bg-success/10 p-2"><Navigation className="h-5 w-5 text-success" /></div>
              <div>
                <h3 className="text-sm font-semibold">Get Directions</h3>
                <p className="text-sm text-muted-foreground">Open in OpenStreetMap</p>
              </div>
            </CardContent>
          </Card>
        </a>
      </div>

      <BottomNav isAdmin={isAdmin} />
    </div>
  );
};

export default MapPage;
