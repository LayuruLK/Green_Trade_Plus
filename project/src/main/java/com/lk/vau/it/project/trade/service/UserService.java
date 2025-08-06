package com.lk.vau.it.project.trade.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.lk.vau.it.project.service.CloudinaryService;
import com.lk.vau.it.project.trade.dto.AuthResponseDto;
import com.lk.vau.it.project.trade.dto.LoginRequestDto;
import com.lk.vau.it.project.trade.dto.UserBasicInfoDto;
import com.lk.vau.it.project.trade.dto.UserRegistrationDto;
import com.lk.vau.it.project.trade.exception.ResourceAlreadyExistsException;
import com.lk.vau.it.project.trade.exception.ResourceNotFoundException;
import com.lk.vau.it.project.trade.model.User;
import com.lk.vau.it.project.trade.repository.UserRepository;
import com.lk.vau.it.project.trade.security.JwtTokenProvider;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Value("${app.profile.photo.upload.dir:profile-photos}")
    private String uploadDir;

    public AuthResponseDto registerUser(UserRegistrationDto registrationDto) {
        // Check if user already exists
        if (userRepository.existsByPhoneNumber(registrationDto.getPhoneNumber())) {
            throw new ResourceAlreadyExistsException("Phone Number is already in use");
        }

        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new ResourceAlreadyExistsException("Email is already in use");
        }

        if (userRepository.existsByUserName(registrationDto.getUserName())) {
            throw new ResourceAlreadyExistsException("Username is already in use");
        }

        // Create new user
        User user = new User();
        user.setRole(registrationDto.getRole());
        user.setFirstName(registrationDto.getFirstName());
        user.setLastName(registrationDto.getLastName());
        user.setUserName(registrationDto.getUserName());
        user.setEmail(registrationDto.getEmail());
        user.setGender(registrationDto.getGender());
        user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        user.setAddressLineOne(registrationDto.getAddressLineOne());
        user.setAddressLineTwo(registrationDto.getAddressLineTwo());
        user.setProvince(registrationDto.getProvince());
        user.setDistrict(registrationDto.getDistrict());
        user.setCity(registrationDto.getCity());
        user.setPhoneNumber(registrationDto.getPhoneNumber());

        // Handle profile photo upload if provided
        if (registrationDto.getProfilePhoto() != null && !registrationDto.getProfilePhoto().isEmpty()) {
            try {
                String photoPath = cloudinaryService.uploadFile(registrationDto.getProfilePhoto(), "image");
                user.setProfilePhotoPath(photoPath);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload profile photo", e);
            }
        }

        // Save user to database
        User savedUser = userRepository.save(user);

        // *** CRITICAL CHANGE HERE: Use generateToken(User user) instead of generateToken(String userName) ***
        String token = jwtTokenProvider.generateToken(savedUser); // Pass the User object

        // Return response
        return new AuthResponseDto(
                savedUser.getId(),
                token,
                savedUser.getUserName(),
                savedUser.getEmail(),
                savedUser.getPhoneNumber(),
                savedUser.getRole(),
                savedUser.getProfilePhotoPath());
    }

    public AuthResponseDto loginUser(LoginRequestDto loginRequest) {
        // Find user by userName or phone number
        User user = userRepository.findByUserName(loginRequest.getUsernameOrPhone())
                .orElseGet(() -> userRepository.findByPhoneNumber(loginRequest.getUsernameOrPhone())
                        .orElseThrow(() -> new RuntimeException("Invalid userName or phone number")));

        // Check password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Update last login time
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // *** CRITICAL CHANGE HERE: Use generateToken(User user) instead of generateToken(String userName) ***
        String token = jwtTokenProvider.generateToken(user); // Pass the User object

        // Return response
        return new AuthResponseDto(
                user.getId(),
                token,
                user.getUserName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole(),
                user.getProfilePhotoPath());
    }

    public Optional<User> findByUsernameOrEmail(String usernameOrEmail) {
        // Try to find by userName first
        Optional<User> user = userRepository.findByUserName(usernameOrEmail);

        // If not found by userName, try by email
        if (user.isEmpty()) {
            user = userRepository.findByEmail(usernameOrEmail);
        }

        return user;
    }

    // Fingerprintstart
    public void storeBiometricPublicKey(Long userId, String publicKey) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setBiometricPublicKey(publicKey);
        userRepository.save(user);
    }

    public void removeBiometricPublicKey(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setBiometricPublicKey(null);
        userRepository.save(user);
    }

    public boolean verifyBiometricSignature(String publicKey, String signature, String payload) {
        try {
            PublicKey pubKey = getPublicKeyFromString(publicKey);
            Signature sig = Signature.getInstance("SHA256withRSA");
            sig.initVerify(pubKey);
            sig.update(payload.getBytes());

            byte[] signatureBytes = Base64.getDecoder().decode(signature);
            return sig.verify(signatureBytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify biometric signature", e);
        }
    }

    private PublicKey getPublicKeyFromString(String publicKeyStr) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(publicKeyStr);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePublic(spec);
    }
    // Fingerprintend

    /**
     * Saves the profile photo to the file system and returns the file path
     *
     * @param file     The profile photo file
     * @param userName The userName to use as part of the file name
     * @return The relative path to the saved file
     */
    private String saveProfilePhoto(MultipartFile file, String userName) {
        try {
            // Create uploads directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique file name to prevent duplicates
            String fileExtension = getFileExtension(file.getOriginalFilename());
            String fileName = userName + "-" + UUID.randomUUID().toString() + fileExtension;

            // Save the file
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store profile photo", e);
        }
    }

    /**
     * Extracts the file extension from the original file name
     *
     * @param fileName The original file name
     * @return The file extension with dot (e.g., ".jpg")
     */
    private String getFileExtension(String fileName) {
        if (fileName == null) {
            return ".jpg"; // Default extension
        }
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0) {
            return ".jpg"; // Default extension
        }
        return fileName.substring(dotIndex);
    }

    public UserBasicInfoDto getUserBasicInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserBasicInfoDto(user.getUserName(), user.getProfilePhotoPath(), user.getFirstName(),
                user.getRole());
    }

    public boolean updateBiometricPreference(Long userId, boolean enabled) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

            if (enabled) {
                // When enabling biometric auth, we just mark it as enabled
                user.setBiometricEnabled(true);
            } else {
                // When disabling, clear both the flag and any stored public key
                user.setBiometricEnabled(false);
                user.setBiometricPublicKey(null);
            }

            userRepository.save(user);
            return true;
        } catch (Exception e) {
            // Log the error for debugging
            System.err.println("Failed to update biometric preference: " + e.getMessage());
            return false;
        }
    }
}