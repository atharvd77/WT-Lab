package com.vit.sgpa.controller;

import com.vit.sgpa.dto.*;
import com.vit.sgpa.entity.User;
import com.vit.sgpa.exception.ApiException;
import com.vit.sgpa.repository.UserRepository;
import com.vit.sgpa.security.AuthenticatedUser;
import com.vit.sgpa.service.PdfService;
import com.vit.sgpa.service.ResultService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    private final ResultService resultService;
    private final PdfService pdfService;
    private final UserRepository userRepository;

    public ResultController(ResultService resultService, PdfService pdfService, UserRepository userRepository) {
        this.resultService = resultService;
        this.pdfService = pdfService;
        this.userRepository = userRepository;
    }

    @PostMapping("/calculate")
    public ResponseEntity<ResultResponse> calculate(@Valid @RequestBody CalculateRequest request) {
        return ResponseEntity.ok(resultService.calculate(request));
    }

    @PostMapping("/save")
    public ResponseEntity<SaveResultResponse> save(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody CalculateRequest request
    ) {
        SaveResultResponse response = resultService.save(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<ResultHistoryItem>> history(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(resultService.history(principal.getId()));
    }

    @PostMapping("/pdf")
    public ResponseEntity<byte[]> downloadPdf(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody CalculateRequest request
    ) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ApiException("User not found.", HttpStatus.NOT_FOUND));

        ResultResponse computed = resultService.calculate(request);

        byte[] pdfBytes = pdfService.generateResultPdf(
                user.getName(),
                user.getEmail(),
                request.getSemesterLabel(),
                computed
        );

        String filename = "VIT_Result_" + request.getSemesterLabel().replaceAll("\\s+", "_") + ".pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                org.springframework.http.ContentDisposition.attachment().filename(filename).build()
        );

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}
