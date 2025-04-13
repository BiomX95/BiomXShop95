import { createContext, useContext, useEffect, ReactNode, useState, useCallback } from 'react';
import TelegramIntegration from '@/lib/telegram-integration';

// Определение интерфейса для пользователя Telegram
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

// Расширенный контекст Telegram с информацией о URL и чате
interface TelegramContextType {
  isInTelegram: boolean;
  isInitialized: boolean;
  user: TelegramUser | null;
  chatId: string | null;
  gameId: string | null;
  setupMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  close: () => void;
  vibrate: (type: 'success' | 'error' | 'warning' | 'light' | 'medium' | 'heavy') => void;
  setBackButton: (visible: boolean, callback?: () => void) => void;
  updateTelegramGameId: (gameId: string) => void;
}

const TelegramContext = createContext<TelegramContextType | null>(null);

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [isInTelegram, setIsInTelegram] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);

  // Инициализация Telegram WebApp и получение всех необходимых данных
  useEffect(() => {
    console.log('TelegramProvider: инициализация');
    
    try {
      // Проверяем наличие Telegram WebApp через API или параметр URL
      const inTelegram = TelegramIntegration.isTelegramWebApp();
      const inTelegramByParam = new URLSearchParams(window.location.search).get('telegram') === 'true';
      
      console.log('TelegramProvider: приложение в Telegram?', inTelegram || inTelegramByParam);
      setIsInTelegram(inTelegram || inTelegramByParam);
      
      // Если приложение в Telegram или эмулирует его
      if (inTelegram || inTelegramByParam) {
        // Инициализируем Telegram WebApp API
        console.log('TelegramProvider: инициализация WebApp');
        TelegramIntegration.initTelegramWebApp();
        
        // Получаем данные пользователя Telegram
        const telegramUser = TelegramIntegration.getTelegramUser();
        if (telegramUser) {
          console.log('TelegramProvider: пользователь Telegram', telegramUser);
          setUser(telegramUser);
          
          // Если есть ID пользователя, устанавливаем его как chatId
          if (telegramUser.id) {
            setChatId(telegramUser.id.toString());
            console.log('TelegramProvider: установлен chatId из данных пользователя =', telegramUser.id);
          }
        } else {
          console.log('TelegramProvider: пользователь Telegram не найден');
          
          // Пытаемся получить chatId из URL
          const tgChatParam = new URLSearchParams(window.location.search).get('tg_chat');
          if (tgChatParam) {
            console.log('TelegramProvider: установлен chatId из URL =', tgChatParam);
            setChatId(tgChatParam);
          }
        }
        
        // Обрабатываем параметр game_id из URL или localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const gameIdFromUrl = urlParams.get('game_id');
        const storedGameId = localStorage.getItem('gameId');
        
        if (gameIdFromUrl) {
          console.log('TelegramProvider: использую game_id из URL =', gameIdFromUrl);
          setGameId(gameIdFromUrl);
          localStorage.setItem('gameId', gameIdFromUrl);
        } else if (storedGameId) {
          console.log('TelegramProvider: использую сохраненный gameId =', storedGameId);
          setGameId(storedGameId);
          
          // Добавляем gameId в URL, если его там нет
          if (!urlParams.has('game_id') && storedGameId) {
            urlParams.set('game_id', storedGameId);
            const newUrl = `${window.location.pathname}?${urlParams.toString()}${window.location.hash}`;
            
            try {
              window.history.replaceState({}, '', newUrl);
              console.log('TelegramProvider: добавлен gameId в URL =', storedGameId);
            } catch (e) {
              console.error('TelegramProvider: ошибка при обновлении URL', e);
            }
          }
        } else {
          // Если нет game_id ни в URL, ни в localStorage, используем тестовый ID для Telegram
          const testGameId = '123456789';
          console.log('TelegramProvider: устанавливаю тестовый gameId для отладки =', testGameId);
          setGameId(testGameId);
          localStorage.setItem('gameId', testGameId);
          
          // Добавляем тестовый gameId в URL
          urlParams.set('game_id', testGameId);
          const newUrl = `${window.location.pathname}?${urlParams.toString()}${window.location.hash}`;
          
          try {
            window.history.replaceState({}, '', newUrl);
            console.log('TelegramProvider: добавлен тестовый gameId в URL');
          } catch (e) {
            console.error('TelegramProvider: ошибка при обновлении URL', e);
          }
        }
        
        // Помечаем, что инициализация успешно завершена
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('TelegramProvider: ошибка при инициализации', error);
      
      // В случае ошибки пытаемся восстановиться
      try {
        // Получаем сохраненный gameId из localStorage как запасной вариант
        const storedGameId = localStorage.getItem('gameId');
        if (storedGameId) {
          console.log('TelegramProvider: восстановление с помощью сохраненного gameId =', storedGameId);
          setGameId(storedGameId);
        } else {
          // Устанавливаем тестовый ID как последнее средство
          const testGameId = '123456789';
          console.log('TelegramProvider: аварийная установка тестового gameId =', testGameId);
          setGameId(testGameId);
          localStorage.setItem('gameId', testGameId);
        }
        
        // Даже при ошибке помечаем инициализацию как завершенную
        setIsInitialized(true);
      } catch (e) {
        console.error('TelegramProvider: критическая ошибка восстановления', e);
      }
    }
  }, []);

  // Функции для работы с Telegram API
  const setupMainButton = useCallback((text: string, onClick: () => void) => {
    TelegramIntegration.setupMainButton(text, '#F71A2C', '#ffffff', onClick);
  }, []);

  const hideMainButton = useCallback(() => {
    TelegramIntegration.hideMainButton();
  }, []);

  const showAlert = useCallback((message: string, callback?: () => void) => {
    TelegramIntegration.showTelegramAlert(message, callback);
  }, []);

  const showConfirm = useCallback((message: string, callback?: (confirmed: boolean) => void) => {
    TelegramIntegration.showTelegramConfirm(message, callback);
  }, []);

  const close = useCallback(() => {
    TelegramIntegration.closeTelegramWebApp();
  }, []);

  const vibrate = useCallback((type: 'success' | 'error' | 'warning' | 'light' | 'medium' | 'heavy') => {
    TelegramIntegration.vibrate(type);
  }, []);

  const setBackButton = useCallback((visible: boolean, callback?: () => void) => {
    TelegramIntegration.setBackButton(visible, callback);
  }, []);

  // Функция для обновления gameId в контексте и в localStorage
  const updateTelegramGameId = useCallback((newGameId: string) => {
    console.log('TelegramProvider: обновляю gameId =', newGameId);
    setGameId(newGameId);
    localStorage.setItem('gameId', newGameId);
    
    // Обновляем URL с новым gameId
    try {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set('game_id', newGameId);
      const newUrl = `${window.location.pathname}?${urlParams.toString()}${window.location.hash}`;
      window.history.replaceState({}, '', newUrl);
      console.log('TelegramProvider: обновлен gameId в URL');
    } catch (e) {
      console.error('TelegramProvider: ошибка при обновлении URL с новым gameId', e);
    }
  }, []);

  // Создаем контекст с полным набором функций и данных
  const contextValue: TelegramContextType = {
    isInTelegram,
    isInitialized,
    user,
    chatId,
    gameId,
    setupMainButton,
    hideMainButton,
    showAlert,
    showConfirm,
    close,
    vibrate,
    setBackButton,
    updateTelegramGameId
  };

  return <TelegramContext.Provider value={contextValue}>{children}</TelegramContext.Provider>;
}

// Основной хук для доступа к контексту Telegram
export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}

// Хук для проверки, запущено ли приложение в Telegram
export function useIsTelegram() {
  const { isInTelegram } = useTelegram();
  return isInTelegram;
}

// Хук для получения данных пользователя Telegram
export function useTelegramUser() {
  const { user } = useTelegram();
  return user;
}

// Хук для получения chatId из контекста Telegram
export function useTelegramChatId() {
  const { chatId } = useTelegram();
  return chatId;
}

// Хук для получения gameId из контекста Telegram
export function useTelegramGameId() {
  const { gameId } = useTelegram();
  return gameId;
}

export default {
  TelegramProvider,
  useTelegram,
  useIsTelegram,
  useTelegramUser,
  useTelegramChatId,
  useTelegramGameId
};