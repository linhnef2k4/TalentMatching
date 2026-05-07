import axiosClient from '../api/axiosClient';

const companyService = {
    // 1. Lấy danh sách công ty (Có phân trang, tìm kiếm)
    getCompanies: (keyword = '', page = 0, size = 10) => {
        const params = new URLSearchParams({ page, size });
        if (keyword) params.append('keyword', keyword);
        return axiosClient.get(`/public/companies?${params.toString()}`);
    },

    // 2. Lấy chi tiết công ty
    getCompanyById: (id) => {
        return axiosClient.get(`/public/companies/${id}`);
    },

    // 3. Lấy danh sách Job của công ty đó (CÓ HỖ TRỢ KEYWORD NHƯ SWAGGER)
    getCompanyJobs: (id, keyword = '', page = 0, size = 10) => {
        const params = new URLSearchParams({ page, size });
        if (keyword) params.append('keyword', keyword);
        return axiosClient.get(`/public/companies/${id}/jobs?${params.toString()}`);
    },
    // === API MỚI THÊM ===
    toggleFollowCompany: (companyId) => axiosClient.post(`/candidate/companies/${companyId}/toggle-follow`),

    getFollowingCompanies: (page = 0, size = 10) =>
        axiosClient.get(`/candidate/companies/following?page=${page}&size=${size}`),
};

export default companyService;
