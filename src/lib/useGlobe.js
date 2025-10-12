/**
 * Hook React pour gérer le Globe3D
 * Centralise la logique d'état et de gestion des événements
 */

import { useState, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { 
  loadGlobeConfig, 
  getGlobeConfig, 
  LANG_TO_COUNTRY,
  COUNTRY_COLORS,
  AURA_CONFIG
} from './globe-config.js';

export function useGlobe({ 
  modelUrl, 
  selectedLanguage = 'en',
  onLoad = null
}) {
  // États du globe
  const [clickedCountry, setClickedCountry] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [globeConfig, setGlobeConfig] = useState(getGlobeConfig());
  
  // Refs pour l'animation et l'interaction
  const groupRef = useRef();
  const globeRef = useRef();
  const timeRef = useRef(0);
  
  // États pour les contrôles utilisateur
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0 });
  const userRotation = useRef({ x: 0, y: 0 });
  
  // Hook Three.js
  const { gl } = useThree();

  // Charger la configuration au démarrage
  useEffect(() => {
    loadGlobeConfig().then((config) => {
      if (config) {
        setGlobeConfig(getGlobeConfig());
      }
      setConfigLoaded(true);
    });
  }, []);

  const handleCountryClick = (countryCode) => {
    if (countryCode) {
      const baseCountryName = countryCode.replace(/_\d+$/, '');
      setClickedCountry(baseCountryName);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
    if (typeof onLoad === 'function') {
      onLoad();
    }
  };

  // Obtenir le pays à mettre en surbrillance
  const getHighlightedCountry = () => {
    if (clickedCountry) return clickedCountry;
    if (selectedLanguage) return LANG_TO_COUNTRY[selectedLanguage];
    return null;
  };

  // Obtenir la couleur de surbrillance
  const getHighlightColor = () => {
    if (clickedCountry) return COUNTRY_COLORS.CLICKED;
    if (selectedLanguage) return COUNTRY_COLORS.LANGUAGE_SELECTED;
    return globeConfig.highlightColor;
  };

  // Configuration des matériaux pour l'aura - IMMÉDIATE
  const applyCountryMaterials = () => {
    if (!isLoaded || !globeRef.current) return;

    const highlightedCountry = getHighlightedCountry();
    
    globeRef.current.traverse((child) => {
      // Correction ULTRA AGRESSIVE du globeFill - FORCER NOIR SOLIDE
      if (child.isMesh && child.name && child.name.toLowerCase() === 'globefill') {
        // Recréer complètement le matériau pour être sûr
        const newMaterial = new THREE.MeshStandardMaterial({
          color: 0x000000, // Noir
          emissive: 0x000000,
          emissiveIntensity: 0.0,
          roughness: 0.8,
          metalness: 0.1,
          transparent: false,
          opacity: 1.0,
          side: THREE.FrontSide,
          depthWrite: true,
          depthTest: true
        });
        
        // Disposer l'ancien matériau
        if (child.material && child.material.dispose) {
          child.material.dispose();
        }
        
        child.material = newMaterial;
        child.renderOrder = -10;
        child.material.needsUpdate = true;

      }
      
      // Gestion des pays - AVEC EXTRUSION 0, ils sont au niveau du globeFill
      if (child.isMesh && child.name.toLowerCase().startsWith('country_')) {
        const countryCode = child.name.replace(/^country_/i, '').toUpperCase();
        const baseCountryName = countryCode.replace(/_\d+$/, '');
        
        if (highlightedCountry && baseCountryName === highlightedCountry) {
          // Pays sélectionné - PAS D'EXTRUSION car extrusion=0, mais mise en surbrillance
          child.scale.setScalar(1.0); // Rester au niveau du globe
          
          if (clickedCountry && baseCountryName === clickedCountry) {
            // Pays cliqué - bleu avec aura bleue
            child.material.color.setHex(COUNTRY_COLORS.CLICKED);
            child.material.emissive.setHex(AURA_CONFIG.CLICKED.emissive);
            child.material.emissiveIntensity = AURA_CONFIG.CLICKED.emissiveIntensity;
          } else if (selectedLanguage && baseCountryName === LANG_TO_COUNTRY[selectedLanguage]) {
            // Pays de la langue - vert avec aura verte
            child.material.color.setHex(COUNTRY_COLORS.LANGUAGE_SELECTED);
            child.material.emissive.setHex(AURA_CONFIG.LANGUAGE_SELECTED.emissive);
            child.material.emissiveIntensity = AURA_CONFIG.LANGUAGE_SELECTED.emissiveIntensity;
          }
          
          child.material.roughness = 0.3;
          child.material.metalness = 0.7;
        } else {
          // Pays non sélectionné - au niveau du globeFill (face avant)
          child.scale.setScalar(1.0); // Pas d'extrusion
          child.material.color.setHex(COUNTRY_COLORS.DEFAULT);
          child.material.emissive.setHex(0x000000);
          child.material.emissiveIntensity = 0.1;
          child.material.roughness = 0.8;
          child.material.metalness = 0.1;
        }
        child.material.needsUpdate = true;
      }
    });
  };

  // Appliquer les matériaux après chargement et quand nécessaire
  useEffect(() => {
    applyCountryMaterials();
  }, [clickedCountry, selectedLanguage, isLoaded, configLoaded]);

  // Forcer les matériaux à chaque frame pour contrer la librairie Globe3D
  useEffect(() => {
    if (!isLoaded) return;
    
    const interval = setInterval(() => {
      applyCountryMaterials();
    }, 100); // Force les matériaux toutes les 100ms
    
    return () => clearInterval(interval);
  }, [isLoaded, clickedCountry, selectedLanguage, configLoaded]);

  // Correction continue du globeFill - FORCER TOUTES LES 100ms
  useEffect(() => {
    if (!isLoaded || !globeRef.current) return;

    const forceGlobeFill = () => {
      globeRef.current.traverse((child) => {
        if (child.isMesh && child.name.toLowerCase() === 'globefill') {
          // Créer un nouveau matériau complètement noir
          child.material = new THREE.MeshStandardMaterial({
            color: 0x000000, // Noir
            emissive: 0x000000,
            emissiveIntensity: 1,
            roughness: 4,
            metalness: 1,
            transparent: false,
            opacity: 1.0
          });

        }
      });
    };

    // Application immédiate
    forceGlobeFill();
    
    // Puis forcer toutes les 100ms pour contrer la librairie
    const interval = setInterval(forceGlobeFill, 100);
    
    return () => clearInterval(interval);
  }, [isLoaded]);

  // Animation de rotation et flottement avec contrôles utilisateur + FORÇAGE GLOBEFILL
  useFrame((state, delta) => {
    if (groupRef.current && configLoaded) {
      // Gestion de la rotation
      if (isDragging.current) {
        userRotation.current.y += rotationVelocity.current.y;
        userRotation.current.x += rotationVelocity.current.x;
      } else {
        // Inertie quand on relâche
        rotationVelocity.current.y *= 0.95;
        rotationVelocity.current.x *= 0.95;
        userRotation.current.y += rotationVelocity.current.y;
        userRotation.current.x += rotationVelocity.current.x;
        // Auto rotation continue uniquement si pas d'interaction
        userRotation.current.y -= globeConfig.rotationSpeed;
      }

      // Limiter la rotation verticale
      userRotation.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, userRotation.current.x));

      groupRef.current.rotation.y = userRotation.current.y;
      groupRef.current.rotation.x = userRotation.current.x;
      
      // Floating animation
      timeRef.current += delta;
      const floatY = Math.sin(timeRef.current * globeConfig.floatingSpeed) * globeConfig.floatingAmplitude;
      groupRef.current.position.y = floatY;

      // FORÇAGE GLOBEFILL À CHAQUE FRAME - ULTRA AGRESSIF
      if (isLoaded && globeRef.current) {
        globeRef.current.traverse((child) => {
          if (child.isMesh) {
            const name = child.name ? child.name.toLowerCase() : '';
            // Forcer TOUS les meshes qui pourraient être le globeFill
            if (name === 'globefill' || name === 'globe_fill' || name === 'globe' || name === 'earth' || name.includes('fill')) {
              // FORÇAGE ULTRA AGRESSIF - TOUJOURS REMPLACER
              child.material = new THREE.MeshStandardMaterial({
                color: 0x000000,
                emissive: 0x000000,
                emissiveIntensity: 0.0,
                roughness: 0.8,
                metalness: 0.1,
                transparent: false,
                opacity: 1.0,
                side: THREE.FrontSide,
                depthWrite: true,
                depthTest: true
              });
              child.renderOrder = -10; // Encore plus prioritaire
              child.material.needsUpdate = true;

            }
          }
        });
      }
    }
  });

  // Gestion des contrôles de rotation
  useEffect(() => {
    if (!gl || !configLoaded) return;

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
        gl.domElement.style.cursor = 'grab';
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      gl.domElement.style.cursor = 'grab';
    };

    // Gestionnaire de clics (seulement si pas de drag) - IMMÉDIAT
    const handleClick = (event) => {
      if (hasDragged.current) {
        hasDragged.current = false;
        return;
      }

      // Exécuter immédiatement sans délai
      if (globeRef.current) {
        let globeGroup = null;
        
        // Trouver le groupe du Globe
        globeRef.current.traverse((child) => {
          if (child.userData && child.userData.handleClick) {
            globeGroup = child;
          }
        });
        
        if (globeGroup && globeGroup.userData.handleClick) {
          const mouse = new THREE.Vector2();
          const rect = gl.domElement.getBoundingClientRect();
          mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          
          globeGroup.userData.handleClick(mouse);
        }
      }
    };

    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('mouseup', handleMouseUp);
    gl.domElement.addEventListener('mouseleave', handleMouseUp);
    gl.domElement.addEventListener('click', handleClick);
    gl.domElement.style.cursor = 'grab';

    return () => {
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('mouseup', handleMouseUp);
      gl.domElement.removeEventListener('mouseleave', handleMouseUp);
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [gl, isLoaded, configLoaded]);

  return {
    // États
    clickedCountry,
    isLoaded,
    configLoaded,
    globeConfig,
    
    // Refs
    groupRef,
    globeRef,
    timeRef,
    
    // Fonctions
    handleCountryClick,
    handleLoad,
    getHighlightedCountry,
    getHighlightColor,
    
    // Utilitaires
    setClickedCountry
  };
}