'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Satellite,
  Compass,
  RotateCcw,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  MapPin,
  Radio,
  Eye,
  Crosshair,
  Sparkles
} from 'lucide-react';

export interface GroundTarget {
  id: string;
  name: string;
  shortName: string;
  subTitle: string;
  lat: number;
  lon: number;
  satellite: string;
  gsd: string;
  psnr: string;
}

export const GROUND_TARGETS: GroundTarget[] = [
  {
    id: 'sen2neon-mlbs',
    name: 'SEN2NEON Mountain Lake (Virginia)',
    shortName: 'SEN2NEON',
    subTitle: 'NEON AVIRIS-NG Ground Truth',
    lat: 37.448,
    lon: -80.543,
    satellite: 'Sentinel-2 vs NEON',
    gsd: '10m → 2.5m (4x GT)',
    psnr: '+7.97 dB',
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad (Cyberabad)',
    shortName: 'Hyderabad',
    subTitle: 'IT District & Durgam Cheruvu',
    lat: 17.445,
    lon: 78.375,
    satellite: 'Sentinel-2B MSI',
    gsd: '10m → 2.5m (4x)',
    psnr: '+7.52 dB',
  },
  {
    id: 'vizag',
    name: 'Visakhapatnam Harbor',
    shortName: 'Vizag',
    subTitle: 'Deepwater Port & Nav Terminal',
    lat: 17.685,
    lon: 83.292,
    satellite: 'Cartosat-2C PAN',
    gsd: '2.5m → 0.625m',
    psnr: '+7.27 dB',
  },
  {
    id: 'punjab',
    name: 'Punjab Agriculture',
    shortName: 'Punjab',
    subTitle: 'Ludhiana Cadastral Parcels',
    lat: 30.920,
    lon: 75.870,
    satellite: 'Landsat-8 OLI',
    gsd: '30m → 7.5m',
    psnr: '+6.93 dB',
  },
  {
    id: 'delhi',
    name: 'New Delhi NCR',
    shortName: 'Delhi',
    subTitle: 'Urban Footprints & Transit',
    lat: 28.614,
    lon: 77.209,
    satellite: 'Sentinel-2A + SwinIR',
    gsd: '10m → 2.5m',
    psnr: '+7.80 dB',
  },
  {
    id: 'ladakh',
    name: 'Ladakh Himalayas',
    shortName: 'Ladakh',
    subTitle: 'Glacier Crevasses & Ridge DEM',
    lat: 34.152,
    lon: 77.577,
    satellite: 'Cartosat-3 High-Albedo',
    gsd: '1.2m → 0.3m',
    psnr: '+8.10 dB',
  },
  {
    id: 'thar',
    name: 'Thar Solar Complex',
    shortName: 'Thar',
    subTitle: 'Bhadla Solar Park & Dunes',
    lat: 27.500,
    lon: 71.900,
    satellite: 'Dual-Branch ESRT',
    gsd: '10m → 2.5m',
    psnr: '+7.35 dB',
  },
];

interface InteractiveEarthBackgroundProps {
  className?: string;
  showControls?: boolean;
  onSelectTarget?: (target: GroundTarget) => void;
  activeTargetId?: string;
}

