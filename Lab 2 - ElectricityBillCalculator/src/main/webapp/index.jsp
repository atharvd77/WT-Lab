<%--
    ================================================================
    index.jsp - Home Page
    Project : Electricity Bill Calculator
    Purpose : Collects customer name + electricity units and submits
              them (POST) to BillServlet ("/calculate") for processing.
    Uses    : JSP EL (for error message display), Bootstrap 5,
              Bootstrap Icons, jQuery (client-side validation).
    ================================================================
--%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8" isELIgnored="false" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Electricity Bill Calculator</title>

    <!-- Bootstrap 5 CSS (CDN) -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons (CDN) -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
    <!-- Custom stylesheet -->
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css">
</head>
<body class="d-flex flex-column min-vh-100">

    <!-- ============ Header ============ -->
    <header class="bg-primary text-white py-3 shadow-sm">
        <div class="container d-flex align-items-center">
            <i class="bi bi-lightning-charge-fill fs-2 me-2"></i>
            <div>
                <h1 class="h4 mb-0">Electricity Bill Calculator</h1>
                <small class="opacity-75">Fast &amp; accurate slab-wise billing</small>
            </div>
        </div>
    </header>

    <!-- ============ Main Content ============ -->
    <main class="flex-grow-1">
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-12 col-md-8 col-lg-6">

                    <!-- Responsive Bootstrap Card -->
                    <div class="card shadow border-0 rounded-4">
                        <div class="card-header bg-white border-0 rounded-top-4 pt-4">
                            <h2 class="h5 text-center text-primary mb-0">
                                <i class="bi bi-calculator me-1"></i> Calculate Your Bill
                            </h2>
                        </div>

                        <div class="card-body p-4">

                            <%-- Server-side validation error message (EL), shown only if BillServlet
                                 forwarded back here due to invalid input --%>
                            <% if (request.getAttribute("errorMessage") != null) { %>
                                <div class="alert alert-danger d-flex align-items-center" role="alert">
                                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                                    <div>${errorMessage}</div>
                                </div>
                            <% } %>

                            <!-- Client-side validation feedback placeholder (jQuery fills this in) -->
                            <div id="clientErrorBox" class="alert alert-danger d-none" role="alert">
                                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                                <span id="clientErrorText"></span>
                            </div>

                            <!-- Bill Calculation Form -->
                            <form id="billForm" action="${pageContext.request.contextPath}/calculate" method="post" novalidate>

                                <!-- Customer Name -->
                                <div class="mb-3">
                                    <label for="customerName" class="form-label fw-semibold">
                                        <i class="bi bi-person-fill me-1"></i>Customer Name
                                    </label>
                                    <input type="text" class="form-control form-control-lg" id="customerName"
                                           name="customerName" placeholder="Enter your name (optional)" maxlength="60">
                                </div>

                                <!-- Units Consumed -->
                                <div class="mb-3">
                                    <label for="units" class="form-label fw-semibold">
                                        <i class="bi bi-speedometer2 me-1"></i>Electricity Units Consumed
                                    </label>
                                    <input type="number" class="form-control form-control-lg" id="units"
                                           name="units" placeholder="e.g. 180" min="0" step="1" required>
                                    <div class="form-text">Enter the number of units (kWh) from your meter reading.</div>
                                </div>

                                <!-- Tariff Reference Table (informational) -->
                                <div class="table-responsive mb-4">
                                    <table class="table table-sm table-bordered align-middle mb-0">
                                        <thead class="table-light">
                                            <tr>
                                                <th><i class="bi bi-list-ol me-1"></i>Slab</th>
                                                <th>Rate / Unit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr><td>First 50 units</td><td>Rs. 3.50</td></tr>
                                            <tr><td>Next 100 units (51-150)</td><td>Rs. 4.00</td></tr>
                                            <tr><td>Next 100 units (151-250)</td><td>Rs. 5.20</td></tr>
                                            <tr><td>Above 250 units</td><td>Rs. 6.50</td></tr>
                                        </tbody>
                                    </table>
                                </div>

                                <!-- Action Buttons -->
                                <div class="d-flex flex-column flex-sm-row gap-2">
                                    <button type="submit" id="calculateBtn" class="btn btn-primary btn-lg flex-fill">
                                        <i class="bi bi-calculator-fill me-1"></i> Calculate
                                    </button>
                                    <button type="reset" id="resetBtn" class="btn btn-outline-secondary btn-lg flex-fill">
                                        <i class="bi bi-arrow-counterclockwise me-1"></i> Reset
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>

                    <p class="text-center text-muted mt-3 small">
                        <i class="bi bi-info-circle me-1"></i>
                        All fields are validated before submission.
                    </p>
                </div>
            </div>
        </div>
    </main>

    <!-- ============ Footer ============ -->
    <footer class="bg-dark text-white-50 py-3 mt-auto">
        <div class="container text-center small">
            <i class="bi bi-c-circle"></i> <%= java.time.Year.now() %> Electricity Bill Calculator.
            Built with JSP, Servlets &amp; Bootstrap 5.
        </div>
    </footer>

    <!-- jQuery (CDN) -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <!-- Bootstrap 5 JS Bundle (CDN) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Custom script (client-side validation) -->
    <script src="${pageContext.request.contextPath}/js/script.js"></script>
</body>
</html>
