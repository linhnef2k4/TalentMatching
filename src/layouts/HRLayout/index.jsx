import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Briefcase,
    FileEdit,
    Users,
    MessageSquare,
    Settings,
    LogOut,
    Bell,
    Menu,
    X,
    UserPlus,
    Sparkles,
    CheckCircle2,
    Crown,
    Loader2,
    Trash2,
    Eye,
    FileText,
    Info,
    Check,
} from 'lucide-react';
import chatService from '~/services/chatService';
import notificationService from '~/services/notificationService';
import { AuthContext } from '~/context/AuthContext';

/* ===== ADMIN STYLE ===== */
const PRIMARY = '#007bff';
const SIDEBAR_BG = '#343a40';
const SIDEBAR_TEXT = '#c2c7d0';
const BORDER = '#dee2e6';
const BG = '#f4f6f9';

const injectGlobalStyles = () => {
    if (document.getElementById('admin-style')) return;

    const s = document.createElement('style');
    s.id = 'admin-style';
    s.textContent = `
        * { font-family: Inter, system-ui, -apple-system, sans-serif; }
        .nav-item {
            display:flex; align-items:center; justify-content:space-between;
            padding:10px 14px; color:${SIDEBAR_TEXT}; border-radius:6px;
            text-decoration:none; font-size:14px; transition: all 0.2s;
        }
        .nav-item:hover { background:#495057; color:#fff; }
        .nav-item.active { background:${PRIMARY}; color:#fff; font-weight:600; }
        .logout-item {
            display:flex; align-items:center; gap:12px; padding:12px 16px;
            border-radius:6px; font-size:15px; font-weight:600; color:#dc3545;
            cursor:pointer; transition: all 0.2s;
        }
        .logout-item:hover { background: rgba(220,53,69,0.1); }
        .header-btn {
            width:36px; height:36px; border:1px solid ${BORDER}; background:#fff;
            border-radius:6px; display:flex; align-items:center; justify-content:center;
            cursor:pointer; position:relative; color:#495057; transition: all 0.2s;
        }
        .header-btn:hover { background:#f1f3f5; color:#212529; }
        
        /* 🚀 NÚT VIP MỚI SIÊU ĐẸP */
        .vip-btn-hr {
            display:flex; align-items:center; gap:6px; height:38px; padding:0 18px;
            border-radius:8px; font-size:13px; font-weight:800; cursor:pointer;
            background: linear-gradient(90deg, #FFD700, #F59E0B, #ea580c, #F59E0B, #FFD700);
            background-size: 300% 100%;
            color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            border: none; text-decoration:none; 
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
            animation: gradientShine 3s infinite linear;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .vip-btn-hr:hover { 
            transform: translateY(-2px) scale(1.02); 
            box-shadow: 0 8px 20px rgba(245, 158, 11, 0.6); 
        }
        @keyframes gradientShine {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
        }

        /* HIỆU ỨNG HOVER THÔNG BÁO */
        .notif-item-hr:hover { background: #f1f3f5 !important; }
        .notif-delete-btn-hr {
            opacity: 0;
            transition: all 0.2s;
        }
        .notif-item-hr:hover .notif-delete-btn-hr {
            opacity: 1;
        }
        .notif-delete-btn-hr:hover {
            color: #dc3545 !important;
            border-color: #f5c6cb !important;
            background: #f8d7da !important;
        }
        
        /* SCROLLBAR */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ced4da; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #adb5bd; }
    `;
    document.head.appendChild(s);
};

const HRLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [totalUnreadChat, setTotalUnreadChat] = useState(0);

    // STATES THÔNG BÁO
    const [showNotif, setShowNotif] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);

    useEffect(() => {
        injectGlobalStyles();
    }, []);

    const displayName = user?.fullName || 'Người dùng';
    const displayRole = user?.role === 'EMPLOYER' ? 'Doanh nghiệp' : 'Nhà tuyển dụng';
    const avatarUrl = user?.companyAvatar || user?.urlAvatarCompany || user?.avatar;
    const initials = displayName.charAt(0).toUpperCase();

    const menuItems = [
        { path: '/hr/dashboard', name: 'Tổng quan', Icon: LayoutDashboard },
        { path: '/hr/manage-jobs', name: 'Quản lý Tin Tuyển Dụng', Icon: Briefcase },
        { path: '/hr/jd-optimizer', name: 'Tạo JD (AI)', Icon: FileEdit },
        { path: '/hr/search-candidates', name: 'Tìm Ứng Viên', Icon: Users },
        { path: '/hr/chat', name: 'Tin nhắn', Icon: MessageSquare },
        { path: '/hr/settings', name: 'Cài đặt', Icon: Settings },
    ];

    // =========================================================
    // LOGIC LẤY DATA & POLLING
    // =========================================================
    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchUnreadCount();
            fetchUnreadChatCount();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Polling định kỳ
    useEffect(() => {
        if (!user) return;
        const intervalId = setInterval(() => {
            if (!location.pathname.includes('/hr/chat')) fetchUnreadChatCount();
            fetchUnreadCount();
        }, 10000);
        return () => clearInterval(intervalId);
    }, [user, location.pathname]);

    const fetchNotifications = async () => {
        setIsLoadingNotifs(true);
        try {
            const response = await notificationService.getNotifications(0, 15);
            if (response && response.content) {
                setNotifications(response.content);
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
            setUnreadCount(response.unreadCount || response.data?.unreadCount || 0);
        } catch (error) {
            console.error('Lỗi đếm thông báo chưa đọc:', error);
        }
    };

    const fetchUnreadChatCount = async () => {
        try {
            const count = await chatService.getUnreadCount();
            setTotalUnreadChat(Number(count?.data || count || 0));
        } catch {}
    };

    // =========================================================
    // HÀNH VI OPTIMISTIC UI THÔNG BÁO
    // =========================================================
    const handleNotificationClick = async (notif) => {
        setShowNotif(false);

        // Optimistic UI: Cập nhật ngay UI
        if (!notif.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
            setNotifications((prevNotifs) => prevNotifs.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
            // Gọi API ngầm
            notificationService.markAsRead(notif.id).catch(console.error);
        }

        // Điều hướng
        if (notif.type === 'PAYMENT_SUCCESS') {
            navigate('/hr/pricing');
        } else if (notif.type === 'APPLICATION' || notif.type === 'APPLICATION_VIEWED') {
            navigate('/hr/manage-jobs');
        }
    };

    const handleMarkAllAsRead = async () => {
        setUnreadCount(0);
        setNotifications((prevNotifs) => prevNotifs.map((n) => ({ ...n, read: true })));
        notificationService.markAllAsRead().catch(console.error);
    };

    const handleDeleteNotification = async (e, id) => {
        e.stopPropagation();

        const deletedNotif = notifications.find((n) => n.id === id);
        if (deletedNotif && !deletedNotif.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        setNotifications((prevNotifs) => prevNotifs.filter((n) => n.id !== id));

        notificationService.deleteNotification(id).catch(console.error);
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
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `1px solid ${BORDER}`,
                    }}
                />
            );
        }
        const style = {
            width: 40,
            height: 40,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        };
        switch (type) {
            case 'PAYMENT_SUCCESS':
                return (
                    <div style={{ ...style, background: '#fff3cd', color: '#856404' }}>
                        <Crown size={20} />
                    </div>
                );
            case 'APPLICATION':
            case 'APPLICATION_VIEWED':
                return (
                    <div style={{ ...style, background: '#d1ecf1', color: '#0c5460' }}>
                        <UserPlus size={20} />
                    </div>
                );
            case 'AI_MATCH':
                return (
                    <div style={{ ...style, background: '#e2e3ff', color: '#6366f1' }}>
                        <Sparkles size={20} />
                    </div>
                );
            default:
                return (
                    <div style={{ ...style, background: '#f8f9fa', color: '#6c757d' }}>
                        <Info size={20} />
                    </div>
                );
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: BG }}>
            {/* SIDEBAR */}
            <aside
                style={{
                    width: isSidebarOpen ? 240 : 70,
                    background: SIDEBAR_BG,
                    transition: '0.3s',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 100,
                }}
            >
                <div
                    style={{
                        padding: 15,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        height: 60,
                        borderBottom: '1px solid #495057',
                    }}
                >
                    {isSidebarOpen ? 'TalentHR' : 'THR'}
                </div>
                <div style={{ padding: 10, flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
                    {menuItems.map(({ path, name, Icon }) => {
                        const isActive = location.pathname.includes(path);
                        const isChat = path === '/hr/chat';
                        return (
                            <Link
                                key={path}
                                to={path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                style={{ marginBottom: 4 }}
                            >
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <Icon size={18} /> {isSidebarOpen && name}
                                </div>
                                {isChat && totalUnreadChat > 0 && isSidebarOpen && (
                                    <span
                                        style={{
                                            background: '#dc3545',
                                            color: '#fff',
                                            borderRadius: 20,
                                            padding: '2px 6px',
                                            fontSize: 10,
                                        }}
                                    >
                                        {totalUnreadChat}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
                <div style={{ padding: 10 }}>
                    <div style={{ borderTop: '1px solid #495057', marginBottom: 10 }} />
                    <button
                        onClick={() => navigate('/')}
                        className="logout-item"
                        style={{ width: '100%', background: 'none', border: 'none' }}
                        title="Đăng xuất"
                    >
                        <LogOut size={18} /> {isSidebarOpen && 'Đăng xuất'}
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <header
                    style={{
                        height: 60,
                        background: '#fff',
                        borderBottom: `1px solid ${BORDER}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0 20px',
                        flexShrink: 0,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <button className="header-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
                        </button>
                        <span style={{ fontWeight: 600, color: '#343a40', fontSize: 16 }}>
                            {menuItems.find((m) => location.pathname.includes(m.path))?.name ||
                                (location.pathname.includes('/hr/pricing') ? 'Gói Dịch Vụ' : 'Dashboard')}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Link to="/hr/pricing" className="vip-btn-hr">
                            <Crown size={16} className="fill-white" />
                            <span>Nâng cấp Doanh Nghiệp</span>
                        </Link>

                        <div style={{ position: 'relative' }}>
                            <button
                                className="header-btn"
                                onClick={() => {
                                    setShowNotif(!showNotif);
                                    if (!showNotif && notifications.length === 0) fetchNotifications();
                                }}
                            >
                                <Bell size={16} />
                                {unreadCount > 0 && (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: -4,
                                            right: -4,
                                            background: '#dc3545',
                                            color: '#fff',
                                            fontSize: 10,
                                            fontWeight: 'bold',
                                            borderRadius: '50%',
                                            width: 18,
                                            height: 18,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid #fff',
                                        }}
                                    >
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* DROPDOWN THÔNG BÁO ĐÃ SỬA LỖI FLEX */}
                            {showNotif && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: 45,
                                        width: 360,
                                        background: '#fff',
                                        border: `1px solid ${BORDER}`,
                                        borderRadius: 8,
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                        zIndex: 100,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: '12px 15px',
                                            background: '#f8f9fa',
                                            borderBottom: `1px solid ${BORDER}`,
                                            fontWeight: 'bold',
                                            color: '#343a40',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <span>Thông báo</span>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllAsRead}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: PRIMARY,
                                                    fontSize: 12,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                }}
                                            >
                                                <Check size={14} /> Đánh dấu đã đọc
                                            </button>
                                        )}
                                    </div>
                                    <div className="custom-scrollbar" style={{ maxHeight: 380, overflowY: 'auto' }}>
                                        {isLoadingNotifs ? (
                                            <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}>
                                                <Loader2
                                                    size={24}
                                                    className="animate-spin text-[#adb5bd]"
                                                    color="#adb5bd"
                                                />
                                            </div>
                                        ) : notifications.length > 0 ? (
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    className="notif-item-hr"
                                                    style={{
                                                        display: 'flex', // Ép kiểu Flexbox cứng bằng Inline Style
                                                        alignItems: 'flex-start',
                                                        gap: 12,
                                                        padding: '12px 16px',
                                                        background: n.read ? '#fff' : '#ebf5ff',
                                                        borderBottom: '1px solid #f1f3f5',
                                                        cursor: 'pointer',
                                                        position: 'relative',
                                                        transition: 'background 0.2s',
                                                    }}
                                                    onClick={() => handleNotificationClick(n)}
                                                >
                                                    <div style={{ flexShrink: 0, marginTop: 2 }}>
                                                        {getNotificationIcon(n.type, n.senderAvatar)}
                                                    </div>
                                                    <div
                                                        style={{
                                                            flex: 1,
                                                            minWidth: 0,
                                                            paddingRight: 24 /* Chừa chỗ cho dấu X / Chấm xanh */,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontSize: 13,
                                                                color: n.read ? '#495057' : '#212529',
                                                                fontWeight: n.read ? 500 : 700,
                                                                lineHeight: 1.4,
                                                                marginBottom: 4,
                                                                wordWrap: 'break-word',
                                                            }}
                                                        >
                                                            {n.message}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 11,
                                                                color: n.read ? '#adb5bd' : PRIMARY,
                                                                fontWeight: n.read ? 400 : 600,
                                                            }}
                                                        >
                                                            {formatTime(n.createdAt)}
                                                        </div>
                                                    </div>

                                                    {/* Chấm tròn báo chưa đọc */}
                                                    {!n.read && (
                                                        <div
                                                            style={{
                                                                position: 'absolute',
                                                                right: 16,
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                width: 10,
                                                                height: 10,
                                                                background: PRIMARY,
                                                                borderRadius: '50%',
                                                                boxShadow: '0 0 6px rgba(0,123,255,0.4)',
                                                                zIndex: 5,
                                                            }}
                                                        ></div>
                                                    )}

                                                    {/* Nút xóa */}
                                                    <button
                                                        className="notif-delete-btn-hr"
                                                        onClick={(e) => handleDeleteNotification(e, n.id)}
                                                        title="Xóa"
                                                        style={{
                                                            position: 'absolute',
                                                            right: 12,
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            padding: 6,
                                                            background: '#fff',
                                                            border: `1px solid ${BORDER}`,
                                                            color: '#adb5bd',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            zIndex: 10,
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ padding: 40, textAlign: 'center', color: '#adb5bd' }}>
                                                <Bell size={32} style={{ opacity: 0.5, margin: '0 auto 10px' }} />
                                                <div style={{ fontSize: 14, fontWeight: 500 }}>
                                                    Bạn chưa có thông báo nào
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ width: 1, height: 24, background: BORDER }}></div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="avatar"
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 8,
                                        objectFit: 'cover',
                                        border: `1px solid ${BORDER}`,
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 8,
                                        background: PRIMARY,
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600,
                                    }}
                                >
                                    {initials}
                                </div>
                            )}
                            <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <div style={{ fontWeight: 700, color: '#343a40', lineHeight: 1 }}>{displayName}</div>
                                <div style={{ fontSize: 11, color: '#6c757d', lineHeight: 1 }}>{displayRole}</div>
                            </div>
                        </div>
                    </div>
                </header>

                <main style={{ flex: 1, padding: 20, overflow: 'auto', background: BG }} className="custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default HRLayout;
