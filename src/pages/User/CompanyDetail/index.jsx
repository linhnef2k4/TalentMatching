import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    MapPin,
    Globe,
    Briefcase,
    ChevronLeft,
    Loader2,
    Search,
    MessageSquare,
    Heart,
    Building2,
    DollarSign,
    ExternalLink,
    ChevronRight,
    Clock,
    Mail,
    Zap,
} from 'lucide-react';
import companyService from '~/services/companyService';
import { AuthContext } from '~/context/AuthContext';

// Helper: Xử lý mảng bị lỗi định dạng lồng chuỗi từ Backend (VD: ["[\"Java\"]"] -> ["Java"])
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
    const [isFollowing, setIsFollowing] = useState(false);
    const [coverImg] = useState(() => COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)]);

    useEffect(() => {
        const fetchCompanyDetail = async () => {
            setIsLoading(true);
            try {
                const res = await companyService.getCompanyById(id);
                setCompany(res.data || res);
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

        // Backend API chi tiết công ty không có ID chủ sở hữu, lấy từ Job đầu tiên
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

    const formatSalary = (min, max, negotiable) => {
        if (negotiable || (!min && !max)) return 'Thỏa thuận';
        const formatMoney = (val) => (val >= 1000000 ? (val / 1000000).toFixed(0) + ' Tr' : val.toLocaleString());
        return `${formatMoney(min)} - ${formatMoney(max)}`;
    };

    if (isLoading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 size={40} className="animate-spin text-indigo-600" />
            </div>
        );

    return (
        <div className="bg-slate-50 min-h-screen pb-20 font-sans">
            <div className="relative w-full h-[280px] md:h-[350px] bg-slate-900 overflow-hidden">
                <img src={coverImg} alt="Cover" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                <div className="absolute top-6 left-0 w-full z-20 px-6 max-w-7xl mx-auto">
                    <Link
                        to="/companies"
                        className="inline-flex items-center gap-2 text-white font-bold bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 hover:bg-white/30 transition-all"
                    >
                        <ChevronLeft size={18} /> Quay lại
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-24 relative z-30">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-10 mb-8 flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-3xl border-4 border-white shadow-xl flex items-center justify-center p-4 overflow-hidden shrink-0">
                        <img
                            src={
                                company.logoUrl ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=eef2ff&color=4f46e5&bold=true&size=256`
                            }
                            alt="Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{company.name}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-bold">
                            <span className="flex items-center gap-1.5 bg-slate-50 text-slate-600 px-4 py-2 rounded-xl border border-slate-100">
                                <MapPin size={16} className="text-rose-500" /> {company.address}
                            </span>
                            {company.website && company.website !== 'Không có Web' && (
                                <a
                                    href={
                                        company.website.startsWith('http')
                                            ? company.website
                                            : `https://${company.website}`
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl border border-indigo-100"
                                >
                                    <Globe size={16} /> Website
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setIsFollowing(!isFollowing)}
                            className={`flex-1 md:flex-none px-6 py-3.5 rounded-xl font-bold border-2 transition-all ${isFollowing ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300'}`}
                        >
                            <Heart size={18} className={isFollowing ? 'fill-current' : ''} />
                        </button>
                        <button
                            onClick={handleStartChat}
                            className="flex-1 md:flex-none bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <MessageSquare size={18} /> Nhắn tin
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Building2 size={24} className="text-indigo-600" /> Giới thiệu
                            </h2>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-[15px]">
                                {company.description || 'Công ty chưa cập nhật thông tin giới thiệu.'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Briefcase size={22} className="text-indigo-500" /> Việc làm ({totalElements})
                        </h2>
                        {isLoadingJobs ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="animate-spin text-indigo-500" />
                            </div>
                        ) : companyJobs.length === 0 ? (
                            <div className="bg-white p-8 rounded-3xl border border-dashed text-center text-slate-400">
                                Chưa có vị trí tuyển dụng.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {companyJobs.map((job) => (
                                    <Link
                                        to={`/jobs/${job.id}`}
                                        key={job.id}
                                        className="block bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
                                    >
                                        <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-3">
                                            {job.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                                                <DollarSign size={12} />{' '}
                                                {formatSalary(job.salaryMin, job.salaryMax, job.salaryNegotiable)}
                                            </span>
                                            <span className="bg-slate-50 text-slate-500 text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-100 flex items-center gap-1">
                                                <MapPin size={12} /> {job.location.split(',').pop()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                            <span className="text-[10px] font-bold text-indigo-500 uppercase">
                                                {DICTIONARY.JOB_TYPE[job.jobType] || job.jobType}
                                            </span>
                                            <ChevronRight
                                                size={16}
                                                className="text-slate-300 group-hover:text-indigo-500 transition-all"
                                            />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                <button
                                    disabled={page === 0}
                                    onClick={() => setPage(page - 1)}
                                    className="p-2 rounded-lg bg-white border disabled:opacity-30"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="flex items-center px-3 font-bold text-sm">
                                    {page + 1} / {totalPages}
                                </span>
                                <button
                                    disabled={page === totalPages - 1}
                                    onClick={() => setPage(page + 1)}
                                    className="p-2 rounded-lg bg-white border disabled:opacity-30"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDetail;
