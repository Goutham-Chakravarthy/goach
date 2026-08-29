"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SplitTextReplacement as SplitText } from "@/utils/splitText";
import "./Hackathon1.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const slides = [
  {
    title:
      "Under the soft hum of streetlights she watches the world ripple through glass, her calm expression mirrored in the fragments of drifting light.",
    image: "/slider_img_1.jpg",
  },
  {
    title:
      "A car slices through the desert, shadow chasing the wind as clouds of dust rise behind, blurring the horizon into gold and thunder.",
    image: "/slider_img_2.jpg",
  },
  {
    title:
      "Reflections ripple across mirrored faces, each one a fragment of identity, caught between defiance, doubt, and the silence of thought.",
    image: "/slider_img_3.jpg",
  },
  {
    title:
      "Soft light spills through the café windows as morning settles into wood and metal, capturing the rhythm of quiet human routine.",
    image: "/slider_img_4.jpg",
  },
  {
    title:
      "Every serve becomes a battle between focus and instinct, movement flowing like rhythm as the court blurs beneath the sunlight.",
    image: "/slider_img_5.jpg",
  },
  {
    title:
      "Amber light spills over the stage as guitars cry into smoke and shadow, where music and motion merge into pure energy.",
    image: "/slider_img_6.jpg",
  },
  {
    title:
      "Dust erupts beneath his stride as sweat glints under floodlights, every step pushing closer to victory, grit, and pure determination.",
    image: "/slider_img_7.jpg",
  },
];

export default function Hackathon1() {
  const containerRef = useRef(null);
  const sliderRef = useRef(null);
  const imagesRef = useRef(null);
  const titleRef = useRef(null);
  const progressBarRef = useRef(null);
  const indicatorsRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const currentSplitRef = useRef(null);

  // Function to animate image and text transitions
  const animateSlideChange = (nextIndex) => {
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);

    // 1. Animate images
    const images = imagesRef.current.querySelectorAll("img");
    images.forEach((img, i) => {
      if (i === nextIndex) {
        gsap.to(img, {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto",
        });
      } else {
        gsap.to(img, {
          opacity: 0,
          scale: 1.1,
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    });

    // 2. Animate indicators
    if (indicatorsRef.current) {
      const indicatorElements = indicatorsRef.current.querySelectorAll(".marker-row");
      indicatorElements.forEach((el, i) => {
        const marker = el.querySelector(".marker");
        const indexEl = el.querySelector(".index");
        if (i === nextIndex) {
          gsap.to(indexEl, { opacity: 1, duration: 0.3 });
          gsap.to(marker, { scaleX: 1, duration: 0.3 });
        } else {
          gsap.to(indexEl, { opacity: 0.5, duration: 0.3 });
          gsap.to(marker, { scaleX: 0, duration: 0.3 });
        }
      });
    }

    // 3. Animate split texts
    if (titleRef.current) {
      if (currentSplitRef.current) {
        currentSplitRef.current.revert();
      }

      titleRef.current.innerHTML = `<h1>${slides[nextIndex].title}</h1>`;
      const heading = titleRef.current.querySelector("h1");
      const split = new SplitText(heading, {
        type: "lines",
        linesClass: "line",
      });
      currentSplitRef.current = split;

      gsap.set(split.lines, { yPercent: 100, opacity: 0 });
      gsap.to(split.lines, {
        yPercent: 0,
        opacity: 1,
        duration: 0.75,
        stagger: 0.1,
        ease: "power3.out",
      });
    }
  };

  useGSAP(
    () => {
      const pinDistance = window.innerHeight * slides.length;

      // Initialize slide 0 setup
      animateSlideChange(0);

      // ScrollTrigger to pin slider and calculate active indices
      ScrollTrigger.create({
        trigger: sliderRef.current,
        start: "top top",
        end: `+=${pinDistance}px`,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => {
          // Scale vertical progress bar
          if (progressBarRef.current) {
            gsap.set(progressBarRef.current, {
              scaleY: self.progress,
            });
          }

          const currentSlide = Math.floor(self.progress * slides.length);
          const clampedSlide = Math.max(0, Math.min(slides.length - 1, currentSlide));

          if (activeIndexRef.current !== clampedSlide) {
            animateSlideChange(clampedSlide);
          }
        },
      });

      return () => {
        if (currentSplitRef.current) {
          currentSplitRef.current.revert();
        }
      };
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="hackathon1-section">
      <section className="intro">
        <h1>
          Scroll to explore the rhythm of still images that move quietly between
          story and sensation.
        </h1>
      </section>

      <section ref={sliderRef} className="slider">
        <div ref={imagesRef} className="slider-images">
          {slides.map((slide, idx) => (
            <img
              key={idx}
              src={slide.image}
              alt={`Slide ${idx + 1}`}
              style={{ opacity: idx === 0 ? 1 : 0 }}
            />
          ))}
        </div>

        <div ref={titleRef} className="slider-title">
          <h1>{slides[0].title}</h1>
        </div>

        <div className="slider-indicator">
          <div ref={indicatorsRef} className="slider-indices">
            {slides.map((_, idx) => (
              <div key={idx} className="marker-row" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span className="marker"></span>
                <span className="index">{(idx + 1).toString().padStart(2, "0")}</span>
              </div>
            ))}
          </div>

          <div className="slider-progress-bar">
            <div ref={progressBarRef} className="slider-progress"></div>
          </div>
        </div>
      </section>

      <section className="outro">
        <h1>
          As the sequence slows the silence takes over, holding the last traces of
          motion in the air.
        </h1>
      </section>
    </div>
  );
}
