import React, { useState, useEffect, useContext } from 'react';
import { Crown, CheckCircle2, Rocket, Loader2, Star, Building2, Users, ShieldCheck } from 'lucide-react';
import paymentService from '~/services/paymentService';
import { AuthContext } from '~/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HRPricing = () => {
    const { isLoggedIn, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    // Backend sẽ tự filter các gói của ROLE = EMPLOYER dựa trên token
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await paymentService.getPlans();
                setPlans(data);
            } catch (error) {
                console.error('Lỗi lấy danh sách gói HR:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleSubscribe = async (planId) => {
        if (!isLoggedIn) {
            alert('Vui lòng đăng nhập tài khoản Doanh nghiệp!');
            return;
        }

        setProcessingId(planId);
        try {
            const response = await paymentService.createPaymentUrl(planId);
            const paymentUrl = typeof response === 'string' ? response : response.url || response.paymentUrl;

            if (paymentUrl) {
                window.location.href = paymentUrl;
            } else {
                alert('Không lấy được đường dẫn thanh toán. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Lỗi tạo thanh toán:', error);
            alert('Có lỗi xảy ra kết nối với cổng thanh toán.');
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
                <p className="text-slate-500 font-medium">Đang tải cấu hình gói cước...</p>
            </div>
        );
    }

    return (
        <div className="font-sans max-w-7xl mx-auto">
            {/* HERO SECTION B2B */}
            <div className="bg-slate-900 rounded-3xl p-10 md:p-16 mb-12 relative overflow-hidden text-center border border-slate-800 shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/30 rounded-full blur-[80px]"></div>

                <div className="relative z-10 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-sm mb-6 border border-blue-500/30">
                        <Building2 size={16} /> Dành riêng cho Nhà tuyển dụng
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                        Tuyển dụng hiệu quả với <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                            Gói Doanh Nghiệp Premium
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium">
                        Tăng 300% tốc độ tuyển dụng nhờ công nghệ AI Matching và đặc quyền tiếp cận kho hồ sơ ứng viên
                        chất lượng cao.
                    </p>
                </div>
            </div>

            {/* PRICING CARDS */}
            <div className="flex flex-wrap justify-center gap-8 px-4">
                {plans.map((plan, index) => {
                    const isVip = index === 0 || plan.finalPrice > 500000; // Highlight gói xịn

                    return (
                        <div
                            key={plan.id}
                            className={`relative w-full md:w-[380px] bg-white rounded-3xl p-8 transition-all duration-300 flex flex-col ${isVip ? 'border-2 border-blue-500 shadow-2xl shadow-blue-500/20 md:-translate-y-4' : 'border border-slate-200 shadow-lg'}`}
                        >
                            {isVip && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-black px-5 py-1.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
                                    <ShieldCheck size={16} /> Gói Khuyên Dùng
                                </div>
                            )}

                            <h3 className={`text-2xl font-black mb-2 ${isVip ? 'text-blue-700' : 'text-slate-800'}`}>
                                {plan.name}
                            </h3>
                            <p className="text-slate-500 text-sm font-medium mb-6 min-h-[40px] border-b border-slate-100 pb-6">
                                {plan.description}
                            </p>

                            <div className="mb-8">
                                {plan.discountPercent > 0 && (
                                    <span className="text-sm text-slate-400 line-through font-semibold mr-2 block mb-1">
                                        {formatMoney(plan.basePrice)}
                                    </span>
                                )}
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-slate-900">
                                        {formatMoney(plan.finalPrice)}
                                    </span>
                                    <span className="text-slate-500 font-medium">/ {plan.durationDays} ngày</span>
                                </div>
                            </div>

                            {/* Quyền lợi dành riêng cho Employer */}
                            <ul className="space-y-4 mb-10 flex-1">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 size={20} className="text-blue-500 shrink-0 mt-0.5" />
                                    <span className="text-slate-700 font-semibold text-sm">
                                        Đăng <strong className="text-blue-600">không giới hạn</strong> tin tuyển dụng
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 size={20} className="text-blue-500 shrink-0 mt-0.5" />
                                    <span className="text-slate-700 font-semibold text-sm">
                                        Tin hiển thị ở trang chủ (Nhãn Hot)
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 size={20} className="text-blue-500 shrink-0 mt-0.5" />
                                    <span className="text-slate-700 font-semibold text-sm">
                                        Mở khóa xem thông tin liên hệ của ứng viên
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 size={20} className="text-blue-500 shrink-0 mt-0.5" />
                                    <span className="text-slate-700 font-semibold text-sm">
                                        Công cụ tự động gửi email mời phỏng vấn
                                    </span>
                                </li>
                            </ul>

                            <button
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={processingId === plan.id}
                                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                                    isVip
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                }`}
                            >
                                {processingId === plan.id ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <Rocket size={20} />
                                )}
                                {processingId === plan.id ? 'Đang khởi tạo...' : 'Mua gói ngay'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HRPricing;
