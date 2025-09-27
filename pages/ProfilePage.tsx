import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserProfile, getSkillsForUser, getReviewsForUser, updateProfile, updateSkill } from '../services/api';
import { User, Skill, Review } from '../types';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillCard from '../components/SkillCard';
import { StarIcon, PencilIcon, ShieldCheckIcon } from '../components/icons';
import EditSkillModal from '../components/EditSkillModal';

const StarRatingDisplay: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className={`h-5 w-5 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-slate-300'}`} />
        ))}
    </div>
);

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, updateUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({ fullName: '', bio: '', openToVolunteering: false });
  const [isUpdating, setIsUpdating] = useState(false);

  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const [userData, skillsData, reviewsData] = await Promise.all([
          getUserProfile(userId),
          getSkillsForUser(userId),
          getReviewsForUser(userId)
        ]);
        setUser(userData);
        setSkills(skillsData);
        setReviews(reviewsData);
        setProfileData({
            fullName: userData.fullName,
            bio: userData.bio,
            openToVolunteering: userData.openToVolunteering,
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [userId]);
  
  const handleProfileDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setProfileData(prev => ({ ...prev, [name]: checked }));
    } else {
        setProfileData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsUpdating(true);
    try {
        const updatedUser = await updateProfile(userId, profileData);
        setUser(updatedUser);
        if (isOwnProfile) {
          updateUser(updatedUser); // Update context only if it's the current user
        }
        setIsEditing(false);
    } catch (error) {
        console.error("Failed to update profile", error);
        alert("Could not update profile. Please try again.");
    } finally {
        setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if(user) {
        setProfileData({
            fullName: user.fullName,
            bio: user.bio,
            openToVolunteering: user.openToVolunteering,
        });
    }
  };

  const handleSaveSkill = async (updatedSkillData: Partial<Omit<Skill, 'id' | 'userId'>>) => {
    if (!editingSkill) return;
    try {
        const updatedSkill = await updateSkill(editingSkill.id, updatedSkillData);
        setSkills(prevSkills => 
            prevSkills.map(s => (s.id === updatedSkill.id ? { ...s, ...updatedSkill } : s))
        );
        setEditingSkill(null);
    } catch (error) {
        console.error("Failed to update skill", error);
        alert("Could not update the skill. Please try again.");
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length)
    : 0;

  if (loading) {
    return <div className="text-center p-12"><LoadingSpinner size="lg" /></div>;
  }

  if (!user) {
    return <div className="text-center p-12 text-xl text-slate-600 dark:text-slate-400">User not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-800/50 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-8">
        <form onSubmit={handleSave} className="flex flex-col sm:flex-row items-center gap-8">
            <img src={user.avatarUrl} alt={user.fullName} className="h-32 w-32 rounded-full object-cover ring-4 ring-indigo-300 dark:ring-indigo-800 flex-shrink-0" />
            <div className="flex-1 w-full text-center sm:text-left">
                {isEditing ? (
                    <div className="space-y-4">
                        <input 
                            type="text" 
                            name="fullName"
                            value={profileData.fullName}
                            onChange={handleProfileDataChange}
                            className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 border-b-2 border-indigo-400 focus:outline-none focus:border-indigo-500 w-full p-2 rounded-t-md"
                        />
                        <textarea 
                            name="bio"
                            value={profileData.bio}
                            onChange={handleProfileDataChange}
                            rows={3}
                            className="text-lg text-slate-600 dark:text-slate-300 mt-2 bg-slate-100 dark:bg-slate-700 border-b-2 border-indigo-400 focus:outline-none focus:border-indigo-500 w-full p-2 rounded-t-md"
                        />
                        <div className="flex items-center justify-center sm:justify-start mt-4">
                            <input id="volunteering" type="checkbox" name="openToVolunteering" checked={profileData.openToVolunteering} onChange={handleProfileDataChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                            <label htmlFor="volunteering" className="ml-2 block text-sm text-slate-800 dark:text-slate-200">I'm open to volunteering for an NGO</label>
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">{user.fullName}</h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300 mt-2">{user.bio}</p>
                        <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{user.creditBalance} Credits</span>
                            {user.reputationScore && (
                                <div className="flex items-center gap-1.5" title="Reputation Score">
                                    <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                                    <span className="font-semibold text-slate-600 dark:text-slate-300">{Math.round(user.reputationScore)}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <StarRatingDisplay rating={averageRating} />
                                {reviews.length > 0 && <span className="font-semibold text-slate-600 dark:text-slate-300">{averageRating.toFixed(1)}</span>}
                                <span className="text-sm">({reviews.length} reviews)</span>
                            </div>
                            {user.openToVolunteering && <span className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">Open to Volunteering</span>}
                        </div>
                    </>
                )}
            </div>
            {isOwnProfile && (
                <div className="self-start mt-4 sm:mt-0">
                    {isEditing ? (
                        <div className="flex flex-col gap-2">
                            <button type="submit" disabled={isUpdating} className="btn-primary flex items-center justify-center w-32">
                                {isUpdating ? <LoadingSpinner size="sm"/> : 'Save Changes'}
                            </button>
                            <button type="button" onClick={handleCancel} className="btn-secondary w-32">
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center gap-2">
                            <PencilIcon className="h-5 w-5"/>
                            Edit Profile
                        </button>
                    )}
                </div>
            )}
        </form>
      </div>

      <div id="skills">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Skills Offered</h2>
        {skills.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {skills.map(skill => 
                <SkillCard 
                    key={skill.id} 
                    skill={{...skill, user: user}} 
                    isOwnerView={isOwnProfile}
                    onEditClick={setEditingSkill}
                />
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800/50 p-8 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">
            {user.fullName} hasn't listed any skills yet.
          </div>
        )}
      </div>

      <div id="reviews" className="mt-12">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Reviews</h2>
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review.id} className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                  {review.reviewer && <img src={review.reviewer.avatarUrl} alt={review.reviewer.fullName} className="h-12 w-12 rounded-full object-cover" />}
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{review.reviewer?.fullName || 'Anonymous'}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <StarRatingDisplay rating={review.rating} />
                    </div>
                    {review.comment && <p className="mt-3 text-slate-600 dark:text-slate-300 text-base italic">"{review.comment}"</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800/50 p-8 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">
            {user.fullName} has no reviews yet.
          </div>
        )}
      </div>
      
      {editingSkill && (
        <EditSkillModal 
            skill={editingSkill}
            onClose={() => setEditingSkill(null)}
            onSave={handleSaveSkill}
        />
      )}

    </div>
  );
};

export default ProfilePage;