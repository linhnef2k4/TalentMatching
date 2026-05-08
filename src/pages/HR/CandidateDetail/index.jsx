import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    FileText,
    MessageSquare,
    Download,
    ExternalLink,
    Loader2,
    ShieldCheck,
    AlertCircle,
} from 'lucide-react';
import userService from '~/services/userService';

const CandidateDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [candidate, setCandidate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const fetchCandidate = async () => {
            setIsLoading(true);
            try {
                // Gọi API: Vừa lấy data vừa tự động đánh dấu đã xem hồ sơ (Profile View)
                const res = await userService.getCandidateById(id);
                setCandidate(res.data || res);
            } catch (error) {
                console.error('Lỗi tải chi tiết ứng viên:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchCandidate();
        }
    }, [id]);

    const handleChatWithCandidate = () => {
        if (!candidate) return;
        navigate('/hr/chat', {
            state: {
                newContact: {
                    id: candidate.id,
                    email: candidate.email,
                    name: candidate.fullName || 'Ứng viên',
                    avatar: candidate.avatar,
                },
            },
        });
    };

    // HÀM XỬ LÝ TẢI CV QUA API BẢO MẬT (CHỈ DÀNH CHO PRO)
    const handleDownloadCV = async () => {
        setIsDownloading(true);
        try {
            const res = await userService.downloadCvCandidate(id);
            const downloadUrl = res.url || res.data?.url;

            if (downloadUrl) {
                // Mở tab mới để tải/xem CV
                window.open(downloadUrl, '_blank', 'noopener,noreferrer');
            } else {
                alert('Có lỗi xảy ra, không lấy được đường dẫn CV.');
            }
        } catch (error) {
            console.error('Lỗi tải CV:', error);
            // Xử lý lỗi từ Backend trả về (Ví dụ chưa có gói PRO)
            if (error.response && error.response.status === 403) {
                alert('Tính năng tải CV bản gốc chỉ dành cho Doanh nghiệp VIP (PRO). Vui lòng nâng cấp gói cước!');
                // navigate('/hr/pricing'); // Tùy chọn: Chuyển hướng HR sang trang mua gói
            } else {
                alert('Bạn không có quyền tải CV này hoặc có lỗi hệ thống.');
            }
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-slate-50">
                <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
                <p className="text-slate-500 font-medium">Đang tải hồ sơ ứng viên...</p>
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-slate-50">
                <AlertCircle size={64} className="text-rose-400 mb-4" />
                <h2 className="text-2xl font-black text-slate-800 mb-2">Không tìm thấy ứng viên</h2>
                <p className="text-slate-500 font-medium mb-6">Hồ sơ này không tồn tại hoặc đã bị ẩn.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-[calc(100vh-80px)] font-sans text-slate-800 pb-20 relative">
            {/* BACKGROUND HEADER COVER */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-50 to-transparent"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 pt-8">
                {/* NÚT BACK */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-white/80 hover:text-white font-bold transition-colors mb-6 drop-shadow-md bg-black/20 w-fit px-4 py-2 rounded-full backdrop-blur-sm"
                >
                    <ArrowLeft size={18} /> Quay lại
                </button>

                {/* PROFILE CARD */}
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-lg border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
                    {/* AVATAR */}
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden shrink-0 mt-[-4rem] md:mt-[-5rem] z-20 relative">
                        {candidate.avatar ? (
                            <img
                                src={candidate.avatar}
                                alt={candidate.fullName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User size={64} className="text-slate-300" />
                        )}
                        {candidate.isActive && (
                            <div
                                className="absolute bottom-3 right-3 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"
                                title="Đang hoạt động"
                            ></div>
                        )}
                    </div>

                    {/* INFO */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-2 mb-1">
                                    {candidate.fullName || 'Chưa cập nhật tên'}
                                    {candidate.role === 'CANDIDATE' && (
                                        <ShieldCheck
                                            size={20}
                                            className="text-blue-500 mt-1"
                                            title="Ứng viên đã xác thực"
                                        />
                                    )}
                                </h1>
                                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Hồ sơ Ứng viên
                                </span>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex items-center gap-3">
                                {candidate.cvUrl && (
                                    <button
                                        onClick={handleDownloadCV}
                                        disabled={isDownloading}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isDownloading ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <Download size={18} />
                                        )}
                                        {isDownloading ? 'Đang lấy link...' : 'Tải CV'}
                                    </button>
                                )}
                                <button
                                    onClick={handleChatWithCandidate}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 hover:-translate-y-0.5 transition-all active:scale-95"
                                >
                                    <MessageSquare size={18} /> Nhắn tin
                                </button>
                            </div>
                        </div>

                        {/* CONTACT INFO GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200">
                                    <Mail size={18} className="text-blue-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        Email liên hệ
                                    </span>
                                    <span className="font-semibold text-slate-800">{candidate.email}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200">
                                    <Phone size={18} className="text-emerald-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        Số điện thoại
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                        {candidate.phoneNumber || (
                                            <span className="text-slate-400 italic">Chưa cập nhật</span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CV VIEWER SECTION */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <FileText size={24} className="text-blue-600" /> File CV Gốc
                        </h2>
                        {candidate.cvUrl && (
                            <button
                                onClick={handleDownloadCV}
                                disabled={isDownloading}
                                className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5 disabled:opacity-50 disabled:no-underline"
                            >
                                Mở toàn màn hình <ExternalLink size={16} />
                            </button>
                        )}
                    </div>

                    <div className="bg-slate-200 w-full" style={{ height: '800px' }}>
                        {candidate.cvUrl ? (
                            <iframe
                                src={`${candidate.cvUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                                title="CV Preview"
                                className="w-full h-full border-none"
                            ></iframe>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-white">
                                <FileText size={80} className="mb-4 text-slate-200" />
                                <h3 className="text-xl font-bold text-slate-700 mb-2">Ứng viên chưa tải lên CV</h3>
                                <p className="text-slate-500">Hãy liên hệ trực tiếp qua Chat để yêu cầu hồ sơ.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateDetail;
