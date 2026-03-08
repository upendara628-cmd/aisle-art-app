import { MapPin, Navigation, Phone, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { useShop } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapPage = () => {
  const { isAdmin } = useAuth();
  const { data: shop } = useShop();

  const lat = shop?.latitude || 20.5937;
  const lng = shop?.longitude || 78.9629;

  return (
    <div className="min-h-screen bg-background safe-bottom">
      <div className="gradient-hero px-4 pb-4 pt-12">
        <h1 className="text-2xl font-bold text-primary-foreground font-display">Find Our Store</h1>
        <p className="mt-1 text-sm text-primary-foreground/70">Get directions to visit us</p>
      </div>

      {/* OpenStreetMap */}
      <div className="mx-4 mt-4 overflow-hidden rounded-xl border border-border" style={{ height: 260 }}>
        <MapContainer center={[lat, lng]} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]} icon={defaultIcon}>
            <Popup>{shop?.name || "Our Store"}</Popup>
          </Marker>
        </MapContainer>
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

        {shop?.latitude && shop?.longitude && (
          <a
            href={`https://www.openstreetmap.org/directions?from=&to=${shop.latitude},${shop.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
          >
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
        )}
      </div>

      <BottomNav isAdmin={isAdmin} />
    </div>
  );
};

export default MapPage;
