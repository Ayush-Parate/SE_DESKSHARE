// Production environment configuration
// During CI/CD or Render builds, 'REPLACE_API_URL' is replaced by render-build.sh
// with the actual backend host URL (e.g., https://deskshare-api.onrender.com).
// For Nginx reverse-proxy deployments, REPLACE_API_URL is stripped to leave '/api/v1'.
export const environment = {
  production: true,
  apiBaseUrl: 'REPLACE_API_URL/api/v1'
};
