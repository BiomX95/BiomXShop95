import { useQuery } from "@tanstack/react-query";
import { DiamondPackage as DiamondPackageComponent } from "./DiamondPackage";
import { DiamondPackage } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface DiamondCatalogProps {
  onSelectPackage: (pkg: DiamondPackage) => void;
  className?: string;
}

export function DiamondCatalog({ onSelectPackage, className = "" }: DiamondCatalogProps) {
  const { data: packages, isLoading, error } = useQuery<DiamondPackage[]>({
    queryKey: ["/api/diamond-packages"],
    staleTime: 1000 * 60 * 5, // 5 минут
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !packages) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Ошибка при загрузке пакетов алмазов. Пожалуйста, попробуйте позже.</p>
      </div>
    );
  }

  return (
    <div className={`diamond-catalog grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 ${className}`}>
      {packages.map((pkg: DiamondPackage) => (
        <DiamondPackageComponent
          key={pkg.id}
          package={pkg}
          onSelect={onSelectPackage}
        />
      ))}
    </div>
  );
}