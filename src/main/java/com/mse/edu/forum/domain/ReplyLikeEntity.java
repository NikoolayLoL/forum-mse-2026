package com.mse.edu.forum.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "reply_likes", uniqueConstraints = @UniqueConstraint(name = "uq_reply_likes", columnNames = {"reply_id", "user_id"}))
public class ReplyLikeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "reply_id", nullable = false)
	private Long replyId;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	public ReplyLikeEntity(Long replyId, Long userId) {
		this.replyId = replyId;
		this.userId = userId;
	}

	@PrePersist
	void onCreate() {
		if (createdAt == null) {
			createdAt = Instant.now();
		}
	}
}
