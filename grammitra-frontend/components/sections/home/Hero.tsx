"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useTranslation } from "@/shared/i18n/useTranslation";
import { searchSkills, bestSkillMatch } from "@/features/gram-mitra/utils/skillSearch";
import { mapSkillKey } from "@/features/gram-mitra/utils/translationMapper";

export default function Hero() {
  const router = useRouter();
  const { t, lang } = useTranslation();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [focused, setFocused] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listboxId = "hero-search-listbox";

  // Reactive matches — local computation over 39 skills, no debounce needed.
  const matches = useMemo(() => searchSkills(query, 8), [query]);
  const hasMatches = matches.length > 0;
  const showDropdown = open && query.trim().length > 0;

  // Reset active highlight when the matches list changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Outside click closes dropdown
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!lang) return null;

  const navigateToSkill = (skill: string) => {
    setOpen(false);
    setQuery("");
    const slug = skill.replace(/\s+/g, "-");
    router.push(`/services/${encodeURIComponent(slug)}`);
  };

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }

    // Prefer the currently-highlighted match if dropdown is open
    if (showDropdown && hasMatches) {
      navigateToSkill(matches[activeIndex]?.skill ?? matches[0].skill);
      return;
    }

    const best = bestSkillMatch(trimmed);
    if (best) {
      navigateToSkill(best);
      return;
    }

    toast.error(
      `${t("home.noMatch", { query: trimmed })} ${t("home.noMatchHint")}`
    );
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      if (hasMatches) setActiveIndex((i) => (i + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (hasMatches)
        setActiveIndex((i) => (i - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const translateSkill = (skill: string) => {
    const key = mapSkillKey(skill);
    const translated = t(key);
    return translated === key ? skill : translated;
  };

  // Highlight the matched substring inside a suggestion label
  const renderHighlighted = (label: string) => {
    const q = query.trim();
    if (!q) return label;
    const idx = label.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return label;
    return (
      <>
        {label.slice(0, idx)}
        <span className="font-bold text-[var(--primary)]">
          {label.slice(idx, idx + q.length)}
        </span>
        {label.slice(idx + q.length)}
      </>
    );
  };

  return (
    <section className="relative h-[90vh] flex items-center justify-center text-white overflow-hidden">

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/40 z-10" />

      {/* CONTENT */}
      <div className="relative z-20 text-center px-6 max-w-3xl w-full">

        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          {t("home.title")}
        </h1>

        <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed">
          {t("home.subtitle")}
        </p>

        {/* SEARCH COMBOBOX */}
        <div ref={wrapperRef} className="relative">
          <div
            className={[
              "flex flex-col sm:flex-row",
              // Fully opaque card so the dark hero overlay can't bleed
              // through and wash out typed text.
              "bg-[var(--card)]",
              "rounded-2xl overflow-hidden",
              "border border-[var(--border)]",
              "transition-[box-shadow,border-color] duration-200",
              focused
                ? "shadow-[0_12px_40px_rgba(0,0,0,0.35),0_0_0_4px_var(--ring)] border-[var(--primary)]"
                : "shadow-[0_10px_30px_rgba(0,0,0,0.25)]",
              showDropdown
                ? "rounded-b-none sm:rounded-bl-2xl sm:rounded-br-none"
                : "",
            ].join(" ")}
          >
            <div className="flex-1 flex items-center gap-3 px-4 sm:px-6">
              <span
                aria-hidden
                className="text-[var(--primary)] text-lg shrink-0"
              >
                🔍
              </span>
              <input
                ref={inputRef}
                role="combobox"
                aria-expanded={showDropdown}
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={
                  showDropdown && hasMatches
                    ? `${listboxId}-opt-${activeIndex}`
                    : undefined
                }
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => {
                  setOpen(true);
                  setFocused(true);
                }}
                onBlur={() => setFocused(false)}
                onKeyDown={onKeyDown}
                placeholder={t("home.placeholder")}
                spellCheck={false}
                autoComplete="off"
                className="
                  flex-1 py-4
                  bg-transparent
                  text-[var(--text)] font-medium
                  caret-[var(--primary)]
                  placeholder:text-[var(--text-soft)]
                  placeholder:font-normal
                  outline-none
                  text-base sm:text-[15px]
                "
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="
                    shrink-0
                    text-[var(--text-soft)] hover:text-[var(--text)]
                    text-sm w-7 h-7 grid place-items-center
                    rounded-full
                    hover:bg-[var(--bg)]
                    border border-transparent hover:border-[var(--border)]
                    transition
                  "
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="
                bg-[var(--primary)] hover:bg-[var(--primary-hover)]
                text-white px-8 py-4 font-semibold
                focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70
                transition
              "
            >
              {t("home.search")}
            </button>
          </div>

          {/* SUGGESTIONS DROPDOWN */}
          {showDropdown && (
            <ul
              id={listboxId}
              role="listbox"
              className="
                absolute left-0 right-0 top-full
                bg-[var(--card)] border border-t-0 border-[var(--border)]
                rounded-b-2xl shadow-[0_20px_40px_rgba(0,0,0,0.25)]
                max-h-[60vh] overflow-y-auto
                text-left z-30
                animate-fadeIn
              "
            >
              {hasMatches ? (
                matches.map((m, i) => {
                  const active = i === activeIndex;
                  return (
                    <li
                      key={m.skill}
                      id={`${listboxId}-opt-${i}`}
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setActiveIndex(i)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => navigateToSkill(m.skill)}
                      className={[
                        "flex items-center gap-3 px-5 py-3 cursor-pointer",
                        "text-sm border-l-2",
                        "transition-colors",
                        active
                          ? "bg-[var(--primary-soft)] text-[var(--primary)] font-semibold border-[var(--primary)]"
                          : "text-[var(--text)] border-transparent hover:bg-[var(--bg)]",
                      ].join(" ")}
                    >
                      <span aria-hidden className="text-base">🔧</span>
                      <span className="flex-1 capitalize">
                        {renderHighlighted(translateSkill(m.skill))}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
                        ↵
                      </span>
                    </li>
                  );
                })
              ) : (
                <li
                  role="option"
                  aria-selected="false"
                  className="px-5 py-4 text-sm text-[var(--text-soft)] text-center"
                >
                  {t("home.noMatch", { query })}
                  <br />
                  <span className="text-xs text-[var(--text-muted)]">
                    {t("home.noMatchHint")}
                  </span>
                </li>
              )}
            </ul>
          )}
        </div>

        <p className="mt-4 text-sm text-white/80">
          {t("home.trust")}
        </p>
      </div>
    </section>
  );
}
