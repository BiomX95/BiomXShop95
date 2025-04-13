import { createContext, ReactNode, useContext, useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import TelegramUtils from "@/lib/telegram-utils";

// Расширенный интерфейс для пользователя с дополнительными данными для Telegram
interface GameUser {
  gameId: string;
  telegramChatId?: string;
  lastLogin?: Date;
}

// Расширенный контекст аутентификации
type AuthContextType = {
  user: GameUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (gameId: string, telegramChatId?: string) => void;
  logout: () => void;
  updateGameId: (gameId: string) => void;
  gameIdHistory: string[];
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<GameUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [gameIdHistory, setGameIdHistory] = useState<string[]>([]);
  
  // Проверяем, запущено ли приложение в Telegram
  const [isInTelegram, setIsInTelegram] = useState<boolean>(
    typeof window !== 'undefined' && 
    !!window.Telegram?.WebApp || 
    new URLSearchParams(window.location.search).get('telegram') === 'true'
  );
  
  const [chatId, setChatId] = useState<string | null>(
    new URLSearchParams(window.location.search).get('tg_chat')
  );

  // Функция для загрузки истории ID игры
  const loadGameIdHistory = useCallback(() => {
    try {
      const historyStr = localStorage.getItem("gameIdHistory");
      if (historyStr) {
        const history = JSON.parse(historyStr);
        if (Array.isArray(history)) {
          setGameIdHistory(history);
        }
      }
    } catch (error) {
      console.error("AuthProvider: ошибка при загрузке истории ID:", error);
    }
  }, []);

  // Функция для сохранения ID в историю
  const saveToHistory = useCallback((gameId: string) => {
    try {
      // Загружаем текущую историю
      const historyStr = localStorage.getItem("gameIdHistory");
      const history = historyStr ? JSON.parse(historyStr) : [];
      
      // Добавляем новый ID в начало и удаляем дубликаты
      const newHistory = [gameId, ...history.filter((id: string) => id !== gameId)].slice(0, 5);
      
      // Сохраняем обновленную историю
      localStorage.setItem("gameIdHistory", JSON.stringify(newHistory));
      setGameIdHistory(newHistory);
      
      console.log("AuthProvider: сохранен gameId в историю:", gameId);
    } catch (error) {
      console.error("AuthProvider: ошибка при сохранении истории:", error);
    }
  }, []);

  // Функция для синхронизации с Telegram
  const syncWithTelegram = useCallback((gameId: string) => {
    if (!isInTelegram) return;
    
    console.log("AuthProvider: синхронизация gameId с Telegram:", gameId);
    // В реальном приложении здесь был бы код для синхронизации с Telegram API
  }, [isInTelegram]);

  // Инициализация на монтировании компонента
  useEffect(() => {
    console.log("AuthProvider: инициализация");
    
    try {
      // Загружаем историю ID
      loadGameIdHistory();
      
      // Получаем параметры из URL и сохраненные данные
      const urlParams = new URLSearchParams(window.location.search);
      const gameIdFromUrl = urlParams.get('game_id');
      const storedGameId = localStorage.getItem("gameId");
      const tgChatFromUrl = urlParams.get('tg_chat');
      
      let finalGameId: string | null = null;
      let finalChatId: string | null = null;
      
      // Определяем приоритеты: URL -> localStorage -> тестовый ID для Telegram
      if (gameIdFromUrl) {
        console.log("AuthProvider: обнаружен gameId в URL:", gameIdFromUrl);
        finalGameId = gameIdFromUrl;
      } else if (storedGameId) {
        console.log("AuthProvider: использую сохраненный gameId:", storedGameId);
        finalGameId = storedGameId;
      } else if (isInTelegram) {
        // Для Telegram контекста используем тестовый ID, если ничего не найдено
        finalGameId = '123456789';
        console.log("AuthProvider: устанавливаем тестовый gameId для Telegram:", finalGameId);
      }
      
      // Определяем chat_id: параметр URL -> контекст Telegram
      if (tgChatFromUrl) {
        console.log("AuthProvider: обнаружен tg_chat в URL:", tgChatFromUrl);
        finalChatId = tgChatFromUrl;
        setChatId(tgChatFromUrl);
      }
      
      // Если у нас есть finalGameId, выполняем вход
      if (finalGameId) {
        // Сохраняем ID в localStorage
        localStorage.setItem("gameId", finalGameId);
        
        // Создаем объект пользователя с возможным chatId
        const userObj: GameUser = { 
          gameId: finalGameId,
          lastLogin: new Date()
        };
        
        if (finalChatId) {
          userObj.telegramChatId = finalChatId;
        }
        
        // Устанавливаем пользователя
        setUser(userObj);
        
        // Сохраняем ID в историю
        saveToHistory(finalGameId);
        
        // Обновляем параметр game_id в URL, если его нет или он отличается
        if (!gameIdFromUrl || gameIdFromUrl !== finalGameId) {
          urlParams.set('game_id', finalGameId);
          const newUrl = `${window.location.pathname}?${urlParams.toString()}${window.location.hash}`;
          
          try {
            window.history.replaceState({}, '', newUrl);
            console.log("AuthProvider: обновлен URL с gameId =", finalGameId);
          } catch (e) {
            console.error("AuthProvider: ошибка при обновлении URL", e);
          }
        }
        
        // Обработка для Telegram WebApp
        if (isInTelegram) {
          syncWithTelegram(finalGameId);
        }
      } else {
        console.log("AuthProvider: gameId не найден ни в URL, ни в localStorage");
      }
    } catch (error) {
      console.error("AuthProvider: ошибка при инициализации:", error);
    } finally {
      // В любом случае завершаем загрузку
      setIsLoading(false);
    }
    
  }, [isInTelegram, loadGameIdHistory, saveToHistory, syncWithTelegram, chatId]);

  // Функция для входа в систему
  const loginHandler = useCallback((gameId: string, telegramChatId?: string) => {
    try {
      // Проверка на валидный ID игры (простая проверка)
      if (!gameId || gameId.trim() === '') {
        throw new Error("ID игры не может быть пустым");
      }
      
      // Сохраняем ID в localStorage
      localStorage.setItem("gameId", gameId);
      
      // Создаем объект пользователя
      const userObj: GameUser = { 
        gameId,
        lastLogin: new Date()
      };
      
      // Добавляем ID чата Telegram, если он есть
      if (telegramChatId || chatId) {
        userObj.telegramChatId = telegramChatId || chatId || undefined;
      }
      
      // Устанавливаем пользователя
      setUser(userObj);
      
      // Сохраняем ID в историю
      saveToHistory(gameId);
      
      // Обновляем URL с новым ID
      try {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('game_id', gameId);
        const newUrl = `${window.location.pathname}?${urlParams.toString()}${window.location.hash}`;
        window.history.replaceState({}, '', newUrl);
      } catch (e) {
        console.error("AuthProvider: ошибка при обновлении URL после входа", e);
      }
      
      // Обработка для Telegram WebApp
      if (isInTelegram) {
        syncWithTelegram(gameId);
      }
      
      // Показываем уведомление об успешном входе
      toast({
        title: "Успешный вход",
        description: `Вы вошли с ID: ${gameId}`,
      });
      
      // Если это Telegram, используем вибрацию для подтверждения
      if (isInTelegram) {
        TelegramUtils.vibrate('success');
      }
      
    } catch (err) {
      console.error("AuthProvider: ошибка при входе:", err);
      
      toast({
        title: "Ошибка входа",
        description: err instanceof Error ? err.message : "Не удалось выполнить вход. Пожалуйста, попробуйте позже.",
        variant: "destructive",
      });
      
      // Если это Telegram, используем вибрацию для ошибки
      if (isInTelegram) {
        TelegramUtils.vibrate('error');
      }
    }
  }, [toast, chatId, isInTelegram, saveToHistory, syncWithTelegram]);

  // Функция для обновления ID игры (без полного выхода)
  const updateGameId = useCallback((gameId: string) => {
    try {
      // Проверка валидности ID
      if (!gameId || gameId.trim() === '') {
        throw new Error("ID игры не может быть пустым");
      }
      
      // Сохраняем новый ID в localStorage
      localStorage.setItem("gameId", gameId);
      
      // Обновляем пользователя с сохранением других данных
      setUser(prevUser => ({
        ...prevUser!,
        gameId,
        lastLogin: new Date()
      }));
      
      // Сохраняем ID в историю
      saveToHistory(gameId);
      
      // Обновляем URL с новым ID
      try {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('game_id', gameId);
        const newUrl = `${window.location.pathname}?${urlParams.toString()}${window.location.hash}`;
        window.history.replaceState({}, '', newUrl);
      } catch (e) {
        console.error("AuthProvider: ошибка при обновлении URL после смены ID", e);
      }
      
      // Обработка для Telegram WebApp
      if (isInTelegram) {
        syncWithTelegram(gameId);
      }
      
      toast({
        title: "ID обновлен",
        description: `Новый ID игры: ${gameId}`,
      });
      
    } catch (err) {
      console.error("AuthProvider: ошибка при обновлении gameId:", err);
      
      toast({
        title: "Ошибка обновления ID",
        description: err instanceof Error ? err.message : "Не удалось обновить ID игры. Пожалуйста, попробуйте позже.",
        variant: "destructive",
      });
    }
  }, [toast, isInTelegram, saveToHistory, syncWithTelegram]);

  // Функция выхода
  const logout = useCallback(() => {
    // Удаляем только gameId, сохраняем историю
    localStorage.removeItem("gameId");
    
    // Сбрасываем пользователя
    setUser(null);
    
    // Возвращаемся на страницу авторизации
    setLocation("/auth");
    
    toast({
      title: "Выход",
      description: "Вы успешно вышли из системы",
    });
    
  }, [toast, setLocation]);

  // Формируем контекст аутентификации
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginHandler,
    logout,
    updateGameId,
    gameIdHistory
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Хук для использования контекста аутентификации
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Хук для проверки, авторизован ли пользователь
export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

// Хук для получения текущего ID игры
export function useGameId() {
  const { user } = useAuth();
  return user?.gameId;
}

// Хук для получения истории ID игры
export function useGameIdHistory() {
  const { gameIdHistory } = useAuth();
  return gameIdHistory;
}