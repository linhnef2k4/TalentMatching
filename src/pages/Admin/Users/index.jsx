import React, { useState } from 'react';
import { Search, Filter, ShieldBan, UserCheck, MoreVertical, AlertTriangle, UserX } from 'lucide-react';

const AdminUsers = () => {
    // Mock dữ liệu tài khoản trong hệ thống
    const [users, setUsers] = useState([
        {
            id: 1,
            name: 'Linh Phan',
            email: 'linhphan300424@gmail.com',
            role: 'Seeker',
            status: 'Active',
            joinDate: '01/03/2026',
            avatar: 'https://ui-avatars.com/api/?name=Linh+Phan&background=0D8ABC&color=fff',
        },
        {
            id: 2,
            name: 'Công ty TNHH TechNova',
            email: 'hr@technova.com',
            role: 'HR',
            status: 'Active',
            joinDate: '15/02/2026',
            avatar: 'https://ui-avatars.com/api/?name=Tech+Nova&background=2563EB&color=fff',
        },
        {
            id: 3,
            name: 'Trần B',
            email: 'tranb@gmail.com',
            role: 'Seeker',
            status: 'Active',
            joinDate: '10/03/2026',
            avatar: 'https://ui-avatars.com/api/?name=Tran+B&background=6B21A8&color=fff',
        },
        {
            id: 4,
            name: 'SpamUser99',
            email: 'spam_marketing@fake.com',
            role: 'Seeker',
            status: 'Banned',
            joinDate: '05/03/2026',
            avatar: 'https://ui-avatars.com/api/?name=Spam+User&background=EF4444&color=fff',
        },
        {
            id: 5,
            name: 'Tập đoàn ABC',
            email: 'tuyendung@abc.vn',
            role: 'HR',
            status: 'Active',
            joinDate: '20/01/2026',
            avatar: 'https://ui-avatars.com/api/?name=A+B+C&background=10B981&color=fff',
        },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    // Logic Lọc Dữ liệu
    const filteredUsers = users.filter((user) => {
        const matchSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = filterRole === 'All' || user.role === filterRole;
        const matchStatus = filterStatus === 'All' || user.status === filterStatus;
        return matchSearch && matchRole && matchStatus;
    });

    // Hàm Khóa / Mở khóa tài khoản
    const handleToggleBan = (id, currentStatus) => {
        const actionName = currentStatus === 'Active' ? 'khóa (ban)' : 'mở khóa';
        if (window.confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản này không?`)) {
            setUsers(
                users.map((user) => {
                    if (user.id === id) {
                        return { ...user, status: currentStatus === 'Active' ? 'Banned' : 'Active' };
                    }
                    return user;
                }),
            );
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Danh sách Tài khoản</h1>
                    <p className="text-gray-500 mt-1">Kiểm soát truy cập và xử lý các tài khoản vi phạm chính sách.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-blue-50 px-4 py-2 rounded-xl text-blue-700 font-bold border border-blue-100 text-center">
                        <span className="block text-2xl">{users.length}</span>
                        <span className="text-xs font-semibold uppercase">Tổng tài khoản</span>
                    </div>
                    <div className="bg-red-50 px-4 py-2 rounded-xl text-red-700 font-bold border border-red-100 text-center">
                        <span className="block text-2xl">{users.filter((u) => u.status === 'Banned').length}</span>
                        <span className="text-xs font-semibold uppercase">Đã bị khóa</span>
                    </div>
                </div>
            </div>

            {/* Toolbar: Search & Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc email..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3">
                    <select
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 cursor-pointer text-gray-700 font-medium"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                    >
                        <option value="All">Tất cả Vai trò</option>
                        <option value="Seeker">Ứng viên (Seeker)</option>
                        <option value="HR">Nhà Tuyển Dụng (HR)</option>
                    </select>

                    <select
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 cursor-pointer text-gray-700 font-medium"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">Tất cả Trạng thái</option>
                        <option value="Active">Đang hoạt động</option>
                        <option value="Banned">Đã bị khóa</option>
                    </select>
                </div>
            </div>

            {/* Bảng Dữ liệu Tài khoản */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                                <th className="py-4 px-6 font-semibold">Tài khoản</th>
                                <th className="py-4 px-6 font-semibold">Vai trò</th>
                                <th className="py-4 px-6 font-semibold">Ngày tham gia</th>
                                <th className="py-4 px-6 font-semibold text-center">Trạng thái</th>
                                <th className="py-4 px-6 font-semibold text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className={`transition ${user.status === 'Banned' ? 'bg-red-50/30' : 'hover:bg-gray-50/80'}`}
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.avatar}
                                                    alt="avatar"
                                                    className={`w-10 h-10 rounded-full border ${user.status === 'Banned' ? 'border-red-300 grayscale' : 'border-gray-200'}`}
                                                />
                                                <div>
                                                    <p
                                                        className={`font-bold ${user.status === 'Banned' ? 'text-red-900 line-through' : 'text-gray-900'}`}
                                                    >
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${user.role === 'HR' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600 font-medium">{user.joinDate}</td>
                                        <td className="py-4 px-6 text-center">
                                            {user.status === 'Active' ? (
                                                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                                                    <UserCheck size={14} /> Hoạt động
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                                                    <UserX size={14} /> Bị khóa
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            {user.status === 'Active' ? (
                                                <button
                                                    onClick={() => handleToggleBan(user.id, user.status)}
                                                    className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-bold text-sm transition flex items-center gap-1.5 inline-flex shadow-sm"
                                                >
                                                    <ShieldBan size={16} /> Khóa tài khoản
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleToggleBan(user.id, user.status)}
                                                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600 px-3 py-1.5 rounded-lg font-bold text-sm transition flex items-center gap-1.5 inline-flex shadow-sm"
                                                >
                                                    <UserCheck size={16} /> Mở khóa
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-gray-500">
                                        <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4 opacity-50" />
                                        <p className="text-lg font-semibold text-gray-700">
                                            Không tìm thấy tài khoản nào khớp với bộ lọc.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
