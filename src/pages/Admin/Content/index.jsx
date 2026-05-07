import React, { useState } from 'react';
import {
    MonitorPlay,
    Image as ImageIcon,
    Star,
    FileText,
    Plus,
    ToggleRight,
    ToggleLeft,
    Trash2,
    Edit3,
    Search,
    Eye,
    Calendar,
    MousePointerClick,
    Building2,
} from 'lucide-react';

const AdminContent = () => {
    const [activeTab, setActiveTab] = useState('banners');
    const [searchTerm, setSearchTerm] = useState('');

    // ================= MOCK DATA =================

    const [banners, setBanners] = useState([
        {
            id: 1,
            title: 'Chiến dịch Tuyển dụng IT Mùa Hè 2026',
            image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop',
            status: 'Active',
            clicks: 1250,
            date: '15/04/2026',
        },
        {
            id: 2,
            title: 'Ngày hội việc làm - Kết nối Doanh Nghiệp',
            image: 'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=800&auto=format&fit=crop',
            status: 'Active',
            clicks: 840,
            date: '10/03/2026',
        },
        {
            id: 3,
            title: 'Khóa học ReactJS & Tailwind CSS Thực chiến',
            image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
            status: 'Hidden',
            clicks: 0,
            date: '01/04/2026',
        },
    ]);

    const [articles, setArticles] = useState([
        {
            id: 1,
            title: 'Xu hướng tuyển dụng lập trình viên năm 2026',
            category: 'Thị trường IT',
            image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop',
            status: 'Published',
            views: 4520,
            date: '20/04/2026',
        },
        {
            id: 2,
            title: 'Top 5 kỹ năng mềm định hình sự nghiệp của bạn',
            category: 'Kỹ năng mềm',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600&auto=format&fit=crop',
            status: 'Published',
            views: 3105,
            date: '18/04/2026',
        },
        {
            id: 3,
            title: 'Cách viết CV khiến HR không thể chối từ',
            category: 'Bí kíp xin việc',
            image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=600&auto=format&fit=crop',
            status: 'Draft',
            views: 0,
            date: '24/04/2026',
        },
    ]);

    const [topCompanies, setTopCompanies] = useState([
        {
            id: 1,
            name: 'Công ty TNHH TechNova',
            industry: 'SaaS / AI',
            logoBg: 'bg-blue-100',
            logoText: 'text-blue-600',
            jobs: 24,
        },
        {
            id: 2,
            name: 'FPT Software',
            industry: 'Outsourcing',
            logoBg: 'bg-orange-100',
            logoText: 'text-orange-600',
            jobs: 156,
        },
        {
            id: 3,
            name: 'VNG Corporation',
            industry: 'Game / Product',
            logoBg: 'bg-purple-100',
            logoText: 'text-purple-600',
            jobs: 45,
        },
        { id: 4, name: 'MoMo VN', industry: 'Fintech', logoBg: 'bg-pink-100', logoText: 'text-pink-600', jobs: 32 },
    ]);

    // ================= HANDLERS =================

    const handleToggleBanner = (id) => {
        setBanners(
            banners.map((b) => (b.id === id ? { ...b, status: b.status === 'Active' ? 'Hidden' : 'Active' } : b)),
        );
    };

    const handleToggleArticle = (id) => {
        setArticles(
            articles.map((a) => (a.id === id ? { ...a, status: a.status === 'Published' ? 'Draft' : 'Published' } : a)),
        );
    };

    // ================= RENDER =================

    return (
        <div className="space-y-8 max-w-7xl mx-auto font-sans pb-10">
            {/* HEADER */}
            <div className="bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-800 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <MonitorPlay size={160} className="absolute -right-10 -bottom-10 text-indigo-500/20 rotate-12" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500/30 rounded-xl backdrop-blur-md">
                            <MonitorPlay className="text-indigo-400" size={28} />
                        </div>
                        Quản lý Nội dung (CMS)
                    </h1>
                    <p className="text-slate-400 mt-2 text-base font-medium max-w-xl">
                        Tùy chỉnh các khối nội dung, banner quảng cáo, danh sách bài viết và các đối tác nổi bật hiển
                        thị trên trang chủ của hệ thống.
                    </p>
                </div>
                <button className="relative z-10 bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/40 flex items-center gap-2 hover:-translate-y-1">
                    <Plus size={20} /> Thêm Mới Nội Dung
                </button>
            </div>

            {/* TABS NAVIGATION */}
            <div className="flex flex-wrap gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
                <button
                    onClick={() => setActiveTab('banners')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all flex-1 sm:flex-none justify-center ${
                        activeTab === 'banners'
                            ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                            : 'bg-transparent text-slate-500 hover:bg-slate-50'
                    }`}
                >
                    <ImageIcon size={18} /> Banner Quảng cáo
                </button>
                <button
                    onClick={() => setActiveTab('articles')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all flex-1 sm:flex-none justify-center ${
                        activeTab === 'articles'
                            ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100'
                            : 'bg-transparent text-slate-500 hover:bg-slate-50'
                    }`}
                >
                    <FileText size={18} /> Bài viết & Tin tức
                </button>
                <button
                    onClick={() => setActiveTab('top-companies')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all flex-1 sm:flex-none justify-center ${
                        activeTab === 'top-companies'
                            ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100'
                            : 'bg-transparent text-slate-500 hover:bg-slate-50'
                    }`}
                >
                    <Star size={18} /> Đối tác Nổi bật
                </button>
            </div>

            {/* TAB CONTENT: BANNERS */}
            {activeTab === 'banners' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {banners.map((banner) => (
                        <div
                            key={banner.id}
                            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/10 transition-all flex flex-col"
                        >
                            {/* Image Box */}
                            <div className="h-48 relative overflow-hidden bg-slate-100">
                                <img
                                    src={banner.image}
                                    alt={banner.title}
                                    className={`w-full h-full object-cover transition duration-700 group-hover:scale-110 ${banner.status === 'Hidden' ? 'grayscale opacity-50' : ''}`}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>

                                {/* Badges overlay */}
                                <div className="absolute top-4 left-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-black tracking-wide ${
                                            banner.status === 'Active'
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-slate-500 text-white'
                                        }`}
                                    >
                                        {banner.status === 'Active' ? 'HIỂN THỊ' : 'ĐANG ẨN'}
                                    </span>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <h3 className="font-black text-lg line-clamp-2 leading-tight drop-shadow-md">
                                        {banner.title}
                                    </h3>
                                </div>
                            </div>

                            {/* Actions Box */}
                            <div className="p-5 flex flex-col justify-between flex-1">
                                <div className="flex justify-between items-center mb-5 text-slate-500 text-sm font-medium">
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                                        <MousePointerClick size={16} className="text-indigo-500" /> {banner.clicks}{' '}
                                        Clicks
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={16} /> {banner.date}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => handleToggleBanner(banner.id)}
                                        className={`flex items-center gap-2 font-bold text-sm px-3 py-1.5 rounded-xl transition-colors ${
                                            banner.status === 'Active'
                                                ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                                : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                                        }`}
                                    >
                                        {banner.status === 'Active' ? (
                                            <ToggleRight size={24} className="text-emerald-500" />
                                        ) : (
                                            <ToggleLeft size={24} />
                                        )}
                                        {banner.status === 'Active' ? 'Bật' : 'Tắt'}
                                    </button>

                                    <div className="flex gap-2">
                                        <button
                                            className="p-2.5 text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                                            title="Sửa"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            className="p-2.5 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB CONTENT: ARTICLES */}
            {activeTab === 'articles' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {articles.map((article) => (
                        <div
                            key={article.id}
                            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/10 transition-all flex flex-col"
                        >
                            <div className="h-44 relative overflow-hidden bg-slate-100">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className={`w-full h-full object-cover transition duration-700 group-hover:scale-110 ${article.status === 'Draft' ? 'grayscale opacity-70' : ''}`}
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                                    {article.category}
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="font-bold text-slate-900 text-lg line-clamp-2 leading-snug mb-3 group-hover:text-emerald-600 transition-colors">
                                    {article.title}
                                </h3>

                                <div className="flex justify-between items-center text-slate-500 text-sm font-medium mt-auto mb-5">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={16} /> {article.date}
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                                        <Eye size={16} className="text-emerald-500" /> {article.views}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => handleToggleArticle(article.id)}
                                        className={`flex items-center gap-2 font-bold text-sm px-3 py-1.5 rounded-xl transition-colors ${
                                            article.status === 'Published'
                                                ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                                : 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                                        }`}
                                    >
                                        {article.status === 'Published' ? (
                                            <ToggleRight size={24} className="text-emerald-500" />
                                        ) : (
                                            <ToggleLeft size={24} className="text-amber-500" />
                                        )}
                                        {article.status === 'Published' ? 'Công khai' : 'Bản nháp'}
                                    </button>

                                    <div className="flex gap-2">
                                        <button
                                            className="p-2.5 text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                                            title="Sửa bài"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            className="p-2.5 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
                                            title="Xóa bài"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB CONTENT: TOP COMPANIES */}
            {activeTab === 'top-companies' && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Danh sách Doanh nghiệp nổi bật</h3>
                            <p className="text-slate-500 font-medium text-sm mt-1">
                                Các công ty này sẽ được ưu tiên hiển thị ở khu vực "Top Employers" trên trang chủ.
                            </p>
                        </div>
                        <div className="relative w-full md:w-80 group">
                            <Search
                                className="absolute left-4 top-3 text-slate-400 group-focus-within:text-amber-500 transition-colors"
                                size={20}
                            />
                            <input
                                type="text"
                                placeholder="Tìm công ty để thêm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {topCompanies.map((company) => (
                            <div
                                key={company.id}
                                className="border border-slate-200 rounded-2xl p-6 text-center relative group hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/10 transition-all bg-white flex flex-col items-center"
                            >
                                {/* Delete Button (Hover) */}
                                <button className="absolute top-3 right-3 p-2 bg-rose-50 text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 hover:bg-rose-500 hover:text-white shadow-sm">
                                    <Trash2 size={16} />
                                </button>

                                <div
                                    className={`w-20 h-20 ${company.logoBg} ${company.logoText} rounded-2xl flex items-center justify-center text-3xl font-black mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}
                                >
                                    {company.name.charAt(0)}
                                </div>
                                <h3
                                    className="font-bold text-slate-900 mb-1 line-clamp-1 w-full px-2"
                                    title={company.name}
                                >
                                    {company.name}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full mb-3">
                                    {company.industry}
                                </p>

                                <div className="mt-auto flex items-center gap-1.5 text-sm font-bold text-amber-600 bg-amber-50 px-4 py-1.5 rounded-xl">
                                    <Building2 size={16} /> {company.jobs} Việc làm
                                </div>
                            </div>
                        ))}

                        {/* Add New Company Card */}
                        <button className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-amber-500 hover:bg-amber-50 transition-all flex flex-col items-center justify-center min-h-[220px] group">
                            <div className="w-16 h-16 bg-slate-100 text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-600 rounded-full flex items-center justify-center mb-3 transition-colors">
                                <Plus size={32} />
                            </div>
                            <span className="font-bold text-slate-600 group-hover:text-amber-700">
                                Thêm Doanh Nghiệp
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminContent;
