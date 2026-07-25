package com.aibi.service;

import com.aibi.domain.DashboardWidget;
import com.aibi.domain.Organization;
import com.aibi.repository.DashboardWidgetRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final DashboardWidgetRepository widgetRepository;
    private final JdbcTemplate jdbcTemplate;
    private final ChatLanguageModel chatLanguageModel;

    public byte[] generatePdfReport(Organization organization) {
        List<DashboardWidget> widgets = widgetRepository.findByOrganizationIdOrderByCreatedAtDesc(organization.getId());

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("Executive Dashboard Report").setBold().setFontSize(18));
            document.add(new Paragraph("Organization: " + organization.getName()));
            document.add(new Paragraph(""));

            for (DashboardWidget widget : widgets) {
                document.add(new Paragraph(widget.getTitle()).setBold().setFontSize(14));
                try {
                    List<Map<String, Object>> data = jdbcTemplate.queryForList(widget.getSqlQuery());
                    if (!data.isEmpty()) {
                        Map<String, Object> firstRow = data.get(0);
                        Table table = new Table(firstRow.size());
                        
                        // Headers
                        for (String key : firstRow.keySet()) {
                            table.addHeaderCell(new Cell().add(new Paragraph(key).setBold()));
                        }
                        
                        // Data
                        for (Map<String, Object> row : data) {
                            for (Object value : row.values()) {
                                table.addCell(new Cell().add(new Paragraph(value != null ? value.toString() : "")));
                            }
                        }
                        document.add(table);
                    } else {
                        document.add(new Paragraph("No data available."));
                    }
                } catch (Exception e) {
                    document.add(new Paragraph("Error loading data: " + e.getMessage()));
                }
                document.add(new Paragraph(""));
            }

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate PDF report", e);
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    public byte[] generateExcelReport(Organization organization) {
        List<DashboardWidget> widgets = widgetRepository.findByOrganizationIdOrderByCreatedAtDesc(organization.getId());

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            
            for (DashboardWidget widget : widgets) {
                String sheetName = widget.getTitle().replaceAll("[^a-zA-Z0-9-]", " ");
                if (sheetName.length() > 30) sheetName = sheetName.substring(0, 30);
                Sheet sheet = workbook.createSheet(sheetName);

                try {
                    List<Map<String, Object>> data = jdbcTemplate.queryForList(widget.getSqlQuery());
                    if (!data.isEmpty()) {
                        Row headerRow = sheet.createRow(0);
                        Map<String, Object> firstRow = data.get(0);
                        
                        int colIdx = 0;
                        for (String key : firstRow.keySet()) {
                            headerRow.createCell(colIdx++).setCellValue(key);
                        }
                        
                        int rowIdx = 1;
                        for (Map<String, Object> dataRow : data) {
                            Row row = sheet.createRow(rowIdx++);
                            colIdx = 0;
                            for (Object value : dataRow.values()) {
                                row.createCell(colIdx++).setCellValue(value != null ? value.toString() : "");
                            }
                        }
                    }
                } catch (Exception e) {
                    log.error("Failed to load data for widget sheet", e);
                }
            }

            workbook.write(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Excel report", e);
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }

    public byte[] generateNarrativeReport(Organization organization) {
        List<DashboardWidget> widgets = widgetRepository.findByOrganizationIdOrderByCreatedAtDesc(organization.getId());
        StringBuilder dataContext = new StringBuilder();

        for (DashboardWidget widget : widgets) {
            try {
                List<Map<String, Object>> data = jdbcTemplate.queryForList(widget.getSqlQuery());
                if (!data.isEmpty()) {
                    dataContext.append("Widget: ").append(widget.getTitle()).append("\n");
                    // Limit to top 5 rows for context size
                    int limit = Math.min(data.size(), 5);
                    for (int i = 0; i < limit; i++) {
                        dataContext.append(data.get(i).toString()).append("\n");
                    }
                    dataContext.append("\n");
                }
            } catch (Exception e) {
                // skip
            }
        }

        String prompt = "You are an expert AI business analyst. Based on the following data samples from the company's dashboard, write a highly professional, multi-paragraph Executive Narrative Report summarizing the business performance, key trends, and potential risks. Do not include raw JSON or arrays, write it as a narrative.\n\nData:\n" + dataContext.toString();
        
        String narrativeResponse = chatLanguageModel.generate(prompt);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("AI Narrative Executive Report").setBold().setFontSize(18));
            document.add(new Paragraph("Organization: " + organization.getName()));
            document.add(new Paragraph("\n"));
            
            document.add(new Paragraph(narrativeResponse));

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Narrative PDF report", e);
            throw new RuntimeException("Failed to generate Narrative PDF report", e);
        }
    }

    public byte[] generatePowerPointStory(Organization organization) {
        List<DashboardWidget> widgets = widgetRepository.findByOrganizationIdOrderByCreatedAtDesc(organization.getId());

        try (org.apache.poi.xslf.usermodel.XMLSlideShow ppt = new org.apache.poi.xslf.usermodel.XMLSlideShow(); 
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            
            // Title Slide
            org.apache.poi.xslf.usermodel.XSLFSlideMaster defaultMaster = ppt.getSlideMasters().get(0);
            org.apache.poi.xslf.usermodel.XSLFSlideLayout titleLayout = defaultMaster.getLayout(org.apache.poi.xslf.usermodel.SlideLayout.TITLE);
            org.apache.poi.xslf.usermodel.XSLFSlide titleSlide = ppt.createSlide(titleLayout);
            org.apache.poi.xslf.usermodel.XSLFTextShape titleShape = titleSlide.getPlaceholder(0);
            titleShape.setText("Data Story: " + organization.getName());
            
            org.apache.poi.xslf.usermodel.XSLFSlideLayout contentLayout = defaultMaster.getLayout(org.apache.poi.xslf.usermodel.SlideLayout.TITLE_AND_CONTENT);
            
            for (DashboardWidget widget : widgets) {
                org.apache.poi.xslf.usermodel.XSLFSlide slide = ppt.createSlide(contentLayout);
                org.apache.poi.xslf.usermodel.XSLFTextShape slideTitle = slide.getPlaceholder(0);
                slideTitle.setText(widget.getTitle());
                
                org.apache.poi.xslf.usermodel.XSLFTextShape body = slide.getPlaceholder(1);
                body.clearText();
                
                // Fetch AI explanation for the slide
                String prompt = "Explain the significance of this metric briefly (2 sentences max): " + widget.getTitle();
                String explanation = chatLanguageModel.generate(prompt);
                
                body.addNewTextParagraph().addNewTextRun().setText(explanation);
            }

            ppt.write(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate PowerPoint story", e);
            throw new RuntimeException("Failed to generate PowerPoint story", e);
        }
    }

    public List<Map<String, Object>> generateWebStoryData(Organization organization) {
        List<DashboardWidget> widgets = widgetRepository.findByOrganizationIdOrderByCreatedAtDesc(organization.getId());
        java.util.List<Map<String, Object>> slides = new java.util.ArrayList<>();
        
        for (DashboardWidget widget : widgets) {
            Map<String, Object> slide = new java.util.HashMap<>();
            slide.put("widgetId", widget.getId());
            slide.put("title", widget.getTitle());
            
            String prompt = "You are a presenter. Write a 2-sentence script to explain this dashboard chart titled: " + widget.getTitle();
            String script = chatLanguageModel.generate(prompt);
            slide.put("script", script);
            
            slides.add(slide);
        }
        return slides;
    }
}
