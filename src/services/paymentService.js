import axiosClient from '~/api/axiosClient';

const paymentService = {
    // Lấy danh sách gói cước
    getPlans: () => {
        return axiosClient.get('/payments/plans');
    },

    // Tạo URL thanh toán VNPay
    createPaymentUrl: (planId) => {
        // ĐÃ SỬA: Đổi tên endpoint và truyền planId dưới dạng query string (?planId=...)
        return axiosClient.post(`/payments/create-payment?planId=${planId}`);
    },

    // Xác thực callback từ VNPay
    verifyCallback: (params) => {
        return axiosClient.get('/payments/vnpay-callback', { params });
    },
};

export default paymentService;
