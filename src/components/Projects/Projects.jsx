"use client";

import React from "react";
import AnimatedCopy from "../AnimatedCopy/AnimatedCopy";
import GooeyFilter from "../GooeyFilter/GooeyFilter";
import "./Projects.css";

export default function Projects() {
  return (
    <div className="projects-section">
      <GooeyFilter />

      <section className="hero">
        <AnimatedCopy delay={1}>
          <h1>The Weight of Old Light</h1>
        </AnimatedCopy>
      </section>

      <div className="banner-img">
        <img src="/images/img1.jpg" alt="Artwork 1" />
      </div>

      <section className="room">
        <AnimatedCopy mode="scroll">
          <h3>
            Before the camera, there was only the patient hand. Pigment ground
            by candlelight, flesh rendered warm against a dark that swallows
            everything at the edges of the frame.
          </h3>
        </AnimatedCopy>

        <AnimatedCopy mode="scroll">
          <h3>
            This is a room of Spanish shadow: gods caught mid-argument, men
            caught mid-breath. Each canvas holds a single suspended moment,
            stretched thin across four centuries, still refusing to look away
            from us the way we refuse to look away from it.
          </h3>
        </AnimatedCopy>
      </section>

      <div className="banner-img">
        <img src="/images/img2.jpg" alt="Artwork 2" />
      </div>

      <section className="index">
        <AnimatedCopy mode="scrub">
          <h1>Ground Pigment</h1>
          <h1>Falling Shadow</h1>
          <h1>Warm Flesh</h1>
          <h1>Suspended Gesture</h1>
          <h1>Held Silence</h1>
        </AnimatedCopy>
      </section>

      <div className="banner-img">
        <img src="/images/img3.jpg" alt="Artwork 3" />
      </div>

      <section className="collection">
        <AnimatedCopy mode="scrub">
          <h3>
            We collect the paintings that hold their breath. The wine that never
            spills from a tilted cup, the note that never finishes leaving the
            reed, the eye that has been watching the same doorway since 1628.
            Every frame in this room is a single second refusing to end, and we
            spend our days deciding which of those seconds deserves a wall.
          </h3>
        </AnimatedCopy>
      </section>

      <div className="banner-img">
        <img src="/images/img4.jpg" alt="Artwork 4" />
      </div>

      <section className="outro">
        <AnimatedCopy mode="scroll">
          <h1>Step Closer</h1>
        </AnimatedCopy>
      </section>
    </div>
  );
}
