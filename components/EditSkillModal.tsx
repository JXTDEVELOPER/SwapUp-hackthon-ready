import React, { useState } from 'react';
import { Skill } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { SparklesIcon } from './icons';
import { getSkillSuggestions } from '../services/geminiService';

interface EditSkillModalProps {
  skill: Skill;
  onClose: () => void;
  onSave: (updatedSkillData: Partial<Omit<Skill, 'id' | 'userId'>>) => Promise<void>;
}

const EditSkillModal: React.FC<EditSkillModalProps> = ({ skill, onClose, onSave }) => {
  const [skillData, setSkillData] = useState({
    title: skill.title,
    description: skill.description,
    category: skill.category,
    creditsPerHour: skill.creditsPerHour,
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSkillData(prev => ({ ...prev, [name]: name === 'creditsPerHour' ? parseInt(value, 10) : value }));
  };

  const handleAISuggestions = async () => {
    if (!skillData.title) {
        alert("Please enter a skill title first.");
        return;
    }
    setAiLoading(true);
    try {
        const suggestions = await getSkillSuggestions(skillData.title);
        setSkillData(prev => ({
            ...prev,
            description: suggestions.description,
            category: suggestions.category,
            creditsPerHour: suggestions.credits,
        }));
    } catch (err) {
        alert((err as Error).message);
    } finally {
        setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(skillData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 p-2 rounded-full" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Edit Skill</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Skill Title</label>
                <input type="text" name="title" value={skillData.title} onChange={handleChange} placeholder="e.g., Sourdough Baking" className="mt-1 w-full form-input" />
            </div>
            <div className="relative">
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea name="description" value={skillData.description} onChange={handleChange} rows={4} className="mt-1 w-full form-input"></textarea>
                <button type="button" onClick={handleAISuggestions} disabled={aiLoading} className="absolute top-0 right-0 mt-1 mr-1 flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-1 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900 disabled:opacity-50">
                    {aiLoading ? <LoadingSpinner size="sm" /> : <><SparklesIcon className="h-4 w-4" /> AI Suggest</>}
                </button>
            </div>
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                <input type="text" name="category" value={skillData.category} onChange={handleChange} className="mt-1 w-full form-input" />
            </div>
            <div>
                <label htmlFor="creditsPerHour" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Credits per Hour ({skillData.creditsPerHour})</label>
                <input type="range" min="1" max="10" name="creditsPerHour" value={skillData.creditsPerHour} onChange={handleChange} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer mt-2" />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onClose} className="btn-secondary">
                    Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary w-36">
                    {loading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
                </button>
            </div>
        </form>
      </div>
      <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
    `}</style>
    </div>
  );
};

export default EditSkillModal;
