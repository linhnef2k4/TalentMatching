import axiosClient from '../api/axiosClient';

const aiService = {
    /**
     * Gọi API Backend để AI gợi ý / tối ưu nội dung CV
     * @param {string} content - Nội dung thô ứng viên nhập vào
     */
    generateCV: (content) => {
        return axiosClient.post(
            '/candidate/generate-cv',
            { raw_info: content },
            { timeout: 30000 }, // Tối đa 30s, quá giờ là ngắt request
        );
    },
    /**
     * Gọi API Backend để AI gợi ý Job Description
     * @param {string} content - Nội dung yêu cầu công việc thô
     */
    generateJD: (content) => {
        return axiosClient.post('/hr/generate-jd', {
            raw_info: content,
        });
    },
    // Lấy cấu hình AI
    getSettings: () => {
        return axiosClient.get('/admin/ai-settings');
    },

    // Cập nhật cấu hình AI
    updateSettings: (data) => {
        return axiosClient.put('/admin/ai-settings', data);
    },
};

export default aiService;
