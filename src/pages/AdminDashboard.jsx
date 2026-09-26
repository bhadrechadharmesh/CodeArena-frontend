import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ShieldAlert, Users, FolderCheck, CalendarRange, EyeOff, Trash2, Ban, UserCheck, UserX, CheckCircle, Clock, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [violations, setViolations] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [errors, setErrors] = useState({});
  const [updatingTeacher, setUpdatingTeacher] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const fetchData = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      axios.get('/api/analytics/admin'),
      axios.get('/api/violations'),
      axios.get('/api/auth/admin/teachers')
    ]);
    const nextErrors = {};
    const names = ['analytics', 'violations', 'teachers'];
    results.forEach((result, index) => {
      if (result.status === 'rejected') nextErrors[names[index]] = result.reason.response?.data?.message || 'Could not load ' + names[index] + '.';
    });
    if (results[0].status === 'fulfilled') setAnalytics(results[0].value.data);
    if (results[1].status === 'fulfilled') setViolations(results[1].value.data.violations || []);
    if (results[2].status === 'fulfilled') setTeachers(results[2].value.data.teachers || []);
    setErrors(nextErrors);
    setLoading(false);
  };

  const handleApproveTeacher = async (teacherId, currentApprovedStatus) => {
    if (updatingTeacher) return;
    setUpdatingTeacher(teacherId);
    setActionMessage('');
    try {
      const res = await axios.put(`/api/auth/admin/teachers/${teacherId}/approve`, {
        isApproved: !currentApprovedStatus
      });
      if (res.data.success) {
        setTeachers(prev =>
          prev.map(t => (t._id === teacherId ? { ...t, isApproved: res.data.teacher.isApproved } : t))
        );
      }
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Failed to update approval status');
    } finally {
      setUpdatingTeacher(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 w-48 rounded mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  const metrics = analytics?.metrics || {
    totalUsers: '—',
    activeUsers: '—',
    totalQuizzes: '—',
    totalContests: '—',
    totalViolations: '—'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <p className="font-mono text-[11px] uppercase tracking-[.16em] text-[var(--muted)] mb-3">System overview</p>
      <h1 className="font-display font-semibold text-4xl tracking-[-.04em] dark:text-white mb-2">Platform operations.</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Review access, activity, and proctoring events.</p>

      <div className="flex flex-wrap items-center gap-4 mb-6"><button onClick={fetchData} className="button-secondary px-3 py-2 text-xs"><RefreshCw size={14}/>Refresh dashboard</button><a href="#teacher-approvals" className="arena-text-link">Review teacher access</a></div>
      {Object.entries(errors).map(([section, message]) => <div key={section} role="alert" className="desk-alert">{message} Previously loaded data may be out of date. Use Refresh dashboard to retry.</div>)}
      {actionMessage && <p role="alert" className="desk-alert">{actionMessage}</p>}
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="surface-card p-5 rounded-md flex items-center gap-3">
          <div className="p-2.5 surface-subtle rounded-md text-brand-600 dark:text-brand-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Total Users</span>
            <span className="font-display font-bold text-xl dark:text-white block mt-0.5">{metrics.totalUsers}</span>
          </div>
        </div>

        <div className="surface-card p-5 rounded-md flex items-center gap-3">
          <div className="p-2.5 surface-subtle rounded-md text-emerald-500">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Contest Participants</span>
            <span className="font-display font-bold text-xl dark:text-white block mt-0.5">{metrics.activeUsers}</span>
          </div>
        </div>

        <div className="surface-card p-5 rounded-md flex items-center gap-3">
          <div className="p-2.5 surface-subtle rounded-md text-indigo-500">
            <FolderCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Total Quizzes</span>
            <span className="font-display font-bold text-xl dark:text-white block mt-0.5">{metrics.totalQuizzes}</span>
          </div>
        </div>

        <div className="surface-card p-5 rounded-md flex items-center gap-3">
          <div className="p-2.5 surface-subtle rounded-md text-purple-500">
            <CalendarRange className="h-5 w-5" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Total Contests</span>
            <span className="font-display font-bold text-xl dark:text-white block mt-0.5">{metrics.totalContests}</span>
          </div>
        </div>

        <div className="surface-card p-5 rounded-md flex items-center gap-3 col-span-2 lg:col-span-1">
          <div className="p-2.5 surface-subtle rounded-md text-red-500">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Violations</span>
            <span className="font-display font-bold text-xl dark:text-white block mt-0.5">{metrics.totalViolations}</span>
          </div>
        </div>
      </div>

      {/* Growth Charts */}
      <div className="surface-card p-6 rounded-md mb-8">
        <div className="flex items-start justify-between mb-5"><div><p className="font-mono text-[10px] uppercase tracking-[.12em] text-[var(--muted)]">Registration activity</p><h3 className="font-display font-semibold text-lg dark:text-white mt-1">New registrations</h3></div><span className="text-[10px] font-mono text-[var(--muted)]">Last 6 months · UTC</span></div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.growthData || []}>
              <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="2 5" />
              <XAxis dataKey="month" stroke="#7c867e" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#7c867e" fontSize={10} tickLine={false} axisLine={false} width={28} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 0, fontSize: 11 }} cursor={{ fill: 'var(--canvas)' }} />
              <Bar dataKey="users" fill="var(--ink)" radius={[0, 0, 0, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Proctoring Log */}
      <div className="surface-card rounded-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50">
          <h3 className="font-display font-semibold text-lg dark:text-white">Recorded Proctoring Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="surface-subtle text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Violation Type</th>
                <th className="px-6 py-3">Details</th>
                <th className="px-6 py-3">Quiz/Contest</th>
                <th className="px-6 py-3">Timestamp</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
              {violations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    {errors.violations ? 'Proctoring events could not be loaded.' : 'No proctoring events recorded.'}
                  </td>
                </tr>
              ) : (
                violations.map((violation) => (
                  <tr key={violation._id} className="hover:bg-slate-50/55 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {violation.userId?.name || 'Unknown Student'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                        {violation.violationType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                      {violation.details || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {violation.contestId?.title || violation.quizId?.title || violation.challengeId?.title || 'System'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(violation.timestamp).toLocaleString()}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Approvals Section */}
      <div id="teacher-approvals" className="surface-card rounded-md overflow-hidden mt-8 mb-8 scroll-mt-20">
        <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
          <div>
            <h3 className="font-display font-semibold text-lg dark:text-white">Teacher Registration Approvals</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Review and approve teacher accounts to grant access</p>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400">
            {teachers.filter(t => !t.isApproved).length} Pending
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="surface-subtle text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-3">Teacher</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">College</th>
                <th className="px-6 py-3">Email Status</th>
                <th className="px-6 py-3">Approval Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    {errors.teachers ? 'Teacher accounts could not be loaded.' : 'No teachers registered on the platform yet.'}
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-slate-50/55 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {teacher.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {teacher.email}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {teacher.college || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {teacher.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                          <CheckCircle className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-500 dark:text-amber-400 text-xs font-semibold">
                          <Clock className="h-3.5 w-3.5" /> Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {teacher.isApproved ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                          Pending Approval
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {teacher.isApproved ? (
                        <button
                          disabled={updatingTeacher !== null}
                          onClick={() => handleApproveTeacher(teacher._id, true)}
                          className="inline-flex items-center gap-1 button-secondary font-bold text-xs px-2.5 py-1.5 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          <span>Revoke</span>
                        </button>
                      ) : (
                        <button
                          disabled={updatingTeacher !== null}
                          onClick={() => handleApproveTeacher(teacher._id, false)}
                          className="inline-flex items-center gap-1 button-secondary font-bold text-xs px-2.5 py-1.5 rounded text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </button>
                      )}
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
