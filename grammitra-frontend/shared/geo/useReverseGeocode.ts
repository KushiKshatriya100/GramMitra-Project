"use client";

import { useEffect, useState } from "react";
import { reverseGeocode, GeocodedAddress } from "./reverseGeocode";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; address: GeocodedAddress }
  | { status: "error" };

interface Options {
  /** Skip resolution entirely (e.g. when a human-typed location is already shown) */
  enabled?: boolean;
  /** Language for Nominatim results */
  lang?: "en" | "hi";
}

/**
 * Resolves a lat/lng pair to a readable city/area label.
 * Skips the network call entirely when `enabled` is false.
 */
export function useReverseGeocode(
  lat: number | undefined,
  lng: number | undefined,
  { enabled = true, lang = "en" }: Options = {}
) {
  const [state, setState] = useState<State>({ status: "idle" });

  useEffect(() => {
    if (!enabled) {
      setState({ status: "idle" });
      return;
    }
    if (!Number.isFinite(lat ?? NaN) || !Number.isFinite(lng ?? NaN)) {
      setState({ status: "idle" });
      return;
    }
    if (lat === 0 && lng === 0) {
      setState({ status: "idle" });
      return;
    }

    const ctrl = new AbortController();
    setState({ status: "loading" });

    reverseGeocode(lat as number, lng as number, {
      signal: ctrl.signal,
      lang,
    }).then((res) => {
      if (ctrl.signal.aborted) return;
      if (res) setState({ status: "ready", address: res });
      else setState({ status: "error" });
    });

    return () => ctrl.abort();
  }, [enabled, lat, lng, lang]);

  return state;
}
