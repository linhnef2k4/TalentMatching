import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Rocket,
    Search,
    MapPin,
    ArrowRight,
    FileText,
    Cpu,
    MailCheck,
    ChevronRight,
    BrainCircuit,
    Bot,
    Mail,
    Phone,
    Share2,
    Sparkles,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';

import logoSacombank from '~/assets/images/logos/sacombank.webp';
import logoFpt from '~/assets/images/logos/fpt.jpg';
import logoVingroup from '~/assets/images/logos/vin.png';
import logoViettel from '~/assets/images/logos/Viettel.webp';
import logoTiki from '~/assets/images/logos/tiki.jpg';
import logoVnpay from '~/assets/images/logos/vnpay.jpg';
import logoItcom from '~/assets/images/logos/itcom.png';
import logoFidutech from '~/assets/images/logos/fidutech.png';

/* ─── Animated counter ─── */
const Counter = ({ target, suffix = '', duration = 2000 }) => {
    const [val, setVal] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const start = performance.now();
                    const tick = (now) => {
                        const progress = Math.min((now - start) / duration, 1);
                        const ease = 1 - Math.pow(1 - progress, 3);
                        setVal(Math.floor(ease * target));
                        if (progress < 1) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                }
            },
            { threshold: 0.5 },
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);
    return (
        <span ref={ref}>
            {val.toLocaleString()}
            {suffix}
        </span>
    );
};

const companies = [
    { name: 'Sacombank', image: logoSacombank, mt: 'mt-12', size: 'w-24 h-24' },
    { name: 'FPT Software', image: logoFpt, mt: 'mt-44', size: 'w-20 h-20' },
    { name: 'VN Pay', image: logoVnpay, mt: 'mt-40', size: 'w-20 h-20' },
    { name: 'Viettel', image: logoViettel, mt: 'mt-8', size: 'w-28 h-28' },
    { name: 'Vingroup', image: logoVingroup, mt: 'mt-32', size: 'w-20 h-20' },
    { name: 'Fidutech', image: logoFidutech, mt: 'mt-16', size: 'w-20 h-20' },
    { name: 'Tiki', image: logoTiki, mt: 'mt-20', size: 'w-24 h-24' },
    { name: 'ItCom', image: logoItcom, mt: 'mt-44', size: 'w-24 h-24' },
];

const stats = [
    { icon: Users, value: 250000, suffix: '+', label: 'Ứng viên', iconBg: 'bg-indigo-500' },
    { icon: TrendingUp, value: 98, suffix: '%', label: 'Tỉ lệ hài lòng', iconBg: 'bg-violet-500' },
    { icon: Zap, value: 12000, suffix: '+', label: 'Công ty đối tác', iconBg: 'bg-teal-500' },
    { icon: Sparkles, value: 3, suffix: 'x', label: 'Tốc độ tuyển dụng', iconBg: 'bg-sky-500' },
];

const companyCards = [
    {
        name: 'FPT Software',
        ind: 'Công nghệ & Phần mềm',
        jobs: '120+',
        logo: logoFpt,
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        badge: 'bg-indigo-100 text-indigo-700',
    },
    {
        name: 'Sacombank',
        ind: 'Ngân hàng & Tài chính',
        jobs: '45+',
        logo: logoSacombank,
        bg: 'bg-violet-50',
        border: 'border-violet-200',
        badge: 'bg-violet-100 text-violet-700',
    },
    {
        name: 'Vingroup',
        ind: 'Đa ngành',
        jobs: '80+',
        logo: logoVingroup,
        bg: 'bg-teal-50',
        border: 'border-teal-200',
        badge: 'bg-teal-100 text-teal-700',
    },
    {
        name: 'Viettel Group',
        ind: 'Viễn thông & CNTT',
        jobs: '65+',
        logo: logoViettel,
        bg: 'bg-sky-50',
        border: 'border-sky-200',
        badge: 'bg-sky-100 text-sky-700',
    },
];

