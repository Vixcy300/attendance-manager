"use client";

import { CinematicFooter } from "@/components/ui/motion-footer";
import NotFoundPage from "@/components/ui/page-not-found";

export default function Demo() {
  return (
    <div className="relative w-full bg-background min-h-screen font-sans selection:bg-white/20 overflow-x-hidden">
      {/* 
        MAIN CONTENT AREA 
        We use a high z-index and minimum height to allow the user 
        to scroll down and reveal the footer securely underneath.
      */}
      <main className="relative z-10 w-full min-h-[120vh] bg-background flex flex-col items-center justify-center text-white border-b border-white/10 shadow-md rounded-b-3xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.03)_0%,transparent_60%)] pointer-events-none" />
        
        <h1 className="text-4xl md:text-5xl font-light tracking-[0.2em] text-neutral-400 mb-8 uppercase text-center px-4">
          Scroll down to reveal
        </h1>
        
        <div className="w-[1px] h-32 bg-gradient-to-b from-neutral-400 to-transparent" />
      </main>

      {/* The Cinematic Footer is injected here */}
      <CinematicFooter />
    </div>
  );
}

const DemoOne = () => {
  return (
    <div className="flex w-full h-screen justify-center items-center">
      <NotFoundPage />
    </div>
  );
};

export { DemoOne };