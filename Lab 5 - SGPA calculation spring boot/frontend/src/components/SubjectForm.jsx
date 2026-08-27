import React from 'react';

export default function SubjectForm({ subjects, onChange, onAdd, onRemove }) {
  const handleFieldChange = (index, field, value) => {
    const updated = subjects.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    onChange(updated);
  };

  return (
    <div className="subject-form">
      <div className="subject-form-header">
        <h2>Subjects & Marks</h2>
        <button type="button" className="btn btn-secondary" onClick={onAdd}>
          + Add Subject
        </button>
      </div>

      <div className="subject-grid subject-grid-header">
        <span>Subject</span>
        <span>Credits</span>
        <span>MSE (out of 100)</span>
        <span>ESE (out of 100)</span>
        <span></span>
      </div>

      {subjects.map((subject, index) => (
        <div className="subject-grid" key={subject.id}>
          <input
            type="text"
            value={subject.name}
            placeholder="Subject name"
            onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
            disabled={subject.locked}
          />
          <input
            type="number"
            min="0.5"
            max="20"
            step="0.5"
            value={subject.credits}
            onChange={(e) => handleFieldChange(index, 'credits', e.target.value)}
          />
          <input
            type="number"
            min="0"
            max="100"
            value={subject.mse}
            onChange={(e) => handleFieldChange(index, 'mse', e.target.value)}
          />
          <input
            type="number"
            min="0"
            max="100"
            value={subject.ese}
            onChange={(e) => handleFieldChange(index, 'ese', e.target.value)}
          />
          <button
            type="button"
            className="btn btn-remove"
            onClick={() => onRemove(index)}
            disabled={subjects.length <= 1}
            title={subjects.length <= 1 ? 'At least one subject is required' : 'Remove subject'}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
