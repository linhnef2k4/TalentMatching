import React from 'react';
import { Users, Briefcase, Ban, BrainCircuit, Activity, CheckCircle2 } from 'lucide-react';

const AdminDashboard = () => {
    // Mock số liệu thống kê toàn hệ thống
    const summaryStats = [
        {
            title: 'Tổng CV Hệ Thống',
            value: '14,230',
            icon: <Users className="text-blue-600" size={28} />,
            bg: 'bg-blue-100',
        },
        {
            title: 'Tổng JD Đang Mở',
            value: '1,845',
            icon: <Briefcase className="text-indigo-600" size={28} />,
            bg: 'bg-indigo-100',
        },
        {
            title: 'Lượt Matching (Tháng)',
            value: '45,912',
            icon: <Activity className="text-green-600" size={28} />,
            bg: 'bg-green-100',
        },
    ];

    // Mock danh sách tài khoản cần quản lý (Khóa/Mở khóa)
    const recentUsers = [
        { id: 1, name: 'LinhNef', email: 'linhnef@example.com', role: 'Seeker', status: 'Active', date: '09/03/2026' },
        {
            id: 2,
            name: 'Công ty TNHH Minh Lương',
            email: 'hr@minhluong.vn',
            role: 'HR',
            status: 'Active',
            date: '08/03/2026',
        },
        { id: 3, name: 'SpamUser99', email: 'spam@fake.com', role: 'Seeker', status: 'Banned', date: '05/03/2026' },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto font-sans">
            {/* Box Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Thống Kê Toàn Hệ Thống</h2>
                    <p className="text-gray-500 mt-1">Theo dõi các chỉ số quan trọng và quản lý tài khoản vi phạm.</p>
                </div>
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 border border-green-200">
                    <CheckCircle2 size={18} /> Hệ thống ổn định
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {summaryStats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition"
                    >
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${stat.bg}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
                            <p className="text-sm text-gray-500 font-semibold mt-1">{stat.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cột trái (Chiếm 2/3): Quản lý danh sách tài khoản */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-800">Quản lý Tài Khoản Gần Đây</h2>
                        <button className="text-blue-600 text-sm font-semibold hover:underline">Xem tất cả</button>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-gray-100 text-gray-500 text-sm">
                                <tr>
                                    <th className="py-4 px-6 font-semibold">Người Dùng / Công Ty</th>
                                    <th className="py-4 px-6 font-semibold text-center">Vai trò</th>
                                    <th className="py-4 px-6 font-semibold text-center">Trạng thái</th>
                                    <th className="py-4 px-6 font-semibold text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/80 transition">
                                        <td className="py-4 px-6">
                                            <p className="font-bold text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${user.role === 'HR' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 w-max ${user.status === 'Active' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}
                                            >
                                                {user.status === 'Active' ? 'Hoạt động' : 'Bị khóa'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            {user.status === 'Active' ? (
                                                <button
                                                    className="text-red-600 hover:text-white bg-red-50 hover:bg-red-600 p-2 rounded-lg transition"
                                                    title="Khóa tài khoản (Ban)"
                                                >
                                                    <Ban size={18} />
                                                </button>
                                            ) : (
                                                <button className="text-gray-500 hover:text-blue-600 font-semibold text-sm transition px-3 py-1 border border-gray-200 rounded-lg hover:border-blue-400 bg-white">
                                                    Mở khóa
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Cột phải (Chiếm 1/3): Tiến trình AI & Hệ thống */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                        <BrainCircuit className="text-indigo-600" size={22} />
                        Tiến trình Hệ thống
                    </h2>

                    <div className="flex-1 space-y-6">
                        {/* Box 1 */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-700 font-semibold">Train Model AI (v2.4)</span>
                                <span className="text-indigo-600 font-black">85%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-indigo-600 h-2.5 rounded-full relative">
                                    <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 font-medium">Đang nạp: 120,000 cặp CV-JD mới.</p>
                        </div>

                        {/* Box 2 */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-700 font-semibold">Dung lượng Server</span>
                                <span className="text-orange-600 font-black">62%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-orange-500 h-2.5 rounded-full"></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 font-medium">Trạng thái lưu trữ ổn định.</p>
                        </div>

                        {/* Box Action */}
                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl mt-auto">
                            <h4 className="font-bold text-indigo-900 text-sm mb-1">Cập nhật Feedback AI</h4>
                            <p className="text-xs text-indigo-700 mb-3 font-medium">
                                Hệ thống ghi nhận 340 feedback từ HR báo cáo kết quả matching chưa chuẩn.
                            </p>
                            <button className="w-full bg-white border border-indigo-200 text-indigo-700 text-sm font-bold py-2.5 rounded-xl shadow-sm hover:bg-indigo-600 hover:text-white transition">
                                Đồng bộ & Khắc phục
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
