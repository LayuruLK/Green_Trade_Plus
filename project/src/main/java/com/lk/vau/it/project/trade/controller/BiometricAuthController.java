package com.lk.vau.it.project.trade.controller;

import org.apache.coyote.BadRequestException;
import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lk.vau.it.project.trade.exception.ResourceNotFoundException;
import com.lk.vau.it.project.trade.model.User;
import com.lk.vau.it.project.trade.payload.ApiResponse;
import com.lk.vau.it.project.trade.payload.BiometricPublicKeyRequest;
import com.lk.vau.it.project.trade.payload.BiometricVerifyRequest;
import com.lk.vau.it.project.trade.payload.JwtAuthenticationResponse;
import com.lk.vau.it.project.trade.security.JwtTokenProvider;
import com.lk.vau.it.project.trade.service.UserService;

@RestController
@RequestMapping("/api/auth/biometric")
public class BiometricAuthController {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/enable")
    public ResponseEntity<?> enableBiometricAuth(
            @RequestHeader("Authorization") String authHeader) {

        String jwt = authHeader.substring(7);
        Long userId = tokenProvider.getUserIdFromJWT(jwt);

        if (userService.updateBiometricPreference(userId, true)) {
            return ResponseEntity.ok(new ApiResponse(true, "Biometric authentication enabled"));
        } else {
            return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to enable biometric authentication"));
        }
    }

    @PostMapping("/disable")
    public ResponseEntity<?> disableBiometricAuth(
            @RequestHeader("Authorization") String authHeader) {

        String jwt = authHeader.substring(7);
        Long userId = tokenProvider.getUserIdFromJWT(jwt);

        if (userService.updateBiometricPreference(userId, false)) {
            return ResponseEntity.ok(new ApiResponse(true, "Biometric authentication disabled"));
        } else {
            return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to disable biometric authentication"));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyBiometricSignature(
            @RequestBody BiometricVerifyRequest request) {

        // Find user by userName/email
        User user = userService.findByUsernameOrEmail(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "userName/email", request.getUsername()));

        if (user.getBiometricPublicKey() == null) {
            throw new com.lk.vau.it.project.trade.exception.BadRequestException(
                    "Biometric authentication not enabled for this user");
        }

        // Verify the signature with the stored public key
        boolean isValid = userService.verifyBiometricSignature(
                user.getBiometricPublicKey(),
                request.getSignature(),
                request.getPayload());

        if (isValid) {
            // Generate JWT token
            String token = tokenProvider.generateToken(user);
            return ResponseEntity.ok(new JwtAuthenticationResponse(token));
        } else {
            throw new com.lk.vau.it.project.trade.exception.BadRequestException("Invalid biometric signature");
        }
    }
}
