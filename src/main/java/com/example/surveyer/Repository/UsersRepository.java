package com.example.surveyer.Repository;

import com.example.surveyer.Entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsersRepository extends JpaRepository<Users,Long> {
    Optional<Users> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<Users> findByEmail(String email);
    Optional<Users> findByEmailVerificationToken(String token);
    Optional<Users> findByPasswordResetToken(String token);
}
