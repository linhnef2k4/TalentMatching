import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    MapPin,
    Globe,
    Briefcase,
    ChevronLeft,
    Loader2,
    MessageSquare,
    Building2,
    ChevronRight,
    Clock,
    Users,
    CheckCircle2,
    Bookmark,
    Plus,
} from 'lucide-react';
import companyService from '~/services/companyService';
import { AuthContext } from '~/context/AuthContext';

// Helper: Xử lý mảng bị lỗi
const cleanArrayData = (data) => {
    if (!data) return [];
    try {
        const str = Array.isArray(data) ? data.join('') : data;
        const cleaned = str.replace(/[\[\]"\\]/g, '');
        return cleaned
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    } catch (e) {
        return [];
    }
};

const DICTIONARY = {
    JOB_LEVEL: {
        INTERN: 'Thực tập',
        FRESHER: 'Fresher',
        JUNIOR: 'Junior',
        MIDDLE: 'Middle',
        SENIOR: 'Senior',
        MANAGER: 'Quản lý',
        LEAD: 'Lead',
    },
    JOB_TYPE: {
        FULL_TIME: 'Toàn thời gian',
        PART_TIME: 'Bán thời gian',
        REMOTE: 'Từ xa',
        HYBRID: 'Hybrid',
        INTERNSHIP: 'Thực tập',
    },
};

const COVER_IMAGES = [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1920&q=80',
];

const CompanyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn } = useContext(AuthContext);

    const [company, setCompany] = useState(null);
    const [companyJobs, setCompanyJobs] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingJobs, setIsLoadingJobs] = useState(false);

    // Khởi tạo state isFollowing (nếu API getCompanyById trả về cờ isFollowing thì map vào đây)
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false); // Trạng thái loading khi click follow
    const [coverImg] = useState(() => COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)]);

    useEffect(() => {
        const fetchCompanyDetail = async () => {
            setIsLoading(true);
            try {
                const res = await companyService.getCompanyById(id);
                const data = res.data || res;
                setCompany(data);
                // Giả định backend trả về cờ isFollowing trong chi tiết công ty
                if (data.isFollowing !== undefined) {
                    setIsFollowing(data.isFollowing);
                }
            } catch (error) {
                console.error('Lỗi lấy chi tiết công ty:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCompanyDetail();
    }, [id]);

    useEffect(() => {
        const fetchJobs = async () => {
            setIsLoadingJobs(true);
            try {
                const res = await companyService.getCompanyJobs(id, '', page, 5);
                const data = res.data || res;
                if (data && data.content) {
                    setCompanyJobs(data.content);
                    setTotalPages(data.totalPages || 1);
                    setTotalElements(data.totalElements || 0);
                }
            } catch (error) {
                console.error('Lỗi lấy việc làm:', error);
            } finally {
                setIsLoadingJobs(false);
            }
        };
        if (id) fetchJobs();
    }, [id, page]);

    const handleStartChat = () => {
        if (!isLoggedIn) return alert('Vui lòng đăng nhập!');
        const employerId = companyJobs[0]?.employerId;
        const email = company?.employerEmail;

        if (!employerId || !email) {
            alert('Thông tin liên hệ của nhà tuyển dụng chưa sẵn sàng!');
            return;
        }

        const hrInfo = {
            id: employerId,
            email: email,
            name: company.name,
            avatar: company.logoUrl,
        };

        navigate('/chat', { state: { newContact: hrInfo } });
    };

    // TÍCH HỢP API GỌI TOGGLE FOLLOW
    const handleToggleFollow = async () => {
        if (!isLoggedIn) {
            alert('Vui lòng đăng nhập để theo dõi công ty!');
            navigate('/login');
            return;
        }

        setIsFollowLoading(true);
        try {
            await companyService.toggleFollowCompany(id);
            setIsFollowing(!isFollowing); // Đảo trạng thái nếu API thành công
        } catch (error) {
            console.error('Lỗi khi follow công ty:', error);
            alert('Có lỗi xảy ra, vui lòng thử lại sau!');
        } finally {
            setIsFollowLoading(false);
        }
    };

    const formatSalary = (min, max, negotiable) => {
        if (negotiable || (!min && !max)) return 'Thỏa thuận';
        const formatMoney = (val) => (val >= 1000000 ? (val / 1000000).toFixed(0) + ' Tr' : val.toLocaleString());
        return `${formatMoney(min)} - ${formatMoney(max)}`;
    };

    if (isLoading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff]">
                <Loader2 size={40} className="animate-spin text-[#0F4C5C]" />
            </div>
        );

    if (!company) {
        return (
            <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-[#40484b] font-bold space-y-4">
                <Building2 size={64} className="text-[#c0c8cb]" />
                <p>Không tìm thấy thông tin công ty!</p>
                <Link to="/companies" className="text-[#0F4C5C] hover:underline">
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#f8f9ff] min-h-screen font-sans text-[#0b1c30] pb-24">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
                {/* NÚT BACK */}
                <Link
                    to="/companies"
                    className="inline-flex items-center gap-2 text-[#40484b] hover:text-[#0F4C5C] font-bold transition-colors"
                >
                    <ChevronLeft size={18} /> Quay lại danh sách
                </Link>

                {/* COMPANY HERO PROFILE */}
                <section className="relative rounded-2xl overflow-hidden shadow-xl shadow-slate-200/60 border border-[#c0c8cb]/50 bg-white">
                    <div className="h-56 md:h-72 w-full relative overflow-hidden bg-slate-100">
                        <img src={coverImg} alt="Cover" className="object-cover w-full h-full" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent"></div>
                    </div>

                    <div className="px-6 md:px-10 pb-8 pt-0 relative z-10 -mt-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        {/* Avatar & Title */}
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                            <div className="w-32 h-32 rounded-xl bg-white shadow-lg border-4 border-white overflow-hidden flex items-center justify-center p-2 relative z-20 shrink-0">
                                <img
                                    src={
                                        company.logoUrl ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=f8f9ff&color=0F4C5C&bold=true&size=256`
                                    }
                                    alt="Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="mb-2">
                                <h1 className="text-3xl md:text-4xl font-black text-[#0b1c30] mb-2 tracking-tight drop-shadow-sm">
                                    {company.name}
                                </h1>
                                <p className="text-lg font-semibold text-[#40484b] flex items-center justify-center md:justify-start gap-2">
                                    <Building2 size={20} className="text-[#0F4C5C]" />
                                    Doanh nghiệp
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-center gap-3 md:mb-4">
                            <button
                                onClick={handleToggleFollow}
                                disabled={isFollowLoading}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all border-2 disabled:opacity-70 ${
                                    isFollowing
                                        ? 'bg-[#e5eeff] text-[#0F4C5C] border-[#0F4C5C]'
                                        : 'bg-white text-[#0F4C5C] border-[#0F4C5C] hover:bg-[#e5eeff]'
                                }`}
                            >
                                {isFollowLoading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : isFollowing ? (
                                    <CheckCircle2 size={18} className="fill-current text-white" />
                                ) : (
                                    <Plus size={18} />
                                )}
                                {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                            </button>
                            <button
                                onClick={handleStartChat}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0F4C5C] text-white font-bold hover:bg-[#003441] transition-all active:scale-95 shadow-md"
                            >
                                <MessageSquare size={18} />
                                Nhắn tin HR
                            </button>
                        </div>
                    </div>

                    {/* Company Info Grid */}
                    <div className="px-6 md:px-10 pb-10 pt-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Giới thiệu */}
                        <div className="md:col-span-2 space-y-4">
                            <h2 className="text-2xl font-bold text-[#0b1c30] border-b border-[#c0c8cb]/30 pb-3">
                                Giới thiệu công ty
                            </h2>
                            <p className="text-[#40484b] leading-relaxed font-medium whitespace-pre-wrap">
                                {company.description ||
                                    'Công ty chưa cập nhật thông tin giới thiệu chi tiết. Vui lòng liên hệ trực tiếp với Nhà tuyển dụng để biết thêm thông tin.'}
                            </p>
                        </div>

                        {/* Chi tiết liên hệ */}
                        <div className="space-y-4 bg-[#f8f9ff] px-6 py-6 rounded-xl border border-[#c0c8cb]/30 shadow-sm">
                            <h3 className="text-xs font-bold text-[#40484b] uppercase tracking-widest mb-4">
                                Thông tin liên hệ
                            </h3>
                            <ul className="space-y-4 text-sm font-medium text-[#0b1c30]">
                                <li className="flex items-start gap-3">
                                    <MapPin size={20} className="text-[#70787c] shrink-0" />
                                    <span>
                                        {company.address || 'Chưa cập nhật địa chỉ'} <br />
                                        {company.address && (
                                            <span className="text-slate-400 text-xs mt-1 block">Trụ sở chính</span>
                                        )}
                                    </span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Globe size={20} className="text-[#70787c] shrink-0" />
                                    {company.website && company.website !== 'Không có Web' ? (
                                        <a
                                            href={
                                                company.website.startsWith('http')
                                                    ? company.website
                                                    : `https://${company.website}`
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[#006b5f] hover:underline font-bold"
                                        >
                                            {company.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    ) : (
                                        <span className="text-[#70787c]">Chưa cập nhật Website</span>
                                    )}
                                </li>
                                <li className="flex items-center gap-3">
                                    <Users size={20} className="text-[#70787c] shrink-0" />
                                    <span>Quy mô: Tùy theo dự án</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* CURRENT OPENINGS (VIỆC LÀM ĐANG TUYỂN) */}
                <section className="space-y-6 pt-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#c0c8cb]/30 pb-4 gap-4">
                        <h2 className="text-2xl font-bold text-[#0b1c30] flex items-center gap-2">
                            Việc làm đang tuyển
                            <span className="bg-[#e5eeff] text-[#0F4C5C] text-sm px-3 py-1 rounded-full font-bold">
                                {totalElements}
                            </span>
                        </h2>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#40484b]">Sắp xếp:</span>
                            <select className="bg-white border border-[#c0c8cb] rounded-md py-1.5 px-3 text-sm font-bold text-[#0b1c30] focus:border-[#0F4C5C] focus:ring-1 focus:ring-[#0F4C5C] outline-none cursor-pointer shadow-sm">
                                <option>Mới nhất</option>
                                <option>Lương (Cao xuống thấp)</option>
                            </select>
                        </div>
                    </div>

                    {isLoadingJobs ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-[#0F4C5C]" size={32} />
                        </div>
                    ) : companyJobs.length === 0 ? (
                        <div className="bg-white p-10 rounded-xl border border-dashed border-[#c0c8cb] text-center text-[#70787c] font-medium">
                            Hiện tại công ty chưa có vị trí tuyển dụng nào mở.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {companyJobs.map((job) => (
                                <div
                                    key={job.id}
                                    onClick={() => navigate(`/jobs/${job.id}`)}
                                    className="bg-white rounded-xl border border-[#c0c8cb]/40 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group flex flex-col justify-between cursor-pointer"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-[#0b1c30] group-hover:text-[#0F4C5C] transition-colors line-clamp-1">
                                                    {job.title}
                                                </h3>
                                                <p className="text-sm font-medium text-[#40484b] mt-1 flex items-center gap-1.5">
                                                    <MapPin size={14} className="text-[#70787c]" />
                                                    {job.location}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); /* Hàm lưu job ở đây nếu cần */
                                                }}
                                                className="text-[#70787c] hover:text-[#006b5f] transition-colors p-1"
                                            >
                                                <Bookmark size={22} />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            <span className="px-3 py-1 bg-[#f8f9ff] text-[#40484b] border border-[#c0c8cb]/30 rounded-md text-[11px] font-bold uppercase tracking-wide">
                                                {DICTIONARY.JOB_TYPE[job.jobType] || job.jobType}
                                            </span>
                                            <span className="px-3 py-1 bg-[#e5eeff] text-[#0f4c5c] rounded-md text-[11px] font-bold uppercase tracking-wide">
                                                {DICTIONARY.JOB_LEVEL[job.jobLevel] || job.jobLevel}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-[#c0c8cb]/30 mt-auto">
                                        <div className="text-[#006b5f] font-black text-lg">
                                            {formatSalary(job.salaryMin, job.salaryMax, job.salaryNegotiable)}
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-400 group-hover:text-[#0F4C5C] transition-colors">
                                            <span className="text-xs font-bold uppercase">Xem chi tiết</span>
                                            <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 pt-8">
                            <button
                                disabled={page === 0}
                                onClick={() => setPage(page - 1)}
                                className="px-5 py-2 border border-[#c0c8cb] rounded-lg font-bold text-[#40484b] bg-white hover:bg-[#f8f9ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            <span className="text-sm font-bold text-[#40484b]">
                                Trang {page + 1} / {totalPages}
                            </span>
                            <button
                                disabled={page === totalPages - 1}
                                onClick={() => setPage(page + 1)}
                                className="px-5 py-2 border border-[#c0c8cb] rounded-lg font-bold text-[#0b1c30] bg-white hover:bg-[#f8f9ff] hover:border-[#0F4C5C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default CompanyDetail;
