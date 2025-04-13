import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Ticket } from "lucide-react";
import { DiamondPackage, PromoCode } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Схема для создания промокода
const createPromoCodeSchema = z.object({
  code: z.string().min(3, { message: "Код должен содержать минимум 3 символа" }).max(20),
  discount: z.coerce.number().min(1, { message: "Скидка должна быть не менее 1%" }).max(100, { message: "Скидка не может превышать 100%" }),
  packageId: z.coerce.number().optional(),
  isPercentage: z.boolean().default(true),
  usageLimit: z.coerce.number().min(1, { message: "Лимит использования должен быть не менее 1" }).default(100),
  validDays: z.coerce.number().min(1, { message: "Срок действия должен быть не менее 1 дня" }).default(30),
});

type CreatePromoCodeFormValues = z.infer<typeof createPromoCodeSchema>;

export default function PromoCodesPage() {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Получение всех промокодов
  const { data: promoCodes, isLoading: isLoadingPromoCodes } = useQuery({
    queryKey: ["/api/promo-codes"],
    refetchOnWindowFocus: false,
  });
  
  // Получение всех пакетов алмазов
  const { data: diamondPackages, isLoading: isLoadingPackages } = useQuery({
    queryKey: ["/api/diamond-packages"],
    refetchOnWindowFocus: false,
  });
  
  // Форма создания промокода
  const form = useForm<CreatePromoCodeFormValues>({
    resolver: zodResolver(createPromoCodeSchema),
    defaultValues: {
      code: "",
      discount: 10,
      isPercentage: true,
      usageLimit: 100,
      validDays: 30,
    },
  });
  
  // Мутация для создания промокода
  const { mutate: createPromoCode, isPending } = useMutation({
    mutationFn: async (data: CreatePromoCodeFormValues) => {
      const response = await apiRequest("POST", "/api/promo-codes", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Промокод создан",
        description: "Промокод успешно создан и готов к использованию",
      });
      form.reset();
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: `Не удалось создать промокод: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: CreatePromoCodeFormValues) => {
    createPromoCode(data);
  };
  
  const handleCancelCreate = () => {
    form.reset();
    setShowCreateForm(false);
  };
  
  // Получение имени пакета алмазов по ID
  const getPackageName = (packageId: number | null) => {
    if (!packageId) return "Все пакеты";
    const pkg = diamondPackages?.find((p: DiamondPackage) => p.id === packageId);
    return pkg ? pkg.name : "Неизвестный пакет";
  };
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Управление промокодами</h1>
        {!showCreateForm && (
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Создать промокод
          </Button>
        )}
      </div>
      
      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Создать новый промокод</CardTitle>
            <CardDescription>Заполните форму для создания нового промокода</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Код промокода</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="FF123" 
                            {...field} 
                            className="uppercase"
                          />
                        </FormControl>
                        <FormDescription>
                          Уникальный код, который пользователи будут вводить для получения скидки
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Размер скидки</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Размер скидки в процентах (от 1 до 100)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="packageId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Для какого пакета</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите пакет алмазов" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Для всех пакетов</SelectItem>
                            {!isLoadingPackages && diamondPackages && diamondPackages.map((pkg: DiamondPackage) => (
                              <SelectItem key={pkg.id} value={pkg.id.toString()}>
                                {pkg.name} ({pkg.amount} алмазов)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Пакет алмазов, к которому будет применяться промокод (или пусто для всех пакетов)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="usageLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Лимит использования</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="100" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Сколько раз промокод может быть использован
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="validDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Срок действия (дней)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="30" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Сколько дней промокод будет действителен
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isPercentage"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Скидка в процентах</FormLabel>
                          <FormDescription>
                            Если отмечено, скидка будет в %, иначе в фиксированной сумме
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelCreate}
                  >
                    Отмена
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isPending}
                  >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Создать промокод
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      {isLoadingPromoCodes ? (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Действующие промокоды</CardTitle>
            <CardDescription>Список всех промокодов в системе</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Список всех промокодов</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Код</TableHead>
                  <TableHead>Скидка</TableHead>
                  <TableHead>Для пакета</TableHead>
                  <TableHead>Использовано</TableHead>
                  <TableHead>Лимит</TableHead>
                  <TableHead>Действует до</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes && promoCodes.length > 0 ? (
                  promoCodes.map((promo: PromoCode) => (
                    <TableRow key={promo.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-primary" />
                          {promo.code}
                        </div>
                      </TableCell>
                      <TableCell>{promo.discount}{promo.isPercentage ? '%' : ' руб.'}</TableCell>
                      <TableCell>
                        {isLoadingPackages ? 
                          "Загрузка..." : 
                          getPackageName(promo.packageId)}
                      </TableCell>
                      <TableCell>{promo.usageCount || 0}</TableCell>
                      <TableCell>{promo.usageLimit || "∞"}</TableCell>
                      <TableCell>
                        {promo.validUntil ? 
                          format(new Date(promo.validUntil), 'dd.MM.yyyy') : 
                          "Бессрочно"}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          promo.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {promo.isActive ? 'Активен' : 'Неактивен'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Нет доступных промокодов
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}