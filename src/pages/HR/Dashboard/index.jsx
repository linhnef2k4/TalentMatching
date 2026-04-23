import React, { useState, useEffect } from 'react';
import {
    Users,
    FileText,
    CheckCircle,
    TrendingUp,
    ChevronRight,
    MapPin,
    Loader2,
    Sparkles,
    AlertCircle,
    CalendarClock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import applicationService from '~/services/applicationService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const HRDashboard = () => {
    // States lưu dữ liệu từ API
    const [stats, setStats] = useState(null);
    const [monthlyStats, setMonthlyStats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Lấy dữ liệu khi load trang
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                // Gọi song song 2 API để lấy cả Thống kê tổng và Thống kê theo tháng
                const [statsRes, monthlyRes] = await Promise.all([
                    applicationService.getEmployerStats(),
                    applicationService.getMonthlyStats(), // Giả định bro đã tạo hàm này trong service
                ]);

                if (statsRes) setStats(statsRes);

                // Format lại dữ liệu tháng cho biểu đồ (Recharts cần mảng Object)
                if (monthlyRes && Array.isArray(monthlyRes)) {
                    // Ví dụ monthlyRes = [{ month: "2026-03", count: 3 }]
                    const chartData = monthlyRes.map((item) => ({
                        name: item.month, // Trục X
                        uv: item.count, // Trục Y (Số lượng)
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

    // Cấu hình các thẻ Stats dựa vào Data trả về
    const statsCards = [
        {
            title: 'Job Đang Mở',
            value: stats ? stats.totalActiveJobs : 0,
            icon: <FileText size={24} className="text-blue-600" />,
            bg: 'bg-blue-100 border-blue-200',
            link: '/hr/manage-jobs',
        },
        {
            title: 'Tổng Ứng Viên',
            value: stats ? stats.totalApplications : 0,
            icon: <Users size={24} className="text-indigo-600" />,
            bg: 'bg-indigo-100 border-indigo-200',
            link: '/hr/manage-jobs',
        },
        {
            title: 'Chờ Duyệt (Pending)',
            value: stats ? stats.pendingApplications : 0,
            icon: <CalendarClock size={24} className="text-orange-600" />,
            bg: 'bg-orange-100 border-orange-200',
            link: '/hr/manage-jobs',
        },
        {
            title: 'Đã Lên Lịch P.Vấn',
            value: stats ? stats.interviewScheduled : 0,
            icon: <CheckCircle size={24} className="text-green-600" />,
            bg: 'bg-green-100 border-green-200',
            link: '#',
        },
    ];

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 size={40} className="animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto font-sans p-2">
            {/* Nút hành động nhanh */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Chào mừng trở lại, HR!</h2>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                        {stats?.unreadApplications > 0 && <AlertCircle size={14} className="text-red-500" />}
                        Bạn có <strong className="text-red-500">{stats?.unreadApplications || 0}</strong> hồ sơ mới chưa
                        đọc.
                    </p>
                </div>
                <Link
                    to="/hr/post-job"
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md shadow-blue-500/20 flex items-center gap-2"
                >
                    + Đăng Job Mới (Tối ưu AI)
                </Link>
            </div>

            {/* Stats Cards (4 Cột) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, idx) => (
                    <div
                        key={idx}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${stat.bg}`}>
                                {stat.icon}
                            </div>
                            <h3 className="text-4xl font-black text-gray-800">{stat.value}</h3>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-4 border-t border-gray-50">
                            <p className="text-gray-500 font-medium text-sm">{stat.title}</p>
                            <Link
                                to={stat.link}
                                className="text-blue-600 p-1 rounded-full hover:bg-blue-50 transition opacity-0 group-hover:opacity-100"
                            >
                                <ChevronRight size={18} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* BIỂU ĐỒ THỐNG KÊ (MỚI THÊM) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-600" />
                    Biểu đồ Ứng viên theo Tháng
                </h2>

                <div className="h-[300px] w-full">
                    {monthlyStats.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    }}
                                />
                                <Bar dataKey="uv" name="Số Ứng Viên" radius={[6, 6, 0, 0]} maxBarSize={50}>
                                    {monthlyStats.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index === monthlyStats.length - 1 ? '#2563EB' : '#93C5FD'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 font-medium">
                            Chưa có dữ liệu thống kê tháng
                        </div>
                    )}
                </div>
            </div>

            {/* AI Candidate Suggestions (Mock) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Sparkles size={20} className="text-orange-500" />
                        AI Đề Xuất Ứng Viên (Sắp ra mắt)
                    </h2>
                    <span className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                        Tính năng Pro
                    </span>
                </div>

                <div className="overflow-x-auto opacity-60 pointer-events-none grayscale-[50%]">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-gray-500 text-sm">
                                <th className="py-4 px-6 font-semibold">Ứng Viên</th>
                                <th className="py-4 px-6 font-semibold">Vị Trí Phù Hợp</th>
                                <th className="py-4 px-6 font-semibold text-center">Độ Phù Hợp (AI)</th>
                                <th className="py-4 px-6 font-semibold text-right">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-50">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src="https://ui-avatars.com/api/?name=Linh+Phan&background=0D8ABC&color=fff"
                                            className="w-10 h-10 rounded-full"
                                            alt="avatar"
                                        />
                                        <div>
                                            <p className="font-bold text-gray-900">Linh Phan</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                <MapPin size={12} /> Hà Nội
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <p className="text-gray-800 font-medium">Senior ReactJS Developer</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Kinh nghiệm: 3 năm</p>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <span className="inline-flex items-center justify-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-black border border-green-200">
                                        95%
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-right space-x-3">
                                    <button className="text-blue-600 font-semibold">Xem CV</button>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="4" className="py-6 text-center text-gray-500 font-medium">
                                    Hệ thống đang phân tích kho dữ liệu để tìm ứng viên phù hợp...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
