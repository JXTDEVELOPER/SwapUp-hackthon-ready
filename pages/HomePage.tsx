import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRecommendations } from '../services/api';
import { Skill } from '../types';
import SkillCard from '../components/SkillCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { AcademicCapIcon, UsersIcon, ArrowPathIcon, ArrowLeftIcon, ArrowRightIcon, RefreshIcon } from '../components/icons';

const HowItWorksCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
        <div className="mx-auto bg-indigo-100 dark:bg-indigo-900/50 rounded-full h-16 w-16 flex items-center justify-center mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300">{children}</p>
    </div>
);

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchRecs = async () => {
    try {
      setLoading(true);
      const recs = await getRecommendations(user?.id || "guest");
      setRecommendations(recs);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, [user]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
        const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
        scrollContainerRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center bg-white dark:bg-slate-800/50 p-12 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
        <h1 className="text-5xl font-extrabold text-slate-800 dark:text-slate-100 mb-4">
          Share a Skill, Learn a Skill
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
          Join the SwapUp community to exchange your talents. Use credits earned from teaching to learn something new from experts in your area.
        </p>
        <Link 
          to="/browse" 
          className="btn-primary px-8 py-3 text-lg font-bold transition-transform hover:scale-105 inline-block"
        >
          Explore Skills
        </Link>
      </section>

      {/* How It Works Section */}
       <section>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 text-center mb-10">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
                <HowItWorksCard icon={<UsersIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />} title="Offer Your Skills">
                    List skills you're passionate about, from coding to cooking. Set your own rate in credits per hour.
                </HowItWorksCard>
                 <HowItWorksCard icon={<ArrowPathIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />} title="Earn & Swap Credits">
                    Teach others to earn credits. There's no cash involved—our community runs on shared knowledge.
                </HowItWorksCard>
                 <HowItWorksCard icon={<AcademicCapIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />} title="Learn Something New">
                    Use your credits to learn from other talented members. Find experts near you and start your learning journey.
                </HowItWorksCard>
            </div>
        </section>


      {/* Recommendations Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {user ? "Skills Recommended For You" : "Popular Skills"}
            </h2>
            <div className="flex items-center gap-2">
                 <button onClick={fetchRecs} className="btn-secondary p-2" title="Refresh recommendations">
                    <RefreshIcon className="h-5 w-5"/>
                </button>
                 <button onClick={() => scroll('left')} className="btn-secondary p-2" aria-label="Scroll left">
                    <ArrowLeftIcon className="h-5 w-5"/>
                </button>
                 <button onClick={() => scroll('right')} className="btn-secondary p-2" aria-label="Scroll right">
                    <ArrowRightIcon className="h-5 w-5"/>
                </button>
            </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div ref={scrollContainerRef} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4 gap-8" style={{ scrollbarWidth: 'none' }}>
            {recommendations.map(skill => (
                <div key={skill.id} className="snap-start flex-shrink-0 w-full sm:w-[45%] md:w-[31%]">
                    <SkillCard skill={skill} />
                </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;