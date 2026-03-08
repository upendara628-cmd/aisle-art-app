import { cn } from "@/lib/utils";

interface CategoryChipProps {
  icon: string | null;
  name: string;
  isActive?: boolean;
  onClick?: () => void;
}

const CategoryChip = ({ icon, name, isActive, onClick }: CategoryChipProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
      isActive
        ? "gradient-fresh text-primary-foreground shadow-card"
        : "bg-secondary text-secondary-foreground hover:bg-muted"
    )}
  >
    {icon && <span className="text-base">{icon}</span>}
    <span>{name}</span>
  </button>
);

export default CategoryChip;
