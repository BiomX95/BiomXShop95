import { useQuery } from "@tanstack/react-query";
import { Loader2, Star, ThumbsUp, MessageSquare } from "lucide-react";
import { Review } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface ReviewCardProps {
  review: Review;
}

function ReviewCard({ review }: ReviewCardProps) {
  // Форматируем дату в формате "1 января 2023"
  const formattedDate = format(new Date(review.createdAt), "d MMMM yyyy", { locale: ru });
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                {review.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{review.username}</h3>
              <p className="text-sm text-gray-500">{formattedDate}</p>
            </div>
          </div>
          <div className="flex items-center">
            {Array.from({ length: review.rating }, (_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
            {Array.from({ length: 5 - review.rating }, (_, i) => (
              <Star key={i} className="h-4 w-4 text-gray-300" />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-gray-700">{review.text}</p>
      </CardContent>
      <CardFooter className="pt-2 pb-4 text-xs text-gray-500 flex justify-between">
        <div className="flex items-center space-x-1">
          <ThumbsUp className="h-3.5 w-3.5" />
          <span>Полезный отзыв</span>
        </div>
        <div className="flex items-center space-x-1">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>ID: {review.gameId.substring(0, 8)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}

export function ReviewsSection() {
  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ["/api/reviews"],
    staleTime: 1000 * 60 * 5, // 5 минут
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Пока нет отзывов. Станьте первым, кто оставит отзыв!</p>
      </div>
    );
  }

  // Получаем только проверенные отзывы
  const verifiedReviews = reviews.filter(review => review.isVerified);
  
  // Если нет проверенных отзывов
  if (verifiedReviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Пока нет отзывов. Станьте первым, кто оставит отзыв!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {verifiedReviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}