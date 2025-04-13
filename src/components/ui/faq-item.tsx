import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { FaqItem as FaqItemType } from "@/lib/faq-data";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FaqItemProps {
  item: FaqItemType;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  animationDelay?: number;
}

export function FaqItem({ item, isOpen, onToggle, className, animationDelay }: FaqItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const itemRef = React.useRef<HTMLDivElement>(null);

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

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => {
      if (itemRef.current) {
        observer.unobserve(itemRef.current);
      }
    };
  }, [animationDelay]);

  return (
    <div 
      ref={itemRef}
      className={cn(
        "mb-4 transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
        className
      )}
    >
      <div 
        className="bg-[hsl(var(--primary)/0.1)] rounded-lg p-4 cursor-pointer flex justify-between items-center"
        onClick={onToggle}
      >
        <h3 className="text-lg font-semibold">{item.question}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </div>
      <div 
        className={cn(
          "bg-white px-4 pt-2 pb-4 rounded-b-lg transition-all duration-300 overflow-hidden",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <p className="text-gray-600">{item.answer}</p>
      </div>
    </div>
  );
}
