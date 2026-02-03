import { Copy } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";

import { Button } from "./Button";
import Icon from "./Icon";
import { ThemeSize } from "./utils";

export interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  $text: string;
}

/**
 * Small icon-only button to copy text to clipboard.
 * @param $text - The text to copy to clipboard.
 * @param title - The tooltip/title for the button (default: "Copy").
 * @param disabled - Whether the button is disabled (default: false).
 * @example
 * <CopyButton $text="Some text to copy" />
 */
export const CopyButton: React.FC<CopyButtonProps> = ({
  $text,
  disabled = false,
  ...rest
}) => {


  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || !$text) return;

    try {
      await navigator.clipboard.writeText($text);
      toast.success("Copied to clipboard");
    } catch (err) {
      console.error("Copy failed", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Button
      type="button"
      $ghost
      $size={ThemeSize.Small}
      onClick={handleClick}
      disabled={disabled}
      {...rest}
    >
      <Icon $icon={Copy} $size={ThemeSize.Small} />
    </Button>
  );
};

export default CopyButton;
