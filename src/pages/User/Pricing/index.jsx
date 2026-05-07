import React, { useState, useEffect, useContext } from 'react';
import { Crown, CheckCircle2, Zap, Rocket, Loader2, Star } from 'lucide-react';
import paymentService from '~/services/paymentService';
import { AuthContext } from '~/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
    const { isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await paymentService.getPlans();
                setPlans(data);
            } catch (error) {
                console.error('Lỗi lấy danh sách gói:', error);
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
            alert('Vui lòng đăng nhập để tiến hành nâng cấp!');
            navigate('/login');
            return;
        }

        setProcessingId(planId);
        try {
            // Lấy chuỗi URL text từ backend (Backend trả về plain text URL hoặc object chứa url)
            const response = await paymentService.createPaymentUrl(planId);

            // Xử lý tùy theo format trả về của BE
            const paymentUrl = typeof response === 'string' ? response : response.url || response.paymentUrl;

            if (paymentUrl) {
                window.location.href = paymentUrl; // Chuyển hướng sang VNPay
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-24 font-sans">
            {/* HERO SECTION */}
            <div className="bg-slate-900 py-20 px-4 relative overflow-hidden text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-500/30 to-transparent rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-sm mb-6 border border-indigo-500/30">
                        <Crown size={16} /> TalentMatching Premium
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                        Đầu tư cho sự nghiệp, <br />{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                            Mở khóa cơ hội vô tận
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-medium">
                        Nâng cấp tài khoản VIP để hồ sơ của bạn luôn nổi bật trước hàng ngàn nhà tuyển dụng hàng đầu.
                    </p>
                </div>
            </div>

            {/* PRICING CARDS */}
            <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
                <div className="flex flex-wrap justify-center gap-8">
                    {plans.map((plan, index) => {
                        // Giả lập giao diện 2 loại gói (Gói thường vs Gói VIP). Nếu mảng có nhiều hơn thì tự động scale.
                        const isVip = index % 2 === 0; // Highlight gói đầu tiên hoặc so le

                        return (
                            <div
                                key={plan.id}
                                className={`relative w-full md:w-[380px] bg-white rounded-3xl p-8 border transition-all duration-300 flex flex-col ${isVip ? 'border-amber-400 shadow-2xl shadow-amber-500/20 md:-translate-y-4' : 'border-slate-200 shadow-lg'}`}
                            >
                                {isVip && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                                        <Star size={14} className="fill-amber-950" /> Khuyên dùng
                                    </div>
                                )}

                                <h3
                                    className={`text-2xl font-black mb-2 ${isVip ? 'text-amber-600' : 'text-slate-800'}`}
                                >
                                    {plan.name}
                                </h3>
                                <p className="text-slate-500 text-sm font-medium mb-6 min-h-[40px]">
                                    {plan.description}
                                </p>

                                <div className="mb-8">
                                    {plan.discountPercent > 0 && (
                                        <span className="text-sm text-slate-400 line-through font-semibold mr-2">
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

                                {/* Mock Features since API doesn't provide an array of features */}
                                <ul className="space-y-4 mb-10 flex-1">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span className="text-slate-700 font-medium text-sm">
                                            Hồ sơ lên Top 1 kết quả tìm kiếm của HR
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span className="text-slate-700 font-medium text-sm">
                                            Xem ai đã xem hồ sơ của bạn
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span className="text-slate-700 font-medium text-sm">
                                            Badge VIP nổi bật trên CV
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span className="text-slate-700 font-medium text-sm">
                                            Mở khóa tính năng AI JD Optimizer
                                        </span>
                                    </li>
                                </ul>

                                <button
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={processingId === plan.id}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                                        isVip
                                            ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-amber-950 shadow-lg shadow-orange-500/30'
                                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg'
                                    }`}
                                >
                                    {processingId === plan.id ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <Rocket size={20} />
                                    )}
                                    {processingId === plan.id ? 'Đang kết nối...' : 'Nâng cấp ngay'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Pricing;
