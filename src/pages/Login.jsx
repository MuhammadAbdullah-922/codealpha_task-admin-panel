import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('admin@bzack.com');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast.success('Welcome back, Admin!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="bz-login-wrap">
      <div className="bz-login-circle" style={{ width: 500, height: 500, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
      <div className="bz-login-circle" style={{ width: 340, height: 340, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />

      <div className="bz-login-card">
        <div className="bz-login-logo">B</div>
        <h4 className="text-center fw-bold mb-1">Bzack Admin</h4>
        <p className="text-center text-muted mb-4" style={{ fontSize: 13 }}>
          Sign in to manage your store
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="bz-label">Email Address</label>
            <div className="position-relative">
              <FaEnvelope className="position-absolute" style={{ left: 14, top: 13, color: '#ABABAB', fontSize: 13 }} />
              <input
                type="email"
                className="bz-input"
                style={{ paddingLeft: 38 }}
                placeholder="admin@bzack.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="bz-label">Password</label>
            <div className="position-relative">
              <FaLock className="position-absolute" style={{ left: 14, top: 13, color: '#ABABAB', fontSize: 13 }} />
              <input
                type={showPw ? 'text' : 'password'}
                className="bz-input"
                style={{ paddingLeft: 38, paddingRight: 50 }}
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="position-absolute border-0 bg-transparent"
                style={{ right: 12, top: 9, fontSize: 11, color: '#6B6B6B', fontWeight: 600 }}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="bz-btn bz-btn-gold w-100 justify-content-center" style={{ padding: 12 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <p className="text-center mt-4 mb-0" style={{ fontSize: 11.5, color: '#ABABAB' }}>
          Bzack Admin Panel &copy; 2026 — Authorized access only
        </p>
      </div>
    </div>
  );
}
