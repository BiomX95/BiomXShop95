import TelegramBot from 'node-telegram-bot-api';
import { storage } from './storage';
import { diamondPackageTypes } from '../shared/schema';

// Расширение типов для node-telegram-bot-api
declare module 'node-telegram-bot-api' {
  interface SendMessageOptions {
    reply_markup?: {
      inline_keyboard?: Array<Array<{
        text: string;
        url?: string;
        callback_data?: string;
        web_app?: {
          url: string;
        };
      }>>;
      keyboard?: Array<Array<string>>;
      resize_keyboard?: boolean;
      one_time_keyboard?: boolean;
    };
  }
}

// Проверяем наличие токена
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN не найден в переменных окружения');
  process.exit(1);
}

// Инициализируем бота без автоматического polling
const token = process.env.TELEGRAM_BOT_TOKEN;
console.log('Запуск Telegram бота...');

// В режиме разработки используем бота без polling
// Это поможет избежать ошибок ETELEGRAM при перезапуске приложения
export const bot = new TelegramBot(token, { polling: false });

// Обработка ошибок при работе бота - избегаем использования событий, не описанных в типах
if (bot.on) {
  // @ts-ignore - обрабатываем ошибки, даже если тип не определен в типах
  bot.on('error', (error: any) => {
    if (error && error.code) {
      if (error.code.startsWith('ETELEGRAM')) {
        console.log(`Telegram polling error: ${error.code}. Бот продолжает работу.`);
      } else {
        console.error('Ошибка Telegram бота:', error);
      }
    } else {
      console.error('Ошибка Telegram бота без кода:', error);
    }
  });
}

// Базовый URL для сайта
// Используем надежный, постоянный URL для стабильной работы
// Используем публичный URL для стабильного доступа
export const SITE_URL = 'https://telegram-assistant-raatbekxspon.replit.app';

// Название магазина
export const SHOP_NAME = 'BiomX_Shop';

// Клавиатуры
const mainMenuKeyboard = {
  reply_markup: {
    keyboard: [
      ['💎 Купить алмазы', '🎁 Ваучеры'],
      ['🛡️ Эво-пропуски', '💬 Отзывы'],
      ['🌐 Открыть магазин', '👤 Мои покупки'],
      ['❓ Помощь']
    ],
    resize_keyboard: true
  }
};

// Информация о настройке веб-приложения
console.log('Для интеграции Telegram Web App с ботом, используйте BotFather и команду /setmenubutton');
console.log(`URL для веб-приложения: ${SITE_URL}`);
console.log(`ВАЖНО: В BotFather используйте команду /setmenubutton и установите параметры:`);
console.log(`Текст кнопки: "BiomX Shop 💎"`);
console.log(`URL: ${SITE_URL}`);

const backToMainMenuKeyboard = {
  reply_markup: {
    keyboard: [['◀️ Назад в меню']],
    resize_keyboard: true
  }
};

// Специальный обработчик для тестирования бота
bot.onText(/\/test/, async (msg) => {
  const chatId = msg.chat.id;
  console.log(`Получена тестовая команда от пользователя ${chatId}`);
  
  await bot.sendMessage(
    chatId,
    '✅ Бот работает корректно! Это тестовое сообщение.'
  );
});

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name || 'друг';
  console.log(`Получена команда /start от пользователя ${chatId}, имя: ${firstName}`);
  
  await bot.sendMessage(
    chatId,
    `Привет, ${firstName}! 👋\n\nДобро пожаловать в ${SHOP_NAME} - магазин алмазов Free Fire.\n\nВы можете привязать свой ID в игре командой /link ID_ИГРЫ\n\nВыберите нужный раздел из меню:`,
    mainMenuKeyboard
  );
});

