import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    ShieldBan,
    UserCheck,
    Key,
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    X,
    Loader2,
    ChevronLeft,
    ChevronRight,
    UserCog,
} from 'lucide-react';
import userService from '~/services/userService';

const AdminUsers = () => {
    // 1. State Dữ liệu
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    // 2. State Bộ lọc & Phân trang
    const [filters, setFilters] = useState({
        keyword: '',
        role: '', // Trống là tất cả
        isActive: '', // Trống là tất cả, 'true', hoặc 'false'
    });

    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalPages: 1,
        totalElements: 0,
    });

    // 3. Hàm hiển thị thông báo
    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3500);
    };

    // 4. Hàm Gọi API lấy danh sách
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            // Chuẩn bị params, loại bỏ các filter rỗng
            const params = {
                page: pagination.page,
                size: pagination.size,
            };
            if (filters.keyword) params.keyword = filters.keyword;
            if (filters.role) params.role = filters.role;
            if (filters.isActive !== '') params.isActive = filters.isActive === 'true';

            const response = await userService.getUsers(params);

            setUsers(response.content || []);
            setPagination((prev) => ({
                ...prev,
                totalPages: response.totalPages || 1,
                totalElements: response.totalElements || 0,
            }));
        } catch (error) {
            console.error('Lỗi lấy danh sách user:', error);
            showToast('error', 'Không thể tải danh sách tài khoản.');
        } finally {
            setIsLoading(false);
        }
    }, [filters, pagination.page, pagination.size]);

    // Lắng nghe thay đổi filter và gọi API (Có debounce cho keyword)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500); // Đợi người dùng gõ xong 500ms mới gọi API

        return () => clearTimeout(timeoutId);
    }, [fetchUsers]);

    // 5. Các Hàm Hành Động (Actions)

    // 5.1 Khóa / Mở Khóa
    const handleToggleStatus = async (user) => {
        const newStatus = !user.isActive;
        const actionText = newStatus ? 'Mở khóa' : 'Khóa (Ban)';

        if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản ${user.email}?`)) return;

        try {
            await userService.updateUserStatus(user.id, newStatus, newStatus ? '' : 'Vi phạm chính sách');
            showToast('success', `Đã ${actionText.toLowerCase()} tài khoản thành công!`);
            fetchUsers(); // Refresh lại data
        } catch (error) {
            showToast('error', `Lỗi khi thay đổi trạng thái tài khoản.`);
        }
    };

    // 5.2 Thay đổi Role
    const handleChangeRole = async (user, newRole) => {
        if (user.role === newRole) return;
        if (!window.confirm(`Xác nhận đổi quyền của ${user.email} thành ${newRole}?`)) return;

        try {
            await userService.updateUserRole(user.id, newRole);
            showToast('success', `Đã cập nhật quyền thành ${newRole}.`);
            fetchUsers();
        } catch (error) {
            showToast('error', `Lỗi khi cập nhật phân quyền.`);
        }
    };

    // 5.3 Reset Mật khẩu
    const handleResetPassword = async (user) => {
        const newPass = window.prompt(`Nhập mật khẩu mới cho ${user.email}:`, '123456');
        if (!newPass) return; // Hủy

        try {
            await userService.resetUserPassword(user.id, newPass);
            showToast('success', `Đã reset mật khẩu thành công!`);
        } catch (error) {
            showToast('error', `Lỗi khi reset mật khẩu.`);
        }
    };

    // 6. Xử lý UI Badge
    const getRoleBadge = (role) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'EMPLOYER':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'CANDIDATE':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10 relative">
            {/* TOAST NOTIFICATION */}
            <div
                className={`fixed top-8 right-8 z-50 transition-all duration-500 transform ${
                    toast.show
                        ? 'translate-y-0 opacity-100 scale-100'
                        : '-translate-y-8 opacity-0 scale-95 pointer-events-none'
                }`}
            >
                <div
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${
                        toast.type === 'success'
                            ? 'bg-emerald-500/90 border-emerald-400 text-white'
                            : 'bg-rose-500/90 border-rose-400 text-white'
                    }`}
                >
                    {toast.type === 'success' ? (
                        <CheckCircle2 size={24} className="animate-bounce" />
                    ) : (
                        <AlertTriangle size={24} className="animate-pulse" />
                    )}
                    <span className="font-bold tracking-wide">{toast.message}</span>
                    <button
                        onClick={() => setToast({ show: false })}
                        className="ml-4 hover:bg-white/20 p-1 rounded-full transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Quản lý Tài Khoản</h1>
                    <p className="text-slate-500 mt-1 font-medium">
                        Tìm kiếm, phân quyền và kiểm soát truy cập hệ thống.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-indigo-50 px-5 py-2.5 rounded-2xl text-indigo-700 font-bold border border-indigo-100 text-center shadow-sm">
                        <span className="block text-2xl font-black">{pagination.totalElements}</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Tổng User</span>
                    </div>
                </div>
            </div>

            {/* TOOLBAR: SEARCH & FILTERS */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
                {/* Search Box */}
                <div className="flex-1 relative group">
                    <Search
                        className="absolute left-4 top-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo Tên hoặc Email..."
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700 placeholder-slate-400"
                        value={filters.keyword}
                        onChange={(e) => {
                            setFilters((prev) => ({ ...prev, keyword: e.target.value }));
                            setPagination((prev) => ({ ...prev, page: 0 })); // Reset page
                        }}
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <select
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer text-slate-700 font-bold transition-all"
                        value={filters.role}
                        onChange={(e) => {
                            setFilters((prev) => ({ ...prev, role: e.target.value }));
                            setPagination((prev) => ({ ...prev, page: 0 }));
                        }}
                    >
                        <option value="">Tất cả Vai trò</option>
                        <option value="CANDIDATE">Ứng viên</option>
                        <option value="EMPLOYER">Nhà Tuyển Dụng</option>
                        <option value="ADMIN">Quản Trị Viên</option>
                    </select>

                    <select
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer text-slate-700 font-bold transition-all"
                        value={filters.isActive}
                        onChange={(e) => {
                            setFilters((prev) => ({ ...prev, isActive: e.target.value }));
                            setPagination((prev) => ({ ...prev, page: 0 }));
                        }}
                    >
                        <option value="">Tất cả Trạng thái</option>
                        <option value="true">Đang hoạt động</option>
                        <option value="false">Đã bị khóa (Banned)</option>
                    </select>
                </div>
            </div>

            {/* DATA TABLE */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[400px]">
                {isLoading ? (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-indigo-600 mb-2" size={32} />
                        <span className="text-slate-500 font-medium">Đang tải dữ liệu...</span>
                    </div>
                ) : null}

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm uppercase tracking-wider">
                                <th className="py-4 px-6 font-bold">Thông tin Tài khoản</th>
                                <th className="py-4 px-6 font-bold text-center">Vai trò</th>
                                <th className="py-4 px-6 font-bold text-center">Trạng thái</th>
                                <th className="py-4 px-6 font-bold">Ngày tham gia</th>
                                <th className="py-4 px-6 font-bold text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className={`transition-colors ${!user.isActive ? 'bg-rose-50/40' : 'hover:bg-slate-50'}`}
                                    >
                                        {/* Avatar & Info */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random&color=fff&bold=true`}
                                                    alt="avatar"
                                                    className={`w-11 h-11 rounded-full shadow-sm border-2 ${!user.isActive ? 'border-rose-300 grayscale' : 'border-white'}`}
                                                />
                                                <div>
                                                    <p
                                                        className={`font-black text-[15px] ${!user.isActive ? 'text-rose-900 line-through' : 'text-slate-800'}`}
                                                    >
                                                        {user.fullName}
                                                    </p>
                                                    <p className="text-sm font-medium text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Select Role */}
                                        <td className="py-4 px-6 text-center">
                                            <select
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer outline-none transition-colors ${getRoleBadge(user.role)}`}
                                                value={user.role}
                                                onChange={(e) => handleChangeRole(user, e.target.value)}
                                            >
                                                <option value="CANDIDATE">CANDIDATE</option>
                                                <option value="EMPLOYER">EMPLOYER</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                        </td>

                                        {/* Status */}
                                        <td className="py-4 px-6 text-center">
                                            {user.isActive ? (
                                                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200">
                                                    <CheckCircle2 size={14} /> Hoạt động
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-200">
                                                    <ShieldAlert size={14} /> Bị Khóa
                                                </span>
                                            )}
                                        </td>

                                        {/* Created At */}
                                        <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                                            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Button Lock/Unlock */}
                                                {user.isActive ? (
                                                    <button
                                                        onClick={() => handleToggleStatus(user)}
                                                        title="Khóa tài khoản"
                                                        className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors border border-transparent hover:border-rose-200"
                                                    >
                                                        <ShieldBan size={18} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleToggleStatus(user)}
                                                        title="Mở khóa tài khoản"
                                                        className="p-2 text-rose-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors border border-transparent hover:border-emerald-200"
                                                    >
                                                        <UserCheck size={18} />
                                                    </button>
                                                )}

                                                {/* Button Reset Password */}
                                                <button
                                                    onClick={() => handleResetPassword(user)}
                                                    title="Reset Mật khẩu"
                                                    className="p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-colors border border-transparent hover:border-amber-200"
                                                >
                                                    <Key size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center">
                                        <UserCog size={48} className="mx-auto text-slate-300 mb-4" />
                                        <p className="text-lg font-bold text-slate-600">
                                            Không tìm thấy tài khoản nào!
                                        </p>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Vui lòng thử thay đổi từ khóa hoặc bộ lọc.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                        <span className="text-sm font-medium text-slate-500">
                            Trang <strong className="text-slate-800">{pagination.page + 1}</strong> /{' '}
                            {pagination.totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={pagination.page === 0}
                                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                disabled={pagination.page >= pagination.totalPages - 1}
                                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
