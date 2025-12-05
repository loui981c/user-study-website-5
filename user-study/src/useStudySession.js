import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { META, EVENT_TARGETS, EVENT_TYPES, PAGES } from "./constants";
import { logEvent } from "./logger"; 

// --- Utility: shuffle array ---
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function useStudySession() {

  useEffect(() => {
    const continuing = step > -1;
    if (continuing && !sessionEnded) {
      logEvent(
        sessionId,
        step < order.length ? PAGES[order[step]].name : '',
        step,
        EVENT_TYPES.PAGE_RELOADED,
        EVENT_TARGETS.WINDOW
      );
    }
  }, []);

  // -----------------------------
  // 1) SESSION ID (persistent)
  // -----------------------------
  const [sessionId] = useState(() => {
    const saved = localStorage.getItem(META.SESSION_ID);
    if (saved) return saved;

    const newId = uuidv4();
    localStorage.setItem(META.SESSION_ID, newId);
    return newId;
  });

  // -----------------------------
  // 2) ORDER (persistent)
  // -----------------------------
  const [order] = useState(() => {
    const saved = localStorage.getItem(META.ORDER);
    if (saved) return JSON.parse(saved);

    const newOrder = shuffle([0, 1, 2]);
    localStorage.setItem(META.ORDER, JSON.stringify(newOrder));
    return newOrder;
  });

  // -----------------------------
  // 3) STEP (persistent)
  // -----------------------------
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem(META.STEP);
    if (saved !== null) {
      return Number(saved);
    }
    return -1;
  });

  // -----------------------------
  // 4) SHOW_CMP (persistent)
  // -----------------------------
  const [showCMP, setShowCMP] = useState(() => {
  const saved = localStorage.getItem(META.SHOW_CMP);
  if (saved !== null) {
    return saved === "true";
  }
    return true;
  });

  const [sessionStarted, setSessionStarted] = useState(() => {
    return localStorage.getItem(META.SESSION_STARTED) === "true";
  });

  const [sessionEnded, setSessionEnded] = useState(() => {
    return localStorage.getItem(META.SESSION_ENDED) === "true";
  });

  const [showValidationWarning, setShowValidationWarning] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Move to next step
  const nextStep = () => {
    setShowValidationWarning(false);

    if (step === -1 && !sessionStarted) {
      logEvent(
        sessionId,
        "",
        step,
        EVENT_TYPES.SESSION_STARTED,
        EVENT_TARGETS.WINDOW
      );
      setSessionStarted(true);
      localStorage.setItem(META.SESSION_STARTED, "true");
    }

    const newStep = step + 1;

    if (newStep < order.length) {
      setIsLoading(true);
      // fake delay
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    }

    setStep(newStep);
    localStorage.setItem(META.STEP, String(newStep));

    setShowCMP(true);
    localStorage.setItem(META.SHOW_CMP, "true");
  };

  // Optional: reset everything (useful for debugging)
  const resetSession = () => {
    localStorage.removeItem(META.SESSION_ID);
    localStorage.removeItem(META.ORDER);
    localStorage.removeItem(META.STEP);
    localStorage.removeItem(META.SHOW_CMP);
    localStorage.removeItem(META.SESSION_STARTED);
    localStorage.removeItem(META.SESSION_ENDED);
    window.location.reload();
  };

  return { 
    sessionId, 
    order, 
    step, 
    showCMP, 
    showValidationWarning,
    sessionEnded, 
    isLoading,
    setSessionEnded,
    setShowValidationWarning, 
    nextStep, 
    resetSession, 
    setShowCMP 
  };
}
