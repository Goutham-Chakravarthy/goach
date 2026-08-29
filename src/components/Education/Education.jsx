"use client";

import React, { useRef, useEffect } from "react";
import { useLenis } from "lenis/react";
import "./Education.css";

export default function Education() {
  const containerRef = useRef(null);
  const pathRef = useRef(null);

  useLenis(({ scroll }) => {
    if (!containerRef.current || !pathRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Bounding scroll calculation
    const elementTop = rect.top + scroll;
    const scrollStart = elementTop - windowHeight;
    const scrollEnd = elementTop + rect.height;

    const progress = Math.max(0, Math.min(1, (scroll - scrollStart) / (scrollEnd - scrollStart)));
    const path = pathRef.current;
    const pathLength = path.getTotalLength();

    path.style.strokeDasharray = `${pathLength}`;
    path.style.strokeDashoffset = `${pathLength * (1 - progress)}`;
  });

  useEffect(() => {
    // Initial draw setup
    if (pathRef.current) {
      const pathLength = pathRef.current.getTotalLength();
      pathRef.current.style.strokeDasharray = `${pathLength}`;
      pathRef.current.style.strokeDashoffset = `${pathLength}`;
    }
  }, []);

  return (
    <div ref={containerRef} className="education-section">
      <section className="grid">
        <figure className="pos1">
          <img src="/photo1.jpg" alt="Edu 1" />
        </figure>

        <figure className="pos2">
          <img src="/photo2.jpg" alt="Edu 2" />
        </figure>

        <figure className="pos3">
          <img src="/photo3.jpg" alt="Edu 3" />
        </figure>

        <figure className="pos4">
          <img src="/photo4.jpg" alt="Edu 4" />
        </figure>

        <figure className="pos5">
          <img src="/photo5.jpg" alt="Edu 5" />
        </figure>
      </section>

      <svg
        width="1000"
        height="2000"
        viewBox="0 0 1000 2000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="squiggle"
      >
        <path
          ref={pathRef}
          d="M-24.5 101C285 315 5.86278 448.291 144.223 631.238C239.404 757.091 559.515 782.846 608.808 617.456C658.101 452.067 497.627 367.073 406.298 426.797C314.968 486.521 263.347 612.858 322.909 865.537C384.086 1125.06 79.3992 1007.94 100 1261.99C144.222 1807.35 819 1325 513 1142.5C152.717 927.625 -45 1916.5 1191.5 1852"
          stroke="#CD3C2F"
          strokeWidth="30"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
