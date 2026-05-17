import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message, ChatState } from './types';
import { SUGGESTED_PROMPTS } from './constant';
import { gemini } from './services/geminiService';

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function App() {
  const [state, setState] = useState<ChatState>({
    messages: [
      {
        id: 'welcome',
        role: 'model',
        content: "Hello! I'm **Skillbridge AI**. How can I help you advance your career today?",
        timestamp: new Date()
      }
    ],
    isLoading: false,
    error: null
  });
  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || state.isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null
    }));
    setInput('');

    try {
      const history = [...state.messages, userMessage];
      const mockProgress = { completedTopicIds: [] };
      const responseContent = await gemini.generateResponse(history, mockProgress, undefined);
      
      const modelMessage: Message = {
        id: generateId(),
        role: 'model',
        content: responseContent,
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, modelMessage],
        isLoading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="icon-container">
            <Sparkles size={24} color="white" />
          </div>
          <h1>Skillbridge AI</h1>
        </div>

        <div className="sidebar-content">
          <h2 className="sidebar-title">Suggested Prompts</h2>
          <div className="suggested-prompts">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button 
                key={idx} 
                className="prompt-btn"
                onClick={() => handleSend(prompt)}
                disabled={state.isLoading}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-area">
        <div className="chat-header">
          <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Skillbridge Assistant</span>
        </div>

        <div className="chat-messages">
          {state.messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.role}`}>
              <div className={`avatar ${msg.role}`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} color="white" />}
              </div>
              <div className="message-content">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          
          {state.isLoading && (
            <div className="message-wrapper model">
              <div className="avatar model">
                <Bot size={20} color="white" />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          
          {state.error && (
            <div style={{ color: '#ef4444', textAlign: 'center', padding: '16px', fontSize: '0.9rem' }}>
              Error: {state.error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area">
          <div className="input-container">
            <textarea
              className="chat-input"
              placeholder="Message Skillbridge AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button 
              className="send-button"
              onClick={() => handleSend(input)}
              disabled={!input.trim() || state.isLoading}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
