package com.aibi.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DataProfilingService {

    public Map<String, Object> profileFile(File file, String extension) throws Exception {
        Map<String, Object> profile = new HashMap<>();
        List<String> headers = new ArrayList<>();
        List<Map<String, String>> sampleRows = new ArrayList<>();
        int rowCount = 0;

        if (extension.equalsIgnoreCase("csv")) {
            try (BufferedReader fileReader = new BufferedReader(new InputStreamReader(new FileInputStream(file), StandardCharsets.UTF_8));
                 CSVParser csvParser = new CSVParser(fileReader, CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim())) {

                headers.addAll(csvParser.getHeaderNames());

                for (CSVRecord csvRecord : csvParser) {
                    if (rowCount < 3) {
                        Map<String, String> row = new HashMap<>();
                        for (String header : headers) {
                            row.put(header, csvRecord.isSet(header) ? csvRecord.get(header) : null);
                        }
                        sampleRows.add(row);
                    }
                    rowCount++;
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
                rowCount = sheet.getLastRowNum(); // excluding header row
                for (int i = 1; i <= Math.min(3, sheet.getLastRowNum()); i++) {
                    Row row = sheet.getRow(i);
                    if (row != null) {
                        Map<String, String> mapRow = new HashMap<>();
                        for (int j = 0; j < headers.size(); j++) {
                            Cell cell = row.getCell(j, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
                            mapRow.put(headers.get(j), cell.toString());
                        }
                        sampleRows.add(mapRow);
                    }
                }
            }
        } else if (extension.equalsIgnoreCase("json")) {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(file);
            if (rootNode.isArray() && rootNode.size() > 0) {
                JsonNode firstNode = rootNode.get(0);
                firstNode.fieldNames().forEachRemaining(headers::add);
                rowCount = rootNode.size();
                for (int i = 0; i < Math.min(3, rootNode.size()); i++) {
                    JsonNode node = rootNode.get(i);
                    Map<String, String> row = new HashMap<>();
                    for (String header : headers) {
                        JsonNode val = node.get(header);
                        row.put(header, val != null ? val.asText() : null);
                    }
                    sampleRows.add(row);
                }
            } else {
                throw new IllegalArgumentException("JSON must be an array of objects");
            }
        } else {
            throw new IllegalArgumentException("Unsupported file extension");
        }

        profile.put("headers", headers);
        profile.put("sampleRows", sampleRows);
        profile.put("totalRows", rowCount);
        return profile;
    }
}
