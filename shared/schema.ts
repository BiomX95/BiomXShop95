import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Перечисление типов пакетов
export const diamondPackageTypes = {
  DIAMONDS: 'diamonds',
  VOUCHER: 'voucher',
  EVO_PASS: 'evo_pass'
};

// Схема для пользователей
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  gameId: text("game_id"),
  telegramChatId: text("telegram_chat_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  gameId: true,
  telegramChatId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Схема для пакетов алмазов
export const diamondPackages = pgTable("diamond_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: integer("amount").notNull(),
  price: real("price").notNull(),
  discount: integer("discount").default(0),
  isPopular: boolean("is_popular").default(false),
  imageUrl: text("image_url"),
  type: text("type").default(diamondPackageTypes.DIAMONDS),
});

export const insertDiamondPackageSchema = createInsertSchema(diamondPackages).pick({
  name: true,
  amount: true,
  price: true,
  discount: true,
  isPopular: true,
  imageUrl: true,
  type: true,
});

export type InsertDiamondPackage = z.infer<typeof insertDiamondPackageSchema>;
export type DiamondPackage = typeof diamondPackages.$inferSelect;

// Схема для промокодов
export const promoCodes = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discount: integer("discount").notNull(),
  isPercentage: boolean("is_percentage").default(true),
  validUntil: timestamp("valid_until"),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").default(0),
  isActive: boolean("is_active").default(true),
  packageId: integer("package_id").references(() => diamondPackages.id),
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).pick({
  code: true,
  discount: true,
  isPercentage: true,
  validUntil: true,
  usageLimit: true,
  isActive: true,
  packageId: true,
});

export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;

// Схема для отзывов
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isVerified: boolean("is_verified").default(false),
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  userId: true,
  userName: true,
  rating: true,
  comment: true,
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Схема для платежей
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  packageId: integer("package_id"),
  amount: real("amount").notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").notNull().default("pending"),
  transactionId: text("transaction_id"),
  gameId: text("game_id").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  promoCode: text("promo_code"),
});

export const paymentSchema = z.object({
  userId: z.number().optional(),
  packageId: z.number(),
  amount: z.number().positive(),
  paymentMethod: z.string(),
  gameId: z.string().min(5, { message: "Game ID должен содержать минимум 5 символов" }),
  email: z.string().email().optional(),
  promoCode: z.string().optional(),
  status: z.string().optional(),
  transactionId: z.string().optional(),
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  userId: true,
  packageId: true,
  amount: true,
  paymentMethod: true,
  gameId: true,
  email: true,
  promoCode: true,
  status: true,
  transactionId: true
});

export type InsertPayment = z.infer<typeof paymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Схема для методов оплаты
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // банк, электронный кошелек и т.д.
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).pick({
  name: true,
  type: true,
  logoUrl: true,
  isActive: true,
  sortOrder: true,
});

export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;

// Схема для сообщений чата
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  gameId: text("game_id").notNull(), // ID игры пользователя (вместо foreign key для упрощения)
  text: text("text").notNull(),
  sender: text("sender").notNull(), // 'user' или 'admin'
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  gameId: true,
  text: true,
  sender: true,
  isRead: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
