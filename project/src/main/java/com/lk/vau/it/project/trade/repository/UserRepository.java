package com.lk.vau.it.project.trade.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lk.vau.it.project.trade.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    Optional<User> findByUserName(String userName);
    boolean existsByUserName(String userName);

    Optional<User> findByPhoneNumber(String phoneNumber);
    boolean existsByPhoneNumber(String phoneNumber);

    Optional<User> findById(Long id);
    boolean existsById(Long id);

    Optional<User> findByUserNameOrEmail(String userName, String email);
}