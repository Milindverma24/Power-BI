package com.aibi.controller;

import com.aibi.domain.User;
import com.aibi.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.aibi.domain.User;
import com.aibi.model.Report;
import com.aibi.repository.ReportRepository;
import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;
    private final ReportRepository reportRepository;

    @GetMapping("/recent")
    public ResponseEntity<List<Report>> getRecentReports(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(reportRepository.findByOrganizationIdAndScheduledFalseOrderByReportDateDesc(currentUser.getOrganization().getId()));
    }

    @GetMapping("/scheduled")
    public ResponseEntity<List<Report>> getScheduledReports(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(reportRepository.findByOrganizationIdAndScheduledTrue(currentUser.getOrganization().getId()));
    }

    @PostMapping("/generate")
    public ResponseEntity<Report> generateReport(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) return ResponseEntity.badRequest().build();
        try {
            Report report = reportService.generateDynamicReport(currentUser.getOrganization(), currentUser);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("Failed to generate dynamic report", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostConstruct
    public void seedMockReports() {
        // Skip mock seeding since we are using real data generation now.
    }



    @GetMapping("/pdf")
    public ResponseEntity<byte[]> downloadPdfReport(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            byte[] pdfBytes = reportService.generatePdfReport(currentUser.getOrganization());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"dashboard_report.pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            log.error("Failed to generate PDF", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/excel")
    public ResponseEntity<byte[]> downloadExcelReport(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            byte[] excelBytes = reportService.generateExcelReport(currentUser.getOrganization());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"dashboard_report.xlsx\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excelBytes);
        } catch (Exception e) {
            log.error("Failed to generate Excel", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/narrative")
    public ResponseEntity<byte[]> downloadNarrativeReport(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            byte[] pdfBytes = reportService.generateNarrativeReport(currentUser.getOrganization());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"narrative_report.pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            log.error("Failed to generate Narrative Report", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/story/pptx")
    public ResponseEntity<byte[]> exportStoryPowerPoint(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            byte[] pptxBytes = reportService.generatePowerPointStory(currentUser.getOrganization());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"data_story.pptx\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.presentationml.presentation"))
                    .body(pptxBytes);
        } catch (Exception e) {
            log.error("Failed to generate PPTX", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/story/web")
    public ResponseEntity<?> getWebStoryData(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().body("No organization assigned");
        }

        try {
            return ResponseEntity.ok(reportService.generateWebStoryData(currentUser.getOrganization()));
        } catch (Exception e) {
            log.error("Failed to generate Web Story data", e);
            return ResponseEntity.internalServerError().body("Failed to generate Web Story data");
        }
    }
}
