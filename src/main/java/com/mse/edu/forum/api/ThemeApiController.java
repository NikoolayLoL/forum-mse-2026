package com.mse.edu.forum.api;

import com.mse.edu.forum.api.generated.ThemeApi;
import com.mse.edu.forum.api.generated.model.ThemeCustomization;
import com.mse.edu.forum.api.generated.model.UpdateThemeRequest;
import com.mse.edu.forum.service.ThemeService;
import jakarta.validation.Valid;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ThemeApiController implements ThemeApi {

	private static final Logger log = LogManager.getLogger(ThemeApiController.class);

	private final ThemeService themeService;

	public ThemeApiController(ThemeService themeService) {
		this.themeService = themeService;
	}

	@Override
	public ResponseEntity<ThemeCustomization> getHomeTheme() {
		log.debug("getHomeTheme invoked");
		return ResponseEntity.ok(themeService.home());
	}

	@Override
	public ResponseEntity<ThemeCustomization> getUserTheme(Long userId) {
		log.debug("getUserTheme invoked userId={}", userId);
		return ResponseEntity.ok(themeService.forUser(userId));
	}

	@Override
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ThemeCustomization> updateHomeTheme(@Valid UpdateThemeRequest updateThemeRequest) {
		log.debug("updateHomeTheme invoked");
		return ResponseEntity.ok(themeService.updateHome(updateThemeRequest));
	}

	@Override
	@PreAuthorize("@userSecurity.isSelf(#userId) or hasRole('ADMIN')")
	public ResponseEntity<ThemeCustomization> updateUserTheme(Long userId, @Valid UpdateThemeRequest updateThemeRequest) {
		log.debug("updateUserTheme invoked userId={}", userId);
		return ResponseEntity.ok(themeService.updateUser(userId, updateThemeRequest));
	}
}
