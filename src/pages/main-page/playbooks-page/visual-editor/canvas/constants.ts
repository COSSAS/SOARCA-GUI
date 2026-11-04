import { IconHelp } from "@tabler/icons-react";

import { ThemeVariant } from "@/components";

/** Drag data type of a step dragged from the palette onto the canvas. */
export const STEP_TYPE_MIME = "application/x-cacao-step-type";

export const FIT_VIEW_OPTIONS = { maxZoom: 1 };
export const ANIMATED_FIT_VIEW_OPTIONS = { ...FIT_VIEW_OPTIONS, duration: 300 };

/** Look of a step whose type the spec does not know. */
export const UNKNOWN_STEP_COLOR = ThemeVariant.Warning;
export const UNKNOWN_STEP_ICON = IconHelp;
