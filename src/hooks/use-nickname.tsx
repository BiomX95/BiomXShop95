import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useNickname(gameId: string | null) {
  const [nickname, setNickname] = useState<string | null>(null);
  
  const enabled = !!gameId && gameId.length >= 5;
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/user/nickname', gameId || ''],
    queryFn: async () => {
      if (!enabled) return { nickname: null, gameId: null };
      const response = await apiRequest("GET", `/api/user/nickname/${gameId}`);
      return await response.json();
    },
    enabled: enabled,
    staleTime: 1000 * 60 * 5, // 5 минут кеширования
  });
  
  useEffect(() => {
    if (data && data.nickname) {
      setNickname(data.nickname);
    } else {
      setNickname(null);
    }
  }, [data]);
  
  return {
    nickname,
    isLoading,
    error
  };
}