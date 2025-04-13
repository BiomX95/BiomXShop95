import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Button } from "@/components/ui/button";
import { Settings, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HowItWorks() {
  const titleAnimation = useScrollAnimation();
  const step1Animation = useScrollAnimation({ delay: 200 });
  const step2Animation = useScrollAnimation({ delay: 400 });
  const step3Animation = useScrollAnimation({ delay: 600 });

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div 
          ref={titleAnimation.ref as React.RefObject<HTMLDivElement>}
          className={cn(
            "text-center mb-16 transition-all duration-700",
            titleAnimation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Как это работает</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Запустить и настроить бота очень просто — всего несколько шагов
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Шаг 1 */}
          <div 
            ref={step1Animation.ref as React.RefObject<HTMLDivElement>}
            className={cn(
              "flex flex-col md:flex-row items-center mb-16 transition-all duration-700",
              step1Animation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}
          >
            <div className="md:w-1/3 mb-6 md:mb-0">
              <div className="w-24 h-24 rounded-full bg-primary text-white text-4xl font-bold flex items-center justify-center mx-auto">
                1
              </div>
            </div>
            <div className="md:w-2/3 md:pl-8">
              <h3 className="text-2xl font-bold mb-4">Запустите бота в Telegram</h3>
              <p className="text-lg text-gray-600 mb-4">
                Найдите нашего бота в Telegram по имени @YourBotName или нажмите на кнопку "Запустить бота" на нашем сайте.
              </p>
              <Button 
                className="bg-primary text-white hover:bg-primary/90 transition-all hover:translate-y-[-2px] hover:shadow-lg rounded-full"
                asChild
              >
                <a href="https://t.me/your_bot_name" target="_blank" rel="noopener noreferrer">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2s-.16-.05-.23-.03c-.1.03-1.77 1.13-5 3.28-.47.32-.9.48-1.29.47-.42-.01-1.23-.24-1.83-.44-.74-.24-1.33-.37-1.28-.79.03-.22.26-.43.72-.66 2.82-1.23 4.7-2.04 5.65-2.43 2.69-1.12 3.25-1.31 3.61-1.31.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                  Запустить бота
                </a>
              </Button>
            </div>
          </div>

          {/* Шаг 2 */}
          <div 
            ref={step2Animation.ref as React.RefObject<HTMLDivElement>}
            className={cn(
              "flex flex-col md:flex-row items-center mb-16 transition-all duration-700",
              step2Animation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}
          >
            <div className="md:w-1/3 mb-6 md:mb-0 md:order-2">
              <div className="w-24 h-24 rounded-full bg-primary text-white text-4xl font-bold flex items-center justify-center mx-auto">
                2
              </div>
            </div>
            <div className="md:w-2/3 md:pr-8 md:order-1">
              <h3 className="text-2xl font-bold mb-4">Настройте бота под свои нужды</h3>
              <p className="text-lg text-gray-600 mb-4">
                В панели администратора вы можете настроить ответы на вопросы, загрузить каталог товаров и настроить интеграции с вашими системами.
              </p>
              <Button 
                className="bg-primary text-white hover:bg-primary/90 transition-all hover:translate-y-[-2px] hover:shadow-lg rounded-full"
              >
                <Settings className="w-5 h-5 mr-2" />
                Перейти в настройки
              </Button>
            </div>
          </div>

          {/* Шаг 3 */}
          <div 
            ref={step3Animation.ref as React.RefObject<HTMLDivElement>}
            className={cn(
              "flex flex-col md:flex-row items-center transition-all duration-700",
              step3Animation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}
          >
            <div className="md:w-1/3 mb-6 md:mb-0">
              <div className="w-24 h-24 rounded-full bg-primary text-white text-4xl font-bold flex items-center justify-center mx-auto">
                3
              </div>
            </div>
            <div className="md:w-2/3 md:pl-8">
              <h3 className="text-2xl font-bold mb-4">Развивайте свой бизнес</h3>
              <p className="text-lg text-gray-600 mb-4">
                Бот начинает работать сразу после настройки. Следите за аналитикой, улучшайте бота и развивайте свой бизнес!
              </p>
              <Button 
                className="bg-primary text-white hover:bg-primary/90 transition-all hover:translate-y-[-2px] hover:shadow-lg rounded-full"
                asChild
              >
                <a href="#pricing">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Начать сейчас
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