export default function InteractiveEarthBackground({
  className = '',
  showControls = true,
  onSelectTarget,
  activeTargetId,
}: InteractiveEarthBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedTarget, setSelectedTarget] = useState<GroundTarget | null>(
    GROUND_TARGETS[0]
  );
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraTelemetry, setCameraTelemetry] = useState({
    subLat: '17.4° N',
    subLon: '78.4° E',
    orbitAlt: '705 km',
    fps: '60',
    velocity: '7.67 km/s',
  });

  // Mutable refs for animation loop
  const sceneContextRef = useRef<{
    earthGroup: THREE.Group | null;
    cloudsMesh: THREE.Mesh | null;
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
    autoRotate: boolean;
    isDragging: boolean;
    previousMousePosition: { x: number; y: number };
    rotationVelocity: { x: number; y: number };
  }>({
    earthGroup: null,
    cloudsMesh: null,
    targetQuaternion: null,
    isLerpingTarget: false,
    satellites: [],
    beaconRings: [],
    autoRotate: false,
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 },
    rotationVelocity: { x: 0, y: 0 },
  });

  // Convert (lat, lon) to 3D position on sphere of given radius
  const latLonToVector3 = useCallback((lat: number, lon: number, radius: number): THREE.Vector3 => {
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;
    // Matching Three.js SphereGeometry UV mapping
    const y = radius * Math.sin(latRad);
    const x = radius * Math.cos(latRad) * Math.cos(lonRad);
    const z = -radius * Math.cos(latRad) * Math.sin(lonRad);
    return new THREE.Vector3(x, y, z);
  }, []);

  // Smoothly rotate globe so given (lat, lon) faces the camera (+Z axis)
  const focusOnCoordinate = useCallback((lat: number, lon: number) => {
    const ctx = sceneContextRef.current;
    if (!ctx.earthGroup) return;

    // Vector on un-rotated sphere pointing to (lat, lon)
    const targetVec = latLonToVector3(lat, lon, 1).normalize();
    // Camera is at (0, 0, Z), so facing vector is (0, 0.08, 1)
    const cameraVec = new THREE.Vector3(0, 0.08, 1).normalize();

    // Find quaternion that rotates targetVec to cameraVec
    const targetQuat = new THREE.Quaternion();
    targetQuat.setFromUnitVectors(targetVec, cameraVec);

    ctx.targetQuaternion = targetQuat;
    ctx.isLerpingTarget = true;
    ctx.rotationVelocity = { x: 0, y: 0 };
  }, [latLonToVector3]);

  // Handle Target Selection
  const handleTargetClick = (target: GroundTarget) => {
    setSelectedTarget(target);
    focusOnCoordinate(target.lat, target.lon);
    if (onSelectTarget) {
      onSelectTarget(target);
    }
  };

  // Keep parent prop in sync
  useEffect(() => {
    if (activeTargetId) {
      const match = GROUND_TARGETS.find((t) => t.id === activeTargetId);
      if (match) {
        setSelectedTarget(match);
        focusOnCoordinate(match.lat, match.lon);
      }
    }
  }, [activeTargetId, focusOnCoordinate]);

  useEffect(() => {
    const container = mountRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.035);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    // Adjusted camera distance and height for the smaller, sleeker globe
    camera.position.set(0, 0.45, 8.6);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // 2. Realistic Space Lighting
    // Ambient cosmic fill with subtle oceanic blue tint
    const ambientLight = new THREE.AmbientLight(0x223344, 0.9);
    scene.add(ambientLight);

    // Warm Sun directional light
    const sunLight = new THREE.DirectionalLight(0xfffaed, 3.0);
    sunLight.position.set(14, 7, 10);
    scene.add(sunLight);

    // Soft rim backlight for night terminator outline
    const backRimLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
    backRimLight.position.set(-12, -4, -10);
    scene.add(backRimLight);

    // 3. Earth Group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);
    sceneContextRef.current.earthGroup = earthGroup;

    // Scaled-down Earth radius for a sleeker, more balanced aesthetic
    const EARTH_RADIUS = 2.2;

    // 4. Photorealistic Earth Textures (Original Blue Marble Colors)
    const textureLoader = new THREE.TextureLoader();

    const dayTexture = textureLoader.load('/textures/earth_daymap.jpg');
    dayTexture.colorSpace = THREE.SRGBColorSpace;

    const normalTexture = textureLoader.load('/textures/earth_normal.jpg');
    const specularTexture = textureLoader.load('/textures/earth_specular.jpg');

    const cloudsTexture = textureLoader.load('/textures/earth_clouds.png');
    cloudsTexture.colorSpace = THREE.SRGBColorSpace;

    const earthMaterial = new THREE.MeshStandardMaterial({
      map: dayTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: specularTexture,
      roughness: 0.55,
      metalness: 0.12,
    });

    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earthMesh);

    // 5. Realistic Atmospheric Cloud Layer
    const cloudsGeom = new THREE.SphereGeometry(EARTH_RADIUS * 1.012, 64, 64);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeom, cloudsMat);
    earthGroup.add(cloudsMesh);
    sceneContextRef.current.cloudsMesh = cloudsMesh;

    // 6. Tactical Graticule Wireframe Overlay (Subtle HUD Lines)
    const graticuleGeom = new THREE.SphereGeometry(EARTH_RADIUS * 1.003, 36, 18);
    const graticuleMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.06,
    });
    const graticuleMesh = new THREE.Mesh(graticuleGeom, graticuleMat);
    earthGroup.add(graticuleMesh);

    // 7. Realistic Blue Atmospheric Glow Corona (Custom Fresnel Shader)
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
      void main() {
        vec3 viewDir = normalize(-vPosition);
        float intensity = pow(0.70 - dot(vNormal, viewDir), 2.8);
        // Realistic Rayleigh scattering cerulean blue
        gl_FragColor = vec4(0.28, 0.58, 1.0, 1.0) * intensity * 1.25;
      }
    `;
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS * 1.15, 64, 64),
      atmosphereMat
    );
    earthGroup.add(atmosphereMesh);

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
          float atmosphere = pow(intensity, 3.2);
          gl_FragColor = vec4(0.25, 0.60, 1.0, 1.0) * atmosphere * 0.5;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
    });
    const innerLimbMesh = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS * 1.015, 64, 64),
      innerLimbMat
    );
    earthGroup.add(innerLimbMesh);

    // 8. Ground Target Beacons & Pulsing Rings (Proportionally Scaled)
    const beaconRings: { mesh: THREE.Mesh; scale: number; maxScale: number }[] = [];

    GROUND_TARGETS.forEach((target) => {
      const pos = latLonToVector3(target.lat, target.lon, EARTH_RADIUS);
      const normal = pos.clone().normalize();

      // Pin Mast / Strobe needle
      const mastGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.24, 8);
      mastGeom.translate(0, 0.12, 0);
      const mastMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const mast = new THREE.Mesh(mastGeom, mastMat);
      mast.position.copy(pos);
      mast.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      earthGroup.add(mast);

      // Pin Glowing Head (Bright white / cyan core)
      const headGeom = new THREE.SphereGeometry(0.042, 16, 16);
      const headMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const head = new THREE.Mesh(headGeom, headMat);
      head.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.24)));
      earthGroup.add(head);

      // Expanding Radar Pulse Rings on surface
      const ringGeom = new THREE.RingGeometry(0.02, 0.06, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.008)));
      ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      earthGroup.add(ring);

      beaconRings.push({
        mesh: ring,
        scale: 1,
        maxScale: 2.8,
      });
    });
    sceneContextRef.current.beaconRings = beaconRings;

    // 9. Orbital Satellite Rings & Satellites (Proportionally Scaled)
    const satellites: {
      mesh: THREE.Group;
      orbitRadius: number;
      speed: number;
      angle: number;
      axis: THREE.Vector3;
    }[] = [];

    const createSatelliteModel = (label: string) => {
      const satGroup = new THREE.Group();

      // Central avionics bus (metallic cube)
      const busGeom = new THREE.BoxGeometry(0.09, 0.09, 0.14);
      const busMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.9,
        roughness: 0.2,
      });
      const bus = new THREE.Mesh(busGeom, busMat);
      satGroup.add(bus);

      // Solar arrays (blue / dark photovoltaic panels)
      const panelGeom = new THREE.BoxGeometry(0.26, 0.012, 0.09);
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.6,
        roughness: 0.3,
      });
      const leftPanel = new THREE.Mesh(panelGeom, panelMat);
      leftPanel.position.set(-0.18, 0, 0);
      satGroup.add(leftPanel);

      const rightPanel = new THREE.Mesh(panelGeom, panelMat);
      rightPanel.position.set(0.18, 0, 0);
      satGroup.add(rightPanel);

      // Sensor aperture lens
      const lensGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.04, 12);
      const lensMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const lens = new THREE.Mesh(lensGeom, lensMat);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(0, -0.045, 0.045);
      satGroup.add(lens);

      // Flashing strobe light
      const strobeGeom = new THREE.SphereGeometry(0.02, 8, 8);
      const strobeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const strobe = new THREE.Mesh(strobeGeom, strobeMat);
      strobe.position.set(0, 0.06, 0);
      satGroup.add(strobe);

      return satGroup;
    };

    const addSatelliteOrbit = (
      radius: number,
      inclinationDeg: number,
      rotationYDeg: number,
      speed: number,
      name: string
    ) => {
      const orbitCurve = new THREE.EllipseCurve(
        0,
        0,
        radius,
        radius,
        0,
        2 * Math.PI,
        false,
        0
      );
      const points = orbitCurve.getPoints(120);
      const orbitGeom = new THREE.BufferGeometry().setFromPoints(
        points.map((p) => new THREE.Vector3(p.x, 0, p.y))
      );
      const orbitMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.22,
      });
      const orbitLine = new THREE.Line(orbitGeom, orbitMat);

      // Rotate orbit plane to realistic inclination
      orbitLine.rotation.x = (inclinationDeg * Math.PI) / 180;
      orbitLine.rotation.y = (rotationYDeg * Math.PI) / 180;
      scene.add(orbitLine);

      // Satellite model
      const satMesh = createSatelliteModel(name);
      scene.add(satMesh);

      // Axis around which the satellite revolves
      const normalAxis = new THREE.Vector3(0, 1, 0)
        .applyAxisAngle(new THREE.Vector3(1, 0, 0), (inclinationDeg * Math.PI) / 180)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), (rotationYDeg * Math.PI) / 180)
        .normalize();

      satellites.push({
        mesh: satMesh,
        orbitRadius: radius,
        speed,
        angle: Math.random() * Math.PI * 2,
        axis: normalAxis,
      });
    };

    // Scaled-down orbital altitudes
    // Sentinel-2 Sun-Synchronous Polar Orbit (98.6°)
    addSatelliteOrbit(3.05, 98.6, 25, 0.008, 'Sentinel-2B');
    // ISRO Cartosat-2C High-Resolution Orbit (97.5°)
    addSatelliteOrbit(2.75, 97.5, 115, 0.012, 'Cartosat-2C');
    // Landsat-8 Operational Land Imager (98.2°)
    addSatelliteOrbit(3.35, 98.2, 210, 0.006, 'Landsat-8');

    sceneContextRef.current.satellites = satellites;

    // 10. Deep Space Starfield
    const starCount = 1200;
    const starGeom = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 40 + Math.random() * 40;

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.16,
      transparent: true,
      opacity: 0.45,
    });
    const starField = new THREE.Points(starGeom, starMat);
    scene.add(starField);

    // Initial focus on Hyderabad preset
    focusOnCoordinate(17.445, 78.375);

    // 11. Pointer / Mouse Interactivity with Inertia
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      isDragging = true;
      sceneContextRef.current.isDragging = true;
      sceneContextRef.current.isLerpingTarget = false;
      previousMousePosition = { x: e.clientX, y: e.clientY };
      sceneContextRef.current.rotationVelocity = { x: 0, y: 0 };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !earthGroup) return;

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      const rotSpeed = 0.0035;
      const qY = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        deltaX * rotSpeed
      );
      const qX = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        deltaY * rotSpeed
      );

      earthGroup.quaternion.premultiply(qY);
      earthGroup.quaternion.premultiply(qX);

      sceneContextRef.current.rotationVelocity = {
        x: THREE.MathUtils.lerp(sceneContextRef.current.rotationVelocity.x, deltaY * rotSpeed, 0.4),
        y: THREE.MathUtils.lerp(sceneContextRef.current.rotationVelocity.y, deltaX * rotSpeed, 0.4),
      };

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
      sceneContextRef.current.isDragging = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // 12. Window Resize Listener
    const onResize = () => {
      if (!container || !canvas) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // 13. Animation Loop
    let animationFrameId: number;
    const startTime = performance.now();
    let lastTime = startTime;
    let frameCounter = 0;
    let lastFpsUpdate = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentTime = performance.now();
      const elapsedTime = (currentTime - startTime) * 0.001;
      const delta = Math.min((currentTime - lastTime) * 0.001, 0.1);
      lastTime = currentTime;

      // FPS and Telemetry updates
      frameCounter++;
      if (elapsedTime - lastFpsUpdate > 0.5) {
        const fps = Math.round(frameCounter / (elapsedTime - lastFpsUpdate));
        frameCounter = 0;
        lastFpsUpdate = elapsedTime;
        setCameraTelemetry((prev) => ({ ...prev, fps: fps.toString() }));
      }

      const ctx = sceneContextRef.current;

      // Gentle cloud rotation (independent from Earth surface rotation)
      if (ctx.cloudsMesh) {
        ctx.cloudsMesh.rotation.y += 0.0003;
      }

      // Handle Smooth Lerp to Target Location
      if (ctx.isLerpingTarget && ctx.targetQuaternion && earthGroup) {
        const slerpFactor = 1 - Math.exp(-4.2 * delta);
        earthGroup.quaternion.slerp(ctx.targetQuaternion, slerpFactor);
        if (earthGroup.quaternion.angleTo(ctx.targetQuaternion) < 0.002) {
          earthGroup.quaternion.copy(ctx.targetQuaternion);
          ctx.isLerpingTarget = false;
        }
      } else if (!ctx.isDragging && earthGroup) {
        // Apply Inertia with exponential friction
        const velMag = Math.hypot(ctx.rotationVelocity.x, ctx.rotationVelocity.y);
        if (velMag > 0.00001) {
          const qY = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            ctx.rotationVelocity.y
          );
          const qX = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1, 0, 0),
            ctx.rotationVelocity.x
          );
          earthGroup.quaternion.premultiply(qY);
          earthGroup.quaternion.premultiply(qX);

          const friction = Math.exp(-3.5 * delta);
          ctx.rotationVelocity.x *= friction;
          ctx.rotationVelocity.y *= friction;
        } else {
          ctx.rotationVelocity.x = 0;
          ctx.rotationVelocity.y = 0;
        }

        if (ctx.autoRotate) {
          const autoQ = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            0.001
          );
          earthGroup.quaternion.premultiply(autoQ);
        }
      }

      // Animate Pulsing Beacon Rings on Earth's surface
      beaconRings.forEach((ringItem, index) => {
        const phase = (elapsedTime * 1.5 + index * 0.4) % 1;
        const currentScale = 1 + phase * (ringItem.maxScale - 1);
        ringItem.mesh.scale.set(currentScale, currentScale, 1);
        const mat = ringItem.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, (1 - phase) * 0.85);
      });

      // Animate Orbiting Satellites along their 3D orbital planes
      satellites.forEach((sat) => {
        sat.angle += sat.speed * (ctx.autoRotate ? 1 : 0.4);
        const satPos = new THREE.Vector3(
          Math.cos(sat.angle) * sat.orbitRadius,
          0,
          Math.sin(sat.angle) * sat.orbitRadius
        );
        satPos.applyAxisAngle(new THREE.Vector3(1, 0, 0), sat.mesh.rotation.x);
        sat.mesh.position.copy(satPos);

        const tangent = new THREE.Vector3(
          -Math.sin(sat.angle),
          0,
          Math.cos(sat.angle)
        ).normalize();
        sat.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      });

      // Starfield subtle rotation
      starField.rotation.y = elapsedTime * 0.00015;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      earthGeometry.dispose();
      earthMaterial.dispose();
      cloudsGeom.dispose();
      cloudsMat.dispose();
      graticuleGeom.dispose();
      graticuleMat.dispose();
      atmosphereMat.dispose();
      innerLimbMat.dispose();
      starGeom.dispose();
      starMat.dispose();
      dayTexture.dispose();
      normalTexture.dispose();
      specularTexture.dispose();
      cloudsTexture.dispose();
      renderer.dispose();
    };
  }, [focusOnCoordinate, latLonToVector3]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full overflow-hidden select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-black'
          : 'h-full min-h-[500px]'
      } ${className}`}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Subtle vignette overlay so text over 3D model remains crisp */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_60%,rgba(0,0,0,0.85)_100%)]" />

      {/* TOP TELEMETRY HUD BAR */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-10">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Badge
            variant="outline"
            className="bg-black/80 backdrop-blur-md border-neutral-700 text-white font-mono text-[11px] px-3 py-1.5 flex items-center gap-2 shadow-lg"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span>3D BLUE MARBLE (WGS-84)</span>
          </Badge>

          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-neutral-300 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-800">
            <span>FPS: {cameraTelemetry.fps}</span>
            <span>•</span>
            <span>ALT: {cameraTelemetry.orbitAlt}</span>
            <span>•</span>
            <span>VEL: {cameraTelemetry.velocity}</span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const next = !isAutoRotating;
              setIsAutoRotating(next);
              sceneContextRef.current.autoRotate = next;
            }}
            className="h-8 text-xs font-mono border-neutral-800 bg-black/80 backdrop-blur-md hover:bg-neutral-900 text-white gap-1.5 px-3"
          >
            {isAutoRotating ? (
              <>
                <Pause className="h-3 w-3" />
                <span className="hidden sm:inline">Pause Rotation</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                <span className="hidden sm:inline">Auto Rotate</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (selectedTarget) {
                focusOnCoordinate(selectedTarget.lat, selectedTarget.lon);
              }
            }}
            className="h-8 text-xs font-mono border-neutral-800 bg-black/80 backdrop-blur-md hover:bg-neutral-900 text-white gap-1.5 px-3"
            title="Reset to selected beacon"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Center</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 text-xs font-mono border-neutral-800 bg-black/80 backdrop-blur-md hover:bg-neutral-900 text-white gap-1.5 px-3"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Globe'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {isFullscreen ? 'Exit' : 'Full 3D'}
            </span>
          </Button>
        </div>
      </div>

      {/* BOTTOM BENCHMARK LOCATIONS HUD CAROUSEL */}
      {showControls && (
        <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
          <div className="max-w-5xl mx-auto flex flex-col gap-2">
            {/* Active Target Telemetry Card */}
            {selectedTarget && (
              <div className="pointer-events-auto flex items-center justify-between p-3 rounded-lg bg-black/85 backdrop-blur-md border border-neutral-800 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-white text-black flex items-center justify-center font-mono font-bold">
                    <Crosshair className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-sm">
                        {selectedTarget.name}
                      </span>
                      <Badge variant="outline" className="text-[10px] py-0 border-neutral-700 text-neutral-300">
                        {selectedTarget.satellite}
                      </Badge>
                    </div>
                    <div className="text-[11px] font-mono text-neutral-400">
                      {selectedTarget.subTitle} • Lat {selectedTarget.lat.toFixed(2)}° N, Lon {selectedTarget.lon.toFixed(2)}° E
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-4 text-right font-mono text-xs">
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase">Super-Res GSD</div>
                    <div className="font-bold text-white">{selectedTarget.gsd}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase">PSNR Gain</div>
                    <div className="font-bold text-white">{selectedTarget.psnr}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Target Select Chips */}
            <div className="pointer-events-auto flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider pl-1 hidden sm:inline whitespace-nowrap">
                TARGET PINS:
              </span>
              {GROUND_TARGETS.map((target) => {
                const isActive = selectedTarget?.id === target.id;
                return (
                  <button
                    key={target.id}
                    onClick={() => handleTargetClick(target)}
                    className={`px-3 py-1.5 rounded-md font-mono text-xs whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                      isActive
                        ? 'bg-white text-black border-white font-bold shadow-md shadow-white/20'
                        : 'bg-black/80 text-neutral-300 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900'
                    }`}
                  >
                    <MapPin className={`h-3 w-3 ${isActive ? 'text-black' : 'text-neutral-400'}`} />
                    <span>{target.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Drag instruction helper for first-time visitors */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 pointer-events-none hidden lg:flex flex-col items-center gap-1 text-neutral-500 font-mono text-[10px] opacity-40 hover:opacity-100 transition-opacity">
        <Compass className="h-5 w-5 animate-spin" style={{ animationDuration: '16s' }} />
        <span>DRAG TO ROTATE</span>
      </div>
    </div>
  );
}
