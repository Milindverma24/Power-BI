package com.aibi.service;

import com.aibi.domain.DataSource;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileReader;
import java.io.Reader;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DatabaseIngestionService {

    private final JdbcTemplate jdbcTemplate;

    public void ingestFileToPostgres(DataSource dataSource, File file, String extension) throws Exception {
        String tableName = "ds_" + dataSource.getId().toString().replace("-", "_");
        
        List<String> headers = new ArrayList<>();
        List<Map<String, String>> allRows = new ArrayList<>();

        if (extension.equalsIgnoreCase("csv")) {
            try (Reader reader = new FileReader(file);
                 CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader().withTrim())) {
                headers.addAll(csvParser.getHeaderNames());
                for (CSVRecord record : csvParser) {
                    Map<String, String> row = new HashMap<>();
                    for (String header : headers) {
                        row.put(header, record.isSet(header) ? record.get(header) : null);
                    }
                    allRows.add(row);
                }
            }
        } else if (extension.equalsIgnoreCase("xlsx") || extension.equalsIgnoreCase("xls")) {
            try (Workbook workbook = WorkbookFactory.create(file)) {
                Sheet sheet = workbook.getSheetAt(0);
                Row headerRow = sheet.getRow(0);
                if (headerRow != null) {
                    for (Cell cell : headerRow) {
                        headers.add(cell.toString());
                    }
                }
                for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                    Row row = sheet.getRow(i);
                    if (row != null) {
                        Map<String, String> mapRow = new HashMap<>();
                        for (int j = 0; j < headers.size(); j++) {
                            Cell cell = row.getCell(j, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
                            mapRow.put(headers.get(j), cell.toString());
                        }
                        allRows.add(mapRow);
                    }
                }
            }
        } else if (extension.equalsIgnoreCase("json")) {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(file);
            if (rootNode.isArray() && rootNode.size() > 0) {
                JsonNode firstNode = rootNode.get(0);
                firstNode.fieldNames().forEachRemaining(headers::add);
                for (JsonNode node : rootNode) {
                    Map<String, String> row = new HashMap<>();
                    for (String header : headers) {
                        JsonNode val = node.get(header);
                        row.put(header, val != null ? val.asText() : null);
                    }
                    allRows.add(row);
                }
            } else {
                throw new IllegalArgumentException("JSON must be an array of objects");
            }
        } else {
            throw new IllegalArgumentException("Unsupported file type: " + extension);
        }

        if (headers.isEmpty()) {
            throw new IllegalArgumentException("File has no headers");
        }

        // Clean headers for SQL
        List<String> cleanHeaders = headers.stream()
                .map(h -> h.replaceAll("[^a-zA-Z0-9_]", "_").toLowerCase())
                .collect(Collectors.toList());

        // 1. Generate CREATE TABLE statement (treating everything as TEXT for now to avoid parsing errors)
        StringBuilder createTableSql = new StringBuilder("CREATE TABLE IF NOT EXISTS " + tableName + " (");
        for (int i = 0; i < cleanHeaders.size(); i++) {
            createTableSql.append(cleanHeaders.get(i)).append(" TEXT");
            if (i < cleanHeaders.size() - 1) {
                createTableSql.append(", ");
            }
        }
        createTableSql.append(");");
        
        log.info("Creating table: {}", createTableSql);
        jdbcTemplate.execute("DROP TABLE IF EXISTS " + tableName);
        jdbcTemplate.execute(createTableSql.toString());

        // 2. Bulk Insert Rows
        String placeholders = cleanHeaders.stream().map(h -> "?").collect(Collectors.joining(","));
        String insertSql = "INSERT INTO " + tableName + " (" + String.join(",", cleanHeaders) + ") VALUES (" + placeholders + ")";

        List<Object[]> batchArgs = new ArrayList<>();
        for (Map<String, String> record : allRows) {
            Object[] args = new Object[cleanHeaders.size()];
            for (int i = 0; i < cleanHeaders.size(); i++) {
                args[i] = record.get(headers.get(i));
            }
            batchArgs.add(args);

            if (batchArgs.size() >= 1000) {
                jdbcTemplate.batchUpdate(insertSql, batchArgs);
                batchArgs.clear();
            }
        }
        if (!batchArgs.isEmpty()) {
            jdbcTemplate.batchUpdate(insertSql, batchArgs);
        }
        
        log.info("Successfully ingested file into table {}", tableName);
    }
}
