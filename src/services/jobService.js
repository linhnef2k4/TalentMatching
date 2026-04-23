import axiosClient from '../api/axiosClient';

const jobService = {
    // Lấy danh sách việc làm public (Không cần đăng nhập)
    getPublicJobs: (page = 0, size = 10) => {
        return axiosClient.get(`/jobs/public?page=${page}&size=${size}`);
    },
    // API Tạo bài tuyển dụng mới (MỚI THÊM)
    createJob: (jobData) => {
        return axiosClient.post('/jobs', jobData);
    },
    getMyJobs: (page = 0, size = 50) => {
        return axiosClient.get(`/jobs/my-jobs?page=${page}&size=${size}`);
    },
    // Cập nhật Job
    updateJob: (id, jobData) => axiosClient.put(`/jobs/${id}`, jobData),

    // Xóa Job
    deleteJob: (id) => axiosClient.delete(`/jobs/${id}`),
    // chi tiết job
    getJobById: (id) => {
        return axiosClient.get(`/jobs/${id}`);
    },
    // Toggle Save Job (Lưu / Bỏ lưu)
    toggleSaveJob: (jobId) => {
        return axiosClient.post(`/candidate/saved-jobs/${jobId}/toggle`);
    },
    // check lưu job
    checkSavedJob: (jobId) => {
        return axiosClient.get(`/candidate/saved-jobs/${jobId}/check`);
    },
    // Lấy danh sách Việc làm đã lưu (Của ứng viên)
    getSavedJobs: async (page = 0, size = 10) => {
        return await axiosClient.get(`/candidate/saved-jobs?page=${page}&size=${size}`);
    },
};
export default jobService;
