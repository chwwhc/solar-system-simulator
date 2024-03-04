import { vec3 } from 'gl-matrix';

const RADIUS_UNIT: number = 1;
const TRANSLATION_UNIT: number = 100;
const ROTATION_UNIT: number = 0.001;

export enum Planet {
    Mercury = 'Mercury',
    Venus = 'Venus',
    Earth = 'Earth',
    Mars = 'Mars',
    Jupiter = 'Jupiter',
    Saturn = 'Saturn',
    Uranus = 'Uranus',
    Neptune = 'Neptune',
};

export enum Ring {
    Saturn = 'Saturn',
    Uranus = 'Uranus',
};

export enum Star {
    Sun = 'Sun',
};

export const planetRadius: Map<Planet, number> = new Map([
    [Planet.Mercury, 0.38 * RADIUS_UNIT],
    [Planet.Venus, 0.95 * RADIUS_UNIT],
    [Planet.Earth, 1 * RADIUS_UNIT],
    [Planet.Mars, 0.53 * RADIUS_UNIT],
    [Planet.Jupiter, 11.2 * RADIUS_UNIT],
    [Planet.Saturn, 9.45 * RADIUS_UNIT],
    [Planet.Uranus, 4 * RADIUS_UNIT],
    [Planet.Neptune, 3.88 * RADIUS_UNIT],
]);
export const ringRadius: Map<Ring, [number, number]> = new Map([
    [Ring.Saturn, [10 * RADIUS_UNIT, 15 * RADIUS_UNIT]],
    [Ring.Uranus, [4.65 * RADIUS_UNIT, 6.45 * RADIUS_UNIT]],
]);
export const starRadius: Map<Star, number> = new Map([
    [Star.Sun, 109.2 * RADIUS_UNIT],
]);

export const planetTextureUrl: Map<Planet, string> = new Map([
    [Planet.Mercury, 'assets/textures/mercury.jpg'],
    [Planet.Venus, 'assets/textures/venus.jpg'],
    [Planet.Earth, 'assets/textures/earth.jpg'],
    [Planet.Mars, 'assets/textures/mars.jpg'],
    [Planet.Jupiter, 'assets/textures/jupiter.jpg'],
    [Planet.Saturn, 'assets/textures/saturn.jpg'],
    [Planet.Uranus, 'assets/textures/uranus.jpg'],
    [Planet.Neptune, 'assets/textures/neptune.jpg'],
]);
export const ringTextureUrl: Map<Ring, string> = new Map([
    [Ring.Saturn, 'assets/textures/saturnRing.jpg'],
    [Ring.Uranus, 'assets/textures/uranusRing.jpg'],
]);
export const starTextureUrl: Map<Star, string> = new Map([
    [Star.Sun, 'assets/textures/sun.jpg'],
]);

export const planetTranslation: Map<Planet, vec3> = new Map([
    [Planet.Mercury, vec3.fromValues(0.387 * TRANSLATION_UNIT, 0, 0)],
    [Planet.Venus, vec3.fromValues(0.723 * TRANSLATION_UNIT, 0, 0)],
    [Planet.Earth, vec3.fromValues(1 * TRANSLATION_UNIT, 0, 0)],
    [Planet.Mars, vec3.fromValues(1.524 * TRANSLATION_UNIT, 0, 0)],
    [Planet.Jupiter, vec3.fromValues(5.203 * TRANSLATION_UNIT, 0, 0)],
    [Planet.Saturn, vec3.fromValues(9.537 * TRANSLATION_UNIT, 0, 0)],
    [Planet.Uranus, vec3.fromValues(19.191 * TRANSLATION_UNIT, 0, 0)],
    [Planet.Neptune, vec3.fromValues(30.069 * TRANSLATION_UNIT, 0, 0)],
]);
export const ringTranslation: Map<Ring, vec3> = new Map([
    [Ring.Saturn, vec3.fromValues(9.537 * TRANSLATION_UNIT, 0, 0)],
    [Ring.Uranus, vec3.fromValues(19.191 * TRANSLATION_UNIT, 0, 0)],
]);
export const starTranslation: Map<Star, vec3> = new Map([
    [Star.Sun, vec3.fromValues(0, 0, 0)],
]);

export const planetRotationSpeed: Map<Planet, number> = new Map([
    [Planet.Mercury, 0.241 * ROTATION_UNIT],
    [Planet.Venus, 0.615 * ROTATION_UNIT],
    [Planet.Earth, 1 * ROTATION_UNIT],
    [Planet.Mars, 1.03 * ROTATION_UNIT],
    [Planet.Jupiter, 0.415 * ROTATION_UNIT],
    [Planet.Saturn, 0.445 * ROTATION_UNIT],
    [Planet.Uranus, 0.72 * ROTATION_UNIT],
    [Planet.Neptune, 0.67 * ROTATION_UNIT],
]);
export const ringRotationSpeed: Map<Ring, number> = new Map([
    [Ring.Saturn, 0.445 * ROTATION_UNIT],
    [Ring.Uranus, 0.72 * ROTATION_UNIT],
]);
export const starRotationSpeed: Map<Star, number> = new Map([
    [Star.Sun, 24.47 * ROTATION_UNIT],
]);