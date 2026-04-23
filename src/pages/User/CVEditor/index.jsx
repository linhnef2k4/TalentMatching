import React, { useState, useReducer, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { ClassicCV, ModernCV, CreativeCV } from '~/components/cv/CVTemplates';
import aiService from '~/services/aiService'; // 🚨 Hãy đảm bảo service này đã xuất export hàm generateCV(rawInfo)
import {
    Plus,
    Trash2,
    Sparkles,
    Download,
    Save,
    User,
    Briefcase,
    GraduationCap,
    Code2,
    FolderOpen,
    Award,
    Eye,
    Loader2,
    ChevronRight,
    PlusCircle,
    FileText,
    Settings,
    X,
    UploadCloud,
    Zap,
    Wand2,
} from 'lucide-react';

// DỮ LIỆU MẪU BAN ĐẦU
const SAMPLE = {
    personal: {
        name: 'Nguyễn Văn An',
        title: 'Senior Frontend Developer',
        email: 'nguyenvanan@email.com',
        phone: '+84 901 234 567',
        location: 'Hà Nội, Việt Nam',
        website: 'portfolio.dev',
        linkedin: 'linkedin.com/in/nguyenvanan',
        summary: '',
        avatar: '',
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    customSections: [],
};

const getSafeArray = (arr, fallback = []) => (Array.isArray(arr) ? arr : fallback);

// REDUCER
function reducer(state, action) {
    const { data } = state;
    switch (action.type) {
        case 'SET_TEMPLATE':
            return { ...state, template: action.v };
        case 'SET_SECTION':
            return { ...state, activeSection: action.v };
        case 'UPD_PERSONAL':
            return { ...state, data: { ...data, personal: { ...(data.personal || {}), ...action.v } } };
        case 'ADD_ITEM':
            return { ...state, data: { ...data, [action.sec]: [...getSafeArray(data[action.sec]), action.item] } };
        case 'UPD_ITEM':
            return {
                ...state,
                data: {
                    ...data,
                    [action.sec]: getSafeArray(data[action.sec]).map((x) =>
                        x.id === action.id ? { ...x, ...action.v } : x,
                    ),
                },
            };
        case 'DEL_ITEM':
            return {
                ...state,
                data: { ...data, [action.sec]: getSafeArray(data[action.sec]).filter((x) => x.id !== action.id) },
            };
        // ── Thêm Case LOAD_AI_DATA để apply toàn bộ dữ liệu AI sinh ra ──
        case 'LOAD_AI_DATA':
            return { ...state, data: action.payload };
        // ──────────────────────────────────────────────────────────────
        case 'ADD_CS':
            return {
                ...state,
                data: {
                    ...data,
                    customSections: [
                        ...getSafeArray(data.customSections),
                        { id: `cs${Date.now()}`, title: 'Mục mới', items: [] },
                    ],
                },
            };
        case 'UPD_CS':
            return {
                ...state,
                data: {
                    ...data,
                    customSections: getSafeArray(data.customSections).map((s) =>
                        s.id === action.id ? { ...s, ...action.v } : s,
                    ),
                },
            };
        case 'DEL_CS':
            return {
                ...state,
                data: { ...data, customSections: getSafeArray(data.customSections).filter((s) => s.id !== action.id) },
            };
        case 'ADD_CI':
            return {
                ...state,
                data: {
                    ...data,
                    customSections: getSafeArray(data.customSections).map((s) =>
                        s.id === action.sid
                            ? { ...s, items: [...getSafeArray(s.items), { id: `ci${Date.now()}`, content: '' }] }
                            : s,
                    ),
                },
            };
        case 'UPD_CI':
            return {
                ...state,
                data: {
                    ...data,
                    customSections: getSafeArray(data.customSections).map((s) =>
                        s.id === action.sid
                            ? {
                                  ...s,
                                  items: getSafeArray(s.items).map((i) =>
                                      i.id === action.iid ? { ...i, content: action.v } : i,
                                  ),
                              }
                            : s,
                    ),
                },
            };
        case 'DEL_CI':
            return {
                ...state,
                data: {
                    ...data,
                    customSections: getSafeArray(data.customSections).map((s) =>
                        s.id === action.sid
                            ? { ...s, items: getSafeArray(s.items).filter((i) => i.id !== action.iid) }
                            : s,
                    ),
                },
            };
        default:
            return state;
    }
}

const uid = () => `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// UI COMPONENT HELPERS
const inputCls =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all';
const textareaCls = inputCls + ' resize-none';
const labelCls = 'block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider';
const cardCls = 'bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-5 relative group';

function Field({ label, children }) {
    return (
        <div className="mb-4">
            <label className={labelCls}>{label}</label>
            {children}
        </div>
    );
}

// FORM SECTIONS (Đã bỏ các nút AI lẻ tẻ cũ để form gọn gàng hơn)
function PersonalForm({ personal = {}, dispatch }) {
    const up = (v) => dispatch({ type: 'UPD_PERSONAL', v });
    const handleAvatar = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => up({ avatar: ev.target.result });
        reader.readAsDataURL(file);
    };
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-800 text-xl tracking-tight">Thông tin cá nhân</h3>
            </div>
            <div className="mb-6 flex items-center gap-5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {personal.avatar ? (
                    <img
                        src={personal.avatar}
                        alt=""
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                        <User size={28} />
                    </div>
                )}
                <div className="flex flex-col items-start gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-indigo-600 transition-colors px-4 py-2 rounded-xl shadow-sm">
                        <UploadCloud size={16} /> Tải ảnh chân dung{' '}
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatar} />
                    </label>
                    {personal.avatar && (
                        <button
                            onClick={() => up({ avatar: '' })}
                            className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1"
                        >
                            <X size={12} /> Xóa ảnh
                        </button>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    ['Họ và tên', 'name', 'Nguyễn Văn A'],
                    ['Chức danh', 'title', 'Frontend Developer'],
                    ['Email', 'email', 'email@example.com'],
                    ['Điện thoại', 'phone', '+84 9xx xxx xxx'],
                    ['Địa chỉ', 'location', 'Hà Nội, Việt Nam'],
                    ['Website', 'website', 'portfolio.dev'],
                    ['LinkedIn', 'linkedin', 'linkedin.com/in/...'],
                ].map(([label, key, ph]) => (
                    <Field key={key} label={label}>
                        <input
                            className={inputCls}
                            value={personal[key] || ''}
                            onChange={(e) => up({ [key]: e.target.value })}
                            placeholder={ph}
                        />
                    </Field>
                ))}
            </div>
            <Field label="Tóm tắt bản thân">
                <textarea
                    className={textareaCls}
                    rows={4}
                    value={personal.summary || ''}
                    onChange={(e) => up({ summary: e.target.value })}
                    placeholder="Giới thiệu bản thân ngắn gọn, nêu bật thành tựu..."
                />
            </Field>
        </div>
    );
}

function ExperienceForm({ experience, dispatch }) {
    const safeExp = getSafeArray(experience);
    const add = () =>
        dispatch({
            type: 'ADD_ITEM',
            sec: 'experience',
            item: { id: uid(), company: '', title: '', startDate: '', endDate: '', current: false, description: '' },
        });
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-800 text-xl tracking-tight">Kinh nghiệm làm việc</h3>
                <button
                    onClick={add}
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-indigo-600 transition-colors shadow-sm"
                >
                    <Plus size={14} /> Thêm mới
                </button>
            </div>
            {safeExp.map((ex) => (
                <div key={ex.id} className={cardCls}>
                    <button
                        onClick={() => dispatch({ type: 'DEL_ITEM', sec: 'experience', id: ex.id })}
                        className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 hover:bg-rose-50 rounded-full p-1.5"
                    >
                        <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            ['Công ty', 'company'],
                            ['Chức danh', 'title'],
                            ['Từ tháng', 'startDate'],
                            ['Đến tháng', 'endDate'],
                        ].map(([label, key]) => (
                            <Field key={key} label={label}>
                                <input
                                    className={inputCls}
                                    value={ex[key] || ''}
                                    onChange={(e) =>
                                        dispatch({
                                            type: 'UPD_ITEM',
                                            sec: 'experience',
                                            id: ex.id,
                                            v: { [key]: e.target.value },
                                        })
                                    }
                                />
                            </Field>
                        ))}
                    </div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-5 cursor-pointer w-fit select-none">
                        <input
                            type="checkbox"
                            checked={!!ex.current}
                            onChange={(e) =>
                                dispatch({
                                    type: 'UPD_ITEM',
                                    sec: 'experience',
                                    id: ex.id,
                                    v: { current: e.target.checked },
                                })
                            }
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        Đang làm việc tại đây
                    </label>
                    <Field label="Mô tả công việc & thành tựu">
                        <textarea
                            className={textareaCls}
                            rows={5}
                            value={ex.description || ''}
                            onChange={(e) =>
                                dispatch({
                                    type: 'UPD_ITEM',
                                    sec: 'experience',
                                    id: ex.id,
                                    v: { description: e.target.value },
                                })
                            }
                            placeholder="• Gạch đầu dòng..."
                        />
                    </Field>
                </div>
            ))}
            {safeExp.length === 0 && (
                <div className="text-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-medium text-sm">
                    Chưa có kinh nghiệm nào. Nhấn "+ Thêm mới" để bắt đầu.
                </div>
            )}
        </div>
    );
}

function EducationForm({ education, dispatch }) {
    const safeEdu = getSafeArray(education);
    const add = () =>
        dispatch({
            type: 'ADD_ITEM',
            sec: 'education',
            item: { id: uid(), school: '', degree: '', field: '', startDate: '', endDate: '', description: '' },
        });
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-800 text-xl tracking-tight">Học vấn</h3>
                <button
                    onClick={add}
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-indigo-600 transition-colors shadow-sm"
                >
                    <Plus size={14} /> Thêm mới
                </button>
            </div>
            {safeEdu.map((ed) => (
                <div key={ed.id} className={cardCls}>
                    <button
                        onClick={() => dispatch({ type: 'DEL_ITEM', sec: 'education', id: ed.id })}
                        className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 hover:bg-rose-50 rounded-full p-1.5"
                    >
                        <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            ['Trường', 'school'],
                            ['Bằng cấp', 'degree'],
                            ['Chuyên ngành', 'field'],
                            ['Năm bắt đầu', 'startDate'],
                            ['Năm kết thúc', 'endDate'],
                        ].map(([label, key]) => (
                            <Field key={key} label={label}>
                                <input
                                    className={inputCls}
                                    value={ed[key] || ''}
                                    onChange={(e) =>
                                        dispatch({
                                            type: 'UPD_ITEM',
                                            sec: 'education',
                                            id: ed.id,
                                            v: { [key]: e.target.value },
                                        })
                                    }
                                />
                            </Field>
                        ))}
                    </div>
                    <Field label="Ghi chú (GPA, Học bổng...)">
                        <textarea
                            className={textareaCls}
                            rows={2}
                            value={ed.description || ''}
                            onChange={(e) =>
                                dispatch({
                                    type: 'UPD_ITEM',
                                    sec: 'education',
                                    id: ed.id,
                                    v: { description: e.target.value },
                                })
                            }
                        />
                    </Field>
                </div>
            ))}
        </div>
    );
}

function SkillsForm({ skills, dispatch }) {
    const safeSkills = getSafeArray(skills);
    const add = () => dispatch({ type: 'ADD_ITEM', sec: 'skills', item: { id: uid(), name: '', level: 80 } });
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-800 text-xl tracking-tight">Kỹ năng</h3>
                <button
                    onClick={add}
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-indigo-600 transition-colors shadow-sm"
                >
                    <Plus size={14} /> Thêm mới
                </button>
            </div>
            <div className="space-y-3">
                {safeSkills.map((sk) => (
                    <div
                        key={sk.id}
                        className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-indigo-300 transition-colors group"
                    >
                        <div className="flex-1">
                            <input
                                className={inputCls}
                                value={sk.name || ''}
                                onChange={(e) =>
                                    dispatch({
                                        type: 'UPD_ITEM',
                                        sec: 'skills',
                                        id: sk.id,
                                        v: { name: e.target.value },
                                    })
                                }
                                placeholder="Tên kỹ năng (VD: ReactJS...)"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-40">
                            <input
                                type="range"
                                min={10}
                                max={100}
                                value={sk.level || 50}
                                onChange={(e) =>
                                    dispatch({
                                        type: 'UPD_ITEM',
                                        sec: 'skills',
                                        id: sk.id,
                                        v: { level: +e.target.value },
                                    })
                                }
                                className="flex-1 accent-indigo-600 cursor-pointer"
                            />
                            <span className="text-xs font-black text-indigo-700 w-10 bg-indigo-50 px-2 py-1 rounded-md text-center">
                                {sk.level || 50}%
                            </span>
                        </div>
                        <button
                            onClick={() => dispatch({ type: 'DEL_ITEM', sec: 'skills', id: sk.id })}
                            className="text-slate-300 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 rounded-full"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProjectsForm({ projects, dispatch }) {
    const safeProj = getSafeArray(projects);
    const add = () =>
        dispatch({ type: 'ADD_ITEM', sec: 'projects', item: { id: uid(), name: '', url: '', description: '' } });
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-800 text-xl tracking-tight">Dự án nổi bật</h3>
                <button
                    onClick={add}
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-indigo-600 transition-colors shadow-sm"
                >
                    <Plus size={14} /> Thêm mới
                </button>
            </div>
            {safeProj.map((pr) => (
                <div key={pr.id} className={cardCls}>
                    <button
                        onClick={() => dispatch({ type: 'DEL_ITEM', sec: 'projects', id: pr.id })}
                        className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 hover:bg-rose-50 rounded-full p-1.5"
                    >
                        <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Tên dự án">
                            <input
                                className={inputCls}
                                value={pr.name || ''}
                                onChange={(e) =>
                                    dispatch({
                                        type: 'UPD_ITEM',
                                        sec: 'projects',
                                        id: pr.id,
                                        v: { name: e.target.value },
                                    })
                                }
                            />
                        </Field>
                        <Field label="URL / GitHub">
                            <input
                                className={inputCls}
                                value={pr.url || ''}
                                onChange={(e) =>
                                    dispatch({
                                        type: 'UPD_ITEM',
                                        sec: 'projects',
                                        id: pr.id,
                                        v: { url: e.target.value },
                                    })
                                }
                                placeholder="https://..."
                            />
                        </Field>
                    </div>
                    <Field label="Mô tả dự án & Công nghệ">
                        <textarea
                            className={textareaCls}
                            rows={4}
                            value={pr.description || ''}
                            onChange={(e) =>
                                dispatch({
                                    type: 'UPD_ITEM',
                                    sec: 'projects',
                                    id: pr.id,
                                    v: { description: e.target.value },
                                })
                            }
                        />
                    </Field>
                </div>
            ))}
        </div>
    );
}

function CertsForm({ certifications, dispatch }) {
    const safeCerts = getSafeArray(certifications);
    const add = () =>
        dispatch({ type: 'ADD_ITEM', sec: 'certifications', item: { id: uid(), name: '', issuer: '', date: '' } });
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-800 text-xl tracking-tight">Chứng chỉ</h3>
                <button
                    onClick={add}
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-indigo-600 transition-colors shadow-sm"
                >
                    <Plus size={14} /> Thêm mới
                </button>
            </div>
            {safeCerts.map((ct) => (
                <div key={ct.id} className={cardCls}>
                    <button
                        onClick={() => dispatch({ type: 'DEL_ITEM', sec: 'certifications', id: ct.id })}
                        className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 hover:bg-rose-50 rounded-full p-1.5"
                    >
                        <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            ['Tên chứng chỉ', 'name'],
                            ['Đơn vị cấp', 'issuer'],
                            ['Ngày cấp', 'date'],
                        ].map(([label, key]) => (
                            <Field key={key} label={label}>
                                <input
                                    className={inputCls}
                                    value={ct[key] || ''}
                                    onChange={(e) =>
                                        dispatch({
                                            type: 'UPD_ITEM',
                                            sec: 'certifications',
                                            id: ct.id,
                                            v: { [key]: e.target.value },
                                        })
                                    }
                                />
                            </Field>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function CustomSectionsForm({ customSections, dispatch }) {
    const safeCS = getSafeArray(customSections);
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-800 text-xl tracking-tight">Mục tùy chỉnh</h3>
                <button
                    onClick={() => dispatch({ type: 'ADD_CS' })}
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
                >
                    <PlusCircle size={14} /> Thêm mục mới
                </button>
            </div>
            {safeCS.length === 0 && (
                <div className="text-center py-10 bg-indigo-50/50 border-2 border-dashed border-indigo-100 rounded-2xl text-indigo-500 font-medium text-sm flex flex-col items-center gap-2">
                    <Settings size={28} className="opacity-50" /> Thêm mục tùy chỉnh như: Hoạt động, Giải thưởng, Sở
                    thích...
                </div>
            )}
            {safeCS.map((cs) => (
                <div key={cs.id} className="mb-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-5">
                        <input
                            value={cs.title || ''}
                            onChange={(e) => dispatch({ type: 'UPD_CS', id: cs.id, v: { title: e.target.value } })}
                            className="flex-1 font-black text-lg border-b-2 border-dashed border-slate-300 focus:outline-none focus:border-indigo-600 bg-transparent text-slate-800 pb-1.5 transition-colors"
                            placeholder="Tên mục (VD: Hoạt động xã hội)..."
                        />
                        <button
                            onClick={() => dispatch({ type: 'DEL_CS', id: cs.id })}
                            className="text-slate-400 hover:text-rose-500 transition-colors bg-white hover:bg-rose-50 rounded-full p-2 border border-slate-200 shadow-sm"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                    {getSafeArray(cs.items).map((ci) => (
                        <div key={ci.id} className="flex items-start gap-2 mb-3 group">
                            <span className="text-indigo-400 mt-2.5 text-sm font-black">•</span>
                            <input
                                value={ci.content || ''}
                                onChange={(e) =>
                                    dispatch({ type: 'UPD_CI', sid: cs.id, iid: ci.id, v: e.target.value })
                                }
                                className={inputCls}
                                placeholder="Nội dung..."
                            />
                            <button
                                onClick={() => dispatch({ type: 'DEL_CI', sid: cs.id, iid: ci.id })}
                                className="text-slate-300 hover:text-rose-500 mt-2 transition-colors p-1.5 opacity-0 group-hover:opacity-100"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => dispatch({ type: 'ADD_CI', sid: cs.id })}
                        className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 mt-3 transition-colors bg-indigo-100/50 hover:bg-indigo-100 px-4 py-2 rounded-xl w-fit"
                    >
                        <Plus size={14} /> Thêm dòng
                    </button>
                </div>
            ))}
        </div>
    );
}

// ─── MAIN EDITOR APP ────────────────────────────────────────────────────────
const SECTIONS = [
    { id: 'personal', label: 'Cá nhân', icon: User },
    { id: 'experience', label: 'Kinh nghiệm', icon: Briefcase },
    { id: 'education', label: 'Học vấn', icon: GraduationCap },
    { id: 'skills', label: 'Kỹ năng', icon: Code2 },
    { id: 'projects', label: 'Dự án', icon: FolderOpen },
    { id: 'certifications', label: 'Chứng chỉ', icon: Award },
    { id: 'custom', label: 'Tùy chỉnh', icon: Settings },
];

const TEMPLATES = [
    { id: 'classic', label: 'Classic', sub: 'ATS Format' },
    { id: 'modern', label: 'Modern', sub: 'Sidebar' },
    { id: 'creative', label: 'Creative', sub: 'Màu sắc' },
];

const TEMPLATE_COMPONENTS = { classic: ClassicCV, modern: ModernCV, creative: CreativeCV };

export default function CVEditor() {
    const params = useParams();
    const initialTemplate = params.id === 'tpl_1' ? 'classic' : params.id === 'tpl_3' ? 'creative' : 'modern';

    // THÊM: Quản lý Tab (Tạo bằng AI vs Chỉnh sửa tay)
    const [activeTab, setActiveTab] = useState('ai');
    const [aiRawInfo, setAiRawInfo] = useState('');
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    const [state, dispatch] = useReducer(reducer, {
        template: initialTemplate,
        activeSection: 'personal',
        data: (() => {
            try {
                const d = localStorage.getItem('cv_draft');
                if (!d) return SAMPLE;
                const parsed = JSON.parse(d);
                return {
                    personal: parsed.personal || SAMPLE.personal,
                    experience: getSafeArray(parsed.experience, SAMPLE.experience),
                    education: getSafeArray(parsed.education, SAMPLE.education),
                    skills: getSafeArray(parsed.skills, SAMPLE.skills),
                    projects: getSafeArray(parsed.projects, SAMPLE.projects),
                    certifications: getSafeArray(parsed.certifications, SAMPLE.certifications),
                    customSections: getSafeArray(parsed.customSections, SAMPLE.customSections),
                };
            } catch {
                return SAMPLE;
            }
        })(),
    });

    const { template, activeSection, data } = state;
    const previewRef = useRef(null);

    const saveDraft = useCallback(() => {
        localStorage.setItem('cv_draft', JSON.stringify(data));
        toast.success('Đã lưu bản nháp thành công!', { id: 'save-draft', icon: '💾' });
    }, [data]);

    const exportPDF = useCallback(() => {
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${data.personal.name || 'CV'}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}@media print{@page{size:A4;margin:0}}</style></head><body id="cv">${previewRef.current?.innerHTML || ''}</body><script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}<\/script></html>`;
        const w = window.open('', '_blank');
        w.document.write(html);
        w.document.close();
    }, [data]);

    // ─── GỌI API AI TẠO CV FULL ───────────────────────────────────────────────
    const handleGenerateAIFullCV = async () => {
        if (aiRawInfo.trim().length < 20) {
            toast.error('Vui lòng nhập chi tiết hơn một chút để AI có thể làm việc tốt nhất!');
            return;
        }

        setIsGeneratingAI(true);
        const toastId = toast.loading('AI đang phân tích và viết CV của bạn (Mất khoảng 5-15s)...');

        try {
            // Giả sử service của sếp có hàm generateCV
            // Nếu chưa có, sếp cần thêm hàm này vào src/services/aiService.js:
            // generateCV: (rawInfo) => axiosClient.post('/candidate/generate-cv', { raw_info: rawInfo })
            const res = await aiService.generateCV(aiRawInfo);
            const aiData = res.data || res;

            // Map dữ liệu từ API về chuẩn state của React (Rất quan trọng)
            const mappedData = {
                personal: {
                    ...data.personal,
                    summary: aiData.professional_summary || '',
                },
                education: [
                    {
                        id: uid(),
                        school: aiData.education || '',
                        degree: '',
                        field: '',
                        startDate: '',
                        endDate: '',
                        description: '',
                    },
                ],
                skills: (aiData.skills || []).map((sk) => ({
                    id: uid(),
                    name: sk,
                    level: 80, // Default level
                })),
                experience: (aiData.work_experience || []).map((exp) => ({
                    id: uid(),
                    company: exp.company || '',
                    title: exp.role || '',
                    startDate: '',
                    endDate: '',
                    current: false,
                    description: exp.description || '',
                })),
                projects: (aiData.projects || []).map((proj) => ({
                    id: uid(),
                    name: proj.name || '',
                    url: '',
                    description: proj.description || '',
                })),
                certifications: (aiData.certificates_and_awards || []).map((cert) => ({
                    id: uid(),
                    name: cert || '',
                    issuer: '',
                    date: '',
                })),
                customSections: [],
            };

            // Cập nhật State
            dispatch({ type: 'LOAD_AI_DATA', payload: mappedData });

            // Chuyển Tab sang Manual để ứng viên kiểm tra lại
            setActiveTab('manual');
            toast.success('Bùm! CV của bạn đã được khởi tạo xong ✨', { id: toastId, duration: 4000 });
            setAiRawInfo(''); // Xóa text nhập thô
        } catch (error) {
            console.error('Lỗi khi tạo CV bằng AI:', error);
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra. Hãy thử lại!', { id: toastId });
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const TemplateComp = TEMPLATE_COMPONENTS[template];

    const renderForm = () => {
        switch (activeSection) {
            case 'personal':
                return <PersonalForm personal={data.personal} dispatch={dispatch} />;
            case 'experience':
                return <ExperienceForm experience={data.experience} dispatch={dispatch} />;
            case 'education':
                return <EducationForm education={data.education} dispatch={dispatch} />;
            case 'skills':
                return <SkillsForm skills={data.skills} dispatch={dispatch} />;
            case 'projects':
                return <ProjectsForm projects={data.projects} dispatch={dispatch} />;
            case 'certifications':
                return <CertsForm certifications={data.certifications} dispatch={dispatch} />;
            case 'custom':
                return <CustomSectionsForm customSections={data.customSections} dispatch={dispatch} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col font-sans text-slate-900 pb-10">
            <Toaster position="bottom-right" reverseOrder={false} />

            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
                    <Link to="/cv-builder" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
                            <FileText size={20} className="text-white" />
                        </div>
                        <span className="font-black text-slate-900 text-xl tracking-tight">
                            TalentCV <span className="text-indigo-600">Builder</span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1.5 border border-slate-200">
                        {TEMPLATES.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => dispatch({ type: 'SET_TEMPLATE', v: t.id })}
                                className={`flex flex-col items-center px-5 py-1.5 rounded-lg text-sm font-bold transition-all shadow-sm ${template === t.id ? 'bg-white text-indigo-700 border border-slate-200/60' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 shadow-none border border-transparent'}`}
                            >
                                <span>{t.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={saveDraft}
                            className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:shadow-sm transition-all active:scale-95"
                        >
                            <Save size={18} className="text-slate-500" /> Lưu nháp
                        </button>
                        <button
                            onClick={exportPDF}
                            className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md transition-all shadow-sm active:scale-95"
                        >
                            <Download size={18} /> Xuất PDF
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 max-w-[1600px] mx-auto w-full px-6 py-8 gap-8">
                {/* ── BÊN TRÁI: FORM CHỈNH SỬA & AI ── */}
                <div className="w-[450px] shrink-0 flex flex-col gap-6">
                    {/* TABS ĐIỀU HƯỚNG MỚI */}
                    <div className="flex gap-2 p-1.5 bg-slate-200/60 rounded-xl">
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'ai' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
                        >
                            <Wand2 size={16} /> Tạo bằng AI{' '}
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded uppercase ml-1">
                                Pro
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('manual')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'manual' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
                        >
                            <Settings size={16} /> Chỉnh sửa thủ công
                        </button>
                    </div>

                    {/* NỘI DUNG TABS */}
                    {activeTab === 'ai' ? (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
                                <Zap className="text-amber-500 mt-0.5 shrink-0" size={20} />
                                <div>
                                    <h4 className="font-bold text-indigo-900 text-sm mb-1">Mẹo để AI làm tốt nhất</h4>
                                    <p className="text-xs text-indigo-700/80 leading-relaxed">
                                        Hãy liệt kê ngắn gọn các thông tin: Tóm tắt bản thân, Ngành học, Các kỹ năng
                                        đang có, và Kinh nghiệm thực tế (nếu có). AI sẽ tự động phân loại và làm đẹp câu
                                        văn.
                                    </p>
                                </div>
                            </div>

                            <textarea
                                value={aiRawInfo}
                                onChange={(e) => setAiRawInfo(e.target.value)}
                                rows="12"
                                placeholder="Ví dụ:&#10;- Sinh viên IT năm cuối Đại học Bách Khoa.&#10;- Biết Java, React, Nodejs.&#10;- Từng làm dự án web thương mại điện tử nhỏ.&#10;- Tiếng Anh giao tiếp cơ bản."
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm resize-none font-medium text-slate-700"
                            ></textarea>

                            <button
                                onClick={handleGenerateAIFullCV}
                                disabled={isGeneratingAI || !aiRawInfo.trim()}
                                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isGeneratingAI ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Sparkles size={18} className="text-yellow-300" />
                                )}
                                {isGeneratingAI ? 'AI Đang viết...' : 'Tạo CV ngay lập tức'}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 grid grid-cols-2 gap-2 animate-in fade-in duration-300">
                                {SECTIONS.map((s) => {
                                    const Icon = s.icon;
                                    const active = activeSection === s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => dispatch({ type: 'SET_SECTION', v: s.id })}
                                            className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left border ${active ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-200'}`}
                                        >
                                            <Icon size={16} className={active ? 'text-indigo-600' : 'text-slate-400'} />{' '}
                                            {s.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <div
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex-1 overflow-y-auto custom-scrollbar animate-in fade-in duration-300"
                                style={{ maxHeight: 'calc(100vh - 300px)' }}
                            >
                                {renderForm()}
                            </div>
                        </>
                    )}
                </div>

                {/* ── BÊN PHẢI: PREVIEW LIVE ── */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                            <Eye size={18} className="text-indigo-500" /> BẢN XEM TRƯỚC (LIVE PREVIEW)
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" /> Đang đồng bộ
                        </div>
                    </div>
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex-1 flex flex-col relative">
                        <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50/80">
                            <div className="w-3 h-3 rounded-full bg-rose-400" />
                            <div className="w-3 h-3 rounded-full bg-amber-400" />
                            <div className="w-3 h-3 rounded-full bg-emerald-400" />
                        </div>

                        {/* Loading Overlay khi AI đang chạy */}
                        {isGeneratingAI && (
                            <div className="absolute inset-x-0 bottom-0 top-[49px] bg-slate-900/10 backdrop-blur-md z-50 flex flex-col items-center justify-center">
                                <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95">
                                    <div className="relative w-20 h-20">
                                        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                                        <Sparkles
                                            size={24}
                                            className="absolute inset-0 m-auto text-amber-500 animate-pulse"
                                        />
                                    </div>
                                    <p className="font-black text-slate-800 text-lg">AI đang nhào nặn CV của bạn...</p>
                                    <p className="text-sm text-slate-500 font-medium">Sắp xong rồi, chờ xíu nhé!</p>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-auto p-8 bg-slate-100/80 flex justify-center items-start custom-scrollbar">
                            <div
                                className="shadow-2xl overflow-hidden bg-white border border-slate-200 transition-all"
                                style={{ width: 595, minHeight: 792, transformOrigin: 'top center' }}
                            >
                                <div ref={previewRef}>
                                    <TemplateComp data={data} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
}
