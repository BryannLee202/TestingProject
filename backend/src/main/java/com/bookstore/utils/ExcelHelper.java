package com.bookstore.utils;

import com.bookstore.entity.Book;
import com.bookstore.entity.Category;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class ExcelHelper {
    public static String TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    static String[] HEADERS = { "Tiêu đề sách", "Tác giả", "Nhà xuất bản", "Mô tả", "Giá bán (đ)", "Giá cũ (đ)", "% Giảm giá", "Số lượng tồn", "ID Danh mục", "Link Ảnh" };
    static String SHEET = "Books";

    public static boolean hasExcelFormat(MultipartFile file) {
        return TYPE.equals(file.getContentType());
    }

    public static ByteArrayInputStream generateBooksTemplate() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream();) {
            Sheet sheet = workbook.createSheet(SHEET);

            // Header
            Row headerRow = sheet.createRow(0);
            CellStyle headerCellStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerCellStyle.setFont(font);

            for (int col = 0; col < HEADERS.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(HEADERS[col]);
                cell.setCellStyle(headerCellStyle);
            }

            // Sample data row
            Row dataRow = sheet.createRow(1);
            dataRow.createCell(0).setCellValue("Sách Mẫu (Ví dụ)");
            dataRow.createCell(1).setCellValue("Nguyễn Văn A");
            dataRow.createCell(2).setCellValue("NXB Trẻ");
            dataRow.createCell(3).setCellValue("Đây là sách mẫu để bạn tham khảo cách điền.");
            dataRow.createCell(4).setCellValue(150000); // Giá
            dataRow.createCell(5).setCellValue(200000); // Giá cũ
            dataRow.createCell(6).setCellValue(25);     // % Giảm giá
            dataRow.createCell(7).setCellValue(100);    // Tồn kho
            dataRow.createCell(8).setCellValue(1);      // ID Category
            dataRow.createCell(9).setCellValue("https://example.com/image.jpg");

            // Auto-size columns
            for (int col = 0; col < HEADERS.length; col++) {
                sheet.autoSizeColumn(col);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi tạo tệp Excel mẫu: " + e.getMessage());
        }
    }

    public static List<Book> excelToBooks(InputStream is) {
        try {
            Workbook workbook = new XSSFWorkbook(is);
            Sheet sheet = workbook.getSheet(SHEET);
            if (sheet == null) {
                 sheet = workbook.getSheetAt(0); // Lấy sheet đầu tiên nếu không có sheet Books
            }

            Iterator<Row> rows = sheet.iterator();
            List<Book> books = new ArrayList<>();

            int rowNumber = 0;
            while (rows.hasNext()) {
                Row currentRow = rows.next();
                if (rowNumber == 0) {
                    rowNumber++;
                    continue; // Bỏ qua dòng Header
                }

                Book book = new Book();
                Iterator<Cell> cellsInRow = currentRow.iterator();
                int cellIdx = 0;
                
                // If the first cell is completely empty, we can stop reading.
                if (currentRow.getCell(0) == null || currentRow.getCell(0).getCellType() == CellType.BLANK) {
                    break;
                }

                while (cellsInRow.hasNext()) {
                    Cell currentCell = cellsInRow.next();
                    cellIdx = currentCell.getColumnIndex(); // Đảm bảo đúng cột kể cả khi có ô trống

                    switch (cellIdx) {
                        case 0:
                            book.setTitle(getCellValueAsString(currentCell));
                            break;
                        case 1:
                            book.setAuthor(getCellValueAsString(currentCell));
                            break;
                        case 2:
                            book.setPublisher(getCellValueAsString(currentCell));
                            break;
                        case 3:
                            book.setDescription(getCellValueAsString(currentCell));
                            break;
                        case 4:
                            book.setPrice(new BigDecimal(getCellValueAsNumeric(currentCell)));
                            break;
                        case 5:
                            book.setOldPrice(new BigDecimal(getCellValueAsNumeric(currentCell)));
                            break;
                        case 6:
                            book.setDiscount((int) getCellValueAsNumeric(currentCell));
                            break;
                        case 7:
                            book.setStockQuantity((int) getCellValueAsNumeric(currentCell));
                            break;
                        case 8:
                            Category category = new Category();
                            category.setId((long) getCellValueAsNumeric(currentCell));
                            book.setCategory(category);
                            break;
                        case 9:
                            book.setImageUrl(getCellValueAsString(currentCell));
                            break;
                        default:
                            break;
                    }
                }
                
                // Thiết lập giá trị mặc định nếu rỗng
                if (book.getDiscount() == null) book.setDiscount(0);
                if (book.getStockQuantity() == null) book.setStockQuantity(0);
                if (book.getIsCombo() == null) book.setIsCombo(false);
                if (book.getAverageRating() == null) book.setAverageRating(0.0);
                if (book.getReviewCount() == null) book.setReviewCount(0);
                if (book.getSalesCount() == null) book.setSalesCount(0);

                books.add(book);
            }
            workbook.close();
            return books;
        } catch (IOException e) {
            throw new RuntimeException("Lỗi đọc file Excel: " + e.getMessage());
        }
    }
    
    private static String getCellValueAsString(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue();
        } else if (cell.getCellType() == CellType.NUMERIC) {
            return String.valueOf((long) cell.getNumericCellValue());
        }
        return null;
    }
    
    private static double getCellValueAsNumeric(Cell cell) {
        if (cell == null) return 0;
        if (cell.getCellType() == CellType.NUMERIC) {
            return cell.getNumericCellValue();
        } else if (cell.getCellType() == CellType.STRING) {
            try {
                return Double.parseDouble(cell.getStringCellValue());
            } catch (NumberFormatException e) {
                return 0;
            }
        }
        return 0;
    }
}
