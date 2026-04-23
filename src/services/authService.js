import axiosClient from '../api/axiosClient';

const authService = {
    // Gọi API Login
    login: (email, password) => {
        const url = '/auth/login';
        // axiosClient đã được cấu hình sẵn baseURL, nên chỉ cần truyền path '/auth/login'
        return axiosClient.post(url, { email, password });
    },
    // API Đăng ký
    register: (userData) => {
        const url = '/auth/register';
        // Truyền lên đúng chuẩn JSON format backend yêu cầu
        return axiosClient.post(url, {
            email: userData.email,
            password: userData.password,
            fullName: userData.fullName,
            role: 'CANDIDATE', // Mặc định đăng ký ở trang này là Ứng viên (CANDIDATE)
        });
    },
    // Bước 1: Gửi yêu cầu lấy mã OTP
    forgotPassword: (email) => {
        return axiosClient.post('/auth/forgot-password', null, {
            params: { email },
        });
    },

    // Bước 2: Xác nhận OTP và đặt lại mật khẩu
    resetPassword: (email, otp, newPassword) => {
        return axiosClient.post('/auth/reset-password', null, {
            params: { email, otp, newPassword },
        });
    },
    // API Đổi Mật Khẩu (Mới thêm)
    changePassword: (oldPassword, newPassword) => {
        // Truyền params dưới dạng query chuỗi (đúng chuẩn thiết kế của API bro đưa)
        const url = `/auth/change-password?oldPassword=${encodeURIComponent(oldPassword)}&newPassword=${encodeURIComponent(newPassword)}`;

        // Vì tham số đã nằm trên URL, tham số body truyền null
        return axiosClient.post(url, null);
    },
};

export default authService;
