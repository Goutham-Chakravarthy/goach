"use client";
import "./AnimatedCopy.css";
import React, { useRef } from "react";

import gsap from "gsap";
import { SplitTextReplacement as SplitText } from "@/utils/splitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const BLUR_START = "blur(0.35em)";
const BLUR_END = "blur(0em)";

function wrapLineForBlur(line) {
  const inner = document.createElement("span");
  inner.className = "line-inner";

  while (line.firstChild) {
    inner.appendChild(line.firstChild);
  }

  line.appendChild(inner);
  return inner;
}

export default function AnimatedCopy({
  children,
  mode = "default",
  delay = 0,
}) {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      let targets = [];
      if (containerRef.current.hasAttribute("data-copy-wrapper")) {
        targets = Array.from(containerRef.current.children);
      } else {
        targets = [containerRef.current];
      }

      const splits = [];
      const blurLayers = [];

      targets.forEach((target) => {
        const split = SplitText.create(target, {
          type: "lines",
          linesClass: "line",
        });

        split.lines.forEach((line) => {
          blurLayers.push(wrapLineForBlur(line));
        });

        splits.push(split);
      });

      gsap.set(blurLayers, { filter: BLUR_START });

      if (mode === "scrub") {
        gsap.to(blurLayers, {
          filter: BLUR_END,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            end: "bottom 75%",
            scrub: true,
          },
        });
      } else if (mode === "scroll") {
        gsap.to(blurLayers, {
          filter: BLUR_END,
          duration: 1.5,
          ease: "power3.out",
          stagger: 0.1,
          delay: delay,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            once: true,
          },
        });
      } else {
        gsap.to(blurLayers, {
          filter: BLUR_END,
          duration: 1.5,
          ease: "power3.out",
          stagger: 0.1,
          delay: delay,
        });
      }

      return () => {
        splits.forEach((split) => split.revert());
      };
    },
    { scope: containerRef, dependencies: [mode, delay] },
  );

  if (React.Children.count(children) === 1) {
    return React.cloneElement(children, { ref: containerRef });
  }

  return (
    <div ref={containerRef} data-copy-wrapper="true">
      {children}
    </div>
  );
}
