import { users, 
  type User, type InsertUser,
  type DiamondPackage, type InsertDiamondPackage,
  type PromoCode, type InsertPromoCode,
  type Review, type InsertReview, 
  type Payment, type InsertPayment,
  type PaymentMethod, type InsertPaymentMethod,
  type ChatMessage, type InsertChatMessage,
  diamondPackageTypes
} from "@shared/schema";

// Вспомогательная функция для преобразования undefined в null
function nullifyUndefined<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // Методы для работы с пользователями
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGameId(gameId: string): Promise<User | undefined>;
  getUserByTelegramChatId(chatId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserTelegramChatId(userId: number, chatId: string): Promise<User | undefined>;
  getUserNickname(gameId: string): Promise<string | null>;
  
  // Методы для работы с пакетами алмазов
  getDiamondPackages(): Promise<DiamondPackage[]>;
  getDiamondPackage(id: number): Promise<DiamondPackage | undefined>;
  createDiamondPackage(pkg: InsertDiamondPackage): Promise<DiamondPackage>;
  updateDiamondPackage(id: number, pkg: Partial<InsertDiamondPackage>): Promise<DiamondPackage | undefined>;
  deleteDiamondPackage(id: number): Promise<boolean>;
  
  // Методы для работы с промокодами
  getPromoCodes(): Promise<PromoCode[]>;
  getPromoCode(id: number): Promise<PromoCode | undefined>;
  getPromoCodeByCode(code: string): Promise<PromoCode | undefined>;
  createPromoCode(code: InsertPromoCode): Promise<PromoCode>;
  updatePromoCode(id: number, code: Partial<InsertPromoCode>): Promise<PromoCode | undefined>;
  deletePromoCode(id: number): Promise<boolean>;
  usePromoCode(code: string): Promise<PromoCode | undefined>;
  
  // Методы для работы с отзывами
  getReviews(): Promise<Review[]>;
  getReview(id: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  verifyReview(id: number): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;
  
  // Методы для работы с платежами
  getPayments(): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByUserId(userId: number): Promise<Payment[]>;
  getPaymentsByGameId(gameId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<Payment | undefined>;
  
  // Методы для работы с методами оплаты
  getPaymentMethods(): Promise<PaymentMethod[]>;
  getPaymentMethod(id: number): Promise<PaymentMethod | undefined>;
  createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: number, method: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined>;
  deletePaymentMethod(id: number): Promise<boolean>;
  
  // Методы для работы с чатом
  getChatMessages(gameId: string): Promise<ChatMessage[]>;
  getChatMessagesForAdmin(): Promise<{ gameId: string, messages: ChatMessage[] }[]>;
  getChatUsers(): Promise<{ 
    gameId: string; 
    nickname?: string; 
    lastMessage: string; 
    unreadCount: number; 
    lastActivityAt: Date; 
  }[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markChatMessagesAsRead(gameId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private diamondPackages: Map<number, DiamondPackage>;
  private promoCodes: Map<number, PromoCode>;
  private reviews: Map<number, Review>;
  private payments: Map<number, Payment>;
  private paymentMethods: Map<number, PaymentMethod>;
  private chatMessages: Map<number, ChatMessage>;
  
  private userCurrentId: number;
  private diamondPackageCurrentId: number;
  private promoCodeCurrentId: number;
  private reviewCurrentId: number;
  private paymentCurrentId: number;
  private paymentMethodCurrentId: number;
  private chatMessageCurrentId: number;

  constructor() {
    this.users = new Map();
    this.diamondPackages = new Map();
    this.promoCodes = new Map();
    this.reviews = new Map();
    this.payments = new Map();
    this.paymentMethods = new Map();
    this.chatMessages = new Map();
    
    this.userCurrentId = 1;
    this.diamondPackageCurrentId = 1;
    this.promoCodeCurrentId = 1;
    this.reviewCurrentId = 1;
    this.paymentCurrentId = this.paymentMethodCurrentId = 1;
    this.chatMessageCurrentId = 1;
    
    // Добавление тестовых данных для пакетов алмазов
    this.initDiamondPackages();
    this.initPaymentMethods();
  }

  // Инициализация тестовых данных для пакетов алмазов
  private initDiamondPackages() {
    const packages: InsertDiamondPackage[] = [
      // Алмазы
      {
        name: "100 + 5 алмазов",
        amount: 105,
        price: 90,
        discount: 0,
        isPopular: false,
        imageUrl: "/diamonds/small.png",
        type: diamondPackageTypes.DIAMONDS
      },
      {
        name: "310 + 16 алмазов",
        amount: 326,
        price: 260,
        discount: 0,
        isPopular: true,
        imageUrl: "/diamonds/medium.png",
        type: diamondPackageTypes.DIAMONDS
      },
      {
        name: "520 + 26 алмазов",
        type: diamondPackageTypes.DIAMONDS,
        amount: 546,
        price: 429,
        discount: 0,
        isPopular: false,
        imageUrl: "/diamonds/large.png"
      },
      {
        name: "1060 + 53 алмазов",
        type: diamondPackageTypes.DIAMONDS,
        amount: 1113,
        price: 849,
        discount: 0,
        isPopular: false,
        imageUrl: "/diamonds/huge.png"
      },
      {
        name: "2180 + 218 алмазов",
        type: diamondPackageTypes.DIAMONDS,
        amount: 2398,
        price: 1700,
        discount: 0,
        isPopular: false,
        imageUrl: "/diamonds/mega.png"
      },
      {
        name: "5600 + 560 алмазов",
        type: diamondPackageTypes.DIAMONDS,
        amount: 6160,
        price: 4390,
        discount: 0,
        isPopular: false,
        imageUrl: "/diamonds/ultra.png"
      },
      // Ваучеры
      {
        name: "Ваучер Лайт",
        type: diamondPackageTypes.VOUCHER,
        amount: 0,
        price: 60,
        discount: 0,
        isPopular: false,
        imageUrl: "/diamonds/voucher_light.png"
      },
      {
        name: "Ваучер на неделю",
        type: diamondPackageTypes.VOUCHER,
        amount: 0,
        price: 180,
        discount: 0,
        isPopular: false,
        imageUrl: "/diamonds/voucher_week.png"
      },
      {
        name: "Ваучер на месяц",
        type: diamondPackageTypes.VOUCHER,
        amount: 0,
        price: 800,
        discount: 0,
        isPopular: false,
        imageUrl: "/diamonds/voucher_month.png"
      },
      // Пропуски Эво
      {
        name: "Эво-пропуск на 3 дня (с входом)",
        type: diamondPackageTypes.EVO_PASS,
        amount: 0,
        price: 49,
        discount: 0,
        isPopular: false,
        imageUrl: "/diamonds/evo_3days.png"
      },
      {
        name: "Эво-пропуск на 7 дней (без входа)",
        type: diamondPackageTypes.EVO_PASS,
        amount: 0,
        price: 95,
        discount: 0,
        isPopular: false,
        imageUrl: "/diamonds/evo_7days.png"
      },
      {
        name: "Эво-пропуск на 30 дней (с входом)",
        type: diamondPackageTypes.EVO_PASS,
        amount: 0,
        price: 249,
        discount: 0,
        isPopular: false,
        imageUrl: "/diamonds/evo_30days.png"
      }
    ];
    
    packages.forEach(pkg => this.createDiamondPackage(pkg));
  }

  // Инициализация методов оплаты
  private initPaymentMethods() {
    const methods: InsertPaymentMethod[] = [
      {
        name: "Visa/Mastercard",
        type: "bank",
        logoUrl: "/payment/card.png",
        isActive: true,
        sortOrder: 1
      },
      {
        name: "QIWI",
        type: "ewallet",
        logoUrl: "/payment/qiwi.png",
        isActive: true,
        sortOrder: 2
      },
      {
        name: "Сбербанк",
        type: "bank",
        logoUrl: "/payment/sberbank.png",
        isActive: true,
        sortOrder: 3
      },
      {
        name: "Яндекс Деньги",
        type: "ewallet",
        logoUrl: "/payment/yandex.png",
        isActive: true,
        sortOrder: 4
      },
      {
        name: "WebMoney",
        type: "ewallet",
        logoUrl: "/payment/webmoney.png",
        isActive: true,
        sortOrder: 5
      }
    ];
    
    methods.forEach(method => this.createPaymentMethod(method));
  }

  // Методы для работы с пользователями
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByGameId(gameId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.gameId === gameId,
    );
  }

  async getUserByTelegramChatId(chatId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.telegramChatId === chatId,
    );
  }

  async updateUserTelegramChatId(userId: number, chatId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { ...user, telegramChatId: chatId };
    this.users.set(userId, updatedUser);
    
    return updatedUser;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const createdAt = new Date();
    
    // Создаем объект с преобразованием undefined в null
    const user: User = { 
      id, 
      createdAt,
      username: insertUser.username,
      password: insertUser.password,
      email: nullifyUndefined(insertUser.email),
      gameId: nullifyUndefined(insertUser.gameId),
      telegramChatId: nullifyUndefined(insertUser.telegramChatId)
    };
    
    this.users.set(id, user);
    return user;
  }
  
  // Методы для работы с пакетами алмазов
  async getDiamondPackages(): Promise<DiamondPackage[]> {
    return Array.from(this.diamondPackages.values());
  }
  
  async getDiamondPackage(id: number): Promise<DiamondPackage | undefined> {
    return this.diamondPackages.get(id);
  }
  
  async createDiamondPackage(pkg: InsertDiamondPackage): Promise<DiamondPackage> {
    const id = this.diamondPackageCurrentId++;
    
    // Создаем объект с преобразованием undefined в null
    const diamondPackage: DiamondPackage = { 
      id,
      name: pkg.name,
      amount: pkg.amount,
      price: pkg.price,
      type: nullifyUndefined(pkg.type),
      discount: nullifyUndefined(pkg.discount),
      isPopular: nullifyUndefined(pkg.isPopular),
      imageUrl: nullifyUndefined(pkg.imageUrl)
    };
    
    this.diamondPackages.set(id, diamondPackage);
    return diamondPackage;
  }
  
  async updateDiamondPackage(id: number, pkg: Partial<InsertDiamondPackage>): Promise<DiamondPackage | undefined> {
    const diamondPackage = this.diamondPackages.get(id);
    
    if (!diamondPackage) {
      return undefined;
    }
    
    const updatedPackage = { ...diamondPackage, ...pkg };
    this.diamondPackages.set(id, updatedPackage);
    
    return updatedPackage;
  }
  
  async deleteDiamondPackage(id: number): Promise<boolean> {
    return this.diamondPackages.delete(id);
  }
  
  // Методы для работы с промокодами
  async getPromoCodes(): Promise<PromoCode[]> {
    return Array.from(this.promoCodes.values());
  }
  
  async getPromoCode(id: number): Promise<PromoCode | undefined> {
    return this.promoCodes.get(id);
  }
  
  async getPromoCodeByCode(code: string): Promise<PromoCode | undefined> {
    return Array.from(this.promoCodes.values()).find(
      (promoCode) => promoCode.code.toLowerCase() === code.toLowerCase(),
    );
  }
  
  async createPromoCode(code: InsertPromoCode): Promise<PromoCode> {
    const id = this.promoCodeCurrentId++;
    
    const promoCode: PromoCode = { 
      id,
      code: code.code,
      discount: code.discount,
      // Устанавливаем начальное значение счетчика использования
      usageCount: null,
      isPercentage: nullifyUndefined(code.isPercentage),
      validUntil: nullifyUndefined(code.validUntil),
      usageLimit: nullifyUndefined(code.usageLimit),
      isActive: nullifyUndefined(code.isActive),
      packageId: nullifyUndefined(code.packageId)
    };
    
    this.promoCodes.set(id, promoCode);
    return promoCode;
  }
  
  async updatePromoCode(id: number, code: Partial<InsertPromoCode>): Promise<PromoCode | undefined> {
    const promoCode = this.promoCodes.get(id);
    
    if (!promoCode) {
      return undefined;
    }
    
    const updatedPromoCode = { ...promoCode, ...code };
    this.promoCodes.set(id, updatedPromoCode);
    
    return updatedPromoCode;
  }
  
  async deletePromoCode(id: number): Promise<boolean> {
    return this.promoCodes.delete(id);
  }
  
  async usePromoCode(code: string): Promise<PromoCode | undefined> {
    const promoCode = await this.getPromoCodeByCode(code);
    
    if (!promoCode) {
      return undefined;
    }
    
    // Проверка срока действия промокода
    if (promoCode.validUntil && new Date() > promoCode.validUntil) {
      return undefined;
    }
    
    // Проверка лимита использования
    if (promoCode.usageLimit && (promoCode.usageCount ?? 0) >= promoCode.usageLimit) {
      return undefined;
    }
    
    // Проверка активности промокода
    if (!promoCode.isActive) {
      return undefined;
    }
    
    // Увеличение счетчика использования
    const currentCount = promoCode.usageCount ?? 0;
    const updatedPromoCode = { ...promoCode, usageCount: currentCount + 1 };
    this.promoCodes.set(promoCode.id, updatedPromoCode);
    
    return updatedPromoCode;
  }
  
  // Методы для работы с отзывами
  async getReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values());
  }
  
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewCurrentId++;
    const createdAt = new Date();
    
    const fullReview: Review = { 
      id, 
      createdAt,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      userId: nullifyUndefined(review.userId),
      isVerified: false
    };
    
    this.reviews.set(id, fullReview);
    return fullReview;
  }
  
  async verifyReview(id: number): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    
    if (!review) {
      return undefined;
    }
    
    const updatedReview = { ...review, isVerified: true };
    this.reviews.set(id, updatedReview);
    
    return updatedReview;
  }
  
  async deleteReview(id: number): Promise<boolean> {
    return this.reviews.delete(id);
  }
  
  // Методы для работы с платежами
  async getPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }
  
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
  
  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.userId === userId,
    );
  }
  
  async getPaymentsByGameId(gameId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.gameId === gameId,
    );
  }
  
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.paymentCurrentId++;
    const createdAt = new Date();
    const transactionId = `trx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const fullPayment: Payment = { 
      id, 
      createdAt, 
      status: "pending",
      gameId: payment.gameId,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      packageId: payment.packageId || null,
      email: nullifyUndefined(payment.email),
      userId: nullifyUndefined(payment.userId),
      promoCode: nullifyUndefined(payment.promoCode),
      transactionId
    };
    
    this.payments.set(id, fullPayment);
    return fullPayment;
  }
  
  async updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    
    if (!payment) {
      return undefined;
    }
    
    const updatedPayment = { 
      ...payment, 
      status, 
      transactionId: transactionId || payment.transactionId 
    };
    this.payments.set(id, updatedPayment);
    
    return updatedPayment;
  }
  
  // Методы для работы с методами оплаты
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values())
      .filter(method => method.isActive)
      .sort((a, b) => {
        // Безопасная сортировка с учетом возможных null значений
        const sortOrderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
        const sortOrderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
        return sortOrderA - sortOrderB;
      });
  }
  
  async getPaymentMethod(id: number): Promise<PaymentMethod | undefined> {
    return this.paymentMethods.get(id);
  }
  
  async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = this.paymentMethodCurrentId++;
    
    const paymentMethod: PaymentMethod = { 
      id,
      name: method.name,
      type: method.type,
      isActive: nullifyUndefined(method.isActive),
      logoUrl: nullifyUndefined(method.logoUrl),
      sortOrder: nullifyUndefined(method.sortOrder)
    };
    
    this.paymentMethods.set(id, paymentMethod);
    return paymentMethod;
  }
  
  async updatePaymentMethod(id: number, method: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined> {
    const paymentMethod = this.paymentMethods.get(id);
    
    if (!paymentMethod) {
      return undefined;
    }
    
    const updatedMethod = { ...paymentMethod, ...method };
    this.paymentMethods.set(id, updatedMethod);
    
    return updatedMethod;
  }
  
  async deletePaymentMethod(id: number): Promise<boolean> {
    return this.paymentMethods.delete(id);
  }

  // Метод для получения никнейма пользователя по ID игры
  async getUserNickname(gameId: string): Promise<string | null> {
    try {
      // Импортируем API модуль для работы с Free Fire
      const { freeFireAPI } = await import('./freefire-api');
      
      // Получаем никнейм через наш API модуль
      const nickname = await freeFireAPI.getPlayerNickname(gameId);
      return nickname;
    } catch (error) {
      console.error(`Ошибка при получении никнейма для ID ${gameId}:`, error);
      return null;
    }
  }

  // Методы для работы с чатом
  async getChatMessages(gameId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.gameId === gameId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getChatMessagesForAdmin(): Promise<{ gameId: string, messages: ChatMessage[] }[]> {
    // Группируем сообщения по gameId
    const messagesByGameId = new Map<string, ChatMessage[]>();
    
    Array.from(this.chatMessages.values()).forEach(message => {
      if (!messagesByGameId.has(message.gameId)) {
        messagesByGameId.set(message.gameId, []);
      }
      messagesByGameId.get(message.gameId)!.push(message);
    });
    
    // Преобразуем Map в массив объектов
    return Array.from(messagesByGameId.entries()).map(([gameId, messages]) => ({
      gameId,
      messages: messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    }));
  }

  async getChatUsers(): Promise<{ 
    gameId: string; 
    nickname?: string; 
    lastMessage: string; 
    unreadCount: number; 
    lastActivityAt: Date; 
  }[]> {
    // Группируем сообщения по gameId
    const messagesByGameId = new Map<string, ChatMessage[]>();
    
    Array.from(this.chatMessages.values()).forEach(message => {
      if (!messagesByGameId.has(message.gameId)) {
        messagesByGameId.set(message.gameId, []);
      }
      messagesByGameId.get(message.gameId)!.push(message);
    });
    
    // Получаем информацию о пользователях чата
    const chatUsers = await Promise.all(
      Array.from(messagesByGameId.entries()).map(async ([gameId, messages]) => {
        // Сортируем сообщения по времени создания
        const sortedMessages = messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        
        // Получаем последнее сообщение
        const lastMessage = sortedMessages[sortedMessages.length - 1];
        
        // Считаем непрочитанные сообщения от пользователя
        const unreadCount = sortedMessages
          .filter(msg => msg.sender === 'user' && !msg.isRead)
          .length;
        
        // Получаем никнейм пользователя
        const nickname = await this.getUserNickname(gameId);
        
        return {
          gameId,
          nickname: nickname || undefined,
          lastMessage: lastMessage.text,
          unreadCount,
          lastActivityAt: lastMessage.createdAt
        };
      })
    );
    
    // Сортируем пользователей по времени последней активности (сначала новые)
    return chatUsers.sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.chatMessageCurrentId++;
    const createdAt = new Date();
    
    const chatMessage: ChatMessage = {
      id,
      gameId: message.gameId,
      text: message.text,
      sender: message.sender,
      isRead: message.isRead ?? false,
      createdAt
    };
    
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }

  async markChatMessagesAsRead(gameId: string): Promise<boolean> {
    let success = true;
    
    // Получаем все сообщения пользователя
    const messages = Array.from(this.chatMessages.values())
      .filter(message => message.gameId === gameId && message.sender === 'user');
    
    // Отмечаем сообщения как прочитанные
    messages.forEach(message => {
      const updatedMessage = { ...message, isRead: true };
      this.chatMessages.set(message.id, updatedMessage);
    });
    
    return success;
  }
}

export const storage = new MemStorage();
