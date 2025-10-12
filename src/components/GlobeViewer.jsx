import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Globe } from '@aeryflux/globe3d/react-three-fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Html } from '@react-three/drei';
import { useGlobe } from '../lib/useGlobe.js';
import { LANG_TO_COUNTRY } from '../lib/globe-config.js';

function AnimatedIcon() {
  const iconRef = useRef();
  const imgRef = useRef();
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const timeAccumulator = useRef(0);
  const animationDuration = 1.5;
  const intervalDuration = 10;

  useFrame((state, delta) => {
    timeAccumulator.current += delta;

    if (!isAnimating && timeAccumulator.current >= intervalDuration) {
      setIsAnimating(true);
      setProgress(0);
      timeAccumulator.current = 0;
    }

    if (isAnimating) {
      setProgress((prev) => {
        const next = prev + delta / animationDuration;
        if (next >= 1) {
          setIsAnimating(false);
          return 0;
        }
        return next;
      });
    }

    if (iconRef.current && isAnimating) {
      const startX = 0.8;
      const endX = 1.5;
      const currentX = startX + (endX - startX) * progress;
      iconRef.current.position.x = currentX;
      iconRef.current.position.y = -1.2;
      iconRef.current.position.z = 0;

      let scale = 1;
      let rotation = 0;

      if (progress < 0.1) {
        scale = progress * 10;
      } else if (progress > 0.9) {
        scale = (1 - progress) * 10;
      } else {
        scale = 1;
        if (progress < 0.4) {
          const wavePhase = (progress - 0.1) / 0.3;
          rotation = Math.sin(wavePhase * Math.PI * 4) * 0.4 * (1 - wavePhase * 0.5);
        }
      }

      iconRef.current.scale.setScalar(scale);

      if (imgRef.current) {
        imgRef.current.style.transform = `rotate(${rotation}rad)`;

        const shadowIntensity = 0.9 + Math.abs(rotation) * 0.5;
        const shadowSize = 10 + Math.abs(rotation) * 10;
        const moveProgress = Math.min(progress / 0.7, 1);
        const shadowBlur = shadowSize + moveProgress * 15;

        imgRef.current.style.filter = `drop-shadow(0 0 ${shadowBlur}px rgba(255, 255, 255, ${shadowIntensity})) drop-shadow(0 0 ${shadowBlur * 2}px rgba(255, 255, 255, ${shadowIntensity * 0.6}))`;
      }
    } else if (iconRef.current) {
      iconRef.current.scale.setScalar(0);
    }
  });

  if (!isAnimating) return null;

  return (
    <group ref={iconRef}>
      <Html center>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <img
            ref={imgRef}
            src={`${import.meta.env.BASE_URL}assets/images/hand-gestures.svg`}
            alt="Hand gesture"
            style={{
              width: '40px',
              height: '40px',
              transformOrigin: 'center bottom',
              transition: 'none'
            }}
          />
        </div>
      </Html>
    </group>
  );
}

function PortfolioGlobe({ onLoad, selectedLanguage }) {
  const modelUrl = import.meta.env.DEV
    ? `${import.meta.env.BASE_URL}models/atlas_ico_subdiv_7.glb`
    : 'https://raw.githubusercontent.com/martinbaud/portfolio/master/public/models/atlas_ico_subdiv_7.glb';
  const {
    clickedCountry,
    isLoaded,
    configLoaded,
    globeConfig,
    groupRef,
    globeRef,
    timeRef,
    handleCountryClick,
    handleLoad: hookHandleLoad,
    getHighlightedCountry,
    getHighlightColor
  } = useGlobe({ modelUrl, selectedLanguage, onLoad });

  const { gl } = useThree();

  const handleLoad = () => {
    hookHandleLoad();
  };
  if (!configLoaded || !globeConfig) {
    return null;
  }

  return (
    <group ref={groupRef}>
      <group ref={globeRef}>
        <Globe
          modelUrl={modelUrl}
          colors={{
            country: globeConfig.countryColor,
            border: globeConfig.borderColor,
            globeFill: 0x000000,
            highlight: getHighlightColor(),
            languageCountry: 0x3fb950
          }}
          countryScale={1.0}
          borderScale={globeConfig.borderScale}
          globeFillScale={globeConfig.globeFillScale}
          highlightScale={1.0}
          enableInteraction={true}
          selectedCountry={getHighlightedCountry()}
          languageCountry={selectedLanguage ? LANG_TO_COUNTRY[selectedLanguage] : null}
          onCountryClick={handleCountryClick}
          onLoad={handleLoad}
        />
      </group>
    </group>
  );
}

function Scene({ onLoad, selectedLanguage }) {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, 5]} intensity={0.6} color={0xffffff} />
      <hemisphereLight skyColor={0xffffff} groundColor={0x000000} intensity={0.5} />
      <Suspense fallback={null}>
        <PortfolioGlobe onLoad={onLoad} selectedLanguage={selectedLanguage} />
      </Suspense>
      <AnimatedIcon />
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.85}
          mipmapBlur
          radius={0.8}
        />
      </EffectComposer>
    </>
  );
}

export default function GlobeViewer({ className = '', selectedLanguage = 'en' }) {
  return (
    <div className={`globe-container ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 60 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMappingExposure: 1.2
        }}
      >
        <Scene onLoad={() => {}} selectedLanguage={selectedLanguage} />
      </Canvas>
    </div>
  );
}
