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
    ChevronLeft, // Import thêm Icon cho phân trang
} from 'lucide-react';
import jobService from '~/services/jobService';

// === DỮ LIỆU BỘ LỌC CHUẨN ===
const PROVINCES = [
    'Hà Nội',
    'Hồ Chí Minh',
    'Đà Nẵng',
    'Hải Phòng',
    'Cần Thơ',
    'An Giang',
    'Bà Rịa - Vũng Tàu',
    'Bắc Giang',
    'Bắc Kạn',
    'Bạc Liêu',
    'Bắc Ninh',
    'Bến Tre',
    'Bình Định',
    'Bình Dương',
    'Bình Phước',
    'Bình Thuận',
    'Cà Mau',
    'Cao Bằng',
    'Đắk Lắk',
    'Đắk Nông',
    'Điện Biên',
    'Đồng Nai',
    'Đồng Tháp',
    'Gia Lai',
    'Hà Giang',
    'Hà Nam',
    'Hà Tĩnh',
    'Hải Dương',
    'Hậu Giang',
    'Hòa Bình',
    'Hưng Yên',
    'Khánh Hòa',
    'Kiên Giang',
    'Kon Tum',
    'Lai Châu',
    'Lâm Đồng',
    'Lạng Sơn',
    'Lào Cai',
    'Long An',
    'Nam Định',
    'Nghệ An',
    'Ninh Bình',
    'Ninh Thuận',
    'Phú Thọ',
    'Phú Yên',
    'Quảng Bình',
    'Quảng Nam',
    'Quảng Ngãi',
    'Quảng Ninh',
    'Quảng Trị',
    'Sóc Trăng',
    'Sơn La',
    'Tây Ninh',
    'Thái Bình',
    'Thái Nguyên',
    'Thanh Hóa',
    'Thừa Thiên Huế',
    'Tiền Giang',
    'Trà Vinh',
    'Tuyên Quang',
    'Vĩnh Long',
    'Vĩnh Phúc',
    'Yên Bái',
];

const CATEGORIES = [
    { name: 'IT - Phần mềm' },
    { name: 'Marketing / Truyền thông' },
    { name: 'Kế toán / Kiểm toán' },
    { name: 'Ngân hàng / Tài chính' },
    { name: 'Hành chính / Nhân sự' },
    { name: 'Cơ khí / Ô tô' },
    { name: 'Giáo dục / Đào tạo' },
    { name: 'Y tế / Dược' },
    { name: 'Xây dựng' },
];

const EXPERIENCES = ['Tất cả', 'Không yêu cầu', 'Dưới 1 năm', '1 năm', '2 năm', '3 năm', 'Trên 5 năm'];

