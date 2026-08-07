import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Users, Mail, Shield, Loader2, UserPlus } from 'lucide-react';
import { InviteEmployeeModal } from '../components/InviteEmployeeModal';

interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departmentName: string;
}

const OrganizationSettings = () => {
  const [org, setOrg] = useState<Organization | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchEmployees = async () => {
    try {
      const empRes = await axios.get('/api/v1/organizations/employees');
      setEmployees(empRes.data);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgRes, empRes] = await Promise.all([
          axios.get('/api/v1/organizations/me'),
          axios.get('/api/v1/organizations/employees')
        ]);
        setOrg(orgRes.data);
        setEmployees(empRes.data);
      } catch (err) {
        console.error("Failed to fetch organization data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center text-accent-indigo">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!org) {
    return <div className="p-8 text-main text-center">You are not part of an organization yet.</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="glass rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-indigo/10 blur-3xl rounded-full" />
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-accent-primary/20 rounded-xl flex items-center justify-center text-accent-primary">
            <Building2 size={24} />
          </div>
          <h1 className="text-3xl font-bold text-main">{org.name}</h1>
        </div>
        <p className="text-muted ml-16">
          Member since {new Date(org.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-main flex items-center gap-2">
          <Users className="text-accent-primary" /> Employees
        </h2>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-accent-primary hover:bg-accent-primary-hover text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-accent-primary/20"
        >
          <UserPlus size={18} />
          Invite Employee
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-hover/50 border-b border-border-theme">
              <th className="p-4 text-main font-medium">Name</th>
              <th className="p-4 text-main font-medium">Email</th>
              <th className="p-4 text-main font-medium">Role</th>
              <th className="p-4 text-main font-medium">Department</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b border-border-theme hover:bg-surface-hover/30 transition-colors">
                <td className="p-4 text-main font-medium flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-xs font-bold text-accent-primary">
                    {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                  </div>
                  {emp.firstName} {emp.lastName}
                </td>
                <td className="p-4 text-main">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-muted" /> {emp.email}
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary border border-accent-primary/20 rounded-full text-xs font-medium flex items-center gap-1 w-max">
                    <Shield size={12} /> {emp.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-main">
                  {emp.departmentName || <span className="text-muted italic">Unassigned</span>}
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted">No employees found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <InviteEmployeeModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => {
          fetchEmployees();
          setShowInviteModal(false);
        }}
      />
    </div>
  );
};

export default OrganizationSettings;
