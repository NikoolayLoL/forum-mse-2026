"use client";

import { FIGURE_NAMES } from "./figureIcons";
import { FigureIcon } from "./FigureIcon";

/** A modal grid of all available figures; click to toggle selection. */
export function IconPickerModal({
  open,
  selected,
  onChange,
  onClose,
}: {
  open: boolean;
  selected: string[];
  onChange: (next: string[]) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  function toggle(name: string) {
    onChange(
      selected.includes(name)
        ? selected.filter((n) => n !== name)
        : [...selected, name],
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
          <h2 className="font-semibold">Choose icons</h2>
          <button onClick={onClose} className="text-sm text-neutral-500 hover:underline">
            Done
          </button>
        </div>

        <div className="grid max-h-[60vh] grid-cols-3 gap-2 overflow-y-auto p-4 sm:grid-cols-5">
          {FIGURE_NAMES.map((name) => {
            const isSelected = selected.includes(name);
            return (
              <button
                key={name}
                onClick={() => toggle(name)}
                title={name}
                className={`flex flex-col items-center gap-1 rounded-md border p-3 text-xs transition ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    : "border-neutral-200 text-neutral-600 hover:border-indigo-300 dark:border-neutral-700 dark:text-neutral-300"
                }`}
              >
                <FigureIcon name={name} size={26} />
                <span className="w-full truncate text-center">{name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
