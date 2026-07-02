package com.mse.edu.forum.repo;

import com.mse.edu.forum.domain.ReplyLikeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReplyLikeRepository extends JpaRepository<ReplyLikeEntity, Long> {

	long countByReplyId(Long replyId);

	boolean existsByReplyIdAndUserId(Long replyId, Long userId);

	void deleteByReplyIdAndUserId(Long replyId, Long userId);
}
