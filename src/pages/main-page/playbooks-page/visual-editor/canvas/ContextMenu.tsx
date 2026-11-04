import { IconChevronRight } from "@tabler/icons-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Icon, ThemeSize } from "@/components";

import {
  ContextMenuItem,
  ContextMenuList,
  ContextMenuSeparator,
  ContextMenuSurface,
  SubmenuTrigger,
} from "./ContextMenu.styles";
import { placeContextMenu, placeSubmenu } from "./menuPosition";

type ContextMenuAction =
  | { type: "separator" }
  | {
      type: "item";
      label: string;
      disabled?: boolean;
      onSelect: () => void;
    };

type Submenu = {
  type: "submenu";
  label: string;
  entries: ContextMenuAction[];
};

export type ContextMenuEntry = ContextMenuAction | Submenu;

export type ContextMenuState = {
  x: number;
  y: number;
  entries: ContextMenuEntry[];
};

type ContextMenuProps = {
  menu?: ContextMenuState;
  onClose: () => void;
};

const MenuEntries = ({
  entries,
  onClose,
}: {
  entries: ContextMenuEntry[];
  onClose: () => void;
}) => (
  <ContextMenuList>
    {entries.map((entry, index) => {
      if (entry.type === "separator")
        return <ContextMenuSeparator key={`separator-${index}`} />;
      if (entry.type === "submenu")
        return (
          <ContextSubmenu key={entry.label} entry={entry} onClose={onClose} />
        );
      return (
        <ContextMenuItem
          key={entry.label}
          type="button"
          disabled={entry.disabled}
          onClick={() => {
            onClose();
            entry.onSelect();
          }}
        >
          {entry.label}
        </ContextMenuItem>
      );
    })}
  </ContextMenuList>
);

const ContextSubmenu = ({
  entry,
  onClose,
}: {
  entry: Submenu;
  onClose: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const show = () => {
    clearTimeout(closeTimer.current);
    const submenu = ref.current;
    const trigger = triggerRef.current;
    const parent = trigger?.closest("[popover]");
    if (!submenu || !trigger || !parent || submenu.matches(":popover-open")) return;

    submenu.showPopover();
    const box = submenu.getBoundingClientRect();
    const firstItemOffset =
      (submenu.firstElementChild?.getBoundingClientRect().top ?? box.top) -
      box.top;
    const { left, top } = placeSubmenu(
      parent.getBoundingClientRect(),
      trigger.getBoundingClientRect().top - firstItemOffset,
      box,
      { width: innerWidth, height: innerHeight },
    );
    submenu.style.left = `${left}px`;
    submenu.style.top = `${top}px`;
  };
  const hide = () => {
    clearTimeout(closeTimer.current);
    ref.current?.hidePopover();
  };
  const scheduleHide = () => {
    clearTimeout(closeTimer.current);
    // Allow diagonal pointer travel into a submenu, including when it flips left.
    closeTimer.current = setTimeout(hide, 180);
  };

  return (
    <div onMouseEnter={show} onMouseLeave={scheduleHide}>
      <SubmenuTrigger ref={triggerRef} type="button" $open={open} onClick={show}>
        <span>{entry.label}</span>
        <Icon $icon={IconChevronRight} $size={ThemeSize.Small} />
      </SubmenuTrigger>
      <ContextMenuSurface
        ref={ref}
        popover="auto"
        onToggle={(event) => {
          if (event.target === event.currentTarget)
            setOpen(event.currentTarget.matches(":popover-open"));
        }}
      >
        <MenuEntries entries={entry.entries} onClose={onClose} />
      </ContextMenuSurface>
    </div>
  );
};

/** Canvas context menu. It closes on Escape, and the native popover closes it on an outside click. */
export const ContextMenu: React.FC<ContextMenuProps> = ({ menu, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  // A layout effect, so the menu is measured and placed before it is painted.
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!menu) {
      if (element.matches(":popover-open")) element.hidePopover();
      return;
    }

    if (!element.matches(":popover-open")) {
      element.showPopover();
      element.focus();
    }
    element.querySelectorAll<HTMLElement>("[popover]:popover-open")
      .forEach((submenu) => submenu.hidePopover());

    const { left, top } = placeContextMenu(
      menu,
      element.getBoundingClientRect(),
      { width: innerWidth, height: innerHeight },
    );
    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  }, [menu]);

  return (
    <ContextMenuSurface
      ref={ref}
      popover="auto"
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      onToggle={(event) => {
        if (!event.currentTarget.matches(":popover-open")) onClose();
      }}
    >
      {menu && <MenuEntries entries={menu.entries} onClose={onClose} />}
    </ContextMenuSurface>
  );
};
