package com.electricity.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * BillServlet
 * ------------------------------------------------------------------
 * Handles the electricity bill calculation request submitted from
 * index.jsp (POST to "/calculate").
 *
 * Slab-wise tariff logic:
 *   First 50 units        -> Rs. 3.50 / unit
 *   Next 100 units (51-150)-> Rs. 4.00 / unit
 *   Next 100 units (151-250)-> Rs. 5.20 / unit
 *   Above 250 units        -> Rs. 6.50 / unit
 *
 * The servlet validates the input server-side (in addition to the
 * jQuery client-side validation in script.js), performs the slab
 * calculation, builds a breakdown list, stores results as request
 * attributes, and forwards the request to result.jsp for display.
 * ------------------------------------------------------------------
 */
@WebServlet("/calculate")
public class BillServlet extends HttpServlet {

    // Tariff constants (in Rupees per unit) for each slab
    private static final double SLAB1_RATE = 3.50; // 0 - 50 units
    private static final double SLAB2_RATE = 4.00; // 51 - 150 units
    private static final double SLAB3_RATE = 5.20; // 151 - 250 units
    private static final double SLAB4_RATE = 6.50; // above 250 units

    // Slab boundaries (in units)
    private static final int SLAB1_LIMIT = 50;
    private static final int SLAB2_LIMIT = 150; // cumulative upper bound
    private static final int SLAB3_LIMIT = 250; // cumulative upper bound

    /**
     * Simple data holder representing one row of the calculation breakdown
     * table shown on result.jsp (e.g. "First 50 units x Rs.3.50 = Rs.175.00").
     */
    public static class SlabDetail {
        private final String slabName;
        private final int unitsInSlab;
        private final double rate;
        private final double slabAmount;

        public SlabDetail(String slabName, int unitsInSlab, double rate, double slabAmount) {
            this.slabName = slabName;
            this.unitsInSlab = unitsInSlab;
            this.rate = rate;
            this.slabAmount = slabAmount;
        }

        public String getSlabName() { return slabName; }
        public int getUnitsInSlab() { return unitsInSlab; }
        public double getRate() { return rate; }
        public double getSlabAmount() { return slabAmount; }
    }

    /**
     * Handles POST requests submitted from the index.jsp form.
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Ensure request body (form parameters) is read using UTF-8
        request.setCharacterEncoding("UTF-8");

        String unitsParam = request.getParameter("units");
        String customerName = request.getParameter("customerName");

        // ---------------- Server-side validation ----------------
        // Even though jQuery validates on the client, we NEVER trust
        // client-side-only validation. Always re-validate on the server.
        int units;
        try {
            if (unitsParam == null || unitsParam.trim().isEmpty()) {
                throw new NumberFormatException("Units field is empty");
            }
            units = Integer.parseInt(unitsParam.trim());

            if (units < 0) {
                throw new NumberFormatException("Units cannot be negative");
            }
        } catch (NumberFormatException ex) {
            // Invalid input -> send back to index.jsp with an error message
            request.setAttribute("errorMessage",
                    "Please enter a valid, non-negative number of units.");
            request.getRequestDispatcher("/index.jsp").forward(request, response);
            return;
        }

        if (customerName == null || customerName.trim().isEmpty()) {
            customerName = "Guest Customer";
        }

        // ---------------- Slab-wise Bill Calculation ----------------
        List<SlabDetail> breakdown = new ArrayList<>();
        double totalBill = 0.0;
        int remainingUnits = units;

        // Slab 1: First 50 units @ Rs. 3.50
        if (remainingUnits > 0) {
            int unitsInSlab = Math.min(remainingUnits, SLAB1_LIMIT);
            double amount = unitsInSlab * SLAB1_RATE;
            breakdown.add(new SlabDetail("First 50 units", unitsInSlab, SLAB1_RATE, amount));
            totalBill += amount;
            remainingUnits -= unitsInSlab;
        }

        // Slab 2: Next 100 units (51-150) @ Rs. 4.00
        if (remainingUnits > 0) {
            int slab2Capacity = SLAB2_LIMIT - SLAB1_LIMIT; // 100 units
            int unitsInSlab = Math.min(remainingUnits, slab2Capacity);
            double amount = unitsInSlab * SLAB2_RATE;
            breakdown.add(new SlabDetail("Next 100 units (51-150)", unitsInSlab, SLAB2_RATE, amount));
            totalBill += amount;
            remainingUnits -= unitsInSlab;
        }

        // Slab 3: Next 100 units (151-250) @ Rs. 5.20
        if (remainingUnits > 0) {
            int slab3Capacity = SLAB3_LIMIT - SLAB2_LIMIT; // 100 units
            int unitsInSlab = Math.min(remainingUnits, slab3Capacity);
            double amount = unitsInSlab * SLAB3_RATE;
            breakdown.add(new SlabDetail("Next 100 units (151-250)", unitsInSlab, SLAB3_RATE, amount));
            totalBill += amount;
            remainingUnits -= unitsInSlab;
        }

        // Slab 4: Above 250 units @ Rs. 6.50 (no upper cap)
        if (remainingUnits > 0) {
            int unitsInSlab = remainingUnits;
            double amount = unitsInSlab * SLAB4_RATE;
            breakdown.add(new SlabDetail("Above 250 units", unitsInSlab, SLAB4_RATE, amount));
            totalBill += amount;
            remainingUnits = 0;
        }

        // Round the total bill to 2 decimal places for currency display
        totalBill = Math.round(totalBill * 100.0) / 100.0;

        // ---------------- Store results as request attributes ----------------
        request.setAttribute("customerName", customerName);
        request.setAttribute("units", units);
        request.setAttribute("breakdown", breakdown);
        request.setAttribute("totalBill", totalBill);

        // ---------------- Forward to result.jsp ----------------
        // Forward (not redirect) so request attributes remain accessible.
        request.getRequestDispatcher("/result.jsp").forward(request, response);
    }

    /**
     * Handles direct GET requests to /calculate (e.g. if a user manually
     * navigates to the URL). Simply redirects back to the home page since
     * a bill calculation requires POSTed form data.
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.sendRedirect(request.getContextPath() + "/index.jsp");
    }
}
