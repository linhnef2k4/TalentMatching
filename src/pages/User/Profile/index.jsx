import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    User,
    Mail,
    Phone,
    UploadCloud,
    Save,
    Edit3,
    Loader2,
    ImagePlus,
    FileText,
    CheckCircle2,
    ExternalLink,
    Trash2,
    ShieldAlert,
    Lock,
    HelpCircle,
} from 'lucide-react';
import { AuthContext } from '~/context/AuthContext';
import userService from '~/services/userService';
import applicationService from '~/services/applicationService';

// IMPORT COMPONENT CÁC TAB KHÁC
import ChangePassword from '~/pages/User/ChangePassword';
import SupportReport from '~/pages/User/SupportReport';

const Profile = () => {
    const { user, login } = useContext(AuthContext);

    // Xử lý chuyển tab Sidebar
    const [activeTab, setActiveTab] = useState('profile');

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isUploadingCv, setIsUploadingCv] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        role: '',
        id: '',
        cvUrl: '',
    });

    const avatarInputRef = useRef(null);
    const cvInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || '',
                email: user.email || '',
                role: user.role || 'CANDIDATE',
                id: user.id || '',
                cvUrl: user.cvUrl || '',
            });
        }
    }, [user]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // HÀM SAVE CHUNG PROFILE
    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await userService.updateProfile({ fullName: formData.fullName, phoneNumber: formData.phoneNumber || '' });
            login(
                { ...user, fullName: formData.fullName, phoneNumber: formData.phoneNumber },
                localStorage.getItem('access_token'),
            );
            setIsEditing(false);
            alert('Cập nhật thông tin thành công!');
        } catch (error) {
            console.error(error);
            alert('Cập nhật thất bại. Vui lòng thử lại!');
        } finally {
            setIsSaving(false);
        }
    };

    // HÀM UPLOAD
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return alert('Vui lòng chỉ chọn file hình ảnh!');

        setIsUploadingAvatar(true);
        try {
            const response = await userService.updateAvatar(file);
            const newAvatarUrl = typeof response === 'string' ? response : response.avatar || response.url;
            login({ ...user, avatar: newAvatarUrl }, localStorage.getItem('access_token'));
            alert('Cập nhật ảnh đại diện thành công!');
        } catch (error) {
            console.error(error);
            alert('Upload ảnh thất bại!');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleCvUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return alert('Vui lòng chọn file CV nhỏ hơn 5MB!');

        setIsUploadingCv(true);
        try {
            const response = await applicationService.uploadCv(file);
            const newCvUrl = response.cvUrl || response.url || (typeof response === 'string' ? response : null);
            if (newCvUrl) {
                setFormData((prev) => ({ ...prev, cvUrl: newCvUrl }));
                login({ ...user, cvUrl: newCvUrl }, localStorage.getItem('access_token'));
                alert('Tải lên CV thành công!');
            } else {
                throw new Error('URL lỗi');
            }
        } catch (error) {
            console.error(error);
            alert('Tải lên CV thất bại!');
        } finally {
            setIsUploadingCv(false);
            e.target.value = null;
        }
    };

    const handleDeleteCv = () => {
        if (window.confirm('Bạn có chắc muốn xóa CV mặc định này?')) {
            setFormData((prev) => ({ ...prev, cvUrl: '' }));
            login({ ...user, cvUrl: null }, localStorage.getItem('access_token'));
        }
    };

    const getAvatar = () =>
        user?.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=0D8ABC&color=fff&size=256`;
    const getFileNameFromUrl = (url) => (url ? url.split('/').pop().split('?')[0].substring(0, 30) + '...' : '');

    return (
        <div className="bg-slate-100 min-h-screen font-sans pb-20 pt-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                    {/* ================= CỘT TRÁI: SIDEBAR & AVATAR ================= */}
                    <div className="md:col-span-1 space-y-6">
                        {/* BOX AVATAR */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
                            <div className="relative inline-block">
                                <div
                                    className={`relative w-28 h-28 rounded-full border-4 border-slate-50 shadow-md mx-auto overflow-hidden bg-slate-100 ${isUploadingAvatar ? 'opacity-50' : ''}`}
                                >
                                    <img src={getAvatar()} alt="Avatar" className="w-full h-full object-cover" />
                                    {isUploadingAvatar && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                                            <Loader2 size={24} className="animate-spin text-blue-600" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => avatarInputRef.current.click()}
                                    disabled={isUploadingAvatar}
                                    className="absolute bottom-0 right-0 bg-slate-800 text-white p-2 rounded-full border-2 border-white hover:bg-black transition cursor-pointer shadow-md disabled:bg-slate-400"
                                >
                                    <ImagePlus size={16} />
                                </button>
                                <input
                                    type="file"
                                    ref={avatarInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            <h2 className="text-lg font-bold text-slate-900 mt-4 line-clamp-1">{formData.fullName}</h2>
                            <p className="text-slate-500 font-medium text-xs mt-1 truncate">{formData.email}</p>

                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide inline-block">
                                    {formData.role === 'EMPLOYER' ? 'Doanh nghiệp' : 'Ứng viên'}
                                </span>
                            </div>
                        </div>

                        {/* MENU TABS BẰNG MÀU SOLID */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col p-2 gap-1">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'}`}
                            >
                                <User size={18} /> Thông tin cá nhân
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'password' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'}`}
                            >
                                <Lock size={18} /> Đổi mật khẩu
                            </button>
                            <button
                                onClick={() => setActiveTab('support')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'support' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'}`}
                            >
                                <HelpCircle size={18} /> Góp ý & Báo lỗi
                            </button>
                        </div>
                    </div>

                    {/* ================= CỘT PHẢI: HIỂN THỊ THEO TAB ================= */}
                    <div className="md:col-span-3">
                        {/* TAB 1: THÔNG TIN CÁ NHÂN */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                {/* Form Info */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                                    <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                                        <h3 className="text-lg font-bold text-slate-900">Chi tiết tài khoản</h3>
                                        {!isEditing ? (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-blue-600 px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 shadow-sm"
                                            >
                                                <Edit3 size={16} /> Chỉnh sửa
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                                            >
                                                {isSaving ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Save size={16} />
                                                )}
                                                {isSaving ? 'Đang lưu' : 'Lưu thay đổi'}
                                            </button>
                                        )}
                                    </div>
                                    <form className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Tên */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                                    Họ và tên hiển thị
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-3 text-slate-400" size={18} />
                                                    <input
                                                        disabled={!isEditing}
                                                        name="fullName"
                                                        value={formData.fullName}
                                                        onChange={handleChange}
                                                        type="text"
                                                        className={`w-full pl-11 pr-4 py-2.5 border rounded-lg outline-none transition-all text-sm font-medium ${isEditing ? 'border-slate-300 focus:ring-1 focus:ring-blue-600 bg-white text-slate-900' : 'border-transparent bg-slate-100 text-slate-600 cursor-not-allowed'}`}
                                                    />
                                                </div>
                                            </div>
                                            {/* SĐT */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                                    Số điện thoại
                                                </label>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-3 text-slate-400" size={18} />
                                                    <input
                                                        disabled={!isEditing}
                                                        name="phoneNumber"
                                                        value={formData.phoneNumber || ''}
                                                        onChange={handleChange}
                                                        type="tel"
                                                        placeholder="Chưa cập nhật số điện thoại"
                                                        className={`w-full pl-11 pr-4 py-2.5 border rounded-lg outline-none transition-all text-sm font-medium ${isEditing ? 'border-slate-300 focus:ring-1 focus:ring-blue-600 bg-white text-slate-900' : 'border-transparent bg-slate-100 text-slate-600 cursor-not-allowed'}`}
                                                    />
                                                </div>
                                            </div>
                                            {/* Email */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-bold text-slate-500 mb-2">
                                                    Email đăng nhập (Không thể sửa)
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-3 text-slate-400" size={18} />
                                                    <input
                                                        disabled
                                                        value={formData.email}
                                                        type="email"
                                                        className="w-full pl-11 pr-4 py-2.5 border border-transparent bg-slate-100 rounded-lg outline-none text-slate-500 text-sm font-medium cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {/* Quản lý CV */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                                    <div className="p-6 border-b border-slate-200 bg-slate-50/50 rounded-t-xl">
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <FileText size={20} className="text-blue-500" /> Hồ Sơ Đính Kèm (CV)
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        {formData.cvUrl ? (
                                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                                <div className="w-12 h-12 bg-white text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200 shadow-sm">
                                                    <FileText size={24} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className="font-bold text-sm text-slate-900 truncate"
                                                        title={getFileNameFromUrl(formData.cvUrl)}
                                                    >
                                                        {getFileNameFromUrl(formData.cvUrl)}
                                                    </p>
                                                    <p className="text-xs text-blue-600 font-bold mt-1 flex items-center gap-1">
                                                        <CheckCircle2 size={14} /> CV Mặc định
                                                    </p>
                                                </div>
                                                <div className="flex flex-col gap-2 shrink-0">
                                                    <a
                                                        href={formData.cvUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                                    >
                                                        <ExternalLink size={14} /> Xem
                                                    </a>
                                                    <button
                                                        onClick={handleDeleteCv}
                                                        className="bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                                    >
                                                        <Trash2 size={14} /> Gỡ bỏ
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
                                                <ShieldAlert size={40} className="mx-auto text-amber-500 mb-3" />
                                                <p className="text-sm font-bold text-slate-700 mb-2">
                                                    Bạn chưa có CV đính kèm
                                                </p>
                                                <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto leading-relaxed">
                                                    Tải CV của bạn lên hệ thống để sử dụng nộp hồ sơ nhanh chóng cho mọi
                                                    công việc.
                                                </p>
                                                <button
                                                    onClick={() => cvInputRef.current.click()}
                                                    disabled={isUploadingCv}
                                                    className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                                                >
                                                    {isUploadingCv ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <UploadCloud size={16} />
                                                    )}
                                                    {isUploadingCv ? 'Đang tải lên...' : 'Tải CV lên (PDF/DOC)'}
                                                </button>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            ref={cvInputRef}
                                            onChange={handleCvUpload}
                                            accept=".pdf,.doc,.docx"
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: ĐỔI MẬT KHẨU */}
                        {activeTab === 'password' && <ChangePassword />}

                        {/* TAB 3: SUPPORT */}
                        {activeTab === 'support' && <SupportReport />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
