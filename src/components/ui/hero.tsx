import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroProps {
  className?: string;
}

export function Hero({ className }: HeroProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={cn(
      "bg-gradient-to-r from-primary to-[hsl(var(--primary)/0.8)] text-white",
      className
    )}>
      <div className="container mx-auto px-4 py-20 md:py-32 flex flex-col md:flex-row items-center">
        <div className={cn(
          "md:w-1/2 mb-10 md:mb-0 md:pr-10 transition-all duration-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}>
          <h1 className="text-4xl md:text-5xl font-bold font-sans mb-6 leading-tight">
            Умный Telegram бот для вашего бизнеса
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Автоматизируйте общение с клиентами, отвечайте на вопросы и собирайте данные 24/7 с помощью нашего интеллектуального бота.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              className="bg-white text-primary hover:bg-white/90 hover:text-primary/90 transition-all hover:translate-y-[-2px] hover:shadow-lg rounded-full px-8"
              size="lg"
              asChild
            >
              <a href="https://t.me/your_bot_name" target="_blank" rel="noopener noreferrer">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2s-.16-.05-.23-.03c-.1.03-1.77 1.13-5 3.28-.47.32-.9.48-1.29.47-.42-.01-1.23-.24-1.83-.44-.74-.24-1.33-.37-1.28-.79.03-.22.26-.43.72-.66 2.82-1.23 4.7-2.04 5.65-2.43 2.69-1.12 3.25-1.31 3.61-1.31.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
                Запустить бота
              </a>
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-primary rounded-full px-8"
              size="lg"
              asChild
            >
              <a href="#features">
                Узнать больше
              </a>
            </Button>
          </div>
        </div>

        <div className={cn(
          "md:w-1/2 transition-all duration-700", 
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}>
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md mx-auto">
            <div className="bg-gradient-to-r from-primary to-[hsl(var(--primary)/0.8)] px-4 py-3 flex items-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2s-.16-.05-.23-.03c-.1.03-1.77 1.13-5 3.28-.47.32-.9.48-1.29.47-.42-.01-1.23-.24-1.83-.44-.74-.24-1.33-.37-1.28-.79.03-.22.26-.43.72-.66 2.82-1.23 4.7-2.04 5.65-2.43 2.69-1.12 3.25-1.31 3.61-1.31.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
              <p className="ml-2 text-white font-medium">ТелеБот</p>
            </div>
            <div className="bg-gray-100 p-4">
              <div className="bg-white rounded-lg p-3 mb-3 text-right">
                <p className="text-sm">Привет! Я ТелеБот. Чем могу помочь?</p>
              </div>
              <div className="bg-[hsl(var(--primary)/0.1)] rounded-lg p-3 mb-3">
                <p className="text-sm">Здравствуйте! Хочу узнать о ваших услугах</p>
              </div>
              <div className="bg-white rounded-lg p-3 mb-3 text-right">
                <p className="text-sm">Конечно! Мы предлагаем:</p>
                <ul className="text-left mt-2 space-y-1 text-sm">
                  <li>✅ Автоматические ответы на часто задаваемые вопросы</li>
                  <li>✅ Прием заказов через Telegram</li>
                  <li>✅ Интеграция с CRM-системами</li>
                  <li>✅ Персонализированные уведомления</li>
                </ul>
                <p className="text-sm mt-2">Что именно вас интересует?</p>
              </div>
            </div>
            <div className="px-4 py-3 bg-white flex">
              <input 
                type="text" 
                placeholder="Напишите сообщение..." 
                className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button variant="ghost" className="ml-2 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
