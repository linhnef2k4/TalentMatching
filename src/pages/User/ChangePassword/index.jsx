import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import authService from '~/services/authService'; // Nhớ import Service vào nhé

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // State quản lý việc ẩn/hiện mật khẩu cho từng ô
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Validate cơ bản
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
            return;
        }
        if (formData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
            return;
        }

        setIsSubmitting(true);

        try {
            // Gọi API đổi mật khẩu
            const response = await authService.changePassword(formData.currentPassword, formData.newPassword);

            console.log('Đổi pass thành công:', response);

            // Báo thành công và Clear form
            setMessage({ type: 'success', text: 'Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới nhé.' });
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Lỗi đổi mật khẩu:', error);
            // Bắt lỗi từ Backend (Ví dụ: Sai mật khẩu cũ)
            if (error.response && error.response.data && typeof error.response.data === 'string') {
                // Nếu backend trả lỗi dạng chuỗi thuần
                setMessage({ type: 'error', text: error.response.data });
            } else if (error.response && error.response.data && error.response.data.message) {
                // Nếu backend trả lỗi dạng JSON Object
                setMessage({ type: 'error', text: error.response.data.message });
            } else {
                setMessage({ type: 'error', text: 'Có lỗi xảy ra, vui lòng thử lại sau.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md mx-auto">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium mb-6 w-max transition"
                >
                    <ArrowLeft size={20} /> Về trang chủ
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 text-center bg-blue-50/50">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <ShieldCheck size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Đổi Mật Khẩu</h1>
                        <p className="text-gray-500 text-sm">
                            Bảo mật tài khoản của bạn bằng một mật khẩu mạnh và khó đoán.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Hiển thị thông báo lỗi hoặc thành công */}
                        {message.text && (
                            <div
                                className={`p-4 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}
                            >
                                {message.text}
                            </div>
                        )}

                        {/* Mật khẩu hiện tại */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                <input
                                    required
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    type={showCurrent ? 'text' : 'password'}
                                    placeholder="Nhập mật khẩu cũ..."
                                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Mật khẩu mới */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu mới</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                <input
                                    required
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    type={showNew ? 'text' : 'password'}
                                    placeholder="Nhập mật khẩu mới..."
                                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Xác nhận mật khẩu mới */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Xác nhận mật khẩu mới
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                <input
                                    required
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="Nhập lại mật khẩu mới..."
                                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full font-bold text-lg py-3.5 rounded-xl transition-all shadow-md mt-4 flex justify-center items-center gap-2
                ${isSubmitting ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/30'}`}
                        >
                            {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : 'Cập nhật mật khẩu'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
