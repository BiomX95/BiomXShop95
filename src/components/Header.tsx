import { useState, useEffect } from "react";
import { useMobileMenu } from "@/hooks/use-mobile-menu";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Menu, Ticket } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTelegram } from "@/hooks/use-telegram";

export default function Header() {
  const { isOpen, toggleMenu } = useMobileMenu();
  const { user, logout } = useAuth();
  const { isInTelegram } = useTelegram();
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [shopName, setShopName] = useState('ТелеБот');
  
  // Получаем название магазина из URL (параметр shop)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shopParam = urlParams.get('shop');
    if (shopParam) {
      setShopName(shopParam);
      // Если открыто в Telegram, настраиваем заголовок страницы
      if (isInTelegram && window.Telegram?.WebApp) {
        window.Telegram.WebApp.setHeaderColor('secondary_bg_color');
      }
    }
  }, [isInTelegram]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${isScrolled ? "shadow-md" : ""}`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2s-.16-.05-.23-.03c-.1.03-1.77 1.13-5 3.28-.47.32-.9.48-1.29.47-.42-.01-1.23-.24-1.83-.44-.74-.24-1.33-.37-1.28-.79.03-.22.26-.43.72-.66 2.82-1.23 4.7-2.04 5.65-2.43 2.69-1.12 3.25-1.31 3.61-1.31.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
          </svg>
          <span className="ml-2 text-2xl font-bold font-sans text-primary">{shopName}</span>
        </Link>

        {/* Десктопная навигация */}
        <nav className="hidden md:flex items-center space-x-8 text-lg">
          <a href="#features" className="hover:text-primary transition-colors">Возможности</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">Как это работает</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Цены</a>
          <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          <a href="#contact" className="hover:text-primary transition-colors">Контакты</a>
          
          {user && (
            <>
              <Link href="/promo-codes">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Ticket className="h-4 w-4" />
                  Промокоды
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={logout}
              >
                Выход
              </Button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {/* Промокоды и выход для мобильной версии */}
          {user && (
            <div className="md:hidden flex gap-2">
              <Link href="/promo-codes">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Ticket className="h-4 w-4" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={logout}
              >
                Выход
              </Button>
            </div>
          )}
          
          {/* Мобильное меню кнопка */}
          <Button 
            id="menu-toggle"
            variant="ghost" 
            className="md:hidden text-primary p-1" 
            onClick={toggleMenu}
          >
            <Menu className="h-8 w-8" />
          </Button>
        </div>
      </div>

      {/* Мобильное меню */}
      <div 
        id="mobile-menu" 
        className={`md:hidden bg-white shadow-md transition-all duration-300 ease-in-out ${isOpen ? "max-h-96" : "max-h-0 overflow-hidden"}`}
      >
        <div className="px-4 pt-2 pb-4 space-y-3">
          <a href="#features" className="block py-2 hover:bg-[hsl(var(--primary)/0.1)] px-3 rounded">Возможности</a>
          <a href="#how-it-works" className="block py-2 hover:bg-[hsl(var(--primary)/0.1)] px-3 rounded">Как это работает</a>
          <a href="#pricing" className="block py-2 hover:bg-[hsl(var(--primary)/0.1)] px-3 rounded">Цены</a>
          <a href="#faq" className="block py-2 hover:bg-[hsl(var(--primary)/0.1)] px-3 rounded">FAQ</a>
          <a href="#contact" className="block py-2 hover:bg-[hsl(var(--primary)/0.1)] px-3 rounded">Контакты</a>
          
          {user && (
            <>
              <Link href="/promo-codes" className="flex items-center py-2 px-3 rounded hover:bg-[hsl(var(--primary)/0.1)]">
                <Ticket className="h-4 w-4 mr-2" />
                Управление промокодами
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
