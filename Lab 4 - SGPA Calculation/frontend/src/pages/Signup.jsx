import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: '', regNumber: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your name.';
    if (!emailRegex.test(form.email)) return 'Please enter a valid email address.';
    if (!strongPasswordRegex.test(form.password)) {
      return 'Password must be 8+ characters with uppercase, lowercase, a number, and a special character.';
    }
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', {
        name: form.name,
        regNumber: form.regNumber,
        email: form.email,
        password: form.password
      });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-eyebrow">Create account</div>
        <h1 className="auth-title">Join VIT SGPA Calculator</h1>
        <p className="auth-sub">Sign up to calculate, save, and download your semester results.</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full Name</label>
            <input type="text" value={form.name} onChange={update('name')} placeholder="Jane Doe" />
          </div>
          <div className="field">
            <label>Registration Number (optional)</label>
            <input
              type="text"
              value={form.regNumber}
              onChange={update('regNumber')}
              placeholder="21BCE0000"
            />
          </div>
          <div className="field">
            <label>Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="jane.doe@vitstudent.ac.in"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              placeholder="••••••••"
            />
            <div className="field-hint">
              8+ characters, with uppercase, lowercase, a number & a special character.
            </div>
          </div>
          <div className="field">
            <label>Confirm Password</label>
            <input
              type="password"
              value={form.confirm}
              onChange={update('confirm')}
              placeholder="••••••••"
            />
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
