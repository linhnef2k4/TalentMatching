import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles, Filter, Target, Briefcase, Clock, ChevronRight, Loader2, BrainCircuit } from 'lucide-react';
import { AuthContext } from '~/context/AuthContext';
import userService from '~/services/userService'; // Gọi từ userService đã tạo ở trên

const MatchedJobs = () => {
    const { user } = useContext(AuthContext); // Lấy user đang đăng nhập
    const [matchedJobs, setMatchedJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAiMatchedJobs = async () => {
            // Đảm bảo user đã đăng nhập và có ID
            if (!user || !user.id) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                // Gọi API thông qua userService
                const response = await userService.getMatchedJobs(user.id);

                // Axios trả về qua response.data hoặc đôi khi custom interceptor trả thẳng data
                if (response && Array.isArray(response)) {
                    setMatchedJobs(response);
                } else if (response && response.data) {
                    setMatchedJobs(response.data);
                }
            } catch (error) {
                console.error('Lỗi khi lấy danh sách Job AI gợi ý:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAiMatchedJobs();
    }, [user]);

    // Hàm render màu sắc cho điểm số
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                    {/* Background glow nhẹ */}
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-xl">
                                <Sparkles size={24} />
                            </div>
                            Việc Làm AI Đề Xuất
                        </h1>
                        <p className="text-gray-500">
                            Dựa trên CV của bạn, hệ thống AI đã phân tích ngữ nghĩa và tìm ra những vị trí có độ phù hợp
                            cao nhất.
                        </p>
                    </div>
                    <button className="flex shrink-0 items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-bold transition shadow-sm relative z-10">
                        <Filter size={18} /> Lọc kết quả
                    </button>
                </div>

                {/* Danh sách Job */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-500 font-medium">AI đang quét và phân tích mức độ phù hợp...</p>
                    </div>
                ) : matchedJobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <BrainCircuit size={64} className="text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa tìm thấy việc làm phù hợp</h3>
                        <p className="text-gray-500">
                            Hãy cập nhật thêm kỹ năng vào CV để AI có thể gợi ý chính xác hơn nhé!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {matchedJobs.map((job) => (
                            <div
                                key={job.matchId}
                                className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
                            >
                                {/* Dải màu báo hiệu tỷ lệ match trên đỉnh Card */}
                                <div
                                    className={`absolute top-0 left-0 w-full h-1.5 ${job.matchScore >= 80 ? 'bg-green-500' : job.matchScore >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                ></div>

                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                                    <div className="flex-1">
                                        <h3 className="font-extrabold text-xl text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                                            {job.jobTitle}
                                        </h3>
                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={14} className="text-gray-400" /> Phân tích lúc:{' '}
                                                {job.matchedAt}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Briefcase size={14} className="text-gray-400" /> ID Công việc: #
                                                {job.jobId}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Điểm tổng quát (Match Score) */}
                                    <div className="flex flex-col items-end shrink-0">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                            Độ phù hợp
                                        </span>
                                        <div
                                            className={`px-4 py-2 rounded-xl font-black text-lg border flex items-center gap-1.5 ${getScoreColor(job.matchScore)}`}
                                        >
                                            <Target size={20} />
                                            {job.matchScore}%
                                        </div>
                                    </div>
                                </div>

                                {/* Breakdown Điểm AI phân tích */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <BrainCircuit size={14} /> Phân tích chi tiết từ AI
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {/* Kỹ năng */}
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-gray-500 font-medium">Kỹ năng</span>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${job.skillScore >= 80 ? 'bg-green-500' : 'bg-yellow-400'}`}
                                                        style={{ width: `${job.skillScore}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-bold text-gray-800">
                                                    {job.skillScore}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Tiêu đề */}
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-gray-500 font-medium">Tiêu đề (Vị trí)</span>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${job.titleScore >= 80 ? 'bg-green-500' : 'bg-yellow-400'}`}
                                                        style={{ width: `${job.titleScore}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-bold text-gray-800">
                                                    {job.titleScore}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Kinh nghiệm */}
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-gray-500 font-medium">Kinh nghiệm</span>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${job.expScore >= 80 ? 'bg-green-500' : 'bg-yellow-400'}`}
                                                        style={{ width: `${job.expScore}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-bold text-gray-800">{job.expScore}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Nút xem chi tiết */}
                                <div className="mt-auto">
                                    <Link to={`/jobs/${job.jobId}`}>
                                        <button className="w-full flex justify-between items-center bg-white border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-700 px-5 py-3 rounded-xl font-bold transition-all group-hover:shadow-md">
                                            Xem chi tiết công việc
                                            <ChevronRight
                                                size={20}
                                                className="text-gray-400 group-hover:text-blue-600 transition-colors"
                                            />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchedJobs;