// Обработчик команды /link для привязки ID игры к чату Telegram
bot.onText(/\/link (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  
  if (!match || !match[1]) {
    await bot.sendMessage(
      chatId,
      'Пожалуйста, укажите ваш ID в игре:\n/link ID_ИГРЫ',
      backToMainMenuKeyboard
    );
    return;
  }
  
  const gameId = match[1].trim();
  
  // Проверка формата ID игры
  if (!/^\d{5,12}$/.test(gameId)) {
    await bot.sendMessage(
      chatId, 
      'Неверный формат ID игры. ID должен содержать от 5 до 12 цифр.\n\nПопробуйте снова: /link ID_ИГРЫ',
      backToMainMenuKeyboard
    );
    return;
  }
  
  try {
    // Отправляем запрос на связывание в API
    const response = await fetch(`${SITE_URL}/api/telegram/link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gameId,
        chatId: chatId.toString()
      })
    });
    
    // Проверяем результат
    if (response.ok) {
      await bot.sendMessage(
        chatId,
        `✅ Ваш ID игры ${gameId} успешно привязан к этому чату!\n\nТеперь вы будете получать уведомления о статусе платежей.`,
        mainMenuKeyboard
      );
    } else {
      const error = await response.text();
      console.error('Ошибка при привязке ID игры:', error);
      await bot.sendMessage(
        chatId,
        `❌ Произошла ошибка при привязке ID. Пожалуйста, попробуйте позже или обратитесь в поддержку.`,
        mainMenuKeyboard
      );
    }
  } catch (error) {
    console.error('Ошибка при обращении к API:', error);
    await bot.sendMessage(
      chatId,
      `❌ Не удалось связаться с сервером. Пожалуйста, попробуйте позже.`,
      mainMenuKeyboard
    );
  }
});

// Обработчик выбора "Купить алмазы"
bot.onText(/💎 Купить алмазы/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const packages = await storage.getDiamondPackages();
    const filteredPackages = packages.filter(pkg => pkg.type === diamondPackageTypes.DIAMONDS);
    
    let message = '💎 Доступные пакеты алмазов:\n\n';
    
    filteredPackages.forEach((pkg, index) => {
      message += `${index + 1}. ${pkg.name} - ${pkg.price} ₽\n`;
    });
    
    message += '\nДля покупки перейдите на наш сайт:';
    
    await bot.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🌐 Перейти в магазин', url: SITE_URL }]
        ]
      }
    });
  } catch (error) {
    console.error('Ошибка при получении пакетов алмазов:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка при загрузке пакетов. Пожалуйста, попробуйте позже.');
  }
});

// Обработчик выбора "Ваучеры"
bot.onText(/🎁 Ваучеры/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const packages = await storage.getDiamondPackages();
    const vouchers = packages.filter(pkg => pkg.type === diamondPackageTypes.VOUCHER);
    
    let message = '🎁 Доступные ваучеры:\n\n';
    
    vouchers.forEach((voucher, index) => {
      message += `${index + 1}. ${voucher.name} - ${voucher.price} ₽\n`;
    });
    
    message += '\nДля покупки перейдите на наш сайт:';
    
    await bot.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🌐 Перейти в магазин', url: SITE_URL }]
        ]
      }
    });
  } catch (error) {
    console.error('Ошибка при получении ваучеров:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка при загрузке ваучеров. Пожалуйста, попробуйте позже.');
  }
});

// Обработчик выбора "Эво-пропуски"
bot.onText(/🛡️ Эво-пропуски/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const packages = await storage.getDiamondPackages();
    const evoPasses = packages.filter(pkg => pkg.type === diamondPackageTypes.EVO_PASS);
    
    let message = '🛡️ Доступные Эво-пропуски:\n\n';
    
    evoPasses.forEach((pass, index) => {
      message += `${index + 1}. ${pass.name} - ${pass.price} ₽\n`;
    });
    
    message += '\nДля покупки перейдите на наш сайт:';
    
    await bot.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🌐 Перейти в магазин', url: SITE_URL }]
        ]
      }
    });
  } catch (error) {
    console.error('Ошибка при получении Эво-пропусков:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка при загрузке Эво-пропусков. Пожалуйста, попробуйте позже.');
  }
});

// Обработчик выбора "Отзывы"
bot.onText(/💬 Отзывы/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const reviews = await storage.getReviews();
    
    if (reviews.length === 0) {
      await bot.sendMessage(
        chatId,
        '💬 Пока что нет отзывов. Станьте первым, кто оставит отзыв на нашем сайте!',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🌐 Оставить отзыв', url: `${SITE_URL}/#reviews` }]
            ]
          }
        }
      );
      return;
    }
    
    let message = '💬 Последние отзывы:\n\n';
    
    // Показываем последние 5 отзывов
    const limitedReviews = reviews
      .filter(review => review.isVerified)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    limitedReviews.forEach((review) => {
      const stars = '⭐'.repeat(review.rating);
      message += `${review.userName}\n${stars}\n"${review.comment}"\n\n`;
    });
    
    message += 'Вы можете оставить свой отзыв на нашем сайте:';
    
    await bot.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🌐 Оставить отзыв', url: `${SITE_URL}/#reviews` }]
        ]
      }
    });
  } catch (error) {
    console.error('Ошибка при получении отзывов:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка при загрузке отзывов. Пожалуйста, попробуйте позже.');
  }
});

