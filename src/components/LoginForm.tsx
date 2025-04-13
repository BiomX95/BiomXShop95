import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useNickname } from "@/hooks/use-nickname";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

// Схема валидации формы
const formSchema = z.object({
  gameId: z.string().min(5, { message: "ID игрока должен содержать минимум 5 символов" }),
});

type FormData = z.infer<typeof formSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export default function LoginForm({ onSuccess, className = "" }: LoginFormProps) {
  const { login } = useAuth();
  const [recentGameIds, setRecentGameIds] = useState<string[]>([]);
  const [inputGameId, setInputGameId] = useState<string>("");
  const [recentIdNicknames, setRecentIdNicknames] = useState<Record<string, string | null>>({});
  const { nickname, isLoading: isLoadingNickname } = useNickname(
    inputGameId.length >= 5 ? inputGameId : null
  );
  
  // Загружаем историю ID игроков
  useEffect(() => {
    const historyStr = localStorage.getItem("gameIdHistory");
    if (historyStr) {
      try {
        const history = JSON.parse(historyStr);
        const validIds = Array.isArray(history) ? history : [];
        setRecentGameIds(validIds);
        
        // Загружаем никнеймы для истории ID
        const loadNicknames = async () => {
          const nicknames: Record<string, string | null> = {};
          
          // Параллельно загружаем никнеймы для всех ID
          await Promise.all(validIds.map(async (id) => {
            try {
              const response = await fetch(`/api/user/nickname/${id}`);
              const data = await response.json();
              nicknames[id] = data.nickname;
            } catch (error) {
              console.error(`Ошибка загрузки никнейма для ID ${id}:`, error);
              nicknames[id] = null;
            }
          }));
          
          setRecentIdNicknames(nicknames);
        };
        
        loadNicknames();
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

  // Обработчик изменения ввода ID
  const handleGameIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputGameId(value);
    
    // При необходимости обновляем значение в форме
    form.setValue("gameId", value);
  };

  const onSubmit = async (data: FormData) => {
    login(data.gameId);
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleRecentIdClick = (id: string) => {
    login(id);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Card className={`border-gray-200 shadow-lg overflow-hidden ${className}`}>
      <div className="h-2 bg-gradient-to-r from-red-500 to-red-600"></div>
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-gray-800">Войти в магазин</CardTitle>
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
                      onChange={(e) => {
                        field.onChange(e);
                        handleGameIdChange(e);
                      }}
                    />
                  </FormControl>
                  <div className="mt-1 text-sm">
                    {inputGameId.length >= 5 && (
                      <>
                        {isLoadingNickname ? (
                          <div className="flex items-center text-gray-500">
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            <span>Получение никнейма...</span>
                          </div>
                        ) : nickname ? (
                          <div className="flex items-center">
                            <span className="text-gray-600">Никнейм:</span>
                            <Badge variant="outline" className="ml-2 font-medium bg-gray-50 border-gray-200 text-gray-800">
                              {nickname}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-gray-500">Никнейм не найден</span>
                        )}
                      </>
                    )}
                  </div>
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
                  <div className="flex flex-col items-start">
                    <span>{id}</span>
                    {recentIdNicknames[id] && (
                      <span className="text-xs text-gray-500">{recentIdNicknames[id]}</span>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center pt-0 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          Free Fire является зарегистрированной торговой маркой Garena.
        </p>
      </CardFooter>
    </Card>
  );
}