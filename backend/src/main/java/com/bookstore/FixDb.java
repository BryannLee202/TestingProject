package com.bookstore;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
public class FixDb {
    public static void main(String[] args) {
        String url = "jdbc:mysql://bjf8ihu44kqfbqwzs1iv-mysql.services.clever-cloud.com:3306/bjf8ihu44kqfbqwzs1iv?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        String user = "***REMOVED_MYSQL_USER***";
        String password = "***REMOVED_MYSQL_PASSWORD***";
        
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
             
            System.out.println("Connected to database!");
            
            try {
                int count = stmt.executeUpdate("UPDATE orders SET created_at = DATE_ADD(created_at, INTERVAL 7 HOUR)");
                System.out.println("Successfully added 7 hours to " + count + " orders.");
            } catch (Exception e) {
                System.out.println("Error updating orders: " + e.getMessage());
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
