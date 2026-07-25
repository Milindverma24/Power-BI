package com.aibi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

@Service
@RequiredArgsConstructor
public class ExternalImportService {

    public File fetchFromRestApi(String url, Map<String, String> headersMap) throws Exception {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        if (headersMap != null) {
            headersMap.forEach(headers::set);
        }
        
        HttpEntity<String> entity = new HttpEntity<>("parameters", headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        
        File tempFile = File.createTempFile("rest_", ".json");
        try (PrintWriter out = new PrintWriter(new FileWriter(tempFile))) {
            out.print(response.getBody());
        }
        return tempFile;
    }

    public File fetchFromGoogleSheets(String sheetId) throws Exception {
        // Construct the public export URL
        String url = "https://docs.google.com/spreadsheets/d/" + sheetId + "/export?format=csv";
        
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        
        File tempFile = File.createTempFile("sheets_", ".csv");
        try (PrintWriter out = new PrintWriter(new FileWriter(tempFile))) {
            out.print(response.getBody());
        }
        return tempFile;
    }

    public File fetchFromDatabase(String jdbcUrl, String username, String password, String query) throws Exception {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setUrl(jdbcUrl);
        dataSource.setUsername(username);
        dataSource.setPassword(password);

        JdbcTemplate externalJdbcTemplate = new JdbcTemplate(dataSource);
        
        List<Map<String, Object>> rows = externalJdbcTemplate.queryForList(query);
        
        File tempFile = File.createTempFile("db_", ".csv");
        try (PrintWriter out = new PrintWriter(new FileWriter(tempFile))) {
            if (!rows.isEmpty()) {
                // Print headers
                Map<String, Object> firstRow = rows.get(0);
                StringJoiner headerJoiner = new StringJoiner(",");
                firstRow.keySet().forEach(k -> headerJoiner.add("\"" + k.replace("\"", "\"\"") + "\""));
                out.println(headerJoiner.toString());

                // Print rows
                for (Map<String, Object> row : rows) {
                    StringJoiner rowJoiner = new StringJoiner(",");
                    for (Object val : row.values()) {
                        String strVal = val != null ? val.toString().replace("\"", "\"\"") : "";
                        rowJoiner.add("\"" + strVal + "\"");
                    }
                    out.println(rowJoiner.toString());
                }
            }
        }
        return tempFile;
    }
}
