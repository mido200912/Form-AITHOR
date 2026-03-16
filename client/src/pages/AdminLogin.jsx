import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import aithorLogo from '../assets/aithor-logo.png';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminLogin() {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/admin/login`, creds);
      localStorage.setItem('aithor_admin_token', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'اسم المستخدم أو كلمة المرور غلط');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <img src={aithorLogo} alt="Aithor" className="login-logo" />
          <h1 className="login-title">لوحة الإدارة</h1>
          <p className="login-subtitle">Admin Access Only</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">اسم المستخدم</label>
            <input
              id="admin-username"
              className="form-input"
              placeholder="admin"
              value={creds.username}
              onChange={e => setCreds({ ...creds, username: e.target.value })}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">كلمة المرور</label>
            <input
              id="admin-password"
              className="form-input"
              type="password"
              placeholder="••••••••••"
              value={creds.password}
              onChange={e => setCreds({ ...creds, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-alert">
              ⚠️ {error}
            </div>
          )}

          <button
            id="admin-login-btn"
            type="submit"
            className="submit-btn"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading
              ? <><span className="loading-spinner" /> جاري الدخول...</>
              : <>دخول ←</>
            }
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <a href="/" style={{ fontSize: '13px', color: 'var(--gray-400)', textDecoration: 'none', fontWeight: 500 }}>
            ← العودة للفورم
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
