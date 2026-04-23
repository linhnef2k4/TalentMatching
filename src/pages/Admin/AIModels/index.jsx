import React from 'react';
import { BrainCircuit, Activity, Database, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

const AdminAI = () => {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-800 text-white relative overflow-hidden">
                <BrainCircuit size={120} className="absolute -right-4 -bottom-4 text-blue-500/20" />
                <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                    <BrainCircuit className="text-blue-400" size={32} /> Trung tâm điều khiển AI
                </h2>
                <p className="text-slate-400 max-w-2xl text-lg">
                    Quản lý hiệu suất mô hình Machine Learning, đồng bộ hóa dữ liệu từ điển ngành (Taxonomy) và huấn
                    luyện lại hệ thống.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Activity size={24} />
                        </div>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                            <CheckCircle size={12} /> Khỏe mạnh
                        </span>
                    </div>
                    <h3 className="text-gray-500 font-semibold mb-1">Độ chính xác Matching (Tỉ lệ HR chọn)</h3>
                    <p className="text-3xl font-black text-gray-900">
                        86.4% <span className="text-sm font-medium text-green-500">+2.1%</span>
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <Database size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 font-semibold mb-1">Dữ liệu Taxonomy (Kỹ năng/Job)</h3>
                    <p className="text-3xl font-black text-gray-900">
                        12,450 <span className="text-sm font-medium text-gray-500">từ khóa</span>
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 font-semibold mb-1">AI Feedback từ HR (Báo cáo sai)</h3>
                    <p className="text-3xl font-black text-gray-900">
                        124 <span className="text-sm font-medium text-orange-500">cần xem xét</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Action: Retrain Model */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Huấn luyện lại Mô hình (Retrain)</h3>
                        <p className="text-gray-600 mb-6">
                            Hệ thống có 5,430 cặp CV-JD mới và 124 feedback từ người dùng. Việc huấn luyện lại sẽ mất
                            khoảng 2-3 giờ xử lý ngầm (Background Task).
                        </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-bold text-gray-800">Phiên bản hiện tại: v2.4.1</p>
                            <p className="text-xs text-gray-500">Cập nhật lần cuối: 15 ngày trước</p>
                        </div>
                        <button className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-md">
                            <RefreshCw size={18} /> Chạy Retrain Model
                        </button>
                    </div>
                </div>

                {/* Action: Taxonomy Management */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Quản lý Từ điển Ngành (Taxonomy)</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition cursor-pointer">
                            <div>
                                <p className="font-bold text-blue-600">Từ khóa đồng nghĩa (Synonyms)</p>
                                <p className="text-xs text-gray-500">Ví dụ: ReactJS = React.js = React</p>
                            </div>
                            <button className="text-sm font-bold text-gray-700 bg-gray-200 px-3 py-1 rounded-lg">
                                Quản lý
                            </button>
                        </div>
                        <div className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition cursor-pointer">
                            <div>
                                <p className="font-bold text-purple-600">Phân loại Kỹ năng (Skill Categories)</p>
                                <p className="text-xs text-gray-500">Frontend, Backend, DevOps...</p>
                            </div>
                            <button className="text-sm font-bold text-gray-700 bg-gray-200 px-3 py-1 rounded-lg">
                                Quản lý
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAI;
