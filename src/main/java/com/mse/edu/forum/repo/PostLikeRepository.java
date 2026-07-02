package com.mse.edu.forum.repo;

import com.mse.edu.forum.domain.PostLikeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostLikeRepository extends JpaRepository<PostLikeEntity, Long> {

	long countByPostId(Long postId);

	boolean existsByPostIdAndUserId(Long postId, Long userId);

	void deleteByPostIdAndUserId(Long postId, Long userId);
}
