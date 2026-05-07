import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import authService from '~/services/authService';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (formData.newPassword !== formData.confirmPassword) {
            return setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
        }
        if (formData.newPassword.length < 6) {
            return setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
        }

        setIsSubmitting(true);
        try {
            await authService.changePassword(formData.currentPassword, formData.newPassword);
            setMessage({ type: 'success', text: 'Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới nhé.' });
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra, vui lòng thử lại sau.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200 bg-slate-50/50 rounded-t-xl">
                <h2 className="text-lg font-bold text-slate-900">Đổi Mật Khẩu</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                    Bảo mật tài khoản của bạn bằng một mật khẩu mạnh và khó đoán.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {message.text && (
                    <div
                        className={`p-4 rounded-xl text-sm font-bold border ${message.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}
                    >
                        {message.text}
                    </div>
                )}

                <div className="space-y-4 max-w-lg">
                    {/* Mật khẩu hiện tại */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Mật khẩu hiện tại <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3 text-slate-400" size={18} />
                            <input
                                required
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                type={showCurrent ? 'text' : 'password'}
                                placeholder="Nhập mật khẩu cũ..."
                                className="w-full pl-11 pr-12 py-2.5 bg-white border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all font-medium text-slate-800"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-4 top-3 text-slate-400 hover:text-blue-600"
                            >
                                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Mật khẩu mới */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3 text-slate-400" size={18} />
                            <input
                                required
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                type={showNew ? 'text' : 'password'}
                                placeholder="Nhập mật khẩu mới..."
                                className="w-full pl-11 pr-12 py-2.5 bg-white border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all font-medium text-slate-800"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-4 top-3 text-slate-400 hover:text-blue-600"
                            >
                                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Xác nhận mật khẩu mới */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3 text-slate-400" size={18} />
                            <input
                                required
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                type={showConfirm ? 'text' : 'password'}
                                placeholder="Nhập lại mật khẩu mới..."
                                className="w-full pl-11 pr-12 py-2.5 bg-white border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all font-medium text-slate-800"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-3 text-slate-400 hover:text-blue-600"
                            >
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                        {isSubmitting ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword;
