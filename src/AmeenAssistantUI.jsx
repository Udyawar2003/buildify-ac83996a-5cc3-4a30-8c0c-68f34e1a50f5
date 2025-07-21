
import React, { useState, useEffect } from 'react';
import { processOwnerCommand } from './ameen-api.js';

const AmeenAssistantUI = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "I am Ameen, your digital product business assistant. How may I assist you today?" }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    setInput('');

    // Process the command
    setTimeout(() => {
      const response = processOwnerCommand(input);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsProcessing(false);
    }, 1000); // Simulate processing time
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="bg-gray-800 p-4 shadow-md">
        <h1 className="text-xl font-bold text-blue-400">Ameen Digital Product Assistant</h1>
      </div>
      
      <div 
        id="messages-container"
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-3/4 rounded-lg p-3 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-100 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 bg-gray-800">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Ameen about your digital products business..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default AmeenAssistantUI;