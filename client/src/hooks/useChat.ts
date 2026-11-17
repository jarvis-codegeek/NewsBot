import { useState, useCallback, useRef } from 'react';
import { ChatMessage } from '../types/news';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content:
        "Welcome to **The Daily Chronicle Intelligence Desk**. I have real-time access to today's syndicated world news, tech developments, financial markets, and science.\n\nAsk me anything about today's headlines or select an inquiry below!",
      timestamp: Date.now(),
    },
  ]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const botMsgId = 'bot-' + Date.now();
    const botPlaceholder: ChatMessage = {
      id: botMsgId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, botPlaceholder]);
    setIsGenerating(true);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Chat API returned an error');
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.token) {
                accumulated += data.token;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMsgId ? { ...msg, content: accumulated } : msg
                  )
                );
              }
            } catch (e) {
              // ignore partial chunk
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Chat stream error:', err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId
              ? {
                  ...msg,
                  content:
                    'Sorry, I encountered an issue retrieving that information. Please try again.',
                }
              : msg
          )
        );
      }
    } finally {
      setIsGenerating(false);
    }
  }, [messages, isGenerating]);

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content: 'Conversation history cleared. How can I assist you with today\'s news?',
        timestamp: Date.now(),
      },
    ]);
  };

  const openChat = (initialPrompt?: string) => {
    setIsOpen(true);
    if (initialPrompt) {
      setTimeout(() => sendMessage(initialPrompt), 150);
    }
  };

  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen((prev) => !prev);

  return {
    messages,
    isGenerating,
    isOpen,
    sendMessage,
    clearChat,
    openChat,
    closeChat,
    toggleChat,
  };
}
