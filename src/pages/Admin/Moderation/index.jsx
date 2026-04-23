import React, { useState } from 'react';
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
} from 'lucide-react';

const AdminModeration = () => {
    const [activeTab, setActiveTab] = useState('jd');

    // Mock dữ liệu JD bị AI cắm cờ (Flagged)
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

    // Mock dữ liệu CV bị AI cắm cờ
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
        <div className="space-y-6 max-w-7xl mx-auto font-sans">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ShieldAlert className="text-red-600" size={28} />
                        Kiểm duyệt Nội dung (AI Moderation)
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Giám sát JD và CV toàn hệ thống. AI tự động phát hiện các nội dung vi phạm.
                    </p>
                </div>
                <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 border border-red-200 shadow-sm">
                    <AlertTriangle size={20} /> 4 Vi phạm chờ xử lý
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('jd')}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all border-b-2 ${activeTab === 'jd' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Briefcase size={18} /> Quản lý Tin Tuyển Dụng (JD)
                </button>
                <button
                    onClick={() => setActiveTab('cv')}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all border-b-2 ${activeTab === 'cv' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <FileText size={18} /> Quản lý Hồ sơ Ứng viên (CV)
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder={
                            activeTab === 'jd' ? 'Tìm theo tên Job, Công ty...' : 'Tìm theo tên Ứng viên, Email...'
                        }
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition"
                    />
                </div>
                <div className="flex gap-3">
                    <select className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm outline-none focus:border-red-500 cursor-pointer font-bold shadow-sm">
                        <option value="flagged">Chỉ hiện Vi phạm (AI Flagged)</option>
                        <option value="all">Tất cả nội dung</option>
                    </select>
                    <button className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition flex items-center gap-2 font-medium">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {/* Table Content */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-sm">
                                <th className="py-4 px-6 font-semibold">
                                    {activeTab === 'jd' ? 'Tiêu đề JD' : 'Tên Ứng viên'}
                                </th>
                                <th className="py-4 px-6 font-semibold">
                                    {activeTab === 'jd' ? 'Người đăng (HR)' : 'Chủ sở hữu (Seeker)'}
                                </th>
                                <th className="py-4 px-6 font-semibold">Cảnh báo từ AI</th>
                                <th className="py-4 px-6 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(activeTab === 'jd' ? jds : cvs).map((item) => (
                                <tr
                                    key={item.id}
                                    className={`transition ${item.status === 'Flagged' ? 'bg-red-50/20' : 'hover:bg-gray-50'}`}
                                >
                                    {/* Cột 1: Tiêu đề JD / Tên CV */}
                                    <td className="py-4 px-6">
                                        <p className="font-bold text-gray-900 text-base">
                                            {activeTab === 'jd' ? item.title : item.candidateName}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            {activeTab === 'jd' ? 'Đăng ngày: ' : 'Upload ngày: '}{' '}
                                            {item.postedDate || item.uploadedDate}
                                        </p>
                                    </td>

                                    {/* Cột 2: Chủ sở hữu */}
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            {activeTab === 'jd' ? (
                                                <Building2 size={16} className="text-gray-400" />
                                            ) : (
                                                <User size={16} className="text-gray-400" />
                                            )}
                                            <div>
                                                <p className="font-semibold text-gray-800 text-sm">
                                                    {activeTab === 'jd' ? item.company : item.candidateName}
                                                </p>
                                                <p className="text-xs text-gray-500">{item.ownerEmail}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Cột 3: Trạng thái & AI Warning */}
                                    <td className="py-4 px-6">
                                        {item.status === 'Flagged' ? (
                                            <div className="inline-flex items-start gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg border border-red-200 max-w-xs">
                                                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                                                <span className="text-xs font-bold leading-tight">{item.aiReason}</span>
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                                                <CheckCircle2 size={14} /> An toàn
                                            </span>
                                        )}
                                    </td>

                                    {/* Cột 4: Hành động */}
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {item.status === 'Flagged' && (
                                                <>
                                                    <button
                                                        className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition"
                                                        title="Bỏ qua (AI báo nhầm)"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                    <button className="px-3 py-1.5 text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm font-bold shadow-sm transition flex items-center gap-1">
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
            </div>
        </div>
    );
};

export default AdminModeration;
