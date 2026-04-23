import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Search,
    Send,
    MoreVertical,
    Loader2,
    MessageSquare,
    AlertCircle,
    Briefcase,
    RefreshCw,
    X,
    Smile,
    Image as ImageIcon,
    FileText,
} from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import EmojiPicker from 'emoji-picker-react';
import { AuthContext } from '~/context/AuthContext';
import chatService from '~/services/chatService';

/* ─────────────────────────────────────────────
   CONSTANTS (VPS Server)
───────────────────────────────────────────────*/
const WS_BASE = 'http://160.191.214.94:8080';
const WS_URL = `${WS_BASE}/ws`; // Đã sửa thành /ws giống ChatApp

/* ─────────────────────────────────────────────
   HELPERS & UPLOAD
───────────────────────────────────────────────*/
const fmt = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const fmtDay = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
    const now = new Date();
    const diff = new Date(now.toDateString()) - new Date(d.toDateString());
    if (diff === 0) return 'Hôm nay';
    if (diff === 86400000) return 'Hôm qua';
    return d.toLocaleDateString('vi-VN');
};

const parseList = (res) =>
    Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.content)
            ? res.content
            : Array.isArray(res?.result)
              ? res.result
              : [];

const uploadToCloudinary = async (file) => {
    const cloudName = 'dw41rvui8';
    const apiKey = '434154359271396';
    const apiSecret = 'UecGX8Jyli781QkvEyAeipsgP9A';

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signatureString = `timestamp=${timestamp}${apiSecret}`;

    const msgBuffer = new TextEncoder().encode(signatureString);
    const hashBuffer = await window.crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    return { url: data.secure_url, type: data.resource_type, name: file.name };
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────*/
const Avatar = ({ src, name, size = 'md' }) => {
    const [err, setErr] = useState(false);
    const cls =
        { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-11 h-11 text-sm' }[size] ?? 'w-10 h-10 text-sm';
    const initials = (name || 'U')
        .split(' ')
        .slice(-2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    return !err && src ? (
        <img
            src={src}
            alt={name}
            onError={() => setErr(true)}
            className={`${cls} rounded-full object-cover flex-shrink-0 ring-2 ring-white`}
        />
    ) : (
        <div
            className={`${cls} rounded-full flex-shrink-0 ring-2 ring-white bg-blue-100 text-blue-600 font-bold flex items-center justify-center`}
        >
            {initials}
        </div>
    );
};

const DaySep = ({ label }) => (
    <div className="flex items-center gap-3 my-4 select-none">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
        <div className="flex-1 h-px bg-gray-200" />
    </div>
);

const TypingDots = () => (
    <div className="flex items-end gap-2 animate-in fade-in duration-300 max-w-[70%] mt-2">
        <div className="bg-gray-100 text-gray-500 p-3 rounded-2xl rounded-bl-none text-xs italic flex items-center gap-1 w-fit shadow-sm">
            Đang gõ<span className="animate-bounce">.</span>
            <span className="animate-bounce delay-100">.</span>
            <span className="animate-bounce delay-200">.</span>
        </div>
    </div>
);

const MessageBubble = ({ content, isMe }) => {
    if (content.startsWith('[IMAGE]')) {
        const url = content.replace('[IMAGE]', '');
        return (
            <img
                src={url}
                alt="attachment"
                className="max-w-[240px] sm:max-w-[300px] rounded-2xl cursor-pointer hover:opacity-95 transition border border-black/5 object-cover"
            />
        );
    }
    if (content.startsWith('[VIDEO]')) {
        const url = content.replace('[VIDEO]', '');
        return (
            <video src={url} controls className="max-w-[240px] sm:max-w-[300px] rounded-2xl border border-black/5" />
        );
    }
    if (content.startsWith('[FILE]')) {
        const parts = content.replace('[FILE]', '').split('|');
        return (
            <a
                href={parts[0]}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 hover:underline font-medium"
            >
                <div className={`p-2.5 rounded-xl ${isMe ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                    <FileText size={20} />
                </div>
                <span className="truncate max-w-[180px] text-[14px]">{parts[1] || 'Tệp đính kèm'}</span>
            </a>
        );
    }
    return <span>{content}</span>;
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────*/
const HRChat = () => {
    const { user } = useContext(AuthContext);
    const token = localStorage.getItem('access_token');
    const location = useLocation();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoadingChats, setIsLoadingChats] = useState(true);
    const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [wsStatus, setWsStatus] = useState('connecting');

    const [currentPage, setCurrentPage] = useState(0);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);

    const [showEmoji, setShowEmoji] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const stompRef = useRef(null);
    const activeRef = useRef(null);
    const messagesEndRef = useRef(null);
    const typingTimer = useRef(null);
    const fileInputRef = useRef(null);
    const emojiRef = useRef(null);
    const textareaRef = useRef(null);
    const prevActiveContactId = useRef(null);

    useEffect(() => {
        activeRef.current = activeContact;
    }, [activeContact]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiRef.current && !emojiRef.current.contains(event.target)) setShowEmoji(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /* ── SCROLL OPTIMIZATION (FIXED) ─────────────────────── */
    const scrollToBottom = useCallback((behavior = 'smooth') => {
        if (messagesEndRef.current) {
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' }), 50);
        }
    }, []);

    useEffect(() => {
        if (isLoadingMsgs) return;
        if (messages.length === 0) return;

        if (activeContact?.id !== prevActiveContactId.current) {
            scrollToBottom('instant');
            prevActiveContactId.current = activeContact?.id;
        } else {
            scrollToBottom('smooth');
        }
    }, [messages, activeContact, isLoadingMsgs, scrollToBottom]);

    useEffect(() => {
        if (isTyping) scrollToBottom('smooth');
    }, [isTyping, scrollToBottom]);

    /* ── AUTO RESOLVE OPTIMISTIC UI ── */
    useEffect(() => {
        const hasOptimistic = messages.some((m) => m.optimistic);
        if (hasOptimistic) {
            const timer = setTimeout(() => {
                setMessages((prev) => prev.map((m) => (m.optimistic ? { ...m, optimistic: false } : m)));
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [messages]);

    /* ── FETCH CONVERSATIONS ─────────────────── */
    const fetchConversations = useCallback(async () => {
        try {
            const res = await chatService.getConversations();
            const list = parseList(res);
            setConversations(list);
            return list;
        } catch (error) {
            setConversations([]);
            return [];
        }
    }, []);

    // XỬ LÝ NAVIGATE TỪ HỒ SƠ (INIT CHAT)
    useEffect(() => {
        (async () => {
            setIsLoadingChats(true);
            const list = await fetchConversations();

            if (location.state?.newContact) {
                const { id: recipientId, email, name, avatar } = location.state.newContact;
                try {
                    if (recipientId) {
                        const initRes = await chatService.initConversation(recipientId);
                        const convData = initRes.data || initRes;
                        if (convData && convData.id) {
                            handleSelectContact(convData);
                            navigate(location.pathname, { replace: true, state: {} });
                            return;
                        }
                    }
                } catch (error) {
                    console.error('Init conv fallback', error);
                }

                const existing = list.find((c) => c.partnerEmail === email);
                if (existing) {
                    handleSelectContact(existing);
                } else {
                    setActiveContact({
                        id: 'temp',
                        partnerName: name,
                        partnerAvatar: avatar,
                        partnerEmail: email,
                        isNew: true,
                    });
                    setMessages([]);
                }
                navigate(location.pathname, { replace: true, state: {} });
            }
            setIsLoadingChats(false);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state, navigate]);

    /* ── WEBSOCKET CONNECTION (FIXED DUPLICATE LOGIC) ────────────────────────────── */
    useEffect(() => {
        if (!user || !token) return;

        let destroyed = false;
        const boot = async () => {
            const client = new Client({
                webSocketFactory: () => new SockJS(WS_URL),
                connectHeaders: { Authorization: `Bearer ${token}` },
                reconnectDelay: 5000,
                heartbeatIncoming: 10000,
                heartbeatOutgoing: 10000,

                onConnect: () => {
                    if (destroyed) return;
                    setWsStatus('connected');
                    stompRef.current = client;

                    client.subscribe(`/user/${user.email}/queue/messages`, (frame) => {
                        const msg = JSON.parse(frame.body);
                        const current = activeRef.current;

                        setMessages((prev) => {
                            const inThisConv = current && (msg.conversationId === current.id || current.id === 'temp');
                            if (!inThisConv) return prev;

                            if (current.id !== 'temp') {
                                chatService.markAsRead(current.id).catch(() => {});
                            }

                            // FIX: Logic chống nhân đôi tin nhắn (Tìm đúng tin nhắn Optimistic để ghi đè)
                            const optIndex = prev.findIndex(
                                (p) =>
                                    String(p.id).startsWith('opt_') &&
                                    p.senderEmail === msg.senderEmail &&
                                    p.content.trim() === msg.content.trim(),
                            );

                            if (optIndex !== -1) {
                                const newMsgs = [...prev];
                                newMsgs[optIndex] = msg;
                                return newMsgs;
                            }

                            if (prev.some((p) => p.id === msg.id)) return prev;

                            return [...prev, msg];
                        });

                        setConversations((prev) => {
                            const idx = prev.findIndex((c) => c.id === msg.conversationId);
                            if (idx > -1) {
                                const isCurrentActive = current && current.id === msg.conversationId;
                                const isMedia = msg.content.startsWith('[');
                                const updatedConv = {
                                    ...prev[idx],
                                    lastMessage: isMedia ? 'Đã gửi tệp đính kèm' : msg.content,
                                    updatedAt: msg.createdAt,
                                    unreadCount: isCurrentActive ? 0 : prev[idx].unreadCount + 1,
                                };
                                const newList = [...prev];
                                newList.splice(idx, 1);
                                return [updatedConv, ...newList];
                            }
                            fetchConversations();
                            return prev;
                        });
                    });

                    client.subscribe(`/user/${user.email}/queue/typing`, (frame) => {
                        const typingData = JSON.parse(frame.body);
                        if (activeRef.current && activeRef.current.partnerEmail === typingData.senderEmail) {
                            setIsTyping(typingData.isTyping);
                        }
                    });
                },
                onStompError: () => {
                    if (!destroyed) setWsStatus('disconnected');
                },
                onWebSocketClose: () => {
                    if (!destroyed) setWsStatus('disconnected');
                    stompRef.current = null;
                },
                onWebSocketError: () => {
                    if (!destroyed) setWsStatus('disconnected');
                    stompRef.current = null;
                },
            });

            stompRef.current = client;
            client.activate();
        };

        boot();
        return () => {
            destroyed = true;
            stompRef.current?.deactivate();
            stompRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, token]);

    /* ── SELECT CONVERSATION ─────────────────── */
    const handleSelectContact = useCallback(
        async (conv) => {
            if (conv.id === 'temp' || activeContact?.id === conv.id) return;
            setActiveContact(conv);
            setMessages([]);
            setIsLoadingMsgs(true);
            setShowEmoji(false);
            setCurrentPage(0);

            try {
                const res = await chatService.getMessages(conv.id, 0, 20);
                const data = res.data || res;

                let msgs = [];
                if (data && data.content && Array.isArray(data.content)) {
                    msgs = data.content;
                    setHasMoreMessages(!data.last);
                } else {
                    msgs = parseList(res);
                }

                setMessages(msgs.reverse());
                await chatService.markAsRead(conv.id);
                setConversations((prev) => prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c)));
            } catch (error) {
                setMessages([]);
            } finally {
                setIsLoadingMsgs(false);
            }
        },
        [activeContact],
    );

    /* ── SEND MESSAGE ───────────────────────── */
    const handleSendMessage = useCallback(
        (e, overrideContent = null) => {
            e?.preventDefault();
            const current = activeRef.current;
            const client = stompRef.current;
            const textToSend = overrideContent || inputMessage.trim();

            if (!textToSend || !current || !client?.connected) return;

            const receiverEmail = current.partnerEmail;
            if (!receiverEmail) return;
            const nowIso = new Date().toISOString();

            const tempId = `opt_${Date.now()}`;

            client.publish({
                destination: '/app/chat',
                body: JSON.stringify({
                    conversationId: current.id !== 'temp' ? current.id : null,
                    content: textToSend,
                    receiverEmail,
                }),
            });

            setMessages((prev) => [
                ...prev,
                {
                    id: tempId,
                    conversationId: current.id,
                    content: textToSend,
                    createdAt: nowIso,
                    senderEmail: user.email,
                    receiverEmail,
                    read: true,
                    optimistic: true,
                },
            ]);

            if (current.id !== 'temp') {
                setConversations((prev) => {
                    const idx = prev.findIndex((c) => c.id === current.id);
                    if (idx > -1) {
                        const isMedia = textToSend.startsWith('[');
                        const updatedConv = {
                            ...prev[idx],
                            lastMessage: isMedia ? 'Đã gửi tệp đính kèm' : textToSend,
                            updatedAt: nowIso,
                        };
                        const newList = [...prev];
                        newList.splice(idx, 1);
                        return [updatedConv, ...newList];
                    }
                    return prev;
                });
            } else {
                setTimeout(fetchConversations, 1000);
            }

            if (!overrideContent) setInputMessage('');
            setShowEmoji(false);

            client.publish({
                destination: '/app/chat.typing',
                body: JSON.stringify({ receiverEmail, isTyping: false }),
            });
        },
        [inputMessage, user, fetchConversations],
    );

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !activeContact) return;
        if (file.size > 10 * 1024 * 1024) {
            alert('File quá lớn. Vui lòng chọn file dưới 10MB.');
            return;
        }

        setIsUploading(true);
        try {
            const uploaded = await uploadToCloudinary(file);
            let formattedContent = '';
            if (uploaded.type === 'image') formattedContent = `[IMAGE]${uploaded.url}`;
            else if (uploaded.type === 'video') formattedContent = `[VIDEO]${uploaded.url}`;
            else formattedContent = `[FILE]${uploaded.url}|${uploaded.name}`;

            handleSendMessage(null, formattedContent);
        } catch (error) {
            alert('Lỗi tải tệp lên. Vui lòng thử lại!');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
                return;
            }
            const client = stompRef.current;
            const current = activeRef.current;
            if (!client?.connected || !current) return;

            try {
                client.publish({
                    destination: '/app/chat.typing',
                    body: JSON.stringify({ receiverEmail: current.partnerEmail, isTyping: true }),
                });
                clearTimeout(typingTimer.current);
                typingTimer.current = setTimeout(() => {
                    try {
                        stompRef.current?.publish({
                            destination: '/app/chat.typing',
                            body: JSON.stringify({ receiverEmail: current.partnerEmail, isTyping: false }),
                        });
                    } catch {}
                }, 2000);
            } catch {}
        },
        [handleSendMessage],
    );

    const onEmojiClick = (emojiObject) => {
        setInputMessage((prev) => prev + emojiObject.emoji);
        textareaRef.current?.focus();
    };

    const filtered = conversations.filter((c) => c.partnerName?.toLowerCase().includes(searchQuery.toLowerCase()));

    const grouped = messages.reduce((acc, msg, idx) => {
        const day = fmtDay(msg.createdAt);
        const prev = messages[idx - 1];
        if (!prev || fmtDay(prev.createdAt) !== day) acc.push({ _sep: true, label: day, key: `sep_${idx}` });
        acc.push(msg);
        return acc;
    }, []);

    /* ──────────────────────────────────────────
       RENDER
    ──────────────────────────────────────────*/
    return (
        <div className="h-[calc(100vh-130px)] w-full flex flex-col font-sans">
            {wsStatus === 'disconnected' && (
                <div className="mb-3 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl flex items-center justify-between font-medium text-sm border border-red-200 w-full shrink-0 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={18} /> Mất kết nối tới máy chủ. Tin nhắn sẽ không được gửi.
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-1.5 hover:text-red-800 transition-colors bg-white px-3 py-1 rounded-lg border border-red-100 shadow-sm"
                    >
                        <RefreshCw size={14} /> Tải lại
                    </button>
                </div>
            )}

            <div className="bg-white flex-1 rounded-2xl shadow-sm border border-gray-200 flex overflow-hidden min-h-0">
                <aside className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50/50 min-w-[280px]">
                    <div className="p-4 border-b border-gray-200 shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                Tin Nhắn Ứng Viên
                            </h2>
                            <span
                                className={`w-2 h-2 rounded-full ${wsStatus === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : wsStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-red-500'}`}
                                title={wsStatus}
                            />
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm ứng viên..."
                                className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 transition"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoadingChats ? (
                            <div className="flex justify-center p-10">
                                <Loader2 className="animate-spin text-blue-500" />
                            </div>
                        ) : filtered.length === 0 && !activeContact?.isNew ? (
                            <div className="text-center p-10 text-gray-500 text-sm">Chưa có ứng viên nào nhắn tin.</div>
                        ) : (
                            <>
                                {activeContact?.isNew && (
                                    <div className="flex items-center gap-3 p-4 cursor-pointer border-b border-gray-100 bg-blue-50 border-l-4 border-l-blue-600">
                                        <Avatar
                                            src={activeContact.partnerAvatar}
                                            name={activeContact.partnerName}
                                            size="lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-800 truncate">
                                                {activeContact.partnerName}
                                            </h3>
                                            <p className="text-sm truncate text-blue-600 font-medium">Liên hệ mới</p>
                                        </div>
                                    </div>
                                )}
                                {filtered.map((conv) => {
                                    const isActive = activeContact?.id === conv.id;
                                    return (
                                        <div
                                            key={conv.id}
                                            onClick={() => handleSelectContact(conv)}
                                            className={`flex items-center gap-3 p-4 cursor-pointer transition border-b border-gray-100 ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-white border-l-4 border-l-transparent'}`}
                                        >
                                            <div className="relative">
                                                <Avatar src={conv.partnerAvatar} name={conv.partnerName} size="lg" />
                                                {conv.unreadCount > 0 && !isActive && (
                                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                                                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h3
                                                        className={`truncate ${conv.unreadCount > 0 && !isActive ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}
                                                    >
                                                        {conv.partnerName}
                                                    </h3>
                                                    <span className="text-xs text-gray-400 shrink-0 ml-2">
                                                        {fmt(conv.updatedAt)}
                                                    </span>
                                                </div>
                                                <p
                                                    className={`text-sm truncate ${conv.unreadCount > 0 && !isActive ? 'text-gray-800 font-medium' : 'text-gray-500'}`}
                                                >
                                                    {conv.lastMessage || 'Bắt đầu trò chuyện...'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </aside>

                <div className="flex-1 flex flex-col min-w-0 bg-white relative">
                    {!activeContact ? (
                        <div className="flex-1 flex items-center justify-center flex-col text-gray-400 select-none">
                            <div className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center mb-4">
                                <Send size={32} className="text-gray-300 ml-1" />
                            </div>
                            <p className="font-semibold text-gray-600">Chưa chọn cuộc trò chuyện</p>
                            <p className="text-sm text-gray-400 mt-1">Chọn một ứng viên bên trái để trao đổi</p>
                        </div>
                    ) : (
                        <>
                            <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white z-10 shrink-0 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Avatar src={activeContact.partnerAvatar} name={activeContact.partnerName} />
                                    <div>
                                        <h3 className="font-bold text-gray-800">{activeContact.partnerName}</h3>
                                        <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                                            {activeContact.isNew
                                                ? 'Liên hệ mới'
                                                : wsStatus === 'connected'
                                                  ? 'Đang hoạt động'
                                                  : wsStatus === 'connecting'
                                                    ? 'Đang kết nối…'
                                                    : 'Ngoại tuyến'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 border border-blue-100 shadow-sm">
                                        <Briefcase size={15} /> Xem hồ sơ
                                    </button>
                                    <button className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 space-y-2 relative">
                                {isLoadingMsgs ? (
                                    <div className="flex justify-center items-center h-full">
                                        <Loader2 className="animate-spin text-blue-500" size={24} />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center text-gray-400 text-sm mt-10 bg-white border border-gray-100 rounded-2xl py-4 px-6 shadow-sm mx-auto max-w-sm">
                                        Bắt đầu cuộc trò chuyện với{' '}
                                        <strong className="text-gray-600">{activeContact.partnerName}</strong>
                                    </div>
                                ) : (
                                    grouped.map((item) => {
                                        if (item._sep) return <DaySep key={item.key} label={item.label} />;
                                        const isMe = item.senderEmail === user?.email;
                                        const isMedia =
                                            item.content.startsWith('[IMAGE]') || item.content.startsWith('[VIDEO]');

                                        return (
                                            <div
                                                key={item.id}
                                                className={`flex items-end gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                                            >
                                                {!isMe && (
                                                    <div className="mb-4">
                                                        <Avatar
                                                            src={activeContact.partnerAvatar}
                                                            name={activeContact.partnerName}
                                                            size="sm"
                                                        />
                                                    </div>
                                                )}
                                                <div
                                                    className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}
                                                >
                                                    <div
                                                        className={`
                                                        ${isMedia ? 'bg-transparent shadow-sm rounded-2xl overflow-hidden' : 'px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed break-words shadow-sm'}
                                                        ${!isMedia && isMe ? `bg-blue-600 text-white rounded-br-none ${item.optimistic ? 'opacity-80' : ''}` : ''}
                                                        ${!isMedia && !isMe ? 'bg-white border border-gray-200 text-gray-800 rounded-bl-none' : ''}
                                                    `}
                                                    >
                                                        <MessageBubble content={item.content} isMe={isMe} />
                                                    </div>
                                                    <div
                                                        className={`text-[10px] text-gray-400 mt-1.5 px-1 font-medium ${isMe ? 'text-right' : 'text-left'}`}
                                                    >
                                                        {fmt(item.createdAt)} {item.optimistic && ' · Đang gửi...'}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                {isTyping && <TypingDots />}
                                <div ref={messagesEndRef} className="h-4" />
                            </div>

                            <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-white relative">
                                {showEmoji && (
                                    <div
                                        className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-bottom-2 border border-gray-100"
                                        ref={emojiRef}
                                    >
                                        <EmojiPicker
                                            onEmojiClick={onEmojiClick}
                                            searchDisabled
                                            skinTonesDisabled
                                            height={350}
                                        />
                                    </div>
                                )}
                                <form
                                    onSubmit={handleSendMessage}
                                    className={`flex items-end gap-2 bg-gray-50 border rounded-3xl pl-2 pr-2 py-2 transition-all ${wsStatus === 'connected' ? 'border-gray-300 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 focus-within:bg-white' : 'border-gray-200 opacity-60'}`}
                                >
                                    <div className="flex items-center gap-1 h-[44px]">
                                        <button
                                            type="button"
                                            onClick={() => setShowEmoji(!showEmoji)}
                                            className="text-gray-400 hover:text-blue-600 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-all shrink-0"
                                        >
                                            <Smile size={20} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-gray-400 hover:text-blue-600 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-all shrink-0"
                                        >
                                            <ImageIcon size={20} />
                                        </button>
                                        <input
                                            type="file"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            accept="image/*,video/*,.pdf,.doc,.docx"
                                        />
                                    </div>
                                    <textarea
                                        ref={textareaRef}
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        disabled={wsStatus !== 'connected' || isUploading}
                                        placeholder={
                                            isUploading
                                                ? 'Đang tải tệp lên...'
                                                : wsStatus === 'connected'
                                                  ? 'Nhập tin nhắn…'
                                                  : 'Đang kết nối…'
                                        }
                                        className="flex-1 bg-transparent py-3 px-1 text-[14px] leading-tight text-gray-700 placeholder-gray-400 outline-none disabled:cursor-not-allowed resize-none max-h-32 min-h-[44px] custom-scrollbar my-auto"
                                        rows="1"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputMessage.trim() || wsStatus !== 'connected' || isUploading}
                                        className="w-[44px] h-[44px] shrink-0 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 hover:shadow-md transition-all disabled:opacity-50 disabled:hover:shadow-none disabled:cursor-not-allowed active:scale-95"
                                    >
                                        {isUploading ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <Send size={18} className="ml-1" />
                                        )}
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HRChat;
