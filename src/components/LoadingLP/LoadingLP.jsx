"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import CustomEase from "gsap/CustomEase";
import { SplitTextReplacement as SplitText } from "@/utils/splitText";
import "./LoadingLP.css";

// Register CustomEase
if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
}

export default function LoadingLP({ onComplete }) {
  const containerRef = useRef(null);
  const [preloaderComplete, setPreloaderComplete] = useState(false);
  const exitTlRef = useRef(null);

  useGSAP(
    () => {
      // Create Custom Eases
      CustomEase.create("hop", "0.9, 0, 0.1, 1");
      CustomEase.create("glide", "0.8, 0, 0.2, 1");

      const preloaderTexts = containerRef.current.querySelectorAll(".preloader p");
      const btnOutlineTrack = containerRef.current.querySelector(".stroke-track");
      const btnOutlineProgress = containerRef.current.querySelector(".stroke-progress");
      const svgPathLength = btnOutlineTrack ? btnOutlineTrack.getTotalLength() : 974;

      // Initialize Dash Arrays
      gsap.set([btnOutlineTrack, btnOutlineProgress], {
        strokeDasharray: svgPathLength,
        strokeDashoffset: svgPathLength,
      });

      // Split Text manually using SplitTextReplacement
      const textSplits = [];
      preloaderTexts.forEach((p) => {
        textSplits.push(
          new SplitText(p, {
            type: "lines",
            linesClass: "line",
          })
        );
      });

      const heroSplit = new SplitText(containerRef.current.querySelector(".hero h1"), {
        type: "words",
        wordsClass: "word",
      });

      const introTl = gsap.timeline({ delay: 1 });

      introTl
        .to(containerRef.current.querySelectorAll(".preloader .p-row p .line"), {
          y: "0%",
          duration: 0.75,
          ease: "power3.out",
          stagger: 0.1,
        })
        .to(
          btnOutlineTrack,
          {
            strokeDashoffset: 0,
            duration: 2,
            ease: "hop",
          },
          "<"
        )
        .to(
          containerRef.current.querySelector(".pbc-svg-strokes svg"),
          {
            rotation: 270,
            duration: 2,
            ease: "hop",
          },
          "<"
        );

      const progressStops = [0.2, 0.25, 0.85, 1].map((base, i) => {
        if (i === 3) return 1;
        return base + (Math.random() - 0.5) * 0.1;
      });

      progressStops.forEach((stop, i) => {
        introTl.to(btnOutlineProgress, {
          strokeDashoffset: svgPathLength - svgPathLength * stop,
          duration: 0.75,
          ease: "glide",
          delay: i === 0 ? 0.3 : 0.3 + Math.random() * 0.2,
        });
      });

      introTl
        .to(
          "#pbc-logo",
          {
            opacity: 0,
            duration: 0.35,
            ease: "power1.out",
          },
          "-=0.25"
        )
        .to(
          ".preloader-btn-container",
          {
            scale: 0.9,
            duration: 1.5,
            ease: "hop",
          },
          "-=0.5"
        )
        .to(
          "#pbc-label .line",
          {
            y: "0%",
            duration: 0.75,
            ease: "power3.out",
            onComplete: () => {
              setPreloaderComplete(true);
            },
          },
          "-=0.75"
        );

      // Cleanup
      return () => {
        textSplits.forEach((split) => split.revert());
        heroSplit.revert();
      };
    },
    { scope: containerRef }
  );

  const handleEngage = () => {
    if (!preloaderComplete || exitTlRef.current) return;
    setPreloaderComplete(false);

    const btnOutlineTrack = containerRef.current.querySelector(".stroke-track");
    const btnOutlineProgress = containerRef.current.querySelector(".stroke-progress");
    const svgPathLength = btnOutlineTrack ? btnOutlineTrack.getTotalLength() : 974;

    const exitTl = gsap.timeline();
    exitTlRef.current = exitTl;

    exitTl
      .to(".preloader", {
        scale: 0.75,
        duration: 1.25,
        ease: "hop",
      })
      .to(
        [btnOutlineTrack, btnOutlineProgress],
        {
          strokeDashoffset: -svgPathLength,
          duration: 1.25,
          ease: "hop",
        },
        "<"
      )
      .to(
        "#pbc-label .line",
        {
          y: "-100%",
          duration: 0.75,
          ease: "power3.out",
        },
        "-=1.25"
      )
      .to(
        "#pbc-outro-label .line",
        {
          y: "0%",
          duration: 0.75,
          ease: "power3.out",
        },
        "-=0.75"
      )
      .to(".preloader", {
        clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
        duration: 1.5,
        ease: "hop",
      })
      .to(
        ".preloader-revealer",
        {
          clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
          duration: 1.5,
          ease: "hop",
          onComplete: () => {
            gsap.set(".preloader", { display: "none" });
            gsap.set(".preloader-backdrop", { display: "none" });
            if (onComplete) onComplete();
          },
        },
        "-=1.45"
      )
      .to(".hero", {
        scale: 1,
        duration: 1.25,
        ease: "hop",
      })
      .to(
        ".hero h1 .word",
        {
          y: "0%",
          duration: 1,
          ease: "glide",
          stagger: 0.05,
        },
        "-=1.75"
      );
  };

  return (
    <div ref={containerRef} className="loading-lp">
      <div className="preloader-backdrop">
        <div className="pb-row">
          <div className="pb-col">
            <p>ARC//117 Delta Trace</p>
            <p>ARC//117 Delta Trace</p>
            <p>ARC//117 Delta Trace</p>
            <p>ARC//117 Delta Trace</p>
            <p>ARC//117 Delta Trace</p>
          </div>
          <div className="pb-col">
            <p>Sector / Hollow Frame</p>
            <p>0.392 02SD 008923</p>
          </div>
          <div className="pb-col">
            <p>Material / Unknown Fiber</p>
            <p>Status / Soft Resonance</p>
          </div>
          <div className="pb-col">
            <img id="pb-logo" src="/logo.png" alt="Logo" />
          </div>
          <div className="pb-col">
            <p>:::..:::.::::..:::</p>
          </div>
        </div>

        <div className="pb-row">
          <div className="pb-col">
            <p>Surface Memory</p>
          </div>
          <div className="pb-col">
            <p>// / / ///// / / / ///</p>
          </div>
          <div className="pb-col">
            <p>Phase Offset &gt; 17%</p>
          </div>
          <div className="pb-col">
            <p>Fragments Aligning</p>
            <p>Pattern Emerging</p>
          </div>
          <div className="pb-col">
            <p>Collapse Pending</p>
            <p>Return -- Layer Zero</p>
          </div>
          <div className="pb-col">
            <p>F-9</p>
          </div>
        </div>
      </div>

      <div className="preloader">
        <div className="p-row">
          <p>Initiating</p>
        </div>
        <div className="p-row">
          <div className="p-col">
            <div className="p-sub-col">
              <p>Phase 01</p>
              <p>Sequence</p>
            </div>
            <div className="p-sub-col">
              <p>Signal Scan</p>
              <p>07 Layers</p>
            </div>
          </div>
          <div className="p-col">
            <p>PX-17</p>
          </div>
        </div>

        <div className="preloader-btn-container" onClick={handleEngage}>
          <img id="pbc-logo" src="/logo-light.png" alt="Logo Light" />
          <p id="pbc-label">Engage</p>
          <p id="pbc-outro-label">Access Granted</p>

          <div className="pbc-svg-strokes">
            <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle
                className="stroke-track"
                cx="160"
                cy="160"
                r="155"
                stroke="#2b2b2b"
                strokeWidth="2"
                strokeDasharray="974"
                strokeDashoffset="974"
              />
              <circle
                className="stroke-progress"
                cx="160"
                cy="160"
                r="155"
                stroke="#fff"
                strokeWidth="2"
                strokeDasharray="974"
                strokeDashoffset="974"
              />
            </svg>
          </div>
        </div>
      </div>

      <section className="hero">
        <div className="preloader-revealer"></div>
        <h1>The system is now visible</h1>
      </section>
    </div>
  );
}
