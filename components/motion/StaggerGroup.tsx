"use client";

import { createContext, useContext } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { dur, ease, viewport } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Parent owns the trigger; children own nothing. A child that carries its own
 * `whileInView` breaks the sequence and re-triggers independently (§5.2), so
 * <StaggerItem /> reads its variants from context and never declares a
 * viewport of its own.
 */

const ReducedContext = createContext(false);

interface StaggerGroupProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds between children. 0.06–0.09 — slower reads as buffering. */
  stagger?: number;
  as?: "div" | "ul" | "ol" | "dl";
}

export function StaggerGroup({
  children,
  className,
  stagger = 0.07,
  as = "div",
}: StaggerGroupProps) {
  const isReduced = useReducedMotion() ?? false;
  const Component = motion[as];

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: isReduced ? 0 : stagger,
        delayChildren: isReduced ? 0 : 0.05,
      },
    },
  };

  return (
    <ReducedContext.Provider value={isReduced}>
      <Component
        className={cn(className)}
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        {children}
      </Component>
    </ReducedContext.Provider>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li";
}

export function StaggerItem({ children, className, as = "div" }: StaggerItemProps) {
  const isReduced = useContext(ReducedContext);
  const Component = motion[as];

  const item: Variants = isReduced
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: dur.base } },
      }
    : {
        hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: dur.reveal, ease: ease.out },
        },
      };

  return (
    <Component className={cn(className)} variants={item}>
      {children}
    </Component>
  );
}
