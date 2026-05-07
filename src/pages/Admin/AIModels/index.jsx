import React, { useState, useEffect } from 'react';
import {
    BrainCircuit,
    Save,
    AlertTriangle,
    CheckCircle2,
    Sliders,
    Target,
    ShieldAlert,
    Loader2,
    X,
} from 'lucide-react';
import aiService from '~/services/aiService';

const AdminAI = () => {
    // 1. State quản lý dữ liệu
    const [settings, setSettings] = useState({
        id: null,
        filterTitleScore: 0,
        filterTotalScore: 0,
        sbertRejectionThreshold: 0,
        sbertWeightTitle: 0,
        sbertWeightSkills: 0,
        sbertWeightExp: 0,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // State cho Custom Toast Notification xịn xò
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    // 2. Fetch dữ liệu từ API khi vào trang
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await aiService.getSettings();
                setSettings(response);
            } catch (error) {
                console.error('Lỗi khi lấy cấu hình AI:', error);
                showToast('error', 'Không thể kết nối đến máy chủ AI!');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // 3. Hàm hiển thị Toast
    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
        }, 3500); // Tự động ẩn sau 3.5s
    };

    // 4. Xử lý thay đổi Input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings((prev) => ({
            ...prev,
            [name]: Number(value),
        }));
    };

    // 5. Logic tính toán và Validate Trọng số
    const currentWeightSum = Number(
        (settings.sbertWeightTitle + settings.sbertWeightSkills + settings.sbertWeightExp).toFixed(2),
    );

    const isWeightValid = currentWeightSum === 1.0;
    const weightSumPercentage = Math.min((currentWeightSum / 1.0) * 100, 100);

    // Xác định màu sắc cho thanh tiến trình trọng số
    let weightBarColor = 'bg-indigo-500';
    if (currentWeightSum > 1) weightBarColor = 'bg-red-500';
    else if (currentWeightSum < 1) weightBarColor = 'bg-orange-400';

    // 6. Xử lý Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isWeightValid) {
            showToast('error', 'Lỗi: Tổng 3 trọng số SBERT phải bằng chính xác 1.0!');
            return;
        }

        setIsSaving(true);
        try {
            const response = await aiService.updateSettings(settings);
            setSettings(response);
            showToast('success', 'Đã lưu cấu hình thuật toán AI thành công!');
        } catch (error) {
            console.error('Lỗi cập nhật:', error);
            showToast('error', 'Có lỗi xảy ra khi lưu cấu hình. Vui lòng thử lại.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] text-slate-500">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
                <span className="font-medium text-lg tracking-wide">Đang khởi tạo nhân AI...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10 relative">
            {/* ═════════ FLOATING TOAST NOTIFICATION ═════════ */}
            <div
                className={`fixed top-8 right-8 z-50 transition-all duration-500 transform ${
                    toast.show
                        ? 'translate-y-0 opacity-100 scale-100'
                        : '-translate-y-8 opacity-0 scale-95 pointer-events-none'
                }`}
            >
                <div
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${
                        toast.type === 'success'
                            ? 'bg-emerald-500/90 border-emerald-400 text-white'
                            : 'bg-rose-500/90 border-rose-400 text-white'
                    }`}
                >
                    {toast.type === 'success' ? (
                        <CheckCircle2 size={24} className="animate-bounce" />
                    ) : (
                        <AlertTriangle size={24} className="animate-pulse" />
                    )}
                    <span className="font-bold tracking-wide">{toast.message}</span>
                    <button
                        onClick={() => setToast((prev) => ({ ...prev, show: false }))}
                        className="ml-4 hover:bg-white/20 p-1 rounded-full transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* ═════════ HEADER ═════════ */}
            <div className="bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-800 text-white relative overflow-hidden group">
                <BrainCircuit
                    size={180}
                    className="absolute -right-10 -bottom-10 text-indigo-500/20 rotate-12 group-hover:rotate-0 transition-transform duration-700"
                />
                <h2 className="text-3xl font-black mb-3 flex items-center gap-3 relative z-10">
                    <Sliders className="text-indigo-400" size={32} /> Tham số Hệ thống AI
                </h2>
                <p className="text-slate-400 max-w-2xl text-base font-medium relative z-10 leading-relaxed">
                    Tinh chỉnh các ngưỡng lọc và trọng số thuật toán Semantic BERT (SBERT) để tối ưu hóa độ chính xác
                    khi Matching giữa CV ứng viên và Job Description.
                </p>
            </div>

            {/* ═════════ MAIN FORM ═════════ */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* CỘT 1: TRỌNG SỐ SBERT */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="p-2 bg-indigo-50 rounded-xl">
                                <Target className="text-indigo-600" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Trọng số thuật toán SBERT</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Inputs Group */}
                            <div className="space-y-4">
                                <div className="group">
                                    <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-indigo-600">
                                        Trọng số Tiêu đề (Weight Title)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="1"
                                        name="sbertWeightTitle"
                                        value={settings.sbertWeightTitle}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-700"
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-indigo-600">
                                        Trọng số Kỹ năng (Weight Skills)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="1"
                                        name="sbertWeightSkills"
                                        value={settings.sbertWeightSkills}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-700"
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-indigo-600">
                                        Trọng số Kinh nghiệm (Weight Exp)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="1"
                                        name="sbertWeightExp"
                                        value={settings.sbertWeightExp}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-700"
                                    />
                                </div>
                            </div>

                            {/* Visual Progress Bar cho Tổng trọng số */}
                            <div
                                className={`p-5 rounded-2xl border-2 transition-colors ${
                                    isWeightValid ? 'bg-indigo-50 border-indigo-100' : 'bg-rose-50 border-rose-100'
                                }`}
                            >
                                <div className="flex justify-between items-end mb-3">
                                    <span
                                        className={`text-sm font-bold ${isWeightValid ? 'text-indigo-800' : 'text-rose-800'}`}
                                    >
                                        Tổng trọng số (Yêu cầu = 1.0)
                                    </span>
                                    <span
                                        className={`text-2xl font-black ${isWeightValid ? 'text-indigo-600' : 'text-rose-600'}`}
                                    >
                                        {currentWeightSum}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full h-3 bg-slate-200/60 rounded-full overflow-hidden flex">
                                    <div
                                        className={`h-full transition-all duration-500 ease-out ${weightBarColor}`}
                                        style={{ width: `${weightSumPercentage}%` }}
                                    ></div>
                                </div>

                                {!isWeightValid && (
                                    <p className="mt-3 text-sm text-rose-600 font-bold flex items-center gap-1.5 animate-pulse">
                                        <AlertTriangle size={16} />
                                        {currentWeightSum > 1 ? 'Tổng đang vượt quá 1.0' : 'Tổng chưa đạt mức 1.0'}
                                    </p>
                                )}
                                {isWeightValid && (
                                    <p className="mt-3 text-sm text-indigo-600 font-bold flex items-center gap-1.5">
                                        <CheckCircle2 size={16} /> Trọng số hợp lệ
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CỘT 2: NGƯỠNG LỌC */}
                    <div className="space-y-6">
                        {/* Box: Ngưỡng lọc 0-100 */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                                <div className="p-2 bg-rose-50 rounded-xl">
                                    <ShieldAlert className="text-rose-600" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Ngưỡng Lọc Cơ Bản</h3>
                            </div>

                            <div className="space-y-8">
                                {/* Slider 1: Title Score */}
                                <div>
                                    <label className="flex justify-between items-center text-sm font-bold text-slate-700 mb-4">
                                        <span>Điểm tối thiểu Tiêu đề (0-100)</span>
                                        <span className="bg-rose-100 text-rose-700 py-1 px-4 rounded-full text-sm font-black shadow-sm border border-rose-200">
                                            {settings.filterTitleScore}
                                        </span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        name="filterTitleScore"
                                        value={settings.filterTitleScore}
                                        onChange={handleChange}
                                        className="w-full h-2.5 rounded-full appearance-none cursor-pointer outline-none transition-all
                                                [&::-webkit-slider-thumb]:appearance-none 
                                                [&::-webkit-slider-thumb]:w-6 
                                                [&::-webkit-slider-thumb]:h-6 
                                                [&::-webkit-slider-thumb]:bg-white 
                                                [&::-webkit-slider-thumb]:border-[3px] 
                                                [&::-webkit-slider-thumb]:border-rose-600 
                                                [&::-webkit-slider-thumb]:rounded-full 
                                                [&::-webkit-slider-thumb]:shadow-md
                                                hover:[&::-webkit-slider-thumb]:scale-110
                                                active:[&::-webkit-slider-thumb]:scale-95"
                                        style={{
                                            background: `linear-gradient(to right, #e11d48 ${settings.filterTitleScore}%, #f1f5f9 ${settings.filterTitleScore}%)`,
                                        }}
                                    />
                                </div>

                                {/* Slider 2: Total Score */}
                                <div>
                                    <label className="flex justify-between items-center text-sm font-bold text-slate-700 mb-4">
                                        <span>Điểm tối thiểu Tổng quát (0-100)</span>
                                        <span className="bg-rose-100 text-rose-700 py-1 px-4 rounded-full text-sm font-black shadow-sm border border-rose-200">
                                            {settings.filterTotalScore}
                                        </span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        name="filterTotalScore"
                                        value={settings.filterTotalScore}
                                        onChange={handleChange}
                                        className="w-full h-2.5 rounded-full appearance-none cursor-pointer outline-none transition-all
                                                [&::-webkit-slider-thumb]:appearance-none 
                                                [&::-webkit-slider-thumb]:w-6 
                                                [&::-webkit-slider-thumb]:h-6 
                                                [&::-webkit-slider-thumb]:bg-white 
                                                [&::-webkit-slider-thumb]:border-[3px] 
                                                [&::-webkit-slider-thumb]:border-rose-600 
                                                [&::-webkit-slider-thumb]:rounded-full 
                                                [&::-webkit-slider-thumb]:shadow-md
                                                hover:[&::-webkit-slider-thumb]:scale-110
                                                active:[&::-webkit-slider-thumb]:scale-95"
                                        style={{
                                            background: `linear-gradient(to right, #e11d48 ${settings.filterTotalScore}%, #f1f5f9 ${settings.filterTotalScore}%)`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Box: Ngưỡng Loại Bỏ */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="p-2 bg-emerald-50 rounded-xl">
                                    <BrainCircuit className="text-emerald-600" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Ngưỡng Cắt (Cut-off)</h3>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 mb-1 transition-colors group-focus-within:text-emerald-600">
                                    Rejection Threshold (0 - 1)
                                </label>
                                <p className="text-xs text-slate-500 mb-3 font-medium">
                                    Hồ sơ có điểm similarity dưới mức này sẽ bị AI loại bỏ ngay lập tức.
                                </p>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    name="sbertRejectionThreshold"
                                    value={settings.sbertRejectionThreshold}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold text-slate-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═════════ FOOTER ACTIONS ═════════ */}
                <div className="flex justify-end pt-6 border-t border-slate-200">
                    <button
                        type="submit"
                        disabled={isSaving || !isWeightValid}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all flex items-center gap-3 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {isSaving ? 'Đang đồng bộ...' : 'Lưu Cấu Hình AI'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminAI;
