import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import {
    Search,
    MapPin,
    Filter,
    Sparkles,
    MessageSquare,
    FileText,
    Users,
    Bot,
    UploadCloud,
    X,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ChevronUp,
    Loader2,
    AlertTriangle,
    BarChart3,
    Phone,
    Mail,
    ChevronLeft,
    ChevronRight,
    User,
} from 'lucide-react';
import applicationService from '~/services/applicationService';
import userService from '~/services/userService';

// ==========================================
// HÀM HELPER: UPLOAD TRỰC TIẾP LÊN CLOUDINARY
// ==========================================
const uploadToCloudinary = async (file) => {
    const cloudName = 'dw41rvui8';
    const apiKey = '434154359271396';
    const apiSecret = 'UecGX8Jyli781QkvEyAeipsgP9A';

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signatureString = `timestamp=${timestamp}${apiSecret}`;

    const msgBuffer = new TextEncoder().encode(signatureString);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
    });

    const data = await res.json();
    if (data.error) throw new Error(`Cloudinary Error: ${data.error.message}`);
    return data.secure_url;
};

const AI_WEIGHT_LABELS = {
    weightExp: 'Kinh nghiệm (Exp)',
    weightSkills: 'Kỹ năng (Skills)',
    weightRole: 'Vai trò (Role)',
    weightTools: 'Công cụ (Tools)',
    weightEdu: 'Học vấn (Edu)',
    weightSoft: 'Kỹ năng mềm (Soft)',
};

