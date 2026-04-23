import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import bgImage from '~/assets/images/logos/cv_background.avif';
import { ClassicCV, ModernCV, CreativeCV } from '~/components/cv/CVTemplates'; // Chắc chắn bạn đã có file này
import toast, { Toaster } from 'react-hot-toast';
import {
    Sparkles,
    LayoutTemplate,
    ArrowRight,
    CheckCircle2,
    Palette,
    Briefcase,
    Zap,
    Download,
    Save,
    FileText,
    Clock,
    Star,
    Eye,
    ShieldCheck,
    PenTool,
    LayoutGrid,
    Users,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   TEMPLATE DATA & PREVIEWS
───────────────────────────────────────────────*/

// Hàm render thu nhỏ CV để làm Preview (scale 0.3 hoặc 0.35)
const MiniCVWrapper = ({ children }) => (
    <div
        className="w-[180px] h-[254px] bg-white shadow-sm overflow-hidden flex justify-center items-start origin-top"
        style={{ transform: 'scale(0.3)', pointerEvents: 'none' }}
    >
        <div style={{ width: 595, height: 842 }}>{children}</div>
    </div>
);

// Dữ liệu mẫu cực ngắn gọn chỉ để hiện Preview
const previewData = {
    personal: {
        name: 'Nguyễn Văn A',
        title: 'Frontend Developer',
        email: 'a@email.com',
        phone: '090123456',
        summary: 'Kinh nghiệm 3 năm phát triển web.',
    },
    experience: [
        {
            id: '1',
            title: 'Web Developer',
            company: 'Công ty ABC',
            startDate: '2021',
            endDate: 'Nay',
            description: '- Xây dựng hệ thống.\n- Tối ưu SEO.',
        },
    ],
    education: [{ id: '1', degree: 'Cử nhân CNTT', school: 'ĐH Công Nghệ', startDate: '2017', endDate: '2021' }],
    skills: [
        { id: '1', name: 'ReactJS', level: 90 },
        { id: '2', name: 'NodeJS', level: 80 },
    ],
    projects: [],
    certifications: [],
    customSections: [],
};

const CV_TEMPLATES = [
    {
        id: 'tpl_1',
        name: 'Professional ATS',
        subtitle: 'Tối giản · Chuẩn ATS',
        desc: 'Chuẩn format ATS thuần văn bản, tối ưu hoá tuyệt đối cho hệ thống quét tự động.',
        tags: [
            { label: 'Tối giản', icon: <FileText size={12} /> },
            { label: 'ATS-Friendly', icon: <ShieldCheck size={12} /> },
        ],
        accentColor: 'bg-gray-800',
        preview: (
            <MiniCVWrapper>
                <ClassicCV data={previewData} />
            </MiniCVWrapper>
        ),
        rating: 4.9,
        uses: '12.4k',
    },
    {
        id: 'tpl_2',
        name: 'Creative Modern',
        subtitle: 'Sáng tạo · 2 Cột',
        desc: 'Layout 2 cột bắt mắt. Thiết kế hiện đại, phù hợp cho ngành Design, Marketing.',
        tags: [
            { label: 'Sáng tạo', icon: <PenTool size={12} /> },
            { label: '2 Cột', icon: <LayoutGrid size={12} /> },
        ],
        accentColor: 'bg-blue-500',
        preview: (
            <MiniCVWrapper>
                <ModernCV data={previewData} />
            </MiniCVWrapper>
        ),
        rating: 4.8,
        uses: '9.1k',
    },
    {
        id: 'tpl_3',
        name: 'Executive Corporate',
        subtitle: 'Chuyên nghiệp · Quản lý',
        desc: 'Phân cấp thông tin rõ ràng theo tiêu chuẩn doanh nghiệp. Hoàn hảo cho vị trí quản lý.',
        tags: [
            { label: 'Chuyên nghiệp', icon: <Briefcase size={12} /> },
            { label: 'C-Level', icon: <Star size={12} /> },
        ],
        accentColor: 'bg-slate-800',
        preview: (
            <MiniCVWrapper>
                <CreativeCV data={previewData} />
            </MiniCVWrapper>
        ),
        rating: 4.7,
        uses: '7.8k',
    },
];

/* ─────────────────────────────────────────────
   COMPONENTS UI
───────────────────────────────────────────────*/
const CVTemplateCard = ({ tpl, onSaveDraft }) => {
    return (
        <div className="group bg-white rounded-2xl flex flex-col overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300">
            <div className="relative h-64 bg-gray-50 flex items-center justify-center border-b border-gray-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-50 z-0"></div>

                <div className="relative z-10 transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-105 shadow-md group-hover:shadow-2xl rounded-md border border-gray-200">
                    {tpl.preview}
                </div>

                <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex flex-col items-center justify-center gap-3">
                    <Link to={`/cv-builder/editor/${tpl.id}`} className="w-3/4">
                        <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md hover:bg-blue-700 transition-colors">
                            <Palette size={16} /> Dùng mẫu này
                        </button>
                    </Link>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onSaveDraft(tpl);
                        }}
                        className="w-3/4 flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 font-bold text-sm px-5 py-3 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        <Save size={16} /> Lưu nháp
                    </button>
                </div>

                <div className="absolute top-3 left-3 flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1 text-xs font-bold text-amber-500 shadow-sm z-10">
                    <Star size={12} fill="currentColor" /> {tpl.rating}
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1 text-xs font-bold text-gray-600 shadow-sm z-10">
                    <Eye size={12} /> {tpl.uses}
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1 bg-white">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h3 className="font-extrabold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                            {tpl.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium mt-1">{tpl.subtitle}</p>
                    </div>
                    <div
                        className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${tpl.accentColor}`}
                        title="Màu chủ đạo"
                    />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed flex-1 mt-3 mb-5">{tpl.desc}</p>
                <div className="flex flex-wrap gap-2">
                    {tpl.tags.map((tag, idx) => (
                        <span
                            key={idx}
                            className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg"
                        >
                            {tag.icon} {tag.label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AICard = () => (
    <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-8 border border-blue-600">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white opacity-5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-400 opacity-10 rounded-full pointer-events-none" />

        <div className="flex-1 relative z-10 text-center md:text-left text-white">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-950 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 shadow-sm">
                <Zap size={14} fill="currentColor" /> Nhanh & Chính xác nhất
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-5 leading-tight">Talent AI CV Builder</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl font-medium leading-relaxed">
                Khỏi vắt óc suy nghĩ từ vựng. AI tự động phân tích, viết lại câu chữ chuyên nghiệp và tối ưu hóa từ khóa
                chuẩn ATS chỉ trong 30 giây.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
                {[
                    'Sửa lỗi ngữ pháp & chính tả',
                    'Đề xuất từ khóa theo JD',
                    'Viết lại kinh nghiệm chuyên nghiệp',
                    'Chấm điểm CV tự động',
                ].map((item, idx) => (
                    <div
                        key={idx}
                        className="flex items-center gap-3 bg-white/10 rounded-xl p-3 border border-white/10"
                    >
                        <CheckCircle2 className="text-green-400 shrink-0" size={20} />
                        <span className="text-white text-sm font-semibold">{item}</span>
                    </div>
                ))}
            </div>
            <Link to="/cv-builder/editor/tpl_2">
                <button className="bg-white text-blue-700 hover:bg-gray-50 hover:-translate-y-1 font-black text-lg px-8 py-4 rounded-xl shadow-xl transition-all duration-300 flex items-center gap-3 w-full sm:w-auto justify-center">
                    <Sparkles size={22} className="text-amber-500" /> Tạo CV bằng AI ngay <ArrowRight size={20} />
                </button>
            </Link>
        </div>

        <div className="relative z-10 hidden md:block w-72 shrink-0">
            <div className="bg-white rounded-2xl p-5 shadow-2xl border-4 border-blue-400/30 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div>
                        <div className="w-24 h-3 bg-gray-800 rounded mb-2" />
                        <div className="w-16 h-2 bg-gray-400 rounded" />
                    </div>
                </div>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between mb-1">
                            <div className="w-20 h-2 bg-blue-600 rounded" />
                            <div className="w-10 h-2 bg-gray-300 rounded" />
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded mb-1" />
                        <div className="w-5/6 h-1.5 bg-gray-200 rounded" />
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <div className="w-24 h-2 bg-blue-600 rounded" />
                            <div className="w-12 h-2 bg-gray-300 rounded" />
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded mb-1" />
                        <div className="w-4/5 h-1.5 bg-gray-200 rounded" />
                    </div>
                </div>
                <div className="absolute -right-6 -bottom-6 bg-yellow-100 border border-yellow-300 p-3 rounded-xl shadow-xl animate-bounce flex items-start gap-2 max-w-[200px]">
                    <Sparkles className="text-yellow-600 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-yellow-800 font-medium">
                        Đã thay thế "Làm việc tốt" thành{' '}
                        <strong className="text-blue-700">"Tối ưu hóa hiệu suất..."</strong>
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const StatsBar = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {[
            {
                icon: <FileText size={28} className="text-blue-600" />,
                value: '50,000+',
                label: 'CV Đã Tạo',
                bg: 'bg-blue-50',
                border: 'border-blue-100',
            },
            {
                icon: <Star size={28} className="text-amber-500" fill="currentColor" />,
                value: '4.9 / 5',
                label: 'Đánh Giá',
                bg: 'bg-amber-50',
                border: 'border-amber-100',
            },
            {
                icon: <Clock size={28} className="text-green-600" />,
                value: '< 30 giây',
                label: 'Thời Gian Tạo',
                bg: 'bg-green-50',
                border: 'border-green-100',
            },
        ].map((stat, idx) => (
            <div
                key={idx}
                className={`bg-white border ${stat.border} rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow`}
            >
                <div className={`w-16 h-16 ${stat.bg} rounded-2xl flex items-center justify-center mb-4`}>
                    {stat.icon}
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
            </div>
        ))}
    </div>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────*/
const CVBuilder = () => {
    const [draftCount, setDraftCount] = useState(2);

    const handleSaveDraft = useCallback((tpl) => {
        setDraftCount((c) => c + 1);
        toast.success(`Đã lưu bản nháp mẫu: ${tpl.name}`, {
            duration: 3000,
            icon: '💾',
            style: { borderRadius: '12px', background: '#333', color: '#fff', fontWeight: 'bold' },
        });
    }, []);

    const handleExportPDF = useCallback(() => {
        toast.loading('Vui lòng chọn mẫu CV để tải xuống PDF', { duration: 3000, icon: 'ℹ️' });
    }, []);

    return (
        <div className="bg-gray-50 min-h-[calc(100vh-64px)] font-sans antialiased">
            <Toaster position="bottom-right" />
            <section className="pt-20 pb-40 relative px-4 overflow-hidden">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: `url(${bgImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <div className="absolute inset-0 bg-slate-900/80 z-0" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-full px-4 py-1.5 text-xs font-bold text-gray-300 tracking-widest uppercase mb-8">
                        <Sparkles size={14} className="text-blue-400" /> Nền tảng tạo CV số 1 Việt Nam
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
                        Kiến Tạo CV <span className="text-blue-500">Hoàn Hảo</span>
                    </h1>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed font-medium">
                        Sử dụng trí tuệ nhân tạo để viết lại nội dung chuyên nghiệp, giúp bạn tự tin vượt qua mọi hệ
                        thống lọc hồ sơ (ATS) của các tập đoàn lớn.
                    </p>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-24 relative z-20 pb-24 space-y-16">
                <AICard />
                <StatsBar />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-200 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                            <LayoutTemplate size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">Chọn mẫu CV</h2>
                            <p className="text-sm text-gray-500 font-medium">
                                3 phong cách chuẩn ATS, phù hợp mọi ngành nghề.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                            <Save size={18} className="text-gray-500" /> Bản nháp{' '}
                            <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full ml-1">
                                {draftCount}
                            </span>
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
                        >
                            <Download size={18} /> Xuất PDF
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {CV_TEMPLATES.map((tpl) => (
                        <CVTemplateCard key={tpl.id} tpl={tpl} onSaveDraft={handleSaveDraft} />
                    ))}
                </div>

                <div className="bg-white border border-blue-200 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100">
                        <Briefcase size={32} className="text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 text-xl mb-2">Bí quyết để có CV thu hút</h4>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            Nhà tuyển dụng chỉ dành trung bình{' '}
                            <strong className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">6 giây</strong> để lướt
                            qua một CV. Hãy đảm bảo CV của bạn ngắn gọn (1 trang), nhấn mạnh vào kết quả đạt được bằng
                            những con số cụ thể, và tuyệt đối không có lỗi chính tả.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CVBuilder;
