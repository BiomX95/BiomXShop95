import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import MinimalHome from "@/pages/minimal-home";
import PaymentSimulator from "@/pages/payments/payment-simulator";
import PromoCodesPage from "@/pages/promo-codes-page";
import PaymentAdmin from "@/pages/admin/payment-admin";
import TelegramTest from "@/pages/admin/telegram-test";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { ChatButton } from "@/components/chat/ChatButton";
import { AdminChat } from "@/components/chat/AdminChat";

// Обработка аварийного завершения WebApp
window.addEventListener('unhandledrejection', (event) => {
  console.error('Необработанное отклонение Promise:', event.reason);
  
  // Вывод более подробной информации
  if (event.reason && event.reason.stack) {
    console.error('Стек ошибки:', event.reason.stack);
  }
  
  // Сохраняем ошибку в sessionStorage для диагностики
  try {
    sessionStorage.setItem('lastError', JSON.stringify({
      message: event.reason ? event.reason.message : 'Неизвестная ошибка',
      timestamp: new Date().toISOString()
    }));
  } catch (e) {
    console.error('Ошибка при сохранении информации об ошибке:', e);
  }
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth">
        {/* Перенаправляем со страницы auth на главную, где теперь есть форма входа */}
        <Redirect to="/" />
      </Route>
      <Route path="/telegram-web-app">
        {/* Специальный маршрут для Telegram Web App */}
        <Redirect to="/" />
      </Route>
      <Route path="/simulate-payment" component={PaymentSimulator} />
      <Route path="/admin/payments" component={PaymentAdmin} />
      <Route path="/admin/telegram-test" component={TelegramTest} />
      <Route path="/admin/chat" component={() => <div className="container mx-auto py-8"><AdminChat /></div>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Проверяем, является ли текущий URL админским маршрутом
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        {/* Добавляем кнопку чата на все страницы, кроме админских */}
        {!isAdminRoute && <ChatButton />}
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
