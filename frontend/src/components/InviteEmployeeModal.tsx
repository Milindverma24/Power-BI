import React, { useState } from 'react';
import axios from 'axios';
import { X, UserPlus, Loader2 } from 'lucide-react';

interface InviteEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InviteEmployeeModal: React.FC<InviteEmployeeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'VIEWER'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await axios.post('/api/v1/organizations/invites', formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data || 'Failed to send invite.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border-theme w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-border-theme flex items-center justify-between">
          <h2 className="text-xl font-bold text-main flex items-center gap-2">
            <UserPlus className="text-accent-primary" size={24} />
            Invite Employee
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-muted hover:text-main hover:bg-surface-hover rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-main mb-1">First Name</label>
              <input
                type="text"
                required
                className="w-full bg-background border border-border-theme text-main rounded-xl px-4 py-2 focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-main mb-1">Last Name</label>
              <input
                type="text"
                required
                className="w-full bg-background border border-border-theme text-main rounded-xl px-4 py-2 focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-main mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full bg-background border border-border-theme text-main rounded-xl px-4 py-2 focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-main mb-1">Role</label>
            <select
              className="w-full bg-background border border-border-theme text-main rounded-xl px-4 py-2 focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="VIEWER">Viewer</option>
              <option value="DATA_ANALYST">Data Analyst</option>
              <option value="BUSINESS_MANAGER">Business Manager</option>
              <option value="ORG_ADMIN">Org Admin</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-main bg-surface-hover hover:bg-border-theme rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-white bg-accent-primary hover:bg-accent-primary-hover rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
