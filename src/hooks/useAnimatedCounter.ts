// hooks/useAnimatedCounter.ts
'use client';

import { animate } from "framer-motion";
import { useEffect, useRef } from "react";

// The 'to' value can be a number or string
type CounterProps = {
  to: number | string;
};

export function useAnimatedCounter({ to }: CounterProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const from = 0; // Always start counting from 0

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Controls allow us to stop the animation if the component unmounts
    const controls = animate(from, Number(to), {
      duration: 2,
      // Here is the fix: use a valid string alias for easing
      ease: "easeOut", 
      onUpdate(value) {
        // Update the text content of the node with the animated value
        node.textContent = Math.round(value).toString();
      },
    });

    // Cleanup function to stop the animation when the component is no longer on screen
    return () => controls.stop();
  }, [to]); // Rerun the animation if the 'to' value changes

  return ref;
}