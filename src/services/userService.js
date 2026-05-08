// src/services/userService.js
import axiosClient from '../api/axiosClient';

const userService = {
    // 1. Lấy thông tin cá nhân hiện tại
    getProfile: () => {
        const url = '/users/me';
        return axiosClient.get(url);
    },

    // 2. Cập nhật thông tin cá nhân (Tên, SĐT)
    updateProfile: (data) => {
        const url = '/users/me';
        return axiosClient.put(url, data);
    },

    // 3. Upload Avatar
    updateAvatar: (file) => {
        const url = '/users/avatar';
        const formData = new FormData();
        formData.append('file', file);

        // Đổi từ axiosClient.put thành axiosClient.post
        return axiosClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    // Gửi yêu cầu nâng cấp tài khoản lên Employer
    requestUpgrade: (data) => {
        return axiosClient.post('/users/request-upgrade', data);
    },
    // MỚI THÊM CHO ADMIN: Lấy danh sách chờ duyệt
    getPendingEmployers: () => {
        return axiosClient.get('/users/pending');
    },

    // MỚI THÊM CHO ADMIN: Duyệt làm Employer
    approveEmployer: (companyId) => {
        return axiosClient.put(`/users/${companyId}/approve`);
    },

    // MỚI THÊM CHO ADMIN: Từ chối làm Employer
    rejectEmployer: (companyId, reason) => {
        // API dùng Query String cho reason
        return axiosClient.put(`/users/${companyId}/reject?reason=${encodeURIComponent(reason)}`);
    },
    // AI Đề xuất ứng viên
    getMatchedJobs: (candidateId) => {
        return axiosClient.get(`/v1/ai-core/candidates/${candidateId}/jobs`);
    },
    // 1. Lấy danh sách user (Có bộ lọc và phân trang)
    getUsers: (params) => {
        // params có thể chứa: keyword, role, isActive, page, size
        return axiosClient.get('/admin/users', { params });
    },

    // 2. Lấy chi tiết 1 user
    getUserDetails: (id) => {
        return axiosClient.get(`/admin/users/${id}`);
    },

    // 3. Khóa / Mở khóa tài khoản
    updateUserStatus: (id, isActive, reason = '') => {
        return axiosClient.patch(`/admin/users/${id}/status`, null, {
            params: { isActive, reason },
        });
    },

    // 4. Cấp quyền hoặc giáng chức
    updateUserRole: (id, newRole) => {
        return axiosClient.patch(`/admin/users/${id}/role`, null, {
            params: { newRole },
        });
    },

    // 5. Reset mật khẩu khẩn cấp
    resetUserPassword: (id, newPassword) => {
        return axiosClient.post(`/admin/users/${id}/reset-password`, null, {
            params: { newPassword },
        });
    },
    // API lấy danh sách ứng viên có phân trang
    getCandidates: (page = 0, size = 12) => {
        return axiosClient.get(`/users/candidates?page=${page}&size=${size}`);
    },
    // API lấy chi tiết ứng viên (Tự động ghi log Profile View)
    getCandidateById: (id) => {
        return axiosClient.get(`/candidates/${id}`);
    },
    // THÊM API MỚI VÀO ĐÂY:
    downloadCvCandidate: (candidateId) => {
        return axiosClient.get(`/hr/${candidateId}/download-cv`);
    },
    // Lượt xem hồ sơ
    getProfileViews: (page = 0, size = 10) => {
        return axiosClient.get(`/candidates/me/who-viewed?page=${page}&size=${size}`);
    },
};

export default userService;
