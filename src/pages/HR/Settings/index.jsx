import React, { useState, useRef, useEffect } from 'react';
import {
    Building,
    Lock,
    Trash2,
    AlertTriangle,
    Save,
    UploadCloud,
    Globe,
    X,
    MapPin,
    FileText,
    Loader2,
    Camera,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import employerCompanyService from '~/services/employerCompanyService';

const HRSettings = () => {
    const navigate = useNavigate();

    // Trạng thái Loading
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Trạng thái Modal Xóa
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const fileInputRef = useRef(null);

    // State Form chuẩn khớp 100% với API Payload
    const [formData, setFormData] = useState({
        name: '',
        taxCode: '',
        address: '',
        website: '',
        description: '',
        logoUrl: '',
    });

    // 1. GỌI API LẤY THÔNG TIN CÔNG TY LÚC MỚI VÀO TRANG
    useEffect(() => {
        const fetchMyCompany = async () => {
            try {
                setIsLoading(true);
                const res = await employerCompanyService.getMyCompany();
                const data = res.data || res;

                setFormData({
                    name: data.name || '',
                    taxCode: data.taxCode || '',
                    address: data.address || '',
                    website: data.website || '',
                    description: data.description || data.shortDescription || '',
                    logoUrl: data.logoUrl || '',
                });
            } catch (error) {
                console.error('Lỗi lấy thông tin:', error);
                toast.error('Không thể tải thông tin công ty hiện tại.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyCompany();
    }, []);

    // 2. XỬ LÝ UPLOAD LOGO LÊN CLOUDINARY THÔNG QUA BACKEND
    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check size (Ví dụ: Max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Vui lòng chọn ảnh Logo có kích thước dưới 2MB');
            return;
        }

        setIsUploading(true);
        toast.loading('Đang tải ảnh lên...', { id: 'upload-toast' });

        try {
            const res = await employerCompanyService.uploadLogo(file);
            // Theo swagger API trả về chuỗi string, kiểm tra nếu backend bọc trong data
            const newLogoUrl = typeof res === 'string' ? res : res.data || res;

            setFormData((prev) => ({ ...prev, logoUrl: newLogoUrl }));
            toast.success('Cập nhật Logo thành công!', { id: 'upload-toast' });
        } catch (error) {
            console.error('Lỗi upload logo:', error);
            toast.error('Tải ảnh lên thất bại. Vui lòng thử lại.', { id: 'upload-toast' });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // 3. XỬ LÝ LƯU THÔNG TIN CÔNG TY (PUT)
    const handleSave = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            return toast.error('Tên công ty không được để trống!');
        }

        setIsSaving(true);
        toast.loading('Đang lưu thông tin...', { id: 'save-toast' });

        try {
            const payload = {
                name: formData.name,
                address: formData.address,
                website: formData.website,
                description: formData.description,
                taxCode: formData.taxCode,
            };

            await employerCompanyService.updateMyCompany(payload);
            toast.success('Lưu thông tin công ty thành công!', { id: 'save-toast' });
        } catch (error) {
            console.error('Lỗi lưu thông tin:', error);
            toast.error('Có lỗi xảy ra khi lưu thông tin.', { id: 'save-toast' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = () => {
        if (deleteConfirmText === 'XOA TAI KHOAN') {
            toast.success('Tài khoản đã bị xóa vĩnh viễn.');
            setShowDeleteModal(false);
            setTimeout(() => navigate('/'), 1500);
        } else {
            toast.error('Vui lòng gõ đúng chữ "XOA TAI KHOAN" để xác nhận.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={40} className="animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto font-sans space-y-8 pb-12 px-4 sm:px-6">
            <Toaster position="top-right" />

            <form onSubmit={handleSave} className="space-y-6">
                {/* SECTION 1: LOGO CÔNG TY */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center sm:flex-row sm:items-start gap-8">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative">
                            {formData.logoUrl ? (
                                <img
                                    src={formData.logoUrl}
                                    alt="Logo"
                                    className="w-full h-full object-contain p-2 bg-white"
                                />
                            ) : (
                                <Building size={40} className="text-gray-300" />
                            )}

                            {/* Overlay hover đổi ảnh */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                            >
                                {isUploading ? <Loader2 className="animate-spin" size={24} /> : <Camera size={24} />}
                                <span className="text-xs font-medium mt-1">
                                    {isUploading ? 'Đang tải...' : 'Đổi Logo'}
                                </span>
                            </div>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleLogoUpload}
                            disabled={isUploading}
                        />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Logo Doanh Nghiệp</h2>
                        <p className="text-sm text-gray-500 mb-4 max-w-md">
                            Logo sẽ hiển thị trên trang chi tiết công ty và các bài đăng tuyển dụng. Nên sử dụng ảnh
                            vuông (tỉ lệ 1:1), định dạng JPG/PNG, dung lượng tối đa 2MB.
                        </p>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center sm:justify-start gap-2 transition mx-auto sm:mx-0 disabled:opacity-50"
                        >
                            <UploadCloud size={18} /> {isUploading ? 'Đang tải lên...' : 'Tải Logo Lên'}
                        </button>
                    </div>
                </div>

                {/* SECTION 2: THÔNG TIN CHI TIẾT */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                        <Building className="text-blue-600" size={20} /> Thông tin Doanh Nghiệp
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Tên công ty <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="VD: Công ty TNHH Phần Mềm ABC"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Mã số thuế</label>
                            <input
                                type="text"
                                value={formData.taxCode}
                                onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                                placeholder="VD: 0102345678"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ trụ sở</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="VD: Tòa nhà A, Quận B, Hà Nội"
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition font-medium"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Website</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="VD: https://congtyabc.com"
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition font-medium"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả công ty</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <textarea
                                    rows="5"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Giới thiệu về quy mô, lĩnh vực hoạt động, văn hóa công ty..."
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition font-medium resize-none leading-relaxed"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 text-white transition shadow-md active:scale-95 ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" /> Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save size={18} /> Lưu Thay Đổi
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* SECTION 3: BẢO MẬT & NGUY HIỂM */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm mt-8">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                    <Lock className="text-gray-600" size={20} /> Bảo mật & Quản lý dữ liệu
                </h2>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 border border-gray-200 rounded-xl mb-6 bg-gray-50/50">
                    <div>
                        <h3 className="font-bold text-gray-900">Mật khẩu đăng nhập</h3>
                        <p className="text-sm text-gray-500 mt-1">Đổi mật khẩu định kỳ để bảo vệ tài khoản tốt hơn.</p>
                    </div>
                    <button className="mt-4 md:mt-0 bg-white border border-gray-300 text-gray-700 hover:text-blue-600 hover:border-blue-400 px-5 py-2.5 rounded-xl font-bold transition shadow-sm">
                        Đổi mật khẩu
                    </button>
                </div>

                {/* Danger Zone */}
                <div className="border border-red-200 rounded-xl overflow-hidden mt-8">
                    <div className="bg-red-50 p-5 border-b border-red-200 flex items-start gap-4">
                        <div className="bg-red-100 p-2 rounded-full">
                            <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-800 text-lg">Khu vực nguy hiểm</h3>
                            <p className="text-sm text-red-600 mt-1 leading-relaxed">
                                Khi bạn xóa tài khoản doanh nghiệp, toàn bộ tin tuyển dụng, CV ứng viên đã lưu và lịch
                                sử chat sẽ bị xóa vĩnh viễn. Hành động này không thể khôi phục.
                            </p>
                        </div>
                    </div>
                    <div className="p-5 bg-white flex justify-end">
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 px-6 py-2.5 rounded-xl font-bold transition flex items-center gap-2 active:scale-95"
                        >
                            <Trash2 size={18} /> Xóa tài khoản vĩnh viễn
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL CẢNH BÁO XÓA TÀI KHOẢN */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-red-600 p-6 text-center text-white relative">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="absolute top-4 right-4 text-red-200 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                            <AlertTriangle size={48} className="mx-auto mb-3 text-red-200" />
                            <h2 className="text-2xl font-black">Cảnh Báo Cuối Cùng!</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 mb-6 text-center leading-relaxed">
                                Bạn có chắc chắn muốn xóa tài khoản công ty không? Thao tác này là{' '}
                                <span className="font-bold text-red-600 uppercase">không thể hoàn tác</span>.
                            </p>
                            <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                                    Nhập{' '}
                                    <span className="font-mono text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded mx-1">
                                        XOA TAI KHOAN
                                    </span>{' '}
                                    để xác nhận
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 font-mono text-center uppercase font-bold"
                                    placeholder="Nhập vào đây..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteConfirmText('');
                                    }}
                                    className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-bold transition"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition shadow-md shadow-red-500/30"
                                >
                                    Xác nhận Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HRSettings;
