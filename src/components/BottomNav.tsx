import { Home, ShoppingBag, Search, MapPin, Store, LayoutDashboard } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: ShoppingBag, label: "Products", path: "/products" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: MapPin, label: "Map", path: "/map" },
  { icon: Store, label: "Shop", path: "/shop-info" },
];

const BottomNav = ({ isAdmin = false }: { isAdmin?: boolean }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const items = isAdmin
    ? [...navItems, { icon: LayoutDashboard, label: "Admin", path: "/admin" }]
    : navItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2.5 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span className={cn("font-medium", isActive && "font-semibold")}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
