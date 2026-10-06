"use client";

import React, { useContext, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Freezes the layout router context during exit animations so the
 * outgoing route component does not instantaneously change to the incoming route.
 */
function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const prevContext = useRef(context);

  return (
    <LayoutRouterContext.Provider value={prevContext.current}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  // Motion variants conforming strictly to Section 2 specification:
  // Initial: opacity 0, x: 24px
  // Animate: opacity 1, x: 0
  // Exit: opacity 0, x: -12px
  // Duration: 300ms, Easing: [0.22, 1, 0.36, 1] (easeOut)
  const variants = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, x: 24 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -12 },
      };

  const transition = shouldReduceMotion
    ? { duration: 0.15 }
    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={transition}
        className="w-full flex-1 min-w-0"
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
