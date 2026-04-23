import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, ChevronLeft, ChevronRight, Building2, Loader2, ArrowRight } from 'lucide-react';
import companyService from '~/services/companyService';

// Mảng 6 ảnh chất lượng cao từ Unsplash về chủ đề văn phòng, công nghệ, làm việc nhóm
const BANNERS = [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1920&q=80',
];

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // States cho Tìm kiếm & Phân trang
    const [keyword, setKeyword] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // State cho Banner Slider
    const [currentSlide, setCurrentSlide] = useState(0);

    // Xử lý tự động chuyển slide mỗi 4 giây
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1));
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1));
    };

    // Gọi API lấy danh sách công ty
    useEffect(() => {
        const fetchCompanies = async () => {
            setIsLoading(true);
            try {
                // Gọi API truyền keyword, page, và size (mặc định 12)
                const response = await companyService.getCompanies(keyword, page, 12);

                // Response trả về chứa 'content' (mảng) và 'totalPages' theo chuẩn Spring Data JPA
                if (response && response.content) {
                    setCompanies(response.content);
                    setTotalPages(response.totalPages);
                } else if (Array.isArray(response)) {
                    // Fallback đề phòng backend trả về mảng trực tiếp
                    setCompanies(response);
                    setTotalPages(1);
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách công ty:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCompanies();
    }, [keyword, page]);

    // Xử lý tìm kiếm
    const executeSearch = () => {
        setKeyword(searchInput);
        setPage(0); // Reset về trang đầu khi tìm kiếm mới
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            executeSearch();
        }
    };

    return (
        <div className="bg-slate-50 font-sans min-h-screen pb-20">
            {/* ========================================================= */}
            {/* 1. HERO SECTION (BANNER CAROUSEL) */}
            {/* ========================================================= */}
            <div className="relative w-full h-[320px] md:h-[480px] overflow-hidden group">
                <div
                    className="flex w-full h-full transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {BANNERS.map((banner, index) => (
                        <div key={index} className="w-full h-full flex-shrink-0 relative">
                            <img src={banner} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-violet-950/40 to-transparent"></div>
                        </div>
                    ))}
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none z-10">
                    <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold tracking-wider mb-6 shadow-lg">
                        MÔI TRƯỜNG LÀM VIỆC LÝ TƯỞNG
                    </span>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 drop-shadow-xl tracking-tight leading-tight">
                        Định hình tương lai tại <br /> các <span className="text-violet-300">Tập đoàn hàng đầu</span>
                    </h1>
                    <p className="text-lg text-slate-200 drop-shadow-md max-w-2xl font-medium">
                        Tra cứu thông tin, khám phá văn hóa và tìm kiếm cơ hội nghề nghiệp tại những doanh nghiệp phù
                        hợp nhất với bạn.
                    </p>
                </div>

                <button
                    onClick={prevSlide}
                    className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/20 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-lg z-20"
                >
                    <ChevronLeft size={28} />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/20 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-lg z-20"
                >
                    <ChevronRight size={28} />
                </button>

                <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2.5 z-20">
                    {BANNERS.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`transition-all duration-300 rounded-full ${
                                currentSlide === index
                                    ? 'w-9 h-3 bg-violet-500 shadow-md'
                                    : 'w-3 h-3 bg-white/60 hover:bg-white'
                            }`}
                        ></button>
                    ))}
                </div>
            </div>

            {/* ========================================================= */}
            {/* 2. THANH TÌM KIẾM (NỔI ĐÈ LÊN BOTTOM CỦA BANNER) */}
            {/* ========================================================= */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-30 -mt-10">
                <div className="bg-white p-2 rounded-2xl shadow-xl shadow-indigo-500/10 border border-slate-100 flex flex-col sm:flex-row items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-violet-500/30">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" size={22} />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Nhập tên công ty để tra cứu thông tin..."
                            className="w-full pl-12 pr-4 py-4 bg-transparent rounded-xl text-slate-800 focus:outline-none placeholder:text-slate-400 font-medium text-base"
                        />
                    </div>
                    <button
                        onClick={executeSearch}
                        className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        Tìm kiếm <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 3. MAIN CONTENT (DANH SÁCH CÔNG TY) */}
            {/* ========================================================= */}
            <main className="max-w-7xl mx-auto px-6 pt-24">
                <div className="flex items-center justify-center gap-4 mb-14">
                    <div className="h-px bg-indigo-200 flex-1 max-w-[100px]"></div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-900 flex items-center gap-2.5 bg-indigo-50/50 px-6 py-2.5 rounded-full border border-indigo-100 shadow-sm">
                        <Building2 size={18} className="text-violet-600" /> Danh sách doanh nghiệp nổi bật
                    </h2>
                    <div className="h-px bg-indigo-200 flex-1 max-w-[100px]"></div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <Loader2 size={40} className="animate-spin text-violet-600" />
                        <span className="font-medium text-lg">Đang tải dữ liệu doanh nghiệp...</span>
                    </div>
                ) : companies.length === 0 ? (
                    <div className="bg-white p-16 rounded-3xl border border-dashed border-slate-300 text-center shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search size={40} className="text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy kết quả</h3>
                        <p className="text-slate-500 max-w-md mx-auto text-lg">
                            Chúng tôi không tìm thấy công ty nào phù hợp với từ khóa "
                            <strong className="text-violet-600">{keyword}</strong>". Vui lòng thử một từ khóa khác.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                        {companies.map((company) => (
                            <div
                                key={company.id}
                                className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full overflow-hidden relative"
                            >
                                <div className="h-28 bg-gradient-to-r from-violet-100 to-indigo-100 relative shrink-0">
                                    <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                </div>

                                <div className="px-6 pb-6 flex-1 flex flex-col relative">
                                    {/* Logo Company */}
                                    <div className="w-20 h-20 bg-white rounded-2xl border-4 border-white shadow-lg mx-auto -mt-10 mb-4 flex items-center justify-center p-2 z-10 group-hover:scale-105 transition-transform duration-300">
                                        <img
                                            src={
                                                company.logoUrl ||
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=eef2ff&color=4f46e5&bold=true`
                                            }
                                            alt={company.name}
                                            className="w-full h-full object-contain rounded-xl"
                                        />
                                    </div>

                                    {/* Thông tin chính */}
                                    <div className="text-center flex-1 flex flex-col">
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-700 transition-colors line-clamp-2 mb-2 px-2 h-14 flex items-center justify-center">
                                            {company.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                                            {company.shortDescription ||
                                                'Khám phá thêm về môi trường làm việc và cơ hội nghề nghiệp tại công ty này.'}
                                        </p>

                                        <div className="mt-auto space-y-4 pt-4 border-t border-slate-50">
                                            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 py-2.5 px-3 rounded-lg border border-slate-100">
                                                <MapPin size={14} className="flex-shrink-0 text-indigo-500" />
                                                <span className="line-clamp-1">
                                                    {company.address || 'Đang cập nhật địa điểm'}
                                                </span>
                                            </div>

                                            <Link to={`/companies/${company.id}`} className="block">
                                                <button className="w-full py-2.5 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-xl hover:bg-gradient-to-r hover:from-violet-600 hover:to-indigo-600 hover:text-white transition-all shadow-sm active:scale-95 border border-indigo-100 hover:border-transparent">
                                                    Xem chi tiết
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ========================================================= */}
                {/* 3. PAGINATION */}
                {/* ========================================================= */}
                {!isLoading && totalPages > 1 && (
                    <div className="mt-16 flex items-center justify-center gap-2">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(page - 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {[...Array(totalPages)].map((_, i) => {
                            // Logic rút gọn số trang (hiển thị trang hiện tại và vài trang xung quanh)
                            if (i === 0 || i === totalPages - 1 || (i >= page - 1 && i <= page + 1)) {
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i)}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all text-sm shadow-sm
                                            ${
                                                page === i
                                                    ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-indigo-500/30 border-none'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            } else if (i === page - 2 || i === page + 2) {
                                return (
                                    <span key={i} className="text-slate-400 px-1">
                                        ...
                                    </span>
                                );
                            }
                            return null;
                        })}

                        <button
                            disabled={page === totalPages - 1}
                            onClick={() => setPage(page + 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Companies;
