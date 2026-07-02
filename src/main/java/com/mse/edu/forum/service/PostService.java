package com.mse.edu.forum.service;

import com.mse.edu.forum.api.generated.model.CreatePostRequest;
import com.mse.edu.forum.api.generated.model.PostPage;
import com.mse.edu.forum.api.generated.model.PostResponse;
import com.mse.edu.forum.api.generated.model.UpdatePostRequest;
import com.mse.edu.forum.domain.PostEntity;
import com.mse.edu.forum.domain.PostLikeEntity;
import com.mse.edu.forum.mapper.PostMapper;
import com.mse.edu.forum.repo.PostLikeRepository;
import com.mse.edu.forum.repo.PostRepository;
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
public class PostService {

	private final PostRepository postRepository;
	private final PostLikeRepository postLikeRepository;
	private final PostMapper postMapper;
	private final CurrentUserService currentUserService;

	public PostService(
			PostRepository postRepository,
			PostLikeRepository postLikeRepository,
			PostMapper postMapper,
			CurrentUserService currentUserService) {
		this.postRepository = postRepository;
		this.postLikeRepository = postLikeRepository;
		this.postMapper = postMapper;
		this.currentUserService = currentUserService;
	}

	/** FUS1: topic list, newest first, paginated (default 15 per page). */
	@Transactional(readOnly = true)
	public PostPage findAll(int page, int size) {
		Long currentUserId = currentUserService.currentUserIdOrNull();
		// Newest topics first; id breaks ties on equal createdAt.
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
		Page<PostEntity> result = postRepository.findAll(pageable);
		List<PostResponse> content = result.getContent().stream()
				.map(entity -> toResponse(entity, currentUserId))
				.toList();
		return new PostPage(
				content, result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
	}

	/**
	 * Loads a single topic and records the view (FUS1: view count). The increment is a
	 * direct DB update so it does not bump {@code updatedAt}.
	 */
	@Transactional
	public Optional<PostResponse> openTopic(Long id) {
		return postRepository.findById(id).map(entity -> {
			postRepository.incrementViews(id);
			PostResponse response = toResponse(entity, currentUserService.currentUserIdOrNull());
			response.setViews(entity.getViews() + 1);
			return response;
		});
	}

	@Transactional
	public PostResponse create(CreatePostRequest request) {
		PostEntity postEntity = postMapper.toEntity(request);
		if (postRepository.existsByTitle(postEntity.getTitle())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "A topic with this title already exists");
		}
		postEntity.setAuthor(currentUserService.requireCurrentUser());
		PostEntity saved = postRepository.save(postEntity);
		return toResponse(saved, saved.getAuthor().getId());
	}

	@Transactional
	public Optional<PostResponse> update(Long id, UpdatePostRequest request) {
		Optional<PostEntity> existing = postRepository.findById(id);
		if (existing.isEmpty()) {
			return Optional.empty();
		}
		PostEntity entity = existing.get();
		String newTitle = trim(request.getTitle());
		String newContent = trim(request.getContent());
		if (newTitle != null && !newTitle.equals(entity.getTitle()) && postRepository.existsByTitle(newTitle)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "A topic with this title already exists");
		}
		entity.setTitle(newTitle);
		entity.setContent(newContent);
		PostEntity saved = postRepository.save(entity);
		return Optional.of(toResponse(saved, currentUserService.currentUserIdOrNull()));
	}

	@Transactional
	public boolean delete(Long id) {
		if (!postRepository.existsById(id)) {
			return false;
		}
		postRepository.deleteById(id);
		return true;
	}

	@Transactional
	public Optional<PostResponse> like(Long id) {
		Optional<PostEntity> existing = postRepository.findById(id);
		if (existing.isEmpty()) {
			return Optional.empty();
		}
		Long userId = currentUserService.requireCurrentUser().getId();
		if (!postLikeRepository.existsByPostIdAndUserId(id, userId)) {
			postLikeRepository.save(new PostLikeEntity(id, userId));
		}
		return Optional.of(toResponse(existing.get(), userId));
	}

	@Transactional
	public Optional<PostResponse> unlike(Long id) {
		Optional<PostEntity> existing = postRepository.findById(id);
		if (existing.isEmpty()) {
			return Optional.empty();
		}
		Long userId = currentUserService.requireCurrentUser().getId();
		postLikeRepository.deleteByPostIdAndUserId(id, userId);
		return Optional.of(toResponse(existing.get(), userId));
	}

	private PostResponse toResponse(PostEntity entity, Long currentUserId) {
		PostResponse response = postMapper.toResponse(entity);
		response.setLikeCount(postLikeRepository.countByPostId(entity.getId()));
		response.setLikedByCurrentUser(
				currentUserId != null && postLikeRepository.existsByPostIdAndUserId(entity.getId(), currentUserId));
		return response;
	}

	private static String trim(String value) {
		return value == null ? null : value.trim();
	}
}
