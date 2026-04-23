import { useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import aiService from '~/services/aiService';

// Thời gian chờ trước khi thử lại (800ms, rồi 1600ms)
const RETRY_DELAYS = [800, 1600];

// Hàm gọi API có cơ chế tự động thử lại nếu lỗi 500
async function fetchWithRetry(content, retries = RETRY_DELAYS) {
    try {
        const res = await aiService.generateCV(content);
        return res.data ?? res;
    } catch (err) {
        // Chỉ retry khi lỗi 500 hoặc rớt mạng (Network Error). Không retry lỗi 400/401/403
        const status = err?.response?.status;
        if (retries.length > 0 && (!status || status >= 500)) {
            console.warn(`[AI Retry] Lỗi ${status || 'Network'}. Đang thử lại sau ${retries[0]}ms...`);
            await new Promise((r) => setTimeout(r, retries[0]));
            return fetchWithRetry(content, retries.slice(1));
        }
        throw err;
    }
}

// Hàm bóc tách cục JSON khổng lồ của Backend thành String
function parseAIResponse(type, responseData) {
    if (!responseData || typeof responseData !== 'object') return '';

    if (type === 'summary') {
        return (responseData.professional_summary ?? '').trim();
    }

    if (type === 'experience') {
        const exp = responseData.work_experience?.[0];
        if (!exp) return '';
        if (Array.isArray(exp.achievements) && exp.achievements.length > 0) {
            return exp.achievements.map((a) => `• ${String(a).trim()}`).join('\n');
        }
        return (exp.role ?? exp.company ?? '').trim();
    }

    if (type === 'project') {
        const proj = responseData.projects?.[0];
        if (!proj) return '';
        if (Array.isArray(proj.description) && proj.description.length > 0) {
            return proj.description.map((d) => `• ${String(d).trim()}`).join('\n');
        }
        return (proj.name ?? '').trim();
    }
    return '';
}

// Hook chính
export function useAIOptimize(dispatch) {
    const abortRef = useRef(null); // Lưu AbortController để cancel request cũ nếu user bấm liên tục
    const loadingSet = useRef(new Set()); // Track các field đang loading → tránh double-click

    const optimize = useCallback(
        async (type, content, itemId) => {
            const loadingKey = itemId ?? type;

            // ── Guard 1: Nội dung rỗng / quá ngắn ──
            const trimmed = (content ?? '').replace(/\s+/g, ' ').trim();
            if (trimmed.length < 10) {
                toast.error('Vui lòng nhập ít nhất 10 ký tự để AI có thể hiểu ngữ cảnh.', { id: 'ai-toast' });
                return;
            }

            // ── Guard 2: Đang load key này rồi → bỏ qua (Chống spam click) ──
            if (loadingSet.current.has(loadingKey)) return;

            // ── Cancel request cũ (nếu đang chạy key khác) ──
            if (abortRef.current) {
                abortRef.current.abort();
            }
            abortRef.current = new AbortController();

            // ── Bắt đầu xử lý ──
            loadingSet.current.add(loadingKey);
            dispatch({ type: 'SET_AI', v: loadingKey, field: type });
            toast.loading('AI đang phân tích và tối ưu hóa...', { id: 'ai-toast' });

            try {
                // Bơm thêm một chút "gợi ý" vào nội dung thô để AI làm việc chính xác hơn
                let contextPrefix = '';
                if (type === 'summary') contextPrefix = 'Viết lại phần tóm tắt bản thân chuyên nghiệp:\n';
                else if (type === 'experience')
                    contextPrefix = 'Viết lại kinh nghiệm làm việc này thành các gạch đầu dòng ngắn gọn:\n';
                else if (type === 'project') contextPrefix = 'Viết lại mô tả dự án này:\n';

                const finalPayload = `${contextPrefix}"${trimmed}"`;

                const responseData = await fetchWithRetry(finalPayload);
                const optimized = parseAIResponse(type, responseData);

                if (!optimized) {
                    throw new Error('AI không thể nhận diện nội dung. Hãy bổ sung thêm chi tiết.');
                }

                // Gửi action cập nhật dữ liệu lên Reducer
                if (type === 'summary') {
                    dispatch({ type: 'UPD_PERSONAL', v: { summary: optimized } });
                } else if (type === 'experience') {
                    dispatch({ type: 'UPD_ITEM', sec: 'experience', id: itemId, v: { description: optimized } });
                } else if (type === 'project') {
                    dispatch({ type: 'UPD_ITEM', sec: 'projects', id: itemId, v: { description: optimized } });
                }

                toast.success('AI đã tối ưu thành công!', { id: 'ai-toast' });
            } catch (err) {
                if (err?.name === 'AbortError') return; // Bị cancel chủ động → không hiện lỗi

                const msg =
                    err?.response?.data?.message ?? err?.message ?? 'Gặp sự cố khi kết nối AI. Vui lòng thử lại.';
                toast.error(msg, { id: 'ai-toast' });
                console.error('[AI Error]', { type, itemId, status: err?.response?.status, msg });
            } finally {
                loadingSet.current.delete(loadingKey);
                dispatch({ type: 'SET_AI', v: false });
            }
        },
        [dispatch], // dispatch là stable ref, không gây re-render vòng lặp
    );

    return optimize;
}
