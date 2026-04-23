import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Rocket,
    ArrowRight,
    Star,
    Users,
} from 'lucide-react';
import authService from '~/services/authService';

const SignUp = () => {
    const navigate = useNavigate();

    // UI State
    const [showPassword, setShowPassword] = useState(false);

    // Form & API State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        // 1. Kiểm tra Validate cơ bản ở Frontend
        if (password.length < 6) {
            setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg('Xác nhận mật khẩu không khớp!');
            return;
        }

        // 2. Gọi API Đăng ký
        setIsLoading(true);
        try {
            const userData = { fullName, email, password };
            const response = await authService.register(userData);

            console.log('Đăng ký thành công:', response);

            // Báo thành công và tự động chuyển sang trang Login sau 2 giây
            setSuccessMsg('Đăng ký thành công! Đang chuyển hướng đến đăng nhập...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMsg(error.response.data.message); // Ví dụ: "Email đã tồn tại"
            } else {
                setErrorMsg('Đăng ký thất bại. Vui lòng thử lại sau!');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col font-sans">
            <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* ════════════════════════════════════════════
                    LEFT SIDE: REGISTER FORM
                ════════════════════════════════════════════ */}
                <section className="w-full md:w-1/2 flex flex-col justify-center relative p-6 sm:p-12 lg:p-20 z-10 bg-white shadow-[10px_0_20px_rgba(0,0,0,0.02)]">
                    {/* Top Navigation Bar (Đã fix không đè) */}
                    <div className="absolute top-0 left-0 w-full p-6 sm:p-8 flex items-center justify-between">
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold text-sm transition-colors bg-slate-50 hover:bg-indigo-50 px-4 py-2 rounded-full"
                        >
                            <ArrowLeft size={16} />
                            <span className="hidden sm:inline">Trang chủ</span>
                        </Link>

                        <div className="flex items-center gap-2 pr-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                                <Rocket className="text-white" size={16} />
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-slate-900 font-headline hidden sm:block">
                                TalentMatch
                            </span>
                        </div>
                    </div>

                    <div className="max-w-[420px] w-full mx-auto mt-16">
                        <div className="mb-10 text-left">
                            <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
                                Tạo tài khoản mới
                            </h1>
                            <p className="text-slate-500 text-base leading-relaxed">
                                Nhanh chóng, miễn phí và mở ra vô vàn cơ hội nghề nghiệp.
                            </p>
                        </div>

                        {/* Khối hiển thị LỖI */}
                        {errorMsg && (
                            <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-lg flex items-start gap-3 text-sm font-semibold animate-in fade-in zoom-in duration-300 shadow-sm">
                                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{errorMsg}</span>
                            </div>
                        )}

                        {/* Khối hiển thị THÀNH CÔNG */}
                        {successMsg && (
                            <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 rounded-r-lg flex items-start gap-3 text-sm font-semibold animate-in fade-in zoom-in duration-300 shadow-sm">
                                <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{successMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-5">
                            {/* Input FullName */}
                            <div>
                                <label
                                    className="block text-sm font-bold uppercase tracking-wider text-slate-500 ml-1 mb-2"
                                    htmlFor="fullName"
                                >
                                    Họ và tên
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User
                                            className="text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                                            size={20}
                                        />
                                    </div>
                                    <input
                                        id="fullName"
                                        required
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Nguyễn Văn A"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-0 border-b-2 border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 rounded-t-xl font-medium text-slate-900 placeholder-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Input Email */}
                            <div>
                                <label
                                    className="block text-sm font-bold uppercase tracking-wider text-slate-500 ml-1 mb-2"
                                    htmlFor="email"
                                >
                                    Email
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail
                                            className="text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                                            size={20}
                                        />
                                    </div>
                                    <input
                                        id="email"
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-0 border-b-2 border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 rounded-t-xl font-medium text-slate-900 placeholder-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Input Password */}
                            <div>
                                <label
                                    className="block text-sm font-bold uppercase tracking-wider text-slate-500 ml-1 mb-2"
                                    htmlFor="password"
                                >
                                    Mật khẩu
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock
                                            className="text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                                            size={20}
                                        />
                                    </div>
                                    <input
                                        id="password"
                                        required
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Ít nhất 6 ký tự"
                                        className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-0 border-b-2 border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 rounded-t-xl font-medium text-slate-900 tracking-wide placeholder-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-4 text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    className="block text-sm font-bold uppercase tracking-wider text-slate-500 ml-1 mb-2"
                                    htmlFor="confirmPassword"
                                >
                                    Xác nhận mật khẩu
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock
                                            className="text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                                            size={20}
                                        />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        required
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Nhập lại mật khẩu"
                                        className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-0 border-b-2 border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 rounded-t-xl font-medium text-slate-900 tracking-wide placeholder-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 mt-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-full text-lg shadow-lg shadow-indigo-500/30 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 size={24} className="animate-spin" /> : 'Tạo tài khoản'}
                                {!isLoading && <ArrowRight size={20} />}
                            </button>

                            <p className="text-[13px] text-slate-500 text-center mt-6 px-4">
                                Bằng việc đăng ký, bạn đã đồng ý với{' '}
                                <span className="text-indigo-600 font-bold cursor-pointer hover:underline">
                                    Điều khoản dịch vụ
                                </span>{' '}
                                và{' '}
                                <span className="text-indigo-600 font-bold cursor-pointer hover:underline">
                                    Chính sách bảo mật
                                </span>{' '}
                                của chúng tôi.
                            </p>
                        </form>

                        <div className="mt-8 text-center border-t border-slate-100 pt-8">
                            <p className="text-slate-600 font-medium text-sm">
                                Đã có tài khoản?{' '}
                                <Link
                                    to="/login"
                                    className="text-indigo-600 hover:text-indigo-700 hover:underline font-bold text-base"
                                >
                                    Đăng nhập ngay
                                </Link>
                            </p>
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════
                    RIGHT SIDE: RICH VISUAL (Bỏ lớp nền xanh)
                ════════════════════════════════════════════ */}
                <section className="hidden md:flex md:w-1/2 relative bg-slate-900 items-center justify-center p-12 overflow-hidden">
                    {/* Background Image từ Unsplash - Xóa opacity thấp, giữ nguyên màu gốc */}
                    <div className="absolute inset-0 z-0">
                        <img
                            alt="Modern office coworking space"
                            className="w-full h-full object-cover"
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                        />
                        {/* Chỉ giữ lại một lớp gradient mỏng ở phía dưới để chữ màu trắng hiển thị rõ */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent"></div>
                    </div>

                    <div className="relative z-20 w-full max-w-lg text-white flex flex-col justify-end h-full pb-10">
                        <div className="mb-10">
                            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full shadow-lg mb-6">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-3"></span>
                                <span className="text-white text-sm font-bold tracking-widest uppercase">
                                    Cộng đồng sôi động
                                </span>
                            </div>
                            <h2 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tighter drop-shadow-md">
                                Khởi đầu <br />
                                <span className="text-emerald-400 drop-shadow-sm">hành trình mới</span>
                            </h2>
                            <p className="text-slate-100 text-lg font-medium max-w-md leading-relaxed mt-6 drop-shadow-md">
                                Chỉ với 1 tài khoản duy nhất, bạn có thể tạo CV bằng AI, nhận gợi ý việc làm tự động và
                                trò chuyện trực tiếp với HR.
                            </p>
                        </div>

                        {/* Bento-style Stats Grid (Hiệu ứng kính mờ) */}
                        <div className="grid grid-cols-2 gap-5">
                            <div className="bg-white/20 backdrop-blur-md border border-white/30 p-6 rounded-2xl shadow-xl">
                                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                                    <Users className="text-white" size={24} />
                                </div>
                                <div className="text-3xl font-extrabold text-white mb-1 drop-shadow-sm">10K+</div>
                                <div className="text-emerald-100 text-xs font-bold uppercase tracking-wider">
                                    Ứng viên tin dùng
                                </div>
                            </div>
                            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl shadow-xl">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-lg">
                                    <Star className="text-indigo-600 fill-indigo-600" size={24} />
                                </div>
                                <div className="text-3xl font-extrabold text-white mb-1 drop-shadow-sm">4.9/5</div>
                                <div className="text-slate-300 text-xs font-bold uppercase tracking-wider">
                                    Đánh giá hệ thống AI
                                </div>
                            </div>
                        </div>

                        {/* Floating Testimonial Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-2xl flex items-start gap-5 translate-x-4 lg:translate-x-12 mt-8">
                            <div className="flex-shrink-0 relative">
                                <img
                                    alt="User"
                                    className="w-14 h-14 rounded-full object-cover shadow-md border-2 border-slate-100"
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                                />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                                    <CheckCircle2 className="text-white" size={14} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-slate-700 font-medium italic text-sm leading-relaxed">
                                    "Tôi đã tìm được công việc mơ ước chỉ sau 3 ngày đăng ký. Hệ thống AI matching thực
                                    sự là một phép màu!"
                                </p>
                                <p className="text-indigo-600 font-extrabold text-xs uppercase tracking-wide">
                                    Elena Vu, Frontend Developer
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SignUp;
