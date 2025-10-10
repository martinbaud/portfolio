import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Html } from '@react-three/drei';

// Custom hook to load GLB with proper binary handling
function useGLBModel(url) {
  const [gltf, setGltf] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loader = new GLTFLoader();

    // Force binary mode by fetching as arraybuffer first
    fetch(url)
      .then(response => response.arrayBuffer())
      .then(buffer => {
        loader.parse(buffer, '', (result) => {
          setGltf(result);
        }, (err) => {
          console.error('Error parsing GLB:', err);
          setError(err);
        });
      })
      .catch(err => {
        console.error('Error fetching GLB:', err);
        setError(err);
      });
  }, [url]);

  if (error) throw error;
  return gltf;
}

const GLOBE_CONFIG = {
  countryColor: 0x000000,
  borderColor: 0xffffff,
  globeFillColor: 0xffffff,
  highlightColor: 0xffffff,
  rotationSpeed: 0.002,
  countryScale: 1.0,
  borderScale: 1.01,
  globeFillScale: 0.98,
  highlightScale: 1.05
};

const LANG_TO_COUNTRY = {
  'en': 'UNITED_STATES_OF_AMERICA',
  'es': 'SPAIN',
  'fr': 'FRANCE'
};

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
            src="/assets/images/hand-gestures.svg"
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

