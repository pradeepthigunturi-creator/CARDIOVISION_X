import React, { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { PredictionDetail } from '../types';
import {
  Activity, Eye, Layers, Sliders, Info,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, RotateCcw,
  Zap, Heart as HeartIcon, Sparkles
} from 'lucide-react';

interface Heart3DProps {
  vessels?: {
    LAD?: PredictionDetail;
    LCX?: PredictionDetail;
    RCA?: PredictionDetail;
  };
  overallCad?: PredictionDetail;
  selectedVessel: 'LAD' | 'LCX' | 'RCA' | null;
  onSelectVessel: (vessel: 'LAD' | 'LCX' | 'RCA') => void;
}

const GLTF_MODEL_URL = 'https://raw.githubusercontent.com/yihalem123/Human-Organ3D/main/models/heart.glb';
const LOCAL_MODEL_URL = '/models/heart.glb';

// Preload GLTF model
try {
  useGLTF.preload(LOCAL_MODEL_URL);
} catch (e) {
  // Fallback preload
}

// ----------------------------------------------------------------------
// ANATOMICAL GLTF HEART MODEL COMPONENT
// ----------------------------------------------------------------------
function AnatomicalGLTFHeart({
  bpm,
  isPlaying,
  showVessels
}: {
  bpm: number;
  isPlaying: boolean;
  showVessels: boolean;
}) {
  const rootGroupRef = useRef<THREE.Group>(null);

  // Load GLTF Model asynchronously from URL with local fallback
  const gltf = useGLTF(LOCAL_MODEL_URL) || useGLTF(GLTF_MODEL_URL);

  // Clone, Center, and Auto-Scale Model to ~3.2 units inside camera frustum
  const centeredScene = useMemo(() => {
    const sceneCopy = gltf.scene.clone(true);
    
    // Compute bounding box
    const box = new THREE.Box3().setFromObject(sceneCopy);
    const center = new THREE.Vector3();
    box.getCenter(center);
    
    const size = new THREE.Vector3();
    box.getSize(size);

    // Translate scene so center sits precisely at origin (0, 0, 0)
    sceneCopy.position.sub(center);

    // Auto-scale so longest dimension fits target 3.2 units
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const scaleFactor = 3.2 / maxDim;
      sceneCopy.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }

    // Traverse child meshes for moist biological material & shadow setup
    sceneCopy.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.roughness = 0.35;
          mat.metalness = 0.1;
          mat.needsUpdate = true;
        }
      }
    });

    return sceneCopy;
  }, [gltf]);

  // Cardiac pulse rhythm scaling applied directly to GLTF root group
  useFrame(({ clock }) => {
    if (rootGroupRef.current && isPlaying && bpm > 0) {
      const t = clock.getElapsedTime();
      const beatsPerSecond = bpm / 60;
      const pulsePhase = (t * beatsPerSecond * Math.PI * 2) % (Math.PI * 2);
      // Cardiac double-beat pulse expansion
      const pulseScale = 1 + Math.pow(Math.sin(pulsePhase), 4) * 0.038;
      rootGroupRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    } else if (rootGroupRef.current) {
      rootGroupRef.current.scale.set(1, 1, 1);
    }
  });

  return (
    <group ref={rootGroupRef}>
      <primitive object={centeredScene} />
    </group>
  );
}

// ----------------------------------------------------------------------
// CORONARY ARTERY OVERLAY HIGHLIGHT TUBE & ANCHORED UI BADGE
// ----------------------------------------------------------------------
function CoronaryVesselBadgeOverlay({
  points,
  color,
  isSelected,
  label,
  onClick,
  prob
}: {
  points: THREE.Vector3[];
  color: string;
  isSelected: boolean;
  label: string;
  onClick: () => void;
  prob?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const anchorPos = points[Math.floor(points.length / 2)];

  useFrame(({ clock }) => {
    if (meshRef.current && isSelected) {
      const t = clock.getElapsedTime();
      const pulse = 1 + Math.sin(t * 6) * 0.12;
      meshRef.current.scale.set(pulse, 1, pulse);
    }
  });

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* 3D Highlight Curve for Vessel Surface Path */}
      <mesh ref={meshRef}>
        <tubeGeometry args={[curve, 64, isSelected ? 0.075 : 0.055, 16, false]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 1.0 : 0.4}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>

      {/* Stenosis Focal Marker Node */}
      <mesh position={anchorPos}>
        <sphereGeometry args={[isSelected ? 0.12 : 0.09, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.3} />
      </mesh>

      {/* Surface-Anchored 2D/3D HTML Badge */}
      <Html position={anchorPos} center distanceFactor={7}>
        <button
          onClick={onClick}
          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-2xl backdrop-blur-md border flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            isSelected
              ? 'bg-blue-600/95 text-white border-blue-400 ring-2 ring-blue-400/50 scale-110 shadow-blue-500/50'
              : 'bg-slate-950/85 text-slate-200 border-slate-700 hover:border-slate-500 hover:bg-slate-900'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full inline-block shadow-sm" style={{ backgroundColor: color }} />
          <span>{label}</span>
          {prob !== undefined && (
            <span className="text-[10px] font-mono bg-slate-900/80 px-1.5 py-0.5 rounded text-slate-300">
              {(prob * 100).toFixed(0)}%
            </span>
          )}
        </button>
      </Html>
    </group>
  );
}