// Обработчик выбора "Помощь"
bot.onText(/❓ Помощь/, async (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = "❓ Помощь и часто задаваемые вопросы:\n\nКак связать ID игры с Telegram?\nОтправьте боту команду: /link ID_ИГРЫ\nНапример: /link 123456789\n\nКак купить алмазы?\nВыберите нужный пакет алмазов на сайте, укажите ID вашего аккаунта Free Fire, выберите способ оплаты и завершите покупку.\n\nКогда я получу алмазы после оплаты?\nОбычно алмазы зачисляются на ваш аккаунт в течение 5-15 минут после подтверждения оплаты.\n\nКак использовать промокод?\nПри оформлении заказа на сайте введите промокод в специальное поле и нажмите \"Применить\".\n\nМогу ли я отслеживать свой заказ?\nДа, статус вашего заказа отображается на странице после оплаты. Также вы можете проверить статус в разделе \"Мои покупки\".\n\nЧто делать, если алмазы не поступили?\nЕсли алмазы не поступили в течение 30 минут после успешной оплаты, напишите нам через раздел \"Мои покупки\" на сайте.\n\nПоддерживаемые способы оплаты:\n• Банковские карты (Visa, MasterCard)\n• Электронные кошельки (WebMoney, QIWI)\n• Мобильный платеж";

  await bot.sendMessage(chatId, helpMessage, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🌐 Перейти на сайт', url: SITE_URL }]
      ]
    }
  });
});

// Обработчик выбора "Открыть магазин"
bot.onText(/🌐 Открыть магазин/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Пытаемся найти пользователя по chatId
  try {
    const user = await storage.getUserByTelegramChatId(chatId.toString());
    const gameId = user ? user.gameId : '';
    
    // Создаем URL для запуска в Telegram WebApp с параметрами
    const webAppUrl = gameId 
      ? `${SITE_URL}?game_id=${gameId}&tg_chat=${chatId}` 
      : `${SITE_URL}?tg_chat=${chatId}`;
    
    // Отправляем пользователю сообщение с более подробной информацией
    const message = gameId 
      ? `📱 Магазин открыт для аккаунта с ID: ${gameId}` 
      : '📱 Привяжите ID вашего аккаунта с помощью команды /link ID_ИГРЫ для полного доступа к магазину';
    
    console.log(`Отправка пользователю WebApp URL: ${webAppUrl}`);
    
    // Создаем кнопку для запуска мини-приложения в Telegram
    await bot.sendMessage(
      chatId,
      message,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📱 Открыть в Telegram', web_app: { url: webAppUrl } }],
            [{ text: '🌐 Открыть в браузере', url: SITE_URL }]
          ]
        }
      }
    );
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    
    // Даже при ошибке добавляем параметр tg_chat
    const webAppUrl = `${SITE_URL}?tg_chat=${chatId}`;
    
    await bot.sendMessage(
      chatId,
      '📱 Вы можете открыть магазин прямо в Telegram. Для полного доступа привяжите ID игры: /link ID_ИГРЫ',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📱 Открыть в Telegram', web_app: { url: webAppUrl } }],
            [{ text: '🌐 Открыть в браузере', url: SITE_URL }]
          ]
        }
      }
    );
  }
});

// Обработчик выбора "Мои покупки"
bot.onText(/👤 Мои покупки/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Пытаемся найти пользователя по chatId для получения gameId
  try {
    const user = await storage.getUserByTelegramChatId(chatId.toString());
    
    if (user && user.gameId) {
      // Создаем URL с обязательными параметрами для страницы моих заказов
      const webAppUrl = `${SITE_URL}/my-orders?game_id=${user.gameId}&tg_chat=${chatId}`;
      const browserUrl = `${SITE_URL}/my-orders?game_id=${user.gameId}&tg_chat=${chatId}`;
      
      console.log(`Отправка URL для истории покупок: ${webAppUrl}`);
      
      await bot.sendMessage(
        chatId,
        `📊 История покупок для аккаунта с ID: ${user.gameId}`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '📱 Открыть в Telegram', web_app: { url: webAppUrl } }],
              [{ text: '🌐 Открыть в браузере', url: browserUrl }]
            ]
          }
        }
      );
    } else {
      // Даже если нет gameId, добавляем параметр tg_chat
      const webAppUrl = `${SITE_URL}/my-orders?tg_chat=${chatId}`;
      
      await bot.sendMessage(
        chatId,
        'Для просмотра покупок вам необходимо привязать ID игры. Отправьте команду /link ID_ИГРЫ',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '📱 Привязать ID в Telegram', web_app: { url: webAppUrl } }],
              [{ text: '🌐 История покупок', url: `${SITE_URL}/my-orders` }]
            ]
          }
        }
      );
    }
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    
    // Даже при ошибке добавляем параметр tg_chat
    const webAppUrl = `${SITE_URL}/my-orders?tg_chat=${chatId}`;
    
    await bot.sendMessage(
      chatId,
      'Для просмотра ваших покупок и их статуса, пожалуйста, перейдите на наш сайт:',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📱 Открыть в Telegram', web_app: { url: webAppUrl } }],
            [{ text: '🌐 История покупок', url: `${SITE_URL}/my-orders` }]
          ]
        }
      }
    );
  }
});

