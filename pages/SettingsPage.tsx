

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, addSkill } from '../services/api';
import { getSkillSuggestions } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { SparklesIcon } from '../components/icons';

const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ fullName: user?.fullName || '', bio: user?.bio || '', openToVolunteering: user?.openToVolunteering || false });
  const [newSkill, setNewSkill] = useState({ title: '', description: '', category: '', creditsPerHour: 5 });
  const [profileLoading, setProfileLoading] = useState(false);
  const [skillLoading, setSkillLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({ ...prev, openToVolunteering: e.target.checked }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileLoading(true);
    try {
      const updated = await updateProfile(user.id, profile);
      updateUser(updated);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setProfileLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };
  
  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setNewSkill(prev => ({ ...prev, [name]: name === 'creditsPerHour' ? parseInt(value, 10) : value }));
  };

  const handleAISuggestions = async () => {
    if (!newSkill.title) {
        alert("Please enter a skill title first.");
        return;
    }
    setAiLoading(true);
    try {
        const suggestions = await getSkillSuggestions(newSkill.title);
        setNewSkill(prev => ({
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

  const handleSkillSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!user) return;
      setSkillLoading(true);
      try {
          await addSkill(user.id, newSkill);
          setMessage('New skill added successfully!');
          setNewSkill({ title: '', description: '', category: '', creditsPerHour: 5 }); // Reset form
      } catch (err) {
          setMessage('Failed to add skill.');
      } finally {
          setSkillLoading(false);
          setTimeout(() => setMessage(''), 3000);
      }
  };

  if (!user) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">Account Settings</h1>
        
        {message && <div className="text-center p-3 rounded-lg bg-green-500/10 text-green-600 font-medium">{message}</div>}

        <div className="grid md:grid-cols-2 gap-8">
            {/* Profile Settings */}
            <div className="bg-white dark:bg-slate-800/50 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Edit Your Profile</h2>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                    <input type="text" name="fullName" value={profile.fullName} onChange={handleProfileChange} className="mt-1 form-input" />
                </div>
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                    <textarea name="bio" value={profile.bio} onChange={handleProfileChange} rows={4} className="mt-1 form-input"></textarea>
                </div>
                <div className="flex items-center">
                    <input id="volunteering" type="checkbox" name="openToVolunteering" checked={profile.openToVolunteering} onChange={handleCheckboxChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                    <label htmlFor="volunteering" className="ml-2 block text-sm text-slate-800 dark:text-slate-200">I'm open to volunteering for an NGO</label>
                </div>
                <button type="submit" disabled={profileLoading} className="w-full btn-primary flex justify-center">
                    {profileLoading ? <LoadingSpinner size="sm" /> : 'Save Profile'}
                </button>
                </form>
            </div>

            {/* Add Skill */}
            <div className="bg-white dark:bg-slate-800/50 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Add a New Skill</h2>
                <form onSubmit={handleSkillSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Skill Title</label>
                    <input type="text" name="title" value={newSkill.title} onChange={handleSkillChange} placeholder="e.g., Sourdough Baking" className="mt-1 form-input" />
                </div>
                <div className="relative">
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                    <textarea name="description" value={newSkill.description} onChange={handleSkillChange} rows={4} className="mt-1 form-input"></textarea>
                    <button type="button" onClick={handleAISuggestions} disabled={aiLoading} className="absolute top-0 right-0 mt-1 mr-1 flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-1 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900 disabled:opacity-50">
                        {aiLoading ? <LoadingSpinner size="sm" /> : <><SparklesIcon className="h-4 w-4" /> AI Suggest</>}
                    </button>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                    <input type="text" name="category" value={newSkill.category} onChange={handleSkillChange} className="mt-1 form-input" />
                </div>
                <div>
                    <label htmlFor="creditsPerHour" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Credits per Hour ({newSkill.creditsPerHour})</label>
                    <input type="range" min="1" max="10" name="creditsPerHour" value={newSkill.creditsPerHour} onChange={handleSkillChange} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer mt-2" />
                </div>
                <button type="submit" disabled={skillLoading} className="w-full btn-primary flex justify-center">
                    {skillLoading ? <LoadingSpinner size="sm" /> : 'Add Skill'}
                </button>
                </form>
            </div>
        </div>
    </div>
  );
};

export default SettingsPage;