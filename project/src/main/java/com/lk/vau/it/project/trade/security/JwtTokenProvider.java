package com.lk.vau.it.project.trade.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders; // Not needed if you don't Base64 encode in properties
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct; // Import for @PostConstruct
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.lk.vau.it.project.trade.model.User;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function; // Needed for extractClaim if you use it

@Service
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecretString; // Use 'String' to hold the secret from properties

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationDate;

    private Key secretKey; // This will hold the actual Key object, initialized once

    @PostConstruct
    public void init() {
        // Initialize the secretKey once when the bean is created
        this.secretKey = Keys.hmacShaKeyFor(jwtSecretString.getBytes());
    }

    // Helper to get the consistent Key
    private Key getSigningKey() {
        return secretKey;
    }

    // Generate JWT token for Authentication object (for Spring Security flow)
    public String generateToken(Authentication authentication) {
        String userName = authentication.getName();
        Date currentDate = new Date();
        Date expireDate = new Date(currentDate.getTime() + jwtExpirationDate);

        return Jwts.builder()
                .setSubject(userName)
                .setIssuedAt(currentDate)
                .setExpiration(expireDate)
                .signWith(getSigningKey()) // Use the consistent key
                .compact();
    }

    // Generate token for user object (used in biometric auth and potentially login/register)
    public String generateToken(User user) {
        Date currentDate = new Date();
        Date expireDate = new Date(currentDate.getTime() + jwtExpirationDate);

        return Jwts.builder()
                .setSubject(user.getUserName())
                .claim("userId", user.getId())
                .setIssuedAt(currentDate)
                .setExpiration(expireDate)
                .signWith(getSigningKey()) // Use the consistent key
                .compact();
    }

    // Generate token using just a username (from old JwtUtil)
    public String generateToken(String userName) {
        Map<String, Object> claims = new HashMap<>(); // You can add claims if needed
        Date currentDate = new Date();
        Date expireDate = new Date(currentDate.getTime() + jwtExpirationDate);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userName)
                .setIssuedAt(currentDate)
                .setExpiration(expireDate)
                .signWith(getSigningKey()) // Use the consistent key
                .compact();
    }

    // Get userName from JWT token
    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey()) // Use the consistent key
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    // Get user ID from JWT token (assuming your JWT contains user ID)
    public Long getUserIdFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey()) // Use the consistent key
                .build()
                .parseClaimsJws(token)
                .getBody();

        if (claims.containsKey("userId")) {
            return claims.get("userId", Long.class);
        }
        throw new MalformedJwtException("User ID not found in token");
    }

    // Validate JWT token
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey()) // Use the consistent key
                    .build()
                    .parse(token);
            return true;
        } catch (MalformedJwtException ex) {
            System.err.println("Invalid JWT token: " + ex.getMessage()); // Log for debugging
        } catch (ExpiredJwtException ex) {
            System.err.println("Expired JWT token: " + ex.getMessage()); // Log for debugging
        } catch (UnsupportedJwtException ex) {
            System.err.println("Unsupported JWT token: " + ex.getMessage()); // Log for debugging
        } catch (IllegalArgumentException ex) {
            System.err.println("JWT claims string is empty: " + ex.getMessage()); // Log for debugging
        } catch (io.jsonwebtoken.security.SignatureException ex) { // Explicitly catch SignatureException
            System.err.println("JWT signature does not match: " + ex.getMessage()); // Log for debugging
        }
        return false;
    }

    // You can also move extractEmail, extractExpiration, extractClaim if needed for other parts of your app
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
    }
}