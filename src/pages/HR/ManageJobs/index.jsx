import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Search, Filter, Users, Eye, Edit3, Trash2, Clock, Loader2, MapPin } from 'lucide-react';
import jobService from '~/services/jobService';
import applicationService from '~/services/applicationService';

const ManageJobs = () => {
    const [myJobs, setMyJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [applicationCounts, setApplicationCounts] = useState({});

    // Filters
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMyJobs();
    }, []);

    const fetchMyJobs = async () => {
        setIsLoading(true);
        try {
            // Gọi song song 2 API để tối ưu thời gian tải
            const [jobsResponse, statsResponse] = await Promise.all([
                jobService.getMyJobs(0, 50),
                applicationService.getEmployerStats(),
            ]);

            if (jobsResponse && jobsResponse.content) {
                setMyJobs(jobsResponse.content);
            }
            if (statsResponse && statsResponse.applicationsPerJob) {
                setApplicationCounts(statsResponse.applicationsPerJob);
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu trang quản lý job:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tin tuyển dụng này không? Hành động này không thể hoàn tác!')) {
            try {
                await jobService.deleteJob(jobId);
                // Xóa thành công thì filter thẳng ở client cho nhanh, không cần gọi lại API
                setMyJobs((prev) => prev.filter((job) => job.id !== jobId));
            } catch (error) {
                console.error('Lỗi khi xóa job:', error);
                alert('Có lỗi xảy ra khi xóa tin tuyển dụng!');
            }
        }
    };

    // Utils format ngày tháng
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Logic lọc danh sách theo Tab & Search
    const filteredJobs = myJobs.filter((job) => {
        const matchSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchSearch) return false;

        if (activeTab === 'active') return job.status === 'OPEN' && !job.expired;
        if (activeTab === 'expired') return job.expired === true;
        if (activeTab === 'closed') return job.status !== 'OPEN';
        return true;
    });

    const countActive = myJobs.filter((j) => j.status === 'OPEN' && !j.expired).length;
    const countExpired = myJobs.filter((j) => j.expired === true).length;
    const countClosed = myJobs.filter((j) => j.status !== 'OPEN').length;

    const renderStatusBadge = (job) => {
        if (job.status !== 'OPEN') {
            return (
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                    Đã đóng
                </span>
            );
        }
        if (job.expired) {
            return (
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                    Đã hết hạn
                </span>
            );
        }
        return (
            <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Đang hiển thị
            </span>
        );
    };

    return (
        <div className="bg-gray-50 min-h-[calc(100vh-64px)] font-sans p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="bg-blue-100 text-blue-600 p-2 rounded-xl">
                                <Briefcase size={24} />
                            </div>
                            Quản lý Tin Tuyển Dụng
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm ml-12">
                            Quản lý các chiến dịch tuyển dụng và theo dõi hồ sơ ứng viên.
                        </p>
                    </div>
                    <Link
                        to="/hr/post-job"
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm hover:shadow-md flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={20} /> Đăng Job Mới
                    </Link>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-2 sm:p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex space-x-1 bg-gray-50 p-1 rounded-xl w-full md:w-auto overflow-x-auto scrollbar-hide border border-gray-100">
                        {[
                            { id: 'all', label: 'Tất cả', count: myJobs.length },
                            { id: 'active', label: 'Đang mở', count: countActive },
                            { id: 'expired', label: 'Hết hạn', count: countExpired },
                            { id: 'closed', label: 'Đã đóng', count: countClosed },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                                    activeTab === tab.id
                                        ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                {tab.label}{' '}
                                <span
                                    className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-blue-50' : 'bg-gray-200'}`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex w-full md:w-auto gap-3 px-2 sm:px-0">
                        <div className="relative flex-1 md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm theo tên công việc..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                        <button
                            className="p-2.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 hover:text-blue-600 transition"
                            title="Bộ lọc nâng cao"
                        >
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Table Data */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[900px]">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wide">
                                    <th className="py-4 px-6 font-bold">Vị trí tuyển dụng</th>
                                    <th className="py-4 px-6 font-bold w-40">Trạng thái</th>
                                    <th className="py-4 px-6 font-bold text-center w-32">Lượt xem</th>
                                    <th className="py-4 px-6 font-bold text-center w-32">Ứng viên</th>
                                    <th className="py-4 px-6 font-bold text-right w-40">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="py-16 text-center">
                                            <Loader2 size={36} className="mx-auto text-blue-500 animate-spin mb-3" />
                                            <p className="text-gray-500 font-medium">Đang tải danh sách công việc...</p>
                                        </td>
                                    </tr>
                                ) : filteredJobs.length > 0 ? (
                                    filteredJobs.map((job) => {
                                        // Số lượng ứng viên lấy từ stats (map theo id hoặc title)
                                        const candidateCount =
                                            applicationCounts[job.id] || applicationCounts[job.title] || 0;

                                        return (
                                            <tr key={job.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <Link
                                                        to={`/jobs/${job.id}`}
                                                        className="font-bold text-gray-900 text-base hover:text-blue-600 transition-colors line-clamp-1 mb-1"
                                                    >
                                                        {job.title}
                                                    </Link>
                                                    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 font-medium">
                                                        <span className="flex items-center gap-1.5">
                                                            <MapPin size={14} className="text-gray-400" />{' '}
                                                            {job.location?.split(',')[0] || 'Remote'}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock size={14} className="text-gray-400" /> Đăng ngày:{' '}
                                                            {formatDate(job.createdAt)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">{renderStatusBadge(job)}</td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className="inline-flex items-center gap-1.5 text-gray-500 font-bold bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                                                        <Eye size={16} className="text-gray-400" /> 0
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <Link
                                                        to={`/hr/candidates?jobId=${job.id}`}
                                                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold transition border 
                                                            ${
                                                                candidateCount > 0
                                                                    ? 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 hover:border-blue-200'
                                                                    : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                                                            }`}
                                                        title="Xem danh sách ứng viên"
                                                    >
                                                        <Users
                                                            size={16}
                                                            className={
                                                                candidateCount > 0 ? 'text-blue-600' : 'text-gray-400'
                                                            }
                                                        />
                                                        {candidateCount}
                                                    </Link>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link
                                                            to={`/hr/edit-job/${job.id}`}
                                                            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                                                            title="Chỉnh sửa tin"
                                                        >
                                                            <Edit3 size={18} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteJob(job.id)}
                                                            className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition"
                                                            title="Xóa tin này"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-16 text-center">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                                <Briefcase size={32} className="text-gray-300" />
                                            </div>
                                            <p className="font-bold text-lg text-gray-700 mb-1">
                                                Không tìm thấy tin tuyển dụng nào
                                            </p>
                                            <p className="text-gray-500 text-sm mb-6">
                                                Hãy thử thay đổi bộ lọc hoặc đăng thêm tin tuyển dụng mới.
                                            </p>
                                            <Link
                                                to="/hr/post-job"
                                                className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2 rounded-lg font-bold hover:bg-blue-100 transition"
                                            >
                                                <Plus size={18} /> Tạo tin ngay
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageJobs;
