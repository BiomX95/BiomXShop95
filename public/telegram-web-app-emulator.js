/**
 * Эмулятор Telegram WebApp API для тестирования в браузере
 * 
 * Этот скрипт создает фиктивный объект Telegram.WebApp, чтобы тестировать
 * функциональность Telegram Web App прямо в браузере.
 * 
 * Использование: добавьте к URL параметр telegram=true
 */

(function() {
  // Только активируем если есть параметр telegram=true
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.get('telegram')) return;
  
  // Проверяем, не загружен ли уже настоящий Telegram WebApp
  if (window.Telegram && window.Telegram.WebApp) {
    console.log('[Telegram Emulator] Настоящий Telegram Web App уже загружен, эмулятор не требуется.');
    return;
  }
  
  console.log('[Telegram Emulator] Инициализация эмулятора Telegram Web App');
  
  // Создаем заглушку Telegram WebApp API
  window.Telegram = {
    WebApp: {
      initData: "mock_init_data",
      initDataUnsafe: {
        query_id: "mock_query_id",
        user: {
          id: 123456789,
          first_name: "Test",
          last_name: "User",
          username: "test_user",
          language_code: "ru"
        },
        auth_date: Math.floor(Date.now() / 1000),
        hash: "mock_hash"
      },
      
      // Базовые функции
      ready: function() {
        console.log('[Telegram Emulator] WebApp.ready() вызвана');
      },
      
      expand: function() {
        console.log('[Telegram Emulator] WebApp.expand() вызвана');
        this.isExpanded = true;
      },
      
      close: function() {
        console.log('[Telegram Emulator] WebApp.close() вызвана');
        alert('Приложение было бы закрыто в Telegram');
      },
      
      // Свойства
      isExpanded: false,
      
      // Главная кнопка
      MainButton: {
        text: "Кнопка",
        color: "#2481cc",
        textColor: "#ffffff",
        isVisible: false,
        isActive: true,
        isProgressVisible: false,
        
        _clickHandlers: [],
        
        show: function() {
          console.log('[Telegram Emulator] MainButton.show() вызвана');
          this.isVisible = true;
          this._updateButton();
        },
        
        hide: function() {
          console.log('[Telegram Emulator] MainButton.hide() вызвана');
          this.isVisible = false;
          this._updateButton();
        },
        
        enable: function() {
          console.log('[Telegram Emulator] MainButton.enable() вызвана');
          this.isActive = true;
          this._updateButton();
        },
        
        disable: function() {
          console.log('[Telegram Emulator] MainButton.disable() вызвана');
          this.isActive = false;
          this._updateButton();
        },
        
        showProgress: function(leaveActive) {
          console.log('[Telegram Emulator] MainButton.showProgress() вызвана');
          this.isProgressVisible = true;
          if (!leaveActive) {
            this.isActive = false;
          }
          this._updateButton();
        },
        
        hideProgress: function() {
          console.log('[Telegram Emulator] MainButton.hideProgress() вызвана');
          this.isProgressVisible = false;
          this._updateButton();
        },
        
        onClick: function(callback) {
          console.log('[Telegram Emulator] MainButton.onClick() вызвана');
          if (typeof callback === 'function') {
            this._clickHandlers.push(callback);
          }
        },
        
        offClick: function(callback) {
          console.log('[Telegram Emulator] MainButton.offClick() вызвана');
          if (typeof callback === 'function') {
            this._clickHandlers = this._clickHandlers.filter(handler => handler !== callback);
          }
        },
        
        setText: function(text) {
          console.log('[Telegram Emulator] MainButton.setText() вызвана с текстом: ' + text);
          this.text = text;
          this._updateButton();
        },
        
        setParams: function(params) {
          console.log('[Telegram Emulator] MainButton.setParams() вызвана с параметрами:', params);
          if (params.text) this.text = params.text;
          if (params.color) this.color = params.color;
          if (params.text_color) this.textColor = params.text_color;
          if (params.is_active !== undefined) this.isActive = !!params.is_active;
          if (params.is_visible !== undefined) this.isVisible = !!params.is_visible;
          this._updateButton();
        },
        
        // Внутренняя функция для обновления визуального представления кнопки
        _updateButton: function() {
          setTimeout(() => {
            // Удаляем существующую кнопку если есть
            let existingButton = document.getElementById('telegram-main-button');
            if (existingButton) {
              existingButton.parentNode.removeChild(existingButton);
            }
            
            // Если кнопка не должна быть видна, не добавляем ее
            if (!this.isVisible) return;
            
            // Создаем кнопку
            const button = document.createElement('button');
            button.id = 'telegram-main-button';
            button.textContent = this.isProgressVisible ? this.text + ' ...' : this.text;
            
            // Стили для кнопки
            Object.assign(button.style, {
              position: 'fixed',
              bottom: '0',
              left: '0',
              right: '0',
              backgroundColor: this.color,
              color: this.textColor,
              padding: '16px',
              border: 'none',
              width: '100%',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: this.isActive ? 'pointer' : 'default',
              opacity: this.isActive ? '1' : '0.6',
              zIndex: '9999'
            });
            
            // Подписка на событие клика
            if (this.isActive) {
              button.addEventListener('click', () => {
                console.log('[Telegram Emulator] MainButton клик');
                this._clickHandlers.forEach(handler => handler());
              });
            }
            
            // Добавляем кнопку в DOM
            document.body.appendChild(button);
          }, 0);
        }
      },
      
      // BackButton (упрощенная реализация)
      BackButton: {
        isVisible: false,
        _clickHandlers: [],
        
        onClick: function(callback) {
          if (typeof callback === 'function') {
            this._clickHandlers.push(callback);
          }
        },
        
        offClick: function(callback) {
          if (typeof callback === 'function') {
            this._clickHandlers = this._clickHandlers.filter(handler => handler !== callback);
          }
        },
        
        show: function() { this.isVisible = true; },
        hide: function() { this.isVisible = false; }
      },
      
      // HapticFeedback (только логи)
      HapticFeedback: {
        impactOccurred: function(style) {
          console.log('[Telegram Emulator] HapticFeedback.impactOccurred() вызвана с типом:', style);
        },
        
        notificationOccurred: function(type) {
          console.log('[Telegram Emulator] HapticFeedback.notificationOccurred() вызвана с типом:', type);
        },
        
        selectionChanged: function() {
          console.log('[Telegram Emulator] HapticFeedback.selectionChanged() вызвана');
        }
      },
      
      // Диалоги
      showPopup: function(params, callback) {
        console.log('[Telegram Emulator] showPopup() вызвана с параметрами:', params);
        
        const title = params.title || 'Сообщение';
        const buttons = params.buttons || [{ id: 'ok', text: 'OK' }];
        
        // Создаем простое модальное окно
        const result = window.confirm(title + '\n\n' + params.message);
        
        if (typeof callback === 'function') {
          callback(result ? buttons[0].id : 'cancel');
        }
      },
      
      showAlert: function(message, callback) {
        console.log('[Telegram Emulator] showAlert() вызвана с сообщением:', message);
        window.alert(message);
        
        if (typeof callback === 'function') {
          setTimeout(callback, 100);
        }
      },
      
      showConfirm: function(message, callback) {
        console.log('[Telegram Emulator] showConfirm() вызвана с сообщением:', message);
        const result = window.confirm(message);
        
        if (typeof callback === 'function') {
          setTimeout(() => callback(result), 100);
        }
      },
      
      // Другие функции
      openLink: function(url) {
        console.log('[Telegram Emulator] openLink() вызвана с URL:', url);
        window.open(url, '_blank');
      },
      
      openTelegramLink: function(url) {
        console.log('[Telegram Emulator] openTelegramLink() вызвана с URL:', url);
        window.open('https://t.me/' + url.replace('https://t.me/', ''), '_blank');
      },
      
      // События
      _eventHandlers: {
        themeChanged: [],
        viewportChanged: [],
        mainButtonClicked: []
      },
      
      onEvent: function(eventType, eventHandler) {
        if (this._eventHandlers[eventType] && typeof eventHandler === 'function') {
          this._eventHandlers[eventType].push(eventHandler);
        }
      },
      
      offEvent: function(eventType, eventHandler) {
        if (this._eventHandlers[eventType] && typeof eventHandler === 'function') {
          this._eventHandlers[eventType] = this._eventHandlers[eventType].filter(
            handler => handler !== eventHandler
          );
        }
      },
      
      // Настройка цветов
      setHeaderColor: function(color) {
        console.log('[Telegram Emulator] setHeaderColor() вызвана с цветом:', color);
      },
      
      setBackgroundColor: function(color) {
        console.log('[Telegram Emulator] setBackgroundColor() вызвана с цветом:', color);
        document.body.style.backgroundColor = color;
      },
      
      // Облачное хранилище (эмуляция через localStorage)
      CloudStorage: {
        setItem: function(key, value) {
          console.log('[Telegram Emulator] CloudStorage.setItem() вызвана с ключом:', key);
          localStorage.setItem('tg_' + key, value);
          return Promise.resolve();
        },
        
        getItem: function(key) {
          console.log('[Telegram Emulator] CloudStorage.getItem() вызвана с ключом:', key);
          return Promise.resolve(localStorage.getItem('tg_' + key));
        },
        
        getItems: function(keys) {
          console.log('[Telegram Emulator] CloudStorage.getItems() вызвана с ключами:', keys);
          const result = {};
          keys.forEach(key => {
            result[key] = localStorage.getItem('tg_' + key);
          });
          return Promise.resolve(result);
        },
        
        removeItem: function(key) {
          console.log('[Telegram Emulator] CloudStorage.removeItem() вызвана с ключом:', key);
          localStorage.removeItem('tg_' + key);
          return Promise.resolve();
        },
        
        removeItems: function(keys) {
          console.log('[Telegram Emulator] CloudStorage.removeItems() вызвана с ключами:', keys);
          keys.forEach(key => {
            localStorage.removeItem('tg_' + key);
          });
          return Promise.resolve();
        },
        
        getKeys: function() {
          console.log('[Telegram Emulator] CloudStorage.getKeys() вызвана');
          const keys = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('tg_')) {
              keys.push(key.substring(3));
            }
          }
          return Promise.resolve(keys);
        }
      },
      
      // Функции подтверждения закрытия
      enableClosingConfirmation: function() {
        console.log('[Telegram Emulator] enableClosingConfirmation() вызвана');
      },
      
      disableClosingConfirmation: function() {
        console.log('[Telegram Emulator] disableClosingConfirmation() вызвана');
      }
    }
  };
  
  // Добавляем информационную панель
  window.addEventListener('DOMContentLoaded', function() {
    const infoPanel = document.createElement('div');
    infoPanel.id = 'telegram-emulator-info';
    
    Object.assign(infoPanel.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      backgroundColor: '#5288c1',
      color: 'white',
      padding: '8px 16px',
      fontSize: '14px',
      zIndex: '9998',
      textAlign: 'center'
    });
    
    infoPanel.textContent = '🔵 Telegram Web App эмулятор активен | Пользователь: ' + 
                          window.Telegram.WebApp.initDataUnsafe.user.first_name + ' ' + 
                          window.Telegram.WebApp.initDataUnsafe.user.last_name;
    
    document.body.appendChild(infoPanel);
    
    // Добавляем дополнительный отступ для содержимого страницы
    const contentPadding = document.createElement('div');
    contentPadding.style.height = '36px';
    document.body.insertBefore(contentPadding, document.body.firstChild);
  });
  
  console.log('[Telegram Emulator] Эмулятор готов к использованию');
})();