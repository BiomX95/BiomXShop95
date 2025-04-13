/**
 * Компонент для интеграции с Telegram Web Apps
 * 
 * Telegram Web Apps API позволяет создавать приложения, которые могут быть запущены внутри Telegram.
 * Этот компонент предоставляет утилиты для взаимодействия с API.
 * 
 * Документация: https://core.telegram.org/bots/webapps
 */

// Типы для Telegram WebApp API
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          query_id?: string;
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          auth_date: number;
          hash: string;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive: boolean) => void;
          hideProgress: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          setText: (text: string) => void;
          setParams: (params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
          }) => void;
        };
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        isExpanded: boolean;
        SettingsButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        CloudStorage: {
          setItem: (key: string, value: string) => Promise<void>;
          getItem: (key: string) => Promise<string | null>;
          getItems: (keys: string[]) => Promise<Record<string, string | null>>;
          removeItem: (key: string) => Promise<void>;
          removeItems: (keys: string[]) => Promise<void>;
          getKeys: () => Promise<string[]>;
        };
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        onEvent(eventType: 'themeChanged' | 'viewportChanged' | 'mainButtonClicked', eventHandler: () => void): void;
        offEvent(eventType: 'themeChanged' | 'viewportChanged' | 'mainButtonClicked', eventHandler: () => void): void;
        openLink: (url: string) => void;
        openTelegramLink: (url: string) => void;
        showPopup: (params: {
          title?: string;
          message: string;
          buttons?: Array<{ id: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text: string }>;
        }, callback?: (buttonId: string) => void) => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
      };
    };
  }
}

// Проверка, запущено ли приложение в Telegram
export const isTelegramWebApp = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    !!window.Telegram?.WebApp
  );
};

// Получение данных пользователя из Telegram
export const getTelegramUser = () => {
  if (!isTelegramWebApp()) {
    return null;
  }
  
  return window.Telegram?.WebApp?.initDataUnsafe.user || null;
};

// Инициализация Telegram Web App
export const initTelegramWebApp = () => {
  if (!isTelegramWebApp()) {
    return;
  }
  
  // Сообщаем Telegram, что приложение готово
  window.Telegram?.WebApp?.ready();
  
  // Расширяем приложение на весь экран
  if (!window.Telegram?.WebApp?.isExpanded) {
    window.Telegram?.WebApp?.expand();
  }
};

// Настройка главной кнопки Telegram
export const setupMainButton = (
  text: string,
  color = '#F71A2C', // Красный цвет, соответствующий дизайну приложения
  textColor = '#ffffff',
  onClick: () => void
) => {
  if (!isTelegramWebApp()) {
    return;
  }
  
  const mainButton = window.Telegram?.WebApp?.MainButton;
  
  if (mainButton) {
    mainButton.setParams({
      text,
      color,
      text_color: textColor,
    });
    
    // Удаляем предыдущие обработчики
    mainButton.offClick(onClick);
    
    // Добавляем новый обработчик
    mainButton.onClick(onClick);
    
    // Показываем кнопку
    mainButton.show();
  }
};

// Показать индикатор загрузки на главной кнопке
export const showMainButtonLoading = (leaveActive = false) => {
  if (!isTelegramWebApp() || !window.Telegram?.WebApp?.MainButton) {
    return;
  }
  
  window.Telegram?.WebApp?.MainButton.showProgress(leaveActive);
};

// Скрыть индикатор загрузки на главной кнопке
export const hideMainButtonLoading = () => {
  if (!isTelegramWebApp() || !window.Telegram?.WebApp?.MainButton) {
    return;
  }
  
  window.Telegram?.WebApp?.MainButton.hideProgress();
};

// Показать всплывающее сообщение
export const showTelegramAlert = (message: string, callback?: () => void) => {
  if (!isTelegramWebApp() || !window.Telegram?.WebApp?.showAlert) {
    if (callback) callback();
    return;
  }
  
  window.Telegram?.WebApp?.showAlert(message, callback);
};

