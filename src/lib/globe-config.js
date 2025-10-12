/**
 * Configuration centralisée pour Globe3D
 * Gère le chargement de la configuration et les paramètres par défaut
 */

// Configuration par défaut du globe
export const DEFAULT_GLOBE_CONFIG = {
  countryColor: 0x000000,
  borderColor: 0xffffff,
  globeFillColor: 0x000000,
  highlightColor: 0xffffff,
  rotationSpeed: 0.002,
  countryScale: 1.0,
  borderScale: 1.01,
  globeFillScale: 0.98,
  highlightScale: 1.02, // Extrusion très légère par défaut
  floatingAmplitude: 0.15,
  floatingSpeed: 0.5
};

// Configuration appliquée (sera mise à jour avec le fichier config)
let globeConfig = { ...DEFAULT_GLOBE_CONFIG };

/**
 * Charge la configuration depuis le fichier JSON
 * @param {string} configUrl - URL du fichier de configuration
 * @returns {Promise<Object|null>} Configuration chargée ou null en cas d'erreur
 */
export async function loadGlobeConfig(configUrl = null) {
  const url = configUrl || `${import.meta.env.BASE_URL}atlas_ico_subdiv_7.config.json`;
  
  try {
    const response = await fetch(url);
    if (response.ok) {
      const config = await response.json();
      
      // Appliquer l'extrusion radiale depuis la config
      // Si above = 0, pas d'extrusion (pays au niveau du globeFill)
      globeConfig.highlightScale = 1.0 + (config.extrusions?.country?.above || 0);
      globeConfig.countryScale = 1.0 - (config.extrusions?.country?.below || 0);
      
      // Appliquer d'autres paramètres si présents
      if (config.border) {
        // Conversion des unités si nécessaire
        globeConfig.borderScale = 1.0 + (config.border.height || 0);
      }
      

      return config;
    }
  } catch (error) {

  }
  return null;
}

/**
 * Obtient la configuration actuelle du globe
 * @returns {Object} Configuration actuelle
 */
export function getGlobeConfig() {
  return { ...globeConfig };
}

/**
 * Met à jour la configuration du globe
 * @param {Object} newConfig - Nouvelle configuration partielle
 */
export function updateGlobeConfig(newConfig) {
  globeConfig = { ...globeConfig, ...newConfig };
}

/**
 * Remet la configuration aux valeurs par défaut
 */
export function resetGlobeConfig() {
  globeConfig = { ...DEFAULT_GLOBE_CONFIG };
}

/**
 * Mapping langue -> pays pour la sélection
 */
export const LANG_TO_COUNTRY = {
  'en': 'UNITED_STATES_OF_AMERICA',
  'es': 'SPAIN',
  'fr': 'FRANCE'
};

/**
 * Configuration des couleurs pour les états des pays
 */
export const COUNTRY_COLORS = {
  DEFAULT: 0x000000,
  LANGUAGE_SELECTED: 0x3fb950,
  CLICKED: 0x1f6feb,
  BORDER: 0xffffff,
  GLOBE_FILL: 0x000000
};

/**
 * Configuration de l'aura/émission pour l'effet Bloom
 */
export const AURA_CONFIG = {
  LANGUAGE_SELECTED: {
    emissive: 0x56d364,
    emissiveIntensity: 1.5
  },
  CLICKED: {
    emissive: 0x58a6ff,
    emissiveIntensity: 1.5
  },
  DEFAULT_BACKGROUND: {
    emissive: 0xffffff,
    emissiveIntensity: 0.3
  }
};