const Jobs = () => {
    // === STATES API ===
    const [allJobs, setAllJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // === STATES BỘ LỌC ===
    const [searchBy, setSearchBy] = useState('Cả hai');
    const [keyword, setKeyword] = useState('');
    const [locationFilter, setLocationFilter] = useState('Địa điểm');
    const [expFilter, setExpFilter] = useState('Tất cả');
    const [selectedCategories, setSelectedCategories] = useState([]);

    // === STATES PHÂN TRANG (PAGINATION) ===
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 10; // Số lượng job hiển thị trên 1 trang

    const suggestedKeywords = [
        'lập trình php',
        'reactjs developer',
        'java developer',
        'angular developer',
        'golang developer',
        'full stack',
    ];

    useEffect(() => {
        fetchJobs();
    }, []);

    // Mỗi khi các điều kiện lọc thay đổi, reset về trang 1
    useEffect(() => {
        setCurrentPage(1);
    }, [keyword, locationFilter, expFilter, selectedCategories, searchBy]);

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            // Lấy size=1000 để Frontend có toàn bộ dữ liệu (~500 công ty) giúp bộ lọc chạy chính xác
            const response = await jobService.getPublicJobs(0, 600);
            if (response && response.content) {
                setAllJobs(response.content);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách việc làm:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleCategory = (catName) => {
        setSelectedCategories((prev) =>
            prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName],
        );
    };

    const clearFilters = () => {
        setExpFilter('Tất cả');
        setLocationFilter('Địa điểm');
        setKeyword('');
        setSelectedCategories([]);
    };

    // === LOGIC LỌC DỮ LIỆU ===
    const filteredJobs = allJobs.filter((job) => {
        if (job.expired) return false;

        let matchKeyword = true;
        const kw = keyword.toLowerCase();
        if (kw) {
            const matchTitle = job.title?.toLowerCase().includes(kw);
            const matchCompany = job.employerName?.toLowerCase().includes(kw);
            if (searchBy === 'Tên việc làm') matchKeyword = matchTitle;
            else if (searchBy === 'Tên công ty') matchKeyword = matchCompany;
            else matchKeyword = matchTitle || matchCompany;
        }

        let matchLocation = true;
        if (locationFilter !== 'Địa điểm') {
            matchLocation = job.location?.toLowerCase().includes(locationFilter.toLowerCase());
        }

        let matchExp = true;
        if (expFilter !== 'Tất cả') {
            matchExp = job.experienceLevel === expFilter;
        }

        let matchCat = true;
        if (selectedCategories.length > 0) {
            matchCat = selectedCategories.includes(job.category);
        }

        return matchKeyword && matchLocation && matchExp && matchCat;
    });

    // === LOGIC PHÂN TRANG (Cắt mảng đã lọc) ===
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob); // Dữ liệu hiển thị của trang hiện tại

    // Hàm tạo dãy số trang có rút gọn (Ví dụ: 1 2 3 ... 50)
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

    // === HELPER FORMATTERS ===
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
                        {/* Danh mục Dropdown */}
                        <div className="hidden md:flex items-center px-4 border-r border-slate-200 w-[20%] lg:w-[15%]">
                            <Briefcase size={18} className="text-violet-500 mr-2 flex-shrink-0" />
                            <select className="w-full outline-none text-sm text-slate-700 bg-white cursor-pointer font-medium truncate">
                                <option>Tất cả ngành nghề</option>
                                {CATEGORIES.map((c) => (
                                    <option key={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Keyword Input */}
                        <div className="flex items-center px-4 flex-1">
                            <Search size={18} className="text-violet-500 mr-2 flex-shrink-0" />
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Vị trí tuyển dụng, kỹ năng..."
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

                        {/* Location Dropdown */}
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

                        {/* Search Button */}
                        <button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-6 md:px-8 py-2.5 rounded text-sm transition-all whitespace-nowrap shadow-md shadow-indigo-500/20 active:scale-95">
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
                                Tuyển dụng <span className="text-violet-600">{filteredJobs.length}</span> việc làm{' '}
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
                                {keyword && (
                                    <>
                                        <ChevronRight size={14} className="text-slate-400" />
                                        <span className="text-slate-800">{keyword}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm overflow-x-auto pb-2 scrollbar-hide">
                        <span className="text-slate-500 whitespace-nowrap font-medium">Từ khóa gợi ý:</span>
                        <div className="flex gap-2">
                            {suggestedKeywords.map((k) => (
                                <span
                                    key={k}
                                    onClick={() => setKeyword(k)}
                                    className="px-3 py-1.5 bg-slate-100 text-slate-600 font-medium rounded-full cursor-pointer hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-all whitespace-nowrap border border-slate-200"
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
                            {/* Danh mục */}
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 mb-4">Theo danh mục nghề</h4>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {CATEGORIES.map((cat, idx) => (
                                        <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(cat.name)}
                                                onChange={() => toggleCategory(cat.name)}
                                                className="mt-0.5 rounded border-slate-300 bg-white text-violet-600 focus:ring-violet-500 w-4 h-4 transition-colors"
                                            />
                                            <div className="flex-1 flex justify-between text-sm">
                                                <span
                                                    className={`transition-colors ${selectedCategories.includes(cat.name) ? 'text-violet-600 font-medium' : 'text-slate-700 group-hover:text-violet-600'}`}
                                                >
                                                    {cat.name}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Kinh nghiệm */}
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 mb-4">Kinh nghiệm</h4>
                                <div className="space-y-3">
                                    {EXPERIENCES.map((exp, idx) => (
                                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="exp"
                                                value={exp}
                                                checked={expFilter === exp}
                                                onChange={(e) => setExpFilter(e.target.value)}
                                                className="text-violet-600 bg-white border-slate-300 focus:ring-violet-500 w-4 h-4 transition-colors"
                                            />
                                            <span
                                                className={`text-sm transition-colors ${expFilter === exp ? 'text-violet-600 font-medium' : 'text-slate-700 group-hover:text-violet-600'}`}
                                            >
                                                {exp}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <button
                                    onClick={clearFilters}
                                    className="w-full py-2 mt-6 rounded-lg border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 hover:text-slate-700 transition-colors"
                                >
                                    Xóa tất cả bộ lọc
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* RIGHT CONTENT: Job List */}
                    <div className="flex-1">
                        {/* Toolbar: Search By & Sort */}
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 px-1">
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-slate-500 font-medium">Tìm kiếm theo:</span>
                                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-sm">
                                    {['Tên việc làm', 'Tên công ty', 'Cả hai'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setSearchBy(tab)}
                                            className={`px-4 py-1.5 rounded-md font-medium text-sm transition-colors flex items-center gap-1.5
                                                ${searchBy === tab ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white'}`}
                                        >
                                            {searchBy === tab && <Check size={14} />} {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-500 font-medium whitespace-nowrap">Sắp xếp:</span>
                                <select className="bg-white border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-violet-500 font-medium text-slate-700 shadow-sm cursor-pointer min-w-[140px]">
                                    <option>Mới cập nhật</option>
                                    <option>Mức lương cao nhất</option>
                                    <option>Nhiều lượt quan tâm</option>
                                </select>
                            </div>
                        </div>

                        {/* Job Cards List */}
                        {isLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <Loader2 size={40} className="animate-spin text-violet-600" />
                            </div>
                        ) : filteredJobs.length === 0 ? (
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
                                {/* Duyệt qua danh sách ĐÃ ĐƯỢC CẮT THEO TRANG (currentJobs) thay vì filteredJobs */}
                                {currentJobs.map((job) => (
                                    <Link
                                        to={`/jobs/${job.id}`}
                                        key={job.id}
                                        className="group block p-4 sm:p-5 bg-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border border-slate-200 hover:border-violet-400"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Logo */}
                                            <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden p-1 border border-slate-100">
                                                <img
                                                    src={
                                                        job.employerAvatar ||
                                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(job.employerName)}&background=eef2ff&color=4f46e5`
                                                    }
                                                    alt="Logo"
                                                    className="w-full h-full object-contain rounded"
                                                />
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

                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    <span className="bg-slate-50 text-slate-600 border border-slate-200 text-xs px-3 py-1.5 rounded font-medium truncate">
                                                        {job.location}
                                                    </span>
                                                    <span className="bg-slate-50 text-slate-600 border border-slate-200 text-xs px-3 py-1.5 rounded font-medium">
                                                        {job.experienceLevel}
                                                    </span>
                                                    <span className="bg-slate-50 text-slate-600 border border-slate-200 text-xs px-3 py-1.5 rounded font-medium">
                                                        {job.jobType === 'FULL_TIME' ? 'Toàn thời gian' : job.jobType}
                                                    </span>
                                                </div>

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

                        {/* === UI PAGINATION (THANH PHÂN TRANG) === */}
                        {!isLoading && totalPages > 1 && (
                            <div className="mt-10 flex justify-center items-center gap-2">
                                {/* Nút Trước */}
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg border transition-colors ${currentPage === 1 ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:border-violet-500 hover:text-violet-600 bg-white'}`}
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                {/* Dãy số trang */}
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
                                                    ${
                                                        currentPage === page
                                                            ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30 border border-violet-600'
                                                            : 'bg-white border border-slate-200 text-slate-600 hover:border-violet-500 hover:text-violet-600'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ),
                                    )}
                                </div>

                                {/* Nút Sau */}
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
