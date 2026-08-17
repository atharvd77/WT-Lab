import React, { useState } from 'react';

const GRADE_COLORS = {
  'A+': '#1E7A46',
  A: '#2C8F53',
  'B+': '#4E8F2C',
  B: '#C9A227',
  C: '#C97B27',
  D: '#D9642A',
  F: '#B3261E'
};

export default function SubjectTable({ subjects, computed, onChange, onRemove, onAddSubject, defaultSubjectNames }) {
  const [newSubject, setNewSubject] = useState({ name: '', credits: 3 });

  const computedMap = {};
  if (computed) {
    computed.forEach((c) => {
      computedMap[c.name] = c;
    });
  }

  const handleAdd = () => {
    if (!newSubject.name.trim()) return;
    onAddSubject({
      id: `custom-${Date.now()}`,
      name: newSubject.name.trim(),
      credits: Number(newSubject.credits) || 1,
      mse: '',
      ese: '',
      isDefault: false
    });
    setNewSubject({ name: '', credits: 3 });
  };

  return (
    <div>
      <div className="subject-table-wrap">
        <table className="subject-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Credits</th>
              <th>MSE (/50)</th>
              <th>ESE (/100)</th>
              <th>Final Marks</th>
              <th>Grade</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => {
              const c = computedMap[s.name];
              return (
                <tr key={s.id}>
                  <td>
                    {s.isDefault ? (
                      <span className="subject-name-fixed">{s.name}</span>
                    ) : (
                      <input
                        type="text"
                        value={s.name}
                        onChange={(e) => onChange(s.id, 'name', e.target.value)}
                        placeholder="Subject name"
                      />
                    )}
                  </td>
                  <td>
                    {s.isDefault ? (
                      <span className="credit-badge">{s.credits} cr</span>
                    ) : (
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={s.credits}
                        onChange={(e) => onChange(s.id, 'credits', e.target.value)}
                      />
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      placeholder="0-50"
                      value={s.mse}
                      onChange={(e) => onChange(s.id, 'mse', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      value={s.ese}
                      onChange={(e) => onChange(s.id, 'ese', e.target.value)}
                    />
                  </td>
                  <td>{c ? c.finalMarks : '—'}</td>
                  <td>
                    {c ? (
                      <span
                        className="grade-pill"
                        style={{ background: GRADE_COLORS[c.grade] || '#999' }}
                      >
                        {c.grade}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {!s.isDefault && (
                      <button
                        className="remove-btn"
                        title="Remove subject"
                        onClick={() => onRemove(s.id)}
                        type="button"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="table-actions-row">
        <div className="add-subject-form">
          <div className="field small">
            <label>New subject</label>
            <input
              type="text"
              placeholder="e.g. AI"
              value={newSubject.name}
              onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
            />
          </div>
          <div className="field small">
            <label>Credits</label>
            <input
              type="number"
              min="1"
              max="10"
              value={newSubject.credits}
              onChange={(e) => setNewSubject({ ...newSubject, credits: e.target.value })}
            />
          </div>
          <button className="btn btn-ghost btn-sm" type="button" onClick={handleAdd}>
            + Add Subject
          </button>
        </div>
      </div>
    </div>
  );
}
