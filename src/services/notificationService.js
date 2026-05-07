import axiosClient from '../api/axiosClient';

const notificationService = {
    getNotifications: (page = 0, size = 10) => {
        return axiosClient.get(`/notifications?page=${page}&size=${size}`);
    },
    getUnreadCount: () => {
        return axiosClient.get('/notifications/unread-count');
    },
    markAllAsRead: () => {
        // Thêm {} vào tham số thứ 2
        return axiosClient.patch('/notifications/read-all', {});
    },
    markAsRead: (id) => {
        // Thêm {} vào tham số thứ 2
        return axiosClient.patch(`/notifications/${id}/read`, {});
    },
    deleteNotification: (id) => {
        return axiosClient.delete(`/notifications/${id}`);
    },
};

export default notificationService;
