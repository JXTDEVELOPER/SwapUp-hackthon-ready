import React, { useState } from 'react';
import { geocodeLocation } from '../services/api';
import { CrosshairsIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSet: (coords: { lat: number; lng: number }, name?: string) => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, onLocationSet }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState<'geo' | 'search' | null>(null);
  const [error, setError] = useState('');

  const handleGeoLocate = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading('geo');
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationSet({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }, 'Current Location');
        setLoading(null);
      },
      () => {
        setError("Unable to retrieve your location. Please grant permission or search manually.");
        setLoading(null);
      }
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading('search');
    setError('');
    try {
      const coords = await geocodeLocation(searchTerm);
      onLocationSet(coords, searchTerm);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-full" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Change Location</h2>
        
        {error && <p className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4 text-center">{error}</p>}
        
        <div className="space-y-6">
          <button
            onClick={handleGeoLocate}
            disabled={loading === 'geo'}
            className="w-full btn-secondary flex items-center justify-center gap-2"
          >
            {loading === 'geo' ? <LoadingSpinner size="sm" /> : <><CrosshairsIcon className="h-5 w-5" /> Use My Current Location</>}
          </button>
          
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
            <span className="flex-shrink mx-4 text-slate-500 dark:text-slate-400 text-sm">OR</span>
            <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
          </div>
          
          <form onSubmit={handleSearch}>
            <label htmlFor="location-search" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Search for a city</label>
            <div className="flex gap-2">
              <input
                id="location-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g., New York, London, Tokyo"
                className="flex-1 form-input"
              />
              <button
                type="submit"
                disabled={loading === 'search'}
                className="btn-primary"
              >
                {loading === 'search' ? <LoadingSpinner size="sm" /> : 'Search'}
              </button>
            </div>
          </form>
        </div>
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

export default LocationModal;