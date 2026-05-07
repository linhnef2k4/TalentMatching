import axiosClient from '~/api/axiosClient';

const reportService = {
    submitReport: (data) => {
        // data có thể gồm: { targetId, targetType: 'JOB', reason, description }
        return axiosClient.post('/reports', data);
    },
};

export default reportService;
