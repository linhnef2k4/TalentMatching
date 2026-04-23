import React, { useState } from 'react';
import {
    MonitorPlay,
    Image as ImageIcon,
    Star,
    Plus,
    ToggleRight,
    ToggleLeft,
    Trash2,
    Edit3,
    Search,
} from 'lucide-react';

const AdminContent = () => {
    const [activeTab, setActiveTab] = useState('banners');

    // Mock dữ liệu Banners
    const [banners, setBanners] = useState([
        {
            id: 1,
            title: 'Chiến dịch Tuyển dụng IT 2026',
            image: 'https://via.placeholder.com/800x400/2563EB/FFFFFF?text=IT+Jobs+2026',
            status: 'Active',
            clicks: 1250,
        },
        {
            id: 2,
            title: 'Ngày hội việc làm Bách Khoa',
            image: 'https://via.placeholder.com/800x400/10B981/FFFFFF?text=Job+Fair+BK',
            status: 'Active',
            clicks: 840,
        },
        {
            id: 3,
            title: 'Khóa học ReactJS miễn phí',
            image: 'https://via.placeholder.com/800x400/6B21A8/FFFFFF?text=React+Course',
            status: 'Hidden',
            clicks: 0,
        },
    ]);

    // Mock dữ liệu Công ty nổi bật
    const [topCompanies, setTopCompanies] = useState([
        {
            id: 1,
            name: 'Công ty TNHH TechNova',
            industry: 'IT - Phần mềm',
            logoBg: 'bg-blue-100',
            logoText: 'text-blue-600',
        },
        { id: 2, name: 'FPT Software', industry: 'Outsourcing', logoBg: 'bg-orange-100', logoText: 'text-orange-600' },
        {
            id: 3,
            name: 'VNG Corporation',
            industry: 'Game / Product',
            logoBg: 'bg-purple-100',
            logoText: 'text-purple-600',
        },
        {
            id: 4,
            name: 'GlobalCorp VN',
            industry: 'Tài chính / Fintech',
            logoBg: 'bg-green-100',
            logoText: 'text-green-600',
        },
    ]);

    const handleToggleBanner = (id) => {
        setBanners(
            banners.map((b) => (b.id === id ? { ...b, status: b.status === 'Active' ? 'Hidden' : 'Active' } : b)),
        );
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto font-sans">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MonitorPlay className="text-blue-600" size={28} />
                        Quản lý Hiển thị
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Tùy chỉnh nội dung trang chủ, banner quảng cáo và danh sách công ty nổi bật.
                    </p>
                </div>
                <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md flex items-center gap-2">
                    <Plus size={20} /> Thêm Mới
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('banners')}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all border-b-2 ${activeTab === 'banners' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <ImageIcon size={18} /> Banner Quảng cáo
                </button>
                <button
                    onClick={() => setActiveTab('top-companies')}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all border-b-2 ${activeTab === 'top-companies' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Star size={18} /> Công ty Nổi bật (Trang chủ)
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {/* Tab: BANNERS */}
                {activeTab === 'banners' && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {banners.map((banner) => (
                                <div
                                    key={banner.id}
                                    className="border border-gray-200 rounded-2xl overflow-hidden group hover:shadow-md transition"
                                >
                                    <div className="h-40 bg-gray-100 relative">
                                        <img
                                            src={banner.image}
                                            alt={banner.title}
                                            className={`w-full h-full object-cover transition duration-300 ${banner.status === 'Hidden' ? 'grayscale opacity-60' : ''}`}
                                        />
                                        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                            {banner.clicks} lượt click
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <h3 className="font-bold text-gray-900 mb-4 truncate" title={banner.title}>
                                            {banner.title}
                                        </h3>
                                        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                                            <button
                                                onClick={() => handleToggleBanner(banner.id)}
                                                className={`flex items-center gap-1.5 font-bold text-sm ${banner.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}
                                            >
                                                {banner.status === 'Active' ? (
                                                    <ToggleRight size={24} />
                                                ) : (
                                                    <ToggleLeft size={24} />
                                                )}
                                                {banner.status === 'Active' ? 'Đang hiện' : 'Đang ẩn'}
                                            </button>
                                            <div className="flex gap-2">
                                                <button className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tab: TOP COMPANIES */}
                {activeTab === 'top-companies' && (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-600 font-medium">
                                Chọn các công ty uy tín để hiển thị trên Trang chủ nhằm thu hút ứng viên.
                            </p>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Tìm công ty để thêm..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {topCompanies.map((company) => (
                                <div
                                    key={company.id}
                                    className="border border-gray-200 rounded-xl p-5 text-center relative group hover:border-blue-300 transition"
                                >
                                    {/* Nút gỡ bỏ (Chỉ hiện khi hover) */}
                                    <button className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-100">
                                        <Trash2 size={16} />
                                    </button>

                                    <div
                                        className={`w-16 h-16 ${company.logoBg} ${company.logoText} rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-3 shadow-sm`}
                                    >
                                        {company.name.charAt(0)}
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1 truncate">{company.name}</h3>
                                    <p className="text-xs text-gray-500">{company.industry}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminContent;
