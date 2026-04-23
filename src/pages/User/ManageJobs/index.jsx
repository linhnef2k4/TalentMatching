import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Briefcase,
    Bookmark,
    Clock,
    Eye,
    CheckCircle2,
    XCircle,
    Send,
    Trash2,
    MapPin,
    DollarSign,
    Building2,
    Loader2,
    BadgeCheck,
    Sparkles,
    Users,
    BrainCircuit,
    FileText,
    BarChart2,
} from 'lucide-react';
import jobService from '~/services/jobService';
import applicationService from '~/services/applicationService';

const ManageJobs = () => {
    const [activeTab, setActiveTab] = useState('applied');

    const [appliedJobs, setAppliedJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [stats, setStats] = useState(null); // Thêm State lưu thống kê
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMyData = async () => {
            setIsLoading(true);

            // Xử lý song song cả 3 API: Applied, Saved, Stats
            try {
                const applicationsPromise = applicationService.getMyApplications(0, 10).catch((err) => {
                    console.error('Lỗi API getMyApplications:', err);
                    return null;
                });

                const savedJobsPromise = jobService.getSavedJobs(0, 10).catch((err) => {
                    console.error('Lỗi API getSavedJobs:', err);
                    return null;
                });

                const statsPromise = applicationService.getStats().catch((err) => {
                    console.error('Lỗi API getStats:', err);
                    return null;
                });

                const [applicationsRes, savedJobsRes, statsRes] = await Promise.all([
                    applicationsPromise,
                    savedJobsPromise,
                    statsPromise,
                ]);

                // Xử lý data Ứng tuyển
                if (applicationsRes && applicationsRes.content) {
                    setAppliedJobs(applicationsRes.content);
                } else if (applicationsRes && Array.isArray(applicationsRes)) {
                    setAppliedJobs(applicationsRes);
                }

                // Xử lý data Lưu
                if (savedJobsRes && savedJobsRes.content) {
                    setSavedJobs(savedJobsRes.content);
                } else if (savedJobsRes && Array.isArray(savedJobsRes)) {
                    setSavedJobs(savedJobsRes);
                }

                // Xử lý data Thống kê
                if (statsRes) {
                    // Tùy thuộc vào axios config, có thể cần truy cập statsRes.data
                    setStats(statsRes.data || statsRes);
                }
            } catch (error) {
                console.error('Lỗi nghiêm trọng khi fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyData();
    }, []);

    const handleRemoveSavedJob = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await jobService.toggleSaveJob(id);
            setSavedJobs(savedJobs.filter((job) => job.id !== id));
        } catch (error) {
            console.error('Lỗi khi bỏ lưu:', error);
            alert('Có lỗi xảy ra, vui lòng thử lại!');
        }
    };

    const formatSalary = (min, max) => {
        if (!min && !max) return 'Thỏa thuận';
        if (min && !max) return `Từ ${min} Tr`;
        if (!min && max) return `Tới ${max} Tr`;
        return `${min} - ${max} Tr`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getFileNameFromUrl = (url) => {
        if (!url) return 'Hồ sơ đính kèm';
        const parts = url.split('/');
        return parts[parts.length - 1].split('?')[0].substring(0, 20) + '...';
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'REVIEWING':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
                        <Eye size={14} /> NTD đang xem
                    </span>
                );
            case 'INTERVIEW':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-200">
                        <Users size={14} /> Mời phỏng vấn
                    </span>
                );
            case 'ACCEPTED':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200">
                        <CheckCircle2 size={14} /> Chấp nhận
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-200">
                        <XCircle size={14} /> Không phù hợp
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg border border-gray-200">
                        <Clock size={14} /> Chờ duyệt
                    </span>
                );
        }
    };

    return (
        <div className="bg-slate-50 min-h-[calc(100vh-64px)] font-sans pb-20">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 border-b border-gray-200 pt-12 pb-0 shadow-lg relative overflow-hidden">
                {/* ẢNH NỀN */}
                <img
                    src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
                    alt="background"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* OVERLAY GIÚP ĐỌC CHỮ */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-indigo-900/80 backdrop-blur-[2px]" />
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
                    <h1 className="text-3xl font-extrabold text-white mb-3 flex items-center gap-3 drop-shadow-sm">
                        <BarChart2 className="text-blue-300" size={32} />
                        Quản lý việc làm của bạn
                    </h1>
                    <p className="text-blue-100 mb-8 text-lg font-medium">
                        Theo dõi tiến trình ứng tuyển và các cơ hội nghề nghiệp bạn đã lưu lại.
                    </p>

                    {/* STATS DASHBOARD GRID */}
                    {stats && !isLoading && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-10">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col justify-center">
                                <div className="text-blue-200 mb-1">
                                    <Briefcase size={20} />
                                </div>
                                <div className="text-2xl font-black text-white mb-0.5">{stats.totalApplied}</div>
                                <div className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
                                    Đã ứng tuyển
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col justify-center">
                                <div className="text-gray-300 mb-1">
                                    <Clock size={20} />
                                </div>
                                <div className="text-2xl font-black text-white mb-0.5">{stats.pendingCount}</div>
                                <div className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
                                    Chờ phản hồi
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col justify-center">
                                <div className="text-purple-300 mb-1">
                                    <Users size={20} />
                                </div>
                                <div className="text-2xl font-black text-white mb-0.5">{stats.interviewCount}</div>
                                <div className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
                                    Phỏng vấn
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col justify-center">
                                <div className="text-green-300 mb-1">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div className="text-2xl font-black text-white mb-0.5">{stats.acceptedCount}</div>
                                <div className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
                                    Trúng tuyển
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col justify-center col-span-2 md:col-span-1">
                                <div className="text-red-300 mb-1">
                                    <XCircle size={20} />
                                </div>
                                <div className="text-2xl font-black text-white mb-0.5">{stats.rejectedCount}</div>
                                <div className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
                                    Từ chối
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TABS */}
                    <div className="flex gap-2 border-b-0 translate-y-[1px]">
                        <button
                            onClick={() => setActiveTab('applied')}
                            className={`px-6 py-3.5 text-sm font-bold flex items-center gap-2 rounded-t-xl transition-all border border-b-0
                                ${
                                    activeTab === 'applied'
                                        ? 'bg-slate-50 text-indigo-700 border-slate-200'
                                        : 'bg-white/10 text-blue-100 border-transparent hover:bg-white/20 backdrop-blur-md'
                                }`}
                        >
                            <Send size={18} /> Việc đã ứng tuyển
                        </button>
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`px-6 py-3.5 text-sm font-bold flex items-center gap-2 rounded-t-xl transition-all border border-b-0
                                ${
                                    activeTab === 'saved'
                                        ? 'bg-slate-50 text-indigo-700 border-slate-200'
                                        : 'bg-white/10 text-blue-100 border-transparent hover:bg-white/20 backdrop-blur-md'
                                }`}
                        >
                            <Bookmark size={18} /> Việc đã lưu
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 size={40} className="animate-spin text-blue-600" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* TAB: VIỆC ĐÃ ỨNG TUYỂN */}
                        {activeTab === 'applied' && (
                            <>
                                {appliedJobs.length > 0 ? (
                                    appliedJobs.map((app) => (
                                        <Link to={`/jobs/${app.jobId}`} key={app.id} className="block group">
                                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="font-extrabold text-xl text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                                                            {app.jobTitle}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mb-4">
                                                            <span className="flex items-center gap-1.5">
                                                                <Clock size={16} className="text-gray-400" /> Nộp lúc:{' '}
                                                                <strong className="text-gray-700">
                                                                    {formatDate(app.appliedAt)}
                                                                </strong>
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <FileText size={16} className="text-gray-400" /> CV đính
                                                                kèm:{' '}
                                                                <span className="text-blue-600 font-medium hover:underline">
                                                                    {getFileNameFromUrl(app.cvUrl)}
                                                                </span>
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            {renderStatusBadge(app.status)}
                                                            {app.matchScore !== null && (
                                                                <span className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-lg border border-yellow-200">
                                                                    <Sparkles size={14} /> Phù hợp: {app.matchScore}%
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {(app.notes || app.aiAnalysis?.ai_analysis?.final_verdict) && (
                                                    <div
                                                        className={`mt-5 p-4 rounded-xl border text-sm leading-relaxed ${app.status === 'ACCEPTED' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}
                                                    >
                                                        {app.notes ? (
                                                            <>
                                                                <strong className="font-bold">Phản hồi từ NTD:</strong>{' '}
                                                                {app.notes}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <strong className="font-bold flex items-center gap-1.5 mb-1">
                                                                    <BrainCircuit size={16} /> Kết luận AI:
                                                                </strong>{' '}
                                                                {app.aiAnalysis.ai_analysis.final_verdict}
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="bg-white rounded-3xl border border-gray-200 border-dashed p-16 flex flex-col items-center justify-center text-center">
                                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-5">
                                            <Send size={40} className="text-blue-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            Bạn chưa ứng tuyển công việc nào
                                        </h3>
                                        <p className="text-gray-500 mb-8 max-w-md">
                                            Hàng ngàn cơ hội hấp dẫn đang chờ đón. Hãy bắt đầu hành trình tìm việc ngay
                                            hôm nay!
                                        </p>
                                        <Link to="/jobs">
                                            <button className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all">
                                                Khám phá việc làm
                                            </button>
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}

                        {/* TAB: VIỆC ĐÃ LƯU */}
                        {activeTab === 'saved' && (
                            <>
                                {savedJobs.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-6">
                                        {savedJobs.map((job) => (
                                            <Link to={`/jobs/${job.id}`} key={job.id} className="block group">
                                                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 relative flex flex-col">
                                                    <button
                                                        onClick={(e) => handleRemoveSavedJob(e, job.id)}
                                                        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
                                                        title="Bỏ lưu"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>

                                                    <div className="absolute top-6 right-20 bg-purple-50 text-purple-700 font-extrabold text-sm px-4 py-2 rounded-lg border border-purple-100">
                                                        {formatSalary(job.salaryMin, job.salaryMax)}
                                                    </div>

                                                    <div className="flex items-start gap-5 pr-48">
                                                        <div className="w-[72px] h-[72px] rounded-xl border border-gray-100 bg-white p-1.5 flex-shrink-0 shadow-sm">
                                                            <img
                                                                src={
                                                                    job.employerAvatar ||
                                                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(job.employerName || 'CP')}&background=f0fdf4&color=059669`
                                                                }
                                                                alt="Logo"
                                                                className="w-full h-full object-contain rounded-lg"
                                                            />
                                                        </div>

                                                        <div className="flex-1">
                                                            <h3 className="font-extrabold text-xl text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1.5">
                                                                {job.title}
                                                            </h3>
                                                            <p className="text-gray-600 text-sm font-medium flex items-center gap-1.5 mb-4">
                                                                {job.employerName}
                                                                <BadgeCheck className="text-blue-500" size={16} />
                                                            </p>

                                                            <div className="flex flex-wrap gap-2.5">
                                                                <span className="bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                                                    <MapPin size={14} className="text-gray-400" />{' '}
                                                                    {job.location.split(',').pop().trim()}
                                                                </span>
                                                                {job.experienceLevel && (
                                                                    <span className="bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg truncate max-w-[200px]">
                                                                        {job.experienceLevel}
                                                                    </span>
                                                                )}
                                                                <span className="bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg uppercase tracking-wider">
                                                                    {job.jobType === 'FULL_TIME'
                                                                        ? 'TOÀN THỜI GIAN'
                                                                        : job.jobType}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-end justify-between gap-4 pr-12">
                                                        <p className="text-sm text-gray-500 line-clamp-1 flex-1">
                                                            -{' '}
                                                            {job.description?.split('\n')[0] ||
                                                                'Tham gia thiết kế và phát triển...'}
                                                        </p>
                                                        <p className="text-xs text-gray-400 font-medium whitespace-nowrap shrink-0">
                                                            Đăng: {formatDate(job.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl border border-gray-200 border-dashed p-16 flex flex-col items-center justify-center text-center">
                                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-5">
                                            <Bookmark size={40} className="text-gray-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            Bạn chưa lưu công việc nào
                                        </h3>
                                        <p className="text-gray-500 mb-8 max-w-md">
                                            Hãy bấm biểu tượng trái tim ở các tin tuyển dụng để lưu lại và ứng tuyển
                                            sau.
                                        </p>
                                        <Link to="/jobs">
                                            <button className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all">
                                                Tìm việc ngay
                                            </button>
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageJobs;
