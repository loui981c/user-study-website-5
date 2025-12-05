import React, { useState, useEffect } from "react";
import { logEvent } from "./logger";
import { EVENT_TARGETS, EVENT_TYPES, META } from "./constants";

// Helper function to load consent history
const loadHistory = () => {
  try {
    const historyString = localStorage.getItem(META.CONSENT_HISTORY) || "{}";
    return JSON.parse(historyString);
  } catch (error) {
    console.error("Error loading consent history from local storage:", error);
    return {};
  }
};

// Helper function to format choice string
const formatChoice = (choice) => {
  switch (choice) {
    case "ACCEPT_ALL": return "Accepted All";
    case "REJECT_ALL": return "Rejected All";
    case "CUSTOM": return "Custom Preferences";
    case "RETRACTED": return "Consent Retracted";
    default: return choice;
  }
}

function ConsentHistory({ sessionId, currentPage, step, autoShow, setAutoShow }) {
  // Use local state to manage the panel when it's opened/closed manually
  const [showPanel, setShowPanel] = useState(false);
  // Use state to track the history and re-render on retraction
  const [history, setHistory] = useState(loadHistory); 

  // EFFECT to handle automatic opening of the panel
  useEffect(() => {
    if (autoShow) {
        // Only open the panel if it's not already open
        if (!showPanel) {
            // No log needed here, as the log happened when the CMP closed
            setHistory(loadHistory());
            setShowPanel(true);
        }
        // Immediately reset the autoShow flag so subsequent renders don't re-open it
        // and the user can close it manually.
        setAutoShow(false); 
    }
  }, [autoShow, showPanel, setAutoShow]);


  const handlePanelToggle = () => {
    const isOpening = !showPanel;
    logEvent(
      sessionId,
      currentPage.name,
      step,
      isOpening ? EVENT_TYPES.HISTORY_PANEL_OPEN : EVENT_TYPES.HISTORY_PANEL_CLOSE,
      EVENT_TARGETS.ICON_CONSENT_HISTORY
    );
    setShowPanel(isOpening);
    // Reload history every time the panel opens manually
    if (isOpening) {
        setHistory(loadHistory());
    }
  };

  const handleRetractConsent = (siteName, currentChoice) => {
    // 1. Log the event
    logEvent(
      sessionId,
      siteName,
      step,
      EVENT_TYPES.CONSENT_RETRACTED,
      EVENT_TARGETS.BTN_RETRACT_CONSENT
    );

    // 2. Update Local Storage with 'RETRACTED' choice
    const updatedHistory = {
      ...history,
      [siteName]: {
        ...history[siteName],
        choice: "RETRACTED",
        retractionTimestamp: new Date().toISOString(),
      },
    };
    try {
        localStorage.setItem(META.CONSENT_HISTORY, JSON.stringify(updatedHistory));
    } catch (error) {
        console.error("Error saving consent history to local storage:", error);
    }

    // 3. Update component state to re-render the button
    setHistory(updatedHistory);
  };

  if (!showPanel) {
    // Floating History Icon Button
    return (
      <div 
        className="fixed bottom-6 right-6 bg-blue-600 text-white w-16 h-16 flex items-center justify-center rounded-full shadow-xl cursor-pointer hover:bg-blue-700 transition-colors duration-200 z-50"
        onClick={handlePanelToggle}
        title="View Consent History"
      >
        <span className="text-3xl">&#x21BB;</span> 
      </div>
    );
  }

  return (
    <div 
      className="fixed bottom-0 right-0 w-80 h-auto max-h-[90%] bg-white border border-gray-300 shadow-2xl rounded-tl-lg p-6 z-50 transform transition-transform duration-300 ease-out"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <h3 className="text-2xl font-semibold text-gray-800">Consent History</h3>
        <button 
          className="text-gray-500 hover:text-gray-800 text-3xl font-light leading-none" 
          onClick={handlePanelToggle}
          aria-label="Close"
        >
          &times;
        </button>
      </div>
      
      <div className="pt-4 max-h-[calc(90vh-100px)] overflow-y-auto space-y-4">
        {Object.keys(history).length === 0 ? (
          <p className="text-gray-500 italic">No consent choices recorded yet. Make a choice on a website to see it here.</p>
        ) : (
          <ul className="space-y-3">
            {Object.entries(history).map(([siteName, data]) => {
              const retracted = data.choice === "RETRACTED";
              
              return (
                <li 
                  key={siteName} 
                  className={`p-3 rounded-lg shadow-sm transition-all border ${retracted ? 'bg-red-50 border-red-300' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
                >
                  <p className="font-bold text-lg mb-1 text-gray-900">{siteName.toUpperCase()}</p>
                  
                  <div className="text-sm">
                    <p className="text-gray-700">
                      Choice: <span className={`font-medium ${retracted ? 'text-red-600' : 'text-green-600'}`}>{formatChoice(data.choice)}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {retracted ? "Retracted on: " : "Chosen on: "}
                      {new Date(data.retractionTimestamp || data.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <button
                    className={`mt-3 w-full h-9 text-white rounded text-sm font-semibold transition-colors duration-150 ${
                      retracted 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                    onClick={() => !retracted && handleRetractConsent(siteName, data.choice)}
                    disabled={retracted}
                  >
                    {retracted ? "Consent Retracted" : "Retract Consent"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ConsentHistory;