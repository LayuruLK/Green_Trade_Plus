package com.lk.vau.it.project.trade.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.lk.vau.it.project.academy.model.AcademyCourse;
import com.lk.vau.it.project.ecommerce.model.EcommerceItem;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "farmer")
    @JsonManagedReference("farmer-tradeitem")
    private List<TradeItem> tradeItems;;

    @OneToMany(mappedBy = "tutor")
    @JsonManagedReference("tutor-course")
    private List<AcademyCourse> academyCourses;;

    @OneToMany(mappedBy = "seller")
    @JsonManagedReference("seller-item")
    private List<EcommerceItem> ecommerceItems;;

    @OneToMany(mappedBy = "user")
    @JsonManagedReference("user-bid")
    private List<ItemBid> itemBids;

    @Column(nullable = false)
    private String role; // userType in frontend

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "user_name", nullable = false, unique = true)
    private String userName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private String password;

    @Column(name = "address_line_one", nullable = false)
    private String addressLineOne;

    @Column(name = "address_line_two")
    private String addressLineTwo;

    @Column(nullable = false)
    private String province;

    @Column(nullable = false)
    private String district;

    @Column(nullable = false)
    private String city;

    @Column(name = "phone_number", nullable = false, unique = true)
    private String phoneNumber;

    @Column(name = "profile_photo_path")
    private String profilePhotoPath;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "account_active", nullable = false)
    private boolean accountActive;

    @Column(name = "biometric_public_key", length = 2048)
    private String biometricPublicKey;

    @Column(name = "biometric_enabled", nullable = false)
    private boolean biometricEnabled = false;

    // Pre-persist hook to set default values
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.accountActive = true;
    }

    // Pre-update hook
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<TradeItem> getTradeItems() {
        return tradeItems;
    }

    public void setTradeItems(List<TradeItem> tradeItems) {
        this.tradeItems = tradeItems;
    }

    public List<AcademyCourse> getAcademyCourses() {
        return academyCourses;
    }

    public void setAcademyCourses(List<AcademyCourse> academyCourses) {
        this.academyCourses = academyCourses;
    }

    public List<ItemBid> getItemBid() {
        return itemBids;
    }

    public void setItemBid(List<ItemBid> itemBids) {
        this.itemBids = itemBids;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getAddressLineOne() {
        return addressLineOne;
    }

    public void setAddressLineOne(String addressLineOne) {
        this.addressLineOne = addressLineOne;
    }

    public String getAddressLineTwo() {
        return addressLineTwo;
    }

    public void setAddressLineTwo(String addressLineTwo) {
        this.addressLineTwo = addressLineTwo;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getProfilePhotoPath() {
        return profilePhotoPath;
    }

    public void setProfilePhotoPath(String profilePhotoPath) {
        this.profilePhotoPath = profilePhotoPath;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public boolean isAccountActive() {
        return accountActive;
    }

    public void setAccountActive(boolean accountActive) {
        this.accountActive = accountActive;
    }

    public String getBiometricPublicKey() {
        return biometricPublicKey;
    }
    
    public void setBiometricPublicKey(String biometricPublicKey) {
        this.biometricPublicKey = biometricPublicKey;
    }
    public boolean isBiometricEnabled() {
        return biometricEnabled;
    }

    public void setBiometricEnabled(boolean biometricEnabled) {
        this.biometricEnabled = biometricEnabled;
    }
}