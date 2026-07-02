package com.mse.edu.forum.api;

import com.mse.edu.forum.api.generated.PostsApi;
import com.mse.edu.forum.api.generated.model.CreatePostRequest;
import com.mse.edu.forum.api.generated.model.PostPage;
import com.mse.edu.forum.api.generated.model.PostResponse;
import com.mse.edu.forum.api.generated.model.UpdatePostRequest;
import com.mse.edu.forum.service.PostService;
import jakarta.validation.Valid;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PostsApiController implements PostsApi {

	private static final Logger log = LogManager.getLogger(PostsApiController.class);

	private final PostService postService;

	public PostsApiController(PostService postService) {
		this.postService = postService;
	}

	@Override
	public ResponseEntity<PostPage> listPosts(Integer page, Integer size) {
		log.debug("listPosts invoked page={} size={}", page, size);
		return ResponseEntity.ok(postService.findAll(page, size));
	}

	@Override
	public ResponseEntity<PostResponse> getPostById(Long id) {
		log.debug("getPostById invoked id={}", id);
		return postService
				.openTopic(id)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

	@Override
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<PostResponse> createPost(@Valid CreatePostRequest createPostRequest) {
		log.debug("createPost invoked title={}", createPostRequest.getTitle());
		PostResponse created = postService.create(createPostRequest);
		return ResponseEntity.status(HttpStatus.CREATED).body(created);
	}

	@Override
	@PreAuthorize("@contentSecurity.canModifyPost(#id)")
	public ResponseEntity<PostResponse> updatePost(Long id, @Valid UpdatePostRequest updatePostRequest) {
		log.debug("updatePost invoked id={}", id);
		return postService
				.update(id, updatePostRequest)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

	@Override
	@PreAuthorize("@contentSecurity.canModifyPost(#id)")
	public ResponseEntity<Void> deletePost(Long id) {
		log.debug("deletePost invoked id={}", id);
		return postService.delete(id)
				? ResponseEntity.noContent().build()
				: ResponseEntity.notFound().build();
	}

	@Override
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<PostResponse> likePost(Long id) {
		log.debug("likePost invoked id={}", id);
		return postService
				.like(id)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

	@Override
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<PostResponse> unlikePost(Long id) {
		log.debug("unlikePost invoked id={}", id);
		return postService
				.unlike(id)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}
}
