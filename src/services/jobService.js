import axiosClient from '../api/axiosClient';

const jobService = {
    // Lấy danh sách việc làm public (Không cần đăng nhập)
    getPublicJobs: (page = 0, size = 10, filters = {}) => {
        // Lọc bỏ các tham số rỗng hoặc mặc định để URL sạch hơn
        const cleanFilters = {};
        Object.keys(filters).forEach((key) => {
            if (filters[key] && filters[key] !== 'Tất cả' && filters[key] !== 'Địa điểm') {
                cleanFilters[key] = filters[key];
            }
        });

        const params = new URLSearchParams({ page, size, ...cleanFilters });
        return axiosClient.get(`/jobs/public?${params.toString()}`);
    },
    // api tìm kiếm job
    searchJobs: (page = 0, size = 10, filters = {}) => {
        const params = new URLSearchParams({ page, size });

        if (filters.title) params.append('title', filters.title);
        if (filters.location && filters.location !== 'Địa điểm') params.append('location', filters.location);
        if (filters.jobType && filters.jobType !== 'Tất cả') params.append('jobType', filters.jobType);
        if (filters.minSalary) params.append('minSalary', filters.minSalary);

        // Truyền thêm sort nếu cần (Backend Spring Data JPA tự động nhận param sort)
        if (filters.sort) params.append('sort', filters.sort);

        return axiosClient.get(`/jobs/search?${params.toString()}`);
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
