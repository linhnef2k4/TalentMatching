import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, ChevronLeft, ChevronRight, Building2, Loader2, ArrowRight } from 'lucide-react';
import companyService from '~/services/companyService';

const BANNERS = [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=80',
    'https://plus.unsplash.com/premium_photo-1681487178876-a1156952ec60?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1920&q=80',
];

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [keyword, setKeyword] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentSlide, setCurrentSlide] = useState(0);

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

    useEffect(() => {
        const fetchCompanies = async () => {
            setIsLoading(true);
            try {
                const response = await companyService.getCompanies(keyword, page, 12);
                if (response && response.content) {
                    setCompanies(response.content);
                    setTotalPages(response.totalPages);
                } else if (Array.isArray(response)) {
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

    const executeSearch = () => {
        setKeyword(searchInput);
        setPage(0);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            executeSearch();
        }
    };

    // Đã thay đổi: Dùng các màu khối (solid) rõ ràng, đậm đà thay cho gradient màu nhạt
    const getCardBannerPattern = (id) => {
        const patterns = [
            'bg-blue-600',
            'bg-teal-600',
            'bg-rose-600',
            'bg-amber-600',
            'bg-indigo-600',
            'bg-emerald-600',
        ];
        return patterns[(id || 0) % patterns.length];
    };

    return (
        <div className="bg-slate-100 font-sans min-h-screen pb-20">
            {/* 1. HERO SECTION */}
            <div className="relative w-full h-[320px] md:h-[480px] overflow-hidden group shadow-md">
                <div
                    className="flex w-full h-full transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {BANNERS.map((banner, index) => (
                        <div key={index} className="w-full h-full flex-shrink-0 relative">
                            <img src={banner} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
                            {/* Overlay dùng màu tối solid hơn để chữ nổi bật */}
                            <div className="absolute inset-0 bg-slate-900/70"></div>
                        </div>
                    ))}
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none z-10">
                    <span className="px-5 py-2 rounded-full bg-indigo-600 text-white text-sm font-bold tracking-wider mb-6 shadow-lg border-2 border-indigo-500">
                        MÔI TRƯỜNG LÀM VIỆC LÝ TƯỞNG
                    </span>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 drop-shadow-2xl tracking-tight leading-tight">
                        Định hình tương lai tại <br /> các <span className="text-amber-400">Tập đoàn hàng đầu</span>
                    </h1>
                    <p className="text-lg text-slate-100 drop-shadow-lg max-w-2xl font-medium">
                        Tra cứu thông tin, khám phá văn hóa và tìm kiếm cơ hội nghề nghiệp tại những doanh nghiệp phù
                        hợp nhất với bạn.
                    </p>
                </div>

                <button
                    onClick={prevSlide}
                    className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-xl z-20"
                >
                    <ChevronLeft size={28} />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-xl z-20"
                >
                    <ChevronRight size={28} />
                </button>

                <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-3 z-20">
                    {BANNERS.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`transition-all duration-300 rounded-full shadow-md ${
                                currentSlide === index ? 'w-10 h-3 bg-amber-400' : 'w-3 h-3 bg-white/60 hover:bg-white'
                            }`}
                        ></button>
                    ))}
                </div>
            </div>

            {/* 2. THANH TÌM KIẾM */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-30 -mt-10">
                <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2 focus-within:ring-2 focus-within:ring-indigo-500">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" size={24} />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Nhập tên công ty để tra cứu thông tin..."
                            className="w-full pl-12 pr-4 py-4 bg-transparent rounded-xl text-slate-900 focus:outline-none placeholder:text-slate-500 font-semibold text-base"
                        />
                    </div>
                    {/* Đã thay đổi: Bỏ gradient, dùng màu xanh đậm nguyên khối, thêm shadow nổi */}
                    <button
                        onClick={executeSearch}
                        className="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        Tìm kiếm <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            {/* 3. MAIN CONTENT */}
            <main className="max-w-7xl mx-auto px-6 pt-20">
                <div className="flex items-center justify-center gap-4 mb-12">
                    <div className="h-1 bg-indigo-600 flex-1 max-w-[60px] rounded-full"></div>
                    <h2 className="text-base font-extrabold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                        <Building2 size={22} className="text-indigo-600" /> Danh sách doanh nghiệp nổi bật
                    </h2>
                    <div className="h-1 bg-indigo-600 flex-1 max-w-[60px] rounded-full"></div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-600 gap-4 bg-white rounded-2xl border border-slate-200 shadow-md">
                        <Loader2 size={48} className="animate-spin text-indigo-600" />
                        <span className="font-bold text-xl">Đang tải dữ liệu doanh nghiệp...</span>
                    </div>
                ) : companies.length === 0 ? (
                    <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center shadow-md">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Search size={40} className="text-slate-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy kết quả</h3>
                        <p className="text-slate-600 max-w-md mx-auto text-lg font-medium">
                            Chúng tôi không tìm thấy công ty nào phù hợp với từ khóa "
                            <strong className="text-indigo-600">{keyword}</strong>". Vui lòng thử một từ khóa khác.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {companies.map((company) => (
                            <Link
                                to={`/companies/${company.id}`}
                                key={company.id}
                                // Đã thay đổi: Tăng cường Base Shadow và Hover Shadow cho card
                                className="group bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full overflow-hidden relative cursor-pointer"
                            >
                                {/* Banner Card: Solid color thay vì gradient nhạt */}
                                <div className={`h-24 ${getCardBannerPattern(company.id)} relative shrink-0`}>
                                    {/* Texture mờ màu trắng để không làm mất màu gốc */}
                                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-screen"></div>
                                </div>

                                <div className="px-6 pb-6 flex-1 flex flex-col relative">
                                    {/* Logo có đổ bóng đậm hơn */}
                                    <div className="w-20 h-20 bg-white rounded-xl border-2 border-slate-100 shadow-lg mx-auto -mt-10 mb-4 flex items-center justify-center p-2 z-10 group-hover:scale-105 transition-transform duration-300">
                                        <img
                                            src={
                                                company.logoUrl ||
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=4f46e5&color=fff&bold=true`
                                            }
                                            alt={company.name}
                                            className="w-full h-full object-contain rounded-lg"
                                        />
                                    </div>

                                    <div className="text-center flex-1 flex flex-col">
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-2 mb-2">
                                            {company.name}
                                        </h3>
                                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-6 flex-1">
                                            {company.shortDescription ||
                                                company.description ||
                                                'Khám phá thêm về môi trường làm việc và cơ hội nghề nghiệp tại công ty này.'}
                                        </p>

                                        <div className="mt-auto space-y-4">
                                            {/* Thẻ địa chỉ đổi thành viền/nền đậm hơn một chút */}
                                            <div className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-slate-700 bg-slate-100 py-2.5 px-3 rounded-xl border border-slate-200">
                                                <MapPin size={16} className="flex-shrink-0 text-rose-500" />
                                                <span className="line-clamp-1">
                                                    {company.address || 'Đang cập nhật địa điểm'}
                                                </span>
                                            </div>

                                            {/* Nút Xem chi tiết: Đổi từ màu nhạt sang Solid Color */}
                                            <div className="w-full py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl group-hover:bg-indigo-700 transition-colors duration-300 shadow-md">
                                                Xem chi tiết
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* 4. PAGINATION */}
                {!isLoading && totalPages > 1 && (
                    <div className="mt-16 flex items-center justify-center gap-3">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(page - 1)}
                            className="w-11 h-11 flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-600 hover:bg-indigo-50 hover:border-indigo-600 hover:text-indigo-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                        >
                            <ChevronLeft size={22} />
                        </button>

                        {[...Array(totalPages)].map((_, i) => {
                            if (i === 0 || i === totalPages - 1 || (i >= page - 1 && i <= page + 1)) {
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i)}
                                        className={`w-11 h-11 flex items-center justify-center rounded-xl font-bold transition-all text-base shadow-sm border-2
                                            ${
                                                page === i
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/40' // Bỏ gradient, dùng solid color
                                                    : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-600 hover:text-indigo-600'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            } else if (i === page - 2 || i === page + 2) {
                                return (
                                    <span key={i} className="text-slate-400 px-1 font-bold">
                                        ...
                                    </span>
                                );
                            }
                            return null;
                        })}

                        <button
                            disabled={page === totalPages - 1}
                            onClick={() => setPage(page + 1)}
                            className="w-11 h-11 flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-600 hover:bg-indigo-50 hover:border-indigo-600 hover:text-indigo-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                        >
                            <ChevronRight size={22} />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Companies;
