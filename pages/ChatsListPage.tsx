import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSwapsForUser } from '../services/api';
import { Swap } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const ChatsListPage: React.FC = () => {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchChats = async () => {
      try {
        setLoading(true);
        const userSwaps = await getSwapsForUser(user.id);
        setSwaps(userSwaps.filter(s => s.status === 'accepted' || s.status === 'pending')); // Only show active/pending chats
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Your Conversations</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Manage all your active and pending skill swaps here.</p>
      </div>

      {loading ? (
        <div className="text-center p-12"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {swaps.length > 0 ? (
              swaps.map(swap => {
                const otherParty = swap.teacher.id === user?.id ? swap.learner : swap.teacher;
                return (
                  <Link 
                    key={swap.id}
                    to={`/chat/${swap.id}`}
                    className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img src={otherParty.avatarUrl} alt={otherParty.fullName} className="h-14 w-14 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate">{otherParty.fullName}</p>
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{swap.skill.title}</p>
                          </div>
                          {swap.latestMessage && (
                             <p className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0 ml-2">
                                {new Date(swap.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </p>
                          )}
                        </div>
                        {swap.latestMessage ? (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
                            {swap.latestMessage.content}
                          </p>
                        ) : (
                           <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 italic">
                            No messages yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="text-center py-12 text-slate-500 dark:text-slate-400">
                You have no active conversations.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatsListPage;