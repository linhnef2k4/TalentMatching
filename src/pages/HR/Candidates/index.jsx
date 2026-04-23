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
} from 'lucide-react';
import applicationService from '~/services/applicationService';

const Candidates = () => {
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('jobId');

    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // State cho Ứng viên đang chọn
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    // States MỚI: Form Cập nhật Trạng thái (Đồng bộ chuẩn Enum API)
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateForm, setUpdateForm] = useState({ status: 'PENDING', notes: '' });

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

    // Hàm chọn ứng viên & Gắn data vào Form Update
    const handleSelectCandidate = async (candidateInfo) => {
        setSelectedCandidate(candidateInfo);
        setUpdateForm({
            status: candidateInfo.status || 'PENDING',
            notes: candidateInfo.notes || '',
        });
        setIsDetailLoading(true);

        try {
            const detail = await applicationService.getApplicationDetail(candidateInfo.id);
            setSelectedCandidate(detail);
            setUpdateForm({
                status: detail.status || 'PENDING',
                notes: detail.notes || '',
            });
        } catch (error) {
            console.error('Lỗi tải chi tiết hồ sơ:', error);
        } finally {
            setIsDetailLoading(false);
        }
    };

    // Hàm gọi API Cập nhật Trạng thái (Form Mới)
    const submitUpdateStatus = async () => {
        setIsUpdating(true);
        try {
            await applicationService.updateApplicationStatus(selectedCandidate.id, updateForm.status, updateForm.notes);

            // Cập nhật lại UI lập tức
            const updatedCandidates = candidates.map((c) =>
                c.id === selectedCandidate.id ? { ...c, status: updateForm.status, notes: updateForm.notes } : c,
            );
            setCandidates(updatedCandidates);
            setSelectedCandidate({ ...selectedCandidate, status: updateForm.status, notes: updateForm.notes });
        } catch (error) {
            console.error('Lỗi cập nhật trạng thái:', error);
            alert('Cập nhật trạng thái thất bại. Vui lòng thử lại!');
        } finally {
            setIsUpdating(false);
        }
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
                    <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded text-xs font-bold border border-green-200 flex items-center gap-1 w-fit">
                        <CheckCircle size={12} /> Đã nhận
                    </span>
                );
            case 'INTERVIEW':
                return (
                    <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded text-xs font-bold border border-purple-200 flex items-center gap-1 w-fit">
                        <Users size={12} /> Phỏng vấn
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded text-xs font-bold border border-red-200 flex items-center gap-1 w-fit">
                        <XCircle size={12} /> Từ chối
                    </span>
                );
            case 'REVIEWING':
                return (
                    <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded text-xs font-bold border border-blue-200 flex items-center gap-1 w-fit">
                        <Clock size={12} /> Đang xem xét
                    </span>
                );
            case 'CANCELED':
                return (
                    <span className="bg-gray-200 text-gray-700 px-2.5 py-1 rounded text-xs font-bold border border-gray-300 flex items-center gap-1 w-fit">
                        <AlertCircle size={12} /> Đã hủy
                    </span>
                );
            default: // PENDING
                return (
                    <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded text-xs font-bold border border-yellow-200 flex items-center gap-1 w-fit">
                        <Clock size={12} /> Chờ duyệt
                    </span>
                );
        }
    };

    if (!jobId) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gray-50">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-900">Không tìm thấy Job ID</h2>
                <Link to="/hr/manage-jobs" className="mt-4 text-blue-600 hover:underline font-medium">
                    Quay lại danh sách việc làm
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-[calc(100vh-64px)] font-sans flex flex-col">
            {/* HEADER */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0">
                <div className="flex items-center gap-4">
                    <Link
                        to="/hr/manage-jobs"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">Hồ sơ ứng viên</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {candidates.length > 0 ? `Cho vị trí: Job ID ${jobId}` : `Đang tải dữ liệu...`}
                        </p>
                    </div>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 border border-blue-100">
                    <Users size={18} /> Tổng: {candidates.length} ứng viên
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden max-w-[1600px] w-full mx-auto">
                {/* CỘT TRÁI - DANH SÁCH ỨNG VIÊN */}
                <div className="w-full md:w-1/3 lg:w-[400px] bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 size={32} className="animate-spin text-blue-600" />
                        </div>
                    ) : candidates.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <FileText size={48} className="text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">Chưa có ứng viên nào nộp hồ sơ.</p>
                        </div>
                    ) : (
                        <div className="p-3 space-y-2">
                            {candidates.map((candidate) => (
                                <div
                                    key={candidate.id}
                                    onClick={() => handleSelectCandidate(candidate)}
                                    className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 
                                        ${selectedCandidate?.id === candidate.id ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-gray-50'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900 text-base truncate pr-2">
                                            {candidate.candidateFullName}
                                        </h3>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="font-black text-blue-600 text-sm">
                                                {candidate.matchScore}/100
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="text-sm text-gray-500 flex items-center gap-1.5 truncate">
                                            <Mail size={14} className="flex-shrink-0" /> {candidate.candidateEmail}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <div className="text-xs text-gray-400 flex items-center gap-1.5">
                                            <Calendar size={14} /> {formatDateTime(candidate.appliedAt)}
                                        </div>
                                        {renderStatusBadge(candidate.status)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* CỘT PHẢI - CHI TIẾT */}
                <div className="hidden md:flex flex-1 bg-gray-50 flex-col overflow-y-auto p-6 lg:p-8">
                    {!selectedCandidate ? (
                        <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
                            <User size={64} className="mb-4 opacity-50" />
                            <p className="text-lg font-medium">Chọn một ứng viên từ danh sách để xem chi tiết</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-5xl mx-auto w-full relative">
                            {isDetailLoading && (
                                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex justify-center items-center">
                                    <Loader2 className="animate-spin text-blue-500" size={40} />
                                </div>
                            )}

                            {/* Top Info Card */}
                            <div className="p-6 lg:p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent flex flex-col xl:flex-row justify-between items-start gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-inner border-4 border-white flex-shrink-0">
                                        {selectedCandidate.candidateFullName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                            {selectedCandidate.candidateFullName}
                                        </h2>
                                        <p className="text-gray-600 font-medium flex flex-wrap items-center gap-2 mb-3">
                                            <Mail size={16} /> {selectedCandidate.candidateEmail}
                                            {selectedCandidate.phone && <span>• 📱 {selectedCandidate.phone}</span>}
                                        </p>
                                        <div className="flex gap-2 items-center">
                                            {renderStatusBadge(selectedCandidate.status)}
                                            {selectedCandidate.yearsOfExperience !== undefined && (
                                                <span className="text-sm font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                                                    Kinh nghiệm: {selectedCandidate.yearsOfExperience} năm
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Form Action HR - Đổi sang Select chuẩn Enum Swagger */}
                                <div className="flex flex-col gap-3 w-full xl:w-[320px] bg-white p-4 rounded-xl border border-blue-100 shadow-sm shrink-0">
                                    <h4 className="text-sm font-bold text-gray-800">Cập nhật trạng thái</h4>
                                    <select
                                        value={updateForm.status}
                                        onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 font-bold text-sm transition-colors cursor-pointer text-gray-700"
                                    >
                                        <option value="PENDING">Chờ duyệt (Pending)</option>
                                        <option value="REVIEWING">Đang xem xét (Reviewing)</option>
                                        <option value="INTERVIEW">Phỏng vấn (Interview)</option>
                                        <option value="ACCEPTED">Chấp nhận (Accepted)</option>
                                        <option value="REJECTED">Từ chối (Rejected)</option>
                                        <option value="CANCELED">Đã hủy (Canceled)</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={updateForm.notes}
                                        onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                                        placeholder="Ghi chú (Lý do, link meeting...)"
                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-sm transition-colors"
                                    />
                                    <button
                                        onClick={submitUpdateStatus}
                                        disabled={
                                            isUpdating ||
                                            (updateForm.status === selectedCandidate.status &&
                                                updateForm.notes === (selectedCandidate.notes || ''))
                                        }
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white px-4 py-2 rounded-lg font-bold transition-colors text-sm flex items-center justify-center gap-2"
                                    >
                                        {isUpdating ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Save size={16} />
                                        )}
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 lg:p-8 space-y-8">
                                {/* Ghi chú của HR (nếu có) */}
                                {selectedCandidate.notes && (
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <FileText size={18} className="text-blue-500" /> Ghi chú từ HR
                                        </h3>
                                        <div className="bg-gray-50 text-gray-800 p-4 rounded-xl border border-gray-200 text-sm font-medium">
                                            {selectedCandidate.notes}
                                        </div>
                                    </div>
                                )}

                                {/* Khu vực AI Analysis */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <BrainCircuit size={18} className="text-blue-600" /> Đánh giá từ AI
                                    </h3>
                                    <div className="bg-blue-50/40 p-6 rounded-xl border border-blue-100">
                                        <div className="flex items-center justify-between mb-5 bg-white p-4 rounded-xl shadow-sm border border-blue-50">
                                            <span className="text-gray-700 font-bold">
                                                Mức độ phù hợp (Match Score):
                                            </span>
                                            <span className="text-3xl font-black text-blue-600">
                                                {selectedCandidate.matchScore}{' '}
                                                <span className="text-lg text-gray-400">/ 100</span>
                                            </span>
                                        </div>

                                        {selectedCandidate.aiAnalysis?.ai_analysis ? (
                                            <div className="space-y-4 text-sm bg-white p-5 rounded-xl border border-blue-50 shadow-sm">
                                                {selectedCandidate.aiAnalysis.ai_analysis.strengths?.length > 0 && (
                                                    <div>
                                                        <h4 className="font-bold text-green-700 flex items-center gap-1.5 mb-2">
                                                            <CheckCircle size={16} /> Điểm mạnh
                                                        </h4>
                                                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                                            {selectedCandidate.aiAnalysis.ai_analysis.strengths.map(
                                                                (str, idx) => (
                                                                    <li key={idx}>{str}</li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}

                                                {selectedCandidate.aiAnalysis.ai_analysis.weaknesses?.length > 0 && (
                                                    <div className="mt-4">
                                                        <h4 className="font-bold text-red-600 flex items-center gap-1.5 mb-2">
                                                            <XCircle size={16} /> Thiếu sót
                                                        </h4>
                                                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                                            {selectedCandidate.aiAnalysis.ai_analysis.weaknesses.map(
                                                                (weak, idx) => (
                                                                    <li key={idx}>{weak}</li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}

                                                <div className="mt-5 pt-4 border-t border-gray-100">
                                                    <h4 className="font-bold text-gray-800 mb-1">Kết luận AI:</h4>
                                                    <p className="text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                        {selectedCandidate.aiAnalysis.ai_analysis.final_verdict}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic text-center py-2">
                                                Hệ thống AI chưa phân tích xong hồ sơ này.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Cover Letter */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <FileText size={18} className="text-gray-500" /> Thư ứng tuyển (Cover Letter)
                                    </h3>
                                    <div className="bg-white p-5 rounded-xl border border-gray-200 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap shadow-sm">
                                        {selectedCandidate.coverLetter || (
                                            <span className="italic text-gray-400">Không có thư ứng tuyển.</span>
                                        )}
                                    </div>
                                </div>

                                {/* CV Box */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <ExternalLink size={18} className="text-gray-500" /> Hồ sơ Đính kèm (CV)
                                    </h3>
                                    {selectedCandidate.cvUrl ? (
                                        <div className="border border-gray-200 rounded-xl p-5 flex items-center justify-between bg-white hover:border-blue-300 transition shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                                                    <FileText size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">
                                                        CV_UngVien_
                                                        {selectedCandidate.candidateFullName?.replace(/\s+/g, '')}.pdf
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        Cập nhật:{' '}
                                                        {formatDateTime(
                                                            selectedCandidate.updatedAt || selectedCandidate.appliedAt,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={selectedCandidate.cvUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-5 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
                                            >
                                                Xem File Gốc <ExternalLink size={16} />
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="bg-white p-5 rounded-xl border border-gray-200 text-gray-500 text-sm italic shadow-sm">
                                            Không có file CV đính kèm.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Candidates;
