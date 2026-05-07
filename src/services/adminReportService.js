import axiosClient from '~/api/axiosClient';

const adminReportService = {
    // Lấy danh sách báo cáo (Có phân trang và lọc theo trạng thái)
    getReports: (status, page = 0, size = 20) => {
        const params = { page, size };
        if (status && status !== 'ALL') {
            params.status = status;
        }
        return axiosClient.get('/admin/reports', { params });
    },

    // Xử lý báo cáo
    resolveReport: (id, status, adminNote) => {
        return axiosClient.patch(`/admin/reports/${id}/resolve`, null, {
            params: { status, adminNote },
        });
    },
};

export default adminReportService;
