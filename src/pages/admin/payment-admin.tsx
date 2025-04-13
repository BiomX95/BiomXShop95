import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MoreHorizontal, 
  Clock, 
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Конфигурация для отображения статусов платежей
const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  pending: { 
    color: "bg-yellow-100 text-yellow-800", 
    icon: <Clock className="h-4 w-4 mr-1" /> 
  },
  processing: { 
    color: "bg-blue-100 text-blue-800", 
    icon: <Clock className="h-4 w-4 mr-1" /> 
  },
  completed: { 
    color: "bg-green-100 text-green-800", 
    icon: <CheckCircle2 className="h-4 w-4 mr-1" /> 
  },
  failed: { 
    color: "bg-red-100 text-red-800", 
    icon: <AlertCircle className="h-4 w-4 mr-1" /> 
  },
  cancelled: { 
    color: "bg-gray-100 text-gray-800", 
    icon: <XCircle className="h-4 w-4 mr-1" /> 
  }
};

// Преобразование статуса в соответствующий значок
const getStatusBadge = (status: string) => {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <Badge className={`${config.color} flex items-center`}>
      {config.icon}
      {status}
    </Badge>
  );
};

export default function PaymentAdmin() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Запрос всех платежей
  const { data: payments, isLoading, error } = useQuery({
    queryKey: ["/api/payments"],
    queryFn: async () => {
      const res = await fetch("/api/payments");
      if (!res.ok) {
        throw new Error("Не удалось загрузить платежи");
      }
      return res.json();
    }
  });

  // Мутация для обновления статуса платежа
  const { mutate: updatePaymentStatus } = useMutation({
    mutationFn: async ({ paymentId, action }: { paymentId: number, action: string }) => {
      const res = await apiRequest("POST", "/api/simulate-payment", {
        paymentId,
        action
      });
      return res.json();
    },
    onSuccess: () => {
      // Обновляем список платежей после успешного обновления
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({
        title: "Статус платежа обновлен",
        description: "Платеж был успешно обновлен"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка обновления",
        description: error.message || "Не удалось обновить статус платежа",
        variant: "destructive"
      });
    }
  });

  // Обработчик обновления статуса
  const handleStatusUpdate = (paymentId: number, action: "complete" | "fail" | "cancel") => {
    updatePaymentStatus({ paymentId, action });
  };

  // Фильтрация платежей по поисковому запросу
  const filteredPayments = payments?.filter((payment: any) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.id.toString().includes(searchLower) ||
      payment.gameId.toLowerCase().includes(searchLower) ||
      payment.email.toLowerCase().includes(searchLower) ||
      payment.status.toLowerCase().includes(searchLower)
    );
  });

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Администрирование платежей</CardTitle>
            <CardDescription>Загрузка данных...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Ошибка</CardTitle>
            <CardDescription>Не удалось загрузить данные о платежах</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-red-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>{(error as Error).message}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/payments"] })}
              className="w-full"
            >
              Попробовать снова
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Администрирование платежей</CardTitle>
            <CardDescription>Управляйте статусами платежей в системе</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/admin/telegram-test">Тестирование Telegram</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск платежей по ID, игроку, email или статусу..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredPayments?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Платежи не найдены</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>ID игрока</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments?.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{formatDate(payment.createdAt)}</TableCell>
                      <TableCell>{payment.gameId}</TableCell>
                      <TableCell>{payment.email}</TableCell>
                      <TableCell className="text-right font-medium">{payment.amount} ₽</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Открыть меню</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Действия</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(payment.id, "complete")}
                              disabled={payment.status === "completed"}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                              <span>Завершить</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(payment.id, "fail")}
                              disabled={payment.status === "failed"}
                            >
                              <AlertCircle className="mr-2 h-4 w-4 text-red-600" />
                              <span>Отметить как ошибку</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(payment.id, "cancel")}
                              disabled={payment.status === "cancelled"}
                            >
                              <XCircle className="mr-2 h-4 w-4 text-gray-600" />
                              <span>Отменить</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}