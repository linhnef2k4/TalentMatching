import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Search,
    Send,
    MoreVertical,
    Loader2,
    WifiOff,
    RefreshCw,
    Smile,
    Image as ImageIcon,
    FileText,
    Briefcase,
    X,
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { AuthContext } from '~/context/AuthContext';
import chatService from '~/services/chatService';

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────*/
const WS_BASE = 'http://160.191.214.94';

/* ─────────────────────────────────────────────
   HELPERS
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
    const timestamp = Math.round(Date.now() / 1000);
    const sigStr = `timestamp=${timestamp}${apiSecret}`;
    const msgBuffer = new TextEncoder().encode(sigStr);
    const hashBuffer = await window.crypto.subtle.digest('SHA-1', msgBuffer);
    const signature = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

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
    const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-11 h-11 text-sm' };
    const cls = sizeMap[size] ?? 'w-10 h-10 text-sm';
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
            className={`${cls} rounded-full flex-shrink-0 ring-2 ring-white bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center`}
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
            Đang gõ
            <span className="animate-bounce ml-0.5">.</span>
            <span className="animate-bounce [animation-delay:100ms]">.</span>
            <span className="animate-bounce [animation-delay:200ms]">.</span>
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
                <div className={`p-2.5 rounded-xl ${isMe ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
                    <FileText size={20} />
                </div>
                <span className="truncate max-w-[180px] text-[14px]">{parts[1] || 'Tệp đính kèm'}</span>
            </a>
        );
    }
    return <span>{content}</span>;
};

/* ─────────────────────────────────────────────
   CONVERSATION ITEM  — memoized for performance
───────────────────────────────────────────────*/
const ConversationItem = React.memo(({ conv, isActive, onSelect }) => (
    <div
        onClick={() => onSelect(conv)}
        className={`
            flex items-center gap-3 p-4 cursor-pointer border-b border-gray-100
            transition-colors duration-150
            ${
                isActive
                    ? 'bg-indigo-50 border-l-4 border-l-indigo-600'
                    : 'hover:bg-white border-l-4 border-l-transparent'
            }
        `}
    >
        <div className="relative flex-shrink-0">
            <Avatar src={conv.partnerAvatar} name={conv.partnerName} size="lg" />
            {conv.unreadCount > 0 && !isActive && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                    {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                </span>
            )}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-0.5">
                <h3
                    className={`truncate text-[14px] ${
                        conv.unreadCount > 0 && !isActive ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'
                    }`}
                >
                    {conv.partnerName}
                </h3>
                <span className="text-[11px] text-gray-400 shrink-0 ml-2">{fmt(conv.updatedAt)}</span>
            </div>
            <p
                className={`text-[13px] truncate ${
                    conv.unreadCount > 0 && !isActive ? 'text-gray-800 font-medium' : 'text-gray-500'
                }`}
            >
                {conv.lastMessage || 'Bắt đầu trò chuyện...'}
            </p>
        </div>
    </div>
));
ConversationItem.displayName = 'ConversationItem';

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────*/
const ChatApp = () => {
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
    const [showEmoji, setShowEmoji] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Refs
    const activeRef = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiRef = useRef(null);
    const textareaRef = useRef(null);
    const prevActiveContactId = useRef(null);

    // Performance refs
    const messagesMapRef = useRef(new Map());
    const typingTimerRef = useRef(null);

    // Keep activeRef in sync so SSE handler always has latest value
    useEffect(() => {
        activeRef.current = activeContact;
    }, [activeContact]);

    /* ── CLOSE EMOJI ON OUTSIDE CLICK ─────── */
    useEffect(() => {
        const handler = (e) => {
            if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* ── AUTO-RESIZE TEXTAREA ──────────────── */
    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = 'auto';
        ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`;
    }, [inputMessage]);

    /* ── SCROLL TO BOTTOM ─────────────────── */
    const scrollToBottom = useCallback((behavior = 'smooth') => {
        if (messagesEndRef.current) {
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' }), 50);
        }
    }, []);

    useEffect(() => {
        if (isLoadingMsgs || messages.length === 0) return;
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

    /* ── HELPER: push conversation to top of sidebar ── */
    const bumpConversation = useCallback((convId, lastMessage, updatedAt, incrementUnread = false) => {
        setConversations((prev) => {
            const idx = prev.findIndex((c) => c.id === convId);
            if (idx === -1) return prev;

            const isCurrentlyActive = activeRef.current?.id === convId;
            const updated = {
                ...prev[idx],
                lastMessage: lastMessage.startsWith('[') ? 'Đã gửi tệp đính kèm' : lastMessage,
                updatedAt,
                unreadCount:
                    incrementUnread && !isCurrentlyActive
                        ? (prev[idx].unreadCount || 0) + 1
                        : isCurrentlyActive
                          ? 0
                          : prev[idx].unreadCount,
            };

            // Move to top, keep the rest
            const rest = prev.filter((_, i) => i !== idx);
            return [updated, ...rest];
        });
    }, []);

    /* ── FETCH CONVERSATIONS ──────────────── */
    const fetchConversations = useCallback(async () => {
        try {
            const res = await chatService.getConversations();
            const list = parseList(res);
            setConversations(list);
            return list;
        } catch {
            setConversations([]);
            return [];
        }
    }, []);

    /* ── INIT: load convs + handle deep-link ─ */
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
                        if (convData?.id) {
                            handleSelectContact(convData);
                            navigate(location.pathname, { replace: true, state: {} });
                            setIsLoadingChats(false);
                            return;
                        }
                    }
                } catch (err) {
                    console.error('Init conv error:', err);
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

    /* ── SSE (REAL-TIME) ──────────────────── */
    useEffect(() => {
        if (!user?.email || !token) return;

        let es = null;
        let retryTimer = null;

        const connect = () => {
            const url = `${WS_BASE}:8080/api/chat/stream?email=${encodeURIComponent(user.email)}`;
            es = new EventSource(url);

            setWsStatus('connected');

            // Incoming chat message
            es.addEventListener('chat-message', (event) => {
                const msg = JSON.parse(event.data);
                const current = activeRef.current;

                // Update messages list if this conversation is open
                setMessages((prev) => {
                    const inThisConv = current && (msg.conversationId === current.id || current.id === 'temp');
                    if (!inThisConv) return prev;

                    if (messagesMapRef.current.has(msg.id)) return prev;
                    messagesMapRef.current.set(msg.id, true);

                    // Replace matching optimistic message (same content, sent by me)
                    const filtered = prev.filter(
                        (p) => !(p.optimistic && p.content === msg.content && p.senderEmail === msg.senderEmail),
                    );
                    return [...filtered, msg];
                });

                // Bump sidebar — increment unread only for messages from the other person
                const isFromMe = msg.senderEmail === user.email;
                bumpConversation(msg.conversationId, msg.content, msg.createdAt, !isFromMe);
            });

            // Typing indicator (server must emit 'typing' events)
            es.addEventListener('typing', (event) => {
                const data = JSON.parse(event.data);
                const current = activeRef.current;
                if (!current || data.senderEmail === user.email) return;
                if (data.conversationId !== current.id) return;

                setIsTyping(data.isTyping);
                if (data.isTyping) {
                    clearTimeout(typingTimerRef.current);
                    typingTimerRef.current = setTimeout(() => setIsTyping(false), 3000);
                }
            });

            es.onerror = () => {
                setWsStatus('disconnected');
                es.close();
                retryTimer = setTimeout(connect, 5000);
            };
        };

        connect();

        return () => {
            es?.close();
            clearTimeout(retryTimer);
            clearTimeout(typingTimerRef.current);
            messagesMapRef.current.clear();
        };
    }, [user, token, bumpConversation]);

    /* ── SELECT CONVERSATION ──────────────── */
    const handleSelectContact = useCallback(
        async (conv) => {
            // Allow clicking 'temp' to focus it; block re-clicking the same real conv
            if (activeRef.current?.id === conv.id && conv.id !== 'temp') return;

            setActiveContact(conv);
            setMessages([]);
            setIsTyping(false);
            messagesMapRef.current.clear();
            setShowEmoji(false);

            if (conv.id === 'temp') return; // new contact with no history yet

            setIsLoadingMsgs(true);
            try {
                const res = await chatService.getMessages(conv.id, 0, 50);
                const data = res.data || res;
                let msgs = Array.isArray(data?.content) ? data.content : parseList(res);
                msgs.forEach((m) => messagesMapRef.current.set(m.id, true));
                setMessages([...msgs].reverse());

                // Mark as read on backend + clear badge in sidebar
                await chatService.markAsRead(conv.id);
                setConversations((prev) => prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c)));
            } catch {
                setMessages([]);
            } finally {
                setIsLoadingMsgs(false);
            }
        },
        [], // no deps — uses activeRef so it's always current
    );

    /* ── SEND MESSAGE ─────────────────────── */
    const handleSendMessage = useCallback(
        async (e, overrideContent = null) => {
            e?.preventDefault();
            const current = activeRef.current;
            const textToSend = overrideContent || inputMessage.trim();
            if (!textToSend || !current) return;

            const nowIso = new Date().toISOString();
            const tempId = `opt_${Date.now()}`;

            // 1. Optimistic UI — append message immediately
            setMessages((prev) => [
                ...prev,
                {
                    id: tempId,
                    conversationId: current.id,
                    content: textToSend,
                    createdAt: nowIso,
                    senderEmail: user.email,
                    receiverEmail: current.partnerEmail,
                    optimistic: true,
                },
            ]);

            // 2. Update sidebar immediately (don't wait for SSE echo)
            if (current.id !== 'temp') {
                bumpConversation(current.id, textToSend, nowIso, false);
            }

            if (!overrideContent) setInputMessage('');
            setShowEmoji(false);

            try {
                const payload = {
                    conversationId: current.id !== 'temp' ? current.id : null,
                    content: textToSend,
                    receiverEmail: current.partnerEmail,
                };
                const res = await chatService.sendMessage(payload);
                const savedMsg = res.data || res;

                // 3. Replace optimistic msg with the real one from DB
                setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...savedMsg, optimistic: false } : m)));
                messagesMapRef.current.set(savedMsg.id, true);

                // If this was a 'temp' conversation, update contact & sidebar
                if (current.id === 'temp' && savedMsg.conversationId) {
                    const newConv = {
                        id: savedMsg.conversationId,
                        partnerName: current.partnerName,
                        partnerAvatar: current.partnerAvatar,
                        partnerEmail: current.partnerEmail,
                        lastMessage: textToSend.startsWith('[') ? 'Đã gửi tệp đính kèm' : textToSend,
                        updatedAt: nowIso,
                        unreadCount: 0,
                    };
                    setActiveContact(newConv);
                    setConversations((prev) => {
                        // Avoid duplicates
                        const exists = prev.some((c) => c.id === savedMsg.conversationId);
                        return exists ? prev : [newConv, ...prev];
                    });
                } else if (savedMsg.conversationId) {
                    // Make sure sidebar shows real timestamp from DB
                    bumpConversation(savedMsg.conversationId, textToSend, savedMsg.createdAt || nowIso, false);
                }
            } catch (err) {
                console.error('Send error:', err);
                // Rollback optimistic message
                setMessages((prev) => prev.filter((m) => m.id !== tempId));
                // Revert sidebar last message? We'd need the previous value — skip for simplicity
                alert('Không thể gửi tin nhắn, vui lòng thử lại!');
            }
        },
        [inputMessage, user, bumpConversation],
    );

    /* ── FILE UPLOAD ──────────────────────── */
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !activeContact) return;
        if (file.size > 10 * 1024 * 1024) {
            alert('File quá lớn. Vui lòng chọn file dưới 10MB.');
            return;
        }
        setIsUploading(true);
        try {
            const uploaded = await uploadToCloudinary(file);
            let content = '';
            if (uploaded.type === 'image') content = `[IMAGE]${uploaded.url}`;
            else if (uploaded.type === 'video') content = `[VIDEO]${uploaded.url}`;
            else content = `[FILE]${uploaded.url}|${uploaded.name}`;
            await handleSendMessage(null, content);
        } catch {
            alert('Lỗi tải tệp lên. Vui lòng thử lại!');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    /* ── KEYBOARD ─────────────────────────── */
    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        },
        [handleSendMessage],
    );

    /* ── EMOJI ────────────────────────────── */
    const onEmojiClick = useCallback((emojiObject) => {
        setInputMessage((prev) => prev + emojiObject.emoji);
        textareaRef.current?.focus();
    }, []);

    /* ── DERIVED DATA ─────────────────────── */
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
            {/* Disconnected banner */}
            {wsStatus === 'disconnected' && (
                <div className="mb-3 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl flex items-center justify-between font-medium text-sm border border-red-200 w-full shrink-0 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <WifiOff size={18} />
                        Mất kết nối tới máy chủ. Đang tự động kết nối lại…
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="ml-auto inline-flex items-center gap-1 hover:text-red-800 transition-colors bg-white px-3 py-1 rounded-lg border border-red-100 shadow-sm"
                    >
                        <RefreshCw size={14} /> Tải lại
                    </button>
                </div>
            )}

            <div className="bg-white flex-1 rounded-2xl shadow-sm border border-gray-200 flex overflow-hidden min-h-0">
                {/* ════════════ SIDEBAR ════════════ */}
                <aside className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50/50 min-w-[280px] max-w-[360px]">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Tin Nhắn</h2>
                            <span
                                title={wsStatus}
                                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                    wsStatus === 'connected'
                                        ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)]'
                                        : wsStatus === 'connecting'
                                          ? 'bg-yellow-400 animate-pulse'
                                          : 'bg-red-500'
                                }`}
                            />
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm…"
                                className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-indigo-500 transition"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {isLoadingChats ? (
                            <div className="flex justify-center p-10">
                                <Loader2 className="animate-spin text-indigo-500" />
                            </div>
                        ) : filtered.length === 0 && !activeContact?.isNew ? (
                            <div className="text-center p-10 text-gray-500 text-sm">
                                {searchQuery ? 'Không tìm thấy kết quả.' : 'Chưa có ứng viên nào nhắn tin.'}
                            </div>
                        ) : (
                            <>
                                {/* Pinned new/temp contact */}
                                {activeContact?.isNew && (
                                    <div
                                        onClick={() => handleSelectContact(activeContact)}
                                        className="flex items-center gap-3 p-4 cursor-pointer border-b border-gray-100 bg-indigo-50 border-l-4 border-l-indigo-600"
                                    >
                                        <Avatar
                                            src={activeContact.partnerAvatar}
                                            name={activeContact.partnerName}
                                            size="lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-800 truncate text-[14px]">
                                                {activeContact.partnerName}
                                            </h3>
                                            <p className="text-[13px] truncate text-indigo-600 font-medium">
                                                Liên hệ mới
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {filtered.map((conv) => (
                                    <ConversationItem
                                        key={conv.id}
                                        conv={conv}
                                        isActive={activeContact?.id === conv.id}
                                        onSelect={handleSelectContact}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                </aside>

                {/* ════════════ CHAT PANEL ════════════ */}
                <div className="flex-1 flex flex-col min-w-0 bg-white relative">
                    {!activeContact ? (
                        /* Empty state */
                        <div className="flex-1 flex items-center justify-center flex-col text-gray-400 select-none gap-3">
                            <div className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center">
                                <Send size={30} className="text-gray-300 ml-1" />
                            </div>
                            <p className="font-semibold text-gray-600">Chưa chọn cuộc trò chuyện</p>
                            <p className="text-sm text-gray-400">Chọn một ứng viên bên trái để trao đổi</p>
                        </div>
                    ) : (
                        <>
                            {/* ── Chat header ── */}
                            <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white z-10 shrink-0 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Avatar src={activeContact.partnerAvatar} name={activeContact.partnerName} />
                                    <div>
                                        <h3 className="font-bold text-gray-800 leading-tight">
                                            {activeContact.partnerName}
                                        </h3>
                                        <p
                                            className={`text-xs font-medium flex items-center gap-1 ${
                                                wsStatus === 'connected' && !activeContact.isNew
                                                    ? 'text-green-500'
                                                    : 'text-gray-400'
                                            }`}
                                        >
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
                                <div className="flex items-center gap-2">
                                    <button className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 border border-indigo-100 shadow-sm">
                                        <Briefcase size={14} /> Xem hồ sơ
                                    </button>
                                    <button className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* ── Messages ── */}
                            <div className="flex-1 px-6 py-4 overflow-y-auto bg-gray-50/50 space-y-1 relative">
                                {isLoadingMsgs ? (
                                    <div className="flex justify-center items-center h-full">
                                        <Loader2 className="animate-spin text-indigo-500" size={24} />
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
                                                className={`flex items-end gap-2 mb-1 ${
                                                    isMe ? 'flex-row-reverse' : 'flex-row'
                                                }`}
                                            >
                                                {!isMe && (
                                                    <div className="mb-5 flex-shrink-0">
                                                        <Avatar
                                                            src={activeContact.partnerAvatar}
                                                            name={activeContact.partnerName}
                                                            size="sm"
                                                        />
                                                    </div>
                                                )}
                                                <div
                                                    className={`flex flex-col max-w-[70%] ${
                                                        isMe ? 'items-end' : 'items-start'
                                                    }`}
                                                >
                                                    <div
                                                        className={[
                                                            isMedia
                                                                ? 'bg-transparent shadow-sm rounded-2xl overflow-hidden'
                                                                : 'px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed break-words shadow-sm',
                                                            !isMedia && isMe
                                                                ? `bg-indigo-600 text-white rounded-br-none ${item.optimistic ? 'opacity-70' : ''}`
                                                                : '',
                                                            !isMedia && !isMe
                                                                ? 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                                                                : '',
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' ')}
                                                    >
                                                        <MessageBubble content={item.content} isMe={isMe} />
                                                    </div>
                                                    <div
                                                        className={`text-[10px] text-gray-400 mt-1 px-1 font-medium ${
                                                            isMe ? 'text-right' : 'text-left'
                                                        }`}
                                                    >
                                                        {fmt(item.createdAt)}
                                                        {item.optimistic && (
                                                            <span className="ml-1 text-indigo-300">· Đang gửi…</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                {isTyping && <TypingDots />}
                                <div ref={messagesEndRef} className="h-2" />
                            </div>

                            {/* ── Input area ── */}
                            <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-white relative">
                                {/* Emoji picker */}
                                {showEmoji && (
                                    <div
                                        className="absolute bottom-[72px] left-4 z-50 shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-bottom-2 border border-gray-100"
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
                                    className={`flex items-end gap-2 bg-gray-50 border rounded-3xl pl-2 pr-2 py-2 transition-all ${
                                        wsStatus === 'connected'
                                            ? 'border-gray-300 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50 focus-within:bg-white'
                                            : 'border-gray-200 opacity-60'
                                    }`}
                                >
                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1 pb-1">
                                        <button
                                            type="button"
                                            onClick={() => setShowEmoji((v) => !v)}
                                            className="text-gray-400 hover:text-indigo-600 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-all shrink-0"
                                            title="Emoji"
                                        >
                                            <Smile size={20} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="text-gray-400 hover:text-indigo-600 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-all shrink-0 disabled:opacity-40"
                                            title="Đính kèm tệp"
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

                                    {/* Text input */}
                                    <textarea
                                        ref={textareaRef}
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        disabled={wsStatus !== 'connected' || isUploading}
                                        placeholder={
                                            isUploading
                                                ? 'Đang tải tệp lên…'
                                                : wsStatus === 'connected'
                                                  ? 'Nhập tin nhắn…'
                                                  : 'Đang kết nối…'
                                        }
                                        rows={1}
                                        className="flex-1 bg-transparent py-2.5 px-1 text-[14px] leading-snug text-gray-700 placeholder-gray-400 outline-none disabled:cursor-not-allowed resize-none max-h-32 overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded"
                                    />

                                    {/* Send button */}
                                    <button
                                        type="submit"
                                        disabled={!inputMessage.trim() || wsStatus !== 'connected' || isUploading}
                                        className="w-10 h-10 shrink-0 mb-0.5 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 active:scale-95 transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
                                        title="Gửi"
                                    >
                                        {isUploading ? (
                                            <Loader2 size={17} className="animate-spin" />
                                        ) : (
                                            <Send size={17} className="ml-0.5" />
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

export default ChatApp;
