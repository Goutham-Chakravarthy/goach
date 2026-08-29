"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { SplitTextReplacement as SplitText } from "@/utils/splitText";
import { vertexShader, fragmentShader } from "./shaders.js";
import "./NavBar.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CONFIG = {
  color: "#ebf5df",
  spread: 0.5,
  speed: 2,
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    }
    : { r: 0.89, g: 0.89, b: 0.89 };
}

export default function NavBar() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const scrollProgressRef = useRef(0);
  const materialRef = useRef(null);

  // Lenis hook for scrolling
  useLenis(({ scroll }) => {
    if (!heroRef.current) return;
    const heroHeight = heroRef.current.offsetHeight;
    const windowHeight = window.innerHeight;
    const maxScroll = heroHeight - windowHeight;
    scrollProgressRef.current = Math.min((scroll / maxScroll) * CONFIG.speed, 1.1);
  });

  // WebGL Canvas Effect Setup
  useEffect(() => {
    if (!canvasRef.current || !heroRef.current) return;

    const canvas = canvasRef.current;
    const hero = heroRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
    });

    const resize = () => {
      if (!renderer || !hero) return;
      const width = hero.offsetWidth;
      const height = hero.offsetHeight;
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      if (materialRef.current) {
        materialRef.current.uniforms.uResolution.value.set(width, height);
      }
    };

    const rgb = hexToRgb(CONFIG.color);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uProgress: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(hero.offsetWidth, hero.offsetHeight),
        },
        uColor: { value: new THREE.Vector3(rgb.r, rgb.g, rgb.b) },
        uSpread: { value: CONFIG.spread },
      },
      transparent: true,
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    resize();
    window.addEventListener("resize", resize);

    let animationFrameId;
    const animate = () => {
      if (materialRef.current) {
        materialRef.current.uniforms.uProgress.value = scrollProgressRef.current;
      }
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // Text Animations
  useGSAP(
    () => {
      const heroH2 = containerRef.current.querySelector(".hero-content h2");
      if (!heroH2) return;

      const split = new SplitText(heroH2, { type: "words" });
      const words = split.words;

      gsap.set(words, { opacity: 0 });

      ScrollTrigger.create({
        trigger: ".hero-content",
        start: "top 25%",
        end: "bottom 100%",
        onUpdate: (self) => {
          const progress = self.progress;
          const totalWords = words.length;

          words.forEach((word, index) => {
            const wordProgress = index / totalWords;
            const nextWordProgress = (index + 1) / totalWords;

            let opacity = 0;

            if (progress >= nextWordProgress) {
              opacity = 1;
            } else if (progress >= wordProgress) {
              const fadeProgress =
                (progress - wordProgress) / (nextWordProgress - wordProgress);
              opacity = fadeProgress;
            }

            gsap.to(word, {
              opacity: opacity,
              duration: 0.1,
              overwrite: true,
            });
          });
        },
      });

      return () => {
        split.revert();
      };
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="navbar-animation">
      <section ref={heroRef} className="hero">
        <div className="hero-img">
          <img src="/hero-img.jpg" alt="Hero Morph" />
        </div>

        <div className="hero-header">
          <h1>Morphogenesis</h1>
          <p>Solid form gives way to liquid movement.</p>
        </div>

        <canvas ref={canvasRef} className="hero-canvas"></canvas>

        <div className="hero-content">
          <h2>
            An underlying field of motion pushes and pulls the image across its
            surface, redistributing pixels in a way that feels organic and
            constantly in flux.
          </h2>
        </div>
      </section>

      <section className="about">
        <p>
          This animation is driven by a real-time WebGL displacement process where
          interaction introduces force into the surface, causing form to bend,
          stretch, and reorganize dynamically. Rather than relying on fixed
          keyframes, the visual state evolves continuously, allowing motion to
          feel organic, responsive, and materially present as the page progresses.
        </p>
      </section>
    </div>
  );
}
