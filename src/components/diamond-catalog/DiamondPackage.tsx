import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DiamondIcon, VoucherIcon, EvoPassIcon } from "@/components/icons/DiamondIcon";
import { DiamondPackage as DiamondPackageType } from "@shared/schema";

interface DiamondPackageProps {
  package: DiamondPackageType;
  onSelect: (pkg: DiamondPackageType) => void;
  className?: string;
}

export function DiamondPackage({ package: pkg, onSelect, className = "" }: DiamondPackageProps) {
  // Рассчитываем цену со скидкой
  const finalPrice = pkg.discount && pkg.discount > 0 
    ? Math.round(pkg.price * (1 - pkg.discount / 100)) 
    : pkg.price;

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-xl hover:scale-105 ${pkg.isPopular ? 'border-primary border-2' : ''} ${className}`}>
      <CardHeader className="p-2 bg-gradient-to-br from-white to-gray-100">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-gray-800">{pkg.name}</h3>
          {pkg.isPopular && (
            <Badge variant="secondary" className="bg-red-500 text-white text-xs px-2 py-0.5">
              Топ
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {pkg.name.toLowerCase().includes('ваучер') ? (
              <VoucherIcon size={20} className="mr-1" />
            ) : pkg.name.toLowerCase().includes('эво-пропуск') ? (
              <EvoPassIcon size={20} className="mr-1" />
            ) : (
              <DiamondIcon size={20} className="mr-1" />
            )}
            {pkg.amount > 0 && (
              <span className="text-base font-bold text-gray-800">{pkg.amount}</span>
            )}
          </div>
          
          <div className="ml-auto">
            {pkg.discount && pkg.discount > 0 ? (
              <div className="flex items-center gap-1">
                <div className="line-through text-xs text-gray-500">{pkg.price}₽</div>
                <div className="text-base font-bold text-red-600">{finalPrice}₽</div>
                <Badge variant="outline" className="bg-red-100 text-red-600 text-xs px-1.5 py-0 font-bold">-{pkg.discount}%</Badge>
              </div>
            ) : (
              <div className="text-base font-bold text-gray-900">{pkg.price}₽</div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-2 bg-gradient-to-b from-gray-50 to-gray-100">
        <Button 
          onClick={() => onSelect(pkg)} 
          className="w-full text-sm py-1 h-auto font-medium bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 text-white"
          variant="destructive"
        >
          Купить
        </Button>
      </CardFooter>
    </Card>
  );
}