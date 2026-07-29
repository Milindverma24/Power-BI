package com.aibi.controller;

import com.aibi.domain.DataSource;
import com.aibi.domain.DataSourceStatus;
import com.aibi.domain.DatasetInsight;
import com.aibi.domain.User;
import com.aibi.repository.DataSourceRepository;
import com.aibi.service.AiUnderstandingService;
import com.aibi.service.DataProfilingService;
import com.aibi.service.DatabaseIngestionService;
import com.aibi.service.ExternalImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/data-sources")
@RequiredArgsConstructor
public class DataImportController {

    private final DataSourceRepository dataSourceRepository;
    private final DataProfilingService dataProfilingService;
    private final AiUnderstandingService aiUnderstandingService;
    private final DatabaseIngestionService databaseIngestionService;
    private final ExternalImportService externalImportService;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().body("User is not assigned to an organization.");
        }

        try {
            // 1. Save Data Source as PENDING
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
            } else {
                extension = "csv"; // fallback
            }

            DataSource dataSource = DataSource.builder()
                    .name(originalFilename)
                    .type(extension.toUpperCase())
                    .organization(currentUser.getOrganization())
                    .status(DataSourceStatus.PROFILING)
                    .build();
            dataSource = dataSourceRepository.save(dataSource);

            // Save to temp file so async thread can access it after HTTP request completes
            File tempFile = File.createTempFile("upload_", "." + extension);
            file.transferTo(tempFile);

            processDataFile(dataSource, tempFile, extension);

            return ResponseEntity.ok(dataSource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to process file: " + e.getMessage());
        }
    }

    private void processDataFile(DataSource dataSource, File tempFile, String extension) {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                // 2. Profile the file
                Map<String, Object> dataProfile = dataProfilingService.profileFile(tempFile, extension);
                
                // 3. Get AI Understanding
                dataSource.setStatus(DataSourceStatus.ANALYZING);
                dataSourceRepository.save(dataSource);
                
                String aiResponse = aiUnderstandingService.generateBusinessContext(dataProfile);
                
                String[] parts = aiResponse.split("SUGGESTED KPIs:");
                String summary = parts[0].replace("SUMMARY:", "").trim();
                
                String remaining = parts.length > 1 ? parts[1] : "";
                String[] qualityParts = remaining.split("QUALITY SCORE:");
                String kpis = qualityParts[0].trim();
                
                String scoreAndRecs = qualityParts.length > 1 ? qualityParts[1] : "";
                String[] recParts = scoreAndRecs.split("CLEANING RECOMMENDATIONS:");
                
                String scoreStr = recParts[0].replaceAll("[^0-9]", "");
                Integer score = scoreStr.isEmpty() ? 85 : Integer.parseInt(scoreStr);
                String recs = recParts.length > 1 ? recParts[1].trim() : "No cleaning recommendations.";

                // 4. Save Insights
                DatasetInsight insight = DatasetInsight.builder()
                        .dataSource(dataSource)
                        .aiSummary(summary)
                        .suggestedKpis(kpis)
                        .dataQualityScore(score)
                        .cleaningRecommendations(recs)
                        .columnMetadata(dataProfile.get("headers").toString())
                        .build();
                
                dataSource.setInsight(insight);
                dataSource.setStatus(DataSourceStatus.READY);
                dataSourceRepository.save(dataSource);

                // 5. Ingest into PostgreSQL for Text-to-SQL
                databaseIngestionService.ingestFileToPostgres(dataSource, tempFile, extension);
            } catch (Exception e) {
                dataSource.setStatus(DataSourceStatus.FAILED);
                dataSourceRepository.save(dataSource);
            } finally {
                tempFile.delete(); // Clean up temp file
            }
        });
    }
    @PostMapping("/import/rest")
    public ResponseEntity<?> importFromRest(@RequestBody Map<String, Object> request, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) return ResponseEntity.badRequest().body("No organization");
        try {
            String url = (String) request.get("url");
            Map<String, String> headers = (Map<String, String>) request.get("headers");
            String name = request.getOrDefault("name", "REST API Import").toString();

            File tempFile = externalImportService.fetchFromRestApi(url, headers);
            DataSource dataSource = createPendingDataSource(name, "JSON", currentUser);
            processDataFile(dataSource, tempFile, "json");
            return ResponseEntity.ok(dataSource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to import from REST API: " + e.getMessage());
        }
    }

    @PostMapping("/import/sheets")
    public ResponseEntity<?> importFromSheets(@RequestBody Map<String, String> request, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) return ResponseEntity.badRequest().body("No organization");
        try {
            String sheetId = request.get("sheetId");
            String name = request.getOrDefault("name", "Google Sheets Import");

            File tempFile = externalImportService.fetchFromGoogleSheets(sheetId);
            DataSource dataSource = createPendingDataSource(name, "CSV", currentUser);
            processDataFile(dataSource, tempFile, "csv");
            return ResponseEntity.ok(dataSource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to import from Google Sheets: " + e.getMessage());
        }
    }

    @PostMapping("/import/database")
    public ResponseEntity<?> importFromDatabase(@RequestBody Map<String, String> request, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) return ResponseEntity.badRequest().body("No organization");
        try {
            String url = request.get("url");
            String username = request.get("username");
            String password = request.get("password");
            String query = request.get("query");
            String name = request.getOrDefault("name", "Database Import");

            File tempFile = externalImportService.fetchFromDatabase(url, username, password, query);
            DataSource dataSource = createPendingDataSource(name, "CSV", currentUser);
            processDataFile(dataSource, tempFile, "csv");
            return ResponseEntity.ok(dataSource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to import from Database: " + e.getMessage());
        }
    }

    private DataSource createPendingDataSource(String name, String type, User user) {
        DataSource dataSource = DataSource.builder()
                .name(name)
                .type(type)
                .organization(user.getOrganization())
                .status(DataSourceStatus.PROFILING)
                .build();
        return dataSourceRepository.save(dataSource);
    }

    @GetMapping
    public ResponseEntity<List<DataSource>> getOrganizationDataSources(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(dataSourceRepository.findByOrganizationIdOrderByCreatedAtDesc(currentUser.getOrganization().getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDataSource(@PathVariable java.util.UUID id, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().body("No organization");
        }
        
        DataSource dataSource = dataSourceRepository.findById(id).orElse(null);
        if (dataSource == null || !dataSource.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            return ResponseEntity.status(403).body("Not found or access denied.");
        }
        
        try {
            String tableName = "ds_" + dataSource.getId().toString().replace("-", "_");
            jdbcTemplate.execute("DROP TABLE IF EXISTS " + tableName + " CASCADE");
            dataSourceRepository.delete(dataSource);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to delete dataset: " + e.getMessage());
        }
    }
}