const SearchCandidates = () => {
    const navigate = useNavigate(); // Hook điều hướng
    const [activeTab, setActiveTab] = useState('candidate_list');

    // ========================================================
    // STATES TAB 1: DANH SÁCH ỨNG VIÊN
    // ========================================================
    const [candidates, setCandidates] = useState([]);
    const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (activeTab === 'candidate_list') {
            fetchCandidatesList();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, activeTab]);

    const fetchCandidatesList = async () => {
        setIsLoadingCandidates(true);
        try {
            const res = await userService.getCandidates(page, 12);
            const data = res.data || res;
            if (data && data.content) {
                setCandidates(data.content);
                setTotalPages(data.totalPages || 1);
                setTotalElements(data.totalElements || 0);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách ứng viên:', error);
        } finally {
            setIsLoadingCandidates(false);
        }
    };

    const filteredCandidates = candidates.filter((c) => {
        if (!searchTerm) return true;
        const kw = searchTerm.toLowerCase();
        return (c.fullName && c.fullName.toLowerCase().includes(kw)) || (c.email && c.email.toLowerCase().includes(kw));
    });

    const handleChatWithCandidate = (e, candidate) => {
        e.stopPropagation(); // Chống nổi bọt sự kiện click ra card bên ngoài
        navigate('/hr/chat', {
            // Đảm bảo URL chat của HR
            state: {
                newContact: {
                    id: candidate.id,
                    email: candidate.email,
                    name: candidate.fullName || 'Ứng viên',
                    avatar: candidate.avatar,
                },
            },
        });
    };

    // ========================================================
    // STATES TAB 2: AI SCANNER
    // ========================================================
    const [jdType, setJdType] = useState('text');
    const [jdText, setJdText] = useState('');
    const [jdFile, setJdFile] = useState(null);
    const [cvFiles, setCvFiles] = useState([]);
    const [customRules, setCustomRules] = useState('');

    const [aiWeights, setAiWeights] = useState({
        weightExp: 20,
        weightSkills: 30,
        weightRole: 20,
        weightTools: 10,
        weightEdu: 10,
        weightSoft: 10,
    });
    const [useDefaultWeights, setUseDefaultWeights] = useState(true);

    const [isScanning, setIsScanning] = useState(false);
    const [scanResults, setScanResults] = useState(null);
    const [expandedCard, setExpandedCard] = useState(null);
    const [errorLog, setErrorLog] = useState(null);

    const jdFileInputRef = useRef(null);
    const cvFileInputRef = useRef(null);

    const totalWeight = Object.values(aiWeights).reduce((sum, val) => sum + val, 0);

    const handleWeightChange = (key, value) => {
        const numValue = parseInt(value, 10) || 0;
        const otherSum = Object.entries(aiWeights)
            .filter(([k]) => k !== key)
            .reduce((sum, [, val]) => sum + val, 0);
        const maxAllowed = 100 - otherSum;
        setAiWeights((prev) => ({ ...prev, [key]: Math.min(numValue, maxAllowed) }));
    };

    const handleCvFilesChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((f) => f.size <= 5 * 1024 * 1024);
        if (validFiles.length !== files.length) alert('Một số file vượt quá 5MB đã bị loại bỏ.');
        setCvFiles((prev) => [...prev, ...validFiles]);
    };

    const removeCvFile = (index) => setCvFiles((prev) => prev.filter((_, i) => i !== index));

    const handleStartScan = async () => {
        if (cvFiles.length === 0) return alert('Vui lòng tải lên ít nhất 1 CV để quét!');
        if (jdType === 'text' && !jdText.trim()) return alert('Vui lòng nhập Text JD!');
        if (jdType === 'file' && !jdFile) return alert('Vui lòng tải lên Ảnh/File JD!');
        if (!useDefaultWeights && totalWeight !== 100) return alert('Vui lòng phân bổ chính xác 100% cho cấu hình AI!');

        setIsScanning(true);
        setScanResults(null);
        setErrorLog(null);

        try {
            let uploadedJdUrl = '';
            if (jdType === 'file' && jdFile) {
                uploadedJdUrl = await uploadToCloudinary(jdFile);
            }
            const uploadedCvUrls = [];
            for (const file of cvFiles) {
                uploadedCvUrls.push(await uploadToCloudinary(file));
            }

            const aiSettingsPayload = useDefaultWeights
                ? {
                      weightExp: null,
                      weightSkills: null,
                      weightRole: null,
                      weightTools: null,
                      weightEdu: null,
                      weightSoft: null,
                  }
                : {
                      weightExp: aiWeights.weightExp / 100,
                      weightSkills: aiWeights.weightSkills / 100,
                      weightRole: aiWeights.weightRole / 100,
                      weightTools: aiWeights.weightTools / 100,
                      weightEdu: aiWeights.weightEdu / 100,
                      weightSoft: aiWeights.weightSoft / 100,
                  };

            const payload = {
                cvUrls: uploadedCvUrls,
                jdUrl: jdType === 'file' ? uploadedJdUrl : '',
                jdText: jdType === 'text' ? jdText : '',
                customRules: customRules,
                jobId: null,
                aiSettings: aiSettingsPayload,
            };

            const response = await applicationService.quickMatch(payload);
            setScanResults(response);
        } catch (error) {
            console.error('Lỗi khi quét AI:', error);
            let errorTitle = 'Lỗi hệ thống';
            let errorDetails = error.message;

            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                errorTitle = 'Lỗi kết nối mạng (Network Error)';
                errorDetails = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.';
            } else if (error.response) {
                errorTitle = `Lỗi từ Server (${error.response.status})`;
                errorDetails =
                    typeof error.response.data === 'object'
                        ? JSON.stringify(error.response.data, null, 2)
                        : error.response.data || 'Không rõ nguyên nhân.';
            }

            setErrorLog({ title: errorTitle, details: errorDetails, raw: error.toString() });
        } finally {
            setIsScanning(false);
        }
    };

    const renderRecommendationBadge = (rec) => {
        if (rec === 'LƯU HỒ SƠ' || rec === 'ACCEPTED' || rec === 'PASS') {
            return (
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                    ✅ {rec}
                </span>
            );
        }
        return (
            <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-xs font-bold border border-rose-200">
                ❌ {rec}
            </span>
        );
    };

    return (
        <div className="bg-slate-50 min-h-screen text-slate-800 font-sans relative overflow-x-hidden pb-12">
            <div className="max-w-[1400px] mx-auto px-6 py-8">
                {/* Header & Segmented Control */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                            Tìm kiếm Ứng viên
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">
                            Khám phá và đánh giá nhân tài với độ chính xác cao.
                        </p>
                    </div>

                    <div className="bg-slate-200/60 rounded-full p-1.5 flex items-center self-start">
                        <button
                            onClick={() => setActiveTab('candidate_list')}
                            className={`text-sm font-bold px-6 py-2.5 rounded-full transition-all duration-200 flex items-center gap-2 ${
                                activeTab === 'candidate_list'
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-300/50'
                            }`}
                        >
                            <Users size={16} className={activeTab === 'candidate_list' ? 'text-blue-500' : ''} />
                            Danh sách Ứng viên
                        </button>
                        <button
                            onClick={() => setActiveTab('ai_scanner')}
                            className={`text-sm font-bold px-6 py-2.5 rounded-full transition-all duration-200 flex items-center gap-2 ${
                                activeTab === 'ai_scanner'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-300/50'
                            }`}
                        >
                            <Bot size={16} className={activeTab === 'ai_scanner' ? 'text-white' : 'text-slate-400'} />{' '}
                            AI Scanner
                        </button>
                    </div>
                </div>

                {/* ========================================================
                    TAB 1: DANH SÁCH ỨNG VIÊN (TÍCH HỢP API)
                ======================================================== */}
                {activeTab === 'candidate_list' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên hoặc email ứng viên..."
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition font-medium text-slate-900 placeholder:text-slate-400"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <X
                                        size={18}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-rose-500"
                                        onClick={() => setSearchTerm('')}
                                    />
                                )}
                            </div>
                        </div>

                        {isLoadingCandidates ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <Loader2 size={40} className="animate-spin text-blue-500" />
                                <p className="text-slate-500 font-medium">Đang tải danh sách ứng viên...</p>
                            </div>
                        ) : filteredCandidates.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredCandidates.map((c) => (
                                    <div
                                        key={c.id}
                                        onClick={() => navigate(`/hr/candidates/${c.id}`)} // ĐIỀU HƯỚNG TỚI CHI TIẾT
                                        className="bg-white cursor-pointer rounded-[1.5rem] border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 p-6 flex flex-col relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="flex items-start gap-4 mb-5">
                                            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0 relative">
                                                {c.avatar ? (
                                                    <img
                                                        src={c.avatar}
                                                        alt={c.fullName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User size={28} className="text-slate-400" />
                                                )}
                                                {c.isActive && (
                                                    <div className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3
                                                    className="font-extrabold text-[19px] text-slate-900 leading-tight truncate mb-1"
                                                    title={c.fullName || 'Chưa cập nhật tên'}
                                                >
                                                    {c.fullName || 'Ứng viên chưa cập nhật tên'}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium mt-1.5">
                                                    <Mail size={14} className="shrink-0 text-slate-400" />
                                                    <span className="truncate">{c.email}</span>
                                                </div>
                                                {c.phoneNumber && (
                                                    <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium mt-1.5">
                                                        <Phone size={14} className="shrink-0 text-slate-400" />
                                                        <span>{c.phoneNumber}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-5 border-t border-slate-100 flex gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/hr/candidates/${c.id}`);
                                                }}
                                                className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 font-bold text-sm transition-colors border border-blue-100"
                                            >
                                                <FileText size={16} /> Xem Hồ sơ
                                            </button>
                                            <button
                                                onClick={(e) => handleChatWithCandidate(e, c)}
                                                className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold text-sm transition-colors shadow-sm"
                                            >
                                                <MessageSquare size={16} /> Nhắn tin
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-300 shadow-sm">
                                <Search size={48} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy ứng viên</h3>
                                <p className="text-slate-500">Hãy thử thay đổi từ khóa tìm kiếm.</p>
                            </div>
                        )}

                        {!isLoadingCandidates && totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 pt-8">
                                <button
                                    disabled={page === 0}
                                    onClick={() => setPage(page - 1)}
                                    className="p-2 border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="text-sm font-bold text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                                    Trang {page + 1} / {totalPages}
                                </span>
                                <button
                                    disabled={page === totalPages - 1}
                                    onClick={() => setPage(page + 1)}
                                    className="p-2 border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ========================================================
                    TAB 2: AI SCANNER
                ======================================================== */}
                {activeTab === 'ai_scanner' && (
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* ── CỘT TRÁI: CONFIGURATION ── */}
                        <div className="xl:col-span-4 flex flex-col gap-6">
                            <div className="bg-white rounded-[1.5rem] p-6 border border-slate-200 shadow-sm flex flex-col gap-6">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                                        <Bot className="text-white" size={20} />
                                    </div>
                                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                        Cấu hình Quét
                                    </h2>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-slate-800">Mô tả công việc (JD)</label>
                                        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                                            <button
                                                onClick={() => setJdType('text')}
                                                className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${jdType === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
                                            >
                                                Text
                                            </button>
                                            <button
                                                onClick={() => setJdType('file')}
                                                className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${jdType === 'file' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
                                            >
                                                File
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-1 border border-slate-200 shadow-inner">
                                        {jdType === 'text' ? (
                                            <textarea
                                                className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-800 resize-none h-32 placeholder:text-slate-400 p-3 outline-none"
                                                placeholder="Dán nội dung JD vào đây để làm tiêu chuẩn quét..."
                                                value={jdText}
                                                onChange={(e) => setJdText(e.target.value)}
                                            ></textarea>
                                        ) : (
                                            <div
                                                onClick={() => jdFileInputRef.current?.click()}
                                                className={`h-32 m-2 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${jdFile ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:bg-white bg-transparent'}`}
                                            >
                                                <input
                                                    type="file"
                                                    accept=".png,.jpg,.jpeg,.pdf"
                                                    className="hidden"
                                                    ref={jdFileInputRef}
                                                    onChange={(e) => setJdFile(e.target.files[0])}
                                                />
                                                {jdFile ? (
                                                    <p className="text-sm font-bold text-blue-700 truncate px-4 text-center">
                                                        {jdFile.name}
                                                    </p>
                                                ) : (
                                                    <>
                                                        <UploadCloud size={28} className="text-slate-400 mb-2" />
                                                        <p className="text-xs font-bold text-slate-500">
                                                            Tải Ảnh/PDF lên
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-800">
                                        Luật tùy chỉnh (Tùy chọn)
                                    </label>
                                    <div className="bg-slate-50 rounded-xl p-1 border border-slate-200 shadow-inner">
                                        <input
                                            className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-medium text-slate-800 placeholder:text-slate-400 p-3"
                                            placeholder="VD: Bắt buộc tiếng Anh IELTS 6.5+"
                                            type="text"
                                            value={customRules}
                                            onChange={(e) => setCustomRules(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 mt-2">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <label className="text-sm font-bold text-slate-800">Trọng số đánh giá AI</label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                                                Mặc định
                                            </span>
                                            <input
                                                type="checkbox"
                                                className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                                checked={useDefaultWeights}
                                                onChange={(e) => setUseDefaultWeights(e.target.checked)}
                                            />
                                        </label>
                                    </div>
                                    <div
                                        className={`space-y-4 transition-opacity ${useDefaultWeights ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
                                    >
                                        {['weightExp', 'weightSkills', 'weightRole'].map((key) => (
                                            <div key={key} className="flex flex-col gap-2">
                                                <div className="flex justify-between text-xs font-bold text-slate-600">
                                                    <span>{AI_WEIGHT_LABELS[key]}</span>
                                                    <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                                        {aiWeights[key]}%
                                                    </span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={aiWeights[key]}
                                                    onChange={(e) => handleWeightChange(key, e.target.value)}
                                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    {!useDefaultWeights && totalWeight !== 100 && (
                                        <p className="text-xs font-bold text-red-500 animate-pulse text-center bg-red-50 py-1.5 rounded-lg border border-red-100">
                                            Tổng trọng số phải bằng 100% (Hiện tại: {totalWeight}%)
                                        </p>
                                    )}
                                </div>

                                <div className="mt-2 flex flex-col gap-3 border-t border-slate-100 pt-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-sm font-bold text-slate-800">Tập CV Ứng viên</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                                                {cvFiles.length} files
                                            </span>
                                            <button
                                                onClick={() => cvFileInputRef.current?.click()}
                                                className="text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-md hover:bg-blue-100 transition"
                                            >
                                                Thêm CV
                                            </button>
                                        </div>
                                        <input
                                            type="file"
                                            multiple
                                            accept=".pdf"
                                            className="hidden"
                                            ref={cvFileInputRef}
                                            onChange={handleCvFilesChange}
                                        />
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-2 border border-slate-200 shadow-inner">
                                        {cvFiles.length === 0 ? (
                                            <div
                                                onClick={() => cvFileInputRef.current?.click()}
                                                className="h-20 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-white rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors m-1"
                                            >
                                                <p className="text-xs font-bold text-slate-400">
                                                    + Tải lên nhiều CV (.pdf)
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="max-h-[120px] overflow-y-auto space-y-1.5 p-1 custom-scrollbar">
                                                {cvFiles.map((file, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-lg shadow-sm"
                                                    >
                                                        <span className="text-[11px] font-bold text-slate-700 truncate mr-2">
                                                            {file.name}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeCvFile(idx);
                                                            }}
                                                            className="text-rose-400 hover:text-rose-600 bg-rose-50 p-1 rounded-md transition-colors"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleStartScan}
                                        disabled={isScanning || (!useDefaultWeights && totalWeight !== 100)}
                                        className="mt-4 bg-blue-600 text-white font-bold text-sm py-3.5 rounded-xl shadow-md hover:bg-blue-700 active:scale-95 transition-all w-full flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
                                    >
                                        {isScanning ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <BarChart3 size={18} />
                                        )}
                                        {isScanning ? 'Đang phân tích...' : 'Bắt đầu quét sâu'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── CỘT PHẢI: KẾT QUẢ ── */}
                        <div className="xl:col-span-8 flex flex-col gap-6">
                            <div className="flex justify-between items-center bg-white rounded-xl px-6 py-4 shadow-sm border border-slate-200">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="text-blue-600" size={20} />
                                    <h2 className="font-extrabold text-[18px] text-slate-900">Kết quả Quét</h2>
                                    <span className="ml-2 bg-slate-100 text-slate-600 font-bold text-[11px] px-2.5 py-1 rounded-md border border-slate-200">
                                        Đã xử lý: {scanResults?.total_processed || 0}
                                    </span>
                                    {isScanning && (
                                        <span className="ml-2 text-blue-600 text-xs font-bold flex items-center gap-1 animate-pulse">
                                            <Loader2 size={12} className="animate-spin" /> Đang chạy
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 shadow-sm">
                                        <UploadCloud size={14} /> Xuất báo cáo
                                    </button>
                                </div>
                            </div>

                            {errorLog ? (
                                <div className="bg-rose-50 border border-rose-200 rounded-[1.5rem] p-8 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-rose-100">
                                            <AlertTriangle size={32} className="text-rose-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-black text-rose-900 text-xl mb-2">{errorLog.title}</h3>
                                            <p className="text-rose-700 font-medium mb-4 leading-relaxed">
                                                {errorLog.details}
                                            </p>
                                            <details className="bg-white rounded-xl border border-rose-200 overflow-hidden group shadow-sm">
                                                <summary className="px-5 py-3 font-bold text-sm text-rose-800 cursor-pointer bg-rose-50 hover:bg-rose-100 transition-colors list-none flex items-center gap-2">
                                                    <ChevronDown
                                                        size={16}
                                                        className="group-open:-rotate-180 transition-transform"
                                                    />{' '}
                                                    Xem Log Lỗi
                                                </summary>
                                                <pre className="p-5 bg-slate-900 text-emerald-400 text-xs font-mono overflow-auto max-h-60 custom-scrollbar whitespace-pre-wrap">
                                                    {errorLog.raw}
                                                </pre>
                                            </details>
                                        </div>
                                    </div>
                                </div>
                            ) : !scanResults && !isScanning ? (
                                <div className="h-full bg-white rounded-[2rem] border border-dashed border-slate-300 shadow-sm flex flex-col items-center justify-center p-12 text-slate-500 min-h-[400px]">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                                        <Bot size={40} className="text-slate-300" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
                                        Hệ thống chờ lệnh
                                    </h3>
                                    <p className="text-center max-w-md text-sm font-medium leading-relaxed">
                                        Cấu hình thông số bên trái và bắt đầu quét. AI sẽ đọc từng CV và đối sánh với JD
                                        để tìm ra nhân tài phù hợp nhất.
                                    </p>
                                </div>
                            ) : isScanning ? (
                                <div className="h-full bg-white rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center p-12 min-h-[400px]">
                                    <div className="relative mb-8">
                                        <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                                        <Bot
                                            size={24}
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse"
                                        />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-2 tracking-tight">
                                        Đang trích xuất & chấm điểm
                                    </h3>
                                    <p className="text-slate-500 font-medium text-sm">Vui lòng đợi vài phút...</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {scanResults?.leaderboard?.map((item, idx) => {
                                        const isExpanded = expandedCard === idx;
                                        const isPass =
                                            item.recommendation === 'LƯU HỒ SƠ' ||
                                            item.recommendation === 'ACCEPTED' ||
                                            item.recommendation === 'PASS';
                                        const summary = item.executive_summary || item.ai_analysis || {};
                                        const evalCore = item.jd_core_evaluation || [];

                                        return (
                                            <div
                                                key={idx}
                                                className={`bg-white rounded-[1.5rem] p-6 shadow-sm border relative overflow-hidden flex flex-col gap-5 transition-all hover:shadow-md ${isPass ? 'border-emerald-200' : 'border-slate-200'}`}
                                            >
                                                {isPass && (
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                                                )}
                                                <div
                                                    className="flex items-start justify-between cursor-pointer"
                                                    onClick={() => setExpandedCard(isExpanded ? null : idx)}
                                                >
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                                                            <span className="font-black text-lg text-slate-600">
                                                                #{idx + 1}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="font-extrabold text-[18px] text-slate-900 leading-tight mb-1 truncate max-w-[200px] sm:max-w-md">
                                                                {item.candidate_file}
                                                            </h3>
                                                            {renderRecommendationBadge(item.recommendation)}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`px-4 py-2.5 rounded-2xl font-black text-xl flex flex-col items-center leading-none border ${isPass ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                                                    >
                                                        <span>{item.match_score}</span>
                                                        <span className="text-[9px] uppercase tracking-widest opacity-80 mt-1">
                                                            Score
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles className="text-blue-600" size={16} />
                                                        <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                                                            Đánh giá Tổng quan
                                                        </h4>
                                                    </div>
                                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                                        {summary.final_verdict || 'Không có tóm tắt.'}
                                                    </p>
                                                </div>
                                                <div className="flex justify-center -mt-2">
                                                    <button
                                                        onClick={() => setExpandedCard(isExpanded ? null : idx)}
                                                        className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-blue-600 transition-colors bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm uppercase tracking-wide"
                                                    >
                                                        {isExpanded ? 'Đóng phân tích' : 'Mở phân tích chi tiết'}{' '}
                                                        {isExpanded ? (
                                                            <ChevronUp size={14} />
                                                        ) : (
                                                            <ChevronDown size={14} />
                                                        )}
                                                    </button>
                                                </div>
                                                {isExpanded && (
                                                    <div className="pt-2 animate-in slide-in-from-top-2 duration-300 space-y-5">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="flex items-start gap-2 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                                                                <CheckCircle2
                                                                    size={18}
                                                                    className="text-emerald-600 shrink-0 mt-0.5"
                                                                />
                                                                <div>
                                                                    <h4 className="font-bold text-sm text-emerald-900 mb-2">
                                                                        Điểm nổi bật
                                                                    </h4>
                                                                    <ul className="text-sm text-emerald-800 space-y-1.5 list-disc pl-4 font-medium">
                                                                        {(summary.strengths || []).map((s, i) => (
                                                                            <li key={i}>{s}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-2 bg-rose-50/50 p-4 rounded-xl border border-rose-100/50">
                                                                <XCircle
                                                                    size={18}
                                                                    className="text-rose-600 shrink-0 mt-0.5"
                                                                />
                                                                <div>
                                                                    <h4 className="font-bold text-sm text-rose-900 mb-2">
                                                                        Cần lưu ý
                                                                    </h4>
                                                                    <ul className="text-sm text-rose-800 space-y-1.5 list-disc pl-4 font-medium">
                                                                        {(summary.weaknesses || []).map((w, i) => (
                                                                            <li key={i}>{w}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {evalCore.length > 0 && (
                                                            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                                                                <h4 className="font-bold text-[11px] text-slate-500 uppercase tracking-wider pl-1">
                                                                    Chi tiết Tiêu chí
                                                                </h4>
                                                                <div className="grid grid-cols-1 gap-3">
                                                                    {evalCore.map((ev, i) => (
                                                                        <div
                                                                            key={i}
                                                                            className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col gap-2"
                                                                        >
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="font-bold text-sm text-slate-800">
                                                                                    {ev.criteria}
                                                                                </span>
                                                                                <span
                                                                                    className={`font-bold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider border ${ev.status === 'PASS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}
                                                                                >
                                                                                    {ev.status}
                                                                                </span>
                                                                            </div>
                                                                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className={`h-full rounded-full ${ev.status === 'PASS' ? 'bg-emerald-500 w-[95%]' : 'bg-rose-500 w-[40%]'}`}
                                                                                ></div>
                                                                            </div>
                                                                            <p className="text-[12px] font-medium text-slate-600 leading-relaxed mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                                                <strong className="text-slate-800">
                                                                                    CV ghi:
                                                                                </strong>{' '}
                                                                                {ev.evidence}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default SearchCandidates;
