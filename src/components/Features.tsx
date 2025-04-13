import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { FeatureCard } from "@/components/ui/feature-card";
import { features } from "@/lib/features-data";
import { cn } from "@/lib/utils";

export default function Features() {
  const titleAnimation = useScrollAnimation();

  return (
    <section id="features" className="py-20 bg-[hsl(var(--muted)/0.5)]">
      <div className="container mx-auto px-4">
        <div 
          ref={titleAnimation.ref as React.RefObject<HTMLDivElement>}
          className={cn(
            "text-center mb-16 transition-all duration-700",
            titleAnimation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Возможности нашего бота</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ваш бизнес становится более доступным и эффективным с помощью умного Telegram бота
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={feature.id} 
              feature={feature} 
              animationDelay={100 * index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
