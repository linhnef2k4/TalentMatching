import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    MapPin,
    DollarSign,
    Clock,
    Briefcase,
    Bookmark,
    CheckCircle2,
    ChevronLeft,
    FileText,
    Send,
    X,
    Loader2,
    MessageSquare,
    UploadCloud,
    ShieldAlert,
    Building2,
    Zap,
    Flag,
    CheckCircle,
} from 'lucide-react';
import jobService from '~/services/jobService';
import applicationService from '~/services/applicationService';
import reportService from '~/services/reportService';
import { AuthContext } from '~/context/AuthContext';

// Helper: Xử lý mảng bị lỗi định dạng từ Backend
const cleanArrayData = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) {
        const joined = data.join(',');
        const cleaned = joined.replace(/[\[\]"\\]/g, '');
        return cleaned
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    }
    if (typeof data === 'string') {
        return data
            .replace(/[\[\]"\\]/g, '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    }
    return [];
};

const DICTIONARY = {
    JOB_LEVEL: {
        INTERN: 'Thực tập sinh',
        FRESHER: 'Mới tốt nghiệp',
        JUNIOR: 'Nhân viên (Junior)',
        MIDDLE: 'Chuyên viên (Middle)',
        SENIOR: 'Chuyên gia (Senior)',
        MANAGER: 'Quản lý',
        LEAD: 'Trưởng nhóm',
    },
    EDU_LEVEL: {
        NOT_REQUIRED: 'Không yêu cầu',
        HIGH_SCHOOL: 'THPT',
        ASSOCIATE: 'Cao đẳng',
        BACHELOR: 'Đại học',
        MASTER: 'Thạc sĩ / Tiến sĩ',
    },
    JOB_TYPE: {
        FULL_TIME: 'Toàn thời gian',
        PART_TIME: 'Bán thời gian',
        REMOTE: 'Làm từ xa',
        HYBRID: 'Linh hoạt (Hybrid)',
        INTERNSHIP: 'Thực tập',
        FREELANCE: 'Freelance',
    },
};

const JobDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn, user } = useContext(AuthContext);

    const [jobData, setJobData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);

    // STATES ỨNG TUYỂN
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [isApplied, setIsApplied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    // STATES BÁO CÁO (REPORT)
    const [showReportModal, setShowReportModal] = useState(false);
    const [isReporting, setIsReporting] = useState(false);
    const [reportForm, setReportForm] = useState({
        reason: 'SCAM',
        description: '',
    });

    const [applyForm, setApplyForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        educationLevel: 'BACHELOR',
        jobLevel: 'INTERN',
        yearsOfExperience: 0,
        coverLetter: '',
    });

    const [cvOption, setCvOption] = useState('new');
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            setIsLoading(true);
            try {
                const response = await jobService.getJobById(id);
                const cleanSkills = cleanArrayData(response.requiredSkills);
                const cleanCategories = cleanArrayData(response.categories);

                setJobData({
                    ...response,
                    requiredSkills: cleanSkills,
                    categories: cleanCategories,
                });

                if (isLoggedIn) {
                    const checkRes = await jobService.checkSavedJob(id);
                    setIsSaved(checkRes.isSaved);

                    setApplyForm((prev) => ({
                        ...prev,
                        fullName: user?.fullName || '',
                        email: user?.email || '',
                        phone: user?.phoneNumber || '',
                    }));

                    if (user?.cvUrl) setCvOption('default');
                }
            } catch (error) {
                console.error('Lỗi lấy dữ liệu Job:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [id, isLoggedIn, user]);

    const handleStartChat = () => {
        if (!isLoggedIn) return alert('Vui lòng đăng nhập để nhắn tin với Nhà tuyển dụng!');
        if (!jobData.employerId) return alert('Tin tuyển dụng này hiện chưa có thông tin Nhà tuyển dụng!');

        const hrInfo = {
            id: jobData.employerId,
            email: jobData.employerEmail,
            name: jobData.employerName || 'Nhà tuyển dụng',
            avatar: jobData.employerAvatar,
        };
        navigate('/chat', { state: { newContact: hrInfo } });
    };

    const handleToggleSave = async () => {
        if (!isLoggedIn) return alert('Vui lòng đăng nhập để lưu việc làm!');
        try {
            await jobService.toggleSaveJob(id);
            setIsSaved(!isSaved);
        } catch (error) {
            console.error('Lỗi khi lưu:', error);
        }
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) return alert('Vui lòng đăng nhập để gửi báo cáo!');
        if (!reportForm.description.trim()) return alert('Vui lòng nhập chi tiết mô tả báo cáo.');

        setIsReporting(true);
        try {
            const payload = {
                targetId: id,
                targetType: 'JOB',
                reason: reportForm.reason,
                description: reportForm.description,
            };
            await reportService.submitReport(payload);
            alert('Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét và xử lý sớm nhất!');
            setShowReportModal(false);
            setReportForm({ reason: 'SCAM', description: '' });
        } catch (error) {
            alert('Có lỗi xảy ra khi gửi báo cáo, vui lòng thử lại sau.');
        } finally {
            setIsReporting(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) return alert('Vui lòng chọn file CV nhỏ hơn 5MB');
            setSelectedFile(file);
        }
    };

    const handleApplySubmit = async (e) => {
        e.preventDefault();

        let finalCvUrl = '';
        if (cvOption === 'default') {
            if (!user?.cvUrl) return alert('Không tìm thấy hồ sơ CV mặc định của bạn!');
            finalCvUrl = user.cvUrl;
        } else {
            if (!selectedFile) return alert('Vui lòng đính kèm file CV của bạn!');
            setIsSaving(true);
            try {
                const uploadRes = await applicationService.uploadCv(selectedFile);
                finalCvUrl =
                    uploadRes?.cvUrl ||
                    uploadRes?.url ||
                    uploadRes?.data?.cvUrl ||
                    (typeof uploadRes === 'string' ? uploadRes : '');

                if (!finalCvUrl) throw new Error('Không lấy được đường dẫn CV sau khi upload');
            } catch (error) {
                console.error('Lỗi upload CV:', error);
                setIsSaving(false);
                return alert('Tải lên CV thất bại! Vui lòng thử lại.');
            }
        }

        setIsSaving(true);
        try {
            const payload = {
                jobId: Number(id),
                cvUrl: finalCvUrl,
                coverLetter: applyForm.coverLetter || '',
                fullName: applyForm.fullName,
                email: applyForm.email,
                phone: applyForm.phone,
                educationLevel: applyForm.educationLevel,
                jobLevel: applyForm.jobLevel,
                yearsOfExperience: Number(applyForm.yearsOfExperience) || 0,
                coreSkills: ['Java'],
            };

            await applicationService.applyJob(payload);
            setIsApplied(true);
            setShowApplyModal(false);
            alert('Nộp hồ sơ ứng tuyển thành công!');
        } catch (error) {
            console.error('Lỗi Apply:', error);
            const errorMsg =
                error.response?.data?.message ||
                error.response?.data ||
                'Có lỗi xảy ra khi nộp hồ sơ. Vui lòng thử lại!';
            alert(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFormChange = (e) => setApplyForm({ ...applyForm, [e.target.name]: e.target.value });

    const formatSalary = (min, max, negotiable) => {
        if (negotiable || (!min && !max)) return 'Thỏa thuận';
        const formatMoney = (val) =>
            val >= 1000000 ? val / 1000000 + ' Triệu' : new Intl.NumberFormat('vi-VN').format(val);
        if (min && !max) return `Từ ${formatMoney(min)}`;
        if (!min && max) return `Lên tới ${formatMoney(max)}`;
        return `${formatMoney(min)} - ${formatMoney(max)}`;
    };

    const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : '');
    const getFileNameFromUrl = (url) => (url ? url.split('/').pop().split('?')[0].substring(0, 30) + '...' : '');

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-[#0f4c5c]" />
            </div>
        );
    }

    if (!jobData) {
        return (
            <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-slate-500 font-bold space-y-4">
                <ShieldAlert size={64} className="text-slate-300" />
                <p>Không tìm thấy việc làm!</p>
                <Link to="/jobs" className="text-[#0f4c5c] font-medium hover:underline">
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#f8f9ff] font-sans min-h-screen pb-20">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* BREADCRUMB */}
                <div className="mb-6 flex items-center text-sm text-slate-500 font-medium">
                    <Link to="/" className="hover:text-[#0f4c5c] transition-colors">
                        Trang chủ
                    </Link>
                    <ChevronRight size={16} className="mx-2 text-slate-400" />
                    <Link to="/jobs" className="hover:text-[#0f4c5c] transition-colors">
                        Việc làm
                    </Link>
                    <ChevronRight size={16} className="mx-2 text-slate-400" />
                    <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-md">{jobData.title}</span>
                </div>

                <div className="lg:flex gap-8 items-start">
                    {/* LEFT COLUMN: MAIN CONTENT */}
                    <div className="flex-1 space-y-6">
                        {/* JOB HEADER CARD */}
                        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-6">
                                    <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 p-2">
                                        <img
                                            src={
                                                jobData.employerAvatar ||
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(jobData.employerName || 'CP')}&background=f0fdf4&color=059669`
                                            }
                                            alt="Logo"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 leading-tight">
                                            {jobData.title}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <span className="text-slate-600 font-medium flex items-center gap-1.5">
                                                <Building2 size={18} className="text-slate-400" />{' '}
                                                {jobData.employerName}
                                            </span>
                                            <span className="text-slate-600 font-medium flex items-center gap-1.5">
                                                <MapPin size={18} className="text-slate-400" /> {jobData.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleToggleSave}
                                        title="Lưu tin"
                                        className={`p-2.5 rounded-xl border transition-all hover:bg-slate-50 active:scale-95 ${isSaved ? 'text-amber-500 border-amber-200 bg-amber-50' : 'text-[#0f4c5c] border-slate-200'}`}
                                    >
                                        <Bookmark className={isSaved ? 'fill-current' : ''} size={20} />
                                    </button>
                                    <button
                                        onClick={handleStartChat}
                                        title="Nhắn tin với HR"
                                        className="p-2.5 rounded-xl border border-slate-200 text-[#0f4c5c] hover:bg-slate-50 transition-all active:scale-95"
                                    >
                                        <MessageSquare size={20} />
                                    </button>
                                    <button
                                        onClick={() => setShowReportModal(true)}
                                        title="Báo cáo vi phạm"
                                        className="p-2.5 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 transition-all active:scale-95"
                                    >
                                        <Flag size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-3">
                                <span className="px-4 py-1.5 rounded-full bg-[#eaf1ff] text-[#0f4c5c] font-bold text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                                    <Briefcase size={14} /> {DICTIONARY.JOB_TYPE[jobData.jobType]}
                                </span>
                                <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                                    <Zap size={14} /> {DICTIONARY.JOB_LEVEL[jobData.jobLevel]}
                                </span>
                                <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                                    <Clock size={14} /> Hạn nộp: {formatDate(jobData.deadline)}
                                </span>
                            </div>
                        </section>

                        {/* ABOUT THE JOB */}
                        {jobData.description && (
                            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Mô tả công việc</h3>
                                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                                    {jobData.description}
                                </div>
                            </section>
                        )}

                        {/* REQUIREMENTS */}
                        {jobData.requirements && (
                            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Yêu cầu ứng viên</h3>
                                <ul className="space-y-3">
                                    {jobData.requirements
                                        .split('\n')
                                        .filter((r) => r.trim())
                                        .map((req, i) => (
                                            <li key={i} className="flex gap-3 items-start">
                                                <CheckCircle size={20} className="text-[#006b5f] shrink-0 mt-0.5" />
                                                <span className="text-slate-600 font-medium leading-relaxed">
                                                    {req}
                                                </span>
                                            </li>
                                        ))}
                                </ul>
                            </section>
                        )}

                        {/* SKILLS GRID */}
                        {(jobData.requiredSkills?.length > 0 || jobData.categories?.length > 0) && (
                            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Kỹ năng & Chuyên môn</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {jobData.requiredSkills?.length > 0 && (
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                            <span className="text-[12px] font-bold text-slate-500 block mb-3 uppercase tracking-widest">
                                                Kỹ năng yêu cầu
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                {jobData.requiredSkills.map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 shadow-sm"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {jobData.categories?.length > 0 && (
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                            <span className="text-[12px] font-bold text-slate-500 block mb-3 uppercase tracking-widest">
                                                Danh mục ngành
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                {jobData.categories.map((cat, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 shadow-sm"
                                                    >
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* BENEFITS */}
                        {jobData.benefits && (
                            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Quyền lợi</h3>
                                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                                    {jobData.benefits}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* RIGHT COLUMN: SIDEBAR */}
                    <aside className="w-full lg:w-[380px] space-y-6 mt-6 lg:mt-0 lg:sticky lg:top-[88px]">
                        {/* SUMMARY CARD (DARK THEME) */}
                        <div className="bg-[#0f4c5c] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>

                            <div className="relative z-10">
                                <h4 className="text-[12px] text-[#87bbce] font-bold uppercase tracking-widest mb-6">
                                    Tóm tắt công việc
                                </h4>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                                        <span className="text-[#87bbce] text-sm font-medium">Mức lương</span>
                                        <span className="font-bold text-lg text-white">
                                            {formatSalary(
                                                jobData.salaryMin,
                                                jobData.salaryMax,
                                                jobData.salaryNegotiable,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                                        <span className="text-[#87bbce] text-sm font-medium">Số lượng tuyển</span>
                                        <span className="font-bold text-white">{jobData.quantity} người</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                                        <span className="text-[#87bbce] text-sm font-medium">Trình độ</span>
                                        <span className="font-bold text-white">
                                            {DICTIONARY.EDU_LEVEL[jobData.educationLevel] ||
                                                jobData.educationLevel ||
                                                'Không yêu cầu'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-[#87bbce] text-sm font-medium">Kinh nghiệm</span>
                                        <span className="font-bold text-white">
                                            {jobData.experienceLevel || `${jobData.minExpYears} năm`}
                                        </span>
                                    </div>
                                </div>

                                {/* APPLY PROMPT */}
                                <div className="mt-8 p-5 bg-white rounded-xl text-slate-900 text-center">
                                    <p className="text-sm font-bold text-slate-600 mb-4">
                                        Bạn đã sẵn sàng cho bước tiến mới?
                                    </p>

                                    {jobData.status === 'CLOSED' || jobData.expired ? (
                                        <button
                                            disabled
                                            className="w-full py-3 bg-slate-200 text-slate-500 rounded-lg font-bold cursor-not-allowed"
                                        >
                                            Tin đã đóng
                                        </button>
                                    ) : isApplied ? (
                                        <button
                                            disabled
                                            className="w-full py-3 bg-[#eaf1ff] text-[#0f4c5c] rounded-lg font-bold flex justify-center items-center gap-2"
                                        >
                                            <CheckCircle2 size={18} /> Đã ứng tuyển
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                if (!isLoggedIn) return alert('Vui lòng đăng nhập!');
                                                setShowApplyModal(true);
                                            }}
                                            className="w-full py-3 bg-[#006b5f] text-white rounded-lg font-bold hover:bg-[#005048] transition-colors active:scale-95 shadow-md shadow-[#006b5f]/30"
                                        >
                                            Ứng tuyển ngay
                                        </button>
                                    )}
                                    <p className="text-[11px] text-slate-400 mt-3 font-medium">
                                        Hoàn tất chỉ trong 2 phút
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* COMPANY CARD */}
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                            <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                                Thông tin công ty
                            </h4>
                            <div className="flex items-center gap-4 mb-4">
                                <img
                                    src={
                                        jobData.employerAvatar ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(jobData.employerName || 'CP')}&background=f0fdf4&color=059669`
                                    }
                                    className="w-14 h-14 rounded-lg border border-slate-200 p-1 object-contain"
                                />
                                <div>
                                    <p className="font-bold text-slate-900 text-lg leading-tight">
                                        {jobData.employerName}
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">
                                        Đang tuyển {jobData.quantity} vị trí
                                    </p>
                                </div>
                            </div>
                            <Link
                                to={`/companies/${jobData.employerId}`}
                                className="text-[#0f4c5c] font-bold text-sm flex items-center justify-center gap-1.5 hover:underline py-2 bg-slate-50 rounded-lg mt-4 transition-colors"
                            >
                                Xem hồ sơ công ty <ChevronRight size={16} />
                            </Link>
                        </div>
                    </aside>
                </div>
            </main>

            {/* MODAL ỨNG TUYỂN */}
            {showApplyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-slate-900">Nộp hồ sơ: {jobData.title}</h2>
                            <button
                                onClick={() => setShowApplyModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleApplySubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Forms Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                        Họ và tên <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        required
                                        name="fullName"
                                        value={applyForm.fullName}
                                        onChange={handleFormChange}
                                        type="text"
                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#0f4c5c] focus:ring-1 focus:ring-[#0f4c5c] text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                        Email <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        required
                                        name="email"
                                        value={applyForm.email}
                                        onChange={handleFormChange}
                                        type="email"
                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#0f4c5c] focus:ring-1 focus:ring-[#0f4c5c] text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                        Số điện thoại <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        required
                                        name="phone"
                                        value={applyForm.phone}
                                        onChange={handleFormChange}
                                        type="tel"
                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#0f4c5c] focus:ring-1 focus:ring-[#0f4c5c] text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                        Trình độ học vấn
                                    </label>
                                    <select
                                        name="educationLevel"
                                        value={applyForm.educationLevel}
                                        onChange={handleFormChange}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#0f4c5c] focus:ring-1 focus:ring-[#0f4c5c] text-sm font-medium cursor-pointer"
                                    >
                                        <option value="NOT_REQUIRED">Không yêu cầu</option>
                                        <option value="HIGH_SCHOOL">Trung học phổ thông</option>
                                        <option value="ASSOCIATE">Cao đẳng</option>
                                        <option value="BACHELOR">Đại học</option>
                                        <option value="MASTER">Thạc sĩ / Tiến sĩ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                        Cấp bậc mong muốn <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        name="jobLevel"
                                        value={applyForm.jobLevel}
                                        onChange={handleFormChange}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#0f4c5c] focus:ring-1 focus:ring-[#0f4c5c] text-sm font-medium cursor-pointer"
                                    >
                                        <option value="INTERN">Thực tập sinh (Intern)</option>
                                        <option value="FRESHER">Fresher</option>
                                        <option value="JUNIOR">Junior</option>
                                        <option value="MIDDLE">Middle</option>
                                        <option value="SENIOR">Senior</option>
                                        <option value="MANAGER">Quản lý (Manager)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                        Năm kinh nghiệm <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        required
                                        name="yearsOfExperience"
                                        value={applyForm.yearsOfExperience}
                                        onChange={handleFormChange}
                                        type="number"
                                        min="0"
                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#0f4c5c] focus:ring-1 focus:ring-[#0f4c5c] text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                    Thư giới thiệu (Cover Letter)
                                </label>
                                <textarea
                                    name="coverLetter"
                                    value={applyForm.coverLetter}
                                    onChange={handleFormChange}
                                    rows="4"
                                    className="w-full p-4 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#0f4c5c] focus:ring-1 focus:ring-[#0f4c5c] text-sm resize-none font-medium"
                                ></textarea>
                            </div>

                            {/* Khối chọn CV */}
                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                    Hồ sơ đính kèm (CV) <span className="text-rose-500">*</span>
                                </label>
                                {user?.cvUrl && (
                                    <label
                                        className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${cvOption === 'default' ? 'border-[#0f4c5c] bg-[#eff4ff]' : 'border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        <input
                                            type="radio"
                                            checked={cvOption === 'default'}
                                            onChange={() => setCvOption('default')}
                                            className="w-4 h-4 text-[#0f4c5c]"
                                        />
                                        <div className="flex-1 font-bold text-sm text-slate-700">
                                            {getFileNameFromUrl(user.cvUrl)}{' '}
                                            <span className="font-normal text-xs text-slate-500 ml-2">
                                                (CV mặc định)
                                            </span>
                                        </div>
                                    </label>
                                )}
                                <label
                                    className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${cvOption === 'new' ? 'border-[#0f4c5c] bg-[#eff4ff]' : 'border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <input
                                        type="radio"
                                        checked={cvOption === 'new'}
                                        onChange={() => setCvOption('new')}
                                        className="w-4 h-4 text-[#0f4c5c] mt-1"
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-slate-700 mb-2">Tải CV từ thiết bị</p>
                                        {cvOption === 'new' && (
                                            <div
                                                onClick={() => fileInputRef.current.click()}
                                                className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-white transition-colors bg-slate-50/50"
                                            >
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    ref={fileInputRef}
                                                />
                                                {selectedFile ? (
                                                    <>
                                                        <p className="font-bold text-[#0f4c5c]">{selectedFile.name}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <UploadCloud
                                                            className="text-slate-400 mx-auto mb-2"
                                                            size={32}
                                                        />
                                                        <p className="font-bold text-slate-600 text-sm">
                                                            Nhấn để chọn file (Max 5MB)
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </label>
                            </div>
                        </form>

                        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 sticky bottom-0 z-10">
                            <button
                                type="button"
                                onClick={() => setShowApplyModal(false)}
                                className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                onClick={handleApplySubmit}
                                className="bg-[#0f4c5c] hover:bg-[#0b3b47] text-white font-bold px-8 py-2.5 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}{' '}
                                {isSaving ? 'Đang xử lý...' : 'Nộp hồ sơ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL BÁO CÁO VI PHẠM (REPORT) */}
            {showReportModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <form
                        onSubmit={handleReportSubmit}
                        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
                    >
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                Báo cáo tin tuyển dụng
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowReportModal(false)}
                                className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <p className="text-sm text-slate-600 font-medium">
                                Nếu bạn phát hiện tin tuyển dụng này có dấu hiệu lừa đảo, vui lòng báo cáo cho chúng
                                tôi.
                            </p>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                    Lý do báo cáo
                                </label>
                                <select
                                    value={reportForm.reason}
                                    onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
                                    className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-medium cursor-pointer"
                                >
                                    <option value="SCAM">Dấu hiệu lừa đảo / Thu phí ứng viên</option>
                                    <option value="FAKE_INFO">Thông tin công việc sai sự thật</option>
                                    <option value="INAPPROPRIATE">Nội dung phản cảm</option>
                                    <option value="OTHER">Lý do khác</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                    Mô tả chi tiết <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows="4"
                                    value={reportForm.description}
                                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                                    placeholder="Cung cấp thêm thông tin để admin xác minh..."
                                    className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm resize-none font-medium"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                            <button
                                type="button"
                                onClick={() => setShowReportModal(false)}
                                className="px-6 py-2.5 font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isReporting}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                            >
                                {isReporting ? <Loader2 size={18} className="animate-spin" /> : <Flag size={18} />} Gửi
                                báo cáo
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default JobDetail;
