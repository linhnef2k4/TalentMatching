import React, { useState, useEffect } from 'react';
import {
    Users,
    Briefcase,
    Target,
    TrendingUp,
    Building2,
    CheckCircle2,
    BrainCircuit,
    Layers,
    Activity,
    DollarSign,
    Award,
} from 'lucide-react';

const AdminDashboard = () => {
    // 1. State quản lý dữ liệu
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 2. Mock Data dựa trên cấu trúc API
    useEffect(() => {
        // Giả lập độ trễ API
        const timer = setTimeout(() => {
            setStats({
                totalUsers: 84,
                totalEmployers: 35,
                totalCandidates: 49,
                activeJobs: 278,
                totalApplications: 68,
                totalRevenue: 12500000, // Doanh thu giả lập
                matchingSuccessRate: 85, // Điểm AI
                applicationStatusStats: [
                    { status: 'Chờ duyệt', count: 120, color: 'bg-amber-400' },
                    { status: 'Phỏng vấn', count: 54, color: 'bg-blue-500' },
                    { status: 'Trúng tuyển', count: 21, color: 'bg-emerald-500' },
                    { status: 'Từ chối', count: 68, color: 'bg-rose-500' },
                ],
                jobCategoryStats: [
                    { category: 'IT / Phần mềm', count: 850, percentage: 36 },
                    { category: 'Marketing / PR', count: 420, percentage: 18 },
                    { category: 'Kinh doanh / Sales', count: 310, percentage: 13 },
                    { category: 'Nhân sự / HR', count: 150, percentage: 6 },
                ],
                topCompanies: [
                    { name: 'TechNova Solutions', jobs: 45, logo: 'T' },
                    { name: 'VNG Corporation', jobs: 38, logo: 'V' },
                    { name: 'FPT Software', jobs: 32, logo: 'F' },
                    { name: 'Shopee Vietnam', jobs: 28, logo: 'S' },
                ],
                topSkills: [
                    { skill: 'ReactJS', count: 1240 },
                    { skill: 'Java Spring', count: 980 },
                    { skill: 'Python', count: 850 },
                    { skill: 'Figma', count: 620 },
                    { skill: 'NodeJS', count: 540 },
                ],
            });
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Hàm format số
    const formatNum = (num) => new Intl.NumberFormat('vi-VN').format(num);
    const formatCurrency = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

    if (isLoading || !stats) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-slate-500">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="font-semibold text-lg tracking-wide animate-pulse">Đang tải dữ liệu tổng quan...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* ═════════ HEADER ═════════ */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Tổng Quan Hệ Thống</h2>
                    <p className="text-slate-500 font-medium mt-1">Cập nhật theo thời gian thực từ hệ thống máy chủ</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 border border-emerald-200 shadow-sm">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    Trạng thái: Ổn định
                </div>
            </div>

            {/* ═════════ TOP SUMMARY CARDS ═════════ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Users Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Users size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                            <TrendingUp size={14} /> +12%
                        </span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-800">{formatNum(stats.totalUsers)}</h3>
                    <p className="text-sm text-slate-500 font-semibold mt-1">Tổng Người Dùng</p>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs font-medium text-slate-500">
                        <span>
                            Ứng viên: <strong className="text-slate-700">{formatNum(stats.totalCandidates)}</strong>
                        </span>
                        <span>
                            Nhà tuyển dụng:{' '}
                            <strong className="text-slate-700">{formatNum(stats.totalEmployers)}</strong>
                        </span>
                    </div>
                </div>

                {/* Jobs Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl group-hover:bg-violet-600 group-hover:text-white transition-colors">
                            <Briefcase size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                            <TrendingUp size={14} /> +5.4%
                        </span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-800">{formatNum(stats.activeJobs)}</h3>
                    <p className="text-sm text-slate-500 font-semibold mt-1">Việc Làm Đang Mở (Active Jobs)</p>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs font-medium text-slate-500">
                        <span>
                            Tổng CV đã nộp:{' '}
                            <strong className="text-slate-700">{formatNum(stats.totalApplications)}</strong>
                        </span>
                    </div>
                </div>

                {/* AI Matching Card (Highlight) */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl shadow-lg border border-indigo-800 relative overflow-hidden group">
                    <BrainCircuit
                        size={100}
                        className="absolute -right-6 -bottom-6 text-indigo-500/20 group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 bg-indigo-500/30 text-indigo-300 rounded-2xl backdrop-blur-sm">
                            <Target size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-indigo-200 bg-indigo-500/30 px-2 py-1 rounded-lg backdrop-blur-sm">
                            SBERT Model
                        </span>
                    </div>
                    <div className="relative z-10 flex items-baseline gap-2">
                        <h3 className="text-4xl font-black text-white">{stats.matchingSuccessRate}%</h3>
                    </div>
                    <p className="text-sm text-indigo-200 font-medium mt-1 relative z-10">Độ chính xác AI Matching</p>
                    <div className="mt-4 pt-4 border-t border-indigo-500/30 relative z-10">
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                            <div
                                className="bg-indigo-400 h-1.5 rounded-full"
                                style={{ width: `${stats.matchingSuccessRate}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Revenue Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-colors">
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <h3
                        className="text-2xl font-black text-slate-800 truncate"
                        title={formatCurrency(stats.totalRevenue)}
                    >
                        {formatCurrency(stats.totalRevenue)}
                    </h3>
                    <p className="text-sm text-slate-500 font-semibold mt-1">Doanh Thu Hệ Thống</p>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2 text-xs font-medium text-slate-500">
                        <Activity size={14} className="text-amber-500" />
                        <span>
                            Kỳ thanh toán: <strong className="text-slate-700">Tháng này</strong>
                        </span>
                    </div>
                </div>
            </div>

            {/* ═════════ MIDDLE SECTION: CHARTS & LISTS ═════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (Span 2) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Phễu Ứng Tuyển (Application Status) */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-slate-50 rounded-xl">
                                <Layers className="text-slate-600" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Trạng Thái Hồ Sơ (Phễu Chuyển Đổi)</h3>
                        </div>

                        <div className="space-y-4">
                            {stats.applicationStatusStats.map((item, idx) => {
                                const percent = ((item.count / stats.totalApplications) * 100).toFixed(1);
                                return (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-28 text-sm font-bold text-slate-700">{item.status}</div>
                                        <div className="flex-1">
                                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                                                <div
                                                    className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out`}
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="w-20 text-right">
                                            <span className="text-sm font-black text-slate-800">{percent}%</span>
                                        </div>
                                        <div className="w-24 text-right text-xs font-semibold text-slate-500">
                                            {formatNum(item.count)} CV
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Phân bố ngành nghề (Job Categories) */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-slate-50 rounded-xl">
                                <Activity className="text-slate-600" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Cơ cấu Việc làm theo Ngành nghề</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {stats.jobCategoryStats.map((cat, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-bold text-slate-700">{cat.category}</span>
                                        <span className="text-lg font-black text-indigo-600">{cat.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2">
                                        <div
                                            className="bg-indigo-500 h-1.5 rounded-full"
                                            style={{ width: `${cat.percentage}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-500">
                                        {formatNum(cat.count)} tin tuyển dụng
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column (Span 1) */}
                <div className="space-y-6">
                    {/* Top Companies */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <div className="p-2 bg-rose-50 rounded-xl">
                                <Building2 className="text-rose-600" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Top Doanh Nghiệp</h3>
                        </div>
                        <div className="space-y-4">
                            {stats.topCompanies.map((company, idx) => (
                                <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-600 shadow-sm border border-slate-200 group-hover:scale-110 transition-transform">
                                        {company.logo}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                            {company.name}
                                        </h4>
                                        <p className="text-xs font-medium text-slate-500">
                                            {company.jobs} việc làm đang mở
                                        </p>
                                    </div>
                                    <div className="text-amber-500">{idx === 0 && <Award size={20} />}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Skills */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <div className="p-2 bg-emerald-50 rounded-xl">
                                <Target className="text-emerald-600" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Top Kỹ Năng Yêu Cầu</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {stats.topSkills.map((skill, idx) => (
                                <div
                                    key={idx}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                    <span className="text-sm font-bold text-slate-700">{skill.skill}</span>
                                    <span className="text-xs font-semibold bg-white text-slate-500 px-1.5 py-0.5 rounded shadow-sm">
                                        {formatNum(skill.count)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
