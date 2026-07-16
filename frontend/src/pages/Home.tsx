import { motion, useReducedMotion } from "motion/react";
import { StackStatus } from "@/components/StackStatus";
import { SignalLog } from "@/components/SignalLog";
import Sidebar from "@/components/Nav/Sidebar.tsx";
import Topbar from "@/components/Nav/Topbar.tsx";

export function Home() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <main className="flex flex-col h-screen ">
      <Topbar/>
      <div className='flex h-full'>
      <Sidebar/>
        <div className='mx-auto max-w-3xl pt-4'>
          <motion.header
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-mono text-xs uppercase tracking-widest text-accent">
              Full-stack starter
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              React talks to Nest.
              <br />
              Nest talks to Postgres.
            </h1>
            <p className="mt-4 max-w-lg text-ink-soft">
              This page is wired end-to-end: the panel below pings the API's{" "}
              <code className="font-mono text-sm">/health</code> route, and the log
              beneath it reads and writes real rows through Prisma.
            </p>
          </motion.header>

          <section className="mt-12">
            <StackStatus />
          </section>

          <section className="mt-6">
            <SignalLog />
          </section>
        </div>
      </div>
    </main>
  );
}
