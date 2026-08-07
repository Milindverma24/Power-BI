import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Building2, Users, Activity, Server, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') return;

    const fetchAdminData = async () => {
      try {
        const statsRes = await axios.get('/api/v1/admin/stats');
        setStats(statsRes.data);

        const usersRes = await axios.get('/api/v1/admin/users');
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Failed to load admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [user]);

  if (user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-main flex items-center gap-3">
            <Server className="text-accent-indigo" size={32} /> Super Admin Control Panel
          </h1>
          <p className="text-muted mt-2">Manage the entire platform, monitor usage, and oversee organizations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass rounded-2xl p-6 border border-border-theme flex items-center gap-4">
          <div className="bg-accent-indigo/20 p-4 rounded-xl text-accent-indigo">
            <Users size={24} />
          </div>
          <div>
            <p className="text-muted text-sm">Total Users</p>
            <p className="text-2xl font-bold text-main">{stats?.totalUsers}</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-6 border border-border-theme flex items-center gap-4">
          <div className="bg-emerald-500/20 p-4 rounded-xl text-accent-emerald">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-muted text-sm">Organizations</p>
            <p className="text-2xl font-bold text-main">{stats?.totalOrganizations}</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-6 border border-border-theme flex items-center gap-4">
          <div className="bg-amber-500/20 p-4 rounded-xl text-accent-amber">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-muted text-sm">API Usage (This Month)</p>
            <p className="text-2xl font-bold text-main">{stats?.apiUsageThisMonth.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl border border-border-theme flex flex-col flex-1 overflow-hidden">
        <div className="p-6 border-b border-border-theme">
          <h2 className="text-xl font-semibold text-main">Recent Users</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-sm text-main">
            <thead className="text-xs uppercase bg-surface-hover/50 text-muted sticky top-0">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Organization</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border-theme bg-surface/20 hover:bg-surface-hover/30 transition">
                  <td className="px-6 py-4">{u.firstName} {u.lastName}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="bg-accent-indigo/20 text-accent-indigo px-2 py-1 rounded text-xs">{u.role}</span>
                  </td>
                  <td className="px-6 py-4">{u.organization?.name || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={u.emailVerified ? 'text-accent-emerald' : 'text-accent-amber'}>
                      {u.emailVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
