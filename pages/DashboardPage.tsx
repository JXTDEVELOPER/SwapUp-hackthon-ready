import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSwapsForUser, addReview, generateMeetLink, updateSwapStatus } from '../services/api';
import { Swap, SwapStatus } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ReviewModal from './ReviewModal';
import { VideoCameraIcon, LinkIcon, ShieldCheckIcon, CheckCircleIcon, XCircleIcon } from '../components/icons';

const SwapStatusBadge: React.FC<{ status: SwapStatus }> = ({ status }) => {
  const styles = {
    [SwapStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    [SwapStatus.ACCEPTED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    [SwapStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    [SwapStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
  return <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${styles[status]}`}>{status}</span>;
};

interface SwapItemProps {
    swap: Swap;
    perspective: 'learner' | 'teacher';
    onReview: (swap: Swap) => void;
    isReviewed: boolean;
    onSwapUpdate: (updatedSwap: Swap) => void;
}

const SwapItem: React.FC<SwapItemProps> = ({ swap, perspective, onReview, isReviewed, onSwapUpdate }) => {
    const otherParty = perspective === 'learner' ? swap.teacher : swap.learner;
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const handleGenerateLink = async () => {
        setIsGeneratingLink(true);
        try {
            const updatedSwap = await generateMeetLink(swap.id);
            onSwapUpdate(updatedSwap);
        } catch (error) {
            console.error("Failed to generate meet link:", error);
            alert("Could not generate a Meet link. Please try again.");
        } finally {
            setIsGeneratingLink(false);
        }
    };
    
    const handleStatusUpdate = async (newStatus: SwapStatus) => {
        setIsUpdatingStatus(true);
        try {
            const updatedSwap = await updateSwapStatus(swap.id, newStatus);
            onSwapUpdate(updatedSwap);
        } catch (error) {
            console.error("Failed to update swap status:", error);
            alert("Could not update the swap. Please try again.");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
            <div className="flex items-start gap-4">
                <img src={otherParty.avatarUrl} alt={otherParty.fullName} className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{swap.skill.title}</h4>
                            <div className="flex items-center gap-2">
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    {perspective === 'learner' ? 'With ' : 'From '}
                                    <Link to={`/profile/${otherParty.id}`} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">{otherParty.fullName}</Link>
                                </p>
                                {otherParty.reputationScore && (
                                    <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400" title="Reputation Score">
                                        <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                                        <span className="font-semibold">{Math.round(otherParty.reputationScore)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <SwapStatusBadge status={swap.status} />
                    </div>

                    <div className="flex justify-end items-center mt-3 space-x-2">
                         {isUpdatingStatus ? <LoadingSpinner size="sm" /> :
                            <>
                                {swap.status === SwapStatus.PENDING && perspective === 'teacher' && (
                                    <>
                                        <button onClick={() => handleStatusUpdate(SwapStatus.CANCELLED)} className="btn btn-secondary text-xs px-2 py-1">Decline</button>
                                        <button onClick={() => handleStatusUpdate(SwapStatus.ACCEPTED)} className="btn btn-primary text-xs px-2 py-1">Accept</button>
                                    </>
                                )}
                                {swap.status === SwapStatus.ACCEPTED && (
                                    swap.googleMeetLink ? (
                                        <a href={swap.googleMeetLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-semibold px-2 py-1.5 rounded-md hover:bg-green-700 transition-colors">
                                            <VideoCameraIcon className="h-4 w-4"/> Join Meet
                                        </a>
                                    ) : (
                                        <button onClick={handleGenerateLink} disabled={isGeneratingLink} className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-2 py-1.5 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400">
                                            {isGeneratingLink ? <LoadingSpinner size="sm" /> : <><LinkIcon className="h-4 w-4"/> Gen. Link</>}
                                        </button>
                                    )
                                )}
                                {swap.status === SwapStatus.ACCEPTED && (
                                    <button onClick={() => handleStatusUpdate(SwapStatus.COMPLETED)} className="flex items-center gap-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-2 py-1.5 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                        <CheckCircleIcon className="h-4 w-4" /> Mark Complete
                                    </button>
                                )}
                                {swap.status === SwapStatus.COMPLETED && !isReviewed && (
                                    <button onClick={() => onReview(swap)} className="font-medium text-green-600 hover:underline text-sm">Leave Review</button>
                                )}
                                <Link to={`/chat/${swap.id}`} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline text-sm">Chat</Link>
                            </>
                         }
                    </div>
                </div>
            </div>
        </div>
    );
};


const DashboardPage: React.FC = () => {
  const { user, addCredits } = useAuth();
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [creditsMessage, setCreditsMessage] = useState('');
  const [reviewingSwap, setReviewingSwap] = useState<Swap | null>(null);
  const [submittedReviewIds, setSubmittedReviewIds] = useState<Set<string>>(new Set());

  const fetchSwaps = useCallback(async () => {
    if (!user) return;
    try {
      const userSwaps = await getSwapsForUser(user.id);
      setSwaps(userSwaps);
    } catch (error) {
      console.error("Failed to fetch swaps:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    setLoading(true);
    fetchSwaps();
  }, [fetchSwaps]);

  const handleAddCredits = async () => {
    const amount = 10;
    if (window.confirm(`This is a frontend-only simulation. Do you want to add ${amount} credits to your account?`)) {
        setCreditsLoading(true);
        setCreditsMessage('');
        try {
            await addCredits(amount);
            setCreditsMessage(`Successfully added ${amount} credits!`);
        } catch (error) {
            setCreditsMessage('Failed to add credits.');
        } finally {
            setCreditsLoading(false);
            setTimeout(() => setCreditsMessage(''), 4000);
        }
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!reviewingSwap || !user) return;
    const reviewee = user.id === reviewingSwap.teacher.id ? reviewingSwap.learner : reviewingSwap.teacher;
    try {
        await addReview(reviewingSwap.id, user.id, reviewee.id, rating, comment);
        setSubmittedReviewIds(prev => new Set(prev).add(reviewingSwap.id));
        setReviewingSwap(null);
    } catch (error) {
        console.error("Failed to submit review:", error);
        alert("There was an error submitting your review. Please try again.");
    }
  };

  const handleSwapUpdate = (updatedSwap: Swap) => {
    setSwaps(prevSwaps => prevSwaps.map(s => s.id === updatedSwap.id ? {...s, ...updatedSwap} : s));
  };

  if (loading) {
    return <div className="text-center p-12"><LoadingSpinner size="lg" /></div>;
  }
  
  const incomingRequests = swaps.filter(s => s.teacher.id === user?.id);
  const outgoingRequests = swaps.filter(s => s.learner.id === user?.id);

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-8">Your Dashboard</h1>
      
      <section className="mb-8">
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">Your Credits</h2>
              <p className="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">{user?.creditBalance} <span className="text-3xl text-slate-500 dark:text-slate-400 font-medium">Credits</span></p>
            </div>
            <button 
              onClick={handleAddCredits}
              disabled={creditsLoading}
              className="mt-4 sm:mt-0 btn-primary px-6 py-3 font-bold"
            >
              {creditsLoading ? <LoadingSpinner size="sm" /> : 'Add 10 Credits'}
            </button>
          </div>
          {creditsMessage && <p className={`mt-4 text-center font-medium p-2 rounded-lg ${creditsMessage.includes('Successfully') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{creditsMessage}</p>}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">Incoming Requests</h2>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            {incomingRequests.length > 0 ? (
              incomingRequests.map(swap => (
                <SwapItem key={swap.id} swap={swap} perspective="teacher" onReview={setReviewingSwap} isReviewed={submittedReviewIds.has(swap.id)} onSwapUpdate={handleSwapUpdate} />
              ))
            ) : <p className="text-slate-500 dark:text-slate-400 text-center py-8">No incoming requests.</p>}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">Outgoing Requests</h2>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            {outgoingRequests.length > 0 ? (
              outgoingRequests.map(swap => (
                <SwapItem key={swap.id} swap={swap} perspective="learner" onReview={setReviewingSwap} isReviewed={submittedReviewIds.has(swap.id)} onSwapUpdate={handleSwapUpdate} />
              ))
            ) : <p className="text-slate-500 dark:text-slate-400 text-center py-8">You haven't made any requests yet.</p>}
          </div>
        </section>
      </div>

      {reviewingSwap && (
        <ReviewModal 
            swap={reviewingSwap}
            onClose={() => setReviewingSwap(null)}
            onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default DashboardPage;