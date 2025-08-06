package com.lk.vau.it.project.trade.dto;

public class LoginRequestDto {

    // This field accepts either a userName or phone number
    private String usernameOrPhone;
    private String password;

    public String getUsernameOrPhone() {
        return usernameOrPhone;
    }

    public void setUsernameOrPhone(String usernameOrPhone) {
        this.usernameOrPhone = usernameOrPhone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
