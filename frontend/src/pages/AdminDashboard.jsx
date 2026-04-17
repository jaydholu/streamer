import { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Copy,
  RefreshCw,
  Trash2,
  Shield,
  Key,
  Check,
  X as XIcon,
} from 'lucide-react';
import { adminAPI } from '../api/admin';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { FullPageSpinner } from '../components/common/Spinner';
import { parseApiError } from '../utils/parseApiError';

export default function AdminDashboardPage() {
  const { addToast } = useToast();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [signupsEnabled, setSignupsEnabled] = useState(true);
  const [newCode, setNewCode] = useState('');
  const [loading, setLoading] = useState(true);

  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [confirmUsername, setConfirmUsername] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, codeRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.listUsers(),
        adminAPI.getInviteCode(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setInviteCode(codeRes.data.invite_code);
      setSignupsEnabled(codeRes.data.signups_enabled);
    } catch {
      addToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (userId, isActive) => {
    setActionLoading(true);
    try {
      if (isActive) {
        await adminAPI.deactivateUser(userId);
        addToast('User deactivated', 'success');
      } else {
        await adminAPI.activateUser(userId);
        addToast('User reactivated', 'success');
      }
      fetchAll();
    } catch (err) {
      addToast(parseApiError(err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (confirmUsername !== deleteModal.user?.username) {
      addToast('Username does not match', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await adminAPI.deleteUser(deleteModal.user.id);
      addToast('User deleted', 'success');
      setDeleteModal({ open: false, user: null });
      setConfirmUsername('');
      fetchAll();
    } catch (err) {
      addToast(parseApiError(err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCode = async () => {
    if (!newCode.trim()) return;
    try {
      const res = await adminAPI.updateInviteCode({ invite_code: newCode.trim() });
      setInviteCode(res.data.invite_code);
      setNewCode('');
      addToast('Invite code updated', 'success');
    } catch {
      addToast('Failed to update code', 'error');
    }
  };

  const handleRegenerateCode = async () => {
    try {
      const res = await adminAPI.regenerateInviteCode();
      setInviteCode(res.data.invite_code);
      addToast('New invite code generated', 'success');
    } catch {
      addToast('Failed to regenerate code', 'error');
    }
  };

  const handleToggleSignups = async () => {
    try {
      const res = await adminAPI.updateInviteCode({
        signups_enabled: !signupsEnabled,
      });
      setSignupsEnabled(res.data.signups_enabled);
      addToast(
        res.data.signups_enabled ? 'Sign-ups enabled' : 'Sign-ups disabled',
        'info'
      );
    } catch {
      addToast('Failed to toggle sign-ups', 'error');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    addToast('Invite code copied!', 'success');
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="page-enter px-4 md:px-12 pt-8 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'var(--c-accent-muted)',
              color: 'var(--c-accent)',
            }}
          >
            <Shield size={20} />
          </div>
          <p
            className="text-xs font-bold tracking-[0.3em] uppercase"
            style={{ color: 'var(--c-accent)' }}
          >
            Admin
          </p>
        </div>
        <h1
          className="text-3xl sm:text-4xl font-bold mb-2"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--c-text)',
          }}
        >
          Dashboard
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--c-sub)' }}>
          Manage users, invite codes, and platform-wide settings.
        </p>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats.total_users}
              color="var(--c-accent)"
            />
            <StatCard
              icon={UserCheck}
              label="Active"
              value={stats.active_users}
              color="var(--c-ok)"
            />
            <StatCard
              icon={UserX}
              label="Deactivated"
              value={stats.deactivated_users}
              color="var(--c-err)"
            />
            <StatCard
              icon={Clock}
              label="Watch Hours"
              value={stats.total_watch_hours}
              color="var(--c-warn)"
            />
          </div>
        )}

        {/* Invite Code */}
        <section
          className="rounded-2xl p-6 mb-6"
          style={{
            background: 'var(--c-card)',
            border: '1px solid var(--c-border)',
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'var(--c-accent-muted)',
                color: 'var(--c-accent)',
              }}
            >
              <Key size={18} />
            </div>
            <h2
              className="font-bold text-lg"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--c-text)',
              }}
            >
              Invite Code
            </h2>
          </div>

          {/* Current code */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2 mb-5">
            <code
              className="flex-1 rounded-xl px-4 py-3.5 text-sm font-mono font-bold tracking-wider text-center sm:text-left"
              style={{
                background: 'var(--c-surface)',
                color: 'var(--c-accent)',
                border: '1px solid var(--c-border)',
                letterSpacing: '0.12em',
              }}
            >
              {inviteCode}
            </code>
            <Button variant="secondary" onClick={copyCode} size="sm">
              <Copy size={15} /> Copy
            </Button>
            <Button variant="secondary" onClick={handleRegenerateCode} size="sm">
              <RefreshCw size={15} /> Regenerate
            </Button>
          </div>

          {/* Custom set */}
          <div className="flex flex-col sm:flex-row gap-2 mb-5">
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="Set custom invite code"
              className="input-base flex-1"
            />
            <Button
              onClick={handleUpdateCode}
              size="sm"
              disabled={!newCode.trim()}
              className="w-24"
            >
              Update
            </Button>
          </div>

          {/* Signups toggle */}
          <div
            className="flex items-center justify-between pt-4"
            style={{ borderTop: '1px solid var(--c-border)' }}
          >
            <div className="min-w-0">
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--c-text)' }}
              >
                Allow new sign-ups
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--c-dim)' }}>
                Disable to temporarily close registration.
              </p>
            </div>
            <ToggleSwitch checked={signupsEnabled} onChange={handleToggleSignups} />
          </div>
        </section>

        {/* Users Table */}
        <section
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--c-card)',
            border: '1px solid var(--c-border)',
          }}
        >
          <div className="p-6 pb-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'var(--c-accent-muted)',
                color: 'var(--c-accent)',
              }}
            >
              <Users size={18} />
            </div>
            <h2
              className="font-bold text-lg"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--c-text)',
              }}
            >
              User Management
            </h2>
            <span
              className="text-xs px-2 py-0.5 rounded-full ml-auto"
              style={{
                background: 'var(--c-hover)',
                color: 'var(--c-sub)',
                fontWeight: 600,
              }}
            >
              {users.length} total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    borderTop: '1px solid var(--c-border)',
                    borderBottom: '1px solid var(--c-border)',
                    background: 'var(--c-surface)',
                  }}
                >
                  <Th>Name</Th>
                  <Th>Username</Th>
                  <Th className="hidden md:table-cell">Email</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th className="hidden lg:table-cell">Joined</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid var(--c-border)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-surface)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Td>
                      <span
                        className="font-semibold"
                        style={{ color: 'var(--c-text)' }}
                      >
                        {u.fullname}
                      </span>
                    </Td>
                    <Td style={{ color: 'var(--c-sub)' }}>
                      <code style={{ fontSize: 12 }}>@{u.username}</code>
                    </Td>
                    <Td className="hidden md:table-cell" style={{ color: 'var(--c-dim)' }}>
                      {u.email}
                    </Td>
                    <Td>
                      <Pill
                        color={u.role === 'admin' ? 'var(--c-accent)' : 'var(--c-sub)'}
                        bg={
                          u.role === 'admin'
                            ? 'var(--c-accent-muted)'
                            : 'var(--c-hover)'
                        }
                      >
                        {u.role}
                      </Pill>
                    </Td>
                    <Td>
                      <Pill
                        color={u.is_active ? 'var(--c-ok)' : 'var(--c-err)'}
                        bg={
                          u.is_active
                            ? 'rgba(34, 197, 94, 0.14)'
                            : 'rgba(239, 68, 68, 0.14)'
                        }
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: u.is_active ? 'var(--c-ok)' : 'var(--c-err)',
                          }}
                        />
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </Pill>
                    </Td>
                    <Td
                      className="hidden lg:table-cell"
                      style={{ color: 'var(--c-dim)', fontSize: 12 }}
                    >
                      {new Date(u.created_at).toLocaleDateString()}
                    </Td>
                    <Td>
                      {u.role !== 'admin' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleUser(u.id, u.is_active)}
                            disabled={actionLoading}
                            className="px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer focus-ring"
                            style={{
                              background: u.is_active
                                ? 'var(--c-hover)'
                                : 'rgba(34, 197, 94, 0.14)',
                              color: u.is_active ? 'var(--c-sub)' : 'var(--c-ok)',
                            }}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => {
                              setDeleteModal({ open: true, user: u });
                              setConfirmUsername('');
                            }}
                            className="p-1.5 rounded-md transition-colors cursor-pointer focus-ring"
                            style={{ color: 'var(--c-dim)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                'rgba(239, 68, 68, 0.14)';
                              e.currentTarget.style.color = 'var(--c-err)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = 'var(--c-dim)';
                            }}
                            aria-label="Delete user"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Delete User Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, user: null })}
        title="Delete User"
        subtitle="This action cannot be undone."
      >
        <p className="text-sm mb-3" style={{ color: 'var(--c-sub)' }}>
          This will permanently delete{' '}
          <strong style={{ color: 'var(--c-text)' }}>
            {deleteModal.user?.fullname}
          </strong>{' '}
          and all their profiles, watchlist, and history.
        </p>
        <p className="text-sm mb-4" style={{ color: 'var(--c-dim)' }}>
          Type{' '}
          <code
            className="px-1.5 py-0.5 rounded"
            style={{
              color: 'var(--c-err)',
              background: 'rgba(239, 68, 68, 0.12)',
              fontFamily: 'monospace',
            }}
          >
            {deleteModal.user?.username}
          </code>{' '}
          to confirm.
        </p>
        <input
          type="text"
          value={confirmUsername}
          onChange={(e) => setConfirmUsername(e.target.value)}
          className="input-base mb-5"
          placeholder="Type username to confirm"
        />
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ open: false, user: null })}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={actionLoading}
            disabled={confirmUsername !== deleteModal.user?.username}
            onClick={handleDeleteUser}
          >
            Delete User
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div
      className="rounded-2xl p-5 transition-all"
      style={{
        background: 'var(--c-card)',
        border: '1px solid var(--c-border)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, color }}
        >
          <Icon size={18} />
        </div>
      </div>
      <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--c-dim)' }}>
        {label}
      </p>
      <p
        className="text-3xl font-bold"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--c-text)',
        }}
      >
        {value}
      </p>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      aria-checked={checked}
      role="switch"
      className="relative w-14 h-6 rounded-full transition-colors cursor-pointer focus-ring"
      style={{
        background: checked ? 'var(--c-accent)' : 'var(--c-border-h)',
      }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
        style={{
          transform: checked ? 'translateX(5px)' : 'translateX(-25px)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  );
}

function Th({ children, className = '' }) {
  return (
    <th
      className={`px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest ${className}`}
      style={{ color: 'var(--c-dim)' }}
    >
      {children}
    </th>
  );
}

function Td({ children, className = '', style = {} }) {
  return (
    <td className={`px-6 py-4 ${className}`} style={style}>
      {children}
    </td>
  );
}

function Pill({ children, color, bg }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize"
      style={{ color, background: bg }}
    >
      {children}
    </span>
  );
}
