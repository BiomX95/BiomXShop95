import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link, Route } from "wouter";

const linkGameIdSchema = z.object({
  gameId: z.string().min(5).max(12).regex(/^\d+$/, {
    message: "ID игры должен содержать только цифры"
  }),
  chatId: z.string().min(1).regex(/^\d+$/, {
    message: "Chat ID должен содержать только цифры"
  })
});

const testNotificationSchema = z.object({
  paymentId: z.string().min(1).regex(/^\d+$/, {
    message: "ID платежа должен содержать только цифры"
  }),
  chatId: z.string().min(1).regex(/^\d+$/, {
    message: "Chat ID должен содержать только цифры"
  })
});

export default function TelegramTestPage() {
  const { toast } = useToast();
  
  // Форма для связывания ID игры с chat_id
  const linkForm = useForm<z.infer<typeof linkGameIdSchema>>({
    resolver: zodResolver(linkGameIdSchema),
    defaultValues: {
      gameId: "",
      chatId: ""
    }
  });
  
  // Форма для тестового уведомления
  const notificationForm = useForm<z.infer<typeof testNotificationSchema>>({
    resolver: zodResolver(testNotificationSchema),
    defaultValues: {
      paymentId: "",
      chatId: ""
    }
  });
  
  // Обработчик для связывания ID игры
  const onLinkGameId = async (data: z.infer<typeof linkGameIdSchema>) => {
    try {
      const response = await apiRequest("POST", "/api/telegram/link", {
        gameId: data.gameId,
        chatId: data.chatId
      });
      
      if (response.ok) {
        toast({
          title: "Успешно",
          description: `ID игры ${data.gameId} связан с chat_id ${data.chatId}`,
          variant: "default"
        });
        
        linkForm.reset();
      } else {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Произошла ошибка",
        variant: "destructive"
      });
    }
  };
  
  // Обработчик для отправки тестового уведомления
  const onSendTestNotification = async (data: z.infer<typeof testNotificationSchema>) => {
    try {
      // Отправляем запрос на новый API маршрут для тестирования отправки уведомлений
      const notificationResponse = await apiRequest("POST", "/api/telegram/send-test", {
        paymentId: parseInt(data.paymentId),
        chatId: data.chatId || undefined
      });
      
      if (!notificationResponse.ok) {
        const error = await notificationResponse.json();
        throw new Error(error.error || "Не удалось отправить уведомление");
      }
      
      toast({
        title: "Успешно",
        description: `Уведомление о платеже #${data.paymentId} отправлено в Telegram`,
        variant: "default"
      });
      
      notificationForm.reset();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Произошла ошибка",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Тестирование Telegram интеграции</h1>
        <Link href="/admin/payment-admin">
          <Button variant="outline">Назад к админке</Button>
        </Link>
      </div>
      
      <Tabs defaultValue="link">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="link">Связать ID игры</TabsTrigger>
          <TabsTrigger value="notification">Тестовое уведомление</TabsTrigger>
        </TabsList>
        
        <TabsContent value="link">
          <Card>
            <CardHeader>
              <CardTitle>Связать ID игры с Telegram</CardTitle>
              <CardDescription>
                Связывание ID игры Free Fire с идентификатором чата Telegram для отправки уведомлений.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...linkForm}>
                <form onSubmit={linkForm.handleSubmit(onLinkGameId)} className="space-y-4">
                  <FormField
                    control={linkForm.control}
                    name="gameId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID игры</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Введите ID игры"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          ID игрока в Free Fire (только цифры)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={linkForm.control}
                    name="chatId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chat ID</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Введите ID чата Telegram"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          ID чата в Telegram (можно узнать через @userinfobot)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={linkForm.formState.isSubmitting}
                  >
                    {linkForm.formState.isSubmitting ? "Связывание..." : "Связать ID с Telegram"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notification">
          <Card>
            <CardHeader>
              <CardTitle>Тестовое уведомление</CardTitle>
              <CardDescription>
                Отправка тестового уведомления о платеже в Telegram.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onSendTestNotification)} className="space-y-4">
                  <FormField
                    control={notificationForm.control}
                    name="paymentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID платежа</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Введите ID платежа"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          ID существующего платежа из базы данных
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationForm.control}
                    name="chatId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chat ID (опционально)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Введите ID чата Telegram"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Если не указан, будет использован привязанный к game_id
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={notificationForm.formState.isSubmitting}
                  >
                    {notificationForm.formState.isSubmitting ? "Отправка..." : "Отправить тестовое уведомление"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 p-6 bg-muted rounded-lg">
        <h2 className="text-xl font-bold mb-4">Инструкция</h2>
        <p className="mb-2">1. Найдите бота в Telegram по имени, которое вы указали при создании.</p>
        <p className="mb-2">2. Отправьте боту команду /start</p>
        <p className="mb-2">3. Узнайте свой Chat ID, отправив сообщение @userinfobot</p>
        <p className="mb-2">4. Используйте полученный Chat ID для связывания с ID игры или отправки тестовых уведомлений.</p>
        <p className="mb-2">5. Также можно связать ID игры с Telegram, отправив боту команду: /link &lt;ID_ИГРЫ&gt;</p>
      </div>
    </div>
  );
}