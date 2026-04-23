import axiosClient from '../api/axiosClient';

const applicationService = {
    getEmployerStats: () => {
        return axiosClient.get('/applications/employer/stats');
    },
    getMonthlyStats: () => {
        return axiosClient.get('/applications/employer/monthly-stats');
    },
    // Upload CV (Dùng FormData để gửi file)
    uploadCv: (file) => {
        const formData = new FormData();
        formData.append('file', file); // 'file' là tên key backend thường dùng để hứng
        return axiosClient.post('/cv/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Gửi Form Ứng tuyển
    applyJob: (data) => {
        return axiosClient.post('/applications/apply', data);
    },
    // lấy danh sách đã ứng tuyển

    getMyApplications: async (page = 0, size = 10) => {
        return await axiosClient.get(`/applications/my-applications?page=${page}&size=${size}`);
    },
    // (API MỚI 1) Xem danh sách hồ sơ của 1 JOB
    getApplicationsByJob: async (jobId, page = 0, size = 10) => {
        return await axiosClient.get(`/applications/job/${jobId}?page=${page}&size=${size}`);
    },

    // (API MỚI 2) Xem chi tiết 1 đơn ứng tuyển (Bao gồm phân tích AI)
    getApplicationDetail: async (appId) => {
        return await axiosClient.get(`/applications/${appId}/detail`);
    },

    // (API MỚI 3) Cập nhật trạng thái và thêm Ghi chú
    updateApplicationStatus: async (appId, status, notes = '') => {
        // Dùng params vì Swagger yêu cầu status và notes là dạng Query Parameter (không phải Body)
        return await axiosClient.patch(`/applications/${appId}/status`, null, {
            params: { status, notes },
        });
    },
    quickMatch: async (payload) => {
        // payload = { cvUrls: [], jdUrl: "", jdText: "", customRules: "", jobId: null }
        // Lưu ý: Endpoint là /v1/ai-core/quick-match vì baseURL trong axiosClient đã có sẵn '/api'
        return await axiosClient.post('/v1/ai-core/quick-match', payload);
    },
    //quan lý danh sach cho candidate
    getStats: () => {
        return axiosClient.get('/applications/stats');
    },
};

export default applicationService;
