/**
 * Grade & SGPA calculation utilities for the VIT-style grading scheme.
 *
 * Final Marks = 30% of MSE (out of 50) + 70% of ESE (out of 100)
 *   -> Note: We treat whatever MSE/ESE values are submitted as being
 *      already normalized to "out of 100" equivalents by the caller,
 *      OR raw marks that are scaled here. To keep things simple and
 *      transparent for students, this app expects:
 *          MSE marks out of 50
 *          ESE marks out of 100
 *      Final Marks (out of 100) = (MSE/50 * 30) + (ESE/100 * 70)
 */

const GRADE_TABLE = [
  { min: 91, max: 100, grade: 'A+', point: 10 },
  { min: 81, max: 90, grade: 'A', point: 9 },
  { min: 71, max: 80, grade: 'B+', point: 8 },
  { min: 61, max: 70, grade: 'B', point: 7 },
  { min: 51, max: 60, grade: 'C', point: 6 },
  { min: 41, max: 50, grade: 'D', point: 5 },
  { min: 0, max: 40, grade: 'F', point: 0 }
];

function computeFinalMarks(mse, ese) {
  const mseComponent = (Number(mse) / 50) * 30;
  const eseComponent = (Number(ese) / 100) * 70;
  const final = mseComponent + eseComponent;
  return Math.round(final * 100) / 100; // round to 2 decimals
}

function computeGrade(finalMarks) {
  const rounded = Math.round(finalMarks);
  const entry = GRADE_TABLE.find((g) => rounded >= g.min && rounded <= g.max) ||
    GRADE_TABLE[GRADE_TABLE.length - 1];
  return { grade: entry.grade, gradePoint: entry.point };
}

/**
 * subjects: [{ name, credits, mse, ese }]
 * returns: { subjects: [...enriched], sgpa, totalCredits, totalGradePoints }
 */
function calculateSGPA(subjects) {
  let totalCredits = 0;
  let totalGradePoints = 0;

  const enriched = subjects.map((s) => {
    const credits = Number(s.credits);
    const mse = Number(s.mse);
    const ese = Number(s.ese);
    const finalMarks = computeFinalMarks(mse, ese);
    const { grade, gradePoint } = computeGrade(finalMarks);

    totalCredits += credits;
    totalGradePoints += credits * gradePoint;

    return {
      name: s.name,
      credits,
      mse,
      ese,
      finalMarks,
      grade,
      gradePoint
    };
  });

  const sgpa = totalCredits > 0
    ? Math.round((totalGradePoints / totalCredits) * 100) / 100
    : 0;

  return { subjects: enriched, sgpa, totalCredits, totalGradePoints };
}

module.exports = { computeFinalMarks, computeGrade, calculateSGPA, GRADE_TABLE };
