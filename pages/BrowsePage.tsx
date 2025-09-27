import React, { useState, useEffect } from 'react';
import { findSkillsInRadius, getSwapsForUser } from '../services/api';
import { Skill, Swap } from '../types';
import SkillCard from '../components/SkillCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Map from '../components/Map';
import { LocationMarkerIcon } from '../components/icons';
import LocationModal from '../components/LocationModal';
import { useAuth } from '../contexts/AuthContext';

const BrowsePage: React.FC = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userRequests, setUserRequests] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [distance, setDistance] = useState(25); // in km
  const [center, setCenter] = useState<[number, number]>([34.0522, -118.2437]); // Default to LA
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentLocationName, setCurrentLocationName] = useState('Los Angeles');

  useEffect(() => {
    const fetchSkillsAndRequests = async () => {
      try {
        setLoading(true);
        const [allSkills, userSwaps] = await Promise.all([
          findSkillsInRadius(center[0], center[1], distance * 1000),
          user ? getSwapsForUser(user.id) : Promise.resolve([])
        ]);

        const requestedSkillIds = new Set(
          userSwaps.filter(s => s.learner.id === user?.id).map(s => s.skill.id)
        );
        
        setSkills(allSkills);
        setUserRequests(requestedSkillIds);

      } catch (error) {
        console.error("Failed to fetch skills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkillsAndRequests();
  }, [distance, center, user]);
  
  const filteredSkills = skills.filter(skill => 
    skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewRequest = (newSwap: Swap) => {
      setUserRequests(prev => new Set(prev).add(newSwap.skill.id));
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-8">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">Discover Skills</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Explore skills from talented people near you or in a location of your choice.</p>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search for skills (e.g., 'Guitar', 'Cooking')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full form-input"
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location</label>
            <button 
              onClick={() => setIsLocationModalOpen(true)} 
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <LocationMarkerIcon className="h-5 w-5" />
              <span className="truncate">{currentLocationName}</span>
            </button>
          </div>
          <div>
            <label htmlFor="distance" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Search Radius: <span className="font-bold text-indigo-600 dark:text-indigo-400">{distance} km</span>
            </label>
            <input
              id="distance"
              type="range"
              min="1"
              max="100"
              value={distance}
              onChange={(e) => setDistance(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer mt-3"
            />
          </div>
        </div>
      </div>


      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Map skills={filteredSkills} center={center} />
        </div>
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center p-8">
                <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredSkills.length > 0 ? (
                filteredSkills.map(skill => (
                    <SkillCard 
                        key={skill.id} 
                        skill={skill} 
                        isRequested={userRequests.has(skill.id)}
                        onNewRequest={handleNewRequest}
                    />
                ))
              ) : (
                <p className="text-slate-600 dark:text-slate-400 md:col-span-2 text-center py-10">No skills found. Try expanding your search criteria.</p>
              )}
            </div>
          )}
        </div>
      </div>
      {isLocationModalOpen && (
        <LocationModal
            isOpen={isLocationModalOpen}
            onClose={() => setIsLocationModalOpen(false)}
            onLocationSet={(coords, name) => {
                setCenter([coords.lat, coords.lng]);
                if (name) setCurrentLocationName(name);
                setIsLocationModalOpen(false);
            }}
        />
      )}
    </div>
  );
};

export default BrowsePage;