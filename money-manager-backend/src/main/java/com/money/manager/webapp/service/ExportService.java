package com.money.manager.webapp.service;

import com.money.manager.webapp.model.Transaction;
import com.money.manager.webapp.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final TransactionRepository transactionRepository;
    private final UserServ userService;

    public ByteArrayInputStream exportUserTransactionsToExcel(String email, LocalDate startDate, LocalDate endDate) throws IOException {
        Long userId = userService.findByEmail(email).getId();

        List<Transaction> transactions;
        if (startDate != null && endDate != null) {

            transactions = transactionRepository.findAll().stream()
                    .filter(t -> t.getUserId().equals(userId))
                    .filter(t -> !t.getDate().toLocalDate().isBefore(startDate) && !t.getDate().toLocalDate().isAfter(endDate))
                    .toList();
        } else {
            transactions = transactionRepository.findAll().stream()
                    .filter(t -> t.getUserId().equals(userId))
                    .toList();
        }


        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Movimientos");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            String[] headers = {"ID", "Fecha", "Concepto", "Tipo", "Categoría", "Cuenta", "Importe"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Transaction t : transactions) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(t.getId());
                row.createCell(1).setCellValue(t.getDate().toLocalDate().toString());
                row.createCell(2).setCellValue(t.getDescription());
                row.createCell(3).setCellValue(t.getType().toString());
                row.createCell(4).setCellValue(t.getCategoryId());
                row.createCell(5).setCellValue(t.getAccount().getName());
                row.createCell(6).setCellValue(t.getAmount().doubleValue());
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}