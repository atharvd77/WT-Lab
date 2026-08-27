import React from 'react';

const gradeColors = {
  'A+': '#1b5e20',
  A: '#2e7d32',
  'B+': '#558b2f',
  B: '#f9a825',
  C: '#ef6c00',
  D: '#d84315',
  F: '#c62828'
};

export default function ResultTable({ result, onDownloadPdf, downloading }) {
  if (!result) return null;

  const { subjects, sgpa, totalCredits } = result;

  return (
    <div className="result-section">
      <div className="result-header">
        <h2>Your Result</h2>
        <button className="btn btn-primary" onClick={onDownloadPdf} disabled={downloading}>
          {downloading ? 'Generating PDF...' : '⬇ Download as PDF'}
        </button>
      </div>

      <div className="table-wrapper">
        <table className="result-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>MSE</th>
              <th>ESE</th>
              <th>Final Marks</th>
              <th>Grade</th>
              <th>Grade Point</th>
              <th>Credits</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s, idx) => (
              <tr key={idx}>
                <td data-label="Subject">{s.name}</td>
                <td data-label="MSE">{s.mse}</td>
                <td data-label="ESE">{s.ese}</td>
                <td data-label="Final Marks">{s.finalMarks}</td>
                <td data-label="Grade">
                  <span className="grade-pill" style={{ backgroundColor: gradeColors[s.grade] || '#555' }}>
                    {s.grade}
                  </span>
                </td>
                <td data-label="Grade Point">{s.gradePoint}</td>
                <td data-label="Credits">{s.credits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sgpa-summary">
        <div className="sgpa-box">
          <span className="sgpa-label">Total Credits</span>
          <span className="sgpa-value">{totalCredits}</span>
        </div>
        <div className="sgpa-box sgpa-highlight">
          <span className="sgpa-label">SGPA</span>
          <span className="sgpa-value">{sgpa}</span>
        </div>
      </div>
    </div>
  );
}
