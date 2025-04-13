import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Loader2, CheckCircle2, AlertCircle, Clock, ArrowRight } from "lucide-react";

interface OrderStatusCardProps {
  paymentId: number;
  onClose: () => void;
}

// Варианты статусов заказа и их отображение
const statusConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  pending: { 
    color: "bg-yellow-100 text-yellow-800", 
    label: "Ожидает оплаты", 
    icon: <Clock className="h-4 w-4 mr-1" />
  },
  processing: { 
    color: "bg-blue-100 text-blue-800", 
    label: "Обрабатывается", 
    icon: <Loader2 className="h-4 w-4 mr-1 animate-spin" />
  },
  completed: { 
    color: "bg-green-100 text-green-800", 
    label: "Выполнен", 
    icon: <CheckCircle2 className="h-4 w-4 mr-1" />
  },
  failed: { 
    color: "bg-red-100 text-red-800", 
    label: "Ошибка", 
    icon: <AlertCircle className="h-4 w-4 mr-1" />
  },
  cancelled: { 
    color: "bg-gray-100 text-gray-800", 
    label: "Отменён", 
    icon: <AlertCircle className="h-4 w-4 mr-1" />
  }
};

export function OrderStatusCard({ paymentId, onClose }: OrderStatusCardProps) {
  interface PaymentData {
    id: number;
    status: string;
    createdAt: string;
    gameId: string;
    email: string | null;
    amount: number;
    transactionId: string | null;
    packageId: number | null;
    paymentMethod: string;
    promoCode: string | null;
    userId: number | null;
    paymentUrl?: string;
  }
  
  // Запрос данных о статусе платежа
  const { data: payment, isLoading, error } = useQuery<PaymentData>({
    queryKey: ["/api/payments", paymentId],
    // Обновляем данные каждые 5 секунд, если статус "pending" или "processing"
    refetchInterval: () => 5000,
    // Функция для получения данных о платеже
    queryFn: async () => {
      const res = await fetch(`/api/payments/${paymentId}`);
      if (!res.ok) {
        throw new Error('Не удалось получить данные о платеже');
      }
      const data = await res.json();
      // Если платеж находится в состоянии ожидания, автоматически добавляем URL для оплаты
      if (data.status === "pending" && !data.paymentUrl) {
        return {
          ...data,
          paymentUrl: `/simulate-payment?payment_id=${data.id}&amount=${data.amount}&game_id=${data.gameId}`
        };
      }
      return data;
    }
  });

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={`${config.color} flex items-center`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy, HH:mm", { locale: ru });
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Информация о заказе</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !payment) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Информация о заказе</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Не удалось загрузить информацию о заказе</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onClose} className="w-full">Закрыть</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex justify-between items-center">
          <span>Заказ #{payment.id}</span>
          {getStatusBadge(payment.status)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-md space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Дата заказа:</span>
            <span>{formatDate(payment.createdAt)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">ID игрока:</span>
            <span className="font-medium">{payment.gameId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Email:</span>
            <span>{payment.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Сумма:</span>
            <span className="font-bold">{payment.amount} ₽</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Номер транзакции:</span>
            <span className="font-mono text-xs">{payment.transactionId}</span>
          </div>
        </div>

        {payment.status === "completed" && (
          <div className="p-4 bg-green-50 rounded-md border border-green-100">
            <h3 className="font-medium text-green-800 flex items-center mb-2">
              <CheckCircle2 className="h-5 w-5 mr-1" />
              Оплата успешно завершена
            </h3>
            <p className="text-sm text-green-700">
              Алмазы будут начислены на ваш аккаунт в течение нескольких минут.
            </p>
          </div>
        )}

        {payment.status === "pending" && (
          <div className="p-4 bg-yellow-50 rounded-md border border-yellow-100">
            <h3 className="font-medium text-yellow-800 flex items-center mb-2">
              <Clock className="h-5 w-5 mr-1" />
              Ожидание оплаты
            </h3>
            <p className="text-sm text-yellow-700">
              Для завершения заказа, пожалуйста, оплатите его по инструкциям в вашем платежном сервисе.
            </p>
            {payment.paymentUrl && (
              <Button 
                variant="outline" 
                className="mt-2 bg-white w-full"
                onClick={() => {
                  if (payment.paymentUrl) {
                    window.location.href = payment.paymentUrl;
                  }
                }}
              >
                Перейти к оплате <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {payment.status === "failed" && (
          <div className="p-4 bg-red-50 rounded-md border border-red-100">
            <h3 className="font-medium text-red-800 flex items-center mb-2">
              <AlertCircle className="h-5 w-5 mr-1" />
              Ошибка при оплате
            </h3>
            <p className="text-sm text-red-700">
              К сожалению, при оплате произошла ошибка. Попробуйте повторить заказ или выбрать другой способ оплаты.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onClose} className="w-full">
          {payment.status === "completed" ? "Вернуться в магазин" : "Закрыть"}
        </Button>
      </CardFooter>
    </Card>
  );
}