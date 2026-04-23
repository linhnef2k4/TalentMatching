import React, { useState, useEffect } from 'react';
import {
    CheckCircle2,
    XCircle,
    ExternalLink,
    ShieldCheck,
    AlertCircle,
    Loader2,
    Link as LinkIcon,
    Building2,
    MapPin,
} from 'lucide-react';
import userService from '~/services/userService';

const AdminCompanies = () => {
    const [pendingHRs, setPendingHRs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // State cho Modal từ chối
    const [rejectModal, setRejectModal] = useState({ show: false, companyId: null, companyName: '' });
    const [rejectReason, setRejectReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Lấy dữ liệu khi load trang
    useEffect(() => {
        fetchPendingHRs();
    }, []);

    const fetchPendingHRs = async () => {
        setIsLoading(true);
        try {
            const data = await userService.getPendingEmployers();
            setPendingHRs(data || []);
        } catch (error) {
            console.error('Lỗi lấy danh sách chờ duyệt:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm Duyệt
    const handleApprove = async (id, companyName) => {
        if (window.confirm(`Xác nhận cấp quyền Doanh nghiệp cho: ${companyName}?`)) {
            try {
                await userService.approveEmployer(id);
                // Xóa khỏi UI ngay lập tức
                setPendingHRs(pendingHRs.filter((hr) => hr.id !== id));
                alert('Đã cấp quyền Doanh nghiệp thành công!');
            } catch (error) {
                console.error('Lỗi khi duyệt:', error);
                alert('Có lỗi xảy ra khi duyệt. Vui lòng thử lại!');
            }
        }
    };

    // Hàm Từ chối (Gọi từ Modal)
    const handleRejectSubmit = async () => {
        if (!rejectReason.trim()) {
            alert('Vui lòng nhập lý do từ chối!');
            return;
        }

        setIsProcessing(true);
        try {
            await userService.rejectEmployer(rejectModal.companyId, rejectReason);
            // Xóa khỏi UI
            setPendingHRs(pendingHRs.filter((hr) => hr.id !== rejectModal.companyId));

            // Đóng Modal & Reset
            setRejectModal({ show: false, companyId: null, companyName: '' });
            setRejectReason('');
            alert('Đã từ chối yêu cầu!');
        } catch (error) {
            console.error('Lỗi khi từ chối:', error);
            alert('Có lỗi xảy ra khi từ chối. Vui lòng thử lại!');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Building2 className="text-blue-600" />
                        Duyệt Hồ Sơ Doanh Nghiệp
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Kiểm tra thông tin pháp lý trước khi cấp quyền HR đăng tin tuyển dụng.
                    </p>
                </div>
                <div className="bg-orange-50 text-orange-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 border border-orange-100 shadow-sm">
                    <AlertCircle size={20} className="text-orange-500" />
                    {pendingHRs.length} yêu cầu chờ duyệt
                </div>
            </div>

            {/* Bảng Dữ liệu */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="py-4 px-6 text-sm font-bold text-gray-700 w-1/3">
                                    Thông tin Doanh nghiệp
                                </th>
                                <th className="py-4 px-6 text-sm font-bold text-gray-700">Tài khoản & Người ĐD</th>
                                <th className="py-4 px-6 text-sm font-bold text-gray-700 text-center">
                                    Xác thực pháp lý
                                </th>
                                <th className="py-4 px-6 text-sm font-bold text-gray-700 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center">
                                        <Loader2 size={40} className="mx-auto text-blue-600 animate-spin mb-2" />
                                        <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                                    </td>
                                </tr>
                            ) : pendingHRs.length > 0 ? (
                                pendingHRs.map((hr) => (
                                    <tr key={hr.id} className="hover:bg-gray-50/80 transition group">
                                        {/* Cột 1: Thông tin công ty */}
                                        <td className="py-5 px-6">
                                            <p className="font-bold text-gray-900 text-base mb-1 group-hover:text-blue-600 transition-colors">
                                                {hr.name}
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-start gap-1 mb-1.5">
                                                <MapPin size={14} className="flex-shrink-0 text-gray-400 mt-0.5" />
                                                <span className="line-clamp-2">{hr.address}</span>
                                            </p>
                                            {hr.website && (
                                                <a
                                                    href={hr.website}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                                                >
                                                    <LinkIcon size={12} /> {hr.website}
                                                </a>
                                            )}
                                        </td>

                                        {/* Cột 2: Tài khoản HR */}
                                        <td className="py-5 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                                                    {hr.applicantName ? hr.applicantName.charAt(0) : 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{hr.applicantName}</p>
                                                    <p className="text-xs font-semibold text-gray-500 mb-0.5">
                                                        Chức vụ: <span className="text-blue-600">{hr.hrPosition}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500">{hr.applicantEmail}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Cột 3: Pháp lý */}
                                        <td className="py-5 px-6">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                                                    <span className="text-xs text-gray-500 font-medium">MST:</span>
                                                    <span className="font-mono text-sm font-bold text-gray-800">
                                                        {hr.taxCode}
                                                    </span>
                                                    <a
                                                        href={`https://masothue.com/Search/?q=${hr.taxCode}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 bg-blue-50 p-1 rounded"
                                                        title="Tra cứu MST"
                                                    >
                                                        <ExternalLink size={14} />
                                                    </a>
                                                </div>

                                                {hr.businessLicenseUrl ? (
                                                    <a
                                                        href={hr.businessLicenseUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 hover:bg-green-100 transition-colors flex items-center gap-1.5"
                                                    >
                                                        <ShieldCheck size={14} /> Xem Giấy phép KD
                                                    </a>
                                                ) : (
                                                    <span className="text-xs font-medium text-red-500 italic">
                                                        Không đính kèm GPKD
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Cột 4: Action */}
                                        <td className="py-5 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleApprove(hr.id, hr.name)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-1.5"
                                                >
                                                    <CheckCircle2 size={16} /> Duyệt
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setRejectModal({
                                                            show: true,
                                                            companyId: hr.id,
                                                            companyName: hr.name,
                                                        })
                                                    }
                                                    className="bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-4 py-2 rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-1.5"
                                                >
                                                    <XCircle size={16} /> Từ chối
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-24 text-center text-gray-500 bg-gray-50/50">
                                        <ShieldCheck size={64} className="mx-auto text-green-400 mb-4 opacity-50" />
                                        <p className="text-xl font-bold text-gray-800 mb-1">
                                            Tuyệt vời! Hệ thống đã sạch sẽ.
                                        </p>
                                        <p className="text-sm">
                                            Không có yêu cầu đăng ký doanh nghiệp nào đang chờ xử lý.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL TỪ CHỐI */}
            {rejectModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 bg-red-50/50 flex items-center gap-3">
                            <div className="bg-red-100 text-red-600 p-2 rounded-full">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Từ chối Yêu cầu</h3>
                                <p className="text-xs text-gray-500 font-medium">
                                    Doanh nghiệp: {rejectModal.companyName}
                                </p>
                            </div>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Lý do từ chối <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                autoFocus
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows="4"
                                placeholder="Nhập lý do để thông báo cho người dùng (VD: Mã số thuế không khớp, Giấy phép mờ...)"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all text-sm resize-none"
                            ></textarea>
                        </div>
                        <div className="p-6 pt-0 flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setRejectModal({ show: false, companyId: null, companyName: '' });
                                    setRejectReason('');
                                }}
                                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors text-sm"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleRejectSubmit}
                                disabled={isProcessing || !rejectReason.trim()}
                                className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                                Xác nhận Từ chối
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCompanies;
