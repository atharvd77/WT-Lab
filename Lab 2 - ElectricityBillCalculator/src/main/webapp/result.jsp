<%--
    ================================================================
    result.jsp - Bill Result Page
    Project : Electricity Bill Calculator
    Purpose : Displays the calculated bill, slab-wise rate breakdown,
              and total amount using JSTL <c:forEach>/<c:if> and
              JSP Expression Language (EL) for attribute access.
    Data    : Populated by BillServlet via request attributes:
                customerName, units, breakdown (List<SlabDetail>), totalBill
    ================================================================
--%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bill Result - Electricity Bill Calculator</title>

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
                <small class="opacity-75">Bill Summary</small>
            </div>
        </div>
    </header>

    <!-- ============ Main Content ============ -->
    <main class="flex-grow-1">
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-12 col-md-10 col-lg-8">

                    <!-- ===== Summary Card ===== -->
                    <div class="card shadow border-0 rounded-4 mb-4">
                        <div class="card-header bg-success text-white rounded-top-4">
                            <h2 class="h5 mb-0">
                                <i class="bi bi-check-circle-fill me-1"></i> Bill Generated Successfully
                            </h2>
                        </div>
                        <div class="card-body p-4">
                            <div class="row g-3">
                                <div class="col-12 col-sm-6">
                                    <div class="p-3 bg-light rounded-3 h-100">
                                        <div class="text-muted small"><i class="bi bi-person-fill me-1"></i>Customer</div>
                                        <div class="fs-5 fw-semibold">${customerName}</div>
                                    </div>
                                </div>
                                <div class="col-12 col-sm-6">
                                    <div class="p-3 bg-light rounded-3 h-100">
                                        <div class="text-muted small"><i class="bi bi-speedometer2 me-1"></i>Units Consumed</div>
                                        <div class="fs-5 fw-semibold">${units} units</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Total Amount Highlight -->
                            <div class="mt-4 p-4 bg-primary bg-gradient text-white rounded-3 text-center">
                                <div class="small opacity-75 text-uppercase">Total Bill Amount</div>
                                <div class="display-6 fw-bold">
                                    <i class="bi bi-currency-rupee"></i>
                                    <fmt:formatNumber value="${totalBill}" minFractionDigits="2" maxFractionDigits="2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ===== Rate Slabs Applied / Calculation Breakdown Card ===== -->
                    <div class="card shadow border-0 rounded-4 mb-4">
                        <div class="card-header bg-white rounded-top-4">
                            <h2 class="h5 mb-0 text-primary">
                                <i class="bi bi-table me-1"></i> Rate Slabs Applied &amp; Calculation Breakdown
                            </h2>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-striped table-hover align-middle mb-0">
                                    <thead class="table-dark">
                                        <tr>
                                            <th><i class="bi bi-list-ol me-1"></i>Slab</th>
                                            <th class="text-end">Units in Slab</th>
                                            <th class="text-end">Rate (Rs./unit)</th>
                                            <th class="text-end">Amount (Rs.)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <%-- JSTL forEach loop iterates over the List<SlabDetail> set by BillServlet --%>
                                        <c:forEach var="slab" items="${breakdown}">
                                            <tr>
                                                <td>${slab.slabName}</td>
                                                <td class="text-end">${slab.unitsInSlab}</td>
                                                <td class="text-end">
                                                    <fmt:formatNumber value="${slab.rate}" minFractionDigits="2" maxFractionDigits="2" />
                                                </td>
                                                <td class="text-end fw-semibold">
                                                    <fmt:formatNumber value="${slab.slabAmount}" minFractionDigits="2" maxFractionDigits="2" />
                                                </td>
                                            </tr>
                                        </c:forEach>
                                    </tbody>
                                    <tfoot>
                                        <tr class="table-secondary">
                                            <th colspan="3" class="text-end">Total Amount</th>
                                            <th class="text-end">
                                                <fmt:formatNumber value="${totalBill}" minFractionDigits="2" maxFractionDigits="2" />
                                            </th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- ===== Action Buttons ===== -->
                    <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center mb-4">
                        <a href="${pageContext.request.contextPath}/index.jsp" class="btn btn-primary btn-lg">
                            <i class="bi bi-arrow-left-circle me-1"></i> Calculate Another Bill
                        </a>
                        <button onclick="window.print()" class="btn btn-outline-secondary btn-lg">
                            <i class="bi bi-printer-fill me-1"></i> Print Bill
                        </button>
                    </div>

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
    <!-- Custom script -->
    <script src="${pageContext.request.contextPath}/js/script.js"></script>
</body>
</html>
