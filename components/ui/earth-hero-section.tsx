"use client";

import * as React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GROUND_TARGETS, GroundTarget } from "@/components/3d/InteractiveEarthBackground";

export interface EarthHeroSectionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Focus point of the Earth in the viewport [x, y], between 0 and 1.
   * [0.5, 0.5] centers the globe.
   * [0.72, 0.48] positions it majestically on the right, leaving the left for hero copy.
   */
  focus?: [number, number];
  /** Scrim edge direction to darken so overlay copy is legible. */
  scrim?: "none" | "left" | "right" | "top" | "bottom";
  /** How dark the scrim edge gets (0 to 1). */
  scrimStrength?: number;
  /** Active ground target ID to rotate the Earth to. */
  activeTargetId?: string;
  /** Callback when user clicks or selects a ground target. */
  onSelectTarget?: (target: GroundTarget) => void;
  /** Auto rotation speed (degrees per second). Default 0 (only rotates when interacting). */
  orbitSpeed?: number;
  /** Bloom/glow intensity for atmospheric corona. */
  glow?: number;
  /** Enable mouse wheel scroll to zoom the 3D Earth. Default is false to allow natural page scrolling. */
  enableZoom?: boolean;
  children?: React.ReactNode;
}

export function EarthHeroSection({
  focus = [0.72, 0.48],
  scrim = "left",
  scrimStrength = 0.88,
  activeTargetId,
  onSelectTarget,
  orbitSpeed = 0,
  glow = 1.0,
  enableZoom = false,
  className = "",
  children,
  ...rest
}: EarthHeroSectionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  // Scene state stored in ref for the 60fps animation loop
  const sceneStateRef = useRef<{
    earthGroup: THREE.Group | null;
    earthMesh: THREE.Mesh | null;
    cloudsMesh: THREE.Mesh | null;
    atmosphereMat: THREE.ShaderMaterial | null;
    targetQuaternion: THREE.Quaternion | null;
    isLerpingTarget: boolean;
    satellites: {
      mesh: THREE.Group;
      orbitRadius: number;
      speed: number;
      angle: number;
      axis: THREE.Vector3;
    }[];
    beaconRings: { mesh: THREE.Mesh; scale: number; maxScale: number }[];
    isDragging: boolean;
    previousPointerPosition: { x: number; y: number };
    rotationVelocity: { x: number; y: number };
    mouseNorm: { x: number; y: number };
    currentParallax: { x: number; y: number };
    basePosition: { x: number; y: number };
    targetCameraZ: number;
  }>({
    earthGroup: null,
    earthMesh: null,
    cloudsMesh: null,
    atmosphereMat: null,
    targetQuaternion: null,
    isLerpingTarget: false,
    satellites: [],
    beaconRings: [],
    isDragging: false,
    previousPointerPosition: { x: 0, y: 0 },
    rotationVelocity: { x: 0, y: 0 },
    mouseNorm: { x: 0, y: 0 },
    currentParallax: { x: 0, y: 0 },
    basePosition: { x: 0, y: 0 },
    targetCameraZ: 8.4,
  });

  const latLonToVector3 = useCallback(
    (lat: number, lon: number, radius: number): THREE.Vector3 => {
      const latRad = (lat * Math.PI) / 180;
      const lonRad = (lon * Math.PI) / 180;
      const y = radius * Math.sin(latRad);
      const x = radius * Math.cos(latRad) * Math.cos(lonRad);
      const z = -radius * Math.cos(latRad) * Math.sin(lonRad);
      return new THREE.Vector3(x, y, z);
    },
    []
  );

  const focusOnCoordinate = useCallback(
    (lat: number, lon: number) => {
      const state = sceneStateRef.current;
      if (!state.earthGroup) return;

      const targetVec = latLonToVector3(lat, lon, 1).normalize();
      const cameraVec = new THREE.Vector3(0, 0.08, 1).normalize();

      const targetQuat = new THREE.Quaternion();
      targetQuat.setFromUnitVectors(targetVec, cameraVec);

      state.targetQuaternion = targetQuat;
      state.isLerpingTarget = true;
      state.rotationVelocity = { x: 0, y: 0 };
    },
    [latLonToVector3]
  );

  // Focus on active target change
  useEffect(() => {
    if (activeTargetId) {
      const target = GROUND_TARGETS.find((t) => t.id === activeTargetId);
      if (target) {
        focusOnCoordinate(target.lat, target.lon);
      }
    }
  }, [activeTargetId, focusOnCoordinate]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000206, 0.028);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8.4);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // 2. Space Lighting
    const ambientLight = new THREE.AmbientLight(0x18263a, 1.15);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8ea, 3.4);
    sunLight.position.set(16, 8, 11);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.85);
    rimLight.position.set(-14, -5, -10);
    scene.add(rimLight);

    // 3. Earth Group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);
    sceneStateRef.current.earthGroup = earthGroup;

    const EARTH_RADIUS = 2.4;

    // Position Earth according to focus [0..1]
    const updateEarthPosition = (f: [number, number], w: number, h: number) => {
      const aspect = w / h;
      const vFovRad = (camera.fov * Math.PI) / 180;
      const viewHeight = 2 * Math.tan(vFovRad / 2) * camera.position.z;
      const viewWidth = viewHeight * aspect;

      const posX = (f[0] - 0.5) * viewWidth * 0.9;
      const posY = -(f[1] - 0.5) * viewHeight * 0.9;
      sceneStateRef.current.basePosition = { x: posX, y: posY };
      earthGroup.position.set(posX, posY, 0);
    };
    updateEarthPosition(focus, width, height);

    // 4. Textures
    const textureLoader = new THREE.TextureLoader();
    const dayTexture = textureLoader.load("/textures/earth_daymap.jpg");
    dayTexture.colorSpace = THREE.SRGBColorSpace;
    const normalTexture = textureLoader.load("/textures/earth_normal.jpg");
    const specularTexture = textureLoader.load("/textures/earth_specular.jpg");
    const cloudsTexture = textureLoader.load("/textures/earth_clouds.png");
    cloudsTexture.colorSpace = THREE.SRGBColorSpace;

    // Earth Mesh
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: dayTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: specularTexture,
      roughness: 0.52,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS, 64, 64),
      earthMaterial
    );
    earthGroup.add(earthMesh);
    sceneStateRef.current.earthMesh = earthMesh;

    // Clouds Mesh
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.52,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cloudsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS * 1.014, 64, 64),
      cloudsMat
    );
    earthGroup.add(cloudsMesh);
    sceneStateRef.current.cloudsMesh = cloudsMesh;

    // Graticule Coordinates HUD
    const graticuleMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.05,
    });
    const graticuleMesh = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS * 1.004, 36, 18),
      graticuleMat
    );
    earthGroup.add(graticuleMesh);

    // Atmospheric Corona (Fresnel Rayleigh Scattering Shader)
    const atmosphereVertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const atmosphereFragmentShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float uGlow;
      void main() {
        vec3 viewDir = normalize(-vPosition);
        float intensity = pow(0.72 - dot(vNormal, viewDir), 2.9);
        gl_FragColor = vec4(0.24, 0.62, 1.0, 1.0) * intensity * (1.35 * uGlow);
      }
    `;
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: {
        uGlow: { value: glow },
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS * 1.16, 64, 64),
      atmosphereMat
    );
    earthGroup.add(atmosphereMesh);
    sceneStateRef.current.atmosphereMat = atmosphereMat;

    // Inner limb horizon haze
    const innerLimbMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = 1.02 - dot(vNormal, vec3(0.0, 0.0, 1.0));
          float atmosphere = pow(max(0.0, intensity), 3.2);
          gl_FragColor = vec4(0.28, 0.65, 1.0, 1.0) * atmosphere * 0.55;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
    });
    earthGroup.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(EARTH_RADIUS * 1.018, 64, 64),
        innerLimbMat
      )
    );

    // 5. Ground Targets & Pulsing Rings
    const beaconRings: { mesh: THREE.Mesh; scale: number; maxScale: number }[] = [];
    GROUND_TARGETS.forEach((target) => {
      const pos = latLonToVector3(target.lat, target.lon, EARTH_RADIUS);
      const normal = pos.clone().normalize();

      // Pin Mast
      const mastGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8);
      mastGeom.translate(0, 0.11, 0);
      const mastMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const mast = new THREE.Mesh(mastGeom, mastMat);
      mast.position.copy(pos);
      mast.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      earthGroup.add(mast);

      // Flashing Core Beacon
      const pinGeom = new THREE.SphereGeometry(0.04, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const pin = new THREE.Mesh(pinGeom, pinMat);
      pin.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.22)));
      earthGroup.add(pin);

      // Radar Pulse Ring
      const ringGeom = new THREE.RingGeometry(0.04, 0.065, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.02)));
      ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      earthGroup.add(ring);

      beaconRings.push({
        mesh: ring,
        scale: 1,
        maxScale: 3.5,
      });
    });
    sceneStateRef.current.beaconRings = beaconRings;

    // 6. Orbiting Satellites (Sentinel-2 & Cartosat)
    const satellites: {
      mesh: THREE.Group;
      orbitRadius: number;
      speed: number;
      angle: number;
      axis: THREE.Vector3;
    }[] = [];

    const createSatellite = (
      name: string,
      orbitR: number,
      inclinationDeg: number,
      colorHex: number
    ) => {
      const satGroup = new THREE.Group();

      const bodyGeom = new THREE.BoxGeometry(0.07, 0.07, 0.12);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.9,
        roughness: 0.2,
      });
      satGroup.add(new THREE.Mesh(bodyGeom, bodyMat));

      const panelGeom = new THREE.BoxGeometry(0.35, 0.005, 0.06);
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.7,
        roughness: 0.3,
      });
      satGroup.add(new THREE.Mesh(panelGeom, panelMat));

      const lensGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.03, 12);
      const lensMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const lens = new THREE.Mesh(lensGeom, lensMat);
      lens.position.y = -0.04;
      satGroup.add(lens);

      earthGroup.add(satGroup);

      const orbitCurve = new THREE.EllipseCurve(0, 0, orbitR, orbitR, 0, 2 * Math.PI, false, 0);
      const points = orbitCurve.getPoints(128);
      const orbitGeom = new THREE.BufferGeometry().setFromPoints(
        points.map((p) => new THREE.Vector3(p.x, 0, p.y))
      );
      const orbitMat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.25,
      });
      const orbitLine = new THREE.Line(orbitGeom, orbitMat);
      orbitLine.rotation.x = (inclinationDeg * Math.PI) / 180;
      earthGroup.add(orbitLine);

      const axis = new THREE.Vector3(1, 0, 0).applyAxisAngle(
        new THREE.Vector3(0, 0, 1),
        (inclinationDeg * Math.PI) / 180
      );

      return {
        mesh: satGroup,
        orbitRadius: orbitR,
        speed: 0.008 + Math.random() * 0.004,
        angle: Math.random() * Math.PI * 2,
        axis,
      };
    };

    satellites.push(createSatellite("Sentinel-2B", EARTH_RADIUS * 1.35, 68, 0x38bdf8));
    satellites.push(createSatellite("Cartosat-3", EARTH_RADIUS * 1.5, 42, 0xa855f7));
    sceneStateRef.current.satellites = satellites;

    // Initial orientation facing India / Asia
    const initialEuler = new THREE.Euler(0.22, 1.35, 0, "YXZ");
    earthGroup.quaternion.setFromEuler(initialEuler);

    // 7. Robust Mouse & Touch Pointer Interactivity
    const handlePointerDown = (e: PointerEvent) => {
      // Don't intercept clicks on interactive buttons, links or chips
      const targetEl = e.target as HTMLElement | null;
      if (targetEl && targetEl.closest("button, a, input, [role='button'], textarea")) {
        return;
      }
      if (e.button !== 0 && e.pointerType === "mouse") return;

      const state = sceneStateRef.current;
      state.isDragging = true;
      state.previousPointerPosition = { x: e.clientX, y: e.clientY };
      state.isLerpingTarget = false;
      state.rotationVelocity = { x: 0, y: 0 };
      setIsInteracting(true);

      // Capture pointer so dragging outside container still tracks smoothly
      try {
        container.setPointerCapture(e.pointerId);
      } catch {}
    };

    const handlePointerMove = (e: PointerEvent) => {
      const state = sceneStateRef.current;
      const rect = container.getBoundingClientRect();

      // Normalized cursor coordinates [-1, 1] across container for parallax tilt
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      state.mouseNorm = {
        x: Math.max(-1.5, Math.min(1.5, normX)),
        y: Math.max(-1.5, Math.min(1.5, normY)),
      };

      // Handle active drag
      if (!state.isDragging || !state.earthGroup) return;

      const deltaX = e.clientX - state.previousPointerPosition.x;
      const deltaY = e.clientY - state.previousPointerPosition.y;

      const rotSpeed = 0.0035;
      const qY = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        deltaX * rotSpeed
      );
      const qX = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        deltaY * rotSpeed
      );

      // Premultiply in screen space so globe tracks user's drag naturally without gimbal lock
      state.earthGroup.quaternion.premultiply(qY);
      state.earthGroup.quaternion.premultiply(qX);

      // Filtered momentum velocity
      state.rotationVelocity = {
        x: THREE.MathUtils.lerp(state.rotationVelocity.x, deltaY * rotSpeed, 0.4),
        y: THREE.MathUtils.lerp(state.rotationVelocity.y, deltaX * rotSpeed, 0.4),
      };

      state.previousPointerPosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      const state = sceneStateRef.current;
      state.isDragging = false;
      setIsInteracting(false);
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {}
    };

    // Optional Mouse Wheel Zoom (disabled by default so page scrolls naturally)
    let handleWheel: ((e: WheelEvent) => void) | null = null;
    if (enableZoom) {
      handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const state = sceneStateRef.current;
        const zoomStep = e.deltaY * 0.0035;
        state.targetCameraZ = Math.max(5.2, Math.min(12.5, state.targetCameraZ + zoomStep));
      };
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointercancel", handlePointerUp);

    // 8. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const state = sceneStateRef.current;

      if (!state.earthGroup) return;

      // Silky Smooth Mouse Wheel Camera Zoom Damping
      camera.position.z = THREE.MathUtils.damp(
        camera.position.z,
        state.targetCameraZ,
        5.5,
        delta
      );

      // Silky Parallax tilt tracking mouse position
      state.currentParallax.x = THREE.MathUtils.damp(
        state.currentParallax.x,
        state.mouseNorm.x * 0.28,
        4.0,
        delta
      );
      state.currentParallax.y = THREE.MathUtils.damp(
        state.currentParallax.y,
        state.mouseNorm.y * 0.18,
        4.0,
        delta
      );

      state.earthGroup.position.x = state.basePosition.x + state.currentParallax.x;
      state.earthGroup.position.y = state.basePosition.y + state.currentParallax.y;

      // Handle Smooth Lerp to Selected Ground Target
      if (state.isLerpingTarget && state.targetQuaternion) {
        const slerpFactor = 1 - Math.exp(-4.2 * delta);
        state.earthGroup.quaternion.slerp(state.targetQuaternion, slerpFactor);
        if (state.earthGroup.quaternion.angleTo(state.targetQuaternion) < 0.002) {
          state.earthGroup.quaternion.copy(state.targetQuaternion);
          state.isLerpingTarget = false;
        }
      } else if (!state.isDragging) {
        // Inertia damping after user releases drag (glides to a smooth stop)
        const velMag = Math.hypot(state.rotationVelocity.x, state.rotationVelocity.y);
        if (velMag > 0.00001) {
          const qY = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            state.rotationVelocity.y
          );
          const qX = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1, 0, 0),
            state.rotationVelocity.x
          );
          state.earthGroup.quaternion.premultiply(qY);
          state.earthGroup.quaternion.premultiply(qX);

          // Exponential friction decay
          const friction = Math.exp(-3.5 * delta);
          state.rotationVelocity.x *= friction;
          state.rotationVelocity.y *= friction;
        } else {
          // Stationary when idle - only rotates on interaction!
          state.rotationVelocity.x = 0;
          state.rotationVelocity.y = 0;
        }

        // Only rotate if orbitSpeed is explicitly requested (> 0)
        if (orbitSpeed > 0) {
          const autoQ = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            orbitSpeed * delta
          );
          state.earthGroup.quaternion.premultiply(autoQ);
        }
      }

      // Animate ground target radar beacon pulses
      state.beaconRings.forEach((b) => {
        b.scale += delta * 1.6;
        if (b.scale > b.maxScale) {
          b.scale = 1;
        }
        b.mesh.scale.set(b.scale, b.scale, b.scale);
        const mat = b.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.85 * (1 - b.scale / b.maxScale));
      });

      // Animate Satellites along their realistic orbits
      state.satellites.forEach((sat) => {
        sat.angle += sat.speed * delta * 60;
        const x = sat.orbitRadius * Math.cos(sat.angle);
        const z = sat.orbitRadius * Math.sin(sat.angle);
        const orbitPos = new THREE.Vector3(x, 0, z);
        orbitPos.applyAxisAngle(sat.axis, 0);
        sat.mesh.position.copy(orbitPos);
        sat.mesh.lookAt(0, 0, 0);
      });

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      updateEarthPosition(focus, width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointercancel", handlePointerUp);
      if (handleWheel) {
        container.removeEventListener("wheel", handleWheel);
      }
      renderer.dispose();
    };
  }, [focus, orbitSpeed, glow, focusOnCoordinate, enableZoom]);

  // Scrim gradient overlay classes
  const getScrimClasses = () => {
    switch (scrim) {
      case "left":
        return "bg-gradient-to-r from-black via-black/85 via-45% to-transparent";
      case "right":
        return "bg-gradient-to-l from-black via-black/85 via-45% to-transparent";
      case "top":
        return "bg-gradient-to-b from-black via-black/90 via-55% to-transparent";
      case "bottom":
        return "bg-gradient-to-t from-black via-black/90 via-55% to-transparent";
      default:
        return "";
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative isolate h-full w-full overflow-hidden bg-black select-none touch-none ${
        isInteracting ? "cursor-grabbing" : "cursor-grab"
      } ${className}`}
      {...rest}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full pointer-events-none"
      />

      {/* Atmospheric Scrim Veil to keep overlay text crisp & legible */}
      {scrim !== "none" && (
        <div
          className={`pointer-events-none absolute inset-0 ${getScrimClasses()}`}
          style={{ opacity: scrimStrength }}
        />
      )}

      {/* Ambient Star & Grid dust */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.08),transparent_50%)]" />

      {/* Children Layer (Hero copy, CTA buttons, badges) */}
      {children ? (
        <div className="relative z-10 h-full w-full pointer-events-none">
          {children}
        </div>
      ) : null}

      {/* Interactive Mouse Control HUD Pill (Bottom Right) */}
      <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3.5 py-1.5 text-xs text-neutral-400 backdrop-blur-md pointer-events-none select-none">
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="font-mono text-[11px] text-neutral-300">
          {enableZoom ? "DRAG TO ROTATE 3D GLOBE • SCROLL TO ZOOM" : "DRAG TO ROTATE 3D GLOBE"}
        </span>
      </div>
    </div>
  );
}

export default EarthHeroSection;
