package com.mse.edu.forum.security;

import com.mse.edu.forum.domain.UserRole;
import com.mse.edu.forum.repo.PostRepository;
import com.mse.edu.forum.repo.ReplyRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Ownership/role checks for editing and deleting content (FUS5):
 * a USER may modify only their own objects; MODERATOR and ADMIN may modify any.
 * When the target does not exist, access is allowed so the controller can return 404
 * rather than leaking existence via a 403.
 */
@Component("contentSecurity")
public class ContentSecurity {

	private final PostRepository postRepository;
	private final ReplyRepository replyRepository;

	public ContentSecurity(PostRepository postRepository, ReplyRepository replyRepository) {
		this.postRepository = postRepository;
		this.replyRepository = replyRepository;
	}

	public boolean canModifyPost(Long postId) {
		return postRepository
				.findById(postId)
				.map(post -> canModify(post.getAuthor().getId()))
				.orElse(true);
	}

	public boolean canModifyReply(Long replyId) {
		return replyRepository
				.findById(replyId)
				.map(reply -> canModify(reply.getAuthor().getId()))
				.orElse(true);
	}

	private boolean canModify(Long authorId) {
		ForumUserDetails current = currentUser();
		if (current == null) {
			return false;
		}
		if (current.getId() == authorId) {
			return true;
		}
		UserRole role = current.getDomainRole();
		return role == UserRole.ADMIN || role == UserRole.MODERATOR;
	}

	private ForumUserDetails currentUser() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null || !(auth.getPrincipal() instanceof ForumUserDetails details)) {
			return null;
		}
		return details;
	}
}
