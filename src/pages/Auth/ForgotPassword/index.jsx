import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, CheckCircle2, ShieldCheck, Lock, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import authService from '~/services/authService';

const ForgotPassword = () => {
    const navigate = useNavigate();

    // States quản lý luồng UI (1: Nhập Email, 2: Nhập OTP + Pass mới, 3: Thành công)
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // States lưu trữ dữ liệu form
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Hàm xử lý Bước 1: Gửi OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!email) return toast.error('Vui lòng nhập email của bạn!');

        setIsSubmitting(true);
        toast.loading('Đang gửi mã xác nhận...', { id: 'auth-toast' });

        try {
            await authService.forgotPassword(email);
            toast.success('Mã OTP đã được gửi đến email của bạn!', { id: 'auth-toast' });
            setStep(2); // Chuyển sang bước nhập OTP
        } catch (error) {
            console.error('Lỗi gửi OTP:', error);
            toast.error(error.response?.data?.message || 'Không thể gửi email. Vui lòng kiểm tra lại!', {
                id: 'auth-toast',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hàm xử lý Bước 2: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!otp || !newPassword || !confirmPassword) {
            return toast.error('Vui lòng điền đầy đủ thông tin!');
        }
        if (newPassword !== confirmPassword) {
            return toast.error('Mật khẩu xác nhận không trùng khớp!');
        }
        if (newPassword.length < 6) {
            return toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
        }

        setIsSubmitting(true);
        toast.loading('Đang xác thực và đổi mật khẩu...', { id: 'auth-toast' });

        try {
            await authService.resetPassword(email, otp, newPassword);
            toast.success('Đổi mật khẩu thành công!', { id: 'auth-toast' });
            setStep(3); // Chuyển sang màn hình thành công
        } catch (error) {
            console.error('Lỗi reset pass:', error);
            toast.error(error.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn!', { id: 'auth-toast' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4 relative">
            <Toaster position="top-right" />

            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Abstract background shape */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-50 z-0"></div>

                <div className="relative z-10">
                    {/* Nút quay lại (Ẩn ở màn hình thành công) */}
                    {step !== 3 && (
                        <div className="text-left mb-6">
                            <button
                                type="button"
                                onClick={() => (step === 2 ? setStep(1) : navigate('/login'))}
                                className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition"
                            >
                                <ArrowLeft size={20} />
                                {step === 2 ? 'Quay lại' : 'Trở về đăng nhập'}
                            </button>
                        </div>
                    )}

                    {/* BƯỚC 1: NHẬP EMAIL */}
                    {step === 1 && (
                        <div className="animate-in fade-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-white">
                                <KeyRound size={36} />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">Quên Mật Khẩu?</h1>
                            <p className="text-gray-500 mb-8">
                                Đừng lo lắng! Hãy nhập email bạn đã đăng ký, chúng tôi sẽ gửi một mã OTP gồm 6 chữ số để
                                đặt lại mật khẩu.
                            </p>

                            <form onSubmit={handleSendOTP} className="space-y-6 text-left">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email của bạn
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                        <input
                                            required
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="hr@technova.com"
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !email}
                                    className="w-full font-bold text-lg py-3.5 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/30 active:scale-95"
                                >
                                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : null}
                                    {isSubmitting ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* BƯỚC 2: NHẬP OTP VÀ MẬT KHẨU MỚI */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-white">
                                <ShieldCheck size={36} />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">Đặt Lại Mật Khẩu</h1>
                            <p className="text-gray-500 mb-8">
                                Mã OTP đã được gửi tới <span className="font-bold text-gray-800">{email}</span>. Vui
                                lòng kiểm tra hộp thư của bạn.
                            </p>

                            <form onSubmit={handleResetPassword} className="space-y-5 text-left">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Mã xác nhận (OTP)
                                    </label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                        <input
                                            required
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="Nhập mã 6 số"
                                            maxLength={6}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono tracking-widest text-lg"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                        <input
                                            required
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Tối thiểu 6 ký tự"
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Xác nhận mật khẩu
                                    </label>
                                    <div className="relative">
                                        <CheckCircle2 className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                        <input
                                            required
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Nhập lại mật khẩu mới"
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full font-bold text-lg py-3.5 mt-2 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 disabled:bg-indigo-400 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/30 active:scale-95"
                                >
                                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : null}
                                    {isSubmitting ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* BƯỚC 3: THÀNH CÔNG */}
                    {step === 3 && (
                        <div className="py-8 animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm">
                                <CheckCircle2 size={48} />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 mb-4">Hoàn Tất!</h1>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Mật khẩu của tài khoản <br />
                                <span className="font-bold text-gray-900">{email}</span> <br />
                                đã được đặt lại thành công.
                            </p>
                            <Link
                                to="/login"
                                className="w-full inline-flex justify-center items-center font-bold text-lg py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-500/30 transition-all active:scale-95"
                            >
                                Đăng nhập ngay
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
