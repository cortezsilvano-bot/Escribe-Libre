"use client";

import clsx from "clsx";
import { Check } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type MenuEntry =
  | { kind: "separator" }
  | {
      kind?: "item";
      label: string;
      icon?: ReactNode;
      shortcut?: string;
      keyshortcuts?: string;
      disabled?: boolean;
      checked?: boolean;
      onSelect: () => void;
    };

export type Menu = {
  id: string;
  label: string;
  entries: MenuEntry[];
};

/**
 * The editor menu bar. Each menu owns its own entries; opening one closes the
 * others, and once a menu is open, hovering a sibling switches to it the way a
 * desktop menu bar does.
 */
export function MenuBar({ menus }: { menus: Menu[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!openId) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenId(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenId(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openId]);

  return (
    <nav aria-label="Document menu" className="upgrade-menu-row" ref={navRef}>
      {menus.map((menu) => {
        const isOpen = openId === menu.id;

        return (
          <div className="menu-wrap" key={menu.id}>
            <button
              aria-expanded={isOpen}
              aria-haspopup="true"
              className={clsx("menu-link", isOpen && "active")}
              onClick={() => setOpenId(isOpen ? null : menu.id)}
              onMouseEnter={() => setOpenId((current) => (current === null ? current : menu.id))}
              type="button"
            >
              {menu.label}
            </button>

            {isOpen ? (
              <div aria-label={menu.label} className="menu-popover">
                {menu.entries.map((entry, index) =>
                  entry.kind === "separator" ? (
                    <hr key={`separator-${index}`} />
                  ) : (
                    <button
                      aria-keyshortcuts={entry.keyshortcuts}
                      disabled={entry.disabled}
                      key={entry.label}
                      onClick={() => {
                        setOpenId(null);
                        entry.onSelect();
                      }}
                      type="button"
                    >
                      {entry.icon ? entry.icon : null}
                      {entry.label}
                      {entry.checked ? <Check aria-hidden="true" className="menu-check" size={14} /> : null}
                      {entry.shortcut ? <kbd aria-hidden="true">{entry.shortcut}</kbd> : null}
                    </button>
                  ),
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
