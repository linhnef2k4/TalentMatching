import React, { useState } from 'react';
import {
    Briefcase,
    MapPin,
    DollarSign,
    Clock,
    Calendar,
    Send,
    Loader2,
    Users,
    GraduationCap,
    Tags,
    Star,
    Layers,
    SlidersHorizontal,
    Zap,
    Sparkles,
    Wand2,
    FileText,
    CheckCircle2,
    X,
} from 'lucide-react';
import jobService from '~/services/jobService';
import aiService from '~/services/aiService';
import toast, { Toaster } from 'react-hot-toast';

// Map nhãn cho các trọng số AI
const AI_WEIGHT_LABELS = {
    weightExp: 'Kinh nghiệm (Exp)',
    weightSkills: 'Kỹ năng (Skills)',
    weightRole: 'Vai trò (Role)',
    weightTools: 'Công cụ (Tools)',
    weightEdu: 'Học vấn (Edu)',
    weightSoft: 'Kỹ năng mềm (Soft)',
};

const JDOptimizer = () => {
    // Quản lý Tab: 'ai' hoặc 'manual'
    const [activeTab, setActiveTab] = useState('ai');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // State cho Tab AI
    const [aiPrompt, setAiPrompt] = useState('');

    // --- AI SETTINGS STATES ---
    const [useDefaultWeights, setUseDefaultWeights] = useState(true);
    const [aiWeights, setAiWeights] = useState({
        weightExp: 20,
        weightSkills: 30,
        weightRole: 20,
        weightTools: 10,
        weightEdu: 10,
        weightSoft: 10,
    });

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        jobType: 'FULL_TIME',
        experienceLevel: 'Không yêu cầu',
        minExpYears: 0,
        jobLevel: 'JUNIOR',
        educationLevel: 'NOT_REQUIRED',
        quantity: 1,
        location: '',
        salaryMin: '',
        salaryMax: '',
        salaryNegotiable: false,
        deadline: '',
        description: '',
        requirements: '',
        benefits: '',
        requiredSkills: '',
        categories: '',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    // --- LOGIC XỬ LÝ THANH TRƯỢT AI ---
    const totalWeight = Object.values(aiWeights).reduce((sum, val) => sum + val, 0);

    const handleWeightChange = (key, value) => {
        const numValue = parseInt(value, 10) || 0;
        const otherSum = Object.entries(aiWeights)
            .filter(([k]) => k !== key)
            .reduce((sum, [, val]) => sum + val, 0);
        const maxAllowed = 100 - otherSum;
        setAiWeights((prev) => ({ ...prev, [key]: Math.min(numValue, maxAllowed) }));
    };

    // --- GỌI API AI TỪ TAB NHẬP NHÁP ---
    const handleGenerateAI = async () => {
        if (aiPrompt.trim().length < 10) {
            toast.error('Vui lòng nhập ít nhất 10 ký tự để AI có thể hiểu ý bạn!', { id: 'ai-toast' });
            return;
        }

        setIsGenerating(true);
        toast.loading('AI đang phân tích và viết JD chuyên nghiệp (Mất khoảng 5-10s)...', { id: 'ai-toast' });

        try {
            const res = await aiService.generateJD(aiPrompt);
            const data = res.data || res;

            // Bóc tách mảng thành chuỗi
            const requiredSkillsStr = Array.isArray(data.requiredSkills)
                ? data.requiredSkills.join(', ')
                : data.requiredSkills || '';
            const categoriesStr = Array.isArray(data.categories) ? data.categories.join(', ') : data.categories || '';

            // Xử lý ngày tháng ISO (lấy phần YYYY-MM-DD để nhét vào input type="date")
            let formattedDeadline = formData.deadline;
            if (data.deadline) {
                formattedDeadline = data.deadline.split('T')[0];
            }

            // Đổ dữ liệu trả về đè vào Form
            setFormData((prev) => ({
                ...prev,
                title: data.title || prev.title,
                jobType: data.jobType || prev.jobType,
                experienceLevel: data.experienceLevel || prev.experienceLevel,
                minExpYears: data.minExpYears !== undefined ? data.minExpYears : prev.minExpYears,
                jobLevel: data.jobLevel || prev.jobLevel,
                educationLevel: data.educationLevel || prev.educationLevel,
                quantity: data.quantity !== undefined ? data.quantity : prev.quantity,
                location: data.location || prev.location,
                salaryMin: data.salaryMin !== undefined ? data.salaryMin : prev.salaryMin,
                salaryMax: data.salaryMax !== undefined ? data.salaryMax : prev.salaryMax,
                salaryNegotiable: data.salaryNegotiable !== undefined ? data.salaryNegotiable : prev.salaryNegotiable,
                deadline: formattedDeadline,
                description: data.description || prev.description,
                requirements: data.requirements || prev.requirements,
                benefits: data.benefits || prev.benefits,
                requiredSkills: requiredSkillsStr || prev.requiredSkills,
                categories: categoriesStr || prev.categories,
            }));

            // Chuyển sang tab Form để user review
            setActiveTab('manual');
            toast.success('Bùm! JD đã được tạo thành công! Hãy kiểm tra lại nhé ✨', {
                id: 'ai-toast',
                duration: 4000,
            });
            setAiPrompt(''); // Clear prompt
        } catch (error) {
            console.error('Lỗi khi tạo JD bằng AI:', error);
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi gọi AI. Vui lòng thử lại!', {
                id: 'ai-toast',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    // Submit gọi API Đăng tin
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!useDefaultWeights && totalWeight !== 100) {
            toast.error('Vui lòng phân bổ chính xác 100% (Tổng = 1.0) cho cấu hình AI!');
            return;
        }

        setIsSubmitting(true);
        toast.loading('Đang đăng tin tuyển dụng...', { id: 'submit-toast' });

        try {
            const splitToArray = (str) =>
                str
                    ? str
                          .split(',')
                          .map((s) => s.trim())
                          .filter((s) => s)
                    : [];

            // Xử lý AI Settings Payload
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
                ...formData,
                salaryMin: formData.salaryNegotiable ? 0 : Number(formData.salaryMin) || 0,
                salaryMax: formData.salaryNegotiable ? 0 : Number(formData.salaryMax) || 0,
                minExpYears: Number(formData.minExpYears) || 0,
                quantity: Number(formData.quantity) || 1,
                deadline: formData.deadline ? new Date(formData.deadline).toISOString() : new Date().toISOString(),
                requiredSkills: splitToArray(formData.requiredSkills),
                categories: splitToArray(formData.categories),
                aiSettings: aiSettingsPayload,
            };

            await jobService.createJob(payload);

            toast.success('Đăng tin tuyển dụng thành công!', { id: 'submit-toast' });

            // Reset form
            setFormData({
                title: '',
                jobType: 'FULL_TIME',
                experienceLevel: 'Không yêu cầu',
                minExpYears: 0,
                jobLevel: 'JUNIOR',
                educationLevel: 'NOT_REQUIRED',
                quantity: 1,
                location: '',
                salaryMin: '',
                salaryMax: '',
                salaryNegotiable: false,
                deadline: '',
                description: '',
                requirements: '',
                benefits: '',
                requiredSkills: '',
                categories: '',
            });
            setUseDefaultWeights(true);
            setActiveTab('ai'); // Quay lại tab AI cho lần đăng tiếp theo
        } catch (error) {
            console.error('Lỗi tạo job:', error);
            toast.error('Có lỗi xảy ra khi đăng tin. Vui lòng thử lại!', { id: 'submit-toast' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans relative">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Đăng tin tuyển dụng</h1>
                    <p className="text-gray-500 mt-1">Thu hút hàng ngàn ứng viên tiềm năng trên TalentMatch.</p>
                </div>

                {/* ── TABS NAV ── */}
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button
                        type="button"
                        onClick={() => setActiveTab('ai')}
                        className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative ${activeTab === 'ai' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Wand2 size={18} /> Khởi tạo nhanh bằng AI
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                            Pro
                        </span>
                        {activeTab === 'ai' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-md"></div>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('manual')}
                        className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative ${activeTab === 'manual' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <FileText size={18} /> Biên tập chi tiết
                        {activeTab === 'manual' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md"></div>
                        )}
                    </button>
                </div>

                {/* ── TAB 1: KHỞI TẠO BẰNG AI ── */}
                {activeTab === 'ai' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                        <div className="p-8 md:p-12 flex flex-col items-center text-center relative overflow-hidden bg-gradient-to-br from-indigo-50/50 to-white">
                            {/* Decorative background shapes */}
                            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg mb-6 relative z-10">
                                <Zap size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-3 relative z-10">
                                AI Viết Job Description
                            </h2>
                            <p className="text-gray-600 mb-8 max-w-lg relative z-10 font-medium leading-relaxed">
                                Đừng mất thời gian gõ từng dòng. Chỉ cần ném vài gạch đầu dòng về yêu cầu, vị trí, kỹ
                                năng vào đây, AI sẽ tự động mông má thành một JD hoàn chỉnh.
                            </p>

                            <div className="w-full max-w-3xl relative z-10 shadow-xl rounded-2xl bg-white border-2 border-indigo-100 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                                <textarea
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    rows="5"
                                    placeholder="Ví dụ: Tìm ứng viên IT.\n- Phát triển và bảo trì hệ thống\n- Làm việc với API, database\n- Yêu cầu: Java/JS/Python\n- Có tư duy logic, teamwork tốt"
                                    className="w-full p-5 bg-transparent outline-none resize-none text-gray-800 font-medium placeholder:text-gray-400"
                                ></textarea>
                                <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex justify-end rounded-b-2xl">
                                    <button
                                        type="button"
                                        onClick={handleGenerateAI}
                                        disabled={isGenerating || !aiPrompt.trim()}
                                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95"
                                    >
                                        {isGenerating ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <Sparkles size={18} className="text-yellow-300" />
                                        )}
                                        {isGenerating ? 'Đang viết...' : 'Tạo JD ngay'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 2: BIÊN TẬP CHI TIẾT (FORM) ── */}
                {activeTab === 'manual' && (
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2"
                    >
                        <div className="p-6 md:p-8 space-y-8">
                            {/* Dòng 1: Tiêu đề & Cấp bậc */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Tiêu đề công việc <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="VD: Senior React JS Developer"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Cấp bậc</label>
                                    <div className="relative">
                                        <Star className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                        <select
                                            name="jobLevel"
                                            value={formData.jobLevel}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 appearance-none font-medium cursor-pointer"
                                        >
                                            <option value="INTERN">Thực tập sinh (Intern)</option>
                                            <option value="FRESHER">Mới tốt nghiệp (Fresher)</option>
                                            <option value="JUNIOR">Nhân viên (Junior)</option>
                                            <option value="MIDDLE">Chuyên viên (Middle)</option>
                                            <option value="SENIOR">Chuyên gia (Senior)</option>
                                            <option value="LEAD">Trưởng nhóm (Lead)</option>
                                            <option value="MANAGER">Quản lý (Manager)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Dòng 2: Kinh nghiệm & Học vấn */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Mô tả kinh nghiệm
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3.5 text-gray-400" size={16} />
                                        <input
                                            name="experienceLevel"
                                            value={formData.experienceLevel}
                                            onChange={handleChange}
                                            type="text"
                                            placeholder="VD: Ít nhất 1 năm"
                                            className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 font-medium text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Năm KN tối thiểu
                                    </label>
                                    <div className="relative">
                                        <Layers className="absolute left-3 top-3.5 text-gray-400" size={16} />
                                        <input
                                            name="minExpYears"
                                            value={formData.minExpYears}
                                            onChange={handleChange}
                                            type="number"
                                            min="0"
                                            placeholder="VD: 1"
                                            className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 font-medium text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Học vấn</label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-3 top-3.5 text-gray-400" size={16} />
                                        <select
                                            name="educationLevel"
                                            value={formData.educationLevel}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 appearance-none font-medium text-sm cursor-pointer"
                                        >
                                            <option value="NOT_REQUIRED">Không yêu cầu</option>
                                            <option value="HIGH_SCHOOL">Trung học phổ thông</option>
                                            <option value="ASSOCIATE">Cao đẳng</option>
                                            <option value="BACHELOR">Đại học</option>
                                            <option value="MASTER">Thạc sĩ / Tiến sĩ</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Dòng 3: Hình thức, Số lượng, Hạn nộp */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Hình thức</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3.5 text-gray-400" size={16} />
                                        <select
                                            name="jobType"
                                            value={formData.jobType}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 appearance-none font-medium text-sm cursor-pointer"
                                        >
                                            <option value="FULL_TIME">Toàn thời gian (Full-time)</option>
                                            <option value="PART_TIME">Bán thời gian (Part-time)</option>
                                            <option value="REMOTE">Làm việc từ xa (Remote)</option>
                                            <option value="HYBRID">Linh hoạt (Hybrid)</option>
                                            <option value="INTERNSHIP">Thực tập (Internship)</option>
                                            <option value="FREELANCE">Freelance</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Số lượng</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-3.5 text-gray-400" size={16} />
                                        <input
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            type="number"
                                            min="1"
                                            className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 font-medium text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Hạn nộp hồ sơ <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                        <input
                                            required
                                            name="deadline"
                                            value={formData.deadline}
                                            onChange={handleChange}
                                            type="date"
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 font-medium text-gray-900 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dòng 4: Địa điểm */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Địa điểm làm việc <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                    <input
                                        required
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="VD: Tầng 7, Tòa nhà ABC, Cầu Giấy, Hà Nội"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 font-medium text-gray-900"
                                    />
                                </div>
                            </div>

                            {/* Dòng 5: Mức lương */}
                            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-bold text-gray-800">Mức lương (VNĐ)</label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="salaryNegotiable"
                                            checked={formData.salaryNegotiable}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-600">Thỏa thuận</span>
                                    </label>
                                </div>
                                {!formData.salaryNegotiable && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                            <input
                                                required={!formData.salaryNegotiable}
                                                name="salaryMin"
                                                value={formData.salaryMin}
                                                onChange={handleChange}
                                                type="number"
                                                placeholder="Lương tối thiểu"
                                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 font-medium text-gray-900"
                                            />
                                        </div>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                            <input
                                                required={!formData.salaryNegotiable}
                                                name="salaryMax"
                                                value={formData.salaryMax}
                                                onChange={handleChange}
                                                type="number"
                                                placeholder="Lương tối đa"
                                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 font-medium text-gray-900"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Dòng 6: Kỹ năng & Danh mục */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Kỹ năng yêu cầu
                                    </label>
                                    <p className="text-xs text-gray-400 mb-2">Cách nhau bằng dấu phẩy</p>
                                    <input
                                        name="requiredSkills"
                                        value={formData.requiredSkills}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="VD: Java, Spring Boot, MySQL"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Danh mục nghề</label>
                                    <p className="text-xs text-gray-400 mb-2">Cách nhau bằng dấu phẩy</p>
                                    <div className="relative">
                                        <Tags className="absolute left-3 top-3 text-gray-400" size={16} />
                                        <input
                                            name="categories"
                                            value={formData.categories}
                                            onChange={handleChange}
                                            type="text"
                                            placeholder="VD: IT Phần mềm, Backend"
                                            className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 text-sm font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dòng 7: Các Textarea nội dung */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Mô tả công việc <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        required
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="5"
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 text-sm resize-none font-medium leading-relaxed"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Yêu cầu ứng viên
                                    </label>
                                    <textarea
                                        name="requirements"
                                        value={formData.requirements}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 text-sm resize-none font-medium leading-relaxed"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Quyền lợi được hưởng
                                    </label>
                                    <textarea
                                        name="benefits"
                                        value={formData.benefits}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 text-sm resize-none font-medium leading-relaxed"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Dòng 8: CẤU HÌNH AI SETTINGS */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-8">
                                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <SlidersHorizontal size={18} className="text-indigo-600" /> Cấu hình Matching AI
                                    </h3>
                                    {!useDefaultWeights && (
                                        <span
                                            className={`text-xs font-bold px-2.5 py-1 rounded-md border ${totalWeight === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                                        >
                                            Tổng: {(totalWeight / 100).toFixed(2)}/1.0
                                        </span>
                                    )}
                                </div>

                                <label className="flex items-center gap-2 mb-6 cursor-pointer w-max">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                                        checked={useDefaultWeights}
                                        onChange={(e) => setUseDefaultWeights(e.target.checked)}
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Dùng cấu hình mặc định (Gửi null để AI tự quyết)
                                    </span>
                                </label>

                                <div
                                    className={`grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 transition-opacity ${useDefaultWeights ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
                                >
                                    {Object.entries(aiWeights).map(([key, value]) => (
                                        <div key={key} className="flex flex-col gap-2">
                                            <div className="flex justify-between text-sm font-semibold">
                                                <span className="text-gray-700">{AI_WEIGHT_LABELS[key]}</span>
                                                <span className="text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-md">
                                                    {(value / 100).toFixed(2)}
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
                        </div>

                        <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 z-10">
                            <button
                                type="button"
                                className="px-6 py-2.5 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || (!useDefaultWeights && totalWeight !== 100)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-2.5 rounded-xl shadow-md flex items-center gap-2 disabled:bg-blue-400 transition-colors"
                            >
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                {isSubmitting ? 'Đang xử lý...' : 'Đăng tin ngay'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default JDOptimizer;
