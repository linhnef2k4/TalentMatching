import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    MapPin,
    DollarSign,
    Clock,
    Briefcase,
    Bookmark,
    Share2,
    CheckCircle2,
    ChevronLeft,
    FileText,
    Send,
    X,
    AlertCircle,
    Loader2,
    MessageSquare,
    UploadCloud,
    GraduationCap,
    Users,
    Star,
    Plus,
    ShieldAlert,
    Building2,
    Zap,
} from 'lucide-react';
import jobService from '~/services/jobService';
import applicationService from '~/services/applicationService';
import { AuthContext } from '~/context/AuthContext';

// Helper: Xử lý mảng bị lỗi định dạng từ Backend (VD: ["[\"A\"", "\"B\"]"] -> ["A", "B"])
const cleanArrayData = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) {
        const joined = data.join(',');
        const cleaned = joined.replace(/[\[\]"\\]/g, ''); // Xóa bỏ [, ], ", \
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

// Từ điển dịch Job Level, Education Level, Job Type cho giao diện đẹp
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

    // STATES CHO MODAL ỨNG TUYỂN
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [isApplied, setIsApplied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    // Form data ứng tuyển
    const [applyForm, setApplyForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        educationLevel: 'BACHELOR',
        jobLevel: 'INTERN',
        yearsOfExperience: 0,
        coverLetter: '',
    });

    const [selectedSkills, setSelectedSkills] = useState([]);
    const [showCustomSkillInput, setShowCustomSkillInput] = useState(false);
    const [customSkill, setCustomSkill] = useState('');

    const [cvOption, setCvOption] = useState('new');
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            setIsLoading(true);
            try {
                const response = await jobService.getJobById(id);

                // Làm sạch mảng kỹ năng và danh mục bị lỗi cú pháp từ DB
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

                    if (user?.cvUrl) {
                        setCvOption('default');
                    }
                }
            } catch (error) {
                console.error('Lỗi lấy dữ liệu Job:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [id, isLoggedIn, user]);

    // ─── XỬ LÝ CHAT VỚI HR (Đã fix truyền ID để gọi API) ─────────────
    const handleStartChat = () => {
        if (!isLoggedIn) {
            alert('Vui lòng đăng nhập để nhắn tin với Nhà tuyển dụng!');
            return;
        }
        if (!jobData.employerId) {
            alert('Tin tuyển dụng này hiện chưa có thông tin Nhà tuyển dụng!');
            return;
        }

        const hrInfo = {
            id: jobData.employerId, // Truyền ID để ChatApp gọi api `initConversation`
            email: jobData.employerEmail,
            name: jobData.employerName || 'Nhà tuyển dụng',
            avatar: jobData.employerAvatar,
        };
        navigate('/chat', { state: { newContact: hrInfo } });
    };

    const handleToggleSave = async () => {
        if (!isLoggedIn) {
            alert('Vui lòng đăng nhập để lưu việc làm!');
            return;
        }
        try {
            await jobService.toggleSaveJob(id);
            setIsSaved(!isSaved);
        } catch (error) {
            console.error('Lỗi khi lưu:', error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Vui lòng chọn file CV nhỏ hơn 5MB');
                return;
            }
            setSelectedFile(file);
        }
    };

    const toggleSkill = (skill) => {
        if (selectedSkills.includes(skill)) {
            setSelectedSkills(selectedSkills.filter((s) => s !== skill));
        } else {
            setSelectedSkills([...selectedSkills, skill]);
        }
    };

    const handleAddCustomSkill = () => {
        const trimmed = customSkill.trim();
        if (trimmed && !selectedSkills.includes(trimmed)) {
            setSelectedSkills([...selectedSkills, trimmed]);
        }
        setCustomSkill('');
        setShowCustomSkillInput(false);
    };

    const handleApplySubmit = async (e) => {
        e.preventDefault();

        // Validate kỹ năng bắt buộc (Hard Rule)
        if (jobData?.requiredSkills && jobData.requiredSkills.length > 0) {
            const missingSkills = jobData.requiredSkills.filter((reqSkill) => !selectedSkills.includes(reqSkill));

            if (missingSkills.length > 0) {
                alert(
                    `⚠️ HỆ THỐNG TỪ CHỐI HỒ SƠ ⚠️\n\nBạn chưa đáp ứng đủ 100% Kỹ năng bắt buộc (Core Skills) của công việc này.\n\nKỹ năng còn thiếu: ${missingSkills.join(', ')}\n\nVui lòng bổ sung nếu bạn thực sự có kỹ năng này, hoặc tìm kiếm cơ hội việc làm khác phù hợp hơn.`,
                );
                return;
            }
        } else if (selectedSkills.length === 0) {
            alert('Vui lòng chọn hoặc nhập ít nhất 1 Kỹ năng (Core Skill) của bạn!');
            return;
        }

        let finalCvUrl = '';

        if (cvOption === 'default') {
            if (!user?.cvUrl) {
                alert('Không tìm thấy hồ sơ CV mặc định của bạn!');
                return;
            }
            finalCvUrl = user.cvUrl;
        } else {
            if (!selectedFile) {
                alert('Vui lòng đính kèm file CV của bạn!');
                return;
            }
            setIsSaving(true);
            try {
                const uploadRes = await applicationService.uploadCv(selectedFile);
                finalCvUrl = uploadRes.cvUrl || uploadRes.url || uploadRes;
            } catch (error) {
                console.error('Lỗi upload CV:', error);
                alert('Tải lên CV thất bại!');
                setIsSaving(false);
                return;
            }
        }

        setIsSaving(true);
        try {
            const payload = {
                jobId: Number(id),
                cvUrl: finalCvUrl,
                coverLetter: applyForm.coverLetter,
                fullName: applyForm.fullName,
                email: applyForm.email,
                phone: applyForm.phone,
                educationLevel: applyForm.educationLevel,
                jobLevel: applyForm.jobLevel,
                yearsOfExperience: Number(applyForm.yearsOfExperience),
                coreSkills: selectedSkills,
            };

            await applicationService.applyJob(payload);

            setIsApplied(true);
            setShowApplyModal(false);
            alert('Nộp hồ sơ ứng tuyển thành công!');
        } catch (error) {
            console.error('Lỗi ứng tuyển:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi nộp hồ sơ. Vui lòng thử lại!');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFormChange = (e) => {
        setApplyForm({ ...applyForm, [e.target.name]: e.target.value });
    };

    const formatSalary = (min, max, negotiable) => {
        if (negotiable) return 'Thỏa thuận';
        if (!min && !max) return 'Thỏa thuận';
        const formatMoney = (val) => {
            if (val >= 1000000) return val / 1000000 + ' Triệu';
            return new Intl.NumberFormat('vi-VN').format(val);
        };
        if (min && !max) return `Từ ${formatMoney(min)}`;
        if (!min && max) return `Lên tới ${formatMoney(max)}`;
        return `${formatMoney(min)} - ${formatMoney(max)}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN');
    };

    const getFileNameFromUrl = (url) => {
        if (!url) return '';
        const parts = url.split('/');
        return parts[parts.length - 1].split('?')[0].substring(0, 30) + '...';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!jobData) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 font-bold space-y-4">
                <ShieldAlert size={64} className="text-slate-300" />
                <p>Không tìm thấy việc làm!</p>
                <Link to="/jobs" className="text-emerald-600 font-medium hover:underline">
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 font-sans min-h-screen pb-20 relative">
            {/* HERO COVER IMAGE & BREADCRUMB */}
            <div className="relative w-full h-56 md:h-72 bg-slate-900">
                <img
                    src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=2000&q=80"
                    alt="Office Cover"
                    className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-transparent to-blue-900/50"></div>

                {/* Breadcrumb */}
                <div className="absolute top-0 left-0 w-full py-4 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center text-sm text-slate-300 font-medium">
                        <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
                            Trang chủ
                        </Link>
                        <ChevronRight size={14} className="mx-2 text-slate-500" />
                        <Link to="/jobs" className="hover:text-white transition-colors">
                            Việc làm
                        </Link>
                        <ChevronRight size={14} className="mx-2 text-slate-500" />
                        <span className="text-white truncate font-semibold drop-shadow-md">{jobData.title}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* NÚT BACK */}
                <div className="relative z-20 -mt-16 mb-4 flex justify-between items-end">
                    <Link
                        to="/jobs"
                        className="inline-flex items-center gap-2 text-slate-200 hover:text-white font-semibold transition-colors bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20"
                    >
                        <ChevronLeft size={18} /> Trở về
                    </Link>
                </div>

                {/* TOP HEADER CARD */}
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 mb-8 relative z-20">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Company Logo */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-lg shadow-slate-200 overflow-hidden p-3 -mt-12 md:-mt-16 bg-clip-padding backdrop-filter">
                            <img
                                src={
                                    jobData.employerAvatar ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(jobData.employerName || 'CP')}&background=f0fdf4&color=059669`
                                }
                                alt="Logo"
                                className="w-full h-full object-contain rounded-xl"
                            />
                        </div>

                        <div className="flex-1 w-full">
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 leading-tight">
                                {jobData.title}
                            </h1>
                            <p className="text-lg text-emerald-700 font-bold mb-5 flex items-center gap-2">
                                <Building2 size={20} /> {jobData.employerName}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <div className="flex items-center gap-1.5 text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-semibold">
                                    <MapPin size={16} className="text-rose-500" /> {jobData.location}
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-semibold">
                                    <Briefcase size={16} className="text-blue-500" />{' '}
                                    {jobData.experienceLevel || `${jobData.minExpYears} năm kinh nghiệm`}
                                </div>
                                <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm">
                                    <DollarSign size={16} className="text-emerald-600" />{' '}
                                    {formatSalary(jobData.salaryMin, jobData.salaryMax, jobData.salaryNegotiable)}
                                </div>
                            </div>

                            {/* THẺ TAG YÊU CẦU & CHUYÊN MÔN */}
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 space-y-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="font-bold text-slate-700 w-24 flex items-center gap-2">
                                        <Zap size={16} className="text-amber-500" /> Cấp độ:
                                    </span>
                                    <span className="bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                                        {DICTIONARY.JOB_LEVEL[jobData.jobLevel] || jobData.jobLevel}
                                    </span>
                                    <span className="bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                                        {DICTIONARY.EDU_LEVEL[jobData.educationLevel] ||
                                            jobData.educationLevel ||
                                            'Không yêu cầu'}
                                    </span>
                                </div>

                                {jobData.categories && jobData.categories.length > 0 && (
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="font-bold text-slate-700 w-24">Chuyên môn:</span>
                                        {jobData.categories.map((cat, idx) => (
                                            <span
                                                key={`cat-${idx}`}
                                                className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {jobData.requiredSkills && jobData.requiredSkills.length > 0 && (
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="font-bold text-slate-700 w-24">Kỹ năng:</span>
                                        {jobData.requiredSkills.map((skill, idx) => (
                                            <span
                                                key={`skill-${idx}`}
                                                className="bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1 rounded-full text-sm font-bold shadow-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* CÁC NÚT THAO TÁC */}
                            <div className="flex flex-wrap items-center gap-3">
                                {jobData.status === 'CLOSED' || jobData.expired ? (
                                    <button
                                        disabled
                                        className="bg-slate-200 text-slate-500 font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 cursor-not-allowed border border-slate-300"
                                    >
                                        <X size={20} /> Tin đã đóng
                                    </button>
                                ) : isApplied ? (
                                    <button
                                        disabled
                                        className="bg-slate-100 text-slate-500 font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 cursor-not-allowed border border-slate-200"
                                    >
                                        <CheckCircle2 size={20} /> Đã ứng tuyển
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            if (!isLoggedIn) return alert('Vui lòng đăng nhập để ứng tuyển!');
                                            setShowApplyModal(true);
                                        }}
                                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2 active:scale-95"
                                    >
                                        <Send size={18} /> Ứng tuyển ngay
                                    </button>
                                )}

                                <button
                                    onClick={handleStartChat}
                                    className="bg-white border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 px-6 py-3.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
                                >
                                    <MessageSquare size={18} /> Nhắn tin HR
                                </button>

                                <button
                                    onClick={handleToggleSave}
                                    className={`p-3.5 border-2 rounded-xl transition-all shadow-sm ${isSaved ? 'border-amber-200 bg-amber-50 text-amber-500' : 'border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-amber-500 hover:border-amber-200'}`}
                                >
                                    <Bookmark size={20} className={isSaved ? 'fill-current' : ''} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* MAIN CONTENT (Trái) */}
                    <div className="flex-1 space-y-8">
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-emerald-400 to-teal-600"></div>

                            <h2 className="text-xl font-bold text-slate-900 mb-6 pl-4">Chi tiết tin tuyển dụng</h2>

                            <div className="space-y-8 pl-4">
                                {/* MÔ TẢ */}
                                {jobData.description && (
                                    <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                            <FileText size={20} className="text-blue-500" /> Mô tả công việc
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                            {jobData.description}
                                        </p>
                                    </div>
                                )}

                                {/* YÊU CẦU */}
                                {jobData.requirements && (
                                    <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                            <ShieldAlert size={20} className="text-rose-500" /> Yêu cầu ứng viên
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                            {jobData.requirements}
                                        </p>
                                    </div>
                                )}

                                {/* QUYỀN LỢI */}
                                {jobData.benefits && (
                                    <div className="bg-emerald-50/30 p-5 rounded-xl border border-emerald-100">
                                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                            <Star size={20} className="text-amber-500" /> Quyền lợi
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                            {jobData.benefits}
                                        </p>
                                    </div>
                                )}

                                {/* ĐỊA ĐIỂM */}
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <MapPin size={20} className="text-indigo-500" /> Địa điểm làm việc
                                    </h3>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 flex items-start gap-3">
                                        <MapPin size={20} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                        <span className="font-medium">{jobData.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SIDEBAR (Phải) */}
                    <aside className="w-full lg:w-[340px] flex-shrink-0 space-y-6">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-2xl"></div>

                            <h3 className="font-bold text-slate-900 mb-6 text-lg relative z-10 border-b border-slate-100 pb-3">
                                Thông tin chung
                            </h3>

                            <div className="space-y-5 relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 shadow-sm border border-blue-100">
                                        <Star size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 mb-0.5">Cấp bậc</p>
                                        <p className="font-bold text-slate-800 text-sm">
                                            {DICTIONARY.JOB_LEVEL[jobData.jobLevel] || jobData.jobLevel}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600 shadow-sm border border-emerald-100">
                                        <Briefcase size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 mb-0.5">Kinh nghiệm</p>
                                        <p className="font-bold text-slate-800 text-sm">
                                            {jobData.experienceLevel || `${jobData.minExpYears} năm kinh nghiệm`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-purple-50 p-2.5 rounded-xl text-purple-600 shadow-sm border border-purple-100">
                                        <GraduationCap size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 mb-0.5">Trình độ học vấn</p>
                                        <p className="font-bold text-slate-800 text-sm">
                                            {DICTIONARY.EDU_LEVEL[jobData.educationLevel] ||
                                                jobData.educationLevel ||
                                                'Không yêu cầu'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 shadow-sm border border-indigo-100">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 mb-0.5">Số lượng tuyển</p>
                                        <p className="font-bold text-slate-800 text-sm">{jobData.quantity} người</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-cyan-50 p-2.5 rounded-xl text-cyan-600 shadow-sm border border-cyan-100">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 mb-0.5">
                                            Hình thức làm việc
                                        </p>
                                        <p className="font-bold text-slate-800 text-sm">
                                            {DICTIONARY.JOB_TYPE[jobData.jobType] || jobData.jobType}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-rose-50 p-2.5 rounded-xl text-rose-600 shadow-sm border border-rose-100">
                                        <AlertCircle size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 mb-0.5">Hạn nộp hồ sơ</p>
                                        <p className="font-bold text-slate-800 text-sm">
                                            {formatDate(jobData.deadline)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* MODAL ỨNG TUYỂN HOÀN CHỈNH */}
            {showApplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <form
                        onSubmit={handleApplySubmit}
                        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8"
                    >
                        <div className="px-6 py-5 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Send size={20} className="text-emerald-400" /> Ứng tuyển vị trí
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowApplyModal(false)}
                                className="text-slate-400 hover:text-white hover:bg-slate-700 p-1.5 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* HEADER */}
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <img
                                    src={jobData.employerAvatar || `https://ui-avatars.com/api/?name=CP`}
                                    alt="logo"
                                    className="w-14 h-14 object-contain rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
                                />
                                <div>
                                    <h4 className="font-bold text-slate-900 line-clamp-1 text-lg">{jobData.title}</h4>
                                    <p className="text-sm font-semibold text-emerald-600">{jobData.employerName}</p>
                                </div>
                            </div>

                            {/* CHỌN KỸ NĂNG CHÍNH (MATCHING 100% SKILL) */}
                            <div className="bg-rose-50 p-5 rounded-xl border border-rose-200 relative overflow-hidden">
                                <div className="absolute left-0 top-0 w-1 h-full bg-rose-500"></div>

                                <label className="flex items-center gap-2 text-sm font-bold text-rose-800 mb-2 pb-2 border-b border-rose-200/50">
                                    <ShieldAlert size={18} />
                                    Quy định bắt buộc (Hard Rule) <span className="text-rose-500">*</span>
                                </label>
                                <p className="text-sm text-rose-700/80 mb-4 leading-relaxed font-medium">
                                    Hệ thống sử dụng màng lọc AI tự động. Bạn <b>bắt buộc phải có đủ 100%</b> các kỹ
                                    năng mà Nhà tuyển dụng yêu cầu dưới đây. Nếu không chọn đủ, hệ thống sẽ{' '}
                                    <b className="text-rose-600">loại hồ sơ của bạn ngay lập tức</b>.
                                </p>
                                <div className="flex flex-wrap gap-2.5 mb-3">
                                    {jobData?.requiredSkills?.map((skill, idx) => {
                                        const isSelected = selectedSkills.includes(skill);
                                        return (
                                            <button
                                                type="button"
                                                key={idx}
                                                onClick={() => toggleSkill(skill)}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border shadow-sm ${
                                                    isSelected
                                                        ? 'bg-rose-600 text-white border-rose-600 shadow-rose-600/30'
                                                        : 'bg-white text-slate-600 border-slate-300 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600'
                                                }`}
                                            >
                                                {skill}
                                            </button>
                                        );
                                    })}

                                    {/* Kỹ năng Custom do Ứng viên nhập thêm */}
                                    {selectedSkills
                                        .filter((s) => !jobData?.requiredSkills?.includes(s))
                                        .map((skill, idx) => (
                                            <button
                                                type="button"
                                                key={`custom-${idx}`}
                                                onClick={() => toggleSkill(skill)}
                                                className="px-4 py-2 rounded-lg text-sm font-bold transition-colors border shadow-sm bg-indigo-600 text-white border-indigo-600 flex items-center gap-1.5 hover:bg-indigo-700"
                                            >
                                                {skill} <X size={14} className="opacity-80" />
                                            </button>
                                        ))}

                                    {!showCustomSkillInput ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowCustomSkillInput(true)}
                                            className="px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-dashed border-slate-300 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 flex items-center gap-1.5 bg-white shadow-sm"
                                        >
                                            <Plus size={16} /> Thêm kỹ năng khác
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-indigo-300 shadow-sm">
                                            <input
                                                type="text"
                                                value={customSkill}
                                                onChange={(e) => setCustomSkill(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddCustomSkill();
                                                    }
                                                }}
                                                placeholder="Nhập kỹ năng..."
                                                className="px-3 py-1.5 text-sm outline-none w-32 font-medium"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddCustomSkill}
                                                className="p-1.5 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200 transition"
                                            >
                                                <CheckCircle2 size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowCustomSkillInput(false);
                                                    setCustomSkill('');
                                                }}
                                                className="p-1.5 bg-slate-100 text-slate-500 rounded-md hover:bg-slate-200 transition"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CHỌN CV */}
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">
                                    Hồ sơ đính kèm (CV) <span className="text-rose-500">*</span>
                                </label>
                                <div className="space-y-3">
                                    {user?.cvUrl && (
                                        <label
                                            className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${cvOption === 'default' ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-200 hover:border-emerald-300 bg-white'}`}
                                        >
                                            <input
                                                type="radio"
                                                name="cvSelection"
                                                checked={cvOption === 'default'}
                                                onChange={() => setCvOption('default')}
                                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <div className="flex items-center gap-3 flex-1">
                                                <div
                                                    className={`p-2.5 rounded-lg ${cvOption === 'default' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
                                                >
                                                    <FileText size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className={`font-bold text-sm truncate ${cvOption === 'default' ? 'text-emerald-800' : 'text-slate-700'}`}
                                                    >
                                                        {getFileNameFromUrl(user.cvUrl)}
                                                    </p>
                                                    <p className="text-[12px] text-slate-500 mt-0.5 font-medium">
                                                        CV mặc định trong hồ sơ
                                                    </p>
                                                </div>
                                            </div>
                                        </label>
                                    )}

                                    <label
                                        className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${cvOption === 'new' ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:border-indigo-300 bg-white'}`}
                                    >
                                        <input
                                            type="radio"
                                            name="cvSelection"
                                            checked={cvOption === 'new'}
                                            onChange={() => setCvOption('new')}
                                            className="w-4 h-4 text-indigo-600 mt-3 focus:ring-indigo-500"
                                        />
                                        <div className="flex-1">
                                            <p
                                                className={`font-bold text-sm mb-3 ${cvOption === 'new' ? 'text-indigo-800' : 'text-slate-700'}`}
                                            >
                                                Tải lên CV mới từ máy tính
                                            </p>
                                            {cvOption === 'new' && (
                                                <>
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.doc,.docx"
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                        ref={fileInputRef}
                                                    />
                                                    <div
                                                        onClick={() => fileInputRef.current.click()}
                                                        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors ${selectedFile ? 'border-indigo-400 bg-indigo-100/50' : 'border-slate-300 bg-white hover:bg-slate-50'}`}
                                                    >
                                                        {selectedFile ? (
                                                            <>
                                                                <CheckCircle2
                                                                    className="text-indigo-500 mb-2"
                                                                    size={36}
                                                                />
                                                                <p className="font-bold text-sm text-indigo-800 text-center">
                                                                    {selectedFile.name}
                                                                </p>
                                                                <p className="text-xs text-slate-500 mt-1 font-medium">
                                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="bg-indigo-50 p-3 rounded-full mb-3">
                                                                    <UploadCloud
                                                                        className="text-indigo-500"
                                                                        size={32}
                                                                    />
                                                                </div>
                                                                <p className="font-bold text-sm text-slate-700">
                                                                    Nhấn để chọn file
                                                                </p>
                                                                <p className="text-xs text-slate-400 mt-1 font-medium">
                                                                    Hỗ trợ .pdf, .doc, .docx (Max 5MB)
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Khối Thông tin cá nhân */}
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">
                                    Thông tin cá nhân
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Họ và tên <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            required
                                            name="fullName"
                                            value={applyForm.fullName}
                                            onChange={handleFormChange}
                                            type="text"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-sm font-medium transition-all"
                                            placeholder="VD: Nguyễn Văn A"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Email <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            required
                                            name="email"
                                            value={applyForm.email}
                                            onChange={handleFormChange}
                                            type="email"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-sm font-medium transition-all"
                                            placeholder="VD: email@gmail.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Số điện thoại <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            required
                                            name="phone"
                                            value={applyForm.phone}
                                            onChange={handleFormChange}
                                            type="tel"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-sm font-medium transition-all"
                                            placeholder="VD: 0987654321"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Trình độ học vấn
                                        </label>
                                        <select
                                            name="educationLevel"
                                            value={applyForm.educationLevel}
                                            onChange={handleFormChange}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-sm font-medium transition-all"
                                        >
                                            <option value="NOT_REQUIRED">Không yêu cầu</option>
                                            <option value="HIGH_SCHOOL">Trung học phổ thông</option>
                                            <option value="ASSOCIATE">Cao đẳng</option>
                                            <option value="BACHELOR">Đại học</option>
                                            <option value="MASTER">Thạc sĩ / Tiến sĩ</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Cấp bậc mong muốn <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            name="jobLevel"
                                            value={applyForm.jobLevel}
                                            onChange={handleFormChange}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-sm font-medium transition-all"
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
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Số năm kinh nghiệm <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            required
                                            name="yearsOfExperience"
                                            value={applyForm.yearsOfExperience}
                                            onChange={handleFormChange}
                                            type="number"
                                            min="0"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-sm font-medium transition-all"
                                            placeholder="VD: 2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Khối Thư giới thiệu */}
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-2">
                                    Thư giới thiệu (Cover Letter)
                                </label>
                                <textarea
                                    name="coverLetter"
                                    value={applyForm.coverLetter}
                                    onChange={handleFormChange}
                                    rows="4"
                                    placeholder="Viết vài lời giới thiệu ngắn gọn về bản thân để thu hút nhà tuyển dụng..."
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-sm resize-none leading-relaxed font-medium transition-all"
                                ></textarea>
                            </div>
                        </div>

                        <div className="px-6 py-5 border-t border-slate-100 flex justify-end gap-3 bg-white sticky bottom-0 z-10">
                            <button
                                type="button"
                                onClick={() => setShowApplyModal(false)}
                                className="px-6 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                {isSaving ? 'Đang xử lý...' : 'Nộp hồ sơ'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default JobDetail;
