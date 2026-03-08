import { useState } from "react";
import { MapPin, Navigation, Phone, Clock, Edit2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { useShop } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";

const MapPage = () => {
  const { isAdmin } = useAuth();
  const { data: shop } = useShop();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const lat = shop?.latitude || 20.5937;
  const lng = shop?.longitude || 78.9629;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
  const handleStartDirections = () => {
    const destination = `${lat},${lng}`;

    const openDirections = (origin?: string) => {
      const params = new URLSearchParams({
        api: "1",
        destination,
        travelmode: "driving",
      });

      if (origin) params.set("origin", origin);

      const url = `https://www.google.com/maps/dir/?${params.toString()}`;
      const newWindow = window.open(url, "_blank", "noopener,noreferrer");
      if (!newWindow) window.location.href = url;
    };

    if (!navigator.geolocation) {
      openDirections();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = `${position.coords.latitude},${position.coords.longitude}`;
        openDirections(origin);
      },
      () => openDirections(),
      { enableHighAccuracy: true, timeout: 7000 }
    );
  };
  const handleOpenDialog = () => {
    setAddress(shop?.address || "");
    setPhone(shop?.phone || "");
    setLatitude(shop?.latitude?.toString() || "");
    setLongitude(shop?.longitude?.toString() || "");
    setOpen(true);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        toast({ title: "Location captured!" });
      },
      () => toast({ title: "Unable to get location", variant: "destructive" })
    );
  };

  const handleSave = async () => {
    if (!shop?.id) return;
    setSaving(true);
    const { error } = await supabase
      .from("shops")
      .update({
        address,
        phone,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      })
      .eq("id", shop.id);
    setSaving(false);

    if (error) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Store location updated!" });
      queryClient.invalidateQueries({ queryKey: ["shop"] });
      setOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background safe-bottom">
      <div className="gradient-hero px-4 pb-4 pt-12 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-foreground font-display">Find Our Store</h1>
          <p className="mt-1 text-sm text-primary-foreground/70">Get directions to visit us</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                onClick={handleOpenDialog}
              >
                <Edit2 className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Update Store Location</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Shop address" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Latitude</Label>
                    <Input value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="20.5937" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Longitude</Label>
                    <Input value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="78.9629" />
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={handleUseMyLocation}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Use My Current Location
                </Button>
                <Button className="w-full" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Location"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
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

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="w-full h-14 gradient-fresh text-primary-foreground text-base font-semibold gap-2 shadow-elevated">
            <Navigation className="h-5 w-5" />
            Navigate to Store
          </Button>
        </a>
      </div>

      <BottomNav isAdmin={isAdmin} />
    </div>
  );
};

export default MapPage;