const Home = () => {
    const [isInputFocused, setIsInputFocused] = useState(false);

    useEffect(() => {
        const els = document.querySelectorAll('[data-reveal]');
        const observer = new IntersectionObserver(
            (entries) =>
                entries.forEach((e) => {
                    if (e.isIntersecting) e.target.classList.add('revealed');
                }),
            { threshold: 0.1 },
        );
        els.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div
            className="bg-slate-50 text-slate-900 font-sans overflow-x-hidden"
            style={{ fontFamily: "'Plus Jakarta Sans','DM Sans',sans-serif" }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

                [data-reveal]          { opacity:0; transform:translateY(28px); transition:opacity .65s ease,transform .65s ease; }
                [data-reveal].revealed { opacity:1; transform:none; }
                [data-reveal][data-delay="1"]{transition-delay:.08s}
                [data-reveal][data-delay="2"]{transition-delay:.18s}
                [data-reveal][data-delay="3"]{transition-delay:.28s}
                [data-reveal][data-delay="4"]{transition-delay:.38s}

                @keyframes marquee    { from{transform:translateX(0)} to{transform:translateX(-50%)} }
                .animate-marquee      { animation:marquee 30s linear infinite; }

                @keyframes floatY     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
                .float-anim           { animation:floatY 5s ease-in-out infinite; }

                @keyframes pulseRing  { 0%{transform:scale(.9);opacity:.6} 100%{transform:scale(1.45);opacity:0} }
                .pulse-ring           { animation:pulseRing 2.5s ease-out infinite; }

                @keyframes shimmer    { 0%{left:-100%} 100%{left:200%} }
                .shimmer-btn::after   { content:'';position:absolute;top:0;left:-100%;width:55%;height:100%;
                    background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent);
                    animation:shimmer 2.8s ease-in-out infinite; }
                .shimmer-btn          { position:relative;overflow:hidden; }

                @keyframes gradShift  {
                    0%  {background-position:0%   50%}
                    50% {background-position:100% 50%}
                    100%{background-position:0%   50%}
                }

                .card-lift { transition:transform .3s ease,box-shadow .3s ease; }
                .card-lift:hover { transform:translateY(-5px); box-shadow:0 18px 50px rgba(0,0,0,.09); }

                input { background:transparent; border:none; outline:none; }
                input::placeholder { color:#94a3b8; }
            `}</style>

            {/* ══════ HERO ══════ */}
            <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden">
                {/* Ảnh nền blur */}
                <div
                    className="absolute inset-0 z-0 blur-[4px] scale-[1.02]"
                    style={{
                        backgroundImage:
                            'url("https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1800&q=80")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center 30%',
                    }}
                />
                {/* Overlay tone indigo-tím nhẹ */}
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-50/94 via-indigo-50/88 to-violet-50/90" />
                {/* Blobs */}
                <div className="absolute top-0 left-0 w-[480px] h-[480px] bg-indigo-200/35 rounded-full blur-[110px] pointer-events-none z-0" />
                <div className="absolute bottom-0 right-0 w-[380px] h-[380px] bg-violet-200/35 rounded-full blur-[100px] pointer-events-none z-0" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-teal-200/20 rounded-full blur-[90px] pointer-events-none z-0" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 pt-28 pb-16 w-full">
                    <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
                        {/* Badge */}
                        <div
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-indigo-200 shadow-sm text-indigo-600 text-xs font-bold uppercase tracking-widest mb-8"
                            data-reveal
                        >
                            <span className="relative flex w-2 h-2">
                                <span className="pulse-ring absolute inline-flex w-full h-full rounded-full bg-violet-400 opacity-75"></span>
                                <span className="w-2 h-2 rounded-full bg-violet-500 inline-flex"></span>
                            </span>
                            <Rocket size={13} /> Công nghệ Matching AI hàng đầu Việt Nam
                        </div>

                        <h1
                            className="text-5xl lg:text-[76px] font-extrabold leading-[1.05] mb-6 tracking-tight text-slate-900"
                            data-reveal
                            data-delay="1"
                        >
                            Nền Tảng Tuyển Dụng
                            <br />
                            <span
                                className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-500 to-teal-500"
                                style={{ backgroundSize: '200%', animation: 'gradShift 5s ease infinite' }}
                            >
                                AI Thế Hệ Mới
                            </span>
                        </h1>

                        <p
                            className="text-lg text-slate-600 font-medium mb-12 max-w-2xl leading-relaxed"
                            data-reveal
                            data-delay="2"
                        >
                            Kết nối ứng viên tài năng với doanh nghiệp hàng đầu thông qua công nghệ Matching AI thông
                            minh nhất Việt Nam.
                        </p>

                        {/* Search bar */}
                        <div
                            className={`w-full max-w-3xl rounded-2xl flex flex-col md:flex-row gap-2 p-2 bg-white shadow-xl transition-all duration-300 ${isInputFocused ? 'ring-2 ring-indigo-400 shadow-indigo-100/60' : 'shadow-slate-200/80'}`}
                            data-reveal
                            data-delay="3"
                        >
                            <div className="flex-1 flex items-center px-4 gap-3">
                                <Search className="text-indigo-400 shrink-0" size={18} />
                                <input
                                    type="text"
                                    placeholder="Vị trí tuyển dụng, kỹ năng..."
                                    onFocus={() => setIsInputFocused(true)}
                                    onBlur={() => setIsInputFocused(false)}
                                    className="w-full py-3 text-slate-800 font-medium"
                                />
                            </div>
                            <div className="w-px bg-slate-100 hidden md:block my-3" />
                            <div className="flex-1 flex items-center px-4 gap-3">
                                <MapPin className="text-violet-400 shrink-0" size={18} />
                                <input
                                    type="text"
                                    placeholder="Địa điểm (Toàn quốc)"
                                    className="w-full py-3 text-slate-800 font-medium"
                                />
                            </div>
                            <button className="shimmer-btn bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-bold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-200 active:scale-95">
                                Tìm kiếm <ArrowRight size={18} />
                            </button>
                        </div>

                        {/* Trending tags */}
                        <div className="flex flex-wrap gap-2 mt-5 justify-center" data-reveal data-delay="4">
                            <span className="text-slate-500 font-semibold text-xs py-1 pr-1">Xu hướng:</span>
                            {['AI Engineer', 'Product Manager', 'Data Analyst', 'DevOps', 'UX Designer'].map((tag) => (
                                <button
                                    key={tag}
                                    className="text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Marquee logos */}
                    <div className="mt-20 relative h-[260px] overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-full flex w-[200%] animate-marquee hover:[animation-play-state:paused]">
                            {[1, 2].map((set) => (
                                <div key={set} className="flex w-1/2 justify-around items-start px-4">
                                    {companies.map((company, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex flex-col items-center group cursor-pointer ${company.mt}`}
                                        >
                                            <div
                                                className={`${company.size} rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center p-3 group-hover:-translate-y-3 group-hover:shadow-xl group-hover:shadow-indigo-100 group-hover:border-indigo-200 transition-all duration-300 overflow-hidden`}
                                            >
                                                <img
                                                    src={company.image}
                                                    alt={company.name}
                                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                                {company.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════ STATS ══════ */}
            <section
                className="py-20 relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 45%,#0d9488 100%)',
                    backgroundSize: '200%',
                    animation: 'gradShift 8s ease infinite',
                }}
            >
                <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full" />
                <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-white/10 rounded-full" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map(({ icon: Icon, value, suffix, label, iconBg }, i) => (
                            <div key={i} className="text-center" data-reveal data-delay={i + 1}>
                                <div
                                    className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                                >
                                    <Icon size={22} className="text-white" />
                                </div>
                                <div className="text-3xl lg:text-4xl font-extrabold text-white mb-1">
                                    <Counter target={value} suffix={suffix} />
                                </div>
                                <p className="text-indigo-100 text-sm font-medium">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════ HOW IT WORKS ══════ */}
            <section className="py-28 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[380px] h-[380px] bg-violet-100/50 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-100/50 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-20" data-reveal>
                        <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-4">
                            Cách hoạt động
                        </span>
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Quy trình 3 bước đơn giản</h2>
                        <p className="text-slate-600 font-medium max-w-xl mx-auto">
                            Từ CV đến offer letter — AI làm phần lớn việc, bạn chỉ cần chọn
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-7 relative">
                        <div className="hidden md:block absolute top-14 left-[33%] w-[34%] h-px bg-gradient-to-r from-indigo-300 via-violet-300 to-teal-300" />

                        {[
                            {
                                icon: FileText,
                                step: '01',
                                title: 'Tạo CV Chuẩn',
                                desc: 'Hệ thống hỗ trợ tạo CV chuyên nghiệp theo chuẩn ATS, tăng tỉ lệ hồ sơ vượt qua bộ lọc AI của nhà tuyển dụng.',
                                iconGrad: 'from-indigo-500 to-indigo-600',
                                cardBg: 'bg-indigo-50 border-indigo-200',
                                watermark: 'text-indigo-200',
                                pill: 'bg-indigo-100 text-indigo-700',
                            },
                            {
                                icon: Cpu,
                                step: '02',
                                title: 'AI Matching',
                                desc: 'Công nghệ AI phân tích hàng nghìn yếu tố để gợi ý việc làm phù hợp nhất với năng lực và mục tiêu của bạn.',
                                iconGrad: 'from-violet-500 to-violet-600',
                                cardBg: 'bg-violet-50 border-violet-200',
                                watermark: 'text-violet-200',
                                pill: 'bg-violet-100 text-violet-700',
                            },
                            {
                                icon: MailCheck,
                                step: '03',
                                title: 'Nhận Lời Mời',
                                desc: 'Trực tiếp nhận lời mời phỏng vấn từ nhà tuyển dụng hàng đầu — không cần gửi CV thủ công nữa.',
                                iconGrad: 'from-teal-500 to-teal-600',
                                cardBg: 'bg-teal-50 border-teal-200',
                                watermark: 'text-teal-200',
                                pill: 'bg-teal-100 text-teal-700',
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className={`rounded-2xl p-8 border card-lift relative overflow-hidden shadow-sm hover:shadow-md ${item.cardBg}`}
                                data-reveal
                                data-delay={i + 1}
                            >
                                <span
                                    className={`absolute -right-2 -top-4 text-[88px] font-black select-none ${item.watermark} opacity-60`}
                                >
                                    {item.step}
                                </span>
                                <div
                                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.iconGrad} flex items-center justify-center mb-6 shadow-md relative z-10`}
                                >
                                    <item.icon size={26} className="text-white" />
                                </div>
                                <div
                                    className={`text-xs font-bold uppercase tracking-widest mb-2 px-2.5 py-0.5 rounded-full inline-block relative z-10 ${item.pill}`}
                                >
                                    Bước {item.step}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 mt-2 relative z-10">
                                    {item.title}
                                </h3>
                                <p className="text-slate-700 text-sm leading-relaxed relative z-10">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════ TOP COMPANIES ══════ */}
            <section className="py-28 bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-violet-400 to-teal-400" />
                <div className="absolute -bottom-24 right-0 w-[420px] h-[420px] bg-violet-50/80 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -top-12 left-0 w-[300px] h-[300px] bg-indigo-50/80 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div
                        className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-16 gap-4"
                        data-reveal
                    >
                        <div>
                            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-3">
                                Đối tác tuyển dụng
                            </span>
                            <h2 className="text-4xl font-extrabold text-slate-900">Công ty hàng đầu</h2>
                        </div>
                        <Link
                            to="/companies"
                            className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:gap-3 hover:text-indigo-500 transition-all"
                        >
                            Xem tất cả <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {companyCards.map((co, i) => (
                            <div
                                key={i}
                                className={`rounded-2xl p-6 border card-lift cursor-pointer group ${co.bg} ${co.border}`}
                                data-reveal
                                data-delay={i + 1}
                            >
                                <div className="w-16 h-16 rounded-2xl bg-white border border-white shadow-sm flex items-center justify-center overflow-hidden mb-5 group-hover:scale-105 transition-transform">
                                    <img src={co.logo} alt={co.name} className="w-full h-full object-contain p-1.5" />
                                </div>
                                <h4 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                                    {co.name}
                                </h4>
                                <p className="text-xs text-slate-500 mb-5">{co.ind}</p>
                                <div className="pt-4 border-t border-white/60 flex items-center justify-between">
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${co.badge}`}>
                                        {co.jobs} Việc làm
                                    </span>
                                    <ChevronRight
                                        size={16}
                                        className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════ BANNER IMAGE ══════ */}
            <section
                className="py-32 relative flex items-center justify-center overflow-hidden bg-fixed bg-center bg-cover"
                style={{
                    backgroundImage:
                        'url("https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1920&q=80")',
                }}
            >
                {/* Overlay tone indigo-tím tối */}
                <div className="absolute inset-0 bg-indigo-950/65 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />

                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto" data-reveal>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                        Kết nối nhân tài, Kiến tạo tương lai
                    </h2>
                    <p className="text-lg text-indigo-100 font-medium mb-8 max-w-2xl mx-auto">
                        Hàng ngàn doanh nghiệp đang chờ đón sự bứt phá từ bạn. Hãy để AI của chúng tôi làm cầu nối cho
                        thành công của bạn trên con đường sự nghiệp.
                    </p>
                    <Link
                        to="/jobs"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
                    >
                        Khám phá cơ hội <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* ══════ CTA ══════ */}
            <section className="py-20 bg-gradient-to-br from-slate-50 via-indigo-50/70 to-violet-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div
                        className="relative rounded-[2.5rem] overflow-hidden p-12 lg:p-20 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl shadow-indigo-200/50"
                        style={{
                            background: 'linear-gradient(135deg,#4338ca 0%,#7c3aed 45%,#0d9488 100%)',
                            backgroundSize: '200%',
                            animation: 'gradShift 7s ease infinite',
                        }}
                        data-reveal
                    >
                        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full border border-white/10" />
                        <div className="absolute -right-6 -top-6 w-52 h-52 rounded-full border border-white/10" />
                        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute top-6 right-56 w-3.5 h-3.5 rounded-full bg-violet-100/70" />
                        <div className="absolute bottom-8 right-44 w-2.5 h-2.5 rounded-full bg-teal-100/70" />
                        <div className="absolute top-14 left-56 w-2 h-2 rounded-full bg-indigo-100/70" />

                        <div className="relative z-10 max-w-xl text-center md:text-left">
                            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 leading-tight">
                                Sẵn sàng để bước tiếp sự nghiệp cùng AI?
                            </h2>
                            <p className="text-indigo-100 font-medium mb-10 leading-relaxed">
                                Hàng nghìn cơ hội đang chờ — để AI tìm đúng cơ hội dành riêng cho bạn.
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <Link
                                    to="/cv-builder"
                                    className="shimmer-btn px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-xl shadow-black/10 active:scale-95"
                                >
                                    Tạo CV ngay bây giờ
                                </Link>
                                <Link
                                    to="/jobs"
                                    className="px-8 py-4 bg-white/15 border border-white/30 text-white font-bold rounded-xl hover:bg-white/25 transition-colors backdrop-blur active:scale-95"
                                >
                                    Tìm kiếm việc làm
                                </Link>
                            </div>
                        </div>

                        <div className="relative z-10 shrink-0">
                            <div className="w-44 h-44 lg:w-56 lg:h-56 rounded-full bg-white/15 border border-white/25 flex items-center justify-center float-anim relative backdrop-blur-sm">
                                <div className="absolute inset-0 rounded-full bg-white/10 pulse-ring" />
                                <Bot size={90} className="text-white opacity-90" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════ FOOTER ══════ */}
            <footer className="bg-slate-900 text-slate-400 py-16">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                                <BrainCircuit size={20} className="text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">TalentMatch</span>
                        </div>
                        <p className="text-sm leading-relaxed mb-6">
                            Đồng hành cùng hàng nghìn doanh nghiệp và triệu ứng viên trên hành trình chinh phục sự
                            nghiệp.
                        </p>
                        <button className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all">
                            <Share2 size={16} />
                        </button>
                    </div>

                    {[
                        {
                            title: 'Dành cho Ứng viên',
                            links: [
                                { to: '/jobs', label: 'Tìm việc làm' },
                                { to: '/cv-builder', label: 'Tạo CV chuyên nghiệp' },
                                { to: '/matched-jobs', label: 'Việc làm AI gợi ý' },
                            ],
                        },
                        {
                            title: 'Dành cho Nhà tuyển dụng',
                            links: [
                                { to: '/hr-register', label: 'Đăng tuyển dụng' },
                                { to: '/hr/search-candidates', label: 'Tìm hồ sơ ứng viên' },
                                { to: '/hr/dashboard', label: 'Giải pháp quản trị AI' },
                            ],
                        },
                    ].map(({ title, links }) => (
                        <div key={title}>
                            <h5 className="text-white font-bold mb-6 text-sm">{title}</h5>
                            <ul className="space-y-4">
                                {links.map(({ to, label }) => (
                                    <li key={to}>
                                        <Link to={to} className="text-sm hover:text-indigo-400 transition-colors">
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    <div>
                        <h5 className="text-white font-bold mb-6 text-sm">Kết nối</h5>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-sm">
                                <Mail className="text-indigo-400 shrink-0" size={15} /> contact@talentmatch.vn
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <Phone className="text-violet-400 shrink-0" size={15} /> 1900 1234
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <MapPin className="text-teal-400 shrink-0 mt-0.5" size={15} /> Tòa nhà FPT, Phố Duy Tân,
                                Hà Nội
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-800 text-xs text-center text-slate-600">
                    © 2026 TalentMatch Platform. All rights reserved. Designed with precision.
                </div>
            </footer>
        </div>
    );
};

export default Home;
