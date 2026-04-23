import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    User,
    Mail,
    Phone,
    UploadCloud,
    Save,
    Edit3,
    CheckCircle2,
    Loader2,
    ImagePlus,
    FileText,
    ExternalLink,
    Trash2,
    ShieldAlert,
} from 'lucide-react';
import { AuthContext } from '~/context/AuthContext';
import userService from '~/services/userService';
import applicationService from '~/services/applicationService'; // Nhớ import applicationService để dùng hàm uploadCv

const Profile = () => {
    const { user, login } = useContext(AuthContext);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isUploadingCv, setIsUploadingCv] = useState(false);

    // State form data
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        role: '',
        id: '',
        cvUrl: '', // Thêm trường lưu CV
    });

    const avatarInputRef = useRef(null);
    const cvInputRef = useRef(null);

    // Điền dữ liệu từ Context vào Form khi component mount
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Hàm gọi API Cập nhật thông tin (Tên, SĐT)
    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const payload = {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber || '',
            };

            await userService.updateProfile(payload);

            const updatedUser = { ...user, fullName: formData.fullName, phoneNumber: formData.phoneNumber };
            login(updatedUser, localStorage.getItem('access_token'));

            setIsEditing(false);
            alert('Cập nhật thông tin thành công!');
        } catch (error) {
            console.error('Lỗi update profile:', error);
            alert('Cập nhật thất bại. Vui lòng thử lại!');
        } finally {
            setIsSaving(false);
        }
    };

    // Hàm Upload Avatar
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chỉ chọn file hình ảnh!');
            return;
        }

        setIsUploadingAvatar(true);
        try {
            const response = await userService.updateAvatar(file);
            const newAvatarUrl = typeof response === 'string' ? response : response.avatar || response.url;

            const updatedUser = { ...user, avatar: newAvatarUrl };
            login(updatedUser, localStorage.getItem('access_token'));

            alert('Cập nhật ảnh đại diện thành công!');
        } catch (error) {
            console.error('Lỗi upload avatar:', error);
            alert('Upload ảnh thất bại!');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    // MỚI: Hàm Upload CV
    const handleCvUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check dung lượng (VD: < 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Vui lòng chọn file CV nhỏ hơn 5MB!');
            return;
        }

        setIsUploadingCv(true);
        try {
            // Tận dụng hàm uploadCv đã viết ở applicationService
            const response = await applicationService.uploadCv(file);

            // Lấy URL trả về (Tùy backend thiết kế: response.cvUrl hoặc response.url)
            const newCvUrl = response.cvUrl || response.url || (typeof response === 'string' ? response : null);

            if (newCvUrl) {
                setFormData((prev) => ({ ...prev, cvUrl: newCvUrl }));

                // Cập nhật ngầm lại user context
                const updatedUser = { ...user, cvUrl: newCvUrl };
                login(updatedUser, localStorage.getItem('access_token'));

                alert('Tải lên CV thành công! Từ giờ bạn có thể dùng CV này để ứng tuyển nhanh.');
            } else {
                throw new Error('Không lấy được URL trả về');
            }
        } catch (error) {
            console.error('Lỗi upload CV:', error);
            alert('Tải lên CV thất bại!');
        } finally {
            setIsUploadingCv(false);
            // Clear value input để có thể chọn lại file cũ nếu muốn
            e.target.value = null;
        }
    };

    // MỚI: Hàm Xóa CV
    const handleDeleteCv = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa CV mặc định này không?')) {
            setFormData((prev) => ({ ...prev, cvUrl: '' }));
            const updatedUser = { ...user, cvUrl: null };
            login(updatedUser, localStorage.getItem('access_token'));
            // Ở thực tế nên gọi 1 API lên backend để update field cvUrl thành null
        }
    };

    const getAvatar = () => {
        if (user?.avatar) return user.avatar;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=0D8ABC&color=fff&size=256`;
    };

    // Helper: Trích xuất tên file từ URL
    const getFileNameFromUrl = (url) => {
        if (!url) return '';
        const parts = url.split('/');
        const fullName = parts[parts.length - 1];
        // Bỏ bớt chuỗi loằng ngoằng do Cloudinary sinh ra nếu có
        return fullName.split('?')[0].substring(0, 30) + '...';
    };

    return (
        <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Thông tin Cá nhân</h1>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 px-4 py-2.5 rounded-xl font-semibold transition flex items-center gap-2 shadow-sm"
                        >
                            <Edit3 size={18} /> Chỉnh sửa hồ sơ
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`px-6 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-sm text-white
                ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'}`}
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Cột trái: Avatar & CV Stats */}
                    <div className="md:col-span-1 space-y-6">
                        {/* Box Avatar */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                            <div className="relative inline-block group">
                                <div
                                    className={`relative w-36 h-36 rounded-full border-4 border-white shadow-lg mx-auto overflow-hidden bg-gray-100 ${isUploadingAvatar ? 'opacity-50' : ''}`}
                                >
                                    <img src={getAvatar()} alt="Avatar" className="w-full h-full object-cover" />
                                    {isUploadingAvatar && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 size={32} className="animate-spin text-blue-600" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => avatarInputRef.current.click()}
                                    disabled={isUploadingAvatar}
                                    className="absolute bottom-1 right-2 bg-blue-600 text-white p-2.5 rounded-full border-2 border-white hover:bg-blue-700 transition cursor-pointer shadow-md disabled:bg-gray-400"
                                >
                                    <ImagePlus size={18} />
                                </button>
                                <input
                                    type="file"
                                    ref={avatarInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 mt-5">{formData.fullName}</h2>
                            <p className="text-gray-500 font-medium text-sm mt-1">{formData.email}</p>

                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                                    <CheckCircle2 size={14} /> Hoạt động
                                </span>
                                <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold uppercase">
                                    {formData.role}
                                </span>
                            </div>
                        </div>

                        {/* Box Quản lý CV */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <FileText size={18} className="text-blue-500" /> Hồ Sơ Đính Kèm (CV)
                            </h3>

                            {formData.cvUrl ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
                                        <div className="w-10 h-10 bg-white text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-200">
                                            <FileText size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className="font-bold text-sm text-gray-900 truncate"
                                                title={getFileNameFromUrl(formData.cvUrl)}
                                            >
                                                {getFileNameFromUrl(formData.cvUrl)}
                                            </p>
                                            <p className="text-xs text-blue-600 font-medium mt-0.5 flex items-center gap-1">
                                                <CheckCircle2 size={12} /> CV Mặc định
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <a
                                            href={formData.cvUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold py-2 rounded-lg transition-colors flex justify-center items-center gap-1.5"
                                        >
                                            <ExternalLink size={14} /> Xem
                                        </a>
                                        <button
                                            onClick={handleDeleteCv}
                                            className="flex-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold py-2 rounded-lg transition-colors flex justify-center items-center gap-1.5"
                                        >
                                            <Trash2 size={14} /> Gỡ bỏ
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                    <ShieldAlert size={32} className="mx-auto text-orange-400 mb-2" />
                                    <p className="text-xs text-gray-500 mb-3">
                                        Bạn chưa cập nhật CV. Đính kèm ngay để tăng 80% cơ hội nhà tuyển dụng gọi điện!
                                    </p>
                                    <button
                                        onClick={() => cvInputRef.current.click()}
                                        disabled={isUploadingCv}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors w-full flex justify-center items-center gap-2"
                                    >
                                        {isUploadingCv ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <UploadCloud size={16} />
                                        )}
                                        {isUploadingCv ? 'Đang tải lên...' : 'Tải CV lên'}
                                    </button>
                                </div>
                            )}

                            {/* Input ẩn cho Upload CV */}
                            <input
                                type="file"
                                ref={cvInputRef}
                                onChange={handleCvUpload}
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Cột phải: Form Thông tin chi tiết */}
                    <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900">Chi tiết tài khoản</h3>
                        </div>

                        <form className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Tên hiển thị (Cho phép sửa) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Họ và tên hiển thị
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                        <input
                                            disabled={!isEditing}
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            type="text"
                                            className={`w-full pl-11 pr-4 py-3 border rounded-xl outline-none transition-all font-medium ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white text-gray-900' : 'border-transparent bg-gray-50 text-gray-600'}`}
                                        />
                                    </div>
                                </div>

                                {/* Số điện thoại (Cho phép sửa) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Số điện thoại
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                        <input
                                            disabled={!isEditing}
                                            name="phoneNumber"
                                            value={formData.phoneNumber || ''}
                                            onChange={handleChange}
                                            type="tel"
                                            placeholder="Chưa cập nhật số điện thoại"
                                            className={`w-full pl-11 pr-4 py-3 border rounded-xl outline-none transition-all font-medium ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white text-gray-900' : 'border-transparent bg-gray-50 text-gray-600'}`}
                                        />
                                    </div>
                                </div>

                                {/* Email (Chỉ đọc) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-500 mb-2 flex items-center justify-between">
                                        <span>Email đăng nhập (Không thể sửa)</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                        <input
                                            disabled
                                            value={formData.email}
                                            type="email"
                                            className="w-full pl-11 pr-4 py-3 border border-transparent bg-gray-100 rounded-xl outline-none text-gray-500 font-medium cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
