import React, { useState, useRef } from 'react';
import {
    Search,
    MapPin,
    Filter,
    Sparkles,
    MessageSquare,
    FileText,
    Star,
    Briefcase,
    Bot,
    UploadCloud,
    X,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ChevronUp,
    Loader2,
    AlertCircle,
    Zap,
    SlidersHorizontal,
    AlertTriangle,
} from 'lucide-react';
import { mockCandidates } from '../../../mock/data';
import { Link } from 'react-router-dom';
import applicationService from '~/services/applicationService';

// ==========================================
// HÀM HELPER: UPLOAD TRỰC TIẾP LÊN CLOUDINARY
// ==========================================
const uploadToCloudinary = async (file) => {
    const cloudName = 'dw41rvui8';
    const apiKey = '434154359271396';
    const apiSecret = 'UecGX8Jyli781QkvEyAeipsgP9A';

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signatureString = `timestamp=${timestamp}${apiSecret}`;

    // Mã hóa SHA-1 sử dụng Native API của trình duyệt
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

// Map nhãn cho các trọng số
const AI_WEIGHT_LABELS = {
    weightExp: 'Kinh nghiệm (Exp)',
    weightSkills: 'Kỹ năng (Skills)',
    weightRole: 'Vai trò (Role)',
    weightTools: 'Công cụ (Tools)',
    weightEdu: 'Học vấn (Edu)',
    weightSoft: 'Kỹ năng mềm (Soft)',
};

const SearchCandidates = () => {
    const [activeTab, setActiveTab] = useState('auto_match');

    // === STATES TAB 1: AUTO MATCH ===
    const [searchTerm, setSearchTerm] = useState('');
    const [filterScore, setFilterScore] = useState('all');
    const filteredCandidates =
        mockCandidates?.filter((candidate) => {
            const matchSearch =
                candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
            let matchScoreFilter = true;
            if (filterScore === 'high') matchScoreFilter = candidate.matchScore >= 80;
            if (filterScore === 'medium') matchScoreFilter = candidate.matchScore >= 50 && candidate.matchScore < 80;
            return matchSearch && matchScoreFilter;
        }) || [];

    // === STATES TAB 2: AI SCANNER ===
    const [jdType, setJdType] = useState('text');
    const [jdText, setJdText] = useState('');
    const [jdFile, setJdFile] = useState(null);
    const [cvFiles, setCvFiles] = useState([]);
    const [customRules, setCustomRules] = useState('');

    // AI SETTINGS STATES
    const [aiWeights, setAiWeights] = useState({
        weightExp: 20,
        weightSkills: 30,
        weightRole: 20,
        weightTools: 10,
        weightEdu: 10,
        weightSoft: 10,
    });
    const [useDefaultWeights, setUseDefaultWeights] = useState(true); // Mặc định gửi null

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

    // === HÀM THỰC THI QUÉT AI ===
    const handleStartScan = async () => {
        if (cvFiles.length === 0) return alert('Vui lòng tải lên ít nhất 1 CV để quét!');
        if (jdType === 'text' && !jdText.trim()) return alert('Vui lòng nhập Text JD!');
        if (jdType === 'file' && !jdFile) return alert('Vui lòng tải lên Ảnh/File JD!');
        if (!useDefaultWeights && totalWeight !== 100) return alert('Vui lòng phân bổ chính xác 100% cho cấu hình AI!');

        setIsScanning(true);
        setScanResults(null);
        setErrorLog(null);

        try {
            // 1. Upload Cloudinary lấy URLs
            let uploadedJdUrl = '';
            if (jdType === 'file' && jdFile) {
                uploadedJdUrl = await uploadToCloudinary(jdFile);
            }
            const uploadedCvUrls = [];
            for (const file of cvFiles) {
                uploadedCvUrls.push(await uploadToCloudinary(file));
            }

            // 2. Format AI Settings (Null hoặc 0.x)
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

            // 3. Format Payload gửi API
            const payload = {
                cvUrls: uploadedCvUrls,
                jdUrl: jdType === 'file' ? uploadedJdUrl : '',
                jdText: jdType === 'text' ? jdText : '',
                customRules: customRules,
                jobId: null,
                aiSettings: aiSettingsPayload,
            };

            console.log('PAYLOAD GỬI ĐI:', JSON.stringify(payload, null, 2));

            // 4. Gọi API
            const response = await applicationService.quickMatch(payload);
            setScanResults(response);
        } catch (error) {
            console.error('Lỗi khi quét AI:', error);

            let errorTitle = 'Lỗi hệ thống';
            let errorDetails = error.message;

            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                errorTitle = 'Lỗi kết nối mạng (Network Error / Connection Refused)';
                errorDetails =
                    'Frontend không thể kết nối đến Backend. Vui lòng kiểm tra xem Backend đã khởi động chưa, có đúng IP/Port không.';
            } else if (error.response) {
                errorTitle = `Lỗi từ Server (Status: ${error.response.status})`;
                errorDetails =
                    typeof error.response.data === 'object'
                        ? JSON.stringify(error.response.data, null, 2)
                        : error.response.data || 'Không có thông báo chi tiết từ server.';
            }

            setErrorLog({ title: errorTitle, details: errorDetails, raw: error.toString() });
        } finally {
            setIsScanning(false);
        }
    };

    const renderRecommendationBadge = (rec) => {
        if (rec === 'LƯU HỒ SƠ' || rec === 'ACCEPTED' || rec === 'PASS') {
            return (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                    ✅ {rec}
                </span>
            );
        }
        return (
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                ❌ {rec}
            </span>
        );
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto font-sans pb-10">
            {/* HEADER & TABS */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-0 z-20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles className="text-blue-600" size={28} /> Hệ Sinh Thái AI Tìm Kiếm Ứng Viên
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Sử dụng sức mạnh của Machine Learning và LLM để tự động hóa phễu tuyển dụng.
                        </p>
                    </div>
                </div>
                <div className="flex space-x-2 border-b border-gray-100 pb-0">
                    <button
                        onClick={() => setActiveTab('auto_match')}
                        className={`px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'auto_match' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Zap size={18} /> Gợi ý Tự động (Auto Match)
                    </button>
                    <button
                        onClick={() => setActiveTab('ai_scanner')}
                        className={`px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'ai_scanner' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Bot size={18} /> AI CV Scanner (Quét Nhanh)
                    </button>
                </div>
            </div>

            {/* TAB 1: AUTO MATCH */}
            {activeTab === 'auto_match' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tìm theo tên, kỹ năng..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <select
                                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 cursor-pointer text-gray-700 font-medium shadow-sm"
                                value={filterScore}
                                onChange={(e) => setFilterScore(e.target.value)}
                            >
                                <option value="all">Mọi độ phù hợp</option>
                                <option value="high">Phù hợp cao (80%+)</option>
                                <option value="medium">Phù hợp khá (50-80%)</option>
                            </select>
                            <button className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition flex items-center gap-2 font-medium shadow-sm">
                                <Filter size={18} /> Lọc thêm
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredCandidates.length > 0 ? (
                            filteredCandidates.map((candidate) => (
                                <div
                                    key={candidate.id}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-4">
                                            <img
                                                src={candidate.avatar}
                                                alt={candidate.name}
                                                className="w-14 h-14 rounded-full border border-gray-200 shadow-sm"
                                            />
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 leading-tight">
                                                    {candidate.name}
                                                </h3>
                                                <p className="text-blue-600 font-medium text-sm mt-0.5">
                                                    {candidate.title}
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-black text-sm border ${candidate.matchScore >= 80 ? 'bg-green-50 text-green-700 border-green-200' : candidate.matchScore >= 50 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                                        >
                                            <Sparkles size={14} /> {candidate.matchScore}%
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-medium mb-4">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={14} /> {candidate.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Briefcase size={14} /> Kinh nghiệm: {candidate.exp}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {candidate.skills.map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-gray-50 border border-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-auto bg-blue-50/50 p-3 rounded-xl border border-blue-100 mb-4">
                                        <p className="text-xs text-gray-500 mb-1">Gợi ý cho vị trí:</p>
                                        <p className="font-semibold text-sm text-blue-800 truncate">
                                            {candidate.matchedJob}
                                        </p>
                                    </div>
                                    <div className="flex gap-3 mt-auto pt-4 border-t border-gray-50">
                                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl transition">
                                            <FileText size={18} /> Xem CV
                                        </button>
                                        <Link
                                            to="/chat"
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-sm"
                                        >
                                            <MessageSquare size={18} /> Nhắn tin
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                                <Search size={40} className="mx-auto text-gray-300 mb-3" />
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Không tìm thấy ứng viên</h3>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: AI CV SCANNER */}
            {activeTab === 'ai_scanner' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col lg:flex-row gap-6">
                    {/* CỘT TRÁI: FORM INPUT */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-6">
                        {/* 1. Nhập JD */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <Briefcase size={18} className="text-purple-600" /> 1. Yêu cầu (JD)
                            </h3>
                            <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                                <button
                                    type="button"
                                    onClick={() => setJdType('text')}
                                    className={`flex-1 py-1.5 text-sm font-bold rounded-md transition ${jdType === 'text' ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Nhập Text
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setJdType('file')}
                                    className={`flex-1 py-1.5 text-sm font-bold rounded-md transition ${jdType === 'file' ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Tải Ảnh/File
                                </button>
                            </div>
                            {jdType === 'text' ? (
                                <textarea
                                    value={jdText}
                                    onChange={(e) => setJdText(e.target.value)}
                                    rows="5"
                                    placeholder="Dán nội dung Job Description vào đây..."
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 text-sm resize-none"
                                />
                            ) : (
                                <div>
                                    <input
                                        type="file"
                                        accept=".png,.jpg,.jpeg,.pdf"
                                        className="hidden"
                                        ref={jdFileInputRef}
                                        onChange={(e) => setJdFile(e.target.files[0])}
                                    />
                                    <div
                                        onClick={() => jdFileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition ${jdFile ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:bg-gray-50 bg-white'}`}
                                    >
                                        {jdFile ? (
                                            <p className="text-sm font-bold text-purple-700 truncate w-full text-center">
                                                {jdFile.name}
                                            </p>
                                        ) : (
                                            <>
                                                <UploadCloud size={32} className="text-gray-400 mb-2" />
                                                <p className="text-sm font-bold text-gray-600">Nhấn để tải Ảnh/PDF</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Upload CVs */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <FileText size={18} className="text-blue-600" /> 2. Tập CV (PDF)
                                </h3>
                                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                                    {cvFiles.length} CVs
                                </span>
                            </div>
                            <input
                                type="file"
                                multiple
                                accept=".pdf"
                                className="hidden"
                                ref={cvFileInputRef}
                                onChange={handleCvFilesChange}
                            />
                            <div
                                onClick={() => cvFileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition mb-4"
                            >
                                <UploadCloud size={32} className="text-gray-400 mb-2" />
                                <p className="text-sm font-bold text-gray-600">Tải lên hàng loạt CV</p>
                            </div>
                            {cvFiles.length > 0 && (
                                <div className="max-h-[150px] overflow-y-auto space-y-2 pr-1">
                                    {cvFiles.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between bg-white border border-gray-100 p-2.5 rounded-lg shadow-sm"
                                        >
                                            <span className="text-xs font-medium text-gray-700 truncate mr-2">
                                                {file.name}
                                            </span>
                                            <button
                                                onClick={() => removeCvFile(idx)}
                                                className="text-red-400 hover:text-red-600 p-1"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 3. Custom Rules */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                                <AlertCircle size={18} className="text-orange-500" /> 3. Luật riêng (Tùy chọn)
                            </h3>
                            <textarea
                                value={customRules}
                                onChange={(e) => setCustomRules(e.target.value)}
                                rows="2"
                                placeholder="VD: Bắt buộc tiếng Anh IELTS 6.5+"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-sm resize-none"
                            />
                        </div>

                        {/* 4. AI SETTINGS */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <SlidersHorizontal size={18} className="text-indigo-600" /> 4. Trọng số AI
                                </h3>
                                {!useDefaultWeights && (
                                    <span
                                        className={`text-xs font-bold px-2.5 py-1 rounded-md border ${totalWeight === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                                    >
                                        Tổng: {totalWeight}/100
                                    </span>
                                )}
                            </div>

                            <label className="flex items-center gap-2 mb-4 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                                    checked={useDefaultWeights}
                                    onChange={(e) => setUseDefaultWeights(e.target.checked)}
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Dùng cấu hình mặc định (Gửi null)
                                </span>
                            </label>

                            <div
                                className={`space-y-4 transition-opacity ${useDefaultWeights ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
                            >
                                {Object.entries(aiWeights).map(([key, value]) => (
                                    <div key={key} className="flex flex-col gap-1">
                                        <div className="flex justify-between text-xs font-semibold">
                                            <span className="text-gray-600">{AI_WEIGHT_LABELS[key]}</span>
                                            <span className="text-indigo-600">
                                                {value}% (Gửi API: {value / 100})
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={value}
                                            onChange={(e) => handleWeightChange(key, e.target.value)}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Nút RUN */}
                        <button
                            onClick={handleStartScan}
                            disabled={isScanning || (!useDefaultWeights && totalWeight !== 100)}
                            className={`w-full font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${isScanning || (!useDefaultWeights && totalWeight !== 100) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'}`}
                        >
                            {isScanning ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" /> Đang xử lý dữ liệu...
                                </>
                            ) : (
                                <>
                                    <Bot size={20} /> Phân tích ngay
                                </>
                            )}
                        </button>
                    </div>

                    {/* CỘT PHẢI: KẾT QUẢ & HIỂN THỊ LỖI */}
                    <div className="w-full lg:w-2/3 flex flex-col gap-6">
                        {/* BOX HIỂN THỊ ERROR LOG */}
                        {errorLog && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 animate-in fade-in slide-in-from-top-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle size={24} className="text-red-600 shrink-0 mt-0.5" />
                                    <div className="w-full">
                                        <h3 className="font-bold text-red-800 text-lg mb-1">{errorLog.title}</h3>
                                        <p className="text-red-600 text-sm mb-3 leading-relaxed">{errorLog.details}</p>
                                        <details className="group border border-red-200 bg-white rounded-lg cursor-pointer">
                                            <summary className="px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50 transition rounded-lg">
                                                Xem Log kỹ thuật (Dành cho Developer)
                                            </summary>
                                            <div className="p-4 pt-0">
                                                <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto mt-2 font-mono shadow-inner whitespace-pre-wrap">
                                                    {errorLog.raw}
                                                </pre>
                                            </div>
                                        </details>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!scanResults && !isScanning && !errorLog ? (
                            <div className="h-full bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center p-10 text-gray-400 min-h-[500px]">
                                <Bot size={64} className="mb-4 opacity-30 text-purple-600" />
                                <h3 className="text-xl font-bold text-gray-600 mb-2">Bảng Xếp Hạng AI</h3>
                                <p className="text-center max-w-md text-sm leading-relaxed">
                                    Tải JD và CV lên cột bên trái, AI sẽ phân tích và đưa ra đánh giá dựa trên mức độ
                                    phù hợp.
                                </p>
                            </div>
                        ) : isScanning ? (
                            <div className="h-full bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center p-10 min-h-[500px]">
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                                    <Bot
                                        size={28}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-600"
                                    />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mt-6 mb-2">
                                    AI đang đọc CV và phân tích...
                                </h3>
                            </div>
                        ) : (
                            scanResults && (
                                <div className="space-y-4">
                                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900">
                                                🏆 Bảng xếp hạng Ứng viên
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Đã xử lý:{' '}
                                                <strong className="text-blue-600">
                                                    {scanResults?.total_processed || 0}
                                                </strong>{' '}
                                                CV
                                            </p>
                                        </div>
                                    </div>

                                    {scanResults?.leaderboard?.map((item, idx) => {
                                        const isExpanded = expandedCard === idx;
                                        const isPass =
                                            item.recommendation === 'LƯU HỒ SƠ' ||
                                            item.recommendation === 'ACCEPTED' ||
                                            item.recommendation === 'PASS';
                                        const summary = item.executive_summary || item.ai_analysis || {};
                                        const strengths = summary.strengths || [];
                                        const weaknesses = summary.weaknesses || [];

                                        return (
                                            <div
                                                key={idx}
                                                className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm overflow-hidden ${isPass ? 'border-green-200' : 'border-red-200'}`}
                                            >
                                                <div
                                                    className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-gray-50"
                                                    onClick={() => setExpandedCard(isExpanded ? null : idx)}
                                                >
                                                    <div className="flex items-center gap-4 flex-1 w-full min-w-0">
                                                        <div
                                                            className={`w-14 h-14 shrink-0 rounded-xl flex flex-col items-center justify-center text-white font-black shadow-inner ${isPass ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}
                                                        >
                                                            <span className="text-xl">{item.match_score}</span>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-3 flex-wrap mb-1">
                                                                <h3 className="font-bold text-gray-900 text-lg truncate">
                                                                    {item.candidate_file}
                                                                </h3>
                                                                {renderRecommendationBadge(item.recommendation)}
                                                            </div>
                                                            <p className="text-sm text-gray-600 line-clamp-2 pr-4">
                                                                {summary.final_verdict}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 p-2 bg-gray-100 rounded-full text-gray-500">
                                                        {isExpanded ? (
                                                            <ChevronUp size={20} />
                                                        ) : (
                                                            <ChevronDown size={20} />
                                                        )}
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 animate-in slide-in-from-top-2">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                            <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                                                                <h4 className="font-bold text-green-700 flex items-center gap-2 mb-3 border-b border-green-50 pb-2">
                                                                    <CheckCircle2 size={18} /> Điểm mạnh
                                                                </h4>
                                                                <ul className="space-y-2 text-sm text-gray-700 list-disc pl-4">
                                                                    {strengths.map((str, i) => (
                                                                        <li key={i}>{str}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                                                                <h4 className="font-bold text-red-700 flex items-center gap-2 mb-3 border-b border-red-50 pb-2">
                                                                    <XCircle size={18} /> Thiếu sót
                                                                </h4>
                                                                <ul className="space-y-2 text-sm text-gray-700 list-disc pl-4">
                                                                    {weaknesses.map((w, i) => (
                                                                        <li key={i}>{w}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>

                                                        {item.jd_core_evaluation && (
                                                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                                                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                                                    <h4 className="font-bold text-gray-800 text-sm">
                                                                        🔍 Phân tích Từng tiêu chí JD
                                                                    </h4>
                                                                </div>
                                                                <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                                                                    {item.jd_core_evaluation.map((evalItem, evIdx) => (
                                                                        <div
                                                                            key={evIdx}
                                                                            className="p-4 hover:bg-gray-50"
                                                                        >
                                                                            <div className="flex justify-between items-start gap-4 mb-2">
                                                                                <span className="font-semibold text-gray-800 text-sm flex-1">
                                                                                    {evalItem.criteria}
                                                                                </span>
                                                                                <span
                                                                                    className={`shrink-0 px-2.5 py-1 rounded text-xs font-bold border ${evalItem.status === 'PASS' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                                                                                >
                                                                                    {evalItem.status}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-xs text-gray-600 bg-gray-100/80 p-2 rounded border border-gray-100">
                                                                                <strong className="text-gray-700">
                                                                                    Dẫn chứng CV:{' '}
                                                                                </strong>{' '}
                                                                                {evalItem.evidence}
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
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchCandidates;
