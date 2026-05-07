import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import paymentService from '~/services/paymentService';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing'); // processing, success, fail

    useEffect(() => {
        const verifyPayment = async () => {
            // Gom tất cả params trên URL để gửi về backend xác thực
            const paramsObject = {};
            for (const [key, value] of searchParams.entries()) {
                paramsObject[key] = value;
            }

            try {
                await paymentService.verifyCallback(paramsObject);
                // Nếu BE trả về 200 OK -> Thành công
                setStatus('success');
            } catch (error) {
                console.error('Lỗi xác thực VNPay:', error);
                setStatus('fail');
            }
        };

        if (searchParams.get('vnp_ResponseCode')) {
            verifyPayment();
        } else {
            setStatus('fail');
        }
    }, [searchParams]);

    return (
        <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center">
                {status === 'processing' && (
                    <div className="py-8">
                        <Loader2 size={64} className="animate-spin text-indigo-600 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Đang xử lý thanh toán</h2>
                        <p className="text-slate-500 font-medium">Vui lòng không đóng trình duyệt lúc này...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-4 animate-in zoom-in duration-300">
                        <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">Thanh toán thành công!</h2>
                        <p className="text-slate-600 font-medium mb-8">
                            Tài khoản của bạn đã được nâng cấp lên VIP. Tận hưởng ngay các đặc quyền mới nhất!
                        </p>
                        <Link
                            to="/profile"
                            className="w-full inline-flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
                        >
                            Đến trang cá nhân <ArrowRight size={20} />
                        </Link>
                    </div>
                )}

                {status === 'fail' && (
                    <div className="py-4 animate-in zoom-in duration-300">
                        <div className="w-24 h-24 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">Thanh toán thất bại</h2>
                        <p className="text-slate-600 font-medium mb-8">
                            Giao dịch của bạn đã bị hủy hoặc có lỗi xảy ra. Tài khoản chưa bị trừ tiền.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/pricing')}
                                className="w-full inline-flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                            >
                                Thử lại
                            </button>
                            <Link
                                to="/"
                                className="w-full inline-block py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition"
                            >
                                Về trang chủ
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentResult;
