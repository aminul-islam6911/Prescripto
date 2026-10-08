import axios from "axios";

const refreshPromises = new Map();

const authConfigs = {
  admin: { header: "aToken", storageKey: "aToken" },
  doctor: { header: "dToken", storageKey: "dToken" },
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    if (error.response?.status !== 401 || !request || request._retry) {
      return Promise.reject(error);
    }

    const pathname = new URL(request.url, window.location.origin).pathname;
    const role = Object.keys(authConfigs).find((name) =>
      pathname.startsWith(`/api/${name}/`)
    );
    const authConfig = role && authConfigs[role];
    if (!authConfig || !request.headers?.[authConfig.header]) {
      return Promise.reject(error);
    }

    request._retry = true;
    let refreshPromise = refreshPromises.get(role);
    if (!refreshPromise) {
      refreshPromise = axios
        .post(
          `${import.meta.env.VITE_BACKEND_URL}/api/${role}/refresh-token`,
          {},
          { withCredentials: true }
        )
        .then(({ data }) => {
          if (!data.success || !data.token) {
            throw new Error(data.message || "Unable to refresh session");
          }
          localStorage.setItem(authConfig.storageKey, data.token);
          window.dispatchEvent(
            new CustomEvent("auth-token-refreshed", {
              detail: { key: authConfig.storageKey, token: data.token },
            })
          );
          return data.token;
        })
        .catch((refreshError) => {
          localStorage.removeItem(authConfig.storageKey);
          window.dispatchEvent(
            new CustomEvent("auth-token-refreshed", {
              detail: { key: authConfig.storageKey, token: "" },
            })
          );
          throw refreshError;
        });
      refreshPromises.set(role, refreshPromise);
    }

    try {
      const token = await refreshPromise;
      request.headers[authConfig.header] = token;
      return axios(request);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    } finally {
      if (refreshPromises.get(role) === refreshPromise) {
        refreshPromises.delete(role);
      }
    }
  }
);
