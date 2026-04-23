import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Briefcase,
    MapPin,
    DollarSign,
    Clock,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Save,
    Loader2,
    ArrowLeft,
    Users,
    GraduationCap,
    Tags,
    Star,
    ShieldAlert,
    SlidersHorizontal,
    Layers,
} from 'lucide-react';
import jobService from '~/services/jobService';
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

const EditJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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
        location: '',
        salaryMin: '',
        salaryMax: '',
        salaryNegotiable: false,
        deadline: '',
        jobType: 'FULL_TIME',
        experienceLevel: 'Không yêu cầu',
        minExpYears: 0,
        jobLevel: 'INTERN',
        educationLevel: 'HIGH_SCHOOL',
        quantity: 1,
        description: '',
        benefits: '',
        requirements: '',
        requiredSkills: '',
        categories: '',
    });

    // Lấy dữ liệu Job cũ để điền vào form
    useEffect(() => {
        const fetchJobDetail = async () => {
            try {
                const data = await jobService.getJobById(id);
                const formatDeadline = data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '';

                setFormData({
                    title: data.title || '',
                    location: data.location || '',
                    salaryMin: data.salaryMin || '',
                    salaryMax: data.salaryMax || '',
                    salaryNegotiable: data.salaryNegotiable || false,
                    deadline: formatDeadline,
                    jobType: data.jobType || 'FULL_TIME',
                    experienceLevel: data.experienceLevel || 'Không yêu cầu',
                    minExpYears: data.minExpYears || 0,
                    jobLevel: data.jobLevel || 'INTERN',
                    educationLevel: data.educationLevel || 'NOT_REQUIRED',
                    quantity: data.quantity || 1,
                    description: data.description || '',
                    requirements: data.requirements || '',
                    benefits: data.benefits || '',
                    requiredSkills: data.requiredSkills ? data.requiredSkills.join(', ') : '',
                    categories: data.categories ? data.categories.join(', ') : '',
                });

                // Tự động map AI Settings nếu có dữ liệu từ backend
                if (data.aiSettings && data.aiSettings.weightExp !== null && data.aiSettings.weightExp !== undefined) {
                    setUseDefaultWeights(false);
                    setAiWeights({
                        weightExp: Math.round((data.aiSettings.weightExp || 0) * 100),
                        weightSkills: Math.round((data.aiSettings.weightSkills || 0) * 100),
                        weightRole: Math.round((data.aiSettings.weightRole || 0) * 100),
                        weightTools: Math.round((data.aiSettings.weightTools || 0) * 100),
                        weightEdu: Math.round((data.aiSettings.weightEdu || 0) * 100),
                        weightSoft: Math.round((data.aiSettings.weightSoft || 0) * 100),
                    });
                } else {
                    setUseDefaultWeights(true);
                }
            } catch (error) {
                console.error('Lỗi lấy thông tin job:', error);
                toast.error('Không thể tải thông tin việc làm!');
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobDetail();
    }, [id]);

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

    // Submit gọi API PUT
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate AI Settings trước khi submit
        if (!useDefaultWeights && totalWeight !== 100) {
            toast.error('Vui lòng phân bổ chính xác 100% (Tổng = 1.0) cho cấu hình AI!');
            return;
        }

        setIsSubmitting(true);
        toast.loading('Đang lưu cập nhật...', { id: 'update-toast' });

        try {
            const splitToArray = (str) =>
                str
                    ? str
                          .split(',')
                          .map((s) => s.trim())
                          .filter((s) => s)
                    : [];

            // Xử lý AI Settings Payload (Gửi Null hoặc gửi 0.x)
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
                title: formData.title,
                location: formData.location,
                salaryMin: formData.salaryNegotiable ? 0 : Number(formData.salaryMin) || 0,
                salaryMax: formData.salaryNegotiable ? 0 : Number(formData.salaryMax) || 0,
                salaryNegotiable: formData.salaryNegotiable,
                deadline: formData.deadline ? new Date(formData.deadline).toISOString() : new Date().toISOString(),
                jobType: formData.jobType,
                experienceLevel: formData.experienceLevel,
                minExpYears: Number(formData.minExpYears) || 0,
                jobLevel: formData.jobLevel,
                educationLevel: formData.educationLevel,
                quantity: Number(formData.quantity) || 1,
                description: formData.description,
                benefits: formData.benefits,
                requirements: formData.requirements,
                requiredSkills: splitToArray(formData.requiredSkills),
                categories: splitToArray(formData.categories),
                aiSettings: aiSettingsPayload, // Đính kèm AI Settings vào Payload
            };

            await jobService.updateJob(id, payload);
            toast.success('Cập nhật tin tuyển dụng thành công!', { id: 'update-toast' });

            setTimeout(() => {
                navigate('/hr/manage-jobs');
            }, 1500);
        } catch (error) {
            console.error('Lỗi update job:', error);
            toast.error('Có lỗi xảy ra khi cập nhật. Vui lòng thử lại!', { id: 'update-toast' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
                <Loader2 size={40} className="animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans relative">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="max-w-5xl mx-auto">
                <div className="mb-6 flex items-center gap-4">
                    <Link
                        to="/hr/manage-jobs"
                        className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition shadow-sm"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Cập nhật tin tuyển dụng</h1>
                        <p className="text-gray-500 mt-1">
                            Chỉnh sửa thông tin công việc:{' '}
                            <span className="font-bold text-blue-600">{formData.title}</span>
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
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
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-colors font-medium text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Cấp bậc <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Star className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                    <select
                                        name="jobLevel"
                                        value={formData.jobLevel}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 appearance-none font-medium cursor-pointer transition-colors"
                                    >
                                        <option value="INTERN">Thực tập sinh (Intern)</option>
                                        <option value="FRESHER">Fresher</option>
                                        <option value="JUNIOR">Junior</option>
                                        <option value="MIDDLE">Middle</option>
                                        <option value="SENIOR">Senior</option>
                                        <option value="LEAD">Trưởng nhóm (Lead)</option>
                                        <option value="MANAGER">Quản lý (Manager)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Dòng 2: Loại, Học vấn, SL, Số năm KN */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Hình thức</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-3.5 text-gray-400" size={16} />
                                    <select
                                        name="jobType"
                                        value={formData.jobType}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 appearance-none font-medium text-sm cursor-pointer transition-colors"
                                    >
                                        <option value="FULL_TIME">Toàn thời gian</option>
                                        <option value="PART_TIME">Bán thời gian</option>
                                        <option value="REMOTE">Làm việc từ xa</option>
                                        <option value="HYBRID">Linh hoạt (Hybrid)</option>
                                        <option value="INTERNSHIP">Thực tập</option>
                                        <option value="FREELANCE">Freelance</option>
                                    </select>
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
                                        className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 appearance-none font-medium text-sm cursor-pointer transition-colors"
                                    >
                                        <option value="NOT_REQUIRED">Không yêu cầu</option>
                                        <option value="HIGH_SCHOOL">Trung học phổ thông</option>
                                        <option value="ASSOCIATE">Cao đẳng</option>
                                        <option value="BACHELOR">Đại học</option>
                                        <option value="MASTER">Thạc sĩ / Tiến sĩ</option>
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
                                        className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 font-medium text-sm transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">KN tối thiểu (Năm)</label>
                                <div className="relative">
                                    <Layers className="absolute left-3 top-3.5 text-gray-400" size={16} />
                                    <input
                                        name="minExpYears"
                                        value={formData.minExpYears}
                                        onChange={handleChange}
                                        type="number"
                                        min="0"
                                        placeholder="VD: 1, 2"
                                        className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 font-medium text-sm transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dòng 3: Địa điểm, Hạn nộp, Experience Level (Text) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Mô tả kinh nghiệm{' '}
                                    <span className="text-xs text-gray-400 font-normal">(Hiển thị UI)</span>
                                </label>
                                <input
                                    name="experienceLevel"
                                    value={formData.experienceLevel}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="VD: 1 - 3 năm"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-colors font-medium text-gray-900"
                                />
                            </div>
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
                                        placeholder="VD: Cầu Giấy, Hà Nội"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-colors font-medium text-gray-900"
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
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-colors font-medium text-gray-900 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dòng 4: Mức lương */}
                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-bold text-gray-800">Mức lương (VNĐ)</label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="salaryNegotiable"
                                        checked={formData.salaryNegotiable}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-gray-600">Thỏa thuận</span>
                                </label>
                            </div>
                            {!formData.salaryNegotiable && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                        <input
                                            name="salaryMin"
                                            value={formData.salaryMin}
                                            onChange={handleChange}
                                            type="number"
                                            placeholder="Lương tối thiểu"
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors font-medium text-gray-900"
                                        />
                                    </div>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                        <input
                                            name="salaryMax"
                                            value={formData.salaryMax}
                                            onChange={handleChange}
                                            type="number"
                                            placeholder="Lương tối đa"
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors font-medium text-gray-900"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Dòng 5: Kỹ năng bắt buộc & Danh mục */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-red-50 p-4 rounded-xl border border-red-100">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-red-700 mb-1">
                                    <ShieldAlert size={16} /> Kỹ năng bắt buộc (Core Skills){' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <p className="text-xs text-red-600/80 mb-2">
                                    Hệ thống sẽ dựa vào đây để chặn hồ sơ sai. Cách nhau bằng dấu phẩy
                                </p>
                                <input
                                    required
                                    name="requiredSkills"
                                    value={formData.requiredSkills}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="VD: ReactJS, NodeJS, MongoDB"
                                    className="w-full p-3 bg-white border border-red-200 rounded-xl outline-none focus:border-red-500 transition-colors text-sm font-medium"
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
                                        placeholder="VD: IT, Backend"
                                        className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dòng 6: Các Textarea nội dung */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Mô tả công việc (JD) <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="6"
                                    placeholder="Nhập mô tả chi tiết công việc..."
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-colors font-medium text-gray-900 resize-none leading-relaxed"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Yêu cầu ứng viên</label>
                                <textarea
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Yêu cầu về kinh nghiệm, kỹ năng mềm..."
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-colors text-sm resize-none"
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
                                    placeholder="Chế độ đãi ngộ, bảo hiểm, văn hóa công ty..."
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-colors text-sm resize-none"
                                ></textarea>
                            </div>
                        </div>

                        {/* Dòng 7: CẤU HÌNH AI SETTINGS */}
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

                            <label className="flex items-center gap-2 mb-6 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                                    checked={useDefaultWeights}
                                    onChange={(e) => setUseDefaultWeights(e.target.checked)}
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Dùng cấu hình mặc định (Gửi null cho AI tự quyết)
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
                        <Link
                            to="/hr/manage-jobs"
                            className="px-6 py-2.5 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Hủy bỏ
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting || (!useDefaultWeights && totalWeight !== 100)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {isSubmitting ? 'Đang lưu...' : 'Lưu cập nhật'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditJob;
