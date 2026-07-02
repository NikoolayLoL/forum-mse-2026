"use client";

import { useCallback, useEffect, useState } from "react";
import { Theme, type ThemeCustomization, type UpdateThemeRequest } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { DoodleBackground } from "@/components/DoodleBackground";
import { RangeField } from "@/components/RangeField";
import { FigureIcon } from "@/components/FigureIcon";
import { IconPickerModal } from "@/components/IconPickerModal";
import { randomUuid } from "@/lib/uuid";
import { rgba } from "@/lib/color";

type Target = "me" | "home";

export default function CustomizePage() {
  const me = useRequireAuth();
  const isAdmin = me?.role === "ADMIN";

  const [target, setTarget] = useState<Target>("me");
  const [draft, setDraft] = useState<UpdateThemeRequest | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (t: Target) => {
      if (!me) return;
      const theme = t === "home" ? await Theme.home() : await Theme.forUser(me.id);
      setDraft(toDraft(theme));
    },
    [me],
  );

  useEffect(() => {
    load(target).catch((e) => setError(e.message));
  }, [load, target]);

  function patch(p: Partial<UpdateThemeRequest>) {
    setDraft((d) => (d ? { ...d, ...p } : d));
    setStatus("idle");
  }

  async function save() {
    if (!draft || !me) return;
    setStatus("saving");
    setError(null);
    try {
      if (target === "home") await Theme.updateHome(draft);
      else await Theme.updateUser(me.id, draft);
      setStatus("saved");
    } catch (e: unknown) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Failed to save");
    }
  }

  if (!me || !draft) return <p className="text-neutral-500">Loading…</p>;

  // The live preview IS the page: the background renders the in-progress draft.
  const previewTheme: ThemeCustomization = {
    ...draft,
    scope: target === "home" ? "PAGE" : "USER",
  };

  return (
    <div className="space-y-5">
      <DoodleBackground theme={previewTheme} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Customize background</h1>
        {isAdmin && (
          <div className="inline-flex rounded-md border border-neutral-300 text-sm dark:border-neutral-700">
            <TargetTab active={target === "me"} onClick={() => setTarget("me")}>
              My page
            </TargetTab>
            <TargetTab active={target === "home"} onClick={() => setTarget("home")}>
              Home (main page)
            </TargetTab>
          </div>
        )}
      </div>

      <p className="max-w-prose text-sm text-neutral-600 dark:text-neutral-400">
        This page shows your changes live — the background behind these controls
        is exactly how {target === "home" ? "the main page" : "your page"} will look.
      </p>

      <div className="space-y-4 rounded-lg border border-neutral-200 bg-white/90 p-5 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90">
        {/* Icons */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Icons</span>
            <button
              onClick={() => setPickerOpen(true)}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Add / edit icons
            </button>
          </div>
          {draft.figures.length === 0 ? (
            <p className="text-sm text-neutral-500">No icons selected.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {draft.figures.map((name) => (
                <li
                  key={name}
                  className="flex items-center gap-1.5 rounded-full border border-neutral-300 py-1 pl-2.5 pr-1.5 text-sm dark:border-neutral-700"
                >
                  <FigureIcon name={name} size={16} />
                  <span>{name}</span>
                  <button
                    onClick={() => patch({ figures: draft.figures.filter((n) => n !== name) })}
                    aria-label={`Remove ${name}`}
                    className="grid h-5 w-5 place-items-center rounded-full text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800 dark:hover:bg-neutral-700"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Colours */}
        <div className="grid grid-cols-3 gap-4">
          <label className="block text-sm">
            <span className="mb-1 block">Background</span>
            <input
              type="color"
              value={draft.bgColor}
              onChange={(e) => patch({ bgColor: e.target.value })}
              className="h-9 w-full rounded-md border border-neutral-300 dark:border-neutral-700"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">Card</span>
            <input
              type="color"
              value={draft.cardColor}
              onChange={(e) => patch({ cardColor: e.target.value })}
              className="h-9 w-full rounded-md border border-neutral-300 dark:border-neutral-700"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">Accent</span>
            <input
              type="color"
              value={draft.accentColor}
              onChange={(e) => patch({ accentColor: e.target.value })}
              className="h-9 w-full rounded-md border border-neutral-300 dark:border-neutral-700"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <RangeField
            label="Background opacity"
            value={draft.bgOpacity}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => patch({ bgOpacity: v })}
            display={(v) => `${Math.round(v * 100)}%`}
          />
          <RangeField
            label="Card opacity"
            value={draft.cardOpacity}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => patch({ cardOpacity: v })}
            display={(v) => `${Math.round(v * 100)}%`}
          />
        </div>

        {/* Sample card preview */}
        <div
          className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800"
          style={{ backgroundColor: rgba(draft.cardColor, draft.cardOpacity) }}
        >
          <p className="text-sm font-semibold">Sample topic</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            This card shows your card colour over the background.
          </p>
        </div>

        {/* Numeric knobs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 flex items-center justify-between">
              <span>Density (icon count)</span>
            </span>
            <input
              type="number"
              min={0}
              max={300}
              value={draft.density}
              onChange={(e) => patch({ density: Number(e.target.value) })}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 dark:border-neutral-700 dark:bg-neutral-950"
            />
          </label>
          <RangeField
            label="Base size"
            value={draft.baseSize}
            min={12}
            max={96}
            step={1}
            onChange={(v) => patch({ baseSize: v })}
            display={(v) => `${v}px`}
          />
          <RangeField
            label="Size variation (bigger ones)"
            value={draft.sizeVariation}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => patch({ sizeVariation: v })}
            display={(v) => `${Math.round(v * 100)}%`}
          />
          <RangeField
            label="Accent variation (darker shades)"
            value={draft.accentVariation}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => patch({ accentVariation: v })}
            display={(v) => `${Math.round(v * 100)}%`}
          />
          <RangeField
            label="Opacity"
            value={draft.opacity}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => patch({ opacity: v })}
            display={(v) => `${Math.round(v * 100)}%`}
          />
          <RangeField
            label="Blur"
            value={draft.blur}
            min={0}
            max={12}
            step={1}
            onChange={(v) => patch({ blur: v })}
            display={(v) => `${v}px`}
          />
        </div>

        {/* Seed */}
        <div className="flex items-center justify-between gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <div className="min-w-0 text-sm">
            <span className="block text-neutral-500">Seed</span>
            <code className="block truncate text-xs">{draft.seed}</code>
          </div>
          <button
            onClick={() => patch({ seed: randomUuid() })}
            className="shrink-0 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            🎲 Randomize
          </button>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button
            onClick={save}
            disabled={status === "saving"}
            className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {status === "saving" ? "Saving…" : "Save"}
          </button>
          {status === "saved" && <span className="text-sm text-green-600">Saved.</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>

      <IconPickerModal
        open={pickerOpen}
        selected={draft.figures}
        onChange={(figures) => patch({ figures })}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}

function toDraft(t: ThemeCustomization): UpdateThemeRequest {
  return {
    seed: t.seed,
    figures: t.figures,
    bgColor: t.bgColor,
    bgOpacity: t.bgOpacity,
    cardColor: t.cardColor,
    cardOpacity: t.cardOpacity,
    opacity: t.opacity,
    blur: t.blur,
    density: t.density,
    baseSize: t.baseSize,
    sizeVariation: t.sizeVariation,
    accentColor: t.accentColor,
    accentVariation: t.accentVariation,
  };
}

function TargetTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 first:rounded-l-md last:rounded-r-md ${
        active ? "bg-indigo-600 text-white" : "text-neutral-600 dark:text-neutral-300"
      }`}
    >
      {children}
    </button>
  );
}
