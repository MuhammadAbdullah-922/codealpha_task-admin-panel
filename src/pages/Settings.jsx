import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  updateAdminProfile,
  uploadAdminAvatar,
  changeAdminPassword,
} from '../services/api'; // adjust path to wherever api.js lives
import '../styles/Settings.css';

export default function Settings({ setSidebarOpen }) {
  const { user, setUser } = useAuth(); // setUser: optional — updates context after save
  const fileInputRef = useRef(null);

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [savingAvatar, setSavingAvatar] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    setProfile({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setAvatarPreview(user?.avatar_url || null);
  }, [user]);

  const initials = (profile.name || 'Admin')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // ---------- Avatar ----------
  const handlePickAvatar = () => fileInputRef.current?.click();

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image must be under 3MB');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarSave = async () => {
    if (!avatarFile) return;
    setSavingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const res = await uploadAdminAvatar(formData);
      const newUrl = res?.data?.avatar_url;
      if (newUrl) {
        setAvatarPreview(newUrl);
        setUser?.((u) => ({ ...u, avatar_url: newUrl }));
      }
      setAvatarFile(null);
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not upload picture');
    } finally {
      setSavingAvatar(false);
    }
  };

  // ---------- Profile details ----------
  const handleProfileChange = (e) =>
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateAdminProfile(profile);
      setUser?.((u) => ({ ...u, ...profile }));
      toast.success('Profile details saved');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // ---------- Password ----------
  const handlePwdChange = (e) => setPwd((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePwdSave = async (e) => {
    e.preventDefault();
    if (pwd.next.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (pwd.next !== pwd.confirm) {
      toast.error('New password and confirmation do not match');
      return;
    }
    setSavingPwd(true);
    try {
      await changeAdminPassword({
        current_password: pwd.current,
        password: pwd.next,
        password_confirmation: pwd.confirm,
      });
      setPwd({ current: '', next: '', confirm: '' });
      toast.success('Password changed');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not change password');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-page__header">
        <h1>Settings</h1>
        <p>Manage your admin profile, photo, and password.</p>
      </div>

      {/* Profile photo */}
      <section className="settings-card">
        <div className="settings-card__title">Profile photo</div>
        <div className="settings-avatar-row">
          <div className="settings-avatar">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Admin avatar" />
            ) : (
              <span className="settings-avatar__initials">{initials}</span>
            )}
          </div>
          <div className="settings-avatar-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
            <button type="button" className="btn-outline" onClick={handlePickAvatar}>
              Choose photo
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!avatarFile || savingAvatar}
              onClick={handleAvatarSave}
            >
              {savingAvatar ? 'Uploading…' : 'Save photo'}
            </button>
            <p className="settings-hint">JPG or PNG, up to 3MB.</p>
          </div>
        </div>
      </section>

      {/* Profile details */}
      <section className="settings-card">
        <div className="settings-card__title">Profile details</div>
        <form onSubmit={handleProfileSave} className="settings-form">
          <div className="settings-field">
            <label>Full name</label>
            <input
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              placeholder="Your name"
              required
            />
          </div>
          <div className="settings-field">
            <label>Email address</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="settings-field">
            <label>Phone (optional)</label>
            <input
              name="phone"
              value={profile.phone}
              onChange={handleProfileChange}
              placeholder="03xx xxxxxxx"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={savingProfile}>
            {savingProfile ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </section>

      {/* Password */}
      <section className="settings-card">
        <div className="settings-card__title">Change password</div>
        <form onSubmit={handlePwdSave} className="settings-form">
          <div className="settings-field">
            <label>Current password</label>
            <input
              type="password"
              name="current"
              value={pwd.current}
              onChange={handlePwdChange}
              required
            />
          </div>
          <div className="settings-field">
            <label>New password</label>
            <input
              type="password"
              name="next"
              value={pwd.next}
              onChange={handlePwdChange}
              required
            />
          </div>
          <div className="settings-field">
            <label>Confirm new password</label>
            <input
              type="password"
              name="confirm"
              value={pwd.confirm}
              onChange={handlePwdChange}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={savingPwd}>
            {savingPwd ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </section>
    </div>
  );
}