"use client";

import { useState, useCallback } from "react";

export const useToggle = (initial = false) => {
  const [state, setState] = useState(initial);

  const toggle = useCallback(() => {
    setState((prev) => !prev);
  }, []);

  const setTrue = useCallback(() => setState(true), []);
  const setFalse = useCallback(() => setState(false), []);

  return {
    state,
    toggle,
    setTrue,
    setFalse,
  };
};