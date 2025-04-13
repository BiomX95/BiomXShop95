import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PaymentMethod } from "@shared/schema";
import { Loader2, CreditCard } from "lucide-react";
import { FaCcVisa, FaCcMastercard, FaCcPaypal, FaCreditCard, FaYandex, FaMoneyBillAlt, FaRubleSign, FaMobile } from "react-icons/fa";

interface PaymentMethodSelectorProps {
  onSelect: (method: PaymentMethod) => void;
  selectedId?: number;
  className?: string;
}

export function PaymentMethodSelector({ 
  onSelect, 
  selectedId,
  className = "" 
}: PaymentMethodSelectorProps) {
  const { data: paymentMethods, isLoading, error } = useQuery({
    queryKey: ["/api/payment-methods"],
    staleTime: 1000 * 60 * 10, // 10 минут
  });

  const handleChange = (value: string) => {
    const methodId = parseInt(value);
    const method = paymentMethods?.find(m => m.id === methodId);
    if (method) {
      onSelect(method);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !paymentMethods || paymentMethods.length === 0) {
    return (
      <div className="text-center py-4 text-red-500">
        <p>Не удалось загрузить способы оплаты. Пожалуйста, попробуйте позже.</p>
      </div>
    );
  }

  // Группируем методы оплаты по типу
  const groupedMethods = paymentMethods.reduce((acc, method) => {
    if (!acc[method.type]) {
      acc[method.type] = [];
    }
    acc[method.type].push(method);
    return acc;
  }, {} as Record<string, PaymentMethod[]>);

  // Переводим тип оплаты для отображения
  const typeLabels: Record<string, string> = {
    'bank': 'Банковские карты',
    'ewallet': 'Электронные кошельки',
    'crypto': 'Криптовалюты',
    'other': 'Другие способы'
  };

  // Функция для получения соответствующей иконки платежного метода
  const getPaymentIcon = (methodName: string) => {
    const name = methodName.toLowerCase();
    
    // Банковские карты
    if (name.includes('visa') || name.includes('mastercard')) {
      return (
        <div className="flex items-center space-x-1 mr-2">
          <FaCcVisa className="text-blue-600 h-5 w-5" title="Visa" />
          <FaCcMastercard className="text-red-500 h-5 w-5" title="Mastercard" />
        </div>
      );
    }
    
    // Электронные кошельки
    if (name.includes('qiwi')) {
      return <FaMobile className="text-orange-500 h-5 w-5 mr-2" />;
    }
    
    if (name.includes('сбербанк')) {
      return <FaRubleSign className="text-green-600 h-5 w-5 mr-2" />;
    }
    
    if (name.includes('яндекс')) {
      return <FaYandex className="text-yellow-500 h-5 w-5 mr-2" />;
    }
    
    if (name.includes('paypal')) {
      return <FaCcPaypal className="text-blue-700 h-5 w-5 mr-2" />;
    }
    
    // Общая иконка для других методов оплаты
    return <FaCreditCard className="text-gray-600 h-5 w-5 mr-2" />;
  };

  return (
    <Card className={`shadow-sm ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-red-500" />
          Способ оплаты
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={selectedId?.toString() || ""} 
          onValueChange={handleChange}
        >
          {Object.entries(groupedMethods).map(([type, methods]) => (
            <div key={type} className="mb-4">
              <h3 className="font-medium text-sm text-gray-500 mb-2 flex items-center">
                {type === 'bank' && <FaCreditCard className="mr-1 h-4 w-4" />}
                {type === 'ewallet' && <FaMoneyBillAlt className="mr-1 h-4 w-4" />}
                {typeLabels[type] || type}
              </h3>
              <div className="space-y-2">
                {methods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 transition-all">
                    <RadioGroupItem value={method.id.toString()} id={`method-${method.id}`} />
                    <Label 
                      htmlFor={`method-${method.id}`} 
                      className="flex items-center cursor-pointer w-full"
                    >
                      {getPaymentIcon(method.name)}
                      <span>{method.name}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}