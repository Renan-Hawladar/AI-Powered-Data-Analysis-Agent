import React from 'react';
import { Send } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  loading: boolean;
  onSendMessage: (message: string) => Promise<void>;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  loading,
  onSendMessage,
}) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const message = input.trim();
    setInput('');

    try {
      await onSendMessage(message);
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-lg border border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-slate-300 font-semibold">Ask Questions About Your Data</h3>
        <p className="text-xs text-slate-400 mt-1">Get AI-powered insights about your analysis</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 py-8">
            <p className="text-sm">No messages yet. Ask a question to get started!</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-cyan-600 text-white rounded-br-none'
                  : 'bg-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-300 px-4 py-2 rounded-lg rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-slate-700 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your data..."
          disabled={loading}
          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded focus:outline-none focus:border-cyan-500 placeholder-slate-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
