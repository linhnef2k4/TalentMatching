import React, { useState } from 'react';
import { HelpCircle, Send, Loader2 } from 'lucide-react';
import reportService from '~/services/reportService';

const SupportReport = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [supportForm, setSupportForm] = useState({
        type: 'SUGGESTION',
        title: '',
        content: '',
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!supportForm.title.trim() || !supportForm.content.trim()) {
            return setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ tiêu đề và nội dung chi tiết!' });
        }

        setIsSubmitting(true);
        try {
            await reportService.submitReport({
                title: supportForm.title,
                content: supportForm.content,
                type: supportForm.type,
            });
            setMessage({
                type: 'success',
                text: 'Cảm ơn bạn! Yêu cầu hỗ trợ đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất.',
            });
            setSupportForm({ type: 'SUGGESTION', title: '', content: '' });
        } catch (error) {
            console.error('Lỗi gửi support:', error);
            setMessage({ type: 'error', text: 'Có lỗi xảy ra khi gửi yêu cầu, vui lòng thử lại sau.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200 bg-slate-50/50 rounded-t-xl">
                <h2 className="text-lg font-bold text-slate-900">Góp ý & Báo lỗi</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                    Nếu bạn gặp lỗi hệ thống hoặc có ý kiến đóng góp, hãy cho chúng tôi biết!
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {message.text && (
                    <div
                        className={`p-4 rounded-xl text-sm font-bold border ${message.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}
                    >
                        {message.text}
                    </div>
                )}

                <div className="space-y-5 max-w-2xl">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Loại yêu cầu</label>
                        <select
                            value={supportForm.type}
                            onChange={(e) => setSupportForm({ ...supportForm, type: e.target.value })}
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-bold text-slate-800 transition-all cursor-pointer"
                        >
                            <option value="SUGGESTION">Góp ý tính năng</option>
                            <option value="SYSTEM_BUG">Báo lỗi hệ thống (Bug)</option>
                            <option value="USER_REPORT">Báo cáo người dùng vi phạm</option>
                            <option value="OTHER">Lý do khác</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={supportForm.title}
                            onChange={(e) => setSupportForm({ ...supportForm, title: e.target.value })}
                            placeholder="Tóm tắt vấn đề của bạn..."
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm font-medium transition-all text-slate-800"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Nội dung chi tiết <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            required
                            rows="5"
                            value={supportForm.content}
                            onChange={(e) => setSupportForm({ ...supportForm, content: e.target.value })}
                            placeholder="Vui lòng mô tả chi tiết để đội ngũ kỹ thuật có thể hỗ trợ nhanh nhất..."
                            className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm resize-none font-medium leading-relaxed transition-all text-slate-800"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu hỗ trợ'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SupportReport;
