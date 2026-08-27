package com.vit.sgpa.util;

import com.vit.sgpa.dto.ResultResponse;
import com.vit.sgpa.dto.SubjectRequest;
import com.vit.sgpa.dto.SubjectResult;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Grading utilities for the VIT SGPA Calculator.
 * Final Marks = 30% MSE + 70% ESE.
 * Grade bands (out of 100) -> Letter grade -> Grade point (10-point scale).
 */
@Component
public class GradeCalculator {

    public double computeFinalMarks(double mse, double ese) {
        double finalMarks = mse * 0.30 + ese * 0.70;
        return round(finalMarks, 2);
    }

    public String getGrade(double finalMarks) {
        if (finalMarks >= 91) return "A+";
        if (finalMarks >= 81) return "A";
        if (finalMarks >= 71) return "B+";
        if (finalMarks >= 61) return "B";
        if (finalMarks >= 51) return "C";
        if (finalMarks >= 41) return "D";
        return "F";
    }

    public int getGradePoint(String grade) {
        return switch (grade) {
            case "A+" -> 10;
            case "A" -> 9;
            case "B+" -> 8;
            case "B" -> 7;
            case "C" -> 6;
            case "D" -> 5;
            default -> 0; // F
        };
    }

    public ResultResponse calculateResult(List<SubjectRequest> subjects) {
        List<SubjectResult> processed = new ArrayList<>();

        double totalCreditPoints = 0;
        double totalCredits = 0;

        for (SubjectRequest s : subjects) {
            double finalMarks = computeFinalMarks(s.getMse(), s.getEse());
            String grade = getGrade(finalMarks);
            int gradePoint = getGradePoint(grade);

            totalCreditPoints += s.getCredits() * gradePoint;
            totalCredits += s.getCredits();

            processed.add(new SubjectResult(
                    s.getName(),
                    s.getCredits(),
                    s.getMse(),
                    s.getEse(),
                    finalMarks,
                    grade,
                    gradePoint
            ));
        }

        double sgpa = totalCredits > 0 ? round(totalCreditPoints / totalCredits, 2) : 0.0;

        return new ResultResponse(processed, sgpa, (int) totalCredits);
    }

    private double round(double value, int places) {
        return BigDecimal.valueOf(value)
                .setScale(places, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