// Показать диалог подтверждения
export const showTelegramConfirm = (message: string, callback?: (confirmed: boolean) => void) => {
  if (!isTelegramWebApp() || !window.Telegram?.WebApp?.showConfirm) {
    if (callback) callback(false);
    return;
  }
  
  window.Telegram?.WebApp?.showConfirm(message, callback);
};

// Закрыть приложение
export const closeTelegramWebApp = () => {
  if (!isTelegramWebApp() || !window.Telegram?.WebApp?.close) {
    return;
  }
  
  window.Telegram?.WebApp?.close();
};

// Включить вибрационный отклик (для мобильных устройств)
export const vibrate = (type: 'success' | 'error' | 'warning' | 'light' | 'medium' | 'heavy') => {
  if (!isTelegramWebApp() || !window.Telegram?.WebApp?.HapticFeedback) {
    return;
  }
  
  if (type === 'success' || type === 'error' || type === 'warning') {
    window.Telegram?.WebApp?.HapticFeedback.notificationOccurred(type);
  } else {
    window.Telegram?.WebApp?.HapticFeedback.impactOccurred(type);
  }
};

// Сохранить данные в облачное хранилище Telegram
export const saveTelegramData = async (key: string, value: string): Promise<void> => {
  if (!isTelegramWebApp() || !window.Telegram?.WebApp?.CloudStorage) {
    return;
  }
  
  try {
    await window.Telegram?.WebApp?.CloudStorage.setItem(key, value);
  } catch (error) {
    console.error('Error saving data to Telegram CloudStorage:', error);
  }
};

// Получить данные из облачного хранилища Telegram
export const getTelegramData = async (key: string): Promise<string | null> => {
  if (!isTelegramWebApp() || !window.Telegram?.WebApp?.CloudStorage) {
    return null;
  }
  
  try {
    return await window.Telegram?.WebApp?.CloudStorage.getItem(key);
  } catch (error) {
    console.error('Error getting data from Telegram CloudStorage:', error);
    return null;
  }
};

// Добавить параметр telegram=true к URL и убедиться, что параметр game_id правильно обрабатывается
export const ensureTelegramParameter = () => {
  try {
    if (typeof window === 'undefined') return;
    
    console.log('TelegramIntegration: проверка URL-параметров');
    console.log('TelegramIntegration: текущий URL:', window.location.href);
    
    const urlParams = new URLSearchParams(window.location.search);
    console.log('TelegramIntegration: параметры URL:', Object.fromEntries(urlParams.entries()));
    
    const hasTelegramParam = urlParams.has('telegram');
    let urlUpdated = false;
    
    // Добавляем параметр telegram=true если он отсутствует
    if (!hasTelegramParam && isTelegramWebApp()) {
      console.log('TelegramIntegration: добавляем параметр telegram=true');
      urlParams.set('telegram', 'true');
      urlUpdated = true;
    }
    
    // Тестовый ID для отладки в Telegram WebApp
    const testGameId = '123456789';
    
    // Проверяем наличие game_id в URL
    const gameId = urlParams.get('game_id');
    if (gameId) {
      console.log('TelegramIntegration: обнаружен game_id в URL:', gameId);
      localStorage.setItem('gameId', gameId);
      
      // Записываем в историю
      const historyStr = localStorage.getItem('gameIdHistory');
      const history = historyStr ? JSON.parse(historyStr) : [];
      const newHistory = [gameId, ...history.filter((id: string) => id !== gameId)].slice(0, 5);
      localStorage.setItem('gameIdHistory', JSON.stringify(newHistory));
      
      console.log('TelegramIntegration: game_id сохранен в localStorage');
    } else {
      console.log('TelegramIntegration: game_id не найден в URL');
      
      // Если это Telegram WebApp и нет game_id в URL, проверяем localStorage
      if (isTelegramWebApp()) {
        const storedGameId = localStorage.getItem('gameId');
        if (!storedGameId) {
          console.log('TelegramIntegration: устанавливаем тестовый gameId:', testGameId);
          localStorage.setItem('gameId', testGameId);
          
          // Пытаемся обновить URL с тестовым ID для единообразия
          urlParams.set('game_id', testGameId);
          urlUpdated = true;
        } else {
          console.log('TelegramIntegration: найден сохраненный gameId:', storedGameId);
        }
      }
    }
    
    // Обновляем URL только если были изменения
    if (urlUpdated) {
      const newUrl = `${window.location.pathname}?${urlParams.toString()}${window.location.hash}`;
      console.log('TelegramIntegration: обновляем URL на:', newUrl);
      window.history.replaceState({}, '', newUrl);
    }
  } catch (error) {
    console.error('TelegramIntegration: ошибка при обработке URL-параметров:', error);
  }
};

