package com.mse.edu.forum.repo;

import com.mse.edu.forum.domain.PostEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<PostEntity, Long> {

	boolean existsByTitle(String title);

	/**
	 * Increments the view counter directly in the database. Using a bulk update
	 * (rather than dirty-checking the loaded entity) avoids firing {@code @PreUpdate},
	 * so opening a topic does not change its {@code updatedAt}.
	 */
	@Modifying
	@Query("update PostEntity p set p.views = p.views + 1 where p.id = :id")
	int incrementViews(@Param("id") Long id);
}
