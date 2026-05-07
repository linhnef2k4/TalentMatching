import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Mail,
    Calendar,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    ExternalLink,
    AlertCircle,
    Loader2,
    Users,
    BrainCircuit,
    Save,
    Briefcase,
    Award,
    CheckCircle2,
    Target,
    ListChecks,
    Eye,
    CheckSquare,
    Filter,
    Phone,
    Download,
    AlertTriangle,
    Lightbulb,
    File,
    ChevronLeft,
} from 'lucide-react';
import applicationService from '~/services/applicationService';

const Candidates = () => {
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('jobId');

    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const [isUpdating, setIsUpdating] = useState(false);
    const [updateForm, setUpdateForm] = useState({ status: 'PENDING', notes: '' });

    // State lọc trạng thái cục bộ cho danh sách bên trái
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        if (jobId) {
            fetchCandidates();
        }
    }, [jobId]);

    const fetchCandidates = async () => {
        setIsLoading(true);
        try {
            const response = await applicationService.getApplicationsByJob(jobId, 0, 50);
            if (response && response.content) {
                setCandidates(response.content);
                if (response.content.length > 0) {
                    handleSelectCandidate(response.content[0]);
                }
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách ứng viên:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectCandidate = async (candidateInfo) => {
        setSelectedCandidate(candidateInfo);
        setUpdateForm({
            status: candidateInfo.status || 'PENDING',
            notes: candidateInfo.notes || '',
        });
        setIsDetailLoading(true);

        try {
            const detail = await applicationService.getApplicationDetail(candidateInfo.id);

            // Gộp candidateInfo (có id) và detail (có data AI)
            setSelectedCandidate({
                ...candidateInfo,
                ...detail,
            });

            setUpdateForm({
                status: detail.status || candidateInfo.status || 'PENDING',
                notes: detail.notes || candidateInfo.notes || '',
            });
        } catch (error) {
            console.error('Lỗi tải chi tiết hồ sơ:', error);
        } finally {
            setIsDetailLoading(false);
        }
    };

    const submitUpdateStatus = async () => {
        setIsUpdating(true);
        try {
            if (!selectedCandidate?.id) {
                console.error('Lỗi: Không tìm thấy Application ID', selectedCandidate);
                alert('Lỗi hệ thống: Không xác định được ID hồ sơ!');
                return;
            }

            await applicationService.updateApplicationStatus(selectedCandidate.id, updateForm.status, updateForm.notes);

            const updatedCandidates = candidates.map((c) =>
                c.id === selectedCandidate.id ? { ...c, status: updateForm.status, notes: updateForm.notes } : c,
            );
            setCandidates(updatedCandidates);

            setSelectedCandidate({
                ...selectedCandidate,
                status: updateForm.status,
                notes: updateForm.notes,
            });

            // Có thể đổi alert thành toast notification nếu project của bạn có hỗ trợ
            alert('Đã cập nhật trạng thái hồ sơ thành công!');
        } catch (error) {
            console.error('Call API PATCH thất bại:', error);
            alert('Cập nhật trạng thái thất bại. Vui lòng thử lại!');
        } finally {
            setIsUpdating(false);
        }
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        if (diffInDays === 0) return 'Hôm nay';
        if (diffInDays === 1) return 'Hôm qua';
        if (diffInDays < 7) return `${diffInDays} ngày trước`;
        return d.toLocaleDateString('vi-VN');
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'ACCEPTED':
                return (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200 shadow-sm">
                        Đã nhận việc
                    </span>
                );
            case 'INTERVIEW':
                return (
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-200 shadow-sm">
                        Đang phỏng vấn
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-semibold text-[11px] border border-rose-200 shadow-sm">
                        Đã loại
                    </span>
                );
            case 'REVIEWING':
                return (
                    <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[11px] border border-indigo-200 shadow-sm">
                        Đang đánh giá
                    </span>
                );
            case 'VIEWED':
                return (
                    <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-semibold text-[11px] border border-purple-200 shadow-sm">
                        Đã xem
                    </span>
                );
            case 'WITHDRAWN':
                return (
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200 shadow-sm">
                        Đã rút đơn
                    </span>
                );
            default: // PENDING
                return (
                    <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-semibold text-[11px] border border-amber-200 shadow-sm">
                        Mới ứng tuyển
                    </span>
                );
        }
    };

    const renderAiStatusBadge = (status) => {
        if (status === 'PASS')
            return (
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0">
                    Đạt
                </span>
            );
        if (status === 'PARTIAL')
            return (
                <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0">
                    Một phần
                </span>
            );
        return (
            <span className="bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0">
                Chưa đạt
            </span>
        );
    };

    if (!jobId) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <AlertCircle size={56} className="text-rose-500 mb-4" />
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Không tìm thấy Công việc</h2>
                <p className="text-slate-500 mt-2 mb-6">Mã công việc không tồn tại hoặc đã bị xóa.</p>
                <Link
                    to="/hr/manage-jobs"
                    className="text-blue-600 hover:bg-blue-50 transition-colors font-semibold bg-white px-6 py-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2"
                >
                    <ArrowLeft size={18} /> Về danh sách việc làm
                </Link>
            </div>
        );
    }

    const filteredCandidates =
        statusFilter === 'ALL' ? candidates : candidates.filter((c) => c.status === statusFilter);

    return (
        <div className="bg-slate-50 min-h-[calc(100vh-64px)] font-sans flex flex-col overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 flex justify-between items-center h-16 px-4 md:px-6 shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <Link
                        to="/hr/manage-jobs"
                        className="text-slate-500 hover:text-slate-900 transition-colors p-2 rounded-full hover:bg-slate-100"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 leading-tight tracking-tight">
                            Hồ sơ ứng viên
                        </h1>
                        <p className="text-[13px] text-slate-500 font-medium">Chiến dịch tuyển dụng #{jobId}</p>
                    </div>
                </div>
            </header>

            {/* Layout Master-Detail */}
            <div className="flex-1 flex overflow-hidden w-full relative">
                {/* ---------------- LEFT PANEL: DANH SÁCH ---------------- */}
                <div
                    className={`w-full md:w-[380px] lg:w-[420px] bg-white border-r border-slate-200 flex-col h-full flex-shrink-0 z-10 transition-all duration-300
                    ${selectedCandidate ? 'hidden md:flex' : 'flex'}`}
                >
                    {/* Header List */}
                    <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <Users size={18} className="text-blue-500" /> Danh sách ứng viên
                            </h2>
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold border border-slate-200">
                                {filteredCandidates.length}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-3 pr-8 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer appearance-none transition-all"
                                >
                                    <option value="ALL">Tất cả trạng thái</option>
                                    <option value="PENDING">Mới ứng tuyển</option>
                                    <option value="INTERVIEW">Đang phỏng vấn</option>
                                    <option value="ACCEPTED">Đã nhận việc</option>
                                    <option value="REJECTED">Đã loại</option>
                                </select>
                                <Filter
                                    size={14}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Danh sách */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-slate-50/50">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center p-10 gap-3 text-slate-400">
                                <Loader2 size={28} className="animate-spin text-blue-500" />
                                <span className="text-sm font-medium">Đang tải ứng viên...</span>
                            </div>
                        ) : filteredCandidates.length === 0 ? (
                            <div className="flex flex-col items-center text-center p-10 text-slate-400">
                                <User size={40} className="mb-3 text-slate-300" />
                                <p className="text-sm font-medium text-slate-500">Chưa có ứng viên nào phù hợp.</p>
                            </div>
                        ) : (
                            filteredCandidates.map((candidate) => {
                                const isActive = selectedCandidate?.id === candidate.id;
                                return (
                                    <div
                                        key={candidate.id}
                                        onClick={() => handleSelectCandidate(candidate)}
                                        className={`p-3.5 rounded-xl cursor-pointer transition-all duration-200 border
                                            ${
                                                isActive
                                                    ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500/10'
                                                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3.5">
                                            {/* Avatar */}
                                            <div
                                                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 border-2
                                                    ${isActive ? 'bg-blue-100 text-blue-700 border-white' : 'bg-slate-100 text-slate-600 border-transparent'}`}
                                            >
                                                {candidate.candidateFullName?.charAt(0).toUpperCase()}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-bold text-slate-900 truncate text-[15px]">
                                                        {candidate.candidateFullName}
                                                    </h3>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold border flex items-center gap-1
                                                        ${
                                                            candidate.matchScore >= 80
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : candidate.matchScore >= 50
                                                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                                                        }`}
                                                    >
                                                        {candidate.matchScore}% Match
                                                    </span>
                                                </div>
                                                <p className="text-[13px] text-slate-500 truncate mb-2.5 font-medium">
                                                    {candidate.candidateEmail}
                                                </p>
                                                <div className="flex items-center justify-between mt-1">
                                                    {renderStatusBadge(candidate.status)}
                                                    <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {formatTimeAgo(candidate.appliedAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ---------------- RIGHT PANEL: CHI TIẾT ---------------- */}
                <div
                    className={`flex-1 bg-slate-50 relative flex-col h-full overflow-hidden
                    ${selectedCandidate ? 'flex' : 'hidden md:flex'}`}
                >
                    {!selectedCandidate ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white m-4 rounded-2xl border border-slate-200 border-dashed">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <User size={40} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-600 mb-2">Chưa chọn hồ sơ</h3>
                            <p className="text-sm font-medium text-slate-500">
                                Chọn một ứng viên từ danh sách bên trái để xem chi tiết đánh giá
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full relative">
                            {/* Loading Overlay */}
                            {isDetailLoading && (
                                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-50 flex flex-col justify-center items-center gap-3 rounded-l-2xl">
                                    <Loader2 className="animate-spin text-blue-600" size={42} />
                                    <span className="text-sm font-semibold text-slate-600">
                                        Đang phân tích dữ liệu...
                                    </span>
                                </div>
                            )}

                            {/* Header Chi Tiết */}
                            <div className="bg-white border-b border-slate-200 px-6 py-6 flex-shrink-0 shadow-sm relative z-10">
                                {/* Nút quay lại trên Mobile */}
                                <button
                                    className="md:hidden flex items-center gap-1 text-blue-600 font-semibold text-sm mb-4 bg-blue-50 px-3 py-1.5 rounded-lg w-fit"
                                    onClick={() => setSelectedCandidate(null)}
                                >
                                    <ChevronLeft size={16} /> Danh sách
                                </button>

                                <div className="flex flex-col xl:flex-row justify-between items-start gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-100 to-indigo-50 text-blue-600 flex items-center justify-center text-3xl font-black flex-shrink-0 shadow-inner border border-blue-100 uppercase">
                                            {selectedCandidate.candidateFullName?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                                                    {selectedCandidate.candidateFullName}
                                                </h2>
                                                {renderStatusBadge(selectedCandidate.status)}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-600 text-sm font-medium">
                                                <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer">
                                                    <Mail size={16} className="text-slate-400" />{' '}
                                                    {selectedCandidate.candidateEmail}
                                                </span>
                                                {selectedCandidate.phone && (
                                                    <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer">
                                                        <Phone size={16} className="text-slate-400" />{' '}
                                                        {selectedCandidate.phone}
                                                    </span>
                                                )}
                                                {selectedCandidate.yearsOfExperience !== undefined && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Briefcase size={16} className="text-slate-400" />{' '}
                                                        {selectedCandidate.yearsOfExperience} năm kinh nghiệm
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Header Buttons */}
                                    <div className="flex gap-3 w-full xl:w-auto">
                                        {selectedCandidate.cvUrl && (
                                            <a
                                                href={selectedCandidate.cvUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex-1 xl:flex-none px-4 py-2.5 border-2 border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                                            >
                                                <FileText size={18} className="text-blue-500" /> Xem CV
                                            </a>
                                        )}
                                        <a
                                            href={`mailto:${selectedCandidate.candidateEmail}`}
                                            className="flex-1 xl:flex-none px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-sm transition-all flex items-center justify-center gap-2"
                                        >
                                            <Mail size={18} /> Gửi Email
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Phần Content Scroll */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 custom-scrollbar bg-slate-50">
                                {/* ---------------- AI ANALYSIS SECTION ---------------- */}
                                {selectedCandidate.aiAnalysis ? (
                                    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                                        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-2 bg-indigo-50 rounded-lg">
                                                    <BrainCircuit className="text-indigo-600" size={24} />
                                                </div>
                                                <h3 className="text-lg font-black text-slate-900">
                                                    AI Phân Tích & Đánh Giá
                                                </h3>
                                            </div>
                                            <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full flex items-center gap-1">
                                                <Lightbulb size={14} /> Smart Insights
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
                                            {/* Match Score Gauge */}
                                            <div className="col-span-1 xl:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden">
                                                {/* Background decoration */}
                                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>

                                                <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                                                    <svg
                                                        className="w-full h-full transform -rotate-90 drop-shadow-sm"
                                                        viewBox="0 0 36 36"
                                                    >
                                                        <path
                                                            className="text-slate-200"
                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2.5"
                                                        ></path>
                                                        <path
                                                            className={
                                                                selectedCandidate.matchScore >= 80
                                                                    ? 'text-emerald-500'
                                                                    : selectedCandidate.matchScore >= 50
                                                                      ? 'text-amber-500'
                                                                      : 'text-rose-500'
                                                            }
                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeDasharray={`${selectedCandidate.matchScore}, 100`}
                                                            strokeLinecap="round"
                                                            strokeWidth="2.5"
                                                        ></path>
                                                    </svg>
                                                    <div className="absolute flex flex-col items-center">
                                                        <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                                            {selectedCandidate.matchScore}
                                                            <span className="text-xl text-slate-400">%</span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                    Độ Phù Hợp
                                                </span>
                                            </div>

                                            {/* Summary Cards (Strengths / Weaknesses) */}
                                            {(selectedCandidate.aiAnalysis.executive_summary ||
                                                selectedCandidate.aiAnalysis.ai_analysis) &&
                                                (() => {
                                                    const summary =
                                                        selectedCandidate.aiAnalysis.executive_summary ||
                                                        selectedCandidate.aiAnalysis.ai_analysis;
                                                    return (
                                                        <div className="col-span-1 xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Ưu điểm */}
                                                            <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-50/80 to-emerald-50/30 border border-emerald-100/80">
                                                                <div className="flex items-center gap-2.5 mb-4">
                                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                                        <CheckCircle2 size={18} />
                                                                    </div>
                                                                    <h4 className="font-bold text-slate-800">
                                                                        Ưu điểm nổi bật
                                                                    </h4>
                                                                </div>
                                                                <ul className="space-y-2.5">
                                                                    {summary.strengths?.map((str, idx) => (
                                                                        <li
                                                                            key={idx}
                                                                            className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed"
                                                                        >
                                                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></div>
                                                                            <span>{str}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>

                                                            {/* Khuyết điểm */}
                                                            <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-50/80 to-amber-50/30 border border-amber-100/80">
                                                                <div className="flex items-center gap-2.5 mb-4">
                                                                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                                                                        <AlertTriangle size={18} />
                                                                    </div>
                                                                    <h4 className="font-bold text-slate-800">
                                                                        Điểm cần lưu ý
                                                                    </h4>
                                                                </div>
                                                                <ul className="space-y-2.5">
                                                                    {summary.weaknesses?.map((weak, idx) => (
                                                                        <li
                                                                            key={idx}
                                                                            className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed"
                                                                        >
                                                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></div>
                                                                            <span>{weak}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                        </div>

                                        {/* Core Skills Checklist */}
                                        {selectedCandidate.aiAnalysis.custom_rules_evaluation?.length > 0 && (
                                            <div className="mb-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                                                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                    <Target size={18} className="text-indigo-500" /> Phân tích Kỹ năng
                                                    cốt lõi
                                                </h4>
                                                <div className="flex flex-wrap gap-2.5">
                                                    {selectedCandidate.aiAnalysis.custom_rules_evaluation.map(
                                                        (rule, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm flex items-center gap-2.5 shadow-sm"
                                                            >
                                                                <span className="font-medium">{rule.rule}</span>
                                                                <div className="w-[1px] h-4 bg-slate-200"></div>
                                                                {rule.status === 'PASS' ? (
                                                                    <span className="text-emerald-600 flex items-center gap-1 font-bold text-xs">
                                                                        <CheckCircle size={14} /> Đạt
                                                                    </span>
                                                                ) : rule.status === 'PARTIAL' ? (
                                                                    <span className="text-amber-600 flex items-center gap-1 font-bold text-xs">
                                                                        <AlertCircle size={14} /> Thiếu
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-rose-500 flex items-center gap-1 font-bold text-xs">
                                                                        <XCircle size={14} /> Không
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* AI Final Verdict */}
                                        {(selectedCandidate.aiAnalysis.executive_summary?.final_verdict ||
                                            selectedCandidate.aiAnalysis.ai_analysis?.final_verdict) && (
                                            <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 flex gap-4 leading-relaxed">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                                    <Lightbulb className="text-indigo-600" size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-indigo-900 mb-1">Kết luận từ AI</h4>
                                                    <p className="text-sm text-indigo-800">
                                                        {selectedCandidate.aiAnalysis.executive_summary
                                                            ?.final_verdict ||
                                                            selectedCandidate.aiAnalysis.ai_analysis?.final_verdict}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </section>
                                ) : (
                                    <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-slate-500 shadow-sm">
                                        <BrainCircuit size={48} className="text-slate-200 mb-4" />
                                        <p className="font-semibold">
                                            Hệ thống AI chưa phân tích xong hoặc không có dữ liệu.
                                        </p>
                                    </div>
                                )}

                                {/* ---------------- DOCUMENTS SECTION ---------------- */}
                                <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    {/* Cover Letter */}
                                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <FileText className="text-blue-500" size={20} /> Thư ứng tuyển (Cover
                                            Letter)
                                        </h3>
                                        <div className="flex-1 bg-slate-50 rounded-xl p-5 text-[14px] text-slate-700 border border-slate-100 overflow-y-auto max-h-[350px] whitespace-pre-wrap leading-relaxed shadow-inner">
                                            {selectedCandidate.coverLetter ? (
                                                selectedCandidate.coverLetter
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-400 italic">
                                                    Ứng viên không gửi kèm thư ứng tuyển.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* CV / Resume */}
                                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <File className="text-emerald-500" size={20} /> Hồ sơ đính kèm (CV)
                                        </h3>
                                        <div className="flex-1 bg-slate-50/80 rounded-xl border-2 border-slate-200 border-dashed flex flex-col items-center justify-center p-8 min-h-[280px]">
                                            {selectedCandidate.cvUrl ? (
                                                <>
                                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                                        <FileText size={32} />
                                                    </div>
                                                    <p
                                                        className="font-semibold text-slate-800 mb-1 text-center truncate max-w-full px-4"
                                                        title={selectedCandidate.cvUrl}
                                                    >
                                                        {selectedCandidate.cvUrl
                                                            .split('/')
                                                            .pop()
                                                            .split('?')[0]
                                                            .substring(0, 40)}
                                                        ...pdf
                                                    </p>
                                                    <p className="text-[13px] font-medium text-slate-400 mb-6 flex items-center gap-1.5">
                                                        <Clock size={14} /> Tải lên:{' '}
                                                        {formatDateTime(
                                                            selectedCandidate.updatedAt || selectedCandidate.appliedAt,
                                                        )}
                                                    </p>
                                                    <a
                                                        href={selectedCandidate.cvUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm flex items-center gap-2"
                                                    >
                                                        <ExternalLink size={18} /> Mở tài liệu
                                                    </a>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center text-slate-400">
                                                    <File size={48} className="text-slate-200 mb-3" />
                                                    <p className="font-medium">Không có tệp đính kèm</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* ---------------- STICKY ACTION FOOTER (BỘ ĐIỀU KHIỂN DƯỚI CÙNG) ---------------- */}
                            <div className="sticky bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 lg:px-8 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-20 shrink-0">
                                <div className="flex flex-col sm:flex-row items-end gap-4 max-w-5xl mx-auto">
                                    <div className="w-full sm:w-[220px]">
                                        <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                                            Thay đổi trạng thái
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={updateForm.status}
                                                onChange={(e) =>
                                                    setUpdateForm({ ...updateForm, status: e.target.value })
                                                }
                                                disabled={selectedCandidate.status === 'WITHDRAWN'}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-3 pr-8 text-[14px] text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer appearance-none"
                                            >
                                                {selectedCandidate.status === 'WITHDRAWN' && (
                                                    <option value="WITHDRAWN">Đã rút đơn</option>
                                                )}
                                                <option value="PENDING">Mới ứng tuyển</option>
                                                <option value="VIEWED">Đã xem</option>
                                                <option value="REVIEWING">Đang đánh giá</option>
                                                <option value="INTERVIEW">Gọi phỏng vấn</option>
                                                <option value="ACCEPTED">Đề nghị nhận việc</option>
                                                <option value="REJECTED">Đã loại</option>
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <ChevronLeft size={16} className="-rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full sm:flex-1">
                                        <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                                            Ghi chú nội bộ
                                        </label>
                                        <input
                                            type="text"
                                            value={updateForm.notes}
                                            onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                                            disabled={selectedCandidate.status === 'WITHDRAWN'}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                                            placeholder="Ghi chú lý do loại, thông tin liên hệ thêm..."
                                        />
                                    </div>
                                    <div className="w-full sm:w-auto">
                                        <button
                                            onClick={submitUpdateStatus}
                                            disabled={
                                                isUpdating ||
                                                selectedCandidate.status === 'WITHDRAWN' ||
                                                (updateForm.status === selectedCandidate.status &&
                                                    updateForm.notes === (selectedCandidate.notes || ''))
                                            }
                                            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[14px] font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none active:scale-[0.98] flex items-center justify-center gap-2 h-[46px]"
                                        >
                                            {isUpdating ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" /> Đang lưu...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={18} /> Lưu thay đổi
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
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

export default Candidates;
