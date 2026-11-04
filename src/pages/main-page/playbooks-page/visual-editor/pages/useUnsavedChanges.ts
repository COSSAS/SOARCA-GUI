import { useCallback, useEffect, useRef } from "react";
import { useBlocker } from "react-router";

export const useUnsavedChanges = (hasChanges: boolean) => {
  const saved = useRef(false);
  const blocker = useBlocker(
    useCallback(() => hasChanges && !saved.current, [hasChanges]),
  );

  useEffect(() => {
    if (!hasChanges) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (saved.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [hasChanges]);

  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (window.confirm("You have unsaved changes. Leave without saving?"))
      blocker.proceed();
    else blocker.reset();
  }, [blocker]);

  return () => {
    saved.current = true;
  };
};
