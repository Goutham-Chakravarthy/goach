"use client";

import React, { useState, useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";

import LoadingLP from "@/components/LoadingLP/LoadingLP";
import HeroPage from "@/components/HeroPage/HeroPage";
import NavBar from "@/components/NavBar/NavBar";
import Education from "@/components/Education/Education";
import Projects from "@/components/Projects/Projects";
import Experience from "@/components/Experience/Experience";
import Hackathon1 from "@/components/Hackathon1/Hackathon1";
import Footer from "@/components/Footer/Footer";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const lenis = useLenis();

  // Control scrolling based on preloader state
  useEffect(() => {
    if (!lenis) return;
    if (isLoading) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [isLoading, lenis]);

  return (
    <>
      {/* Set up Lenis smooth scrolling globally */}
      <ReactLenis root options={{ lerp: 0.1, duration: 1.5 }} />

      {/* Render preloader overlay */}
      {isLoading && <LoadingLP onComplete={() => setIsLoading(false)} />}

      {/* Main Portfolio Sections */}
      {!isLoading && (
        <main>
          {/* 2. Hero Page (Fluid Simulation) */}
          <HeroPage />

          {/* 3. Nav Bar (Morphogenesis WebGL Scroll Animation) */}
          <NavBar />

          {/* 4. Education (SVG flowing path) */}
          <Education />

          {/* 5. Projects (Gooey Text Reveal) */}
          <Projects />

          {/* 6. Experience (Ripple Displacement Slider) */}
          <Experience />

          {/* 7. Hackathon 1 (Ova Scroll Slider) */}
          <Hackathon1 />

          {/* 8. Footer (Interactive ASCII Hover) */}
          <Footer />
        </main>
      )}
    </>
  );
}
