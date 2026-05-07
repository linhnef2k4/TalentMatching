import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Loader2, Tags, CheckCircle2, XCircle, ToggleRight, ToggleLeft, X } from 'lucide-react';
import adminPricingService from '~/services/adminPricingService';

const AdminPricing = () => {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // States cho Modal (Tạo / Sửa)
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        durationDays: 30,
        basePrice: 0,
        discountPercent: 0,
        targetRole: 'EMPLOYER', // EMPLOYER hoặc CANDIDATE
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setIsLoading(true);
        try {
            const response = await adminPricingService.getAllPlans();
            setPlans(response);
        } catch (error) {
            console.error('Lỗi tải danh sách gói cước:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleOpenModal = (plan = null) => {
        if (plan) {
            setEditingPlanId(plan.id);
            setFormData({
                name: plan.name,
                description: plan.description,
                durationDays: plan.durationDays,
                basePrice: plan.basePrice,
                discountPercent: plan.discountPercent,
                targetRole: plan.targetRole || 'EMPLOYER',
            });
        } else {
            setEditingPlanId(null);
            setFormData({
                name: '',
                description: '',
                durationDays: 30,
                basePrice: 0,
                discountPercent: 0,
                targetRole: 'EMPLOYER',
            });
        }
        setShowModal(true);
    };

    const handleToggleStatus = async (id) => {
        try {
            await adminPricingService.toggleStatus(id);
            fetchPlans(); // Refresh lại data
        } catch (error) {
            alert('Lỗi khi thay đổi trạng thái!');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingPlanId) {
                await adminPricingService.updatePlan(editingPlanId, formData);
                alert('Cập nhật gói cước thành công!');
            } else {
                await adminPricingService.createPlan(formData);
                alert('Tạo gói cước mới thành công!');
            }
            setShowModal(false);
            fetchPlans();
        } catch (error) {
            alert('Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <Loader2 size={40} className="animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <Tags className="text-indigo-600" /> Quản lý Gói Cước VIP
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Cấu hình các gói dịch vụ bán cho Nhà tuyển dụng & Ứng viên.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-200 flex items-center gap-2"
                >
                    <Plus size={20} /> Tạo gói mới
                </button>
            </div>

            {/* List Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const isEmployer =
                        plan.targetRole === 'EMPLOYER' || plan.name.toLowerCase().includes('doanh nghiệp');

                    return (
                        <div
                            key={plan.id}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col relative overflow-hidden"
                        >
                            {/* Dấu hiệu gói bị khóa */}
                            {!plan.isActive && (
                                <div className="absolute top-0 right-0 bg-slate-500 text-white text-[10px] font-black uppercase px-6 py-1 rotate-45 translate-x-4 translate-y-3">
                                    Đã khóa
                                </div>
                            )}

                            <div className="mb-4">
                                <span
                                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md mb-3 inline-block ${isEmployer ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}
                                >
                                    Dành cho {isEmployer ? 'Doanh Nghiệp' : 'Ứng Viên'}
                                </span>
                                <h3
                                    className={`text-xl font-black ${!plan.isActive ? 'text-slate-400' : 'text-slate-900'}`}
                                >
                                    {plan.name}
                                </h3>
                                <p className="text-slate-500 text-sm font-medium mt-1 line-clamp-2 min-h-[40px]">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100 flex-1">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-bold text-slate-500">Giá gốc</span>
                                    <span className="text-sm font-bold text-slate-400 line-through">
                                        {formatMoney(plan.basePrice)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-bold text-slate-500">Giảm giá</span>
                                    <span className="text-sm font-bold text-rose-500">-{plan.discountPercent}%</span>
                                </div>
                                <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-200">
                                    <span className="text-sm font-bold text-slate-900">Thực thu</span>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-indigo-600">
                                            {formatMoney(plan.finalPrice)}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400 block">
                                            / {plan.durationDays} ngày
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => handleToggleStatus(plan.id)}
                                    className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 transition-colors border
                                        ${plan.isActive ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'}`}
                                >
                                    {plan.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                    {plan.isActive ? 'Tạm khóa' : 'Mở bán'}
                                </button>
                                <button
                                    onClick={() => handleOpenModal(plan)}
                                    className="px-4 py-2 rounded-lg font-bold text-sm bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-indigo-600 transition-colors"
                                >
                                    <Edit3 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL THÊM/SỬA GÓI CƯỚC */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-lg font-black text-slate-800">
                                {editingPlanId ? 'Cập nhật Gói cước' : 'Tạo Gói cước mới'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tên gói cước</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:border-indigo-600 outline-none font-medium text-slate-800"
                                    placeholder="VD: PRO Doanh Nghiệp 1 Tháng"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Đối tượng áp dụng</label>
                                <select
                                    value={formData.targetRole}
                                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:border-indigo-600 outline-none font-bold text-slate-800 cursor-pointer"
                                >
                                    <option value="EMPLOYER">Nhà tuyển dụng (HR)</option>
                                    <option value="CANDIDATE">Ứng viên</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Giá gốc (VND)</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        value={formData.basePrice}
                                        onChange={(e) =>
                                            setFormData({ ...formData, basePrice: Number(e.target.value) })
                                        }
                                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:border-indigo-600 outline-none font-bold text-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Giảm giá (%)</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.discountPercent}
                                        onChange={(e) =>
                                            setFormData({ ...formData, discountPercent: Number(e.target.value) })
                                        }
                                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:border-indigo-600 outline-none font-bold text-rose-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Thời hạn (Ngày)</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={formData.durationDays}
                                    onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:border-indigo-600 outline-none font-bold text-slate-800"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Quyền lợi (Mô tả)</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:border-indigo-600 outline-none resize-none font-medium text-slate-800"
                                    placeholder="Nhập các quyền lợi nổi bật..."
                                ></textarea>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-2.5 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <CheckCircle2 size={18} />
                                    )}
                                    Lưu gói cước
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPricing;
