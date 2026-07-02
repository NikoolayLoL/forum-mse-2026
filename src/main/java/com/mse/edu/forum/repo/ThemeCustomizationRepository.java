package com.mse.edu.forum.repo;

import com.mse.edu.forum.domain.ThemeCustomizationEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ThemeCustomizationRepository extends JpaRepository<ThemeCustomizationEntity, Long> {

	Optional<ThemeCustomizationEntity> findByPageKey(String pageKey);

	Optional<ThemeCustomizationEntity> findByUserId(Long userId);
}
