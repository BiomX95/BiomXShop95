import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { DiamondPackage, PromoCode, PaymentMethod } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Loader2, AlertCircle, Diamond } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface CheckoutFormProps {
  selectedPackage: DiamondPackage;
  selectedPaymentMethod?: PaymentMethod;
  appliedPromoCode?: PromoCode;
  onSuccess: (paymentId: number) => void;
  onCancel: () => void;
}

// Схема валидации для оформления заказа
const checkoutSchema = z.object({
  email: z.string().email({ message: "Введите корректный email" }),
  confirmGameId: z.string().min(5, { message: "ID игрока должен содержать минимум 5 символов" }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutForm({
  selectedPackage,
  selectedPaymentMethod,
  appliedPromoCode,
  onSuccess,
  onCancel,
}: CheckoutFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [orderError, setOrderError] = useState<string | null>(null);

  // Рассчитываем итоговую цену с учетом скидки на пакет и промокода
  const packageDiscount = selectedPackage.discount || 0;
  const promoDiscount = appliedPromoCode?.discountPercent || 0;
  
  // Сначала применяем скидку на пакет
  let finalPrice = selectedPackage.price * (1 - packageDiscount / 100);
  
  // Затем применяем скидку по промокоду
  finalPrice = finalPrice * (1 - promoDiscount / 100);
  
  // Округляем до целого числа
  finalPrice = Math.round(finalPrice);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      confirmGameId: user?.gameId || "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: CheckoutFormValues) => {
      if (!selectedPaymentMethod) {
        throw new Error("Выберите способ оплаты");
      }

      const payload = {
        gameId: user?.gameId,
        email: data.email,
        packageId: selectedPackage.id,
        paymentMethodId: selectedPaymentMethod.id,
        promoCodeId: appliedPromoCode?.id,
        amount: finalPrice,
      };

      const res = await apiRequest("POST", "/api/payments", payload);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Заказ оформлен!",
        description: "Перенаправляем на страницу оплаты...",
      });
      onSuccess(data.id);
    },
    onError: (error: Error) => {
      setOrderError(error.message || "Произошла ошибка при оформлении заказа");
      toast({
        title: "Ошибка оформления заказа",
        description: error.message || "Пожалуйста, проверьте введенные данные",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutFormValues) => {
    // Проверяем, совпадает ли введенный ID с ID, под которым вошел пользователь
    if (data.confirmGameId !== user?.gameId) {
      return toast({
        title: "Ошибка подтверждения",
        description: "ID игрока не совпадает с ID, под которым вы вошли",
        variant: "destructive",
      });
    }

    // Проверяем, выбран ли способ оплаты
    if (!selectedPaymentMethod) {
      return toast({
        title: "Выберите способ оплаты",
        description: "Для продолжения необходимо выбрать способ оплаты",
        variant: "destructive",
      });
    }

    setOrderError(null);
    mutate(data);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Оформление заказа</CardTitle>
      </CardHeader>
      <CardContent>
        {orderError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{orderError}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">Информация о заказе:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Пакет:</span>
              <span className="font-medium flex items-center">
                <Diamond className="h-4 w-4 mr-1 text-blue-500" />
                {selectedPackage.name} ({selectedPackage.amount} алмазов)
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Базовая цена:</span>
              <span>{selectedPackage.price} ₽</span>
            </div>
            
            {packageDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Скидка на пакет:</span>
                <span>-{packageDiscount}% (-{Math.round(selectedPackage.price * packageDiscount / 100)} ₽)</span>
              </div>
            )}
            
            {appliedPromoCode && (
              <div className="flex justify-between text-green-600">
                <span>Промокод {appliedPromoCode.code}:</span>
                <span>-{promoDiscount}% (-{Math.round(selectedPackage.price * (1 - packageDiscount / 100) * promoDiscount / 100)} ₽)</span>
              </div>
            )}
            
            <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
              <span>Итого к оплате:</span>
              <span>{finalPrice} ₽</span>
            </div>
            
            {selectedPaymentMethod && (
              <div className="flex justify-between pt-2">
                <span>Способ оплаты:</span>
                <span className="flex items-center">
                  {selectedPaymentMethod.logoUrl && (
                    <img 
                      src={selectedPaymentMethod.logoUrl} 
                      alt={selectedPaymentMethod.name} 
                      className="h-4 w-4 mr-1 object-contain"
                    />
                  )}
                  {selectedPaymentMethod.name}
                </span>
              </div>
            )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email для чека</FormLabel>
                  <FormControl>
                    <Input placeholder="example@mail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmGameId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Подтвердите ID игрока</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите ID игрока ещё раз" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex justify-between space-x-4">
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Отмена
        </Button>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={isPending || !selectedPaymentMethod}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Обработка...
            </>
          ) : (
            `Оплатить ${finalPrice} ₽`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}