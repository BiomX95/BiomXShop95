import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from "cors";
import path from "path";
import fs from "fs";
import "./telegram-bot"; // Включаем Telegram-бот

const app = express();

// Расширенные настройки CORS для совместимости со всеми браузерами без VPN
app.use(
  cors({
    origin: true, // Автоматическое соответствие запрашивающему источнику
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Origin",
      "Accept",
    ],
    credentials: true, // Разрешаем передачу учетных данных
    maxAge: 86400, // Кэширование preflight запросов на 24 часа
  }),
);

// Дополнительный обработчик для браузеров, которые строго соблюдают правила CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  );

  // Обработка предварительных запросов OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Простой маршрут для обычной HTML-страницы Telegram Web App (старая версия)
app.get("/telegram-web-app.html", (req, res) => {
  console.log(
    "[DIRECT_HTML] Запрос к файлу telegram-web-app.html с параметрами:",
    req.query,
  );

  // Используем более надежный метод для определения пути к файлу
  const filePath = path.resolve("./client/public/telegram-web-app.html");

  // Задаем все необходимые заголовки для предотвращения проблем с CORS и кешированием
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  // Разрешаем доступ со всех источников
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Пытаемся прочитать и отправить файл
  if (fs.existsSync(filePath)) {
    console.log(`[DIRECT_HTML] Файл найден: ${filePath}`);

    try {
      // Используем синхронное чтение для упрощения обработки ошибок
      const data = fs.readFileSync(filePath, "utf8");
      console.log(
        `[DIRECT_HTML] Файл успешно прочитан (${data.length} байт), отправка...`,
      );
      res.send(data);
      console.log(`[DIRECT_HTML] Файл успешно отправлен клиенту`);
    } catch (err) {
      console.error(`[DIRECT_HTML] ОШИБКА при чтении файла:`, err);
      res.status(500).send("Ошибка при чтении файла для Telegram Web App");
    }
  } else {
    console.error(
      `[DIRECT_HTML] КРИТИЧЕСКАЯ ОШИБКА: Файл НЕ СУЩЕСТВУЕТ по пути: ${filePath}`,
    );
    res.status(404).send("Файл Telegram Web App не найден на сервере");
  }
});

// Новый упрощенный маршрут для Telegram Web App
app.get("/tg-app.html", (req, res) => {
  console.log(
    "[TG-APP] Запрос к упрощенному интерфейсу Telegram с параметрами:",
    req.query,
  );

  const filePath = path.resolve("./client/public/tg-app.html");

  // Базовые заголовки для предотвращения проблем
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Пытаемся прочитать и отправить файл синхронно
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      console.log(
        `[TG-APP] Файл успешно прочитан (${data.length} байт) и отправлен`,
      );
      res.send(data);
    } else {
      console.error(`[TG-APP] ОШИБКА: Файл не найден по пути: ${filePath}`);
      res.status(404).send("Файл не найден");
    }
  } catch (err) {
    console.error(`[TG-APP] ОШИБКА при чтении/отправке файла:`, err);
    res.status(500).send("Произошла ошибка на сервере");
  }
});

// Маршрут для страницы проверки никнеймов (прямой доступ)
app.get("/nickname-checker.html", (req, res) => {
  console.log(
    "[NICKNAME-CHECKER] Запрос к странице проверки никнеймов с параметрами:",
    req.query,
  );

  const filePath = path.resolve("./client/public/nickname-checker.html");

  // Базовые заголовки для предотвращения проблем
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Пытаемся прочитать и отправить файл синхронно
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      console.log(
        `[NICKNAME-CHECKER] Файл успешно прочитан (${data.length} байт) и отправлен`,
      );
      res.send(data);
    } else {
      console.error(
        `[NICKNAME-CHECKER] ОШИБКА: Файл не найден по пути: ${filePath}`,
      );
      res.status(404).send("Файл не найден");
    }
  } catch (err) {
    console.error(`[NICKNAME-CHECKER] ОШИБКА при чтении/отправке файла:`, err);
    res.status(500).send("Произошла ошибка на сервере");
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);

      // Добавим информацию о URL
      const replitUrl = process.env.REPL_SLUG
        ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
        : null;
      if (replitUrl) {
        log(`Доступ к приложению: ${replitUrl}`);
      }
    },
  );
})();
