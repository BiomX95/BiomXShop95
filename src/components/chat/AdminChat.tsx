import { useState, useEffect, useRef } from 'react';
import { Send, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

type ChatUser = {
  gameId: string;
  nickname?: string;
  lastMessage: string;
  unreadCount: number;
  lastActivityAt: Date;
};

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
  isRead: boolean;
};

export const AdminChat: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Загрузка списка пользователей с активными чатами
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/chat/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Ошибка при загрузке пользователей:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список пользователей",
        variant: "destructive"
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  // Загрузка сообщений выбранного пользователя
  const fetchMessages = async (gameId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/chat/messages?gameId=${gameId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        
        // Отмечаем все сообщения как прочитанные
        markMessagesAsRead(gameId);
      }
    } catch (error) {
      console.error('Ошибка при загрузке сообщений:', error);
    } finally {
      setLoading(false);
    }
  };

  // Отмечаем сообщения пользователя как прочитанные
  const markMessagesAsRead = async (gameId: string) => {
    try {
      await fetch(`/api/chat/messages/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gameId })
      });
      
      // Обновляем счетчик непрочитанных сообщений
      setUsers(prev => 
        prev.map(user => 
          user.gameId === gameId ? { ...user, unreadCount: 0 } : user
        )
      );
    } catch (error) {
      console.error('Ошибка при отметке сообщений как прочитанных:', error);
    }
  };

  // Начальная загрузка пользователей
  useEffect(() => {
    fetchUsers();
    
    // Настраиваем интервал обновления каждые 30 секунд
    const interval = setInterval(() => {
      fetchUsers();
      
      // Если выбран пользователь, обновляем его сообщения
      if (selectedUser) {
        fetchMessages(selectedUser);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Загрузка сообщений при выборе пользователя
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser);
    }
  }, [selectedUser]);

  // Прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectUser = (gameId: string) => {
    setSelectedUser(gameId);
  };

  const handleBackToUserList = () => {
    setSelectedUser(null);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const tempId = Date.now().toString();
    const newMsg: Message = {
      id: tempId,
      text: newMessage,
      sender: 'admin',
      timestamp: new Date(),
      isRead: false
    };

    // Оптимистично обновляем UI
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');

    try {
      const response = await fetch('/api/chat/messages/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: newMessage,
          gameId: selectedUser
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

  const formatDate = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    // Если сообщение сегодня, показываем только время
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Иначе показываем дату и время
    return messageDate.toLocaleString([], { 
      day: 'numeric', 
      month: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-3 border-b bg-red-600 text-white flex justify-between items-center">
        <h3 className="font-semibold">
          {selectedUser ? 'Чат с пользователем' : 'Управление чатами'}
        </h3>
        
        {selectedUser ? (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-red-700"
            onClick={handleBackToUserList}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Назад
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-red-700"
            onClick={fetchUsers}
            disabled={loadingUsers}
          >
            <RefreshCw className={`h-4 w-4 ${loadingUsers ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>

      {selectedUser ? (
        <>
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <>
                {messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    Нет сообщений
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div 
                      key={index}
                      className={`mb-2 max-w-[80%] ${message.sender === 'admin' ? 'ml-auto' : 'mr-auto'}`}
                    >
                      <div className={`p-2 rounded-lg ${
                        message.sender === 'admin' 
                          ? 'bg-red-100 text-gray-800 rounded-br-none' 
                          : 'bg-gray-200 text-gray-800 rounded-bl-none'
                      }`}>
                        {message.text}
                      </div>
                      <div className={`text-xs text-gray-500 mt-1 ${
                        message.sender === 'admin' ? 'text-right' : 'text-left'
                      }`}>
                        {formatDate(message.timestamp)}
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
        </>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Активные</TabsTrigger>
              <TabsTrigger value="all">Все чаты</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="p-0">
              {loadingUsers ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : (
                <div className="divide-y">
                  {users
                    .filter(user => user.unreadCount > 0)
                    .map(user => (
                      <div 
                        key={user.gameId} 
                        className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                        onClick={() => handleSelectUser(user.gameId)}
                      >
                        <div>
                          <div className="font-medium">
                            {user.nickname || `ID: ${user.gameId}`}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {user.lastMessage}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <div className="text-xs text-gray-500">
                            {formatDate(user.lastActivityAt)}
                          </div>
                          {user.unreadCount > 0 && (
                            <div className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5 mt-1">
                              {user.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {users.filter(user => user.unreadCount > 0).length === 0 && (
                      <div className="p-6 text-center text-gray-500">
                        Нет активных чатов
                      </div>
                    )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="all" className="p-0">
              {loadingUsers ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : (
                <div className="divide-y">
                  {users.length > 0 ? (
                    users.map(user => (
                      <div 
                        key={user.gameId} 
                        className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                        onClick={() => handleSelectUser(user.gameId)}
                      >
                        <div>
                          <div className="font-medium">
                            {user.nickname || `ID: ${user.gameId}`}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {user.lastMessage}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <div className="text-xs text-gray-500">
                            {formatDate(user.lastActivityAt)}
                          </div>
                          {user.unreadCount > 0 && (
                            <div className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5 mt-1">
                              {user.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      Нет активных чатов
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};