// Loading Fallback Spinner
function ModelLoaderFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-2xl text-xs text-slate-300">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="font-semibold">Loading Anatomical Heart GLTF Model...</span>
      </div>
    </Html>
  );
}

// ----------------------------------------------------------------------
// MAIN 3D HEART VIEWER COMPONENT
// ----------------------------------------------------------------------
export function Heart3DViewer({ vessels, overallCad, selectedVessel, onSelectVessel }: Heart3DProps) {
  const [bpm, setBpm] = useState<number>(56);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [conductionMode, setConductionMode] = useState<boolean>(true);

  // Surface Anchored Coronary Artery Paths on Loaded Anatomical GLTF Mesh
  const ladPoints = useMemo(() => [
    new THREE.Vector3(-0.08, 0.85, 0.45),
    new THREE.Vector3(0.02, 0.45, 0.85),
    new THREE.Vector3(0.12, 0.02, 1.05),
    new THREE.Vector3(0.18, -0.55, 0.95),
    new THREE.Vector3(0.22, -1.1, 0.55),
  ], []);

  const lcxPoints = useMemo(() => [
    new THREE.Vector3(-0.08, 0.85, 0.45),
    new THREE.Vector3(-0.55, 0.55, 0.55),
    new THREE.Vector3(-0.9, 0.2, 0.2),
    new THREE.Vector3(-0.85, -0.3, -0.3),
    new THREE.Vector3(-0.5, -0.7, -0.6),
  ], []);

  const rcaPoints = useMemo(() => [
    new THREE.Vector3(0.25, 0.75, 0.4),
    new THREE.Vector3(0.65, 0.45, 0.6),
    new THREE.Vector3(0.85, 0.05, 0.35),
    new THREE.Vector3(0.75, -0.45, -0.1),
    new THREE.Vector3(0.3, -0.85, -0.45),
  ], []);

  // Vessel Risk Colors
  const ladColor = vessels?.LAD?.status_color || '#3B82F6';
  const lcxColor = vessels?.LCX?.status_color || '#3B82F6';
  const rcaColor = vessels?.RCA?.status_color || '#3B82F6';

  const activeVesselDetail = selectedVessel ? vessels?.[selectedVessel] : null;

  return (
    <div className="relative w-full h-[620px] rounded-2xl bg-[#050811] border border-slate-800 overflow-hidden shadow-2xl select-none">
      {/* 3D WebGL Canvas */}
      <Canvas camera={{ position: [0, 0.2, 4.2], fov: 42 }} shadows>
        {/* Dark Medical-Visualization Lighting Rig */}
        {/* 1. Subtle Ambient Light (Intensity 0.3) */}
        <ambientLight intensity={0.3} />

        {/* 2. Directional Key Light (Intensity 2.0, Upper-Left (5, 8, 5)) */}
        <directionalLight position={[5, 8, 5]} intensity={2.0} color="#ffffff" castShadow />

        {/* 3. Cool Cyan Rim/Backlight (Intensity 1.5, Positioned Behind-Right (-4, -2, -6)) */}
        <directionalLight position={[-4, -2, -6]} intensity={1.5} color="#06b6d4" />

        {/* 4. Additional Soft Fill Light */}
        <pointLight position={[3, -2, 3]} intensity={0.5} color="#3b82f6" />

        <Suspense fallback={<ModelLoaderFallback />}>
          <Float speed={isPlaying ? 1.0 : 0} rotationIntensity={0.12} floatIntensity={0.18}>
            <group>
              {/* Authentic Anatomical GLTF Heart Model */}
              <AnatomicalGLTFHeart bpm={bpm} isPlaying={isPlaying} showVessels={showVessels} />

              {/* Surface-Anchored Coronary Artery Badges */}
              {showVessels && (
                <>
                  <CoronaryVesselBadgeOverlay
                    points={ladPoints}
                    color={ladColor}
                    isSelected={selectedVessel === 'LAD'}
                    label="LAD Artery"
                    onClick={() => onSelectVessel('LAD')}
                    prob={vessels?.LAD?.probability}
                  />

                  <CoronaryVesselBadgeOverlay
                    points={lcxPoints}
                    color={lcxColor}
                    isSelected={selectedVessel === 'LCX'}
                    label="LCX Artery"
                    onClick={() => onSelectVessel('LCX')}
                    prob={vessels?.LCX?.probability}
                  />

                  <CoronaryVesselBadgeOverlay
                    points={rcaPoints}
                    color={rcaColor}
                    isSelected={selectedVessel === 'RCA'}
                    label="RCA Artery"
                    onClick={() => onSelectVessel('RCA')}
                    prob={vessels?.RCA?.probability}
                  />
                </>
              )}
            </group>
          </Float>
        </Suspense>

        <OrbitControls enablePan={true} enableZoom={true} minDistance={2.4} maxDistance={7.0} />
      </Canvas>

      {/* TOP LEFT ANATOMICAL CAMERA ROTATION / DIRECTIONAL PAD OVERLAY */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-3">
        <div className="bg-slate-950/80 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-xl flex flex-col items-center gap-1 w-24">
          <button className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors">
            <ChevronUp className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            </div>
            <button className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 flex flex-col gap-1 w-24 text-[10px] font-semibold text-slate-300">
          <button
            onClick={() => setShowVessels(!showVessels)}
            className={`px-2 py-1 rounded transition-colors text-left flex items-center justify-between ${
              showVessels ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'hover:bg-slate-800'
            }`}
          >
            <span>Vessels</span>
            <Eye className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* TOP RIGHT ANATOMICAL INFORMATION PANEL */}
      <div className="absolute top-4 right-4 z-20 w-80 bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-slate-800/90 p-4 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <HeartIcon className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Heart & Coronary Vessels</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">GLTF 3D</span>
        </div>

        <div className="space-y-1">
          <h4 className="text-xs font-bold text-blue-400">Anatomical Organ Model</h4>
          <p className="text-[10px] font-mono text-slate-500 italic">Human Cardiac Mesh</p>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
          High-fidelity 3D anatomical heart GLTF mesh with surface-anchored vessel predictions for the <strong className="text-blue-400">LAD</strong>, <strong className="text-blue-400">LCX</strong>, and <strong className="text-blue-400">RCA</strong> arteries.
        </p>
      </div>

      {/* BOTTOM LEFT BPM HEART RATE PULSE SLIDER */}
      <div className="absolute bottom-16 left-4 z-20 bg-slate-950/85 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-xl flex flex-col gap-2 w-48">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Heart Rate</span>
          </span>
          <span className="font-mono font-bold text-blue-400">{bpm} BPM</span>
        </div>

        <input
          type="range"
          min="40"
          max="120"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>40 BPM</span>
          <span>80 BPM</span>
          <span>120 BPM</span>
        </div>
      </div>

      {/* BOTTOM TOOLBAR DOCK */}
      <div className="absolute bottom-4 left-4 right-4 z-20 bg-slate-950/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConductionMode(!conductionMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              conductionMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Conduction</span>
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center gap-1.5"
          >
            <span>{isPlaying ? 'Pause Pulse' : 'Resume Pulse'}</span>
          </button>
        </div>

        {selectedVessel && activeVesselDetail ? (
          <div className="flex items-center gap-3 bg-slate-900/90 px-3.5 py-1 rounded-xl border border-slate-800">
            <span
              className="w-3 h-3 rounded-full shadow"
              style={{ backgroundColor: activeVesselDetail.status_color }}
            />
            <span className="text-xs font-bold text-slate-200">
              {selectedVessel}: <span style={{ color: activeVesselDetail.status_color }}>{(activeVesselDetail.probability * 100).toFixed(1)}% ({activeVesselDetail.risk_level})</span>
            </span>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Low Risk</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Moderate</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> High Risk</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectVessel(selectedVessel || 'LAD')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
          >
            Inspect Target
          </button>
        </div>
      </div>
    </div>
  );
}
