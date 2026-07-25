import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../context/AuthContext';
import { Send, Users, Bot, User as UserIcon, MessageSquare } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  ai: boolean;
}

const MeetingRoom = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const roomId = user?.organization?.id || 'default-room'; // Use org ID as room for now
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws-meeting');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/room/${roomId}`, (message) => {
        const parsedMessage = JSON.parse(message.body);
        setMessages((prev) => [...prev, parsedMessage]);
      });
      
      // Send a join message
      const joinMsg = {
        id: crypto.randomUUID(),
        sender: 'System',
        content: `${user?.firstName || 'User'} has joined the meeting.`,
        ai: false,
      };
      client.publish({
        destination: `/app/meeting.chat/${roomId}`,
        body: JSON.stringify(joinMsg)
      });
    };

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [roomId, user?.firstName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !stompClient?.connected) return;

    const isAskAi = inputValue.toLowerCase().startsWith('@ai');
    
    const chatMsg = {
      id: crypto.randomUUID(),
      sender: user?.firstName || 'User',
      content: inputValue,
      ai: false,
    };

    // Broadcast user's message
    stompClient.publish({
      destination: `/app/meeting.chat/${roomId}`,
      body: JSON.stringify(chatMsg)
    });

    // If @ai is triggered, send a separate request to the AI handler
    if (isAskAi) {
      const aiRequestMsg = {
        ...chatMsg,
        content: inputValue.substring(3).trim() // Remove @ai
      };
      stompClient.publish({
        destination: `/app/meeting.ask-ai/${roomId}`,
        body: JSON.stringify(aiRequestMsg)
      });
    }

    setInputValue('');
  };

  return (
    <div className="p-8 animate-fade-in max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="text-accent-indigo" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-main">AI Meeting Room</h1>
            <p className="text-muted mt-1">Real-time collaborative dashboard review.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-surface-hover px-4 py-2 rounded-xl text-sm font-medium text-main">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </div>
      </div>

      <div className="flex-1 glass rounded-2xl border border-border-theme flex flex-col overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-muted gap-3">
              <MessageSquare size={48} className="opacity-50" />
              <p>Welcome to the meeting. Start chatting, or type "@ai" to ask the assistant.</p>
            </div>
          )}
          
          {messages.map((msg, idx) => {
            const isSystem = msg.sender === 'System';
            const isMe = msg.sender === user?.firstName;
            const isAi = msg.ai;

            if (isSystem) {
              return (
                <div key={idx} className="flex justify-center my-4">
                  <span className="text-xs text-muted bg-surface/50 px-3 py-1 rounded-full border border-border-theme">
                    {msg.content}
                  </span>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isAi ? 'bg-accent-indigo/20 text-accent-indigo' : isMe ? 'bg-accent-purple/20 text-accent-purple' : 'bg-surface-hover text-main'}`}>
                    {isAi ? <Bot size={16} /> : <UserIcon size={16} />}
                  </div>
                  
                  <div className={`p-4 rounded-2xl ${isAi ? 'bg-accent-indigo/10 border border-accent-indigo/20 text-indigo-100 rounded-bl-sm' : isMe ? 'bg-purple-600 text-main rounded-br-sm' : 'bg-surface-hover text-main rounded-bl-sm'}`}>
                    {!isMe && <div className="text-xs font-semibold mb-1 opacity-70">{msg.sender}</div>}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-surface/80 border-t border-border-theme backdrop-blur-md">
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder='Type a message, or "@ai summarize sales"'
              className="flex-1 bg-surface border border-border-theme rounded-xl px-4 py-3 text-main focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || !stompClient?.connected}
              className="bg-accent-indigo hover:bg-accent-indigo disabled:opacity-50 text-main font-medium px-6 py-3 rounded-xl transition flex items-center gap-2"
            >
              <Send size={18} />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;
