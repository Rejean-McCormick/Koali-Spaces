import type { ComponentType } from 'react';

export type RegisteredSurfaceComponentProps = {
  moduleId: string;
  routeId: string;
};

/**
 * Closed registry: add only explicit local imports here. Never derive an import path
 * from a Space definition or module manifest.
 */
export const REGISTERED_SURFACE_COMPONENTS: Readonly<Record<string, ComponentType<RegisteredSurfaceComponentProps>>> = Object.freeze({});
