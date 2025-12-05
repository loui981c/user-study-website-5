import CMP from "./CMP";
import { PAGES, EVENT_TYPES, EVENT_TARGETS, META } from "./constants";
import { useStudySession } from "./useStudySession";
import { useIsScreenTooSmall } from "./useIsScreenTooSmall";
import { logEvent } from "./logger";
import SessionIdField from "./CopyIdField";
import { useEffect, useState } from "react";

function Main() {
  const { 
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
    setShowCMP } = useStudySession();
  const tooSmall = useIsScreenTooSmall();

  const [dotIndex, setDotIndex] = useState(0);

  const dotsVariants = [".", "..", "...", "..", "."];

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setDotIndex((prev) => (prev + 1) % dotsVariants.length);
    }, 300);

    return () => clearInterval(interval);
  }, [isLoading, dotsVariants.length]);

  useEffect(() => {
    // SESSION START is in nextStep func
    switch (true) {
      // NORMAL CMP PAGES
      case step >= 0 && step < order.length:
        logEvent(
          sessionId,
          PAGES[order[step]].name,
          step,
          EVENT_TYPES.PAGE_LOADED,
          EVENT_TARGETS.WINDOW
        );
        break;

      // SESSION END
      case step >= order.length && !sessionEnded:
        logEvent(
          sessionId,
          "",
          step,
          EVENT_TYPES.SESSION_ENDED,
          EVENT_TARGETS.WINDOW
        );
        setSessionEnded(true);
        localStorage.setItem(META.SESSION_ENDED, "true");
        break;

      default:
        break;
    }
  }, [sessionId, step, order, sessionEnded, setSessionEnded]);

  function handleCMPEvent(eventTarget) {
    logEvent(
      sessionId,
      currentPage.name,
      step,
      EVENT_TYPES.CMP_CLOSED,
      eventTarget
    );

    setShowCMP(false);
    setShowValidationWarning(false);
    localStorage.setItem(META.SHOW_CMP, "false");
  }

  if (tooSmall) {
    logEvent(sessionId, '', step, EVENT_TYPES.PAGE_TOO_SMALL, EVENT_TARGETS.WINDOW);
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">Screen Size Too Small</h1>
          <p className="text-lg">
            This study is only optimized for laptop or desktop screens.  
            Please resize your window or switch to a larger device to continue.
          </p>
        </div>
      </div>
    );
  }

  // TIME-BASED LOADING SCREEN (between pages)
  if (isLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-white">
        <p className="text-4xl font-semibold mb-1">Loading next website</p>
        <p className="text-4xl tracking-widest">
          {dotsVariants[dotIndex]}
        </p>
      </div>
    );
  }

  // INTRO PAGE
  if (step === -1) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-xl">
          <h1 className="text-4xl font-bold mb-6">Welcome to the Study</h1>
          <p className="text-lg mb-6">
            You will be shown 3 websites where you will be prompted to make your consent choices as you go. 
            In the end of the study, you will find your secret code that is to be copied and pasted into the Prolific survey.
          </p>

          <button
            className="px-6 py-3 bg-black text-white rounded-lg"
            onClick={nextStep}
          >
            Start The Study
          </button>
        </div>
      </div>
    );
  }

  // FINISH PAGE
  if (step >= order.length) {
    console.log(step)
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="text-4xl font-bold">Thank you for completing the study!</h1>

        <p className="text-lg mb-6">
          You have reached the final step of the study. To finish the survey on Prolific, please copy the id below and paste it into the survey.
        </p>

        <SessionIdField className="" sessionId={sessionId} />
        
        {/* <button
          className="h-10 px-4 bg-red-600 text-white rounded"
          onClick={resetSession}
        >
          RESET
        </button> */}
      </div>
    );
  }

  const currentIndex = order[step];
  const currentPage = PAGES[currentIndex];

  // NORMAL CMP PAGE
  return (
    <div className="w-screen h-screen flex flex-col">
    {/* IMAGE + CMP CENTERED */}
    <div className="relative flex-1 flex items-center justify-center"
        onClick={() =>
          logEvent(
            sessionId,
            currentPage.name,
            step,
            EVENT_TYPES.CLICK,
            EVENT_TARGETS.OUTSIDE_CMP
          )
        }>
      <img
        src={currentPage.image}
        alt={currentPage.name}
        className="absolute inset-0 w-full h-full object-cover -z-10"
      />

    {showCMP && (
      <CMP
        className="z-10"
        sessionId={sessionId}
        siteName={currentPage.name}
        index={step}
        onClose={(eventTarget) => handleCMPEvent(eventTarget)}
      />
    )}
  </div>

  {/* WARNING IF NO CHOICE MADE */}
  {showValidationWarning && (
    <div className="absolute top-4 w-full -translate-x-1/2 z-30"
      onClick={(e) => e.stopPropagation()}>
      <div className="bg-red-600 text-white px-4 py-2 rounded shadow-lg flex justify-center items-center">
        <span>You must make a consent choice before continuing.</span>
        <button
          className="text-white font-bold ml-4 bg-black border-none cursor-pointer hover:bg-slate-500"
          onClick={() => setShowValidationWarning(false)}
        >
          X
        </button>
      </div>
    </div>
  )}

  {/* BOTTOM BUTTONS */}
  <div className="py-2 flex justify-center gap-4 bg-white/50 backdrop-blur-sm">
    <button
      className="h-10 px-4 bg-black text-white rounded"
      onClick={(e) => {
        e.stopPropagation()
        if (showCMP) {
          setShowValidationWarning(true);

          logEvent(
            sessionId,
            currentPage.name,
            step,
            EVENT_TYPES.VALIDATION_FAILED,
            EVENT_TARGETS.NEXT_BUTTON
          );
        } else {
          logEvent(
            sessionId,
            currentPage.name,
            step,
            EVENT_TYPES.BUTTON_CLICK,
            EVENT_TARGETS.NEXT_BUTTON
          );
          nextStep();
        }
      }}
    >
      Go To Next Page
    </button>

    {/* <button
      className="h-10 px-4 bg-red-600 text-white rounded"
      onClick={resetSession}
    >
      RESET
    </button> */}
  </div>
</div>
  );
}

export default Main;
