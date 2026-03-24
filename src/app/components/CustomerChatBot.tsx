import React, { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Bot, User, X } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: 'welcome-message',
    role: 'assistant',
    content:
      'Hello! I am the TPS Green assistant. Ask me about products, promotions, categories, or how to use the site.',
  },
];

export default function CustomerChatBot() {
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const buildSitePrompt = (history: ChatMessage[], userMessage: string) => {
    const conversationSummary =
      history.length > 0
        ? history
            .slice(-6)
            .map(entry => `${entry.role === 'user' ? 'User' : 'Assistant'}: ${entry.content}`)
            .join('\n')
        : 'No previous conversation.';
    return [
      'You are a helpful AI assistant for the TPS Green Enterprise website.',
      'Help visitors understand the site, products, promotions, categories, and shopping flow.',
      'If the answer is not available from the site context, say so clearly and avoid inventing details.',
      `Conversation so far:\n${conversationSummary}`,
      `User: ${userMessage}`,
      'Assistant:',
    ].join('\n\n');
  };

  async function sendMessage(message: string, history: ChatMessage[]) {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: buildSitePrompt(history, message),
        stream: false,
      }),
    });
    if (!res.ok) {
      let details = '';
      try {
        const errorData = await res.json();
        details = errorData?.error || errorData?.details || '';
      } catch {
        details = '';
      }
      throw new Error(`Chat request failed with status ${res.status}${details ? `: ${details}` : ''}`);
    }
    const data = await res.json();
    return data.response as string;
  }

  const handleSendMessage = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const trimmedMessage = chatInput.trim();
    if (!trimmedMessage || isSending) {
      return;
    }
    const nextUserMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: trimmedMessage,
    };
    const historyForPrompt = [...messages, nextUserMessage];
    setMessages(historyForPrompt);
    setChatInput('');
    setIsSending(true);
    try {
      const response = await sendMessage(trimmedMessage, historyForPrompt);
      setMessages(current => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: response.trim() || 'I could not generate a response just now.',
        },
      ]);
    } catch (error) {
      console.error('Error sending chat message:', error);
      const errorMessage =
        error instanceof Error && error.message.includes('OLLAMA_API_URL is not configured')
          ? 'The AI assistant is not configured yet. Add OLLAMA_API_URL in Vercel so /api/generate can reach your Ollama server.'
          : error instanceof Error && error.message.includes('Unable to contact the configured Ollama server')
            ? 'The website reached its AI endpoint, but that server could not connect to Ollama. Check that OLLAMA_API_URL points to a publicly reachable Ollama server.'
            : error instanceof Error && error.message.includes('Failed to fetch')
              ? 'I could not reach the website AI endpoint. Check the deployment and network settings.'
              : 'Something went wrong while contacting the AI server.';
      setMessages(current => [
        ...current,
        {
          id: `${Date.now()}-assistant-error`,
          role: 'assistant',
          content: errorMessage,
        },
      ]);
      toast.error('Unable to contact the AI assistant');
    } finally {
      setIsSending(false);
    }
  };

  const handleChatKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {isChatOpen && (
        <Card className="w-[calc(100vw-2rem)] max-w-[380px] border-green-200 bg-white shadow-2xl">
          <CardHeader className="rounded-t-xl bg-gradient-to-r from-green-700 to-emerald-600 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="h-5 w-5" />
                  TPS Green AI
                </CardTitle>
                <p className="mt-1 text-sm text-green-50/90">
                  Ask about products, offers, or using the website.
                </p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setIsChatOpen(false)}
                className="h-8 w-8 shrink-0 rounded-full text-white hover:bg-white/15 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[320px] px-4 py-4">
              <div className="space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex max-w-[88%] gap-3 rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        message.role === 'user'
                          ? 'bg-green-700 text-white'
                          : 'border border-green-100 bg-green-50 text-gray-900'
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          message.role === 'user'
                            ? 'bg-white/15 text-white'
                            : 'bg-green-700 text-white'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <p className="whitespace-pre-wrap leading-6">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isSending && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[88%] gap-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-gray-900 shadow-sm">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-700 text-white">
                        <Bot className="h-4 w-4" />
                      </div>
                      <p className="leading-6">Thinking...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t border-green-100 p-4">
            <form className="flex w-full gap-2" onSubmit={handleSendMessage}>
              <Input
                value={chatInput}
                onChange={event => setChatInput(event.target.value)}
                onKeyDown={handleChatKeyDown}
                placeholder="Ask something..."
                disabled={isSending}
              />
              <Button
                type="submit"
                size="icon"
                className="bg-green-700 text-white hover:bg-green-800"
                disabled={isSending || !chatInput.trim()}
              >
                <Bot className="h-5 w-5" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
      <Button
        type="button"
        size="icon"
        className="bg-green-700 text-white hover:bg-green-800 shadow-lg"
        onClick={() => setIsChatOpen(open => !open)}
        aria-label="Open chat bot"
      >
        <Bot className="h-6 w-6" />
      </Button>
    </div>
  );
}
