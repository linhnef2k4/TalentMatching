import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Bell,
    MessageSquare,
    Briefcase,
    ChevronDown,
    User,
    Lock,
    LogOut,
    CheckCircle2,
    HelpCircle,
    X,
    Loader2,
    Send,
    Crown,
    Check,
    FileText,
    Info,
    Trash2,
    Eye,
} from 'lucide-react';
import { AuthContext } from '~/context/AuthContext';
import notificationService from '~/services/notificationService';
import chatService from '~/services/chatService';
import reportService from '~/services/reportService';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [showNotif, setShowNotif] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [totalUnreadChat, setTotalUnreadChat] = useState(0);
    const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);

    // =========================================================
    // BIẾN CỜ CHỐNG NHẢY SỐ (KHÓA VÒNG LẶP KHI ĐANG GỌI API)
    // =========================================================
    const isMutatingRef = useRef(false);

    // ================= MODAL GÓP Ý / BÁO LỖI =================
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
    const [supportForm, setSupportForm] = useState({
        type: 'SUGGESTION',
        title: '',
        content: '',
    });

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

    // Lấy thông báo hệ thống và số lượng chưa đọc
    useEffect(() => {
        if (isLoggedIn) {
            fetchNotifications();
            fetchUnreadCount();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn]);

    const fetchNotifications = async () => {
        setIsLoadingNotifs(true);
        try {
            const response = await notificationService.getNotifications(0, 15);
            // Chuẩn hóa lấy danh sách (phòng trường hợp API bọc data khác nhau)
            if (response?.content) {
                setNotifications(response.content);
            } else if (response?.data?.content) {
                setNotifications(response.data.content);
            } else if (Array.isArray(response)) {
                setNotifications(response);
            }
        } catch (error) {
            console.error('Lỗi lấy thông báo:', error);
        } finally {
            setIsLoadingNotifs(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await notificationService.getUnreadCount();
            // FIX: Dùng ?? thay cho || để tránh lỗi số 0 bị coi là falsy
            const count = response?.unreadCount ?? response?.data?.unreadCount ?? 0;
            setUnreadCount(Number(count));
        } catch (error) {
            console.error('Lỗi đếm thông báo chưa đọc:', error);
        }
    };

    // Lấy số lượng tin nhắn chưa đọc định kỳ (Có khóa chặn lỗi nhảy số)
    useEffect(() => {
        if (!isLoggedIn) return;
        const fetchUnreadChatCount = async () => {
            try {
                const response = await chatService.getUnreadCount();
                const count = response?.unreadCount ?? response?.data?.unreadCount ?? response ?? 0;
                setTotalUnreadChat(Number(count));
            } catch (error) {
                console.error(error);
            }
        };
        fetchUnreadChatCount();

        const intervalId = setInterval(() => {
            if (!location.pathname.includes('/chat')) fetchUnreadChatCount();

            // CHỈ QUÉT NẾU KHÔNG CÓ THAO TÁC NÀO ĐANG CHẠY NGẦM
            if (!isMutatingRef.current) {
                fetchUnreadCount();
            }
        }, 10000);

        return () => clearInterval(intervalId);
    }, [isLoggedIn, location.pathname]);

    // ==============================================================
    // LOGIC XỬ LÝ THÔNG BÁO (ĐÃ FIX OPTIMISTIC UPDATE VÀ ĐIỀU HƯỚNG)
    // ==============================================================
    const handleNotificationClick = async (notif) => {
        setShowNotif(false); // Đóng menu

        // FIX: Cập nhật giao diện (UI) ngay lập tức cho mượt
        if (!notif.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
            setNotifications((prevNotifs) => prevNotifs.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));

            // Gọi API ngầm để đánh dấu trên server
            try {
                await notificationService.markAsRead(notif.id);
            } catch (err) {
                console.error('Lỗi đánh dấu đã đọc:', err);
                // Nếu lỗi có thể đồng bộ lại với server
                fetchUnreadCount();
            }
        }

        // ĐIỀU HƯỚNG THEO LOẠI THÔNG BÁO
        if (notif.type === 'PAYMENT_SUCCESS') {
            navigate('/profile');
        } else if (notif.type === 'APPLICATION' || notif.type === 'APPLICATION_VIEWED') {
            navigate('/manage-jobs');
        }
    };

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) return;

        isMutatingRef.current = true;

        // FIX: Optimistic UI Update (Đổi UI thành đã đọc ngay lập tức)
        setUnreadCount(0);
        setNotifications((prevNotifs) => prevNotifs.map((n) => ({ ...n, read: true })));

        try {
            await notificationService.markAllAsRead();
        } catch (err) {
            console.error('Lỗi mark all as read:', err);
            // Cập nhật lại số liệu thật nếu gọi API xịt
            await fetchUnreadCount();
            await fetchNotifications();
        } finally {
            isMutatingRef.current = false;
        }
    };

    const handleDeleteNotification = async (e, id) => {
        e.stopPropagation(); // Tránh kích hoạt click ra div ngoài (điều hướng)
        isMutatingRef.current = true;

        // Xóa tạm thời trên giao diện
        setNotifications((prevNotifs) => prevNotifs.filter((notif) => notif.id !== id));

        try {
            await notificationService.deleteNotification(id);
            await fetchUnreadCount(); // Lấy lại số lượng chưa đọc nếu xóa cái chưa đọc
        } catch (err) {
            console.error('Lỗi xóa thông báo:', err);
            await fetchNotifications(); // Phục hồi nếu xóa xịt
        } finally {
            isMutatingRef.current = false;
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

    const getNotificationIcon = (type, senderAvatar) => {
        if (senderAvatar) {
            return (
                <img
                    src={senderAvatar}
                    alt="Sender"
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm"
                />
            );
        }
        switch (type) {
            case 'PAYMENT_SUCCESS':
                return (
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm">
                        <Crown size={24} />
                    </div>
                );
            case 'APPLICATION_VIEWED':
                return (
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                        <Eye size={24} />
                    </div>
                );
            case 'APPLICATION':
                return (
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                        <FileText size={24} />
                    </div>
                );
            default:
                return (
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shadow-sm">
                        <Info size={24} />
                    </div>
                );
        }
    };

    const handleSupportSubmit = async (e) => {
        e.preventDefault();
        if (!supportForm.title.trim() || !supportForm.content.trim()) return alert('Vui lòng điền đầy đủ!');
        setIsSubmittingSupport(true);
        try {
            await reportService.submitReport({
                title: supportForm.title,
                content: supportForm.content,
                type: supportForm.type,
            });
            alert('Yêu cầu hỗ trợ đã được gửi thành công.');
            setShowSupportModal(false);
            setSupportForm({ type: 'SUGGESTION', title: '', content: '' });
        } catch (error) {
            console.error('Lỗi gửi support:', error);
            alert('Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setIsSubmittingSupport(false);
        }
    };

    return (
        <>
            <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                    {/* LOGO */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            TL
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-lg font-extrabold tracking-tight text-slate-900">
                                Talent<span className="text-orange-500">Matching</span>
                            </span>
                            <div className="h-[2px] w-12 bg-orange-500 rounded-full mt-1"></div>
                        </div>
                    </div>

                    {/* NAVIGATION LINKS */}
                    <nav className="hidden lg:flex items-center gap-6">
                        <Link
                            to="/jobs"
                            className="text-sm font-bold hover:text-blue-600 transition-colors text-slate-600"
                        >
                            Việc làm
                        </Link>
                        <Link
                            to="/companies"
                            className="text-sm font-bold hover:text-blue-600 transition-colors text-slate-600"
                        >
                            Công ty
                        </Link>
                        <Link
                            to="/cv-builder"
                            className="text-sm font-bold hover:text-blue-600 transition-colors text-slate-600"
                        >
                            Hồ sơ & CV
                        </Link>
                        <Link
                            to="/matched-jobs"
                            className="text-sm font-bold hover:text-blue-600 transition-colors flex items-center gap-1.5 text-slate-600"
                        >
                            Công cụ AI
                            <span className="bg-amber-400 text-[10px] px-1.5 py-0.5 rounded-full text-amber-950 font-black uppercase shadow-sm">
                                Mới
                            </span>
                        </Link>
                    </nav>

                    {/* ACTIONS BÊN PHẢI */}
                    <div className="flex items-center gap-2 md:gap-3">
                        <Link
                            to="/pricing"
                            className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 text-sm font-black rounded-full shadow-sm hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
                        >
                            <Crown size={16} className="fill-amber-950" />
                            <span>VIP</span>
                        </Link>

                        {!isLoggedIn ? (
                            <>
                                <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block"></div>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 hover:text-blue-600 rounded-full transition-all"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/hr-register"
                                    title="Nhà tuyển dụng"
                                    className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors border border-blue-100"
                                >
                                    <Briefcase size={18} />
                                </Link>
                            </>
                        ) : (
                            <>
                                <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                                <div className="flex items-center gap-1">
                                    <Link
                                        to={user?.role === 'EMPLOYER' ? '/hr/dashboard' : '/hr-register'}
                                        title={user?.role === 'EMPLOYER' ? 'Trang HR' : 'Đăng ký Tuyển dụng'}
                                        className="p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-full transition-colors"
                                    >
                                        <Briefcase size={20} />
                                    </Link>

                                    <Link
                                        to="/chat"
                                        className="p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-full transition-colors relative"
                                    >
                                        <MessageSquare size={20} />
                                        {totalUnreadChat > 0 && (
                                            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white box-content">
                                                {totalUnreadChat > 99 ? '99+' : totalUnreadChat}
                                            </span>
                                        )}
                                    </Link>

                                    {/* ICON CHUÔNG - ĐÃ SỬA LỖI CLICK */}
                                    <div className="relative">
                                        <button
                                            onClick={() => {
                                                const willShow = !showNotif;
                                                setShowNotif(willShow);
                                                setShowUserMenu(false);

                                                // FIX: LUÔN GỌI LẤY MỚI NHẤT KHI MỞ MENU
                                                if (willShow) {
                                                    fetchNotifications();
                                                }
                                            }}
                                            className="p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-full transition-colors relative block"
                                        >
                                            <Bell size={20} />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white box-content">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                        </button>

                                        {/* DROPDOWN THÔNG BÁO */}
                                        {showNotif && (
                                            <div className="absolute right-0 mt-3 w-[350px] md:w-[420px] bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                                <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm relative z-10">
                                                    <h4 className="font-black text-slate-900 text-xl">Thông báo</h4>
                                                    {unreadCount > 0 && (
                                                        <button
                                                            onClick={handleMarkAllAsRead}
                                                            disabled={isMutatingRef.current}
                                                            className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 bg-blue-50/50 px-2.5 py-1.5 rounded-lg border border-blue-100 transition-colors disabled:opacity-50"
                                                        >
                                                            {isMutatingRef.current ? (
                                                                <Loader2 size={14} className="animate-spin" />
                                                            ) : (
                                                                <Check size={14} />
                                                            )}{' '}
                                                            Đánh dấu đã đọc
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="max-h-[450px] overflow-y-auto custom-scrollbar bg-white">
                                                    {isLoadingNotifs ? (
                                                        <div className="flex justify-center p-8">
                                                            <Loader2
                                                                className="animate-spin text-slate-400"
                                                                size={24}
                                                            />
                                                        </div>
                                                    ) : notifications.length > 0 ? (
                                                        notifications.map((notif) => (
                                                            <div
                                                                key={notif.id}
                                                                onClick={() => handleNotificationClick(notif)}
                                                                className={`p-3 md:p-4 border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer flex gap-4 relative group
                                                                    ${!notif.read ? 'bg-[#ebf5ff]' : 'bg-white'}`}
                                                            >
                                                                <div className="flex-shrink-0 mt-0.5">
                                                                    {getNotificationIcon(
                                                                        notif.type,
                                                                        notif.senderAvatar,
                                                                    )}
                                                                </div>

                                                                <div className="flex-1 min-w-0 pr-6">
                                                                    <p
                                                                        className={`text-[14px] leading-snug line-clamp-3 mb-1.5
                                                                        ${!notif.read ? 'text-slate-900 font-extrabold' : 'text-slate-600 font-medium'}`}
                                                                    >
                                                                        {notif.message}
                                                                    </p>
                                                                    <span
                                                                        className={`text-xs block 
                                                                        ${!notif.read ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium'}`}
                                                                    >
                                                                        {formatTime(notif.createdAt)}
                                                                    </span>
                                                                </div>

                                                                {!notif.read && (
                                                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_6px_rgba(37,99,235,0.4)]"></div>
                                                                )}

                                                                <button
                                                                    onClick={(e) =>
                                                                        handleDeleteNotification(e, notif.id)
                                                                    }
                                                                    className="absolute top-2 right-2 p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 shadow-sm"
                                                                    title="Xóa thông báo"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-12 flex flex-col items-center justify-center text-center">
                                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                                                <Bell size={32} className="text-slate-300" />
                                                            </div>
                                                            <h5 className="text-lg font-bold text-slate-900 mb-1">
                                                                Bạn đã xem hết thông báo
                                                            </h5>
                                                            <p className="text-slate-500 text-sm font-medium">
                                                                Khi có cập nhật mới, chúng tôi sẽ báo cho bạn.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="h-5 w-px bg-slate-200 mx-0.5"></div>

                                {/* AVATAR USER MENU */}
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(!showUserMenu);
                                            setShowNotif(false);
                                        }}
                                        className="flex items-center gap-1.5 hover:bg-slate-100 p-1.5 pr-2.5 rounded-full transition-colors"
                                    >
                                        <img
                                            src={getAvatar()}
                                            alt="Avatar"
                                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm"
                                        />
                                        <ChevronDown size={14} className="text-slate-500 hidden md:block" />
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-3 w-72 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-50">
                                            <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
                                                <img
                                                    src={getAvatar()}
                                                    alt="Avatar"
                                                    className="w-11 h-11 rounded-full border-2 border-white shadow-sm object-cover"
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
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <User size={18} /> Quản lý thông tin
                                                </Link>
                                                <Link
                                                    to="/manage-jobs"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <Briefcase size={18} /> Quản lý việc làm
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setShowUserMenu(false);
                                                        setShowSupportModal(true);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium"
                                                >
                                                    <HelpCircle size={18} /> Góp ý & Báo lỗi
                                                </button>
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

            {/* MODAL SUPPORT */}
            {showSupportModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <form
                        onSubmit={handleSupportSubmit}
                        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
                    >
                        <div className="px-6 py-5 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <HelpCircle size={22} className="text-blue-200" /> Gửi Hỗ trợ / Báo lỗi
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowSupportModal(false)}
                                className="text-blue-200 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-5 bg-slate-50">
                            <p className="text-sm text-slate-600 font-medium">
                                Nếu bạn gặp lỗi hệ thống, có ý kiến đóng góp hoặc cần báo cáo một vấn đề, hãy cho chúng
                                tôi biết!
                            </p>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-2">Loại yêu cầu</label>
                                <select
                                    value={supportForm.type}
                                    onChange={(e) => setSupportForm({ ...supportForm, type: e.target.value })}
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 shadow-sm cursor-pointer"
                                >
                                    <option value="SUGGESTION">Góp ý tính năng</option>
                                    <option value="SYSTEM_BUG">Báo lỗi hệ thống (Bug)</option>
                                    <option value="USER_REPORT">Báo cáo người dùng vi phạm</option>
                                    <option value="OTHER">Lý do khác</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-2">
                                    Tiêu đề <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={supportForm.title}
                                    onChange={(e) => setSupportForm({ ...supportForm, title: e.target.value })}
                                    placeholder="Tóm tắt vấn đề của bạn..."
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-2">
                                    Nội dung chi tiết <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows="4"
                                    value={supportForm.content}
                                    onChange={(e) => setSupportForm({ ...supportForm, content: e.target.value })}
                                    placeholder="Vui lòng mô tả chi tiết để đội ngũ kỹ thuật có thể hỗ trợ nhanh nhất..."
                                    className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm resize-none font-medium leading-relaxed shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
                            <button
                                type="button"
                                onClick={() => setShowSupportModal(false)}
                                className="px-6 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmittingSupport}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95"
                            >
                                {isSubmittingSupport ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Send size={18} />
                                )}{' '}
                                {isSubmittingSupport ? 'Đang gửi...' : 'Gửi yêu cầu'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default Header;
