interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: number;
  name: string;
  price: number;
  popular?: boolean;
  features: PricingFeature[];
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 1,
    name: "Базовый",
    price: 990,
    features: [
      { text: "До 500 пользователей", included: true },
      { text: "Базовые ответы на вопросы", included: true },
      { text: "Прием заказов", included: true },
      { text: "Базовая аналитика", included: true },
      { text: "Интеграции с CRM", included: false }
    ]
  },
  {
    id: 2,
    name: "Бизнес",
    price: 2490,
    popular: true,
    features: [
      { text: "До 2000 пользователей", included: true },
      { text: "Расширенные ответы с AI", included: true },
      { text: "Прием заказов и оплаты", included: true },
      { text: "Расширенная аналитика", included: true },
      { text: "Базовые интеграции", included: true }
    ]
  },
  {
    id: 3,
    name: "Корпоративный",
    price: 4990,
    features: [
      { text: "Безлимитное количество пользователей", included: true },
      { text: "Продвинутый ИИ с обучением", included: true },
      { text: "Полная система продаж", included: true },
      { text: "Премиум аналитика и отчеты", included: true },
      { text: "Любые интеграции и API", included: true }
    ]
  }
];
