package com.mse.edu.forum.service;

import com.mse.edu.forum.api.generated.model.ThemeCustomization;
import com.mse.edu.forum.api.generated.model.UpdateThemeRequest;
import com.mse.edu.forum.domain.ThemeCustomizationEntity;
import com.mse.edu.forum.domain.ThemeScope;
import com.mse.edu.forum.repo.ThemeCustomizationRepository;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ThemeService {

	private static final String HOME_KEY = "home";
	private static final List<String> DEFAULT_FIGURES =
			List.of("star", "heart", "comment", "bolt", "feather", "music");

	private final ThemeCustomizationRepository repository;

	public ThemeService(ThemeCustomizationRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	public ThemeCustomization home() {
		return repository
				.findByPageKey(HOME_KEY)
				.map(ThemeService::toResponse)
				.orElseGet(() -> defaults(ThemeCustomization.ScopeEnum.PAGE, deterministicSeed(HOME_KEY))
						.pageKey(HOME_KEY));
	}

	@Transactional(readOnly = true)
	public ThemeCustomization forUser(Long userId) {
		return repository
				.findByUserId(userId)
				.map(ThemeService::toResponse)
				.orElseGet(() -> defaults(ThemeCustomization.ScopeEnum.USER, deterministicSeed("user:" + userId))
						.userId(userId));
	}

	@Transactional
	public ThemeCustomization updateHome(UpdateThemeRequest request) {
		ThemeCustomizationEntity entity = repository.findByPageKey(HOME_KEY).orElseGet(() -> {
			ThemeCustomizationEntity created = new ThemeCustomizationEntity();
			created.setScope(ThemeScope.PAGE);
			created.setPageKey(HOME_KEY);
			return created;
		});
		applyFields(entity, request);
		return toResponse(repository.save(entity));
	}

	@Transactional
	public ThemeCustomization updateUser(Long userId, UpdateThemeRequest request) {
		ThemeCustomizationEntity entity = repository.findByUserId(userId).orElseGet(() -> {
			ThemeCustomizationEntity created = new ThemeCustomizationEntity();
			created.setScope(ThemeScope.USER);
			created.setUserId(userId);
			return created;
		});
		applyFields(entity, request);
		return toResponse(repository.save(entity));
	}

	private static void applyFields(ThemeCustomizationEntity e, UpdateThemeRequest r) {
		e.setSeed(r.getSeed());
		e.setFigures(String.join(",", r.getFigures()));
		e.setBgColor(r.getBgColor());
		e.setBgOpacity(r.getBgOpacity());
		e.setCardColor(r.getCardColor());
		e.setCardOpacity(r.getCardOpacity());
		e.setOpacity(r.getOpacity());
		e.setBlur(r.getBlur());
		e.setDensity(r.getDensity());
		e.setBaseSize(r.getBaseSize());
		e.setSizeVariation(r.getSizeVariation());
		e.setAccentColor(r.getAccentColor());
		e.setAccentVariation(r.getAccentVariation());
	}

	/** A neutral default theme used when no row exists yet. */
	private static ThemeCustomization defaults(ThemeCustomization.ScopeEnum scope, String seed) {
		return new ThemeCustomization()
				.scope(scope)
				.seed(seed)
				.figures(DEFAULT_FIGURES)
				.bgColor("#ffffff")
				.bgOpacity(1.0f)
				.cardColor("#ffffff")
				.cardOpacity(1.0f)
				.opacity(0.08f)
				.blur(0)
				.density(63)
				.baseSize(34)
				.sizeVariation(0.35f)
				.accentColor("#111111")
				.accentVariation(0.25f);
	}

	private static String deterministicSeed(String key) {
		return UUID.nameUUIDFromBytes(key.getBytes(StandardCharsets.UTF_8)).toString();
	}

	private static ThemeCustomization toResponse(ThemeCustomizationEntity e) {
		return new ThemeCustomization()
				.scope(e.getScope() == ThemeScope.PAGE
						? ThemeCustomization.ScopeEnum.PAGE
						: ThemeCustomization.ScopeEnum.USER)
				.seed(e.getSeed())
				.figures(splitFigures(e.getFigures()))
				.bgColor(e.getBgColor())
				.bgOpacity(e.getBgOpacity())
				.cardColor(e.getCardColor())
				.cardOpacity(e.getCardOpacity())
				.opacity(e.getOpacity())
				.blur(e.getBlur())
				.density(e.getDensity())
				.baseSize(e.getBaseSize())
				.sizeVariation(e.getSizeVariation())
				.accentColor(e.getAccentColor())
				.accentVariation(e.getAccentVariation())
				.pageKey(e.getPageKey())
				.userId(e.getUserId());
	}

	private static List<String> splitFigures(String csv) {
		if (csv == null || csv.isBlank()) {
			return List.of();
		}
		return Arrays.stream(csv.split(","))
				.map(String::trim)
				.filter(s -> !s.isEmpty())
				.toList();
	}
}
