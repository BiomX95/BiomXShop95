import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { SupportChat } from './SupportChat';
import { Button } from '@/components/ui/button';

export const ChatButton: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  
  return (
    <>
      {isChatOpen && (
        <SupportChat onClose={() => setIsChatOpen(false)} />
      )}
      
      <div className="fixed bottom-5 right-5 z-40">
        <Button
          className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
          onClick={toggleChat}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
};