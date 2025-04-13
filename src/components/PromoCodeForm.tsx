import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { PromoCode } from "@shared/schema";

interface PromoCodeFormProps {
  onPromoApplied: (promoCode: PromoCode) => void;
  className?: string;
}

// Схема валидации для промокода
const promoCodeSchema = z.object({
  code: z.string().min(3, { message: "Промокод должен содержать минимум 3 символа" }),
});

export function PromoCodeForm({ onPromoApplied, className = "" }: PromoCodeFormProps) {
  const { toast } = useToast();
  const [appliedCode, setAppliedCode] = useState<PromoCode | null>(null);

  const form = useForm<z.infer<typeof promoCodeSchema>>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: {
      code: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof promoCodeSchema>) => {
      const res = await apiRequest("POST", "/api/promo-codes/validate", data);
      return res.json();
    },
    onSuccess: (data: PromoCode) => {
      setAppliedCode(data);
      onPromoApplied(data);
      toast({
        title: "Промокод применен!",
        description: `Скидка ${data.discount}% будет применена к заказу.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка промокода",
        description: error.message || "Недействительный промокод",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof promoCodeSchema>) => {
    mutate(data);
  };

  return (
    <Card className={`shadow-sm ${className}`}>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Введите промокод</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input 
                        placeholder="PROMO123" 
                        {...field} 
                        className="uppercase"
                        disabled={!!appliedCode || isPending}
                      />
                    </FormControl>
                    {!appliedCode ? (
                      <Button 
                        type="submit" 
                        disabled={isPending}
                        variant="destructive"
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                      >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Применить
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => setAppliedCode(null)} className="text-green-600 border-green-600">
                        <Check className="mr-2 h-4 w-4" />
                        Применено
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {appliedCode && (
          <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-100 text-sm">
            <div className="flex justify-between text-green-700">
              <span>Промокод <strong>{appliedCode.code}</strong>:</span>
              <span>-{appliedCode.discount}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}