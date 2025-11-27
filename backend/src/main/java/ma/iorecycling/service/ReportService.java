package ma.iorecycling.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.ValorSummaryDTO;
import ma.iorecycling.dto.ValorSummaryRowDTO;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {
    
    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 16, Font.BOLD);
    private static final Font HEADER_FONT = new Font(Font.HELVETICA, 12, Font.BOLD);
    private static final Font NORMAL_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL);
    private static final Font FOOTER_FONT = new Font(Font.HELVETICA, 8, Font.ITALIC);
    
    /**
     * Génère un PDF de rapport de valorisation mensuel
     */
    public byte[] buildMonthlyValorPdf(Long clientId, YearMonth month, ValorSummaryDTO summary) {
        log.debug("Génération du rapport PDF pour client {} et mois {}", clientId, month);
        
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, outputStream);
            
            document.open();
            
            // Titre
            addTitle(document, month);
            
            // Table des données
            addDataTable(document, summary);
            
            // Total général
            addGrandTotal(document, summary);
            
            // Pied de page
            addFooter(document, clientId);
            
            document.close();
            
            return outputStream.toByteArray();
            
        } catch (DocumentException | IOException e) {
            log.error("Erreur lors de la génération du PDF", e);
            throw new RuntimeException("Erreur lors de la génération du rapport PDF", e);
        }
    }
    
    private void addTitle(Document document, YearMonth month) throws DocumentException {
        String monthName = month.format(DateTimeFormatter.ofPattern("MMMM yyyy", Locale.FRENCH));
        Paragraph title = new Paragraph("Rapport valorisation – " + monthName, TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);
    }
    
    private void addDataTable(Document document, ValorSummaryDTO summary) throws DocumentException {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{2, 1.5f, 1.5f, 1.5f});
        
        // En-têtes
        addTableHeader(table, "Matériau");
        addTableHeader(table, "Quantité (kg)");
        addTableHeader(table, "Prix (MAD/kg)");
        addTableHeader(table, "Total (MAD)");
        
        // Données
        for (ValorSummaryRowDTO row : summary.getRows()) {
            addTableCell(table, row.getMaterial(), NORMAL_FONT);
            addTableCell(table, String.format("%.2f", row.getQtyKg()), NORMAL_FONT);
            addTableCell(table, String.format("%.2f", row.getPricePerKg()), NORMAL_FONT);
            addTableCell(table, String.format("%.2f", row.getTotalMad()), NORMAL_FONT);
        }
        
        document.add(table);
    }
    
    private void addTableHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, HEADER_FONT));
        cell.setBackgroundColor(new Color(211, 211, 211)); // LIGHT_GRAY
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(8);
        table.addCell(cell);
    }
    
    private void addTableCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(6);
        table.addCell(cell);
    }
    
    private void addGrandTotal(Document document, ValorSummaryDTO summary) throws DocumentException {
        document.add(new Paragraph(" ")); // Espacement
        
        PdfPTable totalTable = new PdfPTable(2);
        totalTable.setWidthPercentage(50);
        totalTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
        
        PdfPCell labelCell = new PdfPCell(new Phrase("Total général :", HEADER_FONT));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalTable.addCell(labelCell);
        
        PdfPCell valueCell = new PdfPCell(new Phrase(
            String.format("%.2f %s", summary.getGrandTotalMad(), summary.getCurrency()), 
            HEADER_FONT
        ));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalTable.addCell(valueCell);
        
        document.add(totalTable);
    }
    
    private void addFooter(Document document, Long clientId) throws DocumentException {
        document.add(new Paragraph(" ")); // Espacement
        document.add(new Paragraph(" ")); // Espacement
        
        Paragraph footer = new Paragraph(
            "Client " + clientId + " – IORecycling", 
            FOOTER_FONT
        );
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);
    }
}
