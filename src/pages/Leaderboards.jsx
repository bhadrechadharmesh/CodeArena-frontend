import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, Award, Search, Zap } from 'lucide-react';

export default function Leaderboards() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('/api/auth/users'); // Lists all students/users
        // Sort users by total points descending
        const sorted = (res.data.users || []).sort((a, b) => b.totalPoints - a.totalPoints);
        setUsers(sorted);
      } catch (err) {
        console.error('Failed to load leaderboard:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.college && u.college.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse text-center">
        <Trophy className="h-10 w-10 text-slate-300 mx-auto animate-spin mb-2" />
        <span className="text-slate-400">Loading standings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="nm-inset p-3 rounded-full w-fit mx-auto text-amber-500 mb-2 flex items-center justify-center">
          <Trophy className="h-8 w-8" />
        </div>
        <h1 className="font-outfit font-extrabold text-3xl dark:text-white">Global Leaderboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Standings of elite software engineers and code competitors</p>
      </div>

      {/* Search Filter */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by candidate name or college..."
          className="w-full nm-input rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none dark:text-white"
        />
      </div>

      {/* Board */}
      <div className="nm-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="nm-inset-sm text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-3.5">Rank</th>
                <th className="px-6 py-3.5">Developer</th>
                <th className="px-6 py-3.5">College</th>
                <th className="px-6 py-3.5 text-center">Streak</th>
                <th className="px-6 py-3.5 text-right">Arena Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    No results match search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item, idx) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4">
                      {idx === 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-extrabold text-xs">1</span>
                      ) : idx === 1 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-750 font-extrabold text-xs">2</span>
                      ) : idx === 2 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-extrabold text-xs">3</span>
                      ) : (
                        <span className="text-slate-400 font-semibold px-2">{idx + 1}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full nm-inset-sm text-indigo-650 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
                        {item.name.charAt(0)}
                      </div>
                      <span className="text-slate-900 dark:text-white font-bold">{item.name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{item.college || 'Self Taught'}</td>
                    <td className="px-6 py-4 text-center">
                      {item.streak > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-xs text-orange-550 dark:text-orange-400 nm-inset-sm px-2 py-0.5 rounded font-bold">
                          <Zap className="h-3.5 w-3.5 fill-current" />
                          {item.streak}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-brand-600 dark:text-brand-400">
                      {item.totalPoints || 0} pts
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
