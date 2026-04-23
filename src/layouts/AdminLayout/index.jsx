import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Building,
    BrainCircuit,
    LogOut,
    Bell,
    ShieldAlert,
    Database,
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    Building2,
} from 'lucide-react';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // State quản lý việc mở/đóng thông báo
    const [showNotif, setShowNotif] = useState(false);

    // Mock data thông báo dành riêng cho Admin
    const adminNotifications = [
        {
            id: 1,
            text: 'Công ty TNHH Phần Mềm ABC vừa đăng ký tài khoản HR mới. Cần duyệt ngay.',
            time: '5 phút trước',
            isRead: false,
            type: 'company',
        },
        {
            id: 2,
            text: 'Hệ thống AI vừa cắm cờ (Flag) 1 tin tuyển dụng nghi ngờ đa cấp.',
            time: '10 phút trước',
            isRead: false,
            type: 'alert',
        },
        {
            id: 3,
            text: 'Quá trình Huấn luyện lại (Retrain) Model AI v2.4 đã hoàn tất 100%.',
            time: '2 giờ trước',
            isRead: true,
            type: 'system',
        },
        {
            id: 4,
            text: 'Có 15 báo cáo (Report) từ HR về kết quả AI matching không chính xác.',
            time: 'Hôm qua',
            isRead: true,
            type: 'alert',
        },
    ];

    const unreadCount = adminNotifications.filter((n) => !n.isRead).length;

    const menuItems = [
        { path: '/admin/dashboard', name: 'Tổng quan Hệ thống', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/users', name: 'Quản lý Người dùng', icon: <Users size={20} /> },
        { path: '/admin/companies', name: 'Duyệt Doanh nghiệp', icon: <Building size={20} /> },
        { path: '/admin/moderation', name: 'Kiểm duyệt CV/JD', icon: <ShieldCheck size={20} /> },
        { path: '/admin/ai-models', name: 'Quản lý AI & Dữ liệu', icon: <BrainCircuit size={20} /> },
        { path: '/admin/content', name: 'Quản lý Hiển thị', icon: <Database size={20} /> },
    ];

    // Hàm render icon tương ứng với loại thông báo
    const renderNotifIcon = (type) => {
        switch (type) {
            case 'company':
                return (
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                        <Building2 size={16} />
                    </div>
                );
            case 'alert':
                return (
                    <div className="p-2 bg-red-100 text-red-600 rounded-full">
                        <AlertTriangle size={16} />
                    </div>
                );
            case 'system':
                return (
                    <div className="p-2 bg-green-100 text-green-600 rounded-full">
                        <CheckCircle2 size={16} />
                    </div>
                );
            default:
                return (
                    <div className="p-2 bg-gray-100 text-gray-600 rounded-full">
                        <Bell size={16} />
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans">
            {/* Sidebar - Tông màu tối quyền lực */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 shadow-xl z-20">
                <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
                    <Link to="/admin/dashboard" className="text-xl font-black text-white flex items-center gap-2">
                        <ShieldAlert className="text-red-500" size={24} />
                        Admin<span className="text-blue-500">Panel</span>
                    </Link>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                    <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quản trị viên</p>
                    {menuItems.map((item, idx) => {
                        const isActive = location.pathname.includes(item.path);
                        return (
                            <Link
                                key={idx}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium
                  ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                                {item.path === '/admin/companies' && (
                                    <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                        5
                                    </span>
                                )}
                                {item.path === '/admin/moderation' && (
                                    <span className="ml-auto bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                        4
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 bg-slate-950">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Thoát Admin</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10 sticky top-0 shadow-sm">
                    <h1 className="text-xl font-bold text-gray-800">
                        {menuItems.find((m) => location.pathname.includes(m.path))?.name || 'Hệ thống'}
                    </h1>

                    <div className="flex items-center gap-4">
                        {/* QUẢ CHUÔNG THÔNG BÁO Ở ĐÂY */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotif(!showNotif)}
                                className="text-gray-500 hover:text-blue-600 transition relative p-1"
                            >
                                <Bell size={22} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0 -right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown Thông báo */}
                            {showNotif && (
                                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                        <h3 className="font-bold text-gray-800 text-sm">Thông báo hệ thống</h3>
                                        <button className="text-xs text-blue-600 font-semibold hover:underline">
                                            Đánh dấu đã đọc
                                        </button>
                                    </div>
                                    <div className="max-h-[360px] overflow-y-auto">
                                        {adminNotifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition cursor-pointer border-l-4 ${!notif.isRead ? 'border-l-blue-600 bg-blue-50/30' : 'border-l-transparent'}`}
                                            >
                                                {renderNotifIcon(notif.type)}
                                                <div>
                                                    <p
                                                        className={`text-sm ${!notif.isRead ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}
                                                    >
                                                        {notif.text}
                                                    </p>
                                                    <span className="text-xs text-gray-400 mt-1 block font-medium">
                                                        {notif.time}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-4 py-2 border-t border-gray-100 text-center bg-gray-50/50">
                                        <Link
                                            to="/admin/notifications"
                                            className="text-sm text-blue-600 font-semibold hover:underline"
                                        >
                                            Xem tất cả thông báo
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-2">
                            <img
                                src="https://ui-avatars.com/api/?name=Admin+Linh&background=ef4444&color=fff"
                                alt="Admin"
                                className="w-9 h-9 rounded-full border-2 border-red-100"
                            />
                            <div className="text-sm">
                                <p className="font-bold text-gray-900 leading-none">Admin Linh</p>
                                <p className="text-xs text-red-500 font-semibold mt-1">Super Admin</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
};

export default AdminLayout;
