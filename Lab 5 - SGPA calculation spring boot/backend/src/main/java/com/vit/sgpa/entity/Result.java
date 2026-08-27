package com.vit.sgpa.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "results")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "semester_label", length = 100)
    private String semesterLabel;

    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal sgpa;

    @Column(name = "total_credits", nullable = false)
    private Integer totalCredits;

    // Stored as a JSON column; the raw JSON text is (de)serialized in the service layer,
    // so it is simply bound here as a String to avoid double-encoding by Hibernate's JSON type.
    @Column(name = "subjects_json", nullable = false, columnDefinition = "JSON")
    private String subjectsJson;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
