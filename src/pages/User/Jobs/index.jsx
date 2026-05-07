import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    MapPin,
    Briefcase,
    Filter,
    ChevronRight,
    Check,
    X,
    Loader2,
    ChevronLeft,
    Banknote,
    Clock,
} from 'lucide-react';
import jobService from '~/services/jobService';

// === DỮ LIỆU BỘ LỌC ===
const PROVINCES = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Bình Dương', 'Đồng Nai', 'Bắc Ninh'];

const CATEGORIES = [
    { name: 'IT - Phần mềm' },
    { name: 'Marketing / Truyền thông' },
    { name: 'Kế toán / Kiểm toán' },
    { name: 'Ngân hàng / Tài chính' },
    { name: 'Hành chính / Nhân sự' },
    { name: 'Cơ khí / Ô tô' },
];

const SALARIES = ['Tất cả', 'Dưới 10 triệu', '10 - 20 triệu', '20 - 30 triệu', 'Trên 30 triệu', 'Thỏa thuận'];

const JOB_TYPES = [
    { label: 'Tất cả', value: 'Tất cả' },
    { label: 'Toàn thời gian', value: 'FULL_TIME' },
    { label: 'Bán thời gian', value: 'PART_TIME' },
    { label: 'Từ xa (Remote)', value: 'REMOTE' },
    { label: 'Linh hoạt (Hybrid)', value: 'HYBRID' },
    { label: 'Thực tập', value: 'INTERNSHIP' },
    { label: 'Tự do (Freelance)', value: 'FREELANCE' },
];

const EXPERIENCES = ['Tất cả', 'Không yêu cầu', 'Dưới 1 năm', '1 năm', '2 năm', '3 năm', 'Trên 5 năm'];

