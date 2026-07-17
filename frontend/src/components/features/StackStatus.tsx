import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type ConnState = "checking" | "online" | "offline";

const LAYERS = [
  {
    step: "01",
    label: "Client",
    detail: "React 19 · TypeScript · Tailwind v4 · Motion",
  },
  {
    step: "02",
    label: "API",
    detail: "NestJS · REST · class-validator",
  },
  {
    step: "03",
    label: "Database",
    detail: "PostgreSQL · Prisma",
  },
];

export function StackStatus() {
  const [state, setState] = useState<ConnState>("checking");
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    api
      .health()
      .then(() => !cancelled && setState("online"))
      .catch(() => !cancelled && setState("offline"));
    return () => {
      cancelled = true;
    };
  }, []);

  const pillCopy: Record<ConnState, string> = {
    checking: "checking connection…",
    online: "backend connected",
    offline: "backend not reachable — run the API locally",
  };

  const pillColor: Record<ConnState, string> = {
    checking: "bg-ink-soft",
    online: "bg-accent",
    offline: "bg-warn",
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center gap-2 font-mono text-xs text-ink-soft">
        <span
          className={`h-2 w-2 rounded-full ${pillColor[state]} ${
            state === "online" && !prefersReducedMotion ? "animate-pulse" : ""
          }`}
        />
        {pillCopy[state]}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {LAYERS.map((layer, i) => (
          <motion.div
            key={layer.step}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
            className="relative rounded-lg border border-line bg-canvas-raised p-5"
          >
            <span className="font-mono text-xs text-accent">{layer.step}</span>
            <h3 className="mt-2 font-display text-lg font-semibold text-ink">
              {layer.label}
            </h3>
            <p className="mt-1 text-sm text-ink-soft">{layer.detail}</p>

            {i < LAYERS.length - 1 && (
              <span
                className="absolute top-1/2 -right-4 hidden h-px w-4 bg-line sm:block"
                aria-hidden
              >
                <motion.span
                  className="absolute inset-y-0 left-0 w-1.5 rounded-full bg-accent"
                  animate={
                    prefersReducedMotion || state !== "online"
                      ? undefined
                      : { x: [0, 12, 0] }
                  }
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
