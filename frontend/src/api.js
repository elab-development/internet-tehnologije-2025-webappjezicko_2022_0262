import axios from "axios"
const api = axios.create({
    //baseURL: import.meta.env.VITE_API_URL,
    baseURL: "/",
    withCredentials: true // šalje cookie
})

let isRefreshing = false;
let refreshSubscribers = [];

// poziva se kada refresh uspe
function onRefreshed() {
    refreshSubscribers.forEach(callback => callback());
    refreshSubscribers = [];
}

// čeka dok refresh završi
function addRefreshSubscriber(callback) {
    refreshSubscribers.push(callback);
}

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Ako je 401 i nije već pokušao refresh
        if (error.response?.status === 401 && !originalRequest._retry) {

            if (isRefreshing) {
                return new Promise(resolve => {
                    addRefreshSubscriber(() => {
                        resolve(api(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await api.post("/api/token/refresh/");

                isRefreshing = false;
                onRefreshed();

                return api(originalRequest);

            } catch (refreshError) {
                isRefreshing = false;

                // redirect na login ako refresh failuje
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;