const Jobs = () => {
    // === STATES API & DATA ===
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Lưu metadata phân trang
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // === STATES BỘ LỌC ===
    const [keyword, setKeyword] = useState('');
    const [locationFilter, setLocationFilter] = useState('Địa điểm');
    const [salaryFilter, setSalaryFilter] = useState('Tất cả');
    const [jobTypeFilter, setJobTypeFilter] = useState('Tất cả'); // Thay vì lọc Experience chưa có trong API Search
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [sortBy, setSortBy] = useState('Mới cập nhật');

    // Mặc định API search theo Title
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 10;

    const suggestedKeywords = [
        'lập trình php',
        'reactjs developer',
        'java developer',
        'angular developer',
        'golang developer',
    ];

    // Gọi API mỗi khi filter thay đổi
    useEffect(() => {
        fetchJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, salaryFilter, jobTypeFilter, locationFilter, sortBy]);

    // Hàm quy đổi chuỗi mức lương ra số minSalary cho API
    const getMinSalaryValue = (label) => {
        if (label === '10 - 20 triệu') return 10000000;
        if (label === '20 - 30 triệu') return 20000000;
        if (label === 'Trên 30 triệu') return 30000000;
        return null; // Các mốc dưới 10tr hoặc thỏa thuận thì không truyền minSalary
    };

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            const filters = {
                title: keyword.trim(),
                location: locationFilter,
                jobType: jobTypeFilter,
                minSalary: getMinSalaryValue(salaryFilter),
                sort: sortBy === 'Mức lương cao nhất' ? 'salaryMax,desc' : 'createdAt,desc',
            };

            const response = await jobService.searchJobs(currentPage - 1, jobsPerPage, filters);

            if (response && response.content) {
                // Vẫn giữ trò trộn mảng nếu bạn thích giao diện hiển thị lộn xộn sinh động
                const shuffledJobs =
                    sortBy === 'Mới cập nhật'
                        ? [...response.content].sort(() => Math.random() - 0.5)
                        : response.content;

                setJobs(shuffledJobs);
                setTotalPages(response.totalPages || 1);
                setTotalElements(response.totalElements || 0);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách việc làm:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchClick = () => {
        if (currentPage === 1) fetchJobs();
        else setCurrentPage(1);
    };

    const clearFilters = () => {
        setSalaryFilter('Tất cả');
        setJobTypeFilter('Tất cả');
        setLocationFilter('Địa điểm');
        setKeyword('');
        setSortBy('Mới cập nhật');
        setCurrentPage(1);
    };

    const getPaginationNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    const formatSalary = (min, max) => {
        if (!min && !max) return 'Thỏa thuận';
        const formatMoney = (val) => {
            if (val >= 1000000) return val / 1000000 + ' Tr';
            return new Intl.NumberFormat('vi-VN').format(val);
        };
        if (min && !max) return `Từ ${formatMoney(min)}`;
        if (!min && max) return `Tới ${formatMoney(max)}`;
        return `${formatMoney(min)} - ${formatMoney(max)}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="bg-slate-50 text-slate-900 font-sans min-h-screen pb-20 relative">
            {/* Top Search Block */}
            <div className="relative sticky top-0 z-40 border-b border-slate-800 shadow-md">
                <div
                    className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage:
                            'url("https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1920&q=80")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <div className="absolute inset-0 z-0 bg-blue-900/90 backdrop-blur-md" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 relative z-10">
                    <div className="flex bg-white rounded-lg shadow-sm border border-slate-200 p-1 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all">
                        <div className="hidden md:flex items-center px-4 border-r border-slate-200 w-[20%] lg:w-[15%]">
                            <Briefcase size={18} className="text-violet-500 mr-2 flex-shrink-0" />
                            <select className="w-full outline-none text-sm text-slate-700 bg-white cursor-pointer font-medium truncate">
                                <option>Ngành nghề</option>
                                {CATEGORIES.map((c) => (
                                    <option key={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center px-4 flex-1">
                            <Search size={18} className="text-violet-500 mr-2 flex-shrink-0" />
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                                placeholder="Nhập chức danh, vị trí công việc..."
                                className="w-full outline-none text-sm text-slate-900 bg-transparent font-medium placeholder-slate-400"
                            />
                            {keyword && (
                                <X
                                    size={16}
                                    onClick={() => setKeyword('')}
                                    className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors"
                                />
                            )}
                        </div>

                        <div className="hidden sm:flex items-center px-4 border-l border-slate-200 w-[25%] lg:w-[20%]">
                            <MapPin size={18} className="text-violet-500 mr-2 flex-shrink-0" />
                            <select
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                className="w-full outline-none text-sm text-slate-700 bg-white cursor-pointer font-medium"
                            >
                                <option value="Địa điểm">Tất cả địa điểm</option>
                                {PROVINCES.map((prov) => (
                                    <option key={prov} value={prov}>
                                        {prov}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleSearchClick}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-6 md:px-8 py-2.5 rounded text-sm transition-all whitespace-nowrap shadow-md shadow-indigo-500/20 active:scale-95"
                        >
                            Tìm kiếm
                        </button>
                    </div>
                </div>
            </div>

            {/* Header Info & Keywords */}
            <div className="bg-white border-b border-slate-200 relative z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                Tìm thấy <span className="text-violet-600">{totalElements}</span> việc làm{' '}
                                {keyword && `"${keyword}"`}
                            </h1>
                            <div className="text-sm text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                                <Link to="/" className="hover:text-violet-600 transition-colors">
                                    Trang chủ
                                </Link>
                                <ChevronRight size={14} className="text-slate-400" />
                                <Link to="/jobs" className="hover:text-violet-600 transition-colors">
                                    Việc làm
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm overflow-x-auto pb-2 scrollbar-hide">
                        <span className="text-slate-500 whitespace-nowrap font-medium">Gợi ý:</span>
                        <div className="flex gap-2">
                            {suggestedKeywords.map((k) => (
                                <span
                                    key={k}
                                    onClick={() => {
                                        setKeyword(k);
                                        handleSearchClick();
                                    }}
                                    className="px-3 py-1.5 bg-slate-100 text-slate-600 font-medium rounded-full cursor-pointer hover:bg-violet-50 hover:text-violet-600 transition-all whitespace-nowrap border border-slate-200"
                                >
                                    {k}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* LEFT SIDEBAR: Filters */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4 px-1">
                            <Filter size={20} className="text-violet-600" /> Lọc nâng cao
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-6">
                            {/* Mức lương */}
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                                    <Banknote size={16} className="text-emerald-500" /> Mức lương
                                </h4>
                                <div className="space-y-3">
                                    {SALARIES.map((sal, idx) => (
                                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="salary"
                                                value={sal}
                                                checked={salaryFilter === sal}
                                                onChange={(e) => {
                                                    setSalaryFilter(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                className="text-violet-600 bg-white border-slate-300 focus:ring-violet-500 w-4 h-4 transition-colors"
                                            />
                                            <span
                                                className={`text-sm transition-colors ${salaryFilter === sal ? 'text-violet-600 font-medium' : 'text-slate-700 group-hover:text-violet-600'}`}
                                            >
                                                {sal}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Loại công việc (Match với Enum của Backend) */}
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                                    <Clock size={16} className="text-blue-500" /> Hình thức làm việc
                                </h4>
                                <div className="space-y-3">
                                    {JOB_TYPES.map((type, idx) => (
                                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="jobType"
                                                value={type.value}
                                                checked={jobTypeFilter === type.value}
                                                onChange={(e) => {
                                                    setJobTypeFilter(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                className="text-violet-600 bg-white border-slate-300 focus:ring-violet-500 w-4 h-4 transition-colors"
                                            />
                                            <span
                                                className={`text-sm transition-colors ${jobTypeFilter === type.value ? 'text-violet-600 font-medium' : 'text-slate-700 group-hover:text-violet-600'}`}
                                            >
                                                {type.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={clearFilters}
                                className="w-full py-2 mt-6 rounded-lg border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 hover:text-slate-700 transition-colors"
                            >
                                Bỏ chọn tất cả
                            </button>
                        </div>
                    </aside>

                    {/* RIGHT CONTENT: Job List */}
                    <div className="flex-1">
                        {/* Toolbar: Sort */}
                        <div className="flex flex-col xl:flex-row justify-end items-start xl:items-center gap-4 mb-6 px-1">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-500 font-medium whitespace-nowrap">Sắp xếp:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => {
                                        setSortBy(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="bg-white border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-violet-500 font-medium text-slate-700 shadow-sm cursor-pointer min-w-[140px]"
                                >
                                    <option>Mới cập nhật</option>
                                    <option>Mức lương cao nhất</option>
                                </select>
                            </div>
                        </div>

                        {/* Job Cards List */}
                        {isLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <Loader2 size={40} className="animate-spin text-violet-600" />
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="bg-white rounded-xl border border-slate-200 p-16 text-center shadow-sm">
                                <Search size={56} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy việc làm</h3>
                                <p className="text-slate-500">
                                    Thử thay đổi từ khóa hoặc bộ lọc để xem nhiều kết quả hơn nhé.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-6 px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition-colors"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {jobs.map((job) => (
                                    <Link
                                        to={`/jobs/${job.id}`}
                                        key={job.id}
                                        className="group block p-4 sm:p-5 bg-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border border-slate-200 hover:border-violet-400"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Logo */}
                                            <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden p-1 border border-slate-100 relative">
                                                <img
                                                    src={
                                                        job.employerAvatar ||
                                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(job.employerName)}&background=eef2ff&color=4f46e5`
                                                    }
                                                    alt="Logo"
                                                    className="w-full h-full object-contain rounded"
                                                />
                                                {job.priority && (
                                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-white"></span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-1.5">
                                                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-violet-600 transition-colors line-clamp-2 pr-8 sm:pr-0">
                                                        {job.title}
                                                    </h3>
                                                    <span className="font-bold text-violet-600 whitespace-nowrap text-base bg-violet-50 px-3 py-1 rounded-lg border border-violet-100">
                                                        {formatSalary(job.salaryMin, job.salaryMax)}
                                                    </span>
                                                </div>

                                                <div className="text-sm text-slate-500 font-medium mb-3 flex items-center gap-1.5 truncate">
                                                    {job.employerName}
                                                    <Check
                                                        size={12}
                                                        className="bg-blue-500 text-white rounded-full p-0.5 inline-block"
                                                    />
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    <span className="bg-slate-50 text-slate-600 border border-slate-200 text-xs px-3 py-1.5 rounded font-medium truncate">
                                                        {job.location}
                                                    </span>
                                                    <span className="bg-slate-50 text-slate-600 border border-slate-200 text-xs px-3 py-1.5 rounded font-medium">
                                                        {job.experienceLevel === 'JUNIOR'
                                                            ? 'Dưới 1 năm'
                                                            : job.experienceLevel === 'MID_LEVEL'
                                                              ? '1 - 3 năm'
                                                              : job.experienceLevel}
                                                    </span>
                                                    <span className="bg-slate-50 text-slate-600 border border-slate-200 text-xs px-3 py-1.5 rounded font-medium">
                                                        {JOB_TYPES.find((t) => t.value === job.jobType)?.label ||
                                                            job.jobType}
                                                    </span>
                                                </div>

                                                {/* Kỹ năng yêu cầu */}
                                                {job.requiredSkills && job.requiredSkills.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {job.requiredSkills.slice(0, 4).map((skill) => (
                                                            <span
                                                                key={skill}
                                                                className="bg-indigo-50 text-indigo-500 text-[11px] px-2 py-1 rounded-md font-bold uppercase tracking-wider border border-indigo-100"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        {job.requiredSkills.length > 4 && (
                                                            <span className="bg-slate-100 text-slate-500 text-[11px] px-2 py-1 rounded-md font-bold">
                                                                +{job.requiredSkills.length - 4}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-center pt-3 border-t border-slate-100 border-dashed">
                                                    <p className="text-sm text-slate-500 truncate max-w-lg hidden sm:block">
                                                        {job.description || 'Nhấn để xem chi tiết mô tả công việc...'}
                                                    </p>
                                                    <div className="text-xs text-slate-400 font-medium ml-auto">
                                                        Đăng: {formatDate(job.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* === UI PAGINATION (API DRIVEN) === */}
                        {!isLoading && totalPages > 1 && (
                            <div className="mt-10 flex justify-center items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg border transition-colors ${currentPage === 1 ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:border-violet-500 hover:text-violet-600 bg-white'}`}
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <div className="flex items-center gap-1">
                                    {getPaginationNumbers().map((page, index) =>
                                        page === '...' ? (
                                            <span
                                                key={`dots-${index}`}
                                                className="w-10 h-10 flex items-center justify-center text-slate-400 font-medium"
                                            >
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium text-sm transition-colors 
                                                    ${currentPage === page ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30 border border-violet-600' : 'bg-white border border-slate-200 text-slate-600 hover:border-violet-500 hover:text-violet-600'}`}
                                            >
                                                {page}
                                            </button>
                                        ),
                                    )}
                                </div>

                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg border transition-colors ${currentPage === totalPages ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:border-violet-500 hover:text-violet-600 bg-white'}`}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default Jobs;
