// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
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
        // FIX: Check !== undefined thay vì check Truthy.
        // Đảm bảo không bị lọt các giá trị API trả về là "", 0, hoặc false.
        if (response && response.data !== undefined) {
            return response.data;
        }
        return response;
    },
    (error) => {
        // Xử lý lỗi toàn cục (VD: Token hết hạn -> Bắt đăng nhập lại)
        if (error.response && error.response.status === 401) {
            console.error('Token hết hạn hoặc không hợp lệ!');
            // Lưu ý: Tùy luồng dự án mà bạn có thể mở comment đoạn dưới để auto-logout
            // localStorage.removeItem('access_token');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

export default axiosClient;
