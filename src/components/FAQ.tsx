import { useState } from "react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { FaqItem } from "@/components/ui/faq-item";
import { faqItems } from "@/lib/faq-data";
import { cn } from "@/lib/utils";

export default function FAQ() {
  const [openItem, setOpenItem] = useState(1);
  const titleAnimation = useScrollAnimation();

  const handleToggle = (id: number) => {
    setOpenItem(openItem === id ? 0 : id);
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div 
          ref={titleAnimation.ref as React.RefObject<HTMLDivElement>}
          className={cn(
            "text-center mb-16 transition-all duration-700",
            titleAnimation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Часто задаваемые вопросы</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ответы на популярные вопросы о нашем Telegram боте
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <FaqItem 
              key={item.id}
              item={item}
              isOpen={openItem === item.id}
              onToggle={() => handleToggle(item.id)}
              animationDelay={100 * index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
