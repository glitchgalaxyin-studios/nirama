"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Stage = 0 | 1 | 2 | 3;

const stagesInfo = [
  { id: 0, title: "01 · Home Landing" },
  { id: 1, title: "02 · Label Scanner" },
  { id: 2, title: "03 · AI Reasoning" },
  { id: 3, title: "04 · Audit Report" },
];

export default function ThreePhoneShowcase() {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentStage, setCurrentStage] = useState<Stage>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play loop through stages
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentStage((prev) => ((prev + 1) % 4) as Stage);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Smooth scroll sync inside the phone screen
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    if (currentStage === 0) {
      el.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStage === 1) {
      el.scrollTo({ top: 220, behavior: "smooth" });
    } else if (currentStage === 2) {
      el.scrollTo({ top: 480, behavior: "smooth" });
    } else if (currentStage === 3) {
      el.scrollTo({ top: 680, behavior: "smooth" });
    }
  }, [currentStage]);

  // Three.js 3D Phone Mesh Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 370;
    const height = container.clientHeight || 640;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfffaed, 2.6);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const goldRimLight = new THREE.PointLight(0xc9ab73, 4.2, 20);
    goldRimLight.position.set(-4, -2, 4);
    scene.add(goldRimLight);

    const softFillLight = new THREE.PointLight(0xffffff, 1.5, 15);
    softFillLight.position.set(4, -4, 3);
    scene.add(softFillLight);

    // Phone Group
    const phoneGroup = new THREE.Group();
    scene.add(phoneGroup);

    // 1. Phone Body (Sleek Apple-style natural titanium casing)
    const bodyGeometry = new THREE.BoxGeometry(2.9, 6.0, 0.26);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f1f23,
      metalness: 0.88,
      roughness: 0.22,
    });
    const phoneBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    phoneGroup.add(phoneBody);

    // 2. Beveled Gold Border Ring
    const bezelGeometry = new THREE.BoxGeometry(2.94, 6.04, 0.2);
    const bezelMaterial = new THREE.MeshStandardMaterial({
      color: 0xc9ab73,
      metalness: 0.95,
      roughness: 0.15,
    });
    const phoneBezel = new THREE.Mesh(bezelGeometry, bezelMaterial);
    phoneGroup.add(phoneBezel);

    // 3. Screen Glass Frame
    const screenGeometry = new THREE.PlaneGeometry(2.76, 5.82);
    const screenMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xfcfbf8,
      metalness: 0.05,
      roughness: 0.1,
      transmission: 0.1,
      transparent: true,
      opacity: 0.96,
    });
    const phoneScreen = new THREE.Mesh(screenGeometry, screenMaterial);
    phoneScreen.position.z = 0.135;
    phoneGroup.add(phoneScreen);

    // Mouse & Touch Interaction
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 0.5;
      targetRotX = -y * 0.4;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / rect.width - 0.5;
        const y = (touch.clientY - rect.top) / rect.height - 0.5;
        targetRotY = x * 0.5;
        targetRotX = -y * 0.4;
      }
    };

    const handleResetRot = () => {
      targetRotX = 0;
      targetRotY = 0;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleResetRot);
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleResetRot);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 370;
      const h = container.clientHeight || 640;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Organic subtle float
      phoneGroup.position.y = Math.sin(elapsedTime * 1.4) * 0.06;

      // Smooth interpolation to mouse rotation
      phoneGroup.rotation.x += (targetRotX - phoneGroup.rotation.x) * 0.08;
      phoneGroup.rotation.y += (targetRotY + Math.sin(elapsedTime * 0.7) * 0.03 - phoneGroup.rotation.y) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleResetRot);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleResetRot);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full">
      {/* 3D Smartphone Frame Wrapper */}
      <div className="relative w-full max-w-[300px] sm:max-w-[370px] h-[580px] sm:h-[620px] flex items-center justify-center">
        
        {/* Three.js Interactive WebGL Canvas Layer */}
        <div
          ref={mountRef}
          className="absolute inset-0 z-10 pointer-events-auto cursor-grab active:cursor-grabbing touch-pan-y"
          style={{ touchAction: "pan-y" }}
        />

        {/* ============================================================ */}
        {/* ACTUAL NIRĀMA WEB APPLICATION VIEWPORT (Inside Phone Screen) */}
        {/* ============================================================ */}
        <div className="absolute z-20 w-[260px] h-[525px] sm:w-[280px] sm:h-[565px] rounded-[2.4rem] bg-[#FCFBF8] text-[#1A1A1A] p-2.5 flex flex-col justify-between overflow-hidden shadow-2xl border border-black/10 pointer-events-none">
          
          {/* Dynamic Island Speaker Notch */}
          <div className="sticky top-0 z-30 mx-auto mb-1 h-3.5 w-24 rounded-full bg-black/90 border border-white/20 flex items-center justify-between px-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[0.52rem] text-white/70 font-mono">NIRĀMA</span>
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          </div>

          {/* Actual Scrollable Website Canvas */}
          <div
            ref={scrollContainerRef}
            className="flex-1 w-full overflow-y-auto space-y-4 pr-0.5 scroll-smooth scrollbar-none"
            style={{ scrollbarWidth: "none" }}
          >
            {/* 1. ACTUAL WEBSITE HEADER */}
            <div className="rounded-full border border-black/5 bg-white/90 px-3 py-1.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-1.5">
                <img src="/logo.png" alt="Logo" className="h-4 w-auto object-contain" />
              </div>
              <span className="rounded-full bg-[#B3945E]/15 px-2 py-0.5 text-[0.52rem] font-bold text-[#8C6F3B]">
                OpenAI × FoodPharmer
              </span>
            </div>

            {/* 2. ACTUAL HERO SECTION CONTENT */}
            <div className="text-center space-y-2 pt-1 px-1">
              <div className="inline-flex items-center gap-1 rounded-full border border-[#B3945E]/30 bg-[#B3945E]/10 px-2 py-0.5 text-[0.52rem] font-bold uppercase tracking-wider text-[#8C6F3B]">
                <span className="h-1 w-1 rounded-full bg-[#10B981] animate-pulse" />
                <span>Label Padhega India</span>
              </div>

              <h2 className="font-serif text-sm font-medium tracking-tight text-[#1A1A1A] leading-tight">
                Pure clarity.{" "}
                <span className="bg-gradient-to-r from-[#B3945E] via-[#D4B87C] to-[#8C6F3B] bg-clip-text text-transparent italic">
                  Scan past the marketing illusion.
                </span>
              </h2>

              <p className="text-[0.55rem] text-black/60 leading-relaxed">
                Decode hidden sugars, refined palm oil, and cryptic INS additives in 4pt font.
              </p>

              {/* Simulated Launch Scanner Button */}
              <div className="pt-1">
                <div
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.55rem] font-bold uppercase tracking-wider text-white shadow-sm transition-all ${
                    currentStage === 0
                      ? "bg-[#1A1A1A] ring-2 ring-[#B3945E] scale-105"
                      : "bg-[#1A1A1A]"
                  }`}
                >
                  <span>Launch Scanner</span>
                  <span>&darr;</span>
                </div>
              </div>
            </div>

            {/* 3. ACTUAL SCANNER INGESTION BOX */}
            <div className="rounded-2xl border border-black/10 bg-white/90 p-2.5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[0.52rem] font-bold uppercase tracking-wider text-[#8C6F3B]">
                  Active Label Scanner
                </span>
                <span className="text-[0.5rem] text-black/40">FSSAI Vision OCR</span>
              </div>

              {/* Slot 1: Back Label */}
              <div className="rounded-xl border border-dashed border-[#B3945E]/40 bg-[#B3945E]/[0.03] p-2 text-center">
                <div className="flex items-center justify-between mb-1 text-[0.5rem] font-bold text-black/70">
                  <span>Slot 1 · Back Label (Ingredients)</span>
                  {currentStage >= 1 && (
                    <span className="text-[#10B981] flex items-center gap-0.5">
                      ✓ Ready
                    </span>
                  )}
                </div>

                {currentStage >= 1 ? (
                  <div className="relative rounded-lg bg-black/80 p-2 text-left text-white overflow-hidden space-y-1">
                    {/* Laser line in stage 1 */}
                    {currentStage === 1 && (
                      <div
                        className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#C9AB73] to-transparent shadow-[0_0_8px_#C9AB73] animate-pulse"
                        style={{ top: "50%" }}
                      />
                    )}
                    <p className="text-[0.48rem] text-white/50 font-mono">FSSAI INGREDIENT LIST:</p>
                    <p className="text-[0.52rem] font-mono text-white/90 leading-tight">
                      Sugar (37.4%), Maltodextrin, Refined Palmolein Oil, INS 150c, Liquid Glucose...
                    </p>
                  </div>
                ) : (
                  <div className="py-2 text-[0.5rem] text-black/40">
                    Tap to snap back nutritional panel
                  </div>
                )}
              </div>

              {/* Slot 2: Front Cover */}
              <div className="rounded-xl border border-dashed border-black/10 bg-black/[0.01] p-1.5 text-center text-[0.48rem] text-black/40">
                Slot 2 · Front Marketing Claims (Optional)
              </div>

              {/* Audit Button */}
              <div className="w-full rounded-xl bg-gradient-to-r from-[#C9AB73] to-[#A88851] py-1.5 text-center text-[0.55rem] font-bold uppercase tracking-wider text-white shadow-xs">
                {currentStage === 2 ? "Auditing Formulation..." : "Audit Product →"}
              </div>
            </div>

            {/* 4. ACTUAL REASONING STATE */}
            {currentStage === 2 && (
              <div className="rounded-2xl border border-white/90 bg-white/95 p-3 text-center space-y-2 shadow-xs animate-fade-in">
                {/* Morphing Orb */}
                <div className="mx-auto relative h-12 w-12 flex items-center justify-center">
                  <div className="absolute h-10 w-10 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(201,171,115,0.9),rgba(16,185,129,0.5))] blur-[2px] animate-spin" />
                  <div className="absolute h-6 w-6 rounded-full border border-white bg-white/60 backdrop-blur-md" />
                </div>
                <div>
                  <span className="text-[0.52rem] font-bold uppercase tracking-widest text-[#8C6F3B]">
                    Nirāma Multi-Stage Reasoning
                  </span>
                  <p className="text-[0.5rem] text-black/60 mt-0.5">
                    Deciphering INS 150c & calculating sugar teaspoons...
                  </p>
                </div>
              </div>
            )}

            {/* 5. ACTUAL COMPLETE FOOD AUDIT REPORT */}
            <div
              className={`rounded-2xl border border-white/90 bg-white/95 p-2.5 space-y-2 shadow-xs transition-all ${
                currentStage === 3 ? "opacity-100 ring-2 ring-[#B3945E]/50" : "opacity-90"
              }`}
            >
              {/* Product Title & Score */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded-full bg-red-500/10 px-1.5 py-0.5 text-[0.45rem] font-bold text-red-700">
                    Strictly a Treat / Highly Processed
                  </span>
                  <h3 className="text-[0.62rem] font-medium text-[#1A1A1A] mt-0.5">
                    Bournvita Nutrition Drink
                  </h3>
                  <p className="text-[0.48rem] text-black/45">Mondelez / Cadbury India</p>
                </div>

                <div className="rounded-xl border border-black/5 bg-[#FCFBF8] p-1.5 text-center">
                  <span className="text-[0.45rem] text-black/40 uppercase font-bold">Purity Index</span>
                  <p className="text-sm font-light text-red-700">2<span className="text-[0.48rem] text-black/40">/10</span></p>
                </div>
              </div>

              {/* 2x2 Metric Cards */}
              <div className="grid grid-cols-2 gap-1.5 text-[0.5rem]">
                <div className="rounded-xl bg-[#FCEFEB] p-1.5 border border-[#F5C9C0]">
                  <span className="text-[0.42rem] font-bold text-red-800 uppercase block">Total Sugar</span>
                  <span className="font-semibold text-[#1A1A1A] text-[0.6rem]">49.8g</span>
                  <span className="text-black/50 block text-[0.45rem]">12.5 tsp / 100g</span>
                </div>

                <div className="rounded-xl bg-[#FCEFEB] p-1.5 border border-[#F5C9C0]">
                  <span className="text-[0.42rem] font-bold text-red-800 uppercase block">Primary Fat</span>
                  <span className="font-semibold text-[#1A1A1A] text-[0.55rem]">Refined Palm Oil</span>
                  <span className="text-red-700 block text-[0.45rem]">Ultra-Processed</span>
                </div>
              </div>

              {/* Desi Swap Card */}
              <div className="rounded-xl bg-[#64825E]/10 p-2 border border-[#64825E]/20 text-[0.5rem]">
                <span className="text-[0.45rem] font-bold text-[#496B43] uppercase tracking-wider block">
                  Clean Desi Kitchen Swap:
                </span>
                <p className="text-[#3A5635] font-semibold mt-0.5">
                  Roasted Sattu Badam Shake
                </p>
                <p className="text-black/60 text-[0.45rem] mt-0.5 leading-tight">
                  0g refined sugar, 9g natural protein, zero industrial chemicals.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Screen Bar */}
          <div className="sticky bottom-0 z-30 pt-1 flex items-center justify-between border-t border-black/5 text-[0.48rem] text-black/40 bg-[#FCFBF8]/95">
            <span>Label Padhega India</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1 w-2.5 rounded-full transition-all ${
                    currentStage === i ? "bg-[#B3945E]" : "bg-black/15"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Ambient Halo behind 3D Phone */}
        <div className="absolute -inset-4 z-0 bg-gradient-to-tr from-[#B3945E]/20 via-[#10B981]/12 to-transparent blur-3xl rounded-full pointer-events-none opacity-60" />
      </div>

      {/* Interactive Process Stage Timeline Controls */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 max-w-md">
        {stagesInfo.map((stage) => (
          <button
            key={stage.id}
            onClick={() => {
              setCurrentStage(stage.id as Stage);
              setIsAutoPlaying(false);
            }}
            className={`rounded-full px-3 py-1 text-[0.62rem] font-semibold tracking-wider transition-all ${
              currentStage === stage.id
                ? "bg-[#1A1A1A] text-white shadow-md border border-[#B3945E]"
                : "bg-white/70 text-black/60 hover:bg-white border border-black/5"
            }`}
          >
            {stage.title}
          </button>
        ))}
      </div>

      <p className="mt-2 text-[0.68rem] text-black/45 text-center font-medium">
        💡 <span className="font-semibold text-black/70">Interactive 3D Phone:</span> Move your cursor over the smartphone to tilt in 3D perspective
      </p>
    </div>
  );
}