// Обработчик для команды "Назад в меню"
bot.onText(/◀️ Назад в меню/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(
    chatId,
    'Выберите нужный раздел из меню:',
    mainMenuKeyboard
  );
});

// Функция для отправки уведомления о платеже
export async function sendPaymentNotification(userIdOrChatId: string, payment: any) {
  try {
    // Преобразуем userIdOrChatId в числовой chatId для Telegram
    let chatId: number;
    
    // Проверка формата - пытаемся преобразовать строку в число
    if (/^\d+$/.test(userIdOrChatId)) {
      chatId = parseInt(userIdOrChatId);
    } else {
      console.error('Некорректный формат идентификатора пользователя:', userIdOrChatId);
      return;
    }
    
    // Получаем информацию о пакете
    const packageInfo = await storage.getDiamondPackage(payment.packageId);
    
    if (!packageInfo) {
      console.error('Пакет не найден:', payment.packageId);
      return;
    }
    
    let statusText = '';
    let emoji = '';
    
    switch (payment.status) {
      case 'completed':
        statusText = 'Оплачен';
        emoji = '✅';
        break;
      case 'pending':
        statusText = 'Ожидает оплаты';
        emoji = '⏳';
        break;
      case 'failed':
        statusText = 'Ошибка оплаты';
        emoji = '❌';
        break;
      case 'cancelled':
        statusText = 'Отменён';
        emoji = '🚫';
        break;
      default:
        statusText = payment.status;
        emoji = '❓';
    }
    
    // Формируем простое сообщение без Markdown разметки
    let statusMessage = '';
    if (payment.status === 'completed') {
      statusMessage = 'Алмазы будут зачислены на ваш аккаунт в течение нескольких минут.';
    } else if (payment.status === 'pending') {
      statusMessage = 'Пожалуйста, завершите оплату для получения алмазов.';
    } else {
      statusMessage = 'При возникновении вопросов, обратитесь в поддержку.';
    }
    
    const message = `${emoji} Информация о платеже #${payment.id}\n\nТовар: ${packageInfo.name}\nСумма: ${payment.amount} ₽\nСтатус: ${statusText}\nID игры: ${payment.gameId}\n\n${statusMessage}`;
    
    const inlineKeyboard: any = [];
    
    // Если платеж ожидает оплаты, добавляем кнопку для перехода к оплате
    if (payment.status === 'pending' && payment.paymentUrl) {
      inlineKeyboard.push([
        { text: '💳 Перейти к оплате', url: `${SITE_URL}${payment.paymentUrl}` }
      ]);
    }
    
    // Добавляем кнопку для перехода на сайт
    inlineKeyboard.push([
      { text: '🌐 Проверить статус на сайте', url: `${SITE_URL}/payment-status/${payment.id}` }
    ]);
    
    // Отправляем сообщение в Telegram без разметки
    await bot.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: inlineKeyboard
      }
    });
    
    console.log(`Уведомление о платеже #${payment.id} успешно отправлено в Telegram (chat_id: ${chatId})`);
  } catch (error) {
    console.error('Ошибка при отправке уведомления о платеже:', error);
  }
}

// Добавляем явный обработчик для всех сообщений для диагностики
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.toLowerCase();
  
  console.log(`Получено сообщение от пользователя ${chatId}: "${text}"`);
  
  // Если это одна из известных команд, не обрабатываем дальше
  if (!text || 
      text === '/start' || 
      text.includes('купить алмазы') || 
      text.includes('ваучеры') || 
      text.includes('эво-пропуски') || 
      text.includes('отзывы') || 
      text.includes('помощь') || 
      text.includes('мои покупки') || 
      text.includes('открыть магазин') ||
      text.includes('назад в меню')) {
    console.log(`Это стандартная команда, будет обработана другим обработчиком`);
    return;
  }
  
  // Это может быть ID игрока, проверим
  if (/^\d{5,12}$/.test(text)) {
    bot.sendMessage(
      chatId,
      `Для покупки алмазов на аккаунт с ID ${text} перейдите на наш сайт:`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🌐 Перейти в магазин', url: `${SITE_URL}?game_id=${text}` }]
          ]
        }
      }
    );
    return;
  }
  
  // Для всех остальных сообщений
  bot.sendMessage(
    chatId,
    'Извините, я не понимаю эту команду. Пожалуйста, используйте меню ниже:',
    mainMenuKeyboard
  );
});

console.log('Telegram бот успешно запущен');

export default bot;