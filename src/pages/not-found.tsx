import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <Card className="w-full max-w-md mx-4 border-red-500 shadow-lg">
        <CardContent className="pt-6 text-center">
          <div className="flex flex-col items-center mb-6">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">404 | Страница не найдена</h1>
          </div>

          <p className="mt-4 text-gray-600 mb-6">
            Возможно, эта страница была перемещена или удалена. Пожалуйста, вернитесь на главную страницу.
          </p>
          
          <div className="flex justify-center mt-4">
            <Link href="/">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Вернуться на главную
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