function SimpleGlobe({ onLoad, selectedLanguage }) {
  // Load GLB from jsdelivr CDN with custom binary loader
  const modelUrl = import.meta.env.DEV
    ? `${import.meta.env.BASE_URL}assets/models/atlas_ico_subdiv_7.glb`
    : 'https://cdn.jsdelivr.net/gh/martinbaud/portfolio@v1.0.0/public/assets/models/atlas_ico_subdiv_7.glb';
  const gltf = useGLBModel(modelUrl);

  // Return null while loading
  if (!gltf) return null;
  const groupRef = useRef();
  const [isInitialized, setIsInitialized] = useState(false);
  const [clickedCountry, setClickedCountry] = useState(null);
  const countryMeshesRef = useRef({});
  const borderMeshesRef = useRef({});
  const timeRef = useRef(0);
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0 });
  const userRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (gltf && typeof onLoad === 'function') {
      onLoad();
    }
  }, [gltf, onLoad]);

  useEffect(() => {
    if (gltf && gltf.scene && !isInitialized) {
      gltf.scene.traverse(obj => {
        if (!obj.isMesh) return;
        const name = obj.name.toLowerCase();

        if (name === 'globefill') {
          obj.material = new THREE.MeshStandardMaterial({
            color: 0x000000,
            emissive: 0x000000,
            emissiveIntensity: 0.0,
            roughness: 0.8,
            metalness: 0.1,
            transparent: true,
            opacity: 1.0
          });
          obj.scale.setScalar(GLOBE_CONFIG.globeFillScale);
        }

        if (name.startsWith('country_')) {
          obj.material = new THREE.MeshStandardMaterial({
            color: GLOBE_CONFIG.countryColor,
            emissive: 0x000000,
            emissiveIntensity: 0.1,
            roughness: 0.8,
            metalness: 0.1
          });
          obj.scale.setScalar(GLOBE_CONFIG.countryScale);
          const countryCode = name.replace('country_', '').toUpperCase();
          countryMeshesRef.current[countryCode] = obj;
        }

        if (name.startsWith('border_') && !name.startsWith('border_city_')) {
          obj.material = new THREE.MeshStandardMaterial({
            color: GLOBE_CONFIG.borderColor,
            emissive: GLOBE_CONFIG.borderColor,
            emissiveIntensity: 0.5,
            roughness: 0.2,
            metalness: 0.3,
            side: THREE.DoubleSide
          });
          obj.scale.setScalar(GLOBE_CONFIG.borderScale);
          obj.renderOrder = 1;
          const borderCode = name.replace('border_', '').toUpperCase();
          borderMeshesRef.current[borderCode] = obj;
        }

        if (name.startsWith('city_') || name.startsWith('border_city_')) {
          obj.visible = false;
        }
      });

      setIsInitialized(true);
    }
  }, [gltf, isInitialized]);

  useEffect(() => {
    const handleMouseDown = (event) => {
      isDragging.current = true;
      hasDragged.current = false;
      previousMousePosition.current = {
        x: event.clientX,
        y: event.clientY
      };
      gl.domElement.style.cursor = 'grabbing';
    };

    const handleMouseMove = (event) => {
      if (!isInitialized) return;

      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging.current) {
        const deltaX = event.clientX - previousMousePosition.current.x;
        const deltaY = event.clientY - previousMousePosition.current.y;

        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
          hasDragged.current = true;
        }

        rotationVelocity.current.y = deltaX * 0.005;
        rotationVelocity.current.x = deltaY * 0.005;

        previousMousePosition.current = {
          x: event.clientX,
          y: event.clientY
        };
      } else {
        raycaster.current.setFromCamera(mouse.current, camera);
        const intersects = raycaster.current.intersectObjects(
          Object.values(countryMeshesRef.current),
          false
        );
        gl.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
      }
    };

    const handleMouseUp = (event) => {
      if (!hasDragged.current) {
        const rect = gl.domElement.getBoundingClientRect();
        mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.current.setFromCamera(mouse.current, camera);
        const intersects = raycaster.current.intersectObjects(
          Object.values(countryMeshesRef.current),
          false
        );

        if (intersects.length > 0) {
          const clickedMesh = intersects[0].object;
          const countryCode = Object.keys(countryMeshesRef.current).find(
            key => countryMeshesRef.current[key] === clickedMesh
          );
          if (countryCode) {
            const baseCountryName = countryCode.replace(/_\d+$/, '');
            setClickedCountry(baseCountryName);
          }
        }
      }

      isDragging.current = false;
      hasDragged.current = false;
      gl.domElement.style.cursor = 'grab';
    };

    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('mouseup', handleMouseUp);
    gl.domElement.addEventListener('mouseleave', handleMouseUp);
    gl.domElement.style.cursor = 'grab';

    return () => {
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('mouseup', handleMouseUp);
      gl.domElement.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isInitialized, camera, gl]);

  useEffect(() => {
    if (!isInitialized) return;

    const selectedCountryName = selectedLanguage ? LANG_TO_COUNTRY[selectedLanguage] : null;

    Object.values(countryMeshesRef.current).forEach(mesh => {
      mesh.material.color.setHex(GLOBE_CONFIG.countryColor);
      mesh.material.emissive.setHex(0x000000);
      mesh.material.emissiveIntensity = 0.1;
      mesh.scale.setScalar(GLOBE_CONFIG.countryScale);
    });

    Object.values(borderMeshesRef.current).forEach(mesh => {
      mesh.material.color.setHex(GLOBE_CONFIG.borderColor);
      mesh.material.emissive.setHex(GLOBE_CONFIG.borderColor);
      mesh.material.emissiveIntensity = 0.5;
      mesh.material.roughness = 0.2;
      mesh.material.metalness = 0.3;
      mesh.scale.setScalar(GLOBE_CONFIG.borderScale);
      mesh.renderOrder = 1;
    });

    const languageCountries = selectedCountryName
      ? Object.keys(countryMeshesRef.current).filter(code =>
          code.startsWith(selectedCountryName + '_')
        )
      : [];

    const clickedCountries = clickedCountry
      ? Object.keys(countryMeshesRef.current).filter(code =>
          code.startsWith(clickedCountry + '_')
        )
      : [];

    const allHighlightedCountries = [...new Set([...languageCountries, ...clickedCountries])];

    languageCountries.forEach(countryCode => {
      const mesh = countryMeshesRef.current[countryCode];
      mesh.material.color.setHex(0x3fb950);
      mesh.material.emissive.setHex(0x56d364);
      mesh.material.emissiveIntensity = 1.5;
      mesh.material.roughness = 0.3;
      mesh.material.metalness = 0.7;
      mesh.scale.setScalar(GLOBE_CONFIG.highlightScale);

      const borderCode = 'COUNTRY_' + countryCode;
      const borderMesh = borderMeshesRef.current[borderCode];

      if (borderMesh) {
        borderMesh.material.color.setHex(0xffffff);
        borderMesh.material.emissive.setHex(0xffffff);
        borderMesh.material.emissiveIntensity = 1.5;
        borderMesh.material.roughness = 0.1;
        borderMesh.material.metalness = 0.8;
        borderMesh.material.opacity = 1.0;
        borderMesh.material.transparent = false;
        borderMesh.material.needsUpdate = true;
        borderMesh.scale.setScalar(GLOBE_CONFIG.highlightScale);
        borderMesh.renderOrder = 3;
        borderMesh.visible = true;
      }
    });

    clickedCountries.forEach(countryCode => {
      const mesh = countryMeshesRef.current[countryCode];
      mesh.material.color.setHex(0x1f6feb);
      mesh.material.emissive.setHex(0x58a6ff);
      mesh.material.emissiveIntensity = 1.5;
      mesh.material.roughness = 0.3;
      mesh.material.metalness = 0.7;
      mesh.scale.setScalar(GLOBE_CONFIG.highlightScale);

      const borderCode = 'COUNTRY_' + countryCode;
      const borderMesh = borderMeshesRef.current[borderCode];

      if (borderMesh) {
        borderMesh.material.color.setHex(0xffffff);
        borderMesh.material.emissive.setHex(0xffffff);
        borderMesh.material.emissiveIntensity = 1.5;
        borderMesh.material.roughness = 0.1;
        borderMesh.material.metalness = 0.8;
        borderMesh.material.opacity = 1.0;
        borderMesh.material.transparent = false;
        borderMesh.material.needsUpdate = true;
        borderMesh.scale.setScalar(GLOBE_CONFIG.highlightScale);
        borderMesh.renderOrder = 3;
        borderMesh.visible = true;
      }
    });
  }, [selectedLanguage, clickedCountry, isInitialized]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      if (isDragging.current) {
        userRotation.current.y += rotationVelocity.current.y;
        userRotation.current.x += rotationVelocity.current.x;
      } else {
        rotationVelocity.current.y *= 0.95;
        rotationVelocity.current.x *= 0.95;
        userRotation.current.y += rotationVelocity.current.y;
        userRotation.current.x += rotationVelocity.current.x;
        userRotation.current.y -= GLOBE_CONFIG.rotationSpeed;
      }

      groupRef.current.rotation.y = userRotation.current.y;
      groupRef.current.rotation.x = userRotation.current.x;

      timeRef.current += delta;
      const floatY = Math.sin(timeRef.current * 0.5) * 0.15;
      groupRef.current.position.y = floatY;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} />
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
        <SimpleGlobe onLoad={onLoad} selectedLanguage={selectedLanguage} />
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
