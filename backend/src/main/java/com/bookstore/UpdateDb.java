package com.bookstore;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

public class UpdateDb {
    public static void main(String[] args) {
        String url = "jdbc:sqlserver://localhost:1433;databaseName=bookstore;TrustServerCertificate=true;encrypt=false;sendStringParametersAsUnicode=true";
        String user = "bookstore_user";
        String pass = "123456";
        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            String sqlClear = "UPDATE users SET phone = NULL WHERE phone = '0398179491'";
            try (PreparedStatement pstmt1 = conn.prepareStatement(sqlClear)) {
                pstmt1.executeUpdate();
            }
            String sqlAssign = "UPDATE users SET phone = '0398179491' WHERE email = 'admin@gmail.com'";
            try (PreparedStatement pstmt2 = conn.prepareStatement(sqlAssign)) {
                int rows = pstmt2.executeUpdate();
                System.out.println("Assigned phone to admin. Rows updated: " + rows);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
