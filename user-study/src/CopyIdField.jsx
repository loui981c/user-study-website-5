import { useState } from "react";

function SessionIdField({ sessionId }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy sessionId:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex">
        <input
          type="text"
          value={sessionId}
          readOnly
          className="w-72 px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50 cursor-default"
        />

        <button
          type="button"
          onClick={handleCopy}
          className="px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-400"
        >
          Copy
        </button>
      </div>

      <div className="flex">
        {copied && (
          <span className="text-s text-green-600">
            Copied!
          </span>
        )}
      </div>
    </div>
  );
}

export default SessionIdField;
