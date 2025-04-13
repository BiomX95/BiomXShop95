import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle2, X, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function PaymentSimulator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentId: string;
    amount: string;
    gameId: string;
  } | null>(null);

  useEffect(() => {
    // Получаем параметры из URL
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("payment_id");
    const amount = params.get("amount");
    const gameId = params.get("game_id");

    if (paymentId && amount && gameId) {
      setPaymentDetails({
        paymentId,
        amount,
        gameId,
      });
    } else {
      // Если нет необходимых параметров, перенаправляем на главную
      toast({
        title: "Ошибка",
        description: "Неверные параметры платежа",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [toast, setLocation]);

  const { mutate: processPayment, isPending } = useMutation({
    mutationFn: async (action: "complete" | "fail" | "cancel") => {
      if (!paymentDetails) {
        throw new Error("Отсутствуют данные о платеже");
      }

      const res = await apiRequest("POST", "/api/simulate-payment", {
        paymentId: paymentDetails.paymentId,
        action,
      });

      return res.json();
    },
    onSuccess: (data) => {
      setPaymentStatus(data.status);
      
      if (data.status === "completed") {
        toast({
          title: "Платеж успешно завершен",
          description: "Алмазы были начислены на ваш аккаунт",
        });
      } else if (data.status === "failed") {
        toast({
          title: "Платеж не завершен",
          description: "Произошла ошибка при обработке платежа",
          variant: "destructive",
        });
      } else if (data.status === "cancelled") {
        toast({
          title: "Платеж отменен",
          description: "Вы отменили платеж",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка обработки платежа",
        description: error.message || "Не удалось обработать платеж. Попробуйте позже.",
        variant: "destructive",
      });
    },
  });

  const handlePayment = (action: "complete" | "fail" | "cancel") => {
    processPayment(action);
  };

  const goBack = () => {
    setLocation("/");
  };

  if (!paymentDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Загрузка платежа...</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Платежная система</CardTitle>
          <CardDescription>Имитация платежного шлюза</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!paymentStatus ? (
            <>
              <div className="bg-gray-100 p-4 rounded-md">
                <h3 className="font-medium mb-2 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  Данные платежа
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Номер платежа:</span>
                    <span className="font-mono">{paymentDetails.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID игрока:</span>
                    <span>{paymentDetails.gameId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Сумма:</span>
                    <span className="font-bold">{paymentDetails.amount} ₽</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <p className="text-sm text-blue-700">
                  Это демонстрационная страница платежной системы. В реальном приложении здесь будет 
                  интерфейс настоящей платежной системы для ввода данных карты или выбора другого способа оплаты.
                </p>
              </div>
              
              <div className="pt-2">
                <p className="text-sm text-center mb-2 font-medium">Выберите результат платежа:</p>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    onClick={() => handlePayment("complete")}
                    disabled={isPending}
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Оплатить {paymentDetails.amount} ₽
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => handlePayment("fail")}
                    disabled={isPending}
                  >
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Имитировать ошибку оплаты
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => handlePayment("cancel")}
                    disabled={isPending}
                  >
                    <X className="h-5 w-5 mr-2" />
                    Отменить платеж
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className={`p-6 rounded-lg text-center ${
              paymentStatus === "completed" ? "bg-green-50" : 
              paymentStatus === "failed" ? "bg-red-50" : "bg-gray-50"
            }`}>
              {paymentStatus === "completed" && (
                <>
                  <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
                  <h3 className="text-xl font-bold mb-2 text-green-800">Платеж успешно выполнен!</h3>
                  <p className="text-green-700">
                    Алмазы были начислены на ваш аккаунт.
                  </p>
                </>
              )}
              
              {paymentStatus === "failed" && (
                <>
                  <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                  <h3 className="text-xl font-bold mb-2 text-red-800">Ошибка платежа</h3>
                  <p className="text-red-700">
                    К сожалению, при обработке платежа произошла ошибка.
                  </p>
                </>
              )}
              
              {paymentStatus === "cancelled" && (
                <>
                  <X className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Платеж отменен</h3>
                  <p className="text-gray-700">
                    Вы отменили платеж. Средства не были списаны.
                  </p>
                </>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={goBack}
            disabled={isPending}
          >
            {paymentStatus ? "Вернуться в магазин" : "Отмена"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}