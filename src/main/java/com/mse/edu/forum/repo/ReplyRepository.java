package com.mse.edu.forum.repo;

import com.mse.edu.forum.domain.ReplyEntity;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReplyRepository extends JpaRepository<ReplyEntity, Long> {

	Page<ReplyEntity> findByPostId(Long postId, Pageable pageable);

	/** The single newest reply for a topic (for pinning at the top, FUS3). */
	Optional<ReplyEntity> findFirstByPostIdOrderByCreatedAtDescIdDesc(Long postId);
}
