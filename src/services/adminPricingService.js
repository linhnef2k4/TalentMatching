import axiosClient from '~/api/axiosClient';

const adminPricingService = {
    // Xem toàn bộ danh sách gói cước
    getAllPlans: () => {
        return axiosClient.get('/admin/pricing-plans');
    },

    // Tạo gói cước mới
    createPlan: (data) => {
        return axiosClient.post('/admin/pricing-plans', data);
    },

    // Cập nhật gói cước
    updatePlan: (id, data) => {
        return axiosClient.put(`/admin/pricing-plans/${id}`, data);
    },

    // Bật/tắt trạng thái gói cước
    toggleStatus: (id) => {
        return axiosClient.patch(`/admin/pricing-plans/${id}/toggle-status`);
    },
};

export default adminPricingService;
