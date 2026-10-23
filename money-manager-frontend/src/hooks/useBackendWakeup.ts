import { useEffect, useState, useRef, useCallback } from "react";
import API_URL from "../config/api";

export type BackendStatus = "idle" | "waking" | "ready" | "error";

const COLD_START_THRESHOLD_MS = 1200;
const READY_BADGE_DURATION_MS = 3000;
const KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutos (600,000 ms)
const WAKEUP_RETRY_DELAY_MS = 4000;
const MAX_WAKEUP_RETRIES = 15;

export const useBackendWakeup = () => {
  const [status, setStatus] = useState<BackendStatus>("idle");
  const isMounted = useRef(true);
  const wasWakingRef = useRef(false);

  const pingHealth = useCallback(async (isInitialBoot: boolean, attempt = 0): Promise<boolean> => {
    let slowTimer: ReturnType<typeof setTimeout> | null = null;

    if (isInitialBoot && attempt === 0) {
      slowTimer = setTimeout(() => {
        if (isMounted.current) {
          wasWakingRef.current = true;
          setStatus("waking");
        }
      }, COLD_START_THRESHOLD_MS);
    }

    try {
      const response = await fetch(`${API_URL}/health`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (slowTimer) clearTimeout(slowTimer);

      if (response.ok) {
        if (isMounted.current) {
          if (wasWakingRef.current) {
            setStatus("ready");
            wasWakingRef.current = false;
            setTimeout(() => {
              if (isMounted.current) {
                setStatus("idle");
              }
            }, READY_BADGE_DURATION_MS);
          } else {
            setStatus("idle");
          }
        }
        return true;
      }
      throw new Error(`Health status ${response.status}`);
    } catch {
      if (slowTimer) clearTimeout(slowTimer);

      if (!isMounted.current) return false;

      if (isInitialBoot && attempt < MAX_WAKEUP_RETRIES) {
        wasWakingRef.current = true;
        setStatus("waking");
        await new Promise((resolve) => setTimeout(resolve, WAKEUP_RETRY_DELAY_MS));
        if (!isMounted.current) return false;
        return pingHealth(true, attempt + 1);
      }

      if (isInitialBoot) {
        setStatus("error");
      }
      return false;
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    // 1. Petición inmediata de arranque (Wake-Up) al entrar en la app
    pingHealth(true, 0);

    // 2. Ciclo de mantenimiento (Keep-Alive) fijo cada 10 minutos
    const intervalId = setInterval(() => {
      pingHealth(false, 0);
    }, KEEP_ALIVE_INTERVAL_MS);

    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
    };
  }, [pingHealth]);

  return { status };
};
