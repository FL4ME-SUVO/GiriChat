import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Smile, Mic, Image, Plus } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { socketService } from '@/services/socketService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { EmojiPicker } from './EmojiPicker';
import { cn } from '@/lib/utils';

export function MessageInput() {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { sendMessage, activeChannelId, currentUser, setTyping } = useChatStore();

  const handleSend = () => {
    if (!message.trim() || !activeChannelId) return;

    sendMessage(message.trim());
    setMessage('');
    setIsTyping(false);
    
    if (currentUser && typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      setTyping(activeChannelId, currentUser.id, false);
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }

    // Handle typing indicator
    if (activeChannelId) {
      if (value.trim() && !isTyping) {
        setIsTyping(true);
        socketService.startTyping(activeChannelId);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socketService.stopTyping(activeChannelId);
      }, 1000);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleFileUpload = () => {
    // Simulate file upload
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,video/*,.pdf,.doc,.docx,.txt';
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // In a real app, you'd upload the file and get a URL
        const fileUrl = URL.createObjectURL(file);
        sendMessage(`Shared ${file.name}`, file.type.startsWith('image/') ? 'image' : 'file', fileUrl, file.name);
      }
    };
    fileInput.click();
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 flex-shrink-0"
          onClick={handleFileUpload}
        >
          <Plus className="h-5 w-5" />
        </Button>

        {/* Message Input Container */}
        <div className="flex-1 relative">
          <div className="relative bg-muted rounded-2xl border border-border focus-within:border-primary transition-colors">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="resize-none border-0 bg-transparent p-3 pr-20 min-h-[44px] max-h-[120px] focus-visible:ring-0 focus-visible:ring-offset-0"
              rows={1}
            />

            {/* Action Buttons */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="h-4 w-4" />
                </Button>

                {showEmojiPicker && (
                  <div className="absolute bottom-10 right-0 z-50">
                    <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleFileUpload}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Send Button */}
        <motion.div
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className={cn(
              "h-10 w-10 rounded-full flex-shrink-0 transition-all",
              message.trim() 
                ? "bg-primary hover:bg-primary-hover text-primary-foreground" 
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      {/* Voice Note Option */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground gap-2"
        >
          <Mic className="h-3 w-3" />
          Hold to record voice message
        </Button>
      </div>
    </div>
  );
}