// Скрыть основную кнопку
export const hideMainButton = () => {
  if (!isTelegramWebApp() || !window.Telegram?.WebApp?.MainButton) {
    return;
  }
  
  window.Telegram?.WebApp?.MainButton.hide();
};

// Установить кнопку "Назад"
export const setBackButton = (visible: boolean, callback?: () => void) => {
  if (!isTelegramWebApp() || !window.Telegram?.WebApp?.BackButton) {
    return;
  }
  
  const backButton = window.Telegram?.WebApp?.BackButton;
  
  if (visible) {
    // Если есть callback, устанавливаем его
    if (callback) {
      backButton.onClick(callback);
    }
    backButton.show();
  } else {
    // Убираем обработчик и скрываем кнопку
    if (callback) {
      backButton.offClick(callback);
    }
    backButton.hide();
  }
};

// Получить сохраненные параметры из URL и localStorage
export const getSavedTelegramParameters = () => {
  // Получаем параметры из URL
  const urlParams = new URLSearchParams(window.location.search);
  
  // Параметры, которые нас интересуют
  const gameId = urlParams.get('game_id') || localStorage.getItem('gameId') || null;
  const tgChat = urlParams.get('tg_chat') || null;
  const telegramUserId = localStorage.getItem('telegramUserId') || null;
  
  // Получаем сохраненную историю
  let gameIdHistory: string[] = [];
  try {
    const historyStr = localStorage.getItem('gameIdHistory');
    if (historyStr) {
      gameIdHistory = JSON.parse(historyStr);
    }
  } catch (error) {
    console.error('Ошибка при чтении истории gameId:', error);
  }
  
  return {
    gameId,
    tgChat,
    telegramUserId,
    gameIdHistory,
    isTelegram: urlParams.get('telegram') === 'true' || isTelegramWebApp()
  };
};

// Обработка ошибок Telegram WebApp API
export const handleTelegramError = (error: any, fallbackAction?: () => void) => {
  console.error('Telegram WebApp API error:', error);
  
  if (fallbackAction) {
    fallbackAction();
  }
  
  if (isTelegramWebApp() && window.Telegram?.WebApp?.showAlert) {
    window.Telegram.WebApp.showAlert(
      'Произошла ошибка при взаимодействии с Telegram. Пожалуйста, попробуйте еще раз.'
    );
  }
};

// Помечаем приложение как полностью загруженное
export const markAppAsReady = () => {
  if (isTelegramWebApp() && window.Telegram?.WebApp?.ready) {
    console.log('TelegramIntegration: отмечаем приложение как готовое');
    window.Telegram.WebApp.ready();
  }
};

// Обновляем экспорт по умолчанию с новыми функциями
export default {
  isTelegramWebApp,
  getTelegramUser,
  initTelegramWebApp,
  setupMainButton,
  hideMainButton,
  showMainButtonLoading,
  hideMainButtonLoading,
  showTelegramAlert,
  showTelegramConfirm,
  closeTelegramWebApp,
  vibrate,
  saveTelegramData,
  getTelegramData,
  ensureTelegramParameter,
  setBackButton,
  getSavedTelegramParameters,
  handleTelegramError,
  markAppAsReady
};