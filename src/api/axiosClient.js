// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
    // Đã thay bằng link API thật của bro
    baseURL: 'http://160.191.214.94:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor cho Request (Tự động đính kèm Token nếu có)
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Interceptor cho Response (Xử lý lỗi chung hoặc chuẩn hóa dữ liệu trả về)
axiosClient.interceptors.response.use(
    (response) => {
        // Nếu API trả về data bọc trong response.data, ta lấy luôn cho gọn
        if (response && response.data) {
            return response.data;
        }
        return response;
    },
    (error) => {
        // Xử lý lỗi toàn cục (VD: Token hết hạn -> Bắt đăng nhập lại)
        if (error.response && error.response.status === 401) {
            console.error('Token hết hạn hoặc không hợp lệ!');
            // localStorage.removeItem('access_token');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

export default axiosClient;
