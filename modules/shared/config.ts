export type Environment = 'development' | 'production' | 'testing';

export interface AppConfig {
  environment: Environment;
  apiUrl: string;
}

const defaultConfig: AppConfig = {
  environment: 'development',
  apiUrl: 'http://localhost:5001',
};

/**
 * Load configuration based on current environment
 */
function loadConfig(): AppConfig {
  const environment = (import.meta.env.VITE_NODE_ENV || process.env.NODE_ENV || 'development') as Environment;

  const config: AppConfig = {
    ...defaultConfig,
    environment,
    apiUrl: import.meta.env.VITE_BACKEND_URL || defaultConfig.apiUrl,
  };

  return config;
}

// Create and export the configuration singleton
export const config = loadConfig();
export const isDevelopment = () => config.environment === 'development';
export const isProduction = () => config.environment === 'production';
export const isTest = () => config.environment === 'testing';
