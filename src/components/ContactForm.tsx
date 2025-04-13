import { useState } from "react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Phone, Mail, MapPin, Instagram, Twitter, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(2, { message: "Имя должно содержать не менее 2 символов" }),
  email: z.string().email({ message: "Введите корректный email адрес" }),
  phone: z.string().optional(),
  message: z.string().min(10, { message: "Сообщение должно содержать не менее 10 символов" })
});

type FormData = z.infer<typeof formSchema>;

export default function ContactForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleAnimation = useScrollAnimation();
  const formAnimation = useScrollAnimation({ delay: 200 });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: ""
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/contact", data);
      toast({
        title: "Сообщение отправлено",
        description: "Мы свяжемся с вами в ближайшее время",
        variant: "default",
      });
      reset();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение. Пожалуйста, попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-[hsl(var(--muted)/0.5)]">
      <div className="container mx-auto px-4">
        <div 
          ref={titleAnimation.ref as React.RefObject<HTMLDivElement>}
          className={cn(
            "text-center mb-16 transition-all duration-700",
            titleAnimation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Свяжитесь с нами</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Остались вопросы или нужна консультация? Заполните форму, и мы свяжемся с вами!
          </p>
        </div>

        <div 
          ref={formAnimation.ref as React.RefObject<HTMLDivElement>}
          className={cn(
            "max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-700",
            formAnimation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <div className="md:flex">
            <div className="md:w-1/2 bg-gradient-to-r from-primary to-[hsl(var(--primary)/0.8)] p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Контактная информация</h3>
              
              <div className="flex items-start mb-6">
                <Phone className="h-6 w-6 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Телефон</p>
                  <p>+7 (800) 123-45-67</p>
                </div>
              </div>
              
              <div className="flex items-start mb-6">
                <Mail className="h-6 w-6 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Email</p>
                  <p>info@telebot.ru</p>
                </div>
              </div>
              
              <div className="flex items-start mb-10">
                <MapPin className="h-6 w-6 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Адрес</p>
                  <p>Москва, ул. Примерная, д. 123, офис 456</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <a href="#" className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://t.me/your_bot_name" className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2s-.16-.05-.23-.03c-.1.03-1.77 1.13-5 3.28-.47.32-.9.48-1.29.47-.42-.01-1.23-.24-1.83-.44-.74-.24-1.33-.37-1.28-.79.03-.22.26-.43.72-.66 2.82-1.23 4.7-2.04 5.65-2.43 2.69-1.12 3.25-1.31 3.61-1.31.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div className="md:w-1/2 p-8">
              <h3 className="text-2xl font-bold mb-6">Отправьте сообщение</h3>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <Label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                    Имя
                  </Label>
                  <Input 
                    id="name" 
                    {...register("name")} 
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="Введите ваше имя" 
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div className="mb-4">
                  <Label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Email
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    {...register("email")} 
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="Введите ваш email" 
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div className="mb-4">
                  <Label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                    Телефон
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    {...register("phone")} 
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="+7 (___) ___-__-__" 
                  />
                </div>
                <div className="mb-6">
                  <Label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                    Сообщение
                  </Label>
                  <Textarea 
                    id="message" 
                    {...register("message")} 
                    rows={4} 
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="Введите ваше сообщение" 
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="bg-primary text-white hover:bg-primary/90 transition-all hover:translate-y-[-2px] hover:shadow-lg w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Отправка...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Send className="mr-2 h-5 w-5" />
                      Отправить сообщение
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
