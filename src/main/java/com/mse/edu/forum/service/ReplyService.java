package com.mse.edu.forum.service;

import com.mse.edu.forum.api.generated.model.CreateReplyRequest;
import com.mse.edu.forum.api.generated.model.ReplyPage;
import com.mse.edu.forum.api.generated.model.ReplyResponse;
import com.mse.edu.forum.api.generated.model.UpdateReplyRequest;
import com.mse.edu.forum.domain.ReplyEntity;
import com.mse.edu.forum.domain.ReplyLikeEntity;
import com.mse.edu.forum.mapper.ReplyMapper;
import com.mse.edu.forum.repo.PostRepository;
import com.mse.edu.forum.repo.ReplyLikeRepository;
import com.mse.edu.forum.repo.ReplyRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReplyService {

	private final ReplyRepository replyRepository;
	private final ReplyLikeRepository replyLikeRepository;
	private final PostRepository postRepository;
	private final ReplyMapper replyMapper;
	private final CurrentUserService currentUserService;

	public ReplyService(
			ReplyRepository replyRepository,
			ReplyLikeRepository replyLikeRepository,
			PostRepository postRepository,
			ReplyMapper replyMapper,
			CurrentUserService currentUserService) {
		this.replyRepository = replyRepository;
		this.replyLikeRepository = replyLikeRepository;
		this.postRepository = postRepository;
		this.replyMapper = replyMapper;
		this.currentUserService = currentUserService;
	}

	/** FUS3: replies for a topic, paginated (default 10 per page), oldest first. */
	@Transactional(readOnly = true)
	public ReplyPage findByPostId(Long postId, int page, int size) {
		if (!postRepository.existsById(postId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
		}
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
		Page<ReplyEntity> result = replyRepository.findByPostId(postId, pageable);
		Long currentUserId = currentUserService.currentUserIdOrNull();
		List<ReplyResponse> content = result.getContent().stream()
				.map(entity -> toResponse(entity, currentUserId))
				.toList();
		ReplyPage response = new ReplyPage(
				content, result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
		// FUS3: always expose the newest reply so the UI can pin it at the top.
		replyRepository
				.findFirstByPostIdOrderByCreatedAtDescIdDesc(postId)
				.ifPresent(entity -> response.setNewest(toResponse(entity, currentUserId)));
		return response;
	}

	@Transactional(readOnly = true)
	public Optional<ReplyResponse> findById(Long id) {
		Long currentUserId = currentUserService.currentUserIdOrNull();
		return replyRepository.findById(id).map(entity -> toResponse(entity, currentUserId));
	}

	@Transactional
	public ReplyResponse create(Long postId, CreateReplyRequest request) {
		if (!postRepository.existsById(postId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
		}
		ReplyEntity entity = replyMapper.toEntity(request, postId);
		entity.setAuthor(currentUserService.requireCurrentUser());
		ReplyEntity saved = replyRepository.save(entity);
		return toResponse(saved, saved.getAuthor().getId());
	}

	@Transactional
	public Optional<ReplyResponse> update(Long id, UpdateReplyRequest request) {
		Optional<ReplyEntity> existing = replyRepository.findById(id);
		if (existing.isEmpty()) {
			return Optional.empty();
		}
		ReplyEntity entity = existing.get();
		entity.setContent(request.getContent() == null ? null : request.getContent().trim());
		ReplyEntity saved = replyRepository.save(entity);
		return Optional.of(toResponse(saved, currentUserService.currentUserIdOrNull()));
	}

	@Transactional
	public boolean delete(Long id) {
		if (!replyRepository.existsById(id)) {
			return false;
		}
		replyRepository.deleteById(id);
		return true;
	}

	@Transactional
	public Optional<ReplyResponse> like(Long id) {
		Optional<ReplyEntity> existing = replyRepository.findById(id);
		if (existing.isEmpty()) {
			return Optional.empty();
		}
		Long userId = currentUserService.requireCurrentUser().getId();
		if (!replyLikeRepository.existsByReplyIdAndUserId(id, userId)) {
			replyLikeRepository.save(new ReplyLikeEntity(id, userId));
		}
		return Optional.of(toResponse(existing.get(), userId));
	}

	@Transactional
	public Optional<ReplyResponse> unlike(Long id) {
		Optional<ReplyEntity> existing = replyRepository.findById(id);
		if (existing.isEmpty()) {
			return Optional.empty();
		}
		Long userId = currentUserService.requireCurrentUser().getId();
		replyLikeRepository.deleteByReplyIdAndUserId(id, userId);
		return Optional.of(toResponse(existing.get(), userId));
	}

	private ReplyResponse toResponse(ReplyEntity entity, Long currentUserId) {
		ReplyResponse response = replyMapper.toResponse(entity);
		response.setLikeCount(replyLikeRepository.countByReplyId(entity.getId()));
		response.setLikedByCurrentUser(
				currentUserId != null && replyLikeRepository.existsByReplyIdAndUserId(entity.getId(), currentUserId));
		return response;
	}
}
