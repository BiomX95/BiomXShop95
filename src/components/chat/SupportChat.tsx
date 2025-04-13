import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
};

type SupportChatProps = {
  onClose: () => void;
};

export const SupportChat: React.FC<SupportChatProps> = ({ onClose }) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Получаем игровой ID из URL параметров
  const getGameId = (): string => {
    const params = new URLSearchParams(window.location.search);
    return params.get('game_id') || '';
  };
  
  // Загрузка истории сообщений
  const fetchMessages = async () => {
    const gameId = getGameId();
    if (!gameId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/chat/messages?gameId=${gameId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.map((msg: any) => ({
          id: msg.id.toString(),
          text: msg.text,
          sender: msg.sender,
          timestamp: new Date(msg.createdAt)
        })));
      }
    } catch (error) {
      console.error('Ошибка при загрузке сообщений:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузка сообщений при открытии чата
  useEffect(() => {
    fetchMessages();
    
    // Настраиваем интервал обновления каждые 10 секунд
    const interval = setInterval(() => {
      fetchMessages();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const gameId = getGameId();
    if (!gameId) {
      toast({
        title: "Ошибка",
        description: "Не удалось определить ID игрока",
        variant: "destructive"
      });
      return;
    }
    
    const tempId = Date.now().toString();
    const newMsg: Message = {
      id: tempId,
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    // Оптимистично обновляем UI
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gameId,
          text: newMessage,
          sender: 'user'
        })
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при отправке сообщения');
      }
      
      // Получаем реальный ID сообщения с сервера
      const data = await response.json();
      
      // Обновляем сообщение с реальным ID
      setMessages(prev => 
        prev.map(msg => msg.id === tempId ? { ...msg, id: data.id } : msg)
      );
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение. Попробуйте позже.",
        variant: "destructive"
      });
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="fixed bottom-20 right-5 w-80 sm:w-96 h-96 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden z-50">
      <div className="p-3 border-b bg-red-600 text-white flex justify-between items-center">
        <h3 className="font-semibold">Поддержка</h3>
        <Button variant="ghost" size="icon" className="text-white hover:bg-red-700" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-500">
                Напишите нам, и мы ответим в ближайшее время!
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index}
                  className={`mb-2 max-w-[80%] ${message.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}
                >
                  <div className={`p-2 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-red-100 text-gray-800 rounded-br-none' 
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}>
                    {message.text}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      <div className="p-3 border-t">
        <div className="flex">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите сообщение..."
            className="flex-1 mr-2"
          />
          <Button 
            onClick={handleSendMessage}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};