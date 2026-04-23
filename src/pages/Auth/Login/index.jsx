import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
    Rocket,
    ArrowRight,
    Star,
    Users,
    CheckCircle2,
    ArrowLeft,
    Chrome,
    Facebook,
} from 'lucide-react';
import authService from '~/services/authService';
import { AuthContext } from '~/context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    // UI State
    const [showPassword, setShowPassword] = useState(false);

    // API State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsLoading(true);

        try {
            const response = await authService.login(email, password);
            console.log('Phản hồi từ Server:', response);

            if (response.token && response.user) {
                login(response.user, response.token);

                if (response.user.role === 'EMPLOYER' || response.user.role === 'ADMIN') {
                    navigate('/hr/dashboard');
                } else {
                    navigate('/');
                }
            }
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Email hoặc mật khẩu không chính xác!');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col font-sans">
            <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* ════════════════════════════════════════════
                    LEFT SIDE: LOGIN FORM
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
                                Chào mừng trở lại! <span className="inline-block animate-bounce">👋</span>
                            </h1>
                            <p className="text-slate-500 text-base leading-relaxed">
                                Đăng nhập để tiếp tục hành trình kết nối cơ hội việc làm tuyệt vời dành riêng cho bạn.
                            </p>
                        </div>

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-start gap-3 text-sm font-semibold animate-in fade-in zoom-in duration-300 mb-6 shadow-sm">
                                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{errorMessage}</span>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label
                                        className="block text-sm font-bold uppercase tracking-wider text-slate-500 ml-1 mb-2"
                                        htmlFor="email"
                                    >
                                        Email của bạn
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
                                            name="email"
                                            required
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@company.com"
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-0 border-b-2 border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 rounded-t-xl font-medium text-slate-900 placeholder-slate-400"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <div className="flex justify-between items-center px-1 mb-2">
                                        <label
                                            className="block text-sm font-bold uppercase tracking-wider text-slate-500"
                                            htmlFor="password"
                                        >
                                            Mật khẩu
                                        </label>
                                        <Link
                                            to="/forgot-password"
                                            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-all"
                                        >
                                            Quên mật khẩu?
                                        </Link>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock
                                                className="text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                                                size={20}
                                            />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            required
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
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
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 mt-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-full text-lg shadow-lg shadow-indigo-500/30 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 size={24} className="animate-spin" /> : 'Đăng nhập'}
                                {!isLoading && <ArrowRight size={20} />}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative py-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                                    Hoặc tiếp tục với
                                </span>
                            </div>
                        </div>

                        {/* Social Logins */}
                        <div className="flex flex-col gap-3">
                            <button className="flex items-center justify-center gap-3 w-full py-3.5 bg-slate-50 border border-slate-200 rounded-full font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all group active:scale-[0.98]">
                                <Chrome
                                    size={20}
                                    className="text-rose-500 group-hover:scale-110 transition-transform"
                                />
                                Đăng nhập bằng Google
                            </button>
                            <button className="flex items-center justify-center gap-3 w-full py-3.5 bg-[#1877F2] text-white rounded-full font-bold hover:bg-[#166fe5] shadow-sm shadow-blue-500/20 transition-all group active:scale-[0.98]">
                                <Facebook
                                    size={20}
                                    className="text-white fill-current group-hover:scale-110 transition-transform"
                                />
                                Đăng nhập bằng Facebook
                            </button>
                        </div>

                        <div className="mt-8 text-center border-t border-slate-100 pt-8">
                            <p className="text-slate-600 font-medium text-sm">
                                Chưa có tài khoản?{' '}
                                <Link
                                    to="/register"
                                    className="text-indigo-600 hover:text-indigo-700 hover:underline font-bold text-base"
                                >
                                    Đăng ký ngay
                                </Link>
                            </p>
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════
                    RIGHT SIDE: RICH VISUAL
                ════════════════════════════════════════════ */}
                <section className="hidden md:flex md:w-1/2 relative bg-indigo-900 items-center justify-center p-12 overflow-hidden">
                    {/* Background Image từ Unsplash */}
                    <div className="absolute inset-0 z-0">
                        <img
                            alt="Modern office lobby"
                            className="w-full h-full object-cover"
                            src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                        />
                        {/* Gradient phủ lên trên ảnh */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent"></div>
                    </div>

                    {/* Content Overlays */}
                    <div className="relative z-20 w-full max-w-lg px-6 text-white flex flex-col justify-end h-full pb-10">
                        <div className="mb-10">
                            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full shadow-lg mb-6">
                                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-3"></span>
                                <span className="text-white text-sm font-bold tracking-widest uppercase">
                                    Tuyển dụng cao cấp
                                </span>
                            </div>
                            <h2 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tighter drop-shadow-md">
                                Bệ phóng cho <br /> sự nghiệp của bạn
                            </h2>
                            <p className="text-slate-100 text-lg font-medium max-w-md leading-relaxed mt-6 drop-shadow-md">
                                Hệ thống AI thông minh tự động kết nối hồ sơ của bạn với những cơ hội việc làm phù hợp
                                nhất từ hàng ngàn doanh nghiệp uy tín.
                            </p>
                        </div>

                        {/* Bento-style Stats Grid */}
                        <div className="grid grid-cols-2 gap-5">
                            <div className="bg-white/20 backdrop-blur-md border border-white/30 p-6 rounded-2xl shadow-xl">
                                <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-yellow-400/20 group-hover:-translate-y-1 transition-transform">
                                    <Star className="text-yellow-900 fill-yellow-900" size={24} />
                                </div>
                                <div className="text-3xl font-extrabold text-white mb-1 drop-shadow-sm">99%</div>
                                <div className="text-yellow-100 text-xs font-bold uppercase tracking-wider">
                                    Tỷ lệ trúng tuyển
                                </div>
                            </div>
                            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl shadow-xl">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-lg">
                                    <Users className="text-indigo-600" size={24} />
                                </div>
                                <div className="text-3xl font-extrabold text-white mb-1 drop-shadow-sm">500+</div>
                                <div className="text-slate-300 text-xs font-bold uppercase tracking-wider">
                                    Đối tác toàn cầu
                                </div>
                            </div>
                        </div>

                        {/* Floating Testimonial Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-2xl flex items-start gap-5 translate-x-4 lg:translate-x-12 mt-8">
                            <div className="flex-shrink-0 relative">
                                <img
                                    alt="User"
                                    className="w-14 h-14 rounded-full object-cover shadow-md border-2 border-slate-100"
                                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                                />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                                    <CheckCircle2 className="text-white" size={14} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-slate-700 font-medium italic text-sm leading-relaxed">
                                    "Độ chính xác của hệ thống AI trên TalentMatch đã thay đổi hoàn toàn quỹ đạo sự
                                    nghiệp của tôi chỉ trong vài tuần."
                                </p>
                                <p className="text-indigo-600 font-extrabold text-xs uppercase tracking-wide">
                                    Sarah Jenkins, Senior Designer
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Subtle Decorative Elements */}
                    <div className="absolute top-20 right-20 w-64 h-64 bg-yellow-400/20 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-500/30 rounded-full blur-[120px] pointer-events-none"></div>
                </section>
            </main>

            {/* Simple Footer */}
            <footer className="w-full bg-white border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm font-medium">© 2024 TalentMatch. All rights reserved.</p>
                    <nav className="flex gap-6 text-sm font-bold text-slate-400">
                        <a className="hover:text-indigo-600 transition-colors" href="#">
                            Chính sách bảo mật
                        </a>
                        <a className="hover:text-indigo-600 transition-colors" href="#">
                            Điều khoản dịch vụ
                        </a>
                        <a className="hover:text-indigo-600 transition-colors" href="#">
                            Trợ giúp
                        </a>
                    </nav>
                </div>
            </footer>
        </div>
    );
};

export default Login;
