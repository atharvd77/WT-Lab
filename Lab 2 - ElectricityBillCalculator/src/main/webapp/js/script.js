/* ================================================================
   script.js - Client-Side Behavior
   Project : Electricity Bill Calculator
   Purpose : jQuery-based validation for the electricity units form
             on index.jsp BEFORE it is submitted to BillServlet.
   Note    : This is a UX convenience only. The server (BillServlet)
             ALWAYS re-validates input independently, since client-side
             validation can be bypassed.
   ================================================================ */

$(document).ready(function () {

    // Cache frequently used jQuery selectors for performance
    const $form = $("#billForm");
    const $unitsInput = $("#units");
    const $errorBox = $("#clientErrorBox");
    const $errorText = $("#clientErrorText");
    const $resetBtn = $("#resetBtn");

    /**
     * Hides the client-side error alert box and clears invalid styling.
     */
    function clearError() {
        $errorBox.addClass("d-none");
        $errorText.text("");
        $unitsInput.removeClass("is-invalid-custom");
    }

    /**
     * Displays a validation error message above the form.
     * @param {string} message - The error text to show the user.
     */
    function showError(message) {
        $errorText.text(message);
        $errorBox.removeClass("d-none");
        $unitsInput.addClass("is-invalid-custom");
        // Smooth scroll the error into view (helpful on mobile)
        $("html, body").animate({ scrollTop: $errorBox.offset().top - 100 }, 300);
    }

    /**
     * Validates the "units" field.
     * Rules:
     *   - Must not be empty
     *   - Must be a valid number
     *   - Must be a whole number (no decimals)
     *   - Must be zero or a positive value
     *   - Must not be unreasonably large (sanity cap)
     * @returns {boolean} true if valid, false otherwise
     */
    function validateUnits() {
        const rawValue = $unitsInput.val().trim();

        if (rawValue === "") {
            showError("Please enter the number of electricity units consumed.");
            return false;
        }

        // Ensure it's strictly a number (jQuery/JS friendly numeric check)
        if (!$.isNumeric(rawValue)) {
            showError("Units must be a valid number (e.g. 150).");
            return false;
        }

        const numericValue = Number(rawValue);

        if (numericValue < 0) {
            showError("Units cannot be a negative number.");
            return false;
        }

        if (!Number.isInteger(numericValue)) {
            showError("Please enter a whole number of units (no decimals).");
            return false;
        }

        if (numericValue > 100000) {
            showError("That seems too high. Please enter a realistic unit value (max 100000).");
            return false;
        }

        clearError();
        return true;
    }

    // ---------------- Form Submit Handler ----------------
    $form.on("submit", function (event) {
        // Always validate before allowing the POST to BillServlet
        if (!validateUnits()) {
            event.preventDefault(); // Stop form submission on invalid input
        } else {
            // Disable the button briefly to prevent accidental double-submits
            $("#calculateBtn").prop("disabled", true)
                .html('<i class="bi bi-hourglass-split me-1"></i> Calculating...');
        }
    });

    // ---------------- Live Validation While Typing ----------------
    $unitsInput.on("input", function () {
        if (!$errorBox.hasClass("d-none")) {
            // Re-validate live once the user starts correcting the value
            validateUnits();
        }
    });

    // ---------------- Reset Button Handler ----------------
    $resetBtn.on("click", function () {
        clearError();
        // Re-enable the calculate button in case it was disabled by a prior submit
        $("#calculateBtn").prop("disabled", false)
            .html('<i class="bi bi-calculator-fill me-1"></i> Calculate');
    });

});
