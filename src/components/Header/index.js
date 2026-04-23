import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    BrainCircuit,
    Bell,
    MessageSquare,
    Briefcase,
    ChevronDown,
    User,
    Lock,
    LogOut,
    CheckCircle2,
} from 'lucide-react';
import { AuthContext } from '~/context/AuthContext';
import notificationService from '~/services/notificationService';
import chatService from '~/services/chatService'; // Thêm API chat

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [showNotif, setShowNotif] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // State lưu trữ dữ liệu thông báo hệ thống
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // MỚI: State lưu tổng số tin nhắn chat chưa đọc
    const [totalUnreadChat, setTotalUnreadChat] = useState(0);

    const { user, isLoggedIn, logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/');
    };

    const getAvatar = () => {
        if (user?.avatar) return user.avatar;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=136dec&color=fff&size=128`;
    };

    // Gọi API lấy thông báo hệ thống
    useEffect(() => {
        if (isLoggedIn) {
            fetchNotifications();
        }
    }, [isLoggedIn]);

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getNotifications(0, 10);
            if (response && response.content) {
                setNotifications(response.content);
                const unread = response.content.filter((notif) => !notif.read).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông báo:', error);
        }
    };

    // MỚI: Gọi API lấy tổng số tin nhắn chat chưa đọc
    useEffect(() => {
        if (!isLoggedIn) return;

        const fetchUnreadChatCount = async () => {
            try {
                const count = await chatService.getUnreadCount();
                const validCount = typeof count === 'number' ? count : count?.data || 0;
                setTotalUnreadChat(Number(validCount));
            } catch (error) {
                console.error('Lỗi lấy tổng tin nhắn chưa đọc:', error);
            }
        };

        // Gọi ngay lần đầu
        fetchUnreadChatCount();

        // Tự động quét lại mỗi 10 giây nếu không ở trang chat
        const intervalId = setInterval(() => {
            if (!location.pathname.includes('/chat')) {
                fetchUnreadChatCount();
            }
        }, 10000);

        return () => clearInterval(intervalId);
    }, [isLoggedIn, location.pathname]);

    // Gọi API đánh dấu đã đọc thông báo hệ thống
    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setUnreadCount(0);
            setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
        } catch (error) {
            console.error('Lỗi khi đánh dấu đã đọc:', error);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        TL
                    </div>

                    {/* Text logo */}
                    <div className="flex flex-col leading-tight">
                        <span className="text-lg font-extrabold tracking-tight text-slate-900">
                            Talent<span className="text-orange-500">Matching</span>
                        </span>

                        {/* Vạch ngang giống TopCV */}
                        <div className="h-[2px] w-12 bg-orange-500 rounded-full mt-1"></div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="hidden lg:flex items-center gap-8">
                    <Link
                        to="/jobs"
                        className="text-sm font-medium hover:text-primary transition-colors text-slate-700"
                    >
                        Việc làm
                    </Link>
                    <Link
                        to="/companies"
                        className="text-sm font-medium hover:text-primary transition-colors text-slate-700"
                    >
                        Công ty
                    </Link>
                    <Link
                        to="/cv-builder"
                        className="text-sm font-medium hover:text-primary transition-colors text-slate-700"
                    >
                        Hồ sơ & CV
                    </Link>
                    <Link
                        to="/matched-jobs"
                        className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 text-slate-700"
                    >
                        Công cụ AI{' '}
                        <span className="bg-accent-yellow text-[10px] px-1.5 py-0.5 rounded-full text-slate-900 font-bold uppercase">
                            Mới
                        </span>
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-5">
                    {!isLoggedIn ? (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/hr-register"
                                className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                            >
                                Nhà tuyển dụng
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link
                                to={user?.role === 'EMPLOYER' ? '/hr/dashboard' : '/hr-register'}
                                className="hidden lg:flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-primary transition"
                            >
                                <Briefcase size={18} />{' '}
                                <span>{user?.role === 'EMPLOYER' ? 'Trang HR' : 'Nhà Tuyển Dụng'}</span>
                            </Link>

                            {/* CHỖ NÀY: Biểu tượng Chat & Chấm đỏ hiển thị số tin nhắn chưa đọc */}
                            <Link
                                to="/chat"
                                className="text-slate-500 hover:text-primary transition relative block p-1"
                            >
                                <MessageSquare size={22} />
                                {totalUnreadChat > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white box-content">
                                        {totalUnreadChat > 99 ? '99+' : totalUnreadChat}
                                    </span>
                                )}
                            </Link>

                            {/* Khu vực Chuông Thông báo Hệ thống */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setShowNotif(!showNotif);
                                        setShowUserMenu(false);
                                    }}
                                    className="text-slate-500 hover:text-primary transition relative block p-1"
                                >
                                    <Bell size={22} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white box-content">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Dropdown Thông báo */}
                                {showNotif && (
                                    <div className="absolute right-0 mt-4 w-80 md:w-96 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-50">
                                        <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
                                            <h4 className="font-bold text-slate-900 text-base">Thông báo</h4>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={handleMarkAllAsRead}
                                                    className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                                                >
                                                    <CheckCircle2 size={14} /> Đánh dấu đã đọc
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map((notif) => (
                                                    <div
                                                        key={notif.id}
                                                        className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition cursor-pointer ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                                    >
                                                        <h5
                                                            className={`text-sm ${!notif.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}
                                                        >
                                                            {notif.title}
                                                        </h5>
                                                        <p className="text-sm text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                                                            {notif.message}
                                                        </p>
                                                        <span className="text-[11px] text-slate-400 mt-2 block font-medium">
                                                            {formatTime(notif.createdAt)}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center text-slate-500 text-sm font-medium">
                                                    Bạn chưa có thông báo nào.
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 border-t border-slate-100 text-center bg-slate-50">
                                            <Link
                                                to="/manage-jobs"
                                                className="text-sm text-primary font-bold hover:underline"
                                            >
                                                Xem tất cả
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="h-6 w-px bg-slate-200 mx-1"></div>

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setShowUserMenu(!showUserMenu);
                                        setShowNotif(false);
                                    }}
                                    className="flex items-center gap-2 hover:bg-slate-50 p-1 pr-2 rounded-full transition border border-transparent hover:border-slate-200"
                                >
                                    <img
                                        src={getAvatar()}
                                        alt="Avatar"
                                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                    />
                                    <ChevronDown size={16} className="text-slate-500 hidden md:block" />
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-4 w-72 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden">
                                        <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
                                            <img
                                                src={getAvatar()}
                                                alt="Avatar"
                                                className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover"
                                            />
                                            <div className="overflow-hidden">
                                                <h4 className="font-bold text-slate-900 text-sm truncate">
                                                    {user?.fullName}
                                                </h4>
                                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="py-2">
                                            <Link
                                                to="/profile"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary/5 hover:text-primary transition font-medium"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <User size={18} /> Quản lý thông tin
                                            </Link>
                                            <Link
                                                to="/manage-jobs"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary/5 hover:text-primary transition font-medium"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <Briefcase size={18} /> Quản lý việc làm
                                            </Link>
                                            <Link
                                                to="/change-password"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary/5 hover:text-primary transition font-medium"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <Lock size={18} /> Đổi mật khẩu
                                            </Link>
                                            <div className="h-px bg-slate-100 my-1"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition font-medium"
                                            >
                                                <LogOut size={18} /> Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
