import { IconType } from 'react-icons';
import { 
  MessageSquare, 
  ShoppingBag, 
  Bell, 
  Users, 
  BarChart, 
  Puzzle 
} from 'lucide-react';

export interface Feature {
  id: number;
  title: string;
  description: string;
  icon: IconType | any;
}

export const features = [
  {
    id: 1,
    title: "Автоматические ответы",
    description: "Мгновенно отвечайте на часто задаваемые вопросы клиентов с помощью настраиваемых шаблонов",
    icon: MessageSquare
  },
  {
    id: 2,
    title: "Оформление заказов",
    description: "Клиенты могут оформлять заказы прямо через Telegram без необходимости перехода на сайт",
    icon: ShoppingBag
  },
  {
    id: 3,
    title: "Уведомления",
    description: "Отправляйте персонализированные уведомления о статусе заказа, акциях и новостях",
    icon: Bell
  },
  {
    id: 4,
    title: "Управление клиентами",
    description: "Удобный инструмент для сегментации клиентов и персонализированных рассылок",
    icon: Users
  },
  {
    id: 5,
    title: "Аналитика",
    description: "Детальная статистика взаимодействия с ботом для оптимизации бизнес-процессов",
    icon: BarChart
  },
  {
    id: 6,
    title: "Интеграции",
    description: "Легко интегрируется с популярными CRM, платежными системами и другими сервисами",
    icon: Puzzle
  }
];
