import { useCallback } from "react";

export const useInputRestriction = (type, customPattern) => {
  const isAllowedKey = (key) =>
    ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(key);

  const getPattern = useCallback(() => {
    switch (type) {
      case "number":
        return /^\d$/;
      case "alphabet":
        return /^[a-zA-Z\s]$/;
      case "alphanumeric":
        return /^[a-zA-Z0-9\s]$/;
      case "custom":
        return customPattern;
      default:
        return null;
    }
  }, [type, customPattern]);

  const onKeyDown = useCallback(
    (e) => {
      const key = e.key;
      const pattern = getPattern();

      if (isAllowedKey(key) || !pattern) return;
      if (!pattern.test(key)) {
        e.preventDefault();
      }
    },
    [getPattern],
  );

  const onPaste = useCallback(
    (e) => {
      const paste = e.clipboardData.getData("text");
      const pattern = getPattern();

      if (!pattern || pattern.test(paste)) return;

      if (
        (type === "custom" && !customPattern.test(paste)) ||
        (type !== "custom" && ![...paste].every((ch) => pattern.test(ch)))
      ) {
        e.preventDefault();
      }
    },
    [getPattern, type, customPattern],
  );

  return { onKeyDown, onPaste };
};
