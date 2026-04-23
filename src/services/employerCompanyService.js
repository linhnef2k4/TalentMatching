import axiosClient from '../api/axiosClient';

const employerCompanyService = {
    // 1. Lấy thông tin công ty hiện tại của HR (Để đổ data vào form)
    getMyCompany: () => {
        return axiosClient.get('/employer/companies/me');
    },

    // 2. Cập nhật thông tin công ty (PUT)
    updateMyCompany: (data) => {
        return axiosClient.put('/employer/companies/me', data);
    },

    // 3. Upload Logo công ty (POST multipart/form-data)
    uploadLogo: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosClient.post('/employer/companies/me/logo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default employerCompanyService;
