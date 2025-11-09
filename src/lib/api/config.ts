/**
 * API Configuration
 * Manages base URLs for direct service access vs API Gateway routing
 */

// Toggle this to switch between direct service access and API Gateway
const USE_API_GATEWAY = false;

// API Gateway base URL (when auth service is ready)
const API_GATEWAY_URL = 'http://localhost:8080';

// Direct service URLs (for development)
const DIRECT_SERVICE_URLS = {
  payment: 'http://localhost:8083',
  auth: 'http://localhost:8082',
  automobile: 'http://localhost:8080',
  notification: 'http://localhost:8081',
};

/**
 * Get the appropriate base URL for a service
 * @param service - The service name (payment, auth, automobile, notification)
 * @returns The base URL to use for API calls
 */
export const getApiUrl = (service: keyof typeof DIRECT_SERVICE_URLS = 'payment'): string => {
  if (USE_API_GATEWAY) {
    return API_GATEWAY_URL;
  }
  return DIRECT_SERVICE_URLS[service];
};

/**
 * Build full API endpoint URL
 * @param service - The service name
 * @param path - The API path (should start with /)
 * @returns Complete URL
 */
export const buildApiUrl = (service: keyof typeof DIRECT_SERVICE_URLS, path: string): string => {
  const baseUrl = getApiUrl(service);
  return `${baseUrl}${path}`;
};

/**
 * Check if using API Gateway mode
 */
export const isUsingGateway = (): boolean => USE_API_GATEWAY;

export default {
  getApiUrl,
  buildApiUrl,
  isUsingGateway,
};
