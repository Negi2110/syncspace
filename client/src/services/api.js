import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // send cookies with requests
});

// Request interceptor — attach token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying
        if (
            error.response?.status === 401 &&
            error.response?.data?.error?.code === 'TOKEN_EXPIRED' &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const res = await axios.post(
                    `${API_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newToken = res.data.data.accessToken;
                localStorage.setItem('accessToken', newToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed — logout user
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;