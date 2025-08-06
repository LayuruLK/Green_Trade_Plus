package com.lk.vau.it.project.trade.payload;

public class BiometricVerifyRequest {
    private String userName;
    private String signature;
    private String payload;

    // Getters and setters
    public String getUsername() {
        return userName;
    }

    public void setUsername(String userName) {
        this.userName = userName;
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }
}
