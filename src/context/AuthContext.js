import React, { createContext, useState, useEffect } from 'react';

// Tạo Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // State lưu thông tin user (Lấy từ localStorage nếu có)
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Khi app vừa chạy lên, kiểm tra xem trong kho chứa có user không
    useEffect(() => {
        const storedUser = localStorage.getItem('user_info');
        const token = localStorage.getItem('access_token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
            setIsLoggedIn(true);
        }
    }, []);

    // Hàm Login: Ghi dữ liệu vào Context và LocalStorage
    const login = (userData, token) => {
        setUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem('user_info', JSON.stringify(userData));
        localStorage.setItem('access_token', token);
    };

    // 🚀 MỚI: Hàm Update User (Dùng để cập nhật Logo/Tên ngay lập tức khi HR lưu cài đặt)
    const updateUser = (updatedFields) => {
        setUser((prevUser) => {
            if (!prevUser) return prevUser;
            const newUser = { ...prevUser, ...updatedFields };
            localStorage.setItem('user_info', JSON.stringify(newUser));
            return newUser;
        });
    };

    // Hàm Logout: Xóa sạch dữ liệu
    const logout = () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('user_info');
        localStorage.removeItem('access_token');
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, login, logout, updateUser }}>{children}</AuthContext.Provider>
    );
};
