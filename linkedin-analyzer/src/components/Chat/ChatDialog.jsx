import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

const ChatMessage = ({ message, isAI }) => (
  <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
    <div 
      className={`max-w-[80%] p-3 rounded-lg shadow-md transition-all duration-200 ${
        isAI 
          ? 'bg-base-200 text-base-content hover:bg-base-300' 
          : 'bg-base-100 text-base-content hover:bg-base-200 border border-base-300'
      }`}
    >
      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message}</p>
    </div>
  </div>
);

const ChatInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full p-3 textarea textarea-bordered resize-none min-h-[40px] max-h-[120px] bg-base-100 pr-12"
            rows="1"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="absolute right-2 bottom-2 text-xs text-base-content/50">
            {disabled ? 'Loading...' : 'Press Enter to send'}
          </div>
        </div>
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="btn btn-primary btn-circle"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

const ChatDialog = ({ isOpen, onClose, summary, rawData, chatState, onChatStateUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chatState.messages.length > 0) {
      scrollToBottom();
    }
  }, [chatState.messages]);

  // Initialize chat session if needed
  useEffect(() => {
    if (isOpen && !chatState.sessionId && summary && rawData) {
      initializeChat();
    }
  }, [isOpen, summary, rawData]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post('/chat/init', {
        summary,
        raw_data: rawData,
      });

      if (response.data.session_id) {
        onChatStateUpdate({
          ...chatState,
          sessionId: response.data.session_id,
          messages: [
            { 
              text: "Hi! I'm your AI assistant. I've analyzed the profile and I'm ready to help answer any questions you have about it.",
              isAI: true 
            }
          ]
        });
      }
    } catch (error) {
      setError('Failed to initialize chat. Please try again.');
      console.error('Chat initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message) => {
    if (!chatState.sessionId) return;

    try {
      setIsLoading(true);
      // Add user message immediately
      const updatedMessages = [
        ...chatState.messages,
        { text: message, isAI: false }
      ];
      onChatStateUpdate({ ...chatState, messages: updatedMessages });

      const response = await api.post('/chat/message', {
        session_id: chatState.sessionId,
        message,
      });

      if (response.data.response) {
        // Add AI response
        onChatStateUpdate({
          ...chatState,
          messages: [...updatedMessages, { text: response.data.response, isAI: true }]
        });
      }
    } catch (error) {
      setError('Failed to send message. Please try again.');
      console.error('Message sending error:', error);
      onChatStateUpdate({
        ...chatState,
        messages: [
          ...chatState.messages,
          { 
            text: 'Sorry, there was an error processing your message. Please try again.',
            isAI: true,
            isError: true
          }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

        <div className="relative w-full max-w-2xl bg-base-100 rounded-xl shadow-2xl transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-base-300">
            <Dialog.Title className="text-lg font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Chat about the Profile
            </Dialog.Title>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-circle btn-sm"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="h-[60vh] overflow-y-auto p-4 bg-base-200 space-y-4">
            {error && (
              <div className="alert alert-error shadow-lg">
                <span>{error}</span>
                <button 
                  onClick={() => setError(null)} 
                  className="btn btn-ghost btn-xs"
                >
                  Dismiss
                </button>
              </div>
            )}
            
            {chatState.messages.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg.text}
                isAI={msg.isAI}
              />
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg bg-base-200">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-base-300 bg-base-100">
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isLoading || !chatState.sessionId}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ChatDialog; 