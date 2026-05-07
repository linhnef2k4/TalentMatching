import React, { useState, useEffect } from 'react';
import {
    ShieldAlert,
    FileText,
    Briefcase,
    AlertTriangle,
    CheckCircle2,
    Trash2,
    Eye,
    Building2,
    User,
    Search,
    Filter,
    Flag,
    X,
    MessageSquareWarning,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Save,
} from 'lucide-react';
import adminReportService from '~/services/adminReportService';

// --- Từ điển định dạng cho UI ---
const REPORT_TYPE_MAP = {
    SYSTEM_BUG: { label: 'Lỗi hệ thống', color: 'bg-rose-100 text-rose-700 border-rose-200' },
    USER_REPORT: { label: 'Tố cáo User', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    SUGGESTION: { label: 'Góp ý', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    OTHER: { label: 'Khác', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const REPORT_STATUS_MAP = {
    PENDING: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    PROCESSING: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    RESOLVED: { label: 'Đã giải quyết', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    REJECTED: { label: 'Từ chối', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const AdminModeration = () => {
    const [activeTab, setActiveTab] = useState('reports');

    // ========================================================
    // 1. STATE & LOGIC CHO TAB BÁO CÁO (API THẬT)
    // ========================================================
    const [reports, setReports] = useState([]);
    const [isLoadingReports, setIsLoadingReports] = useState(false);
    const [reportStatusFilter, setReportStatusFilter] = useState('ALL');
    const [reportPage, setReportPage] = useState(0);
    const [reportTotalPages, setReportTotalPages] = useState(1);

    // Modal Xử lý Báo cáo
    const [selectedReport, setSelectedReport] = useState(null);
    const [resolveForm, setResolveForm] = useState({ status: 'RESOLVED', adminNote: '' });
    const [isResolving, setIsResolving] = useState(false);

    useEffect(() => {
        if (activeTab === 'reports') {
            fetchReports();
        }
    }, [activeTab, reportStatusFilter, reportPage]);

    const fetchReports = async () => {
        setIsLoadingReports(true);
        try {
            const res = await adminReportService.getReports(reportStatusFilter, reportPage, 15);
            setReports(res.content || []);
            setReportTotalPages(res.totalPages || 1);
        } catch (error) {
            console.error('Lỗi tải danh sách báo cáo:', error);
        } finally {
            setIsLoadingReports(false);
        }
    };

    const handleOpenResolveModal = (report) => {
        setSelectedReport(report);
        setResolveForm({
            status: report.status === 'PENDING' ? 'RESOLVED' : report.status,
            adminNote: report.adminNote || '',
        });
    };

    const handleResolveSubmit = async (e) => {
        e.preventDefault();
        setIsResolving(true);
        try {
            await adminReportService.resolveReport(selectedReport.id, resolveForm.status, resolveForm.adminNote);
            alert('Đã xử lý báo cáo thành công!');
            setSelectedReport(null);
            fetchReports(); // Refresh data
        } catch (error) {
            alert('Lỗi xử lý báo cáo!');
        } finally {
            setIsResolving(false);
        }
    };

    // ĐÃ FIX LỖI Ở ĐÂY: đổi dateString thành dateStr
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // ========================================================
    // 2. MOCK DATA TAB JD & CV (GIỮ NGUYÊN)
    // ========================================================
    const [jds] = useState([
        {
            id: 1,
            title: 'Tuyển gấp NV bóc xếp lương 50 củ',
            company: 'Công ty TNHH Đa Cấp',
            ownerEmail: 'scam@dacap.vn',
            postedDate: '11/03/2026',
            status: 'Flagged',
            aiReason: 'Nghi ngờ lừa đảo / Đa cấp / Mức lương ảo',
        },
        {
            id: 2,
            title: 'Senior ReactJS (Không yêu cầu KN)',
            company: 'TechNova',
            ownerEmail: 'hr@technova.com',
            postedDate: '10/03/2026',
            status: 'Active',
            aiReason: null,
        },
        {
            id: 3,
            title: 'Tuyển dev quây API sập web đối thủ',
            company: 'Hacker Team',
            ownerEmail: 'dark@web.com',
            postedDate: '09/03/2026',
            status: 'Flagged',
            aiReason: 'Ngôn từ vi phạm / Tiêu chuẩn cộng đồng',
        },
    ]);

    const [cvs] = useState([
        {
            id: 1,
            candidateName: 'Nguyễn Văn Spam',
            ownerEmail: 'spam123@gmail.com',
            uploadedDate: '12/03/2026',
            status: 'Flagged',
            aiReason: 'CV chứa liên kết độc hại / Chứa nhiều ký tự rác',
        },
        {
            id: 2,
            candidateName: 'Linh Phan',
            ownerEmail: 'linhnef@gmail.com',
            uploadedDate: '10/03/2026',
            status: 'Active',
            aiReason: null,
        },
        {
            id: 3,
            candidateName: 'Trần C',
            ownerEmail: 'fake_email@10min.com',
            uploadedDate: '08/03/2026',
            status: 'Flagged',
            aiReason: 'Nghi ngờ tài khoản bot / Thông tin giả mạo',
        },
    ]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto font-sans pb-10">
            {/* HEADER */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <ShieldAlert className="text-rose-600" size={28} />
                        Kiểm duyệt & Hỗ trợ
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">
                        Giám sát tin tuyển dụng, CV và xử lý các báo cáo từ hệ thống.
                    </p>
                </div>
                <div className="bg-rose-50 text-rose-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 border border-rose-200 shadow-sm">
                    <AlertTriangle size={20} /> Hệ thống đang cảnh báo
                </div>
            </div>

            {/* TABS */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`flex items-center gap-2 px-6 py-3.5 font-bold text-sm transition-all border-b-[3px] ${activeTab === 'reports' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    <MessageSquareWarning size={18} /> Quản lý Báo cáo
                </button>
                <button
                    onClick={() => setActiveTab('jd')}
                    className={`flex items-center gap-2 px-6 py-3.5 font-bold text-sm transition-all border-b-[3px] ${activeTab === 'jd' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    <Briefcase size={18} /> Tin Tuyển Dụng (JD)
                </button>
                <button
                    onClick={() => setActiveTab('cv')}
                    className={`flex items-center gap-2 px-6 py-3.5 font-bold text-sm transition-all border-b-[3px] ${activeTab === 'cv' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    <FileText size={18} /> Hồ sơ Ứng viên (CV)
                </button>
            </div>

            {/* TOOLBAR */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-3 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder={
                            activeTab === 'jd'
                                ? 'Tìm theo tên Job, Công ty...'
                                : activeTab === 'cv'
                                  ? 'Tìm theo tên Ứng viên, Email...'
                                  : 'Tìm kiếm tiêu đề báo cáo, email người gửi...'
                        }
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                </div>

                <div className="flex gap-3">
                    {/* Filter riêng cho tab Report */}
                    {activeTab === 'reports' ? (
                        <select
                            value={reportStatusFilter}
                            onChange={(e) => {
                                setReportStatusFilter(e.target.value);
                                setReportPage(0);
                            }}
                            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 cursor-pointer font-bold text-slate-700 shadow-sm"
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="PENDING">Chờ xử lý</option>
                            <option value="PROCESSING">Đang xử lý</option>
                            <option value="RESOLVED">Đã giải quyết</option>
                            <option value="REJECTED">Từ chối</option>
                        </select>
                    ) : (
                        <select className="px-4 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-sm outline-none focus:border-rose-500 cursor-pointer font-bold shadow-sm">
                            <option value="flagged">Chỉ hiện Vi phạm (AI Flagged)</option>
                            <option value="all">Tất cả nội dung</option>
                        </select>
                    )}

                    <button className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 transition flex items-center gap-2 font-medium">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {/* TABLE CONTENT */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                                {activeTab === 'reports' ? (
                                    <>
                                        <th className="py-4 px-6 font-bold">Nội dung báo cáo</th>
                                        <th className="py-4 px-6 font-bold">Người gửi</th>
                                        <th className="py-4 px-6 font-bold text-center">Phân loại</th>
                                        <th className="py-4 px-6 font-bold text-center">Trạng thái</th>
                                        <th className="py-4 px-6 font-bold text-right">Thao tác</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="py-4 px-6 font-bold">
                                            {activeTab === 'jd' ? 'Tiêu đề JD' : 'Tên Ứng viên'}
                                        </th>
                                        <th className="py-4 px-6 font-bold">
                                            {activeTab === 'jd' ? 'Người đăng (HR)' : 'Chủ sở hữu (Seeker)'}
                                        </th>
                                        <th className="py-4 px-6 font-bold">Cảnh báo từ AI</th>
                                        <th className="py-4 px-6 font-bold text-right">Thao tác</th>
                                    </>
                                )}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {/* TAB BÁO CÁO */}
                            {activeTab === 'reports' &&
                                (isLoadingReports ? (
                                    <tr>
                                        <td colSpan="5" className="py-16 text-center">
                                            <Loader2 className="mx-auto animate-spin text-indigo-500" size={32} />
                                        </td>
                                    </tr>
                                ) : reports.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-16 text-center text-slate-500 font-medium">
                                            Không có dữ liệu báo cáo.
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map((report) => (
                                        <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-6">
                                                <p className="font-bold text-slate-900 text-base mb-1 line-clamp-1">
                                                    {report.title}
                                                </p>
                                                <p className="text-sm text-slate-500 line-clamp-1">{report.content}</p>
                                                <span className="text-xs text-slate-400 mt-1 block">
                                                    {new Date(report.createdAt).toLocaleString('vi-VN')}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                    <User size={16} className="text-slate-400" />
                                                    {report.senderEmail}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span
                                                    className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${REPORT_TYPE_MAP[report.type]?.color || REPORT_TYPE_MAP.OTHER.color}`}
                                                >
                                                    {REPORT_TYPE_MAP[report.type]?.label || report.type}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span
                                                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${REPORT_STATUS_MAP[report.status]?.color}`}
                                                >
                                                    {REPORT_STATUS_MAP[report.status]?.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => handleOpenResolveModal(report)}
                                                    className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-bold transition-colors inline-flex items-center gap-2"
                                                >
                                                    Xử lý <ChevronRight size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ))}

                            {/* TAB JD VÀ CV CŨ GIỮ NGUYÊN */}
                            {activeTab !== 'reports' &&
                                (activeTab === 'jd' ? jds : cvs).map((item) => (
                                    <tr
                                        key={item.id}
                                        className={`transition ${item.status === 'Flagged' ? 'bg-rose-50/20' : 'hover:bg-slate-50'}`}
                                    >
                                        <td className="py-4 px-6">
                                            <p className="font-bold text-slate-900 text-base">
                                                {activeTab === 'jd' ? item.title : item.candidateName}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                {activeTab === 'jd' ? 'Đăng ngày: ' : 'Upload ngày: '}{' '}
                                                {item.postedDate || item.uploadedDate}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                {activeTab === 'jd' ? (
                                                    <Building2 size={16} className="text-slate-400" />
                                                ) : (
                                                    <User size={16} className="text-slate-400" />
                                                )}
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-sm">
                                                        {activeTab === 'jd' ? item.company : item.candidateName}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{item.ownerEmail}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {item.status === 'Flagged' ? (
                                                <div className="inline-flex items-start gap-2 bg-rose-100 text-rose-700 px-3 py-2 rounded-lg border border-rose-200 max-w-xs">
                                                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                                                    <span className="text-xs font-bold leading-tight">
                                                        {item.aiReason}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                                                    <CheckCircle2 size={14} /> An toàn
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {item.status === 'Flagged' && (
                                                    <>
                                                        <button
                                                            className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                                                            title="Bỏ qua (AI báo nhầm)"
                                                        >
                                                            <CheckCircle2 size={18} />
                                                        </button>
                                                        <button className="px-3 py-1.5 text-white bg-rose-600 hover:bg-rose-700 rounded-lg text-sm font-bold shadow-sm transition flex items-center gap-1">
                                                            <Trash2 size={16} /> Gỡ bài
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Phân trang cho Report */}
                {activeTab === 'reports' && reportTotalPages > 1 && !isLoadingReports && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                        <span className="text-sm font-medium text-slate-500">
                            Trang <strong className="text-slate-800">{reportPage + 1}</strong> / {reportTotalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={reportPage === 0}
                                onClick={() => setReportPage((p) => p - 1)}
                                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                disabled={reportPage >= reportTotalPages - 1}
                                onClick={() => setReportPage((p) => p + 1)}
                                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================================
                MODAL XỬ LÝ BÁO CÁO
            ======================================================== */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <form
                        onSubmit={handleResolveSubmit}
                        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8"
                    >
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <Flag size={20} className="text-indigo-600" /> Xử lý Báo cáo #{selectedReport.id}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setSelectedReport(null)}
                                className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Thông tin báo cáo */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                                <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase">Tiêu đề:</span>
                                    <p className="font-bold text-slate-900 text-lg mt-0.5">{selectedReport.title}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase">
                                        Nội dung chi tiết:
                                    </span>
                                    <p className="text-slate-700 mt-1 whitespace-pre-wrap font-medium">
                                        {selectedReport.content}
                                    </p>
                                </div>
                                <div className="pt-3 border-t border-slate-200 flex flex-wrap gap-4 text-sm font-medium">
                                    <span className="text-slate-600">
                                        <strong className="text-slate-500">Người gửi:</strong>{' '}
                                        {selectedReport.senderEmail}
                                    </span>
                                    <span className="text-slate-600">
                                        <strong className="text-slate-500">Ngày gửi:</strong>{' '}
                                        {new Date(selectedReport.createdAt).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                            </div>

                            {/* Form Xử lý */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Trạng thái xử lý
                                    </label>
                                    <select
                                        value={resolveForm.status}
                                        onChange={(e) => setResolveForm({ ...resolveForm, status: e.target.value })}
                                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:border-indigo-600 outline-none font-bold text-slate-800 cursor-pointer"
                                    >
                                        <option value="PROCESSING">Đang xử lý (Processing)</option>
                                        <option value="RESOLVED">Đã giải quyết (Resolved)</option>
                                        <option value="REJECTED">Từ chối (Rejected)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Ghi chú của Admin (Nội bộ / Gửi phản hồi)
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={resolveForm.adminNote}
                                        onChange={(e) => setResolveForm({ ...resolveForm, adminNote: e.target.value })}
                                        className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:border-indigo-600 outline-none resize-none font-medium text-slate-800"
                                        placeholder="Nhập ghi chú xử lý hoặc phản hồi..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                            <button
                                type="button"
                                onClick={() => setSelectedReport(null)}
                                className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isResolving}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-2.5 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                            >
                                {isResolving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {isResolving ? 'Đang lưu...' : 'Cập nhật trạng thái'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminModeration;
