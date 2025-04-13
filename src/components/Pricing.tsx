import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { PricingCard } from "@/components/ui/pricing-card";
import { pricingPlans } from "@/lib/pricing-data";
import { cn } from "@/lib/utils";

export default function Pricing() {
  const titleAnimation = useScrollAnimation();

  return (
    <section id="pricing" className="py-20 bg-[hsl(var(--muted)/0.5)]">
      <div className="container mx-auto px-4">
        <div 
          ref={titleAnimation.ref as React.RefObject<HTMLDivElement>}
          className={cn(
            "text-center mb-16 transition-all duration-700",
            titleAnimation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Выберите свой тариф</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Гибкие тарифы для бизнеса любого размера
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <PricingCard 
              key={plan.id} 
              plan={plan} 
              animationDelay={100 * index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
