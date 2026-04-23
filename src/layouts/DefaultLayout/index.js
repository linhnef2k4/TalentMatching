import React from 'react';
import Header from '~/components/Header'; // Tí nữa bro nhớ copy code Header dán vào thư mục này nhé

const DefaultLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
        </div>
    );
};

export default DefaultLayout;
