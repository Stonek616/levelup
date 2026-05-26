package com.levelup.repository;

import com.levelup.model.PasswordResetToken;
import com.levelup.model.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
  Optional<PasswordResetToken> findByToken(String token);

  @Transactional
  void deleteByUser(User user);
}
