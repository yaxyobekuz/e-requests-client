import { useState, useEffect, useRef } from "react";

/**
 * Animates a number from 0 to target with an ease-out curve.
 * @param {number} target - The final value to animate to.
 * @param {boolean} active - Starts animation when true.
 * @param {number} [duration=1200] - Animation duration in milliseconds.
 * @returns {number} Animated numeric value.
 */
const useCountUp = (target, active, duration = 1200) => {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active || !target) {
      setValue(0);
      return;
    }

    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((target * eased).toFixed(1)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, active, duration]);

  return value;
};

export default useCountUp;
