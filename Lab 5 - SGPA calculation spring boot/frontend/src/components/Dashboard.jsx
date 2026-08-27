import React, { useState } from 'react';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import SubjectForm from './SubjectForm.jsx';
import ResultTable from './ResultTable.jsx';

let idCounter = 0;
const nextId = () => `subj-${idCounter++}`;

const defaultSubjects = () => [
  { id: nextId(), name: 'OOP (Object Oriented Programming)', credits: 4, mse: '', ese: '' },
  { id: nextId(), name: 'DBMS (Database Management System)', credits: 4, mse: '', ese: '' },
  { id: nextId(), name: 'CN (Computer Networks)', credits: 4, mse: '', ese: '' },
  { id: nextId(), name: 'OS (Operating System)', credits: 4, mse: '', ese: '' }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [semesterLabel, setSemesterLabel] = useState('Semester');
  const [subjects, setSubjects] = useState(defaultSubjects());
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleAddSubject = () => {
    setSubjects([...subjects, { id: nextId(), name: '', credits: 3, mse: '', ese: '' }]);
  };

  const handleRemoveSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const validateSubjects = () => {
    for (const s of subjects) {
      if (!s.name.trim()) return 'Every subject needs a name.';
      if (s.credits === '' || Number(s.credits) <= 0) return 'Every subject needs valid credits.';
      if (s.mse === '' || Number(s.mse) < 0 || Number(s.mse) > 100) return 'MSE marks must be between 0 and 100.';
      if (s.ese === '' || Number(s.ese) < 0 || Number(s.ese) > 100) return 'ESE marks must be between 0 and 100.';
    }
    return '';
  };

  const buildPayload = () => ({
    semesterLabel,
    subjects: subjects.map((s) => ({
      name: s.name,
      credits: Number(s.credits),
      mse: Number(s.mse),
      ese: Number(s.ese)
    }))
  });

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validationError = validateSubjects();
    if (validationError) {
      setError(validationError);
      return;
    }

    setCalculating(true);
    try {
      const res = await api.post('/results/calculate', buildPayload());
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to calculate result.');
    } finally {
      setCalculating(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await api.post('/results/save', buildPayload());
      setSuccess('Result saved to your account.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save result.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    setError('');
    setDownloading(true);
    try {
      const res = await api.post('/results/pdf', buildPayload(), { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `VIT_Result_${semesterLabel.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Semester Result Calculator</h1>
        <p>
          Welcome, <strong>{user?.name}</strong>. Enter your MSE and ESE marks below to compute your final marks,
          grades, and SGPA.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleCalculate} className="dashboard-form">
        <label className="semester-label">
          Semester label
          <input
            type="text"
            value={semesterLabel}
            onChange={(e) => setSemesterLabel(e.target.value)}
            placeholder="e.g. Semester 3, Fall 2026"
          />
        </label>

        <SubjectForm
          subjects={subjects}
          onChange={setSubjects}
          onAdd={handleAddSubject}
          onRemove={handleRemoveSubject}
        />

        <div className="dashboard-actions">
          <button type="submit" className="btn btn-primary" disabled={calculating}>
            {calculating ? 'Calculating...' : 'Calculate SGPA'}
          </button>
          {result && (
            <button type="button" className="btn btn-secondary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Result'}
            </button>
          )}
        </div>
      </form>

      {result && <ResultTable result={result} onDownloadPdf={handleDownloadPdf} downloading={downloading} />}
    </div>
  );
}
