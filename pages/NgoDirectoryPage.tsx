
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getVolunteers } from '../services/api';
import { User } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const NgoDirectoryPage: React.FC = () => {
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        setLoading(true);
        const data = await getVolunteers();
        setVolunteers(data);
      } catch (error) {
        console.error("Failed to fetch volunteers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVolunteers();
  }, []);

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <h1 className="text-3xl font-bold text-slate-800">NGO Volunteer Directory</h1>
        <p className="text-slate-600 mt-2">Connect with skilled individuals who are open to volunteering for NGOs.</p>
      </div>

      {loading ? (
        <div className="text-center p-12"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600 uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Bio</th>
                  <th className="px-6 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {volunteers.map(volunteer => (
                  <tr key={volunteer.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={volunteer.avatarUrl} alt={volunteer.fullName} className="h-10 w-10 rounded-full object-cover" />
                        <span className="font-semibold text-slate-800">{volunteer.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-600 max-w-md truncate">{volunteer.bio}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/profile/${volunteer.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {volunteers.length === 0 && <p className="text-center py-10 text-slate-500">No volunteers have signed up yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default NgoDirectoryPage;
