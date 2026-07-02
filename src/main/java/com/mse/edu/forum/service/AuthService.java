package com.mse.edu.forum.service;

import com.mse.edu.forum.api.generated.model.CreateUserRequest;
import com.mse.edu.forum.api.generated.model.LoginRequest;
import com.mse.edu.forum.api.generated.model.LoginResponse;
import com.mse.edu.forum.api.generated.model.RegisterRequest;
import com.mse.edu.forum.api.generated.model.UserResponse;
import com.mse.edu.forum.api.generated.model.UserRole;
import com.mse.edu.forum.mapper.UserMapper;
import com.mse.edu.forum.security.ForumUserDetails;
import com.mse.edu.forum.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;
	private final UserService userService;
	private final UserMapper userMapper;

	public AuthService(
			AuthenticationManager authenticationManager,
			JwtService jwtService,
			UserService userService,
			UserMapper userMapper) {
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
		this.userService = userService;
		this.userMapper = userMapper;
	}

	public LoginResponse login(LoginRequest request) {
		var token =
				UsernamePasswordAuthenticationToken.unauthenticated(request.getUsername(), request.getPassword());
		var auth = authenticationManager.authenticate(token);
		var user = (ForumUserDetails) auth.getPrincipal();
		String jwt = jwtService.createToken(user.getId(), user.getUsername(), user.getDomainRole());
		return new LoginResponse(jwt, "Bearer", jwtService.getExpiresInSeconds());
	}

	public LoginResponse register(RegisterRequest request) {
		CreateUserRequest createRequest = new CreateUserRequest(request.getUsername(), UserRole.USER, request.getPassword())
				.email(request.getEmail());
		UserResponse created = userService.create(createRequest);
		String jwt = jwtService.createToken(
				created.getId(), created.getUsername(), userMapper.toDomainRole(created.getRole()));
		return new LoginResponse(jwt, "Bearer", jwtService.getExpiresInSeconds());
	}
}
