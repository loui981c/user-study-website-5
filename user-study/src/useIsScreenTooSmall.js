import { useState, useEffect } from "react";

export function useIsScreenTooSmall() {
  const [tooSmall, setTooSmall] = useState(window.innerWidth < 1024);

  useEffect(() => {
    function handleResize() {
      setTooSmall(window.innerWidth < 1024);
    }
    window.addEventListener("resize", handleResize);
  }, []);

  return tooSmall;
}