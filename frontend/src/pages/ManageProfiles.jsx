import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Lock, Unlock, ArrowLeft, Pencil } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { profileAPI } from '../api/profiles';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import ProfileAvatar from '../components/common/ProfileAvatar';
import AvatarPicker from '../components/common/AvatarPicker';
import Brand from '../components/common/Brand';
import ThemeToggle from '../components/common/ThemeToggle';
import { parseApiError } from '../utils/parseApiError';

export default function ManageProfilesPage() {
  const { profiles, fetchProfiles } = useProfile();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, profile: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, profile: null });
  const [pinModal, setPinModal] = useState({ open: false, profile: null, action: '' });

  const [formName, setFormName] = useState('');
  const [formAvatar, setFormAvatar] = useState('avatar_1');
  const [formPin, setFormPin] = useState('');
  const [loading, setLoading] = useState(false);

  // Get list of avatars already used by other profiles in this account
  const usedAvatars = profiles.map((p) => p.avatar).filter(Boolean);

  useEffect(() => { fetchProfiles(); }, []);

  const handleCreate = async () => {
    if (!formName.trim()) return;
    setLoading(true);
    try {
      await profileAPI.create({
        name: formName.trim(),
        avatar: formAvatar,
      });
      addToast('Profile created!', 'success');
      setCreateModal(false);
      setFormName('');
      setFormAvatar('avatar_1');
      fetchProfiles();
    } catch (err) {
      addToast(parseApiError(err), 'error');
    } finally { setLoading(false); }
  };

  const handleEdit = async () => {
    if (!formName.trim()) return;
    setLoading(true);
    try {
      await profileAPI.update(editModal.profile.id, {
        name: formName.trim(),
        avatar: formAvatar,
      });
      addToast('Profile updated!', 'success');
      setEditModal({ open: false, profile: null });
      setFormName('');
      fetchProfiles();
    } catch (err) {
      addToast(parseApiError(err), 'error');
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await profileAPI.delete(deleteModal.profile.id);
      addToast('Profile deleted', 'success');
      setDeleteModal({ open: false, profile: null });
      fetchProfiles();
    } catch (err) {
      addToast(parseApiError(err), 'error');
    } finally { setLoading(false); }
  };

  const handlePinAction = async () => {
    if (formPin.length !== 4) {
      addToast('PIN must be 4 digits', 'error');
      return;
    }
    setLoading(true);
    try {
      if (pinModal.action === 'set') {
        await profileAPI.setPin(pinModal.profile.id, formPin);
        addToast('PIN lock enabled', 'success');
      } else {
        await profileAPI.removePin(pinModal.profile.id, formPin);
        addToast('PIN lock removed', 'success');
      }
      setPinModal({ open: false, profile: null, action: '' });
      setFormPin('');
      fetchProfiles();
    } catch (err) {
      addToast(parseApiError(err), 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--c-bg)' }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 glass"
        style={{ borderBottom: '1px solid var(--c-border)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profiles')}
              aria-label="Back"
              className="p-2 rounded-lg transition-colors cursor-pointer focus-ring"
              style={{ color: 'var(--c-sub)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--c-text)';
                e.currentTarget.style.background = 'var(--c-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--c-sub)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <Brand to="/home" size="sm" />
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 page-enter">
        <div className="mb-10">
          <p
            className="text-xs font-bold tracking-[0.3em] uppercase mb-2"
            style={{ color: 'var(--c-accent)' }}
          >
            Profile Management
          </p>
          <h1
            className="text-3xl sm:text-4xl font-bold"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--c-text)',
            }}
          >
            Manage Profiles
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--c-sub)' }}>
            Up to 5 profiles per account. Each can have its own watchlist and PIN lock.
          </p>
        </div>

        <div className="grid gap-3">
          {profiles.map((profile, i) => (
            <div
              key={profile.id}
              className="flex items-center gap-4 p-4 rounded-2xl transition-all"
              style={{
                background: 'var(--c-card)',
                border: '1px solid var(--c-border)',
              }}
            >
              <ProfileAvatar
                name={profile.name}
                avatar={profile.avatar}
                index={i}
                size="md"
                rounded="lg"
              />

              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold truncate"
                  style={{ color: 'var(--c-text)', fontSize: 15 }}
                >
                  {profile.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {profile.is_locked ? (
                    <span
                      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: 'var(--c-accent-muted)',
                        color: 'var(--c-accent)',
                      }}
                    >
                      <Lock size={10} /> PIN locked
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--c-dim)' }}>
                      No PIN
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <IconButton
                  title={profile.is_locked ? 'Remove PIN' : 'Set PIN'}
                  onClick={() => {
                    setPinModal({
                      open: true,
                      profile,
                      action: profile.is_locked ? 'remove' : 'set',
                    });
                    setFormPin('');
                  }}
                >
                  {profile.is_locked ? <Lock size={16} /> : <Unlock size={16} />}
                </IconButton>
                <IconButton
                  title="Edit"
                  onClick={() => {
                    setEditModal({ open: true, profile });
                    setFormName(profile.name);
                    setFormAvatar(profile.avatar || 'avatar_1');
                  }}
                >
                  <Pencil size={16} />
                </IconButton>
                <IconButton
                  title="Delete"
                  onClick={() => setDeleteModal({ open: true, profile })}
                  danger
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>
          ))}

          {profiles.length < 5 && (
            <button
              onClick={() => { setCreateModal(true); setFormName(''); }}
              className="flex items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer focus-ring"
              style={{
                borderColor: 'var(--c-border-h)',
                color: 'var(--c-sub)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--c-accent)';
                e.currentTarget.style.color = 'var(--c-accent)';
                e.currentTarget.style.background = 'var(--c-accent-muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--c-border-h)';
                e.currentTarget.style.color = 'var(--c-sub)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Plus size={20} /> Add Profile
            </button>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Create Profile"
        subtitle="Give your new profile a name and pick an avatar."
      >
        <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
        placeholder="Profile name" maxLength={30} className="input-base mb-5" />
        <AvatarPicker
          selected={formAvatar}
          onChange={setFormAvatar}
          usedAvatars={usedAvatars}
          columns={5}
        />
        <div className="flex gap-3 justify-end mt-5">
          <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
          <Button loading={loading} onClick={handleCreate}>Create</Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, profile: null })}
        title="Edit Profile"
      >
        <input
          type="text"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          placeholder="Profile name"
          maxLength={30}
          className="input-base mb-5"
        />
        <AvatarPicker
          selected={formAvatar}
          onChange={setFormAvatar}
          usedAvatars={usedAvatars}
          columns={5}
        />
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={() => setEditModal({ open: false, profile: null })}
          >
            Cancel
          </Button>
          <Button loading={loading} onClick={handleEdit}>
            Save
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, profile: null })}
        title="Delete Profile"
        subtitle="This cannot be undone."
      >
        <p className="text-sm mb-6" style={{ color: 'var(--c-sub)' }}>
          Are you sure you want to delete{' '}
          <strong style={{ color: 'var(--c-text)' }}>
            {deleteModal.profile?.name}
          </strong>
          ? All watchlist and history data for this profile will be permanently
          removed.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ open: false, profile: null })}
          >
            Cancel
          </Button>
          <Button variant="danger" loading={loading} onClick={handleDelete}>
            Delete Profile
          </Button>
        </div>
      </Modal>

      {/* PIN Modal */}
      <Modal
        isOpen={pinModal.open}
        onClose={() => setPinModal({ open: false, profile: null, action: '' })}
        title={pinModal.action === 'set' ? 'Set PIN Lock' : 'Remove PIN Lock'}
        subtitle={
          pinModal.action === 'set'
            ? 'Enter a 4-digit PIN to protect this profile.'
            : 'Enter the current PIN to remove the lock.'
        }
      >
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={formPin}
          onChange={(e) => setFormPin(e.target.value.replace(/\D/g, ''))}
          className="input-base text-center mb-5"
          style={{
            letterSpacing: '0.8em',
            fontSize: 20,
            fontWeight: 700,
            paddingLeft: '1.2em',
          }}
          placeholder="••••"
        />
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={() =>
              setPinModal({ open: false, profile: null, action: '' })
            }
          >
            Cancel
          </Button>
          <Button loading={loading} onClick={handlePinAction}>
            {pinModal.action === 'set' ? 'Set PIN' : 'Remove PIN'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function IconButton({ children, onClick, title, danger = false }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className="p-2 rounded-lg transition-colors cursor-pointer focus-ring"
      style={{ color: danger ? 'var(--c-dim)' : 'var(--c-sub)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger
          ? 'rgba(239, 68, 68, 0.12)'
          : 'var(--c-hover)';
        e.currentTarget.style.color = danger ? 'var(--c-err)' : 'var(--c-text)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = danger ? 'var(--c-dim)' : 'var(--c-sub)';
      }}
    >
      {children}
    </button>
  );
}