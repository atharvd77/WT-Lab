const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const authenticate = require('../middleware/auth');
const { calculateSGPA } = require('../utils/grade');
const { generateResultPDF } = require('../utils/pdf');

const router = express.Router();

const subjectValidators = [
  body('subjects').isArray({ min: 1 }).withMessage('At least one subject is required.'),
  body('subjects.*.name').trim().notEmpty().withMessage('Every subject needs a name.'),
  body('subjects.*.credits')
    .isFloat({ min: 1, max: 10 })
    .withMessage('Credits must be a number between 1 and 10.'),
  body('subjects.*.mse')
    .isFloat({ min: 0, max: 50 })
    .withMessage('MSE marks must be between 0 and 50.'),
  body('subjects.*.ese')
    .isFloat({ min: 0, max: 100 })
    .withMessage('ESE marks must be between 0 and 100.')
];

// -------------------- CALCULATE (no DB save) --------------------
router.post('/calculate', authenticate, subjectValidators, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  const { subjects } = req.body;
  const result = calculateSGPA(subjects);
  return res.json(result);
});

// -------------------- SAVE RESULT --------------------
router.post('/save', authenticate, subjectValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  const { subjects, semesterLabel } = req.body;
  const { subjects: enriched, sgpa, totalCredits } = calculateSGPA(subjects);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [resultRow] = await connection.query(
      'INSERT INTO results (user_id, semester_label, sgpa, total_credits) VALUES (?, ?, ?, ?)',
      [req.user.id, semesterLabel || 'Semester', sgpa, totalCredits]
    );
    const resultId = resultRow.insertId;

    for (const s of enriched) {
      await connection.query(
        `INSERT INTO result_subjects
          (result_id, subject_name, credits, mse, ese, final_marks, grade, grade_point)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [resultId, s.name, s.credits, s.mse, s.ese, s.finalMarks, s.grade, s.gradePoint]
      );
    }

    await connection.commit();
    return res.status(201).json({
      message: 'Result saved successfully.',
      resultId,
      subjects: enriched,
      sgpa,
      totalCredits
    });
  } catch (err) {
    await connection.rollback();
    console.error('Save result error:', err);
    return res.status(500).json({ message: 'Server error while saving result.' });
  } finally {
    connection.release();
  }
});

// -------------------- HISTORY --------------------
router.get('/history', authenticate, async (req, res) => {
  try {
    const [results] = await pool.query(
      'SELECT id, semester_label, sgpa, total_credits, created_at FROM results WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json({ results });
  } catch (err) {
    console.error('History error:', err);
    return res.status(500).json({ message: 'Server error while fetching history.' });
  }
});

// -------------------- GET ONE SAVED RESULT --------------------
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [[resultRow]] = await pool.query(
      'SELECT * FROM results WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!resultRow) return res.status(404).json({ message: 'Result not found.' });

    const [subjects] = await pool.query(
      'SELECT subject_name AS name, credits, mse, ese, final_marks AS finalMarks, grade, grade_point AS gradePoint FROM result_subjects WHERE result_id = ?',
      [req.params.id]
    );

    return res.json({ result: resultRow, subjects });
  } catch (err) {
    console.error('Get result error:', err);
    return res.status(500).json({ message: 'Server error while fetching result.' });
  }
});

// -------------------- DOWNLOAD PDF (from live payload, not saved) --------------------
router.post('/pdf', authenticate, subjectValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const [[user]] = await pool.query(
      'SELECT name, reg_number, email FROM users WHERE id = ?',
      [req.user.id]
    );

    const { subjects, semesterLabel } = req.body;
    const { subjects: enriched, sgpa, totalCredits } = calculateSGPA(subjects);

    generateResultPDF(res, {
      student: { name: user.name, regNumber: user.reg_number, email: user.email },
      subjects: enriched,
      sgpa,
      totalCredits,
      semesterLabel
    });
  } catch (err) {
    console.error('PDF generation error:', err);
    return res.status(500).json({ message: 'Server error while generating PDF.' });
  }
});

module.exports = router;
