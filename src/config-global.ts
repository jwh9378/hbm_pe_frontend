import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
};

export const CONFIG: ConfigValue = {
  appName: 'Minimal UI',
  appVersion: packageJson.version,
};

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
