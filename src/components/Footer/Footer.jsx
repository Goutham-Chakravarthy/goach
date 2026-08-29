"use client";

import React, { useEffect, useRef } from "react";
import "./Footer.css";

const CELL_SIZE = 8;
const CELL_GAP = 3;
const CELL_STEP = CELL_SIZE + CELL_GAP;
const ASCII_COLOR = "#dadada";
const ASCII_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const BRIGHTNESS_THRESHOLD = 0.5;
const ASCII_MIN_WIDTH = 1000;
const HOVER_RADIUS = 10;
const HOVER_PUSH = 7;
const HOVER_EASE = 0.1;
const SCATTER_RANGE = 20;
const SCATTER_EASE = 0.075;
const GRAVITY = 0.05;
const BOUNCE = 0.25;
const RESET_EASE = 0.05;
const STAGGER_FRAMES = 18;

export default function Footer() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const logoRef = useRef(null);

  const stateRef = useRef({
    phase: "logo",
    cursor: { col: -999, row: -999 },
    gridCols: 0,
    gridRows: 0,
    asciiCells: [],
    animationId: null
  });

  useEffect(() => {
    if (!canvasRef.current || !logoRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const logo = logoRef.current;
    const container = containerRef.current;
    const context = canvas.getContext("2d");
    const pixelRatio = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const state = stateRef.current;

    const randomAsciiChar = () => {
      return ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];
    };

    const buildAsciiFromLogo = () => {
      if (window.innerWidth < ASCII_MIN_WIDTH) {
        state.asciiCells = [];
        return;
      }

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      state.gridCols = Math.floor(width / CELL_STEP);
      state.gridRows = Math.floor(height / CELL_STEP);

      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const logoRect = logo.getBoundingClientRect();
      // Calculate coordinates relative to container
      const localLeft = logoRect.left - rect.left;
      const localTop = logoRect.top - rect.top;

      const sampler = document.createElement("canvas");
      sampler.width = state.gridCols;
      sampler.height = state.gridRows;
      const samplerContext = sampler.getContext("2d");
      samplerContext.drawImage(
        logo,
        localLeft / CELL_STEP,
        localTop / CELL_STEP,
        logoRect.width / CELL_STEP,
        logoRect.height / CELL_STEP
      );
      const { data } = samplerContext.getImageData(0, 0, state.gridCols, state.gridRows);

      const litCells = new Set();
      for (let row = 0; row < state.gridRows; row++) {
        for (let col = 0; col < state.gridCols; col++) {
          const pixel = (row * state.gridCols + col) * 4;
          const alpha = data[pixel + 3] / 255;
          const brightness =
            ((data[pixel] * 0.299 +
              data[pixel + 1] * 0.587 +
              data[pixel + 2] * 0.114) /
              255) *
            alpha;

          if (brightness > BRIGHTNESS_THRESHOLD) {
            litCells.add(`${col},${row}`);
            litCells.add(`${col + 1},${row}`);
          }
        }
      }

      state.asciiCells = [];
      for (const key of litCells) {
        const [col, row] = key.split(",").map(Number);
        state.asciiCells.push({
          col,
          row,
          char: randomAsciiChar(),
          offsetX: 0,
          offsetY: 0,
          fallSpeed: 0,
          wait: 0,
          scatterX: (Math.random() - 0.5) * SCATTER_RANGE,
          scatterY: (Math.random() - 0.5) * SCATTER_RANGE,
        });
      }
    };

    const easeToward = (cell, targetX, targetY, ease) => {
      cell.offsetX += (targetX - cell.offsetX) * ease;
      cell.offsetY += (targetY - cell.offsetY) * ease;
    };

    const staggerCells = () => {
      for (const cell of state.asciiCells) {
        cell.wait = Math.floor(Math.random() * STAGGER_FRAMES);
      }
    };

    const updateAsciiCells = () => {
      let everyoneHome = state.phase === "returning";

      for (const cell of state.asciiCells) {
        if (cell.wait > 0) {
          cell.wait--;
          everyoneHome = false;
          continue;
        }

        if (state.phase === "scattered") {
          easeToward(cell, cell.scatterX, cell.scatterY, SCATTER_EASE);
        } else if (state.phase === "fallen") {
          const floorOffset = state.gridRows - 1 - cell.row;
          cell.fallSpeed += GRAVITY;
          cell.offsetY += cell.fallSpeed;

          if (cell.offsetY > floorOffset) {
            cell.offsetY = floorOffset;
            cell.fallSpeed *= -BOUNCE;
          }
        } else if (state.phase === "returning") {
          easeToward(cell, 0, 0, RESET_EASE);
          if (Math.abs(cell.offsetX) > 0.05 || Math.abs(cell.offsetY) > 0.05) {
            everyoneHome = false;
          }
        } else {
          let targetX = 0;
          let targetY = 0;
          const distX = cell.col - state.cursor.col;
          const distY = cell.row - state.cursor.row;
          const distance = Math.sqrt(distX * distX + distY * distY);

          if (distance < HOVER_RADIUS && distance > 0) {
            const push = (1 - distance / HOVER_RADIUS) * HOVER_PUSH;
            targetX = (distX / distance) * push;
            targetY = (distY / distance) * push;
          }
          easeToward(cell, targetX, targetY, HOVER_EASE);
        }
      }

      if (everyoneHome) state.phase = "logo";
    };

    const drawAscii = () => {
      const rect = container.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);
      context.font = `${CELL_SIZE + 2}px monospace`;
      context.textBaseline = "top";
      context.textAlign = "center";
      context.fillStyle = ASCII_COLOR;

      for (const { col, row, char, offsetX, offsetY } of state.asciiCells) {
        const x = (col + offsetX) * CELL_STEP + CELL_SIZE / 2;
        const y = (row + offsetY) * CELL_STEP;
        context.fillText(char, x, y);
      }
    };

    const renderLoop = () => {
      if (state.asciiCells.length > 0) {
        updateAsciiCells();
        drawAscii();
      }
      state.animationId = requestAnimationFrame(renderLoop);
    };

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      state.cursor.col = (event.clientX - rect.left) / CELL_STEP;
      state.cursor.row = (event.clientY - rect.top) / CELL_STEP;
    };

    const handleClick = () => {
      if (state.asciiCells.length === 0) return;

      if (state.phase === "logo") {
        state.phase = "scattered";
        staggerCells();
      } else if (state.phase === "scattered") {
        state.phase = "fallen";
        for (const cell of state.asciiCells) cell.fallSpeed = 0;
      } else if (state.phase === "fallen") {
        state.phase = "returning";
        staggerCells();
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("click", handleClick);
    window.addEventListener("resize", buildAsciiFromLogo);

    logo.addEventListener("load", buildAsciiFromLogo);
    if (logo.complete) {
      buildAsciiFromLogo();
    }

    renderLoop();

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("click", handleClick);
      window.removeEventListener("resize", buildAsciiFromLogo);
      if (state.animationId) {
        cancelAnimationFrame(state.animationId);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="footer-section">
      <footer>
        <canvas ref={canvasRef}></canvas>
        <img ref={logoRef} src="/footer-logo.png" alt="Footer Logo" />
      </footer>
    </div>
  );
}
