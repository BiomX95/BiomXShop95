import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPromoCodeSchema, insertReviewSchema, insertPaymentSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { bot, SITE_URL, SHOP_NAME, sendPaymentNotification } from "./telegram-bot";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Маршруты для пакетов алмазов
  app.get("/api/diamond-packages", async (req, res) => {
    try {
      const packages = await storage.getDiamondPackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching diamond packages:", error);
      res.status(500).json({ error: "Failed to fetch diamond packages" });
    }
  });

  app.get("/api/diamond-packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pkg = await storage.getDiamondPackage(id);
      
      if (!pkg) {
        return res.status(404).json({ error: "Diamond package not found" });
      }
      
      res.json(pkg);
    } catch (error) {
      console.error("Error fetching diamond package:", error);
      res.status(500).json({ error: "Failed to fetch diamond package" });
    }
  });

  // Маршруты для промокодов
  app.post("/api/promo-codes/validate", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Promo code is required" });
      }
      
      const promoCode = await storage.usePromoCode(code);
      
      if (!promoCode) {
        return res.status(404).json({ error: "Invalid or expired promo code" });
      }
      
      // Преобразуем поле discount в discountPercent для фронтенда
      const responseCode = {
        ...promoCode,
        discountPercent: promoCode.discount
      };
      
      res.json(responseCode);
    } catch (error) {
      console.error("Error validating promo code:", error);
      res.status(500).json({ error: "Failed to validate promo code" });
    }
  });
  
  // Маршрут для создания нового промокода
  app.post("/api/promo-codes", async (req, res) => {
    try {
      const { code, discount, packageId, isPercentage = true, usageLimit = 100, validDays = 30 } = req.body;
      
      if (!code || !discount) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Проверяем, существует ли уже промокод с таким кодом
      const existingPromo = await storage.getPromoCodeByCode(code);
      if (existingPromo) {
        return res.status(400).json({ error: "Promo code already exists" });
      }
      
      // Создаем дату истечения срока действия
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + validDays);
      
      const newPromoCode = await storage.createPromoCode({
        code: code.toUpperCase(),
        discount,
        isPercentage,
        validUntil,
        usageLimit,
        isActive: true,
        packageId: packageId || null
      });
      
      res.status(201).json(newPromoCode);
    } catch (error) {
      console.error("Error creating promo code:", error);
      res.status(500).json({ error: "Failed to create promo code" });
    }
  });
  
  // Маршрут для получения всех промокодов
  app.get("/api/promo-codes", async (req, res) => {
    try {
      const promoCodes = await storage.getPromoCodes();
      res.json(promoCodes);
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      res.status(500).json({ error: "Failed to fetch promo codes" });
    }
  });

  // Маршруты для отзывов
  app.get("/api/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          error: "Validation error", 
          details: validationError.details 
        });
      }
      
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // Маршруты для способов оплаты
  app.get("/api/payment-methods", async (req, res) => {
    try {
      const paymentMethods = await storage.getPaymentMethods();
      res.json(paymentMethods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  });

  // Маршруты для платежей
  app.post("/api/payments", async (req, res) => {
    try {
      const { gameId, email, packageId, paymentMethodId, promoCodeId, amount } = req.body;
      
      // Валидация данных
      if (!gameId || !email || !packageId || !paymentMethodId || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Проверяем, существует ли метод оплаты
      const paymentMethod = await storage.getPaymentMethod(parseInt(paymentMethodId));
      if (!paymentMethod) {
        return res.status(400).json({ error: "Invalid payment method" });
      }
      
      const payment = await storage.createPayment({
        gameId,
        email,
        packageId: parseInt(packageId),
        paymentMethod: paymentMethod.name,
        promoCode: promoCodeId ? promoCodeId.toString() : undefined,
        amount: parseFloat(amount)
      });
      
      // Генерируем URL для имитации платежной страницы
      const paymentUrl = `/simulate-payment?payment_id=${payment.id}&amount=${amount}&game_id=${gameId}`;
      
      // Возвращаем информацию о платеже с URL для оплаты
      res.json({
        ...payment,
        paymentUrl
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ error: "Failed to create payment" });
    }
  });

  app.get("/api/payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const payment = await storage.getPayment(id);
      
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      
      res.json(payment);
    } catch (error) {
      console.error("Error fetching payment:", error);
      res.status(500).json({ error: "Failed to fetch payment" });
    }
  });
  
  // Получение всех платежей (для админ-панели)
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  // Маршрут для имитации обработки платежа
  app.post("/api/simulate-payment", async (req, res) => {
    try {
      const { paymentId, action } = req.body;
      
      if (!paymentId || !action) {
        return res.status(400).json({ error: "Missing payment ID or action" });
      }
      
      const payment = await storage.getPayment(parseInt(paymentId));
      
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      
      let newStatus = "pending";
      
      // В зависимости от выбранного действия, обновляем статус платежа
      if (action === "complete") {
        newStatus = "completed";
      } else if (action === "cancel") {
        newStatus = "cancelled";
      } else if (action === "fail") {
        newStatus = "failed";
      }
      
      // Обновляем статус платежа
      const updatedPayment = await storage.updatePaymentStatus(payment.id, newStatus);
      
      // Если есть обновленный платеж, пробуем отправить уведомление в Telegram
      if (updatedPayment) {
        try {
          // Ищем пользователя по game_id, чтобы получить telegramChatId
          const user = await storage.getUserByGameId(updatedPayment.gameId);
          
          if (user && user.telegramChatId) {
            // Отправляем уведомление в Telegram
            await sendPaymentNotification(user.telegramChatId, updatedPayment);
          } else {
            // Если не найдена связь с Telegram, можем отправить напрямую по game_id
            // (предполагая, что game_id может быть chat_id в Telegram)
            await sendPaymentNotification(updatedPayment.gameId, updatedPayment);
          }
        } catch (telegramError) {
          console.error("Error sending Telegram notification:", telegramError);
          // Не прерываем выполнение даже при ошибке отправки в Telegram
        }
      }
      
      res.json({ success: true, status: newStatus });
    } catch (error) {
      console.error("Error simulating payment:", error);
      res.status(500).json({ error: "Failed to simulate payment" });
    }
  });
  
  // API для получения никнейма игрока по ID
  app.get("/api/user/nickname/:gameId", async (req, res) => {
    try {
      const { gameId } = req.params;
      
      if (!gameId) {
        return res.status(400).json({ error: "Game ID is required" });
      }
      
      const nickname = await storage.getUserNickname(gameId);
      
      res.json({ 
        gameId, 
        nickname: nickname || null
      });
    } catch (error) {
      console.error("Error fetching nickname:", error);
      res.status(500).json({ error: "Failed to fetch nickname" });
    }
  });
  
  // Специальный API для получения никнейма из Free Fire
  app.get("/api/free-fire/nickname/:gameId", async (req, res) => {
    try {
      const { gameId } = req.params;
      
      if (!gameId) {
        return res.status(400).json({ error: "Game ID is required" });
      }
      
      // Импортируем API модуль для работы с Free Fire напрямую
      const { freeFireAPI } = await import('./freefire-api');
      
      // Получаем никнейм через Free Fire API
      const nickname = await freeFireAPI.getPlayerNickname(gameId);
      
      res.json({ 
        gameId, 
        nickname: nickname || null
      });
    } catch (error) {
      console.error("Error fetching Free Fire nickname:", error);
      res.status(500).json({ error: "Failed to fetch nickname from Free Fire" });
    }
  });
  
  // API для обновления никнейма для конкретного ID (админ функция)
  app.post("/api/free-fire/update-nickname", async (req, res) => {
    try {
      const { gameId, nickname } = req.body;
      
      if (!gameId || !nickname) {
        return res.status(400).json({ error: "Game ID and nickname are required" });
      }
      
      // В реальном приложении здесь должна быть проверка авторизации администратора
      // if (!req.isAuthenticated() || !req.user.isAdmin) {
      //   return res.status(403).json({ error: "Unauthorized" });
      // }
      
      // Импортируем API модуль для работы с Free Fire напрямую
      const { freeFireAPI } = await import('./freefire-api');
      
      // Обновляем никнейм через API
      const success = await freeFireAPI.updateNickname(gameId, nickname);
      
      if (success) {
        res.json({ 
          success: true,
          gameId, 
          nickname,
          message: "Никнейм успешно обновлен"
        });
      } else {
        res.status(500).json({ error: "Не удалось обновить никнейм" });
      }
    } catch (error) {
      console.error("Error updating Free Fire nickname:", error);
      res.status(500).json({ error: "Failed to update nickname" });
    }
  });
  
  // API для получения списка известных никнеймов
  app.get("/api/free-fire/known-nicknames", async (req, res) => {
    try {
      // Импортируем API модуль для работы с Free Fire
      const { freeFireAPI } = await import('./freefire-api');
      
      // Получаем список всех известных никнеймов
      const nicknames = freeFireAPI.getKnownNicknames();
      
      res.json({ 
        success: true,
        nicknames
      });
    } catch (error) {
      console.error("Error fetching known nicknames:", error);
      res.status(500).json({ error: "Failed to fetch known nicknames" });
    }
  });
  
  // API для проверки никнейма игрока из разных источников
  app.get("/api/free-fire/check-nickname/:gameId", async (req, res) => {
    try {
      const { gameId } = req.params;
      const forceRefresh = req.query.force === 'true';
      
      if (!gameId) {
        return res.status(400).json({ error: "Game ID is required" });
      }
      
      // Создаем массив для результатов с разных источников
      const results = [];
      
      // Список источников для проверки
      const sources = [
        { name: 'donatov.net', url: `https://donatov.net/api/nickname/${gameId}` },
        { name: 'donatov.net (альт)', url: `https://donatov.net/api/user/nickname/${gameId}` },
        { name: 'shop.garena.in', url: `https://shop.garena.in/api/userData/player?uid=${gameId}` },
        { name: 'kzshop.garena.com', url: `https://kzshop.garena.com/api/userData/player?uid=${gameId}` },
        { name: 'ffgarena.com', url: `https://www.ffgarena.com/api.php?playerinfo=${gameId}` },
        { name: 'booyah.live', url: `https://api.booyah.live/api/v3/users/gameprofile?game=freefire&gameuid=${gameId}` },
        { name: 'sportskeeda', url: `https://www.sportskeeda.com/free-fire/api/player/${gameId}` }
      ];
      
      // Проверяем каждый источник
      for (const source of sources) {
        try {
          const axios = (await import('axios')).default;
          
          console.log(`Проверка никнейма для ID ${gameId} из источника ${source.name}`);
          
          const response = await axios.get(source.url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'application/json, text/html, */*',
              'Referer': source.url.split('/').slice(0, 3).join('/')
            },
            timeout: 8000,
            validateStatus: () => true // чтобы не выбрасывало ошибки при статусах 4xx/5xx
          });
          
          const result: {
            source: string,
            url: string,
            status: number,
            success: boolean,
            nickname: string | null,
            error: string | null,
            responseData: string | null
          } = {
            source: source.name,
            url: source.url,
            status: response.status,
            success: response.status >= 200 && response.status < 300,
            nickname: null,
            error: null,
            responseData: null
          };
          
          if (result.success) {
            if (response.data) {
              result.responseData = typeof response.data === 'object' 
                ? JSON.stringify(response.data).substring(0, 1000) 
                : (response.data.toString().substring(0, 1000));
              
              // Пытаемся извлечь никнейм из разных форматов данных
              if (typeof response.data === 'object') {
                const extractedNickname = 
                  response.data.nickname || 
                  response.data.name || 
                  response.data.username ||
                  (response.data.result && (response.data.result.nickname || response.data.result.name)) || null;
                
                result.nickname = extractedNickname;
              }
            }
          } else {
            result.error = `HTTP Error ${response.status}`;
          }
          
          results.push(result);
        } catch (error: any) {
          results.push({
            source: source.name,
            url: source.url,
            status: 0,
            success: false,
            nickname: null,
            error: error.message || 'Unknown error',
            responseData: null
          });
        }
      }
      
      // Получаем никнейм из нашего API для сравнения
      const { freeFireAPI } = await import('./freefire-api');
      // Раньше здесь был метод refreshPlayerNickname, но мы его удалили
      // При использовании force=true просто запрашиваем никнейм заново
      const ourNickname = await freeFireAPI.getPlayerNickname(gameId);
      
      res.json({
        gameId,
        ourNickname,
        results,
        isForceRefresh: forceRefresh
      });
    } catch (error: any) {
      console.error("Error checking nicknames:", error);
      res.status(500).json({ 
        error: "Failed to check nicknames",
        message: error.message  
      });
    }
  });

  // Маршруты для работы с Telegram
  app.post("/api/telegram/link", async (req, res) => {
    try {
      const { gameId, chatId } = req.body;
      
      if (!gameId || !chatId) {
        return res.status(400).json({ error: "Missing gameId or chatId" });
      }
      
      // Ищем пользователя по game_id
      let user = await storage.getUserByGameId(gameId);
      
      if (user) {
        // Обновляем telegramChatId для существующего пользователя
        user = await storage.updateUserTelegramChatId(user.id, chatId);
        
        if (!user) {
          return res.status(500).json({ error: "Failed to update user" });
        }
      } else {
        // Создаем нового пользователя, если не существует
        // Генерируем случайный пароль, так как он все равно не будет использоваться
        const randomPassword = Math.random().toString(36).slice(-8);
        
        user = await storage.createUser({
          username: `tg_${gameId}`,
          password: randomPassword,
          gameId,
          telegramChatId: chatId
        });
      }
      
      res.json({ success: true, user: { id: user.id, gameId: user.gameId } });
    } catch (error) {
      console.error("Error linking Telegram account:", error);
      res.status(500).json({ error: "Failed to link Telegram account" });
    }
  });
  
  // Маршрут для прямой отправки тестового уведомления Telegram
  app.post("/api/telegram/send-test", async (req, res) => {
    try {
      const { paymentId, chatId } = req.body;
      
      if (!paymentId) {
        return res.status(400).json({ error: "Payment ID is required" });
      }
      
      const payment = await storage.getPayment(parseInt(paymentId));
      
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      
      // Если указан конкретный chatId, отправляем на него
      // В противном случае пытаемся найти пользователя по gameId
      if (chatId) {
        await sendPaymentNotification(chatId, payment);
      } else {
        const user = await storage.getUserByGameId(payment.gameId);
        
        if (user && user.telegramChatId) {
          await sendPaymentNotification(user.telegramChatId, payment);
        } else {
          return res.status(404).json({ error: "No associated Telegram chat found for this user" });
        }
      }
      
      res.json({ success: true, message: "Notification sent successfully" });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({ error: "Failed to send test notification" });
    }
  });
  
  // Маршрут для получения истории платежей пользователя по gameId
  app.get("/api/telegram/payments/:gameId", async (req, res) => {
    try {
      const { gameId } = req.params;
      
      if (!gameId) {
        return res.status(400).json({ error: "GameId is required" });
      }
      
      const payments = await storage.getPaymentsByGameId(gameId);
      
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments for Telegram:", error);
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });
  
  // API для проверки статуса Telegram-бота
  app.get("/api/telegram/status", async (req, res) => {
    try {
      // Получаем информацию о боте (если возможно)
      let botInfo = null;
      try {
        // Используем типизацию для поддержки разных версий библиотеки
        botInfo = await (bot as any).getMe();
      } catch (e) {
        console.log('Не удалось получить информацию о боте:', e);
      }
      
      // Формируем ответ со статусом и конфигурацией
      const response = {
        status: 'active',
        bot: botInfo ? {
          username: botInfo.username,
          first_name: botInfo.first_name,
          id: botInfo.id,
          is_bot: botInfo.is_bot
        } : {
          username: 'unknown',
          first_name: 'Unknown',
          id: 0,
          is_bot: true
        },
        configuration: {
          site_url: SITE_URL,
          webhook_mode: false,
          polling_mode: true,
          tg_app_url: `${SITE_URL}/tg-app.html`,
          shop_name: SHOP_NAME
        },
        uptime: process.uptime()
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Ошибка при получении статуса Telegram-бота:', error);
      res.status(500).json({ 
        status: 'error',
        error: 'Не удалось получить статус Telegram-бота',
        details: error.message || 'Неизвестная ошибка',
        uptime: process.uptime()
      });
    }
  });
  
  // Маршрут для Telegram Web App - специальная обработка
  app.get("/telegram-web-app", (req, res) => {
    const gameId = req.query.game_id || '';
    const page = req.query.page || '';
    const tgChat = req.query.tg_chat || '';
    
    console.log(`[TELEGRAM_WEBAPP] Запрос к Telegram WebApp. Game ID: ${gameId}, TG Chat: ${tgChat}, Page: ${page}`);
    
    // Добавляем полный путь для точного логирования
    const filePath = path.resolve('./client/public/telegram-web-app.html');
    console.log(`[TELEGRAM_WEBAPP] Отправляю файл: ${filePath}`);
    
    // Проверяем существование файла перед отправкой
    const fs = require('fs');
    if (fs.existsSync(filePath)) {
      console.log(`[TELEGRAM_WEBAPP] Файл существует и будет отправлен`);
    } else {
      console.log(`[TELEGRAM_WEBAPP] ОШИБКА: Файл не существует!`);
    }
    
    // Устанавливаем заголовки для избежания кеширования и проблем с CORS
    res.set({
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*'
    });
    
    // Отправляем файл напрямую
    res.sendFile(filePath, (err) => {
      if (err) {
        console.log(`[TELEGRAM_WEBAPP] ОШИБКА при отправке файла: ${err.message}`);
        // Если произошла ошибка, отправляем простой HTML
        res.status(500).send(`
          <html>
            <head><title>BiomX Shop - Ошибка</title></head>
            <body style="text-align:center;padding:20px;">
              <h2>Произошла ошибка при загрузке приложения</h2>
              <p>Попробуйте обновить страницу или перейти на основной сайт</p>
              <a href="https://free-fire-diamonds.replit.app" style="display:inline-block;margin-top:20px;padding:10px 15px;background-color:#f71a2c;color:white;text-decoration:none;border-radius:5px;">Открыть основной сайт</a>
            </body>
          </html>
        `);
      }
    });
  });
  
  // Маршрут для тестирования Telegram Web App в браузере
  app.get("/test-telegram", (req, res) => {
    // Название магазина
    const SHOP_NAME = 'BiomX_Shop';
    // Абсолютный URL для надежного перенаправления
    const baseUrl = req.protocol + '://' + req.get('host');
    // Перенаправляем на главную страницу с параметром telegram=true и добавляем название магазина
    res.redirect(`${baseUrl}/?telegram=true&shop=${SHOP_NAME}`);
  });
  
  // Маршрут для страницы статуса Telegram-бота
  app.get("/bot-status", (req, res) => {
    const filePath = path.resolve('./client/public/telegram-bot-status.html');
    
    // Установка заголовков для предотвращения кеширования
    res.set({
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    // Отправка файла
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Ошибка при отправке страницы статуса бота:", err);
        res.status(500).send("Ошибка при загрузке страницы статуса");
      }
    });
  });
  
  // Маршрут для админской страницы управления никнеймами
  app.get("/nickname-admin", (req, res) => {
    const filePath = path.resolve('./client/public/nickname-admin.html');
    
    // Установка заголовков для предотвращения кеширования
    res.set({
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    // Отправка файла
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Ошибка при отправке страницы управления никнеймами:", err);
        res.status(500).send("Ошибка при загрузке страницы управления никнеймами");
      }
    });
  });
  
  // Маршрут для страницы проверки никнеймов
  app.get("/nickname-checker", (req, res) => {
    // Перенаправляем на .html версию, которую обрабатываем в index.ts
    // для обхода Vite middleware
    res.redirect('/nickname-checker.html');
  });

  // Минимальный обработчик для проверки доступности SPA
  app.get('/', (req, res, next) => {
    next(); // Передаем управление дальше без лишнего логирования
  });

  // Создаем HTTP сервер
  
  // API маршруты для системы чата
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const { gameId } = req.query;
      
      if (!gameId) {
        return res.status(400).json({ error: "Game ID is required" });
      }
      
      const messages = await storage.getChatMessages(gameId as string);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });
  
  app.post("/api/chat/messages", async (req, res) => {
    try {
      const { gameId, text, sender } = req.body;
      
      if (!gameId || !text || !sender) {
        return res.status(400).json({ error: "Game ID, text and sender are required" });
      }
      
      const message = await storage.createChatMessage({
        gameId,
        text,
        sender,
        isRead: false
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ error: "Failed to create chat message" });
    }
  });
  
  app.post("/api/chat/messages/admin", async (req, res) => {
    try {
      const { gameId, text } = req.body;
      
      if (!gameId || !text) {
        return res.status(400).json({ error: "Game ID and text are required" });
      }
      
      // В реальном приложении здесь должна быть проверка авторизации администратора
      // if (!req.isAuthenticated() || !req.user.isAdmin) {
      //   return res.status(403).json({ error: "Unauthorized" });
      // }
      
      const message = await storage.createChatMessage({
        gameId,
        text,
        sender: 'admin',
        isRead: true // Сообщения от админа сразу считаются прочитанными
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating admin chat message:", error);
      res.status(500).json({ error: "Failed to create admin chat message" });
    }
  });
  
  app.get("/api/chat/users", async (req, res) => {
    try {
      // В реальном приложении здесь должна быть проверка авторизации администратора
      // if (!req.isAuthenticated() || !req.user.isAdmin) {
      //   return res.status(403).json({ error: "Unauthorized" });
      // }
      
      const users = await storage.getChatUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching chat users:", error);
      res.status(500).json({ error: "Failed to fetch chat users" });
    }
  });
  
  app.post("/api/chat/messages/read", async (req, res) => {
    try {
      const { gameId } = req.body;
      
      if (!gameId) {
        return res.status(400).json({ error: "Game ID is required" });
      }
      
      // В реальном приложении здесь должна быть проверка авторизации администратора
      // if (!req.isAuthenticated() || !req.user.isAdmin) {
      //   return res.status(403).json({ error: "Unauthorized" });
      // }
      
      const success = await storage.markChatMessagesAsRead(gameId);
      
      if (success) {
        res.json({ success: true, message: "Messages marked as read" });
      } else {
        res.status(500).json({ error: "Failed to mark messages as read" });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ error: "Failed to mark messages as read" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
