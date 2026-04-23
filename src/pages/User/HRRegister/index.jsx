import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Briefcase, FileText, CheckCircle2, Link as LinkIcon, Loader2, UserCircle } from 'lucide-react';
import userService from '~/services/userService'; // Import service

const HRRegister = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Khởi tạo state đúng chuẩn Schema API
    const [formData, setFormData] = useState({
        companyName: '',
        taxCode: '',
        companyAddress: '',
        website: '',
        businessLicenseUrl: '',
        position: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await userService.requestUpgrade(formData);
            alert('Đăng ký thành công! Vui lòng chờ Admin duyệt tài khoản của doanh nghiệp nhé.');
            navigate('/'); // Đẩy về trang chủ sau khi thành công
        } catch (error) {
            console.error('Lỗi khi đăng ký HR:', error);
            alert('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng kiểm tra lại thông tin!');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header Form */}
                <div className="bg-blue-600 p-8 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Briefcase size={32} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Đăng Ký Tài Khoản Doanh Nghiệp</h1>
                    <p className="text-blue-100">Tiếp cận hàng ngàn ứng viên tiềm năng trên hệ thống AI Matching</p>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Section 1: Thông tin công ty */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                            <Building2 className="text-blue-500" size={20} /> Thông tin doanh nghiệp
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên doanh nghiệp (Đầy đủ) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="VD: Công ty TNHH Phần Mềm TalentMatch"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mã số thuế <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    name="taxCode"
                                    value={formData.taxCode}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="Nhập mã số thuế..."
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Website công ty</label>
                                <input
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    type="url"
                                    placeholder="https://"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-colors"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Địa chỉ trụ sở chính <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    name="companyAddress"
                                    value={formData.companyAddress}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-colors"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Đường dẫn Giấy phép kinh doanh (Drive/Cloud)
                                </label>
                                <div className="relative">
                                    <LinkIcon size={18} className="absolute left-4 top-3 text-gray-400" />
                                    <input
                                        name="businessLicenseUrl"
                                        value={formData.businessLicenseUrl}
                                        onChange={handleChange}
                                        type="url"
                                        placeholder="Link xem giấy phép kinh doanh..."
                                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Người liên hệ */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                            <UserCircle className="text-blue-500" size={20} /> Đại diện liên hệ
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Chức vụ của bạn <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="VD: HR Manager, CEO, Trưởng phòng nhân sự..."
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-colors"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Thông tin cá nhân (Email, SĐT) sẽ được lấy tự động từ tài khoản của bạn.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-md ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" /> Đang gửi yêu cầu...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={24} /> Gửi Yêu Cầu Duyệt Doanh Nghiệp
                                </>
                            )}
                        </button>
                        <p className="text-center text-sm text-gray-500 mt-4">
                            Bằng việc đăng ký, bạn đồng ý với các{' '}
                            <span className="text-blue-600 cursor-pointer hover:underline">Điều khoản dịch vụ</span> của
                            chúng tôi.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HRRegister;
