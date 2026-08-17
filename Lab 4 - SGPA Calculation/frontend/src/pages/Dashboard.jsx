import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import SubjectTable from '../components/SubjectTable';

const DEFAULT_SUBJECTS = [
  { id: 'oop', name: 'OOP', credits: 4, mse: '', ese: '', isDefault: true },
  { id: 'dbms', name: 'DBMS', credits: 4, mse: '', ese: '', isDefault: true },
  { id: 'cn', name: 'CN', credits: 4, mse: '', ese: '', isDefault: true },
  { id: 'os', name: 'OS', credits: 4, mse: '', ese: '', isDefault: true }
];

export default function Dashboard() {
  const [semesterLabel, setSemesterLabel] = useState('Semester 1');
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [computed, setComputed] = useState(null);
  const [sgpa, setSgpa] = useState(null);
  const [totalCredits, setTotalCredits] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/results/history');
      setHistory(data.results || []);
    } catch (err) {
      // silent - history is a nice-to-have
    }
  };

  const handleChange = (id, field, value) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleRemove = (id) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddSubject = (subject) => {
    setSubjects((prev) => [...prev, subject]);
  };

  const buildPayload = () => ({
    semesterLabel,
    subjects: subjects.map((s) => ({
      name: s.name,
      credits: Number(s.credits),
      mse: Number(s.mse) || 0,
      ese: Number(s.ese) || 0
    }))
  });

  const validateBeforeSubmit = () => {
    if (subjects.length === 0) return 'Add at least one subject.';
    for (const s of subjects) {
      if (!s.name || s.name.trim() === '') return 'Every subject needs a name.';
      if (s.mse === '' || s.ese === '') return `Please enter MSE and ESE marks for ${s.name}.`;
      if (Number(s.mse) < 0 || Number(s.mse) > 50) return `${s.name}: MSE marks must be between 0 and 50.`;
      if (Number(s.ese) < 0 || Number(s.ese) > 100) return `${s.name}: ESE marks must be between 0 and 100.`;
      if (Number(s.credits) < 1 || Number(s.credits) > 10) return `${s.name}: Credits must be between 1 and 10.`;
    }
    return '';
  };

  const handleCalculate = async () => {
    setError('');
    setSuccess('');
    const validationError = validateBeforeSubmit();
    if (validationError) {
      setError(validationError);
      return;
    }
    setCalculating(true);
    try {
      const { data } = await api.post('/results/calculate', buildPayload());
      setComputed(data.subjects);
      setSgpa(data.sgpa);
      setTotalCredits(data.totalCredits);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not calculate SGPA. Please check your inputs.');
    } finally {
      setCalculating(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    const validationError = validateBeforeSubmit();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/results/save', buildPayload());
      setComputed(data.subjects);
      setSgpa(data.sgpa);
      setTotalCredits(data.totalCredits);
      setSuccess('Result saved to your account.');
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save result.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    setError('');
    const validationError = validateBeforeSubmit();
    if (validationError) {
      setError(validationError);
      return;
    }
    setDownloading(true);
    try {
      const response = await api.post('/results/pdf', buildPayload(), {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `VIT_Result_${semesterLabel.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Could not generate PDF. Try calculating your result first.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-eyebrow">Result Calculator</div>
        <h1 className="page-title">Compute your Semester SGPA</h1>
        <p className="page-sub">
          Enter MSE (out of 50) and ESE (out of 100) marks for each subject. Final marks are
          weighted 30% MSE + 70% ESE. Add extra subjects as needed — they'll be included in your
          SGPA automatically.
        </p>
      </div>

      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}

      <div className="card">
        <h2 className="card-title">Subjects & Marks</h2>
        <p className="card-sub">
          Semester label:{' '}
          <input
            type="text"
            value={semesterLabel}
            onChange={(e) => setSemesterLabel(e.target.value)}
            style={{
              border: '1.4px solid #F3EDE3',
              borderRadius: 7,
              padding: '4px 8px',
              fontSize: '0.85rem',
              width: 160
            }}
          />
        </p>

        <SubjectTable
          subjects={subjects}
          computed={computed}
          onChange={handleChange}
          onRemove={handleRemove}
          onAddSubject={handleAddSubject}
        />

        <div className="table-actions-row">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleCalculate} disabled={calculating}>
              {calculating ? <span className="spinner" /> : 'Calculate SGPA'}
            </button>
            <button className="btn btn-ghost" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" /> : 'Save Result'}
            </button>
            <button className="btn btn-gold" onClick={handleDownloadPdf} disabled={downloading}>
              {downloading ? <span className="spinner" /> : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>

      {sgpa !== null && (
        <div className="sgpa-banner">
          <div>
            <div className="sgpa-label">Your SGPA</div>
            <div className="sgpa-value">{sgpa}</div>
          </div>
          <div className="sgpa-meta">
            <div className="sgpa-meta-item">
              <div className="sgpa-meta-value">{totalCredits}</div>
              <div className="sgpa-meta-label">Total Credits</div>
            </div>
            <div className="sgpa-meta-item">
              <div className="sgpa-meta-value">{computed?.length || 0}</div>
              <div className="sgpa-meta-label">Subjects</div>
            </div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h2 className="card-title">Saved Results</h2>
          <p className="card-sub">Your previously saved semester results.</p>
          {history.map((h) => (
            <div className="history-item" key={h.id}>
              <div>
                <strong>{h.semester_label}</strong>
                <div className="history-meta">
                  {new Date(h.created_at).toLocaleDateString()} · {h.total_credits} credits
                </div>
              </div>
              <span className="credit-badge">SGPA {h.sgpa}</span>
            </div>
          ))}
        </div>
      )}

      <div className="footer-note">
        Grading scale: 91–100 A+ · 81–90 A · 71–80 B+ · 61–70 B · 51–60 C · 41–50 D · ≤40 F
      </div>
    </div>
  );
}
