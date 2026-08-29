"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { FluidSimulation } from "./FluidSimulation";
import "./HeroPage.css";

export default function HeroPage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const config = {
      simResolution: 256,
      dyeResolution: 1024,
      curl: 50,
      pressureIterations: 40,
      velocityDissipation: 0.95,
      dyeDissipation: 0.95,
      splatRadius: 0.3,
      forceStrength: 8.5,
      pressureDecay: 0.75,
      threshold: 1.0,
      edgeSoftness: 0.0,
      inkColor: new THREE.Color(1, 1, 1),
    };

    const sim = new FluidSimulation(canvasRef.current, config);

    return () => {
      sim.destroy();
    };
  }, []);

  return (
    <div className="hero-page">
      <section className="hero">
        <div className="header">
          <h1>Fluid System In</h1>
          <h1>Constant Field</h1>
          <h1>Of Interaction</h1>
        </div>
      </section>

      <canvas ref={canvasRef} id="fluid"></canvas>
    </div>
  );
}
