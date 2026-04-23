/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    darkMode: 'class',

    theme: {
        extend: {
            colors: {
                primary: '#136dec',
                'accent-yellow': '#fbbf24',
                'background-light': '#f6f7f8',
                'background-dark': '#101822',
            },

            fontFamily: {
                // ✅ FONT GIỐNG TOPCV
                sans: [
                    'Inter',
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"Segoe UI"',
                    'Roboto',
                    'sans-serif',
                ],

                // dùng cho heading nếu cần đậm hơn
                display: ['Inter', 'system-ui', 'sans-serif'],
            },

            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-15px)' },
                },
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
            },

            animation: {
                float: 'float 4s ease-in-out infinite',
                'float-delayed': 'float 5s ease-in-out infinite 1s',
                marquee: 'marquee 40s linear infinite',
            },
        },
    },

    plugins: [],
};
