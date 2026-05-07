import React, { useState, useEffect, useRef } from 'react';
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
    Building2,
    Tags,
    UserPlus,
    Check,
    Trash2,
    Info,
    Loader2,
} from 'lucide-react';
import notificationService from '~/services/notificationService';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // STATES THÔNG BÁO
    const [showNotif, setShowNotif] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);

    // =========================================================
    // BIẾN CỜ CHỐNG NHẢY SỐ (RACE CONDITION FIX)
    // =========================================================
    const isMutatingRef = useRef(false);

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();

        // Polling định kỳ đếm số lượng thông báo (10s 1 lần)
        const intervalId = setInterval(() => {
            // CHỈ QUÉT KHI KHÔNG CÓ THAO TÁC NÀO ĐANG CHẠY NGẦM
            if (!isMutatingRef.current) {
                fetchUnreadCount();
            }
        }, 10000);

        return () => clearInterval(intervalId);
    }, []);

    const fetchNotifications = async () => {
        setIsLoadingNotifs(true);
        try {
            const response = await notificationService.getNotifications(0, 15);
            if (response && response.content) {
                setNotifications(response.content);
            }
        } catch (error) {
            console.error('Lỗi tải thông báo Admin:', error);
        } finally {
            setIsLoadingNotifs(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await notificationService.getUnreadCount();
            setUnreadCount(response.unreadCount || response.data?.unreadCount || 0);
        } catch (error) {
            console.error('Lỗi đếm thông báo chưa đọc:', error);
        }
    };

    // =========================================================
    // HÀNH VI OPTIMISTIC UI THÔNG BÁO MƯỢT MÀ NHƯ MESSENGER
    // =========================================================
    const handleNotificationClick = async (notif) => {
        setShowNotif(false);

        if (!notif.read) {
            isMutatingRef.current = true; // KHÓA QUÉT NỀN

            // 1. Giao diện thay đổi tức thì (Mất chấm xanh, làm mờ, trừ số chuông)
            setUnreadCount((prev) => Math.max(0, prev - 1));
            setNotifications((prevNotifs) => prevNotifs.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));

            try {
                // 2. Chờ Backend xác nhận ghi vào DB xong
                await notificationService.markAsRead(notif.id);
            } catch (error) {
                console.error('Lỗi markAsRead:', error);
            } finally {
                isMutatingRef.current = false; // MỞ KHÓA QUÉT NỀN
            }
        }

        // 3. Điều hướng ngay lập tức (Router)
        if (notif.type === 'COMPANY_REGISTER') {
            navigate('/admin/companies');
        } else if (notif.type === 'NEW_USER') {
            navigate('/admin/users');
        } else if (notif.type === 'SYSTEM_ALERT') {
            navigate('/admin/dashboard');
        }
    };

    const handleMarkAllAsRead = async () => {
        isMutatingRef.current = true; // KHÓA QUÉT NỀN

        // Cập nhật toàn bộ UI lập tức
        setUnreadCount(0);
        setNotifications((prevNotifs) => prevNotifs.map((n) => ({ ...n, read: true })));

        try {
            await notificationService.markAllAsRead();
        } catch (error) {
            console.error('Lỗi markAllAsRead:', error);
        } finally {
            isMutatingRef.current = false; // MỞ KHÓA QUÉT NỀN
        }
    };

    const handleDeleteNotification = async (e, id) => {
        e.stopPropagation(); // Ngăn sự kiện click nhảy sang handleNotificationClick

        isMutatingRef.current = true; // KHÓA QUÉT NỀN

        // Lấy ra thông báo chuẩn bị xóa để kiểm tra xem nó đã đọc hay chưa
        const deletedNotif = notifications.find((n) => n.id === id);
        if (deletedNotif && !deletedNotif.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        // Xóa khỏi UI
        setNotifications((prevNotifs) => prevNotifs.filter((n) => n.id !== id));

        try {
            await notificationService.deleteNotification(id);
        } catch (error) {
            console.error('Lỗi deleteNotif:', error);
        } finally {
            isMutatingRef.current = false; // MỞ KHÓA QUÉT NỀN
        }
    };

    const formatTime = (dateString) => {
        const d = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - d) / 1000);

        if (diffInSeconds < 60) return 'Vừa xong';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;

        return d.toLocaleDateString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const renderNotifIcon = (type) => {
        const baseClass = 'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm';
        switch (type) {
            case 'COMPANY_REGISTER':
                return (
                    <div className={`${baseClass} bg-blue-100 text-blue-600`}>
                        <Building2 size={20} />
                    </div>
                );
            case 'SYSTEM_ALERT':
                return (
                    <div className={`${baseClass} bg-red-100 text-red-600`}>
                        <ShieldAlert size={20} />
                    </div>
                );
            case 'NEW_USER':
                return (
                    <div className={`${baseClass} bg-emerald-100 text-emerald-600`}>
                        <UserPlus size={20} />
                    </div>
                );
            default:
                return (
                    <div className={`${baseClass} bg-slate-100 text-slate-500`}>
                        <Info size={20} />
                    </div>
                );
        }
    };

    const menuItems = [
        { path: '/admin/dashboard', name: 'Tổng quan Hệ thống', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/users', name: 'Quản lý Người dùng', icon: <Users size={20} /> },
        { path: '/admin/companies', name: 'Duyệt Doanh nghiệp', icon: <Building size={20} /> },
        { path: '/admin/pricing', name: 'Quản lý Gói cước', icon: <Tags size={20} /> },
        { path: '/admin/moderation', name: 'Kiểm duyệt CV/JD', icon: <ShieldCheck size={20} /> },
        { path: '/admin/ai-models', name: 'Quản lý AI & Dữ liệu', icon: <BrainCircuit size={20} /> },
        { path: '/admin/content', name: 'Quản lý Hiển thị', icon: <Database size={20} /> },
    ];

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#f8f9ff] flex font-sans text-slate-800">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col h-screen sticky top-0 shadow-xl z-20">
                <div className="h-20 flex items-center px-6 border-b border-slate-800/50 bg-slate-950">
                    <Link
                        to="/admin/dashboard"
                        className="text-2xl font-black text-white flex items-center gap-2 tracking-tight"
                    >
                        <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
                            <ShieldAlert className="text-white" size={18} />
                        </div>
                        Admin<span className="text-indigo-400">Panel</span>
                    </Link>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                        Menu Quản trị
                    </p>
                    {menuItems.map((item, idx) => {
                        const isActive = location.pathname.includes(item.path);
                        return (
                            <Link
                                key={idx}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold text-sm
                                  ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white text-slate-400'}`}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800/50 bg-slate-950">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-rose-400 hover:bg-rose-500 hover:text-white transition-all font-bold text-sm"
                    >
                        <LogOut size={20} />
                        <span>Thoát Admin</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0 shadow-sm">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        {menuItems.find((m) => location.pathname.includes(m.path))?.name || 'Hệ thống'}
                    </h1>

                    <div className="flex items-center gap-6">
                        {/* CHUÔNG THÔNG BÁO */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowNotif(!showNotif);
                                    if (!showNotif && notifications.length === 0) fetchNotifications();
                                }}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors relative"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-bold transition-all">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* DROPDOWN THÔNG BÁO VỚI OPTIMISTIC UI */}
                            {showNotif && (
                                <div className="absolute right-0 mt-3 w-80 sm:w-[400px] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 relative z-10">
                                        <h3 className="font-bold text-slate-900 text-[15px]">Thông báo hệ thống</h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllAsRead}
                                                className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100 transition-colors"
                                            >
                                                <Check size={14} /> Đánh dấu đã đọc
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-[380px] overflow-y-auto custom-scrollbar bg-white">
                                        {isLoadingNotifs ? (
                                            <div className="flex justify-center p-8">
                                                <Loader2 className="animate-spin text-slate-400" size={24} />
                                            </div>
                                        ) : notifications.length === 0 ? (
                                            <div className="p-10 text-center text-slate-500 flex flex-col items-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                                                    <Bell size={28} className="text-slate-300" />
                                                </div>
                                                <p className="text-sm font-medium">Không có thông báo mới.</p>
                                            </div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => handleNotificationClick(notif)}
                                                    className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer flex gap-4 relative group
                                                        ${!notif.read ? 'bg-indigo-50/40' : 'bg-white'}`}
                                                >
                                                    {/* Icon */}
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        {renderNotifIcon(notif.type)}
                                                    </div>

                                                    {/* Nội dung */}
                                                    <div className="flex-1 min-w-0 pr-6">
                                                        <p
                                                            className={`text-[14px] leading-snug line-clamp-3 mb-1.5
                                                            ${!notif.read ? 'text-slate-900 font-extrabold' : 'text-slate-600 font-medium'}`}
                                                        >
                                                            {notif.message || notif.title}
                                                        </p>
                                                        <span
                                                            className={`text-[11px] block 
                                                            ${!notif.read ? 'text-indigo-600 font-bold' : 'text-slate-400 font-medium'}`}
                                                        >
                                                            {formatTime(notif.createdAt)}
                                                        </span>
                                                    </div>

                                                    {/* Chấm tròn báo chưa đọc bên phải */}
                                                    {!notif.read && (
                                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-indigo-600 rounded-full shadow-[0_0_6px_rgba(79,70,229,0.4)]"></div>
                                                    )}

                                                    {/* Nút xóa (Hiện khi hover) */}
                                                    <button
                                                        onClick={(e) => handleDeleteNotification(e, notif.id)}
                                                        className="absolute top-4 right-3 p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 shadow-sm"
                                                        title="Xóa thông báo"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-3 border-t border-slate-100 text-center bg-slate-50">
                                        <button className="text-sm text-indigo-600 font-bold hover:underline">
                                            Xem tất cả thông báo
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-8 w-px bg-slate-200"></div>

                        {/* Thông tin Admin */}
                        <div className="flex items-center gap-3 bg-slate-50 pr-4 pl-1.5 py-1.5 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                            <img
                                src="https://ui-avatars.com/api/?name=Admin+Root&background=4f46e5&color=fff&bold=true"
                                alt="Admin"
                                className="w-8 h-8 rounded-full"
                            />
                            <div className="text-sm">
                                <p className="font-bold text-slate-900 leading-none">Quản trị viên</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">{children}</main>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
