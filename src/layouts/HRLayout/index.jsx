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
} from 'lucide-react';
import chatService from '~/services/chatService';
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
        * {
            font-family: Inter, system-ui, -apple-system, sans-serif;
        }

        .nav-item {
            display:flex;
            align-items:center;
            justify-content:space-between;
            padding:10px 14px;
            color:${SIDEBAR_TEXT};
            border-radius:6px;
            text-decoration:none;
            font-size:14px;
            transition: all 0.2s;
        }

        .nav-item:hover {
            background:#495057;
            color:#fff;
        }

        .nav-item.active {
            background:${PRIMARY};
            color:#fff;
            font-weight:600;
        }

        .logout-item {
            display:flex;
            align-items:center;
            gap:12px;
            padding:12px 16px;
            border-radius:6px;
            font-size:15px;
            font-weight:600;
            color:#dc3545;
            cursor:pointer;
            transition: all 0.2s;
        }

        .logout-item:hover {
            background: rgba(220,53,69,0.1);
        }

        .header-btn {
            width:36px;
            height:36px;
            border:1px solid ${BORDER};
            background:#fff;
            border-radius:6px;
            display:flex;
            align-items:center;
            justify-content:center;
            cursor:pointer;
            position:relative;
        }

        .header-btn:hover {
            background:#f1f3f5;
        }
    `;
    document.head.appendChild(s);
};

const notifIconCfg = {
    apply: { bg: '#d4edda', color: '#28a745', Icon: UserPlus },
    'ai-match': { bg: '#e2e3ff', color: '#6366f1', Icon: Sparkles },
    message: { bg: '#d1ecf1', color: '#17a2b8', Icon: MessageSquare },
    system: { bg: '#f8f9fa', color: '#6c757d', Icon: CheckCircle2 },
};

const NotifIcon = ({ type }) => {
    const { bg, color, Icon } = notifIconCfg[type] || notifIconCfg.system;
    return (
        <div style={{ background: bg, color, padding: 8, borderRadius: 6 }}>
            <Icon size={14} />
        </div>
    );
};

const HRLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showNotif, setShowNotif] = useState(false);
    const [totalUnreadChat, setTotalUnreadChat] = useState(0);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        injectGlobalStyles();
    }, []);

    const displayName = user?.fullName || 'Người dùng';
    const displayRole = user?.role === 'EMPLOYER' ? 'Doanh nghiệp' : 'Nhà tuyển dụng';
    const avatarUrl = user?.avatar;
    const initials = displayName.charAt(0).toUpperCase();

    const menuItems = [
        { path: '/hr/dashboard', name: 'Tổng quan', Icon: LayoutDashboard },
        { path: '/hr/manage-jobs', name: 'Quản lý Tin Tuyển Dụng', Icon: Briefcase },
        { path: '/hr/jd-optimizer', name: 'Tạo JD (AI)', Icon: FileEdit },
        { path: '/hr/search-candidates', name: 'Tìm Ứng Viên', Icon: Users },
        { path: '/hr/chat', name: 'Tin nhắn', Icon: MessageSquare },
        { path: '/hr/settings', name: 'Cài đặt', Icon: Settings },
    ];

    const hrNotifications = [
        {
            id: 1,
            text: 'Ứng viên Linh Phan vừa ứng tuyển vào vị trí Senior ReactJS Developer.',
            time: '2 phút trước',
            isRead: false,
            type: 'apply',
        },
        {
            id: 2,
            text: 'AI vừa tìm thấy 5 ứng viên phù hợp (>85%).',
            time: '1 giờ trước',
            isRead: false,
            type: 'ai-match',
        },
        {
            id: 3,
            text: 'Ứng viên Trần B vừa gửi tin nhắn.',
            time: 'Hôm qua',
            isRead: true,
            type: 'message',
        },
    ];

    const unreadNotifCount = hrNotifications.filter((n) => !n.isRead).length;

    useEffect(() => {
        const fetch = async () => {
            try {
                const count = await chatService.getUnreadCount();
                setTotalUnreadChat(Number(count?.data || count || 0));
            } catch {}
        };
        fetch();
    }, []);

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
                    flexDirection: 'column', // ✅ QUAN TRỌNG
                }}
            >
                <div style={{ padding: 15, fontWeight: 700 }}>TalentHR</div>

                {/* MENU */}
                <div style={{ padding: 10 }}>
                    {menuItems.map(({ path, name, Icon }) => {
                        const isActive = location.pathname.includes(path);
                        const isChat = path === '/hr/chat';

                        return (
                            <Link key={path} to={path} className={`nav-item ${isActive ? 'active' : ''}`}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <Icon size={18} />
                                    {isSidebarOpen && name}
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

                {/* LOGOUT SECTION */}
                <div style={{ marginTop: 'auto', padding: 10 }}>
                    {/* Divider */}
                    <div style={{ borderTop: '1px solid #495057', marginBottom: 10 }} />

                    <button
                        onClick={() => navigate('/')}
                        className="logout-item"
                        style={{ width: '100%', background: 'none', border: 'none' }}
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && 'Đăng xuất'}
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* HEADER */}
                <header
                    style={{
                        height: 60,
                        background: '#fff',
                        borderBottom: `1px solid ${BORDER}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0 20px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button className="header-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
                        </button>

                        <span style={{ fontWeight: 600, color: '#343a40' }}>
                            {menuItems.find((m) => location.pathname.includes(m.path))?.name || 'Dashboard'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        {/* Bell */}
                        <div style={{ position: 'relative' }}>
                            <button className="header-btn" onClick={() => setShowNotif(!showNotif)}>
                                <Bell size={16} />
                                {unreadNotifCount > 0 && (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: 5,
                                            right: 5,
                                            width: 8,
                                            height: 8,
                                            background: '#dc3545',
                                            borderRadius: '50%',
                                        }}
                                    />
                                )}
                            </button>

                            {showNotif && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: 45,
                                        width: 320,
                                        background: '#fff',
                                        border: `1px solid ${BORDER}`,
                                        borderRadius: 6,
                                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                                        zIndex: 100,
                                    }}
                                >
                                    {hrNotifications.map((n) => (
                                        <div
                                            key={n.id}
                                            style={{
                                                padding: 12,
                                                display: 'flex',
                                                gap: 10,
                                                borderBottom: '1px solid #eee',
                                            }}
                                        >
                                            <NotifIcon type={n.type} />
                                            <div>
                                                <div style={{ fontSize: 13 }}>{n.text}</div>
                                                <div style={{ fontSize: 11, color: '#6c757d' }}>{n.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* USER */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="avatar" style={{ width: 32, height: 32, borderRadius: 6 }} />
                            ) : (
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 6,
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

                            <div style={{ fontSize: 13 }}>
                                <div style={{ fontWeight: 600, color: '#343a40' }}>{displayName}</div>
                                <div style={{ fontSize: 11, color: '#6c757d' }}>{displayRole}</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* CONTENT */}
                <main style={{ flex: 1, padding: 20, overflow: 'auto' }}>{children}</main>
            </div>
        </div>
    );
};

export default HRLayout;
