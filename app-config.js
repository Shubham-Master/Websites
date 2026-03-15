(function initUnmuteConfig() {
  const hostname = window.location.hostname;
  const isLocalHost =
    window.location.protocol === "file:" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === "::1";

  const existingConfig =
    typeof window.UNMUTE_APP_CONFIG === "object" && window.UNMUTE_APP_CONFIG !== null
      ? window.UNMUTE_APP_CONFIG
      : {};

  window.UNMUTE_APP_CONFIG = {
    ...existingConfig,
    apiBaseUrl:
      existingConfig.apiBaseUrl ||
      (isLocalHost ? "http://localhost:4000/api/v1" : "https://unmute-backend-rkl1.onrender.com/api/v1")
  };
})();
