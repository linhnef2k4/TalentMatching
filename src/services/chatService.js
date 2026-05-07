import axiosClient from '../api/axiosClient';

const chatService = {
    // 1. Lấy tổng số tin nhắn chưa đọc
    getUnreadCount: () => axiosClient.get('/chat/unread-count'),

    // 2. Lấy danh sách các phòng chat
    getConversations: () => axiosClient.get('/chat/conversations'),

    // 3. Lấy lịch sử tin nhắn của 1 phòng (Có phân trang)
    // Mặc định gọi page 0, size 20 như test trên Swagger
    getMessages: (conversationId, page = 0, size = 20) =>
        axiosClient.get(`/chat/conversations/${conversationId}/messages`, {
            params: { page, size },
        }),

    // 4. Đánh dấu đã đọc
    markAsRead: (conversationId) => axiosClient.put(`/chat/conversations/${conversationId}/read`),

    // 5. Khởi tạo hoặc lấy phòng chat với một người khác (Thêm mới từ Swagger)
    initConversation: (recipientId) => axiosClient.post(`/chat/conversations/with/${recipientId}`),

    sendMessage: (payload) => {
        return axiosClient.post('/chat/send', payload);
    },
};

export default chatService;
