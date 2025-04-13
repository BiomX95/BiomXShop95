import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Diamond } from "lucide-react";
import heroImagePath from "@assets/IMG_5663.jpeg";

// Схема валидации формы
const formSchema = z.object({
  gameId: z.string().min(5, { message: "ID игрока должен содержать минимум 5 символов" }),
});

type FormData = z.infer<typeof formSchema>;

export default function AuthPage() {
  const { user, login, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [recentGameIds, setRecentGameIds] = useState<string[]>([]);

  // Если пользователь уже авторизован, перенаправляем на главную
  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  // Загружаем историю ID игроков
  useEffect(() => {
    const historyStr = localStorage.getItem("gameIdHistory");
    if (historyStr) {
      try {
        const history = JSON.parse(historyStr);
        setRecentGameIds(Array.isArray(history) ? history : []);
      } catch (e) {
        console.error("Failed to parse game ID history:", e);
        setRecentGameIds([]);
      }
    }
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gameId: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    login(data.gameId);
  };

  const handleRecentIdClick = (id: string) => {
    login(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Hero Section */}
      <div className="flex-1 bg-primary-900 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImagePath})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative h-full flex flex-col justify-center items-center p-8 text-white text-center">
            <Diamond className="h-16 w-16 mb-4 text-white" />
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Free Fire Diamonds</h1>
            <p className="text-lg sm:text-xl max-w-md">
              Самый быстрый и надежный способ пополнить алмазы в Free Fire. Моментальная доставка и гарантия безопасности.
            </p>
          </div>
        </div>
      </div>

      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md border-gray-200 shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-500 to-red-600"></div>
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold text-gray-800">Войти в магазин</CardTitle>
            <CardDescription className="text-gray-600">
              Введите ID вашего аккаунта Free Fire для продолжения
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="gameId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">ID игрока</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Введите ID Free Fire" 
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 text-white"
                  variant="destructive"
                >
                  Войти
                </Button>
              </form>
            </Form>

            {recentGameIds.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Недавно использованные ID:</h3>
                <div className="space-y-2">
                  {recentGameIds.map((id) => (
                    <Button
                      key={id}
                      variant="outline"
                      className="w-full justify-start text-left border-gray-300 text-gray-700 hover:bg-gray-100"
                      onClick={() => handleRecentIdClick(id)}
                    >
                      {id}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center pt-0 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              Free Fire является зарегистрированной торговой маркой Garena. Наш магазин не является официальным партнером Garena или Free Fire.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}