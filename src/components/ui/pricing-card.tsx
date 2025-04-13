import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { PricingPlan } from "@/lib/pricing-data";

interface PricingCardProps {
  plan: PricingPlan;
  className?: string;
  animationDelay?: number;
}

export function PricingCard({ plan, className, animationDelay }: PricingCardProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, animationDelay || 0);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [animationDelay]);

  return (
    <Card
      ref={cardRef}
      className={cn(
        "overflow-hidden transition-all duration-300",
        plan.popular ? "border-primary shadow-lg transform scale-105" : "hover:transform hover:scale-105",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
        className
      )}
    >
      {plan.popular && (
        <div className="bg-primary text-white text-center py-1 text-sm font-medium">
          Популярный выбор
        </div>
      )}
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2 text-center">{plan.name}</h3>
        <div className="text-center mb-6">
          <span className="text-4xl font-bold">₽{plan.price}</span>
          <span className="text-gray-600">/месяц</span>
        </div>
        <ul className="space-y-3 mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              {feature.included ? (
                <Check className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              ) : (
                <X className="w-5 h-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
              )}
              <span className={feature.included ? "" : "text-gray-400"}>{feature.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="px-6 pb-6">
        <Button
          variant={plan.popular ? "default" : "outline"}
          className="w-full"
        >
          Выбрать тариф
        </Button>
      </div>
    </Card>
  );
}
