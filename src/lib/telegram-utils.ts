import TelegramIntegration from './telegram-integration';

// Дополняем существующее объявление Window.Telegram 
// Уже определенное в telegram-integration.ts
// НЕ создаем новый интерфейс, чтобы избежать конфликтов типов

/**
 * Класс для прямого взаимодействия с Telegram без использования React контекста
 * Альтернатива для TelegramProvider, которая вызывает циклическую зависимость
 */
class TelegramUtils {
  // Проверка, запущено ли приложение в Telegram
  static isInTelegram(): boolean {
    return TelegramIntegration.isTelegramWebApp() || 
           new URLSearchParams(window.location.search).get('telegram') === 'true';
  }
  
  // Инициализация Telegram WebApp API
  static initialize(): void {
    if (this.isInTelegram()) {
      console.log('TelegramUtils: инициализация WebApp API');
      TelegramIntegration.initTelegramWebApp();
    }
  }
  
  // Получение данных пользователя из Telegram
  static getTelegramUser() {
    if (!this.isInTelegram()) return null;
    return TelegramIntegration.getTelegramUser();
  }
  
  // Получение chatId из URL
  static getChatId(): string | null {
    const urlChatId = new URLSearchParams(window.location.search).get('tg_chat');
    if (urlChatId) return urlChatId;
    
    const user = this.getTelegramUser();
    return user?.id ? user.id.toString() : null;
  }
  
  // Управление главной кнопкой
  static setupMainButton(text: string, onClick: () => void): void {
    if (!this.isInTelegram()) return;
    
    try {
      // Устанавливаем кнопку
      TelegramIntegration.setupMainButton(text, '#F71A2C', '#ffffff', onClick);
      
      // Для надежности также устанавливаем слушатель события клика на кнопку,
      // потому что в некоторых случаях (например, с bit.ly редиректами)
      // callback может не сработать правильно
      if (window.Telegram?.WebApp) {
        const mainButton = window.Telegram.WebApp.MainButton;
        
        // Сначала удаляем все обработчики, чтобы избежать дублирования
        mainButton.offClick(() => {});
        
        // Устанавливаем новый обработчик
        mainButton.onClick(onClick);
      }
    } catch (error) {
      console.error("Ошибка при настройке главной кнопки Telegram:", error);
    }
  }
  
  static hideMainButton(): void {
    if (!this.isInTelegram()) return;
    TelegramIntegration.hideMainButton();
  }
  
  // Показ уведомлений
  static showAlert(message: string, callback?: () => void): void {
    if (!this.isInTelegram()) {
      alert(message);
      if (callback) callback();
      return;
    }
    TelegramIntegration.showTelegramAlert(message, callback);
  }
  
  static showConfirm(message: string, callback?: (confirmed: boolean) => void): void {
    if (!this.isInTelegram()) {
      const confirmed = confirm(message);
      if (callback) callback(confirmed);
      return;
    }
    TelegramIntegration.showTelegramConfirm(message, callback);
  }
  
  // Закрытие Telegram WebApp
  static close(): void {
    if (!this.isInTelegram()) return;
    TelegramIntegration.closeTelegramWebApp();
  }
  
  // Вибрация в Telegram
  static vibrate(type: 'success' | 'error' | 'warning' | 'light' | 'medium' | 'heavy'): void {
    if (!this.isInTelegram()) return;
    TelegramIntegration.vibrate(type);
  }
  
  // Управление кнопкой "Назад"
  static setBackButton(visible: boolean, callback?: () => void): void {
    if (!this.isInTelegram()) return;
    TelegramIntegration.setBackButton(visible, callback);
  }
}

// Инициализация при загрузке модуля
TelegramUtils.initialize();

export default TelegramUtils;