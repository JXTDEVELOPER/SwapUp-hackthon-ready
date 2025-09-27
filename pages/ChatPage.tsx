import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getChatMessages, sendChatMessage, getSwapById, generateMeetLink } from '../services/api';
import { Message, Swap, SwapStatus } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { SendIcon, VideoCameraIcon, LinkIcon, CheckDoubleIcon } from '../components/icons';

const ChatPage: React.FC = () => {
  const { swapId } = useParams<{ swapId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [swap, setSwap] = useState<Swap | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!swapId) return;
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [initialMessages, swapData] = await Promise.all([
            getChatMessages(swapId),
            getSwapById(swapId)
        ]);
        setMessages(initialMessages);
        setSwap(swapData);
      } catch (error) {
        console.error("Failed to fetch chat data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [swapId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !swapId || !user) return;
    
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      content: newMessage,
      createdAt: new Date(),
      sender: user,
    };
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    
    try {
      const sentMessage = await sendChatMessage(swapId, newMessage);
      setMessages(prev => prev.map(m => m.id === tempMessage.id ? sentMessage : m));
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }
  };

  const handleGenerateLink = async () => {
    if (!swap) return;
    setIsGeneratingLink(true);
    try {
        const updatedSwap = await generateMeetLink(swap.id);
        setSwap(updatedSwap);
    } catch (error) {
        alert("Could not generate a Meet link. Please try again.");
    } finally {
        setIsGeneratingLink(false);
    }
  };

  const otherParty = swap ? (user?.id === swap.teacher.id ? swap.learner : swap.teacher) : null;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col h-[75vh]">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
            <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    <span className="text-indigo-600 dark:text-indigo-400">{swap?.skill.title}</span>
                </h1>
                {otherParty && <p className="text-sm text-slate-500 dark:text-slate-400">
                    Chat with <Link to={`/profile/${otherParty.id}`} className="hover:underline font-semibold">{otherParty.fullName}</Link>
                </p>}
            </div>
            {swap?.status === SwapStatus.ACCEPTED && (
                swap.googleMeetLink ? (
                    <a href={swap.googleMeetLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-green-600 text-white text-sm font-semibold px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors">
                        <VideoCameraIcon className="h-4 w-4"/> Join Meet
                    </a>
                ) : (
                    <button onClick={handleGenerateLink} disabled={isGeneratingLink} className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400">
                        {isGeneratingLink ? <LoadingSpinner size="sm" /> : <><LinkIcon className="h-4 w-4"/> Generate Link</>}
                    </button>
                )
            )}
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
          {loading ? <LoadingSpinner /> : (
            <div className="space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                  {msg.senderId !== user?.id && msg.sender && (
                    <img src={msg.sender.avatarUrl} alt={msg.sender.fullName} className="h-8 w-8 rounded-full" />
                  )}
                  <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl flex flex-col ${
                    msg.senderId === user?.id 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
                  }`}>
                    <p className="text-base break-words">{msg.content}</p>
                    <div className={`text-xs mt-1 flex items-center gap-1 self-end ${
                        msg.senderId === user?.id 
                        ? 'text-indigo-200' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.senderId === user?.id && msg.readAt && (
                            <span title="Read">
                                <CheckDoubleIcon className="h-4 w-4 text-blue-300" />
                            </span>
                        )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 form-input rounded-full"
            />
            <button type="submit" className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition-colors disabled:bg-indigo-400" disabled={!newMessage.trim()}>
                <SendIcon className="h-6 w-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;