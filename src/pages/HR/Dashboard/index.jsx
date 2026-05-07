import React, { useState, useEffect } from 'react';
import {
    Users,
    FileText,
    CheckCircle,
    TrendingUp,
    BarChart3,
    MapPin,
    Loader2,
    Sparkles,
    AlertCircle,
    CalendarClock,
    PlusCircle,
    ArrowUpRight,
    Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import applicationService from '~/services/applicationService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HRDashboard = () => {
    // States lưu dữ liệu từ API
    const [stats, setStats] = useState(null);
    const [monthlyStats, setMonthlyStats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Lấy dữ liệu khi load trang (GIỮ NGUYÊN LOGIC 100%)
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [statsRes, monthlyRes] = await Promise.all([
                    applicationService.getEmployerStats(),
                    applicationService.getMonthlyStats(),
                ]);

                if (statsRes) setStats(statsRes);

                if (monthlyRes && Array.isArray(monthlyRes)) {
                    const chartData = monthlyRes.map((item) => ({
                        name: item.month,
                        uv: item.count,
                    }));
                    setMonthlyStats(chartData);
                }
            } catch (error) {
                console.error('Lỗi load Dashboard:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statsCards = [
        {
            title: 'Job Đang Mở',
            value: stats ? stats.totalActiveJobs : 0,
            icon: <FileText size={24} className="text-indigo-600" />,
            bg: 'bg-indigo-50 border-indigo-100',
            textColor: 'text-indigo-900',
            link: '/hr/manage-jobs',
        },
        {
            title: 'Tổng Ứng Viên',
            value: stats ? stats.totalApplications : 0,
            icon: <Users size={24} className="text-violet-600" />,
            bg: 'bg-violet-50 border-violet-100',
            textColor: 'text-violet-900',
            link: '/hr/manage-jobs',
        },
        {
            title: 'Chờ Duyệt',
            value: stats ? stats.pendingApplications : 0,
            icon: <CalendarClock size={24} className="text-amber-600" />,
            bg: 'bg-amber-50 border-amber-100',
            textColor: 'text-amber-900',
            link: '/hr/manage-jobs',
        },
        {
            title: 'Lịch Phỏng Vấn',
            value: stats ? stats.interviewScheduled : 0,
            icon: <CheckCircle size={24} className="text-emerald-600" />,
            bg: 'bg-emerald-50 border-emerald-100',
            textColor: 'text-emerald-900',
            link: '#',
        },
    ];

    // Tooltip Custom cho Biểu đồ đẹp hơn
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex flex-col gap-1">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
                    <p className="text-indigo-600 font-black text-xl">
                        {payload[0].value} <span className="text-sm font-medium text-slate-600">ứng viên</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center bg-slate-50">
                <Loader2 size={40} className="animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto font-sans p-4 lg:p-8 bg-slate-50 min-h-screen">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tổng quan Tuyển dụng</h1>
                    <div className="flex items-center gap-2 mt-2">
                        {stats?.unreadApplications > 0 ? (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold border border-rose-100">
                                <AlertCircle size={14} /> Có {stats.unreadApplications} hồ sơ mới
                            </span>
                        ) : (
                            <span className="text-slate-500 font-medium text-sm">
                                Theo dõi hiệu suất và kết nối nhân tài.
                            </span>
                        )}
                    </div>
                </div>
                <Link
                    to="/hr/post-job"
                    className="group bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 active:scale-95"
                >
                    <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                    Tạo chiến dịch mới
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {statsCards.map((stat, idx) => (
                    <div
                        key={idx}
                        className={`p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group ${stat.bg}`}
                    >
                        {/* Decorative blur circle */}
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white opacity-40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-white/50">
                                {stat.icon}
                            </div>
                            <Link
                                to={stat.link}
                                className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white transition-colors border border-transparent hover:border-slate-200"
                            >
                                <ArrowUpRight size={16} />
                            </Link>
                        </div>
                        <div className="relative z-10">
                            <h3 className={`text-4xl font-black mb-1 ${stat.textColor}`}>{stat.value}</h3>
                            <p className="text-slate-600 font-semibold text-sm opacity-80">{stat.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ── BIỂU ĐỒ DIỆN TÍCH (AREA CHART) ── */}
                <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                                <TrendingUp size={20} className="text-indigo-500" />
                                Tăng trưởng Ứng viên
                            </h2>
                            <p className="text-xs font-medium text-slate-500 mt-1">Lưu lượng hồ sơ nộp vào hệ thống</p>
                        </div>
                        <select className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg px-3 py-1.5 outline-none cursor-pointer">
                            <option>6 tháng gần nhất</option>
                            <option>Năm nay</option>
                        </select>
                    </div>

                    <div className="flex-1 w-full min-h-[320px]">
                        {monthlyStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                    />
                                    <Tooltip
                                        content={<CustomTooltip />}
                                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Area
                                        type="monotone" // Làm mềm đường thẳng thành đường cong nghệ thuật
                                        dataKey="uv"
                                        stroke="#6366f1"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorUv)"
                                        activeDot={{ r: 6, fill: '#fff', stroke: '#6366f1', strokeWidth: 3 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 border-2 border-dashed border-slate-100 rounded-2xl">
                                <BarChart3 size={32} className="opacity-20" />
                                <p className="font-medium text-sm">Chưa có đủ dữ liệu thống kê.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── AI ĐỀ XUẤT ỨNG VIÊN (MOCK) ── */}
                <div className="lg:col-span-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
                    {/* Coming soon overlay */}
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                        <div className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold shadow-xl flex items-center gap-2">
                            <Sparkles size={16} className="text-amber-400" /> Sắp ra mắt
                        </div>
                    </div>

                    <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
                        <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                            <Sparkles size={18} className="text-amber-500" /> AI Khám Phá
                        </h2>
                        <p className="text-xs font-medium text-slate-500 mt-1">Đề xuất chủ động từ kho CV.</p>
                    </div>

                    <div className="flex-1 p-6 flex flex-col gap-4">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100"
                            >
                                <img
                                    src={`https://ui-avatars.com/api/?name=Candidate+${item}&background=random&color=fff`}
                                    className="w-12 h-12 rounded-full shadow-sm"
                                    alt="mock avatar"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-slate-800 truncate">Nguyễn Văn Mock</h4>
                                    <p className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1">
                                        <MapPin size={10} /> TP. Hồ Chí Minh
                                    </p>
                                </div>
                                <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-black">
                                    95%
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                        <button
                            className="text-xs font-bold text-slate-400 flex items-center justify-center gap-1 mx-auto"
                            disabled
                        >
                            <Eye size={14} /> Xem danh sách
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
