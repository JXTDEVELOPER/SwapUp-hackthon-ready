import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Skill } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { TagIcon, CreditCardIcon, PlusCircleIcon, CheckCircleIcon, PencilIcon } from './icons';
import { requestSwap } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

interface SkillCardProps {
  skill: Skill;
  isRequested?: boolean;
  onNewRequest?: (swap: any) => void;
  isOwnerView?: boolean;
  onEditClick?: (skill: Skill) => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, isRequested = false, onNewRequest, isOwnerView = false, onEditClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(isRequested);

  const handleRequest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.id === skill.userId) {
        alert("You cannot request your own skill.");
        return;
    }

    setLoading(true);
    try {
      const newSwap = await requestSwap(skill.id, user.id);
      setRequested(true);
      if (onNewRequest) onNewRequest(newSwap);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const isOwnSkill = user?.id === skill.userId;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{skill.title}</h3>
            <div className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold px-3 py-1 rounded-full text-sm">
                <CreditCardIcon className="h-4 w-4" />
                <span>{skill.creditsPerHour} / hr</span>
            </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-4 text-sm">
            <TagIcon className="h-4 w-4" />
            <span>{skill.category}</span>
        </div>
        
        <p className="text-slate-600 dark:text-slate-300 mb-4 h-20 overflow-hidden text-ellipsis">
            {skill.description}
        </p>
      </div>

        <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
            {skill.user && (
            <Link to={`/profile/${skill.user.id}`} className="flex items-center gap-3 group">
                <img src={skill.user.avatarUrl} alt={skill.user.fullName} className="h-10 w-10 rounded-full object-cover" />
                <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{skill.user.fullName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">View Profile</p>
                </div>
            </Link>
            )}
            {isOwnerView ? (
                <button onClick={() => onEditClick && onEditClick(skill)} className="btn-secondary flex items-center gap-2">
                    <PencilIcon className="h-5 w-5" /> Edit Skill
                </button>
            ) : !isOwnSkill && (
                requested ? (
                    <div className="flex items-center gap-2 text-green-600 font-semibold px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                        <CheckCircleIcon className="h-5 w-5" />
                        <span>Requested</span>
                    </div>
                ) : (
                    <button onClick={handleRequest} disabled={loading} className="btn-secondary flex items-center gap-2">
                        {loading ? <LoadingSpinner size="sm" /> : <><PlusCircleIcon className="h-5 w-5" /> Request Swap</>}
                    </button>
                )
            )}
        </div>
    </div>
  );
};

export default SkillCard;