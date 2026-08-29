"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitTextReplacement as SplitText } from "@/utils/splitText";
import { vertexShader, fragmentShader } from "./shaders.js";
import "./Experience.css";

const slides = [
  {
    title: "Blackwater '91",
    description:
      "Flickering lanterns and twisted masks welcome unwanted visitors into a strange celebration beyond the forest trail.",
    image: "/slider-img-1.jpg",
  },
  {
    title: "Crimson Theory",
    description:
      "A mysterious performer slowly loses reality beneath violent lights and unsettling mirrored reflections inside an empty theater.",
    image: "/slider-img-2.jpg",
  },
  {
    title: "Tape Delay Archives",
    description:
      "Stacks of dusty videotapes and glowing static fill the room during another endless night without a single moment of sleep.",
    image: "/slider-img-3.jpg",
  },
  {
    title: "Exit 14 Westbound",
    description:
      "Heavy rain crashes against the windshield as terrified passengers race through midnight highways without knowing who follows.",
    image: "/slider-img-4.jpg",
  },
];

const rippleConfig = {
  waveFreq: 25.0,
  wavePow: 0.035,
  waveWidth: 0.5,
  falloff: 10.0,
  boostStrength: 0.5,
  crossfadeWidth: 0.05,
  duration: 3.0,
  endValue: 1.0,
  ease: "power2.out",
};

export default function Experience() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const textRef = useRef(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const [displayIdx, setDisplayIdx] = useState(0); // tracks rendered text

  const stateRef = useRef({
    textures: [],
    currentIndex: 0,
    isTransitioning: false,
    rippleTween: null,
    material: null,
  });

  // Split Text Animations helper
  const animateText = (direction, element, onComplete) => {
    if (!element) return;
    const heading = element.querySelector("h1");
    const desc = element.querySelector("p");

    const splitTitle = new SplitText(heading, {
      type: "words, chars",
      charsClass: "char",
    });
    const splitDesc = new SplitText(desc, {
      type: "lines",
      linesClass: "line",
    });

    const chars = splitTitle.chars || [];
    const lines = splitDesc.lines || [];

    const tl = gsap.timeline({
      onComplete: () => {
        splitTitle.revert();
        splitDesc.revert();
        if (onComplete) onComplete();
      },
    });

    if (direction === "out") {
      tl.to(chars, {
        y: "-100%",
        duration: 0.6,
        stagger: 0.02,
        ease: "power2.inOut",
      }).to(
        lines,
        { y: "-100%", duration: 0.6, stagger: 0.02, ease: "power2.inOut" },
        0.1
      );
    } else {
      gsap.set([chars, lines], { y: "100%" });
      tl.to(chars, {
        y: "0%",
        duration: 0.5,
        stagger: 0.02,
        ease: "power2.inOut",
      }).to(
        lines,
        { y: "0%", duration: 0.5, stagger: 0.05, ease: "power2.out" },
        0.1
      );
    }
  };

  // Handle slide transition on click
  const transition = () => {
    const state = stateRef.current;
    if (state.isTransitioning || state.textures.length === 0) return;
    state.isTransitioning = true;

    if (state.rippleTween) {
      state.rippleTween.kill();
      state.material.uniforms.uProgress.value = 0.0;
      state.rippleTween = null;
    }

    const nextIndex = (state.currentIndex + 1) % slides.length;

    // Set shaders textures
    state.material.uniforms.uTexCurrent.value = state.textures[state.currentIndex];
    state.material.uniforms.uTexNext.value = state.textures[nextIndex];
    state.material.uniforms.uProgress.value = 0.0;

    let clickUnlocked = false;

    state.rippleTween = gsap.to(state.material.uniforms.uProgress, {
      value: rippleConfig.endValue,
      duration: rippleConfig.duration,
      ease: rippleConfig.ease,
      delay: 0.3,
      onUpdate() {
        if (!clickUnlocked && state.material.uniforms.uProgress.value > 0.7) {
          clickUnlocked = true;
          state.currentIndex = nextIndex;
          state.isTransitioning = false;
          setActiveIdx(nextIndex);
        }
      },
      onComplete() {
        state.material.uniforms.uTexCurrent.value = state.textures[state.currentIndex];
        state.material.uniforms.uProgress.value = 0.0;
        state.rippleTween = null;

        if (!clickUnlocked) {
          state.currentIndex = nextIndex;
          state.isTransitioning = false;
          setActiveIdx(nextIndex);
        }
      },
    });

    // Animate text out, update indices, and animate text back in
    animateText("out", textRef.current, () => {
      setDisplayIdx(nextIndex);
      requestAnimationFrame(() => {
        animateText("in", textRef.current);
      });
    });
  };

  // Three.js & Shader Setup
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.01, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.prepend(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const textures = [];

    // Load textures
    const loadPromises = slides.map(
      (slide) =>
        new Promise((resolve) => {
          textureLoader.load(slide.image, (tex) => {
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            textures.push(tex);
            resolve();
          });
        })
    );

    const getMaxCornerDist = () => {
      const ratio = window.innerHeight / window.innerWidth;
      const cx = 0.5;
      const cy = 0.5 * ratio;
      return Math.sqrt(cx * cx + cy * cy);
    };

    const handleResize = () => {
      if (!renderer || !container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      uniforms.uResolution.value.set(width, height);
      uniforms.uMobile.value = window.innerWidth <= 1000 ? 1.0 : 0.0;
      rippleConfig.endValue = getMaxCornerDist() + rippleConfig.waveWidth;
      rippleConfig.duration = window.innerWidth <= 1000 ? 1.5 : 3.0;
    };

    let uniforms;
    let plane;

    Promise.all(loadPromises).then(() => {
      stateRef.current.textures = textures;

      uniforms = {
        uTexCurrent: { value: textures[0] },
        uTexNext: { value: textures[1] || textures[0] },
        uProgress: { value: 0.0 },
        uResolution: { value: new THREE.Vector2() },
        uImageRes: { value: new THREE.Vector2(1920, 1280) },
        uWaveFreq: { value: rippleConfig.waveFreq },
        uWavePow: { value: rippleConfig.wavePow },
        uWaveWidth: { value: rippleConfig.waveWidth },
        uFalloff: { value: rippleConfig.falloff },
        uBoostStrength: { value: rippleConfig.boostStrength },
        uCrossfadeWidth: { value: rippleConfig.crossfadeWidth },
        uMobile: { value: window.innerWidth <= 1000 ? 1.0 : 0.0 },
      };

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
      });
      stateRef.current.material = material;

      plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
      scene.add(plane);

      handleResize();
      window.addEventListener("resize", handleResize);
    });

    let animationId;
    const render = () => {
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(render);
    };
    render();

    // Initial text entry animation
    setTimeout(() => {
      animateText("in", textRef.current);
    }, 500);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      scene.clear();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  const slide = slides[displayIdx];

  return (
    <div ref={containerRef} className="experience-section">
      <div className="slider" onClick={transition}>
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

        <div ref={textRef} className="slide-content">
          <div className="slide-title">
            <h1>{slide.title}</h1>
          </div>
          <div className="slide-description">
            <p>{slide.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
