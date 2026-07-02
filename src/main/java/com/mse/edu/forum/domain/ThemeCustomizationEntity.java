package com.mse.edu.forum.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "theme_customization")
public class ThemeCustomizationEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 16)
	private ThemeScope scope;

	/** Set for {@link ThemeScope#PAGE} rows, e.g. {@code "home"}. */
	@Column(name = "page_key", length = 64)
	private String pageKey;

	/** Set for {@link ThemeScope#USER} rows. */
	@Column(name = "user_id")
	private Long userId;

	/** UUID string seeding all deterministic placement/rotation/size/shade choices. */
	@Column(nullable = false, length = 36)
	private String seed;

	/** CSV of Font Awesome icon names. */
	@Column(nullable = false, columnDefinition = "text")
	private String figures;

	@Column(name = "bg_color", nullable = false, length = 32)
	private String bgColor;

	/** 0..1 — opacity of the background colour fill. */
	@Column(name = "bg_opacity", nullable = false)
	private Float bgOpacity;

	/** Background colour of post/reply/list cards. */
	@Column(name = "card_color", nullable = false, length = 32)
	private String cardColor;

	/** 0..1 — opacity of the card background. */
	@Column(name = "card_opacity", nullable = false)
	private Float cardOpacity;

	@Column(nullable = false)
	private Float opacity;

	@Column(nullable = false)
	private Integer blur;

	/** Number of icons placed in the background. */
	@Column(nullable = false)
	private Integer density;

	/** General icon size in pixels. */
	@Column(name = "base_size", nullable = false)
	private Integer baseSize;

	/** 0..1 — how often an icon is rendered notably larger than the rest. */
	@Column(name = "size_variation", nullable = false)
	private Float sizeVariation;

	/** Base colour the icons are tinted with. */
	@Column(name = "accent_color", nullable = false, length = 32)
	private String accentColor;

	/** 0..1 — fraction of icons rendered as darker shades of the accent. */
	@Column(name = "accent_variation", nullable = false)
	private Float accentVariation;

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	@Column(nullable = false)
	private Instant updatedAt;

	@PrePersist
	void onCreate() {
		Instant now = Instant.now();
		if (createdAt == null) {
			createdAt = now;
		}
		updatedAt = now;
	}

	@PreUpdate
	void onUpdate() {
		updatedAt = Instant.now();
	}
}
