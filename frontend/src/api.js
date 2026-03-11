import axios from "axios"

console.log("MOJ API LINK JE:", import.meta.env.VITE_API_URL);

const api = axios.create({
    baseURL: "https://jezicko-backend-495609328932.europe-west3.run.app",
    //baseURL: import.meta.env.VITE_API_URL,
    //baseURL: '/',
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
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refresh");
                
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/token/refresh/`, {
                    refresh: refreshToken
                });

                if (res.status === 200) {
                    localStorage.setItem("access", res.data.access);
                    
                    api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                localStorage.clear();
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access"); 
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const name = 'csrftoken';
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        if (cookieValue) {
            config.headers['X-CSRFToken'] = cookieValue;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;