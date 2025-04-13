/**
 * Улучшенный предзагрузчик для интеграции с Telegram WebApp
 * 
 * Этот скрипт выполняется до загрузки React-приложения и
 * обеспечивает сохранение параметров URL и инициализацию Telegram WebApp
 * 
 * ВАЖНО: Эта логика была вынесена за пределы React для обеспечения 
 * стабильной работы, особенно при интеграции с Telegram
 */

// Основной модуль предзагрузчика
(function() {
  try {
    console.log('Preloader: запуск предзагрузочного скрипта');
    console.log('Preloader: текущий URL:', window.location.href);
    
    // Получаем параметры из URL
    const urlParams = new URLSearchParams(window.location.search);
    console.log('Preloader: параметры URL:', [...urlParams.entries()]);
    
    // ВАЖНО: Обработка game_id
    const gameId = urlParams.get('game_id');
    const tgChat = urlParams.get('tg_chat'); // Получаем ID чата из параметров
    
    // Определяем, запущено ли приложение внутри Telegram
    const isTelegramWebApp = 
      typeof window !== 'undefined' && 
      window.Telegram && 
      window.Telegram.WebApp;
    
    // Параметр из URL явно указывает на эмуляцию в браузере
    const hasTelegramParam = urlParams.has('telegram') && urlParams.get('telegram') === 'true';
    
    // Запущено в Telegram или эмулирует Telegram
    const isTelegramContext = isTelegramWebApp || hasTelegramParam;
    
    console.log('Preloader: проверка Telegram WebApp:', 
      typeof window !== 'undefined' ? 'window доступен' : 'window недоступен',
      window.Telegram ? 'window.Telegram существует' : 'window.Telegram отсутствует',
      window.Telegram?.WebApp ? 'window.Telegram.WebApp существует' : 'window.Telegram.WebApp отсутствует'
    );
    
    // Получаем сохраненный ID из localStorage
    const savedGameId = localStorage.getItem('gameId');
    
    // Выбираем ID на основе приоритета:
    // 1. ID из URL (если есть)
    // 2. Сохраненный ID (если есть)
    // 3. Тестовый ID (для Telegram)
    let finalGameId = gameId;
    
    if (!finalGameId) {
      if (savedGameId) {
        finalGameId = savedGameId;
        console.log('Preloader: использую сохраненный gameId:', finalGameId);
      } else if (isTelegramContext) {
        // Для Telegram контекста используем тестовый ID
        finalGameId = '123456789';
        console.log('Preloader: использую тестовый gameId для Telegram:', finalGameId);
      }
    }
    
    // Если у нас есть finalGameId, сохраняем его и обновляем URL
    if (finalGameId) {
      // Сохраняем в localStorage
      localStorage.setItem('gameId', finalGameId);
      
      // Записываем в историю
      try {
        const historyStr = localStorage.getItem('gameIdHistory');
        const history = historyStr ? JSON.parse(historyStr) : [];
        const newHistory = [finalGameId, ...history.filter(id => id !== finalGameId)].slice(0, 5);
        localStorage.setItem('gameIdHistory', JSON.stringify(newHistory));
      } catch (e) {
        console.error('Preloader: ошибка при сохранении истории', e);
      }
      
      // Если ID отличается от того, что в URL, обновляем URL
      if (finalGameId !== gameId) {
        urlParams.set('game_id', finalGameId);
        const newUrl = `${window.location.pathname}?${urlParams.toString()}${window.location.hash}`;
        
        try {
          window.history.replaceState({}, '', newUrl);
          console.log('Preloader: обновлен URL с gameId =', finalGameId);
        } catch (e) {
          console.error('Preloader: ошибка при обновлении URL', e);
        }
      }
    }
    
    // Обработка Telegram-специфичных параметров
    if (isTelegramWebApp) {
      // Выводим информацию о пользователе Telegram
      const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;
      if (telegramUser) {
        console.log('Preloader: данные пользователя Telegram:', JSON.stringify(telegramUser));
        
        // Сохраняем ID пользователя Telegram в localStorage
        localStorage.setItem('telegramUserId', telegramUser.id.toString());
        
        // Если нет tg_chat в URL, но есть идентификатор пользователя, добавляем его
        if (!tgChat && telegramUser.id) {
          urlParams.set('tg_chat', telegramUser.id.toString());
          console.log('Preloader: добавлен параметр tg_chat =', telegramUser.id);
        }
      } else {
        console.log('Preloader: данные пользователя Telegram отсутствуют');
      }
      
      // Добавляем параметр telegram=true, если его нет
      if (!urlParams.has('telegram')) {
        urlParams.set('telegram', 'true');
        console.log('Preloader: добавлен параметр telegram=true');
      }
      
      // Обновляем URL со всеми новыми параметрами
      const newUrl = `${window.location.pathname}?${urlParams.toString()}${window.location.hash}`;
      
      try {
        window.history.replaceState({}, '', newUrl);
      } catch (e) {
        console.error('Preloader: ошибка при обновлении URL с параметрами Telegram', e);
      }
    } else if (hasTelegramParam) {
      // Если запущено не в Telegram, но есть параметр telegram=true
      console.log('Preloader: эмуляция Telegram WebApp в браузере');
    }
    
    // Если это специфический URL для Telegram WebApp, добавляем слушатель событий
    if (window.location.pathname.includes('/telegram-web-app')) {
      console.log('Preloader: определен путь /telegram-web-app, добавляем слушатель событий Telegram');
      
      // При закрытии приложения Telegram сохраняем данные
      if (isTelegramWebApp) {
        window.addEventListener('beforeunload', function() {
          console.log('Preloader: приложение Telegram закрывается, сохраняем данные');
          // TODO: можно добавить дополнительную логику сохранения
        });
      }
    }
    
    console.log('Preloader: завершение работы предзагрузочного скрипта');
  } catch (error) {
    console.error('Preloader: критическая ошибка в работе предзагрузчика', error);
    
    // Восстановление в случае ошибки - используем настройки по умолчанию
    try {
      // Получаем параметры из URL
      const urlParams = new URLSearchParams(window.location.search);
      
      // Определяем, запущено ли приложение внутри Telegram
      const isTelegramWebApp = 
        typeof window !== 'undefined' && 
        window.Telegram && 
        window.Telegram.WebApp;
      
      const hasTelegramParam = urlParams.has('telegram') && urlParams.get('telegram') === 'true';
      
      // В случае ошибки для Telegram контекста используем тестовый ID
      if (isTelegramWebApp || hasTelegramParam) {
        localStorage.setItem('gameId', '123456789');
        console.log('Preloader: аварийное восстановление с тестовым ID');
      }
    } catch (e) {
      console.error('Preloader: аварийное восстановление не удалось', e);
    }
  }
})();