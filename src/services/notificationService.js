import axiosClient from '../api/axiosClient';

const notificationService = {
    // 1. Lấy danh sách thông báo
    getNotifications: (page = 0, size = 10) => {
        return axiosClient.get(`/notifications?page=${page}&size=${size}`);
    },

    // 2. Đánh dấu tất cả là đã đọc
    markAllAsRead: () => {
        return axiosClient.patch('/notifications/read-all');
    },
};

export default notificationService;
