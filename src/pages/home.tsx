import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { DiamondCatalog } from "@/components/diamond-catalog/DiamondCatalog";
import { PromoCodeForm } from "@/components/PromoCodeForm";
import { ReviewsSection } from "@/components/ReviewsSection";
import { PaymentMethodSelector } from "@/components/PaymentMethodSelector";
import { CheckoutForm } from "@/components/CheckoutForm";
import { OrderStatusCard } from "@/components/OrderStatusCard";
import LoginForm from "@/components/LoginForm";
import { DiamondIconShiny } from "@/components/icons/DiamondIcon";
import { Button } from "@/components/ui/button";
import { DiamondPackage, PromoCode, PaymentMethod } from "@shared/schema";
import { LogOut, LogIn, CreditCard, Tag, MessageSquare, User } from "lucide-react";
import TelegramUtils from "@/lib/telegram-utils";
import { FaWhatsapp, FaTelegram, FaVk, FaInstagram } from "react-icons/fa";
import bannerImg from "../assets/IMG_5663.jpeg";
import managerAvatar from "../assets/images/manager-avatar.jpeg";

export default function Home() {
  const { user, logout, login } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPackage, setSelectedPackage] = useState<DiamondPackage | null>(null);
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCode | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<"catalog" | "checkout" | "status">("catalog");
  const isInTelegram = TelegramUtils.isInTelegram();

  // Настройка взаимодействия с Telegram
  useEffect(() => {    
    // Если приложение запущено в Telegram, настраиваем главную кнопку
    if (isInTelegram) {
      TelegramUtils.setupMainButton("Выбрать пакет алмазов", () => {
        const catalogSection = document.querySelector('.diamond-catalog');
        if (catalogSection) {
          catalogSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }, [isInTelegram]);

  const handleSelectPackage = (pkg: DiamondPackage) => {
    try {
      // Сохраняем выбранный пакет в localStorage для восстановления в случае сбоя
      localStorage.setItem('selectedPackage', JSON.stringify(pkg));
      
      // Если пользователь не авторизован, показываем форму входа
      if (!user) {
        if (isInTelegram) {
          // Если в Telegram, показываем сообщение с просьбой войти
          TelegramUtils.showAlert("Пожалуйста, введите свой игровой ID для продолжения покупки.");
        }
        // Прокручиваем к форме входа
        const loginSection = document.getElementById('login-section');
        if (loginSection) {
          loginSection.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }
      
      // Обновляем состояние приложения при выборе пакета
      setSelectedPackage(pkg);
      console.log("Выбран пакет:", pkg.name, pkg.id);
      
      // В любом случае (Telegram или браузер) сразу переходим к оформлению заказа
      setActiveSection("checkout");
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      // Добавляем вибрацию и обновляем кнопку только если это в Telegram
      if (isInTelegram) {
        // Попытка вибрации
        try {
          TelegramUtils.vibrate("medium");
        } catch (vibrateError) {
          console.warn("Ошибка при вызове вибрации:", vibrateError);
        }
        
        // Обновляем кнопку для возврата в каталог с задержкой
        setTimeout(() => {
          try {
            TelegramUtils.setupMainButton("Вернуться в каталог", handleBackToCatalog);
          } catch (buttonError) {
            console.warn("Ошибка при настройке кнопки Telegram:", buttonError);
          }
        }, 500);
      }
    } catch (error) {
      console.error("Ошибка при выборе пакета:", error);
      alert("Произошла ошибка при выборе пакета. Пожалуйста, попробуйте еще раз.");
    }
  };

  const handleApplyPromoCode = (promoCode: PromoCode) => {
    setAppliedPromoCode(promoCode);
  };

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const handlePaymentSuccess = (id: number) => {
    setPaymentId(id);
    setActiveSection("status");
    
    if (isInTelegram) {
      // Уведомление об успешной оплате в Telegram
      TelegramUtils.vibrate("success");
      TelegramUtils.showAlert("Оплата прошла успешно! Алмазы будут доставлены в течение нескольких минут.");
      
      // Обновляем главную кнопку
      TelegramUtils.setupMainButton("Вернуться в каталог", handleBackToCatalog);
    }
  };

  const handleBackToCatalog = () => {
    setSelectedPackage(null);
    setAppliedPromoCode(null);
    setSelectedPaymentMethod(null);
    setPaymentId(null);
    setActiveSection("catalog");
    
    if (isInTelegram) {
      // Возвращаем первоначальную кнопку для выбора пакета алмазов
      TelegramUtils.setupMainButton("Выбрать пакет алмазов", () => {
        const catalogSection = document.querySelector('.diamond-catalog');
        if (catalogSection) {
          catalogSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  };

  const handleLogout = () => {
    logout();
    // Остаемся на домашней странице после выхода
    setActiveSection("catalog");
  };

  // Компоненты разделов
  const DiamondCatalogSection = () => (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 flex items-center">
          <DiamondIconShiny className="mr-2 h-6 w-6" />
          Каталог алмазов и ваучеров
        </h2>
        <DiamondCatalog onSelectPackage={handleSelectPackage} />
      </div>
    </section>
  );

  const PromoAndPaymentSection = () => (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-red-500" />
              Способы оплаты
            </h2>
            <PaymentMethodSelector 
              onSelect={handleSelectPaymentMethod}
              selectedId={selectedPaymentMethod?.id}
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Tag className="mr-2 h-5 w-5 text-red-500" />
              Промокод
            </h2>
            <PromoCodeForm onPromoApplied={handleApplyPromoCode} />
          </div>
        </div>
      </div>
    </section>
  );

  const ReviewsSection_UI = () => (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 flex items-center">
          <MessageSquare className="mr-2 h-6 w-6 text-red-500" />
          Отзывы покупателей
        </h2>
        <ReviewsSection />
      </div>
    </section>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Хедер */}
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-red-600">
              <a href="https://free-fire-diamonds.replit.app" target="_blank" rel="noopener noreferrer" className="hover:text-red-700 transition-colors">
                BiomX_Shop
              </a>
            </h1>
            {user && (
              <div className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full">
                ID: {user.gameId}
              </div>
            )}
          </div>
          {user && (
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          )}
        </div>
      </header>

      {/* Основное содержимое */}
      <main className="flex-1">
        {/* Изображение без наложения */}
        <div className="w-full max-w-4xl mx-auto px-4 py-4">
          <div className="rounded-lg shadow-lg overflow-hidden">
            <img 
              src={bannerImg} 
              alt="Free Fire"
              className="w-full max-h-96 object-scale-down" 
            />
          </div>
        </div>
        
        {/* Остальное содержимое */}
        <div className="py-16">
          {activeSection === "checkout" && selectedPackage && (
            <div className="container mx-auto px-4">
              <CheckoutForm
                selectedPackage={selectedPackage}
                selectedPaymentMethod={selectedPaymentMethod || undefined}
                appliedPromoCode={appliedPromoCode || undefined}
                onSuccess={handlePaymentSuccess}
                onCancel={handleBackToCatalog}
              />
            </div>
          )}
          
          {activeSection === "status" && paymentId && (
            <div className="container mx-auto px-4">
              <OrderStatusCard
                paymentId={paymentId}
                onClose={handleBackToCatalog}
              />
            </div>
          )}
          
          {activeSection === "catalog" && (
            <div className="space-y-16">
              {/* Раздел входа в систему (если пользователь не авторизован) */}
              {!user && (
                <section id="login-section" className="py-12 bg-gray-50">
                  <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-1">
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                          <User className="mr-2 h-5 w-5 text-red-500" />
                          Войти в магазин
                        </h2>
                        <LoginForm className="w-full" />
                      </div>
                      <div className="md:col-span-2 flex items-center">
                        <div className="bg-white p-6 rounded-lg shadow-md w-full">
                          <h3 className="text-xl font-bold mb-4">Как это работает?</h3>
                          <ol className="space-y-4 text-gray-700">
                            <li className="flex">
                              <span className="bg-red-100 text-red-600 rounded-full h-6 w-6 flex items-center justify-center font-bold mr-3">1</span>
                              <span>Введите ваш игровой ID из Free Fire</span>
                            </li>
                            <li className="flex">
                              <span className="bg-red-100 text-red-600 rounded-full h-6 w-6 flex items-center justify-center font-bold mr-3">2</span>
                              <span>Выберите пакет алмазов или ваучер из каталога</span>
                            </li>
                            <li className="flex">
                              <span className="bg-red-100 text-red-600 rounded-full h-6 w-6 flex items-center justify-center font-bold mr-3">3</span>
                              <span>Оплатите покупку удобным способом</span>
                            </li>
                            <li className="flex">
                              <span className="bg-red-100 text-red-600 rounded-full h-6 w-6 flex items-center justify-center font-bold mr-3">4</span>
                              <span>Получите алмазы моментально на свой аккаунт</span>
                            </li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}
              <DiamondCatalogSection />
              <PromoAndPaymentSection />
              <ReviewsSection_UI />
            </div>
          )}
        </div>
      </main>

      {/* Футер */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold mb-2">
                <a href="https://free-fire-diamonds.replit.app" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">
                  BiomX_Shop
                </a>
              </h2>
              <p className="text-gray-400 text-sm">
                Официальный магазин алмазов Free Fire. Быстрая и безопасная доставка.
              </p>
              
              {/* Социальные сети */}
              <div className="flex items-center space-x-4 mt-4">
                <a 
                  href="https://wa.me/+79659661395" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-500 transition-all transform hover:scale-110"
                  title="WhatsApp"
                >
                  <FaWhatsapp size={22} />
                </a>
                <a 
                  href="https://t.me/BiomX_Garant" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-500 transition-all transform hover:scale-110"
                  title="Telegram"
                >
                  <FaTelegram size={22} />
                </a>
                <a 
                  href="https://instagram.com/Biom_X" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pink-500 transition-all transform hover:scale-110"
                  title="Instagram"
                >
                  <FaInstagram size={22} />
                </a>
                <a 
                  href="https://vk.com/biomxxx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-all transform hover:scale-110"
                  title="ВКонтакте"
                >
                  <FaVk size={22} />
                </a>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} <a href="https://free-fire-diamonds.replit.app" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">BiomX_Shop</a>. Все права защищены.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Free Fire является зарегистрированной торговой маркой Garena
              </p>
            </div>
          </div>
          
          {/* Менеджер (упрощенная версия) */}
          <div className="mt-6 pt-5 border-t border-gray-600">
            <div className="bg-gray-800 rounded-lg p-4 flex flex-col sm:flex-row items-center">
              <div className="flex items-center mb-4 sm:mb-0 sm:mr-6">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                  <img 
                    src={managerAvatar} 
                    alt="Тимерлан" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-white font-bold">Тимерлан</h3>
                  <p className="text-gray-300 text-sm">Менеджер-помощник</p>
                </div>
              </div>
              <a 
                href="https://wa.me/+79899282649" 
                target="_blank"
                rel="noopener noreferrer" 
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-full flex items-center"
              >
                <FaWhatsapp className="mr-2" />
                <span>Связаться в WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}