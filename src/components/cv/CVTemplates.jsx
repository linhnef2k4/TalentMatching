import React from 'react';

// Hàm bảo vệ: Nếu data bị hỏng/không phải mảng thì trả về mảng rỗng, chống sập app
const getSafeArray = (arr) => (Array.isArray(arr) ? arr : []);

// ─── TEMPLATE 1: CLASSIC ATS (Tối giản, Đen trắng) ──────────────────────────
export function ClassicCV({ data = {} }) {
    const p = data.personal || {};
    const experience = getSafeArray(data.experience);
    const education = getSafeArray(data.education);
    const skills = getSafeArray(data.skills);
    const projects = getSafeArray(data.projects);
    const certifications = getSafeArray(data.certifications);
    const customSections = getSafeArray(data.customSections);

    const SectionTitle = ({ title }) => (
        <div className="mb-3 mt-5 first:mt-0">
            <h2
                style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: '#1e293b',
                    textTransform: 'uppercase',
                    borderBottom: '1.5px solid #1e293b',
                    paddingBottom: 4,
                    marginBottom: 8,
                }}
            >
                {title}
            </h2>
        </div>
    );

    return (
        <div
            style={{
                fontFamily: "'Georgia', serif",
                color: '#1e293b',
                fontSize: 10,
                lineHeight: 1.5,
                background: '#ffffff',
                padding: '36px 40px',
                minHeight: 792,
                boxSizing: 'border-box',
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.04em', color: '#0f172a' }}>
                    {p.name || 'Họ và Tên'}
                </div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{p.title}</div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        gap: '0 16px',
                        marginTop: 8,
                        fontSize: 9,
                        color: '#64748b',
                    }}
                >
                    {p.email && <span>{p.email}</span>}
                    {p.phone && <span>{p.phone}</span>}
                    {p.location && <span>{p.location}</span>}
                    {p.website && <span>{p.website}</span>}
                    {p.linkedin && <span>{p.linkedin}</span>}
                </div>
            </div>

            {p.summary && (
                <>
                    <SectionTitle title="Tóm tắt" />
                    <p style={{ fontSize: 10, color: '#334155', marginBottom: 0 }}>{p.summary}</p>
                </>
            )}

            {experience.length > 0 && (
                <>
                    <SectionTitle title="Kinh nghiệm làm việc" />
                    {experience.map((ex) => (
                        <div key={ex.id} style={{ marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ fontWeight: 700, fontSize: 10 }}>{ex.title}</div>
                                <div style={{ fontSize: 9, color: '#64748b' }}>
                                    {ex.startDate} – {ex.current ? 'Hiện tại' : ex.endDate}
                                </div>
                            </div>
                            <div style={{ fontSize: 9, color: '#475569', marginBottom: 3 }}>{ex.company}</div>
                            <div style={{ fontSize: 9, color: '#334155', whiteSpace: 'pre-line' }}>
                                {ex.description}
                            </div>
                        </div>
                    ))}
                </>
            )}

            {education.length > 0 && (
                <>
                    <SectionTitle title="Học vấn" />
                    {education.map((ed) => (
                        <div key={ed.id} style={{ marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ fontWeight: 700, fontSize: 10 }}>
                                    {ed.degree} - {ed.field}
                                </div>
                                <div style={{ fontSize: 9, color: '#64748b' }}>
                                    {ed.startDate} – {ed.endDate}
                                </div>
                            </div>
                            <div style={{ fontSize: 9, color: '#475569' }}>{ed.school}</div>
                            {ed.description && (
                                <div style={{ fontSize: 9, color: '#334155', marginTop: 2 }}>{ed.description}</div>
                            )}
                        </div>
                    ))}
                </>
            )}

            {skills.length > 0 && (
                <>
                    <SectionTitle title="Kỹ năng" />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                        {skills.map((sk) => (
                            <span key={sk.id} style={{ fontSize: 9 }}>
                                • {sk.name}
                            </span>
                        ))}
                    </div>
                </>
            )}

            {projects.length > 0 && (
                <>
                    <SectionTitle title="Dự án" />
                    {projects.map((pr) => (
                        <div key={pr.id} style={{ marginBottom: 8 }}>
                            <div style={{ fontWeight: 700, fontSize: 10 }}>{pr.name}</div>
                            {pr.url && <div style={{ fontSize: 9, color: '#6366f1' }}>{pr.url}</div>}
                            <div style={{ fontSize: 9, color: '#334155', whiteSpace: 'pre-line' }}>
                                {pr.description}
                            </div>
                        </div>
                    ))}
                </>
            )}

            {certifications.length > 0 && (
                <>
                    <SectionTitle title="Chứng chỉ" />
                    {certifications.map((ct) => (
                        <div key={ct.id} style={{ marginBottom: 6 }}>
                            <div style={{ fontWeight: 700, fontSize: 10 }}>{ct.name}</div>
                            <div style={{ fontSize: 9, color: '#475569' }}>
                                {ct.issuer} · {ct.date}
                            </div>
                        </div>
                    ))}
                </>
            )}

            {customSections.length > 0 &&
                customSections.map(
                    (cs) =>
                        getSafeArray(cs.items).length > 0 && (
                            <div key={cs.id}>
                                <SectionTitle title={cs.title} />
                                {cs.items.map((ci) => (
                                    <p key={ci.id} style={{ fontSize: 9, marginBottom: 2 }}>
                                        • {ci.content}
                                    </p>
                                ))}
                            </div>
                        ),
                )}
        </div>
    );
}

// ─── TEMPLATE 2: MODERN (Sidebar solid background) ──────────────────────────
export function ModernCV({ data = {} }) {
    const p = data.personal || {};
    const experience = getSafeArray(data.experience);
    const education = getSafeArray(data.education);
    const skills = getSafeArray(data.skills);
    const projects = getSafeArray(data.projects);
    const certifications = getSafeArray(data.certifications);
    const customSections = getSafeArray(data.customSections);

    const initials = p.name
        ? p.name
              .split(' ')
              .slice(-2)
              .map((w) => w[0])
              .join('')
        : 'CV';

    const SideTitle = ({ title }) => (
        <div
            style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#c7d2fe',
                borderBottom: '1px solid #4f46e5',
                paddingBottom: 4,
                marginBottom: 8,
                marginTop: 14,
            }}
        >
            {title}
        </div>
    );
    const MainTitle = ({ title }) => (
        <div
            style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#4f46e5',
                borderBottom: '2px solid #e0e7ff',
                paddingBottom: 4,
                marginBottom: 10,
                marginTop: 14,
            }}
        >
            {title}
        </div>
    );

    return (
        <div
            style={{
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                display: 'flex',
                minHeight: 792,
                background: '#ffffff',
                fontSize: 10,
                lineHeight: 1.5,
            }}
        >
            <div
                style={{
                    width: '35%',
                    background: '#3730a3',
                    padding: '32px 18px',
                    color: '#e0e7ff',
                    boxSizing: 'border-box',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    {p.avatar ? (
                        <img
                            src={p.avatar}
                            alt=""
                            style={{
                                width: 72,
                                height: 72,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '3px solid #818cf8',
                                margin: '0 auto 10px',
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: 72,
                                height: 72,
                                borderRadius: '50%',
                                background: '#4f46e5',
                                border: '3px solid #818cf8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 24,
                                fontWeight: 700,
                                color: '#e0e7ff',
                                margin: '0 auto 10px',
                            }}
                        >
                            {initials}
                        </div>
                    )}
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>{p.name || 'Họ và Tên'}</div>
                    <div style={{ fontSize: 9, color: '#a5b4fc', marginTop: 4 }}>{p.title}</div>
                </div>

                <SideTitle title="Liên hệ" />
                {[
                    { v: p.email, label: 'Email' },
                    { v: p.phone, label: 'Điện thoại' },
                    { v: p.location, label: 'Địa chỉ' },
                    { v: p.website, label: 'Website' },
                    { v: p.linkedin, label: 'LinkedIn' },
                ].map(
                    ({ v, label }) =>
                        v && (
                            <div key={label} style={{ marginBottom: 6 }}>
                                <div
                                    style={{
                                        fontSize: 7,
                                        color: '#a5b4fc',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                    }}
                                >
                                    {label}
                                </div>
                                <div style={{ fontSize: 8, color: '#e0e7ff', wordBreak: 'break-all' }}>{v}</div>
                            </div>
                        ),
                )}

                {skills.length > 0 && (
                    <>
                        <SideTitle title="Kỹ năng" />
                        {skills.map((sk) => (
                            <div key={sk.id} style={{ marginBottom: 7 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                    <span style={{ fontSize: 8, color: '#e0e7ff' }}>{sk.name}</span>
                                    <span style={{ fontSize: 7, color: '#a5b4fc' }}>{sk.level}%</span>
                                </div>
                                <div style={{ height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                                    <div
                                        style={{
                                            height: '100%',
                                            width: `${sk.level}%`,
                                            background: '#818cf8',
                                            borderRadius: 2,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {certifications.length > 0 && (
                    <>
                        <SideTitle title="Chứng chỉ" />
                        {certifications.map((ct) => (
                            <div key={ct.id} style={{ marginBottom: 6 }}>
                                <div style={{ fontSize: 8, color: '#e0e7ff', fontWeight: 700 }}>{ct.name}</div>
                                <div style={{ fontSize: 7, color: '#a5b4fc' }}>
                                    {ct.issuer} · {ct.date}
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {customSections.length > 0 &&
                    customSections.map(
                        (cs) =>
                            getSafeArray(cs.items).length > 0 && (
                                <div key={cs.id}>
                                    <SideTitle title={cs.title} />
                                    {cs.items.map((ci) => (
                                        <p key={ci.id} style={{ fontSize: 8, color: '#e0e7ff', marginBottom: 2 }}>
                                            • {ci.content}
                                        </p>
                                    ))}
                                </div>
                            ),
                    )}
            </div>

            <div style={{ flex: 1, padding: '32px 28px', boxSizing: 'border-box' }}>
                {p.summary && (
                    <>
                        <MainTitle title="Giới thiệu" />
                        <p style={{ fontSize: 9.5, color: '#334155', lineHeight: 1.6 }}>{p.summary}</p>
                    </>
                )}

                {experience.length > 0 && (
                    <>
                        <MainTitle title="Kinh nghiệm" />
                        {experience.map((ex) => (
                            <div key={ex.id} style={{ marginBottom: 12 }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 10, color: '#1e293b' }}>
                                            {ex.title}
                                        </div>
                                        <div style={{ fontSize: 9, color: '#4f46e5', fontWeight: 600 }}>
                                            {ex.company}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 8, color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: 8 }}>
                                        {ex.startDate} – {ex.current ? 'Hiện tại' : ex.endDate}
                                    </div>
                                </div>
                                <div style={{ fontSize: 9, color: '#475569', marginTop: 4, whiteSpace: 'pre-line' }}>
                                    {ex.description}
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {education.length > 0 && (
                    <>
                        <MainTitle title="Học vấn" />
                        {education.map((ed) => (
                            <div key={ed.id} style={{ marginBottom: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 10, color: '#1e293b' }}>
                                            {ed.degree} – {ed.field}
                                        </div>
                                        <div style={{ fontSize: 9, color: '#4f46e5' }}>{ed.school}</div>
                                    </div>
                                    <div style={{ fontSize: 8, color: '#94a3b8' }}>
                                        {ed.startDate}–{ed.endDate}
                                    </div>
                                </div>
                                {ed.description && (
                                    <div style={{ fontSize: 9, color: '#475569', marginTop: 3 }}>{ed.description}</div>
                                )}
                            </div>
                        ))}
                    </>
                )}

                {projects.length > 0 && (
                    <>
                        <MainTitle title="Dự án nổi bật" />
                        {projects.map((pr) => (
                            <div
                                key={pr.id}
                                style={{
                                    marginBottom: 10,
                                    padding: '8px 10px',
                                    background: '#f8f7ff',
                                    borderLeft: '3px solid #4f46e5',
                                    borderRadius: '0 6px 6px 0',
                                }}
                            >
                                <div style={{ fontWeight: 700, fontSize: 10, color: '#1e293b' }}>{pr.name}</div>
                                {pr.url && <div style={{ fontSize: 8, color: '#4f46e5' }}>{pr.url}</div>}
                                <div style={{ fontSize: 9, color: '#475569', marginTop: 3, whiteSpace: 'pre-line' }}>
                                    {pr.description}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

// ─── TEMPLATE 3: CREATIVE (Header solid violet) ──────────────────────────
export function CreativeCV({ data = {} }) {
    const p = data.personal || {};
    const experience = getSafeArray(data.experience);
    const education = getSafeArray(data.education);
    const skills = getSafeArray(data.skills);
    const projects = getSafeArray(data.projects);
    const certifications = getSafeArray(data.certifications);
    const customSections = getSafeArray(data.customSections);

    const accent = '#6d28d9'; // Violet-700 solid color

    const SectionTitle = ({ title }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 8px' }}>
            <div style={{ width: 4, height: 16, background: accent, borderRadius: 2 }} />
            <span
                style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: accent,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                }}
            >
                {title}
            </span>
        </div>
    );

    return (
        <div
            style={{
                fontFamily: "'Trebuchet MS', sans-serif",
                background: '#ffffff',
                minHeight: 792,
                fontSize: 10,
                lineHeight: 1.5,
            }}
        >
            <div style={{ background: accent, padding: '28px 40px', color: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    {p.avatar ? (
                        <img
                            src={p.avatar}
                            alt=""
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '3px solid rgba(255,255,255,0.5)',
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.2)',
                                border: '3px solid rgba(255,255,255,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 28,
                                fontWeight: 700,
                            }}
                        >
                            {p.name ? p.name.split(' ').slice(-1)[0][0] : 'A'}
                        </div>
                    )}
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.02em' }}>
                            {p.name || 'Họ và Tên'}
                        </div>
                        <div style={{ fontSize: 12, color: '#ddd6fe', marginTop: 2 }}>{p.title}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', marginTop: 8 }}>
                            {[p.email, p.phone, p.location, p.website].filter(Boolean).map((v, i) => (
                                <span key={i} style={{ fontSize: 8, color: '#ede9fe' }}>
                                    {v}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', padding: '0 0' }}>
                <div style={{ flex: 1, padding: '12px 28px 28px' }}>
                    {p.summary && (
                        <>
                            <SectionTitle title="Giới thiệu" />
                            <p style={{ fontSize: 9.5, color: '#374151' }}>{p.summary}</p>
                        </>
                    )}

                    {experience.length > 0 && (
                        <>
                            <SectionTitle title="Kinh nghiệm" />
                            {experience.map((ex) => (
                                <div key={ex.id} style={{ marginBottom: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div style={{ fontWeight: 700, color: '#1f2937' }}>{ex.title}</div>
                                        <div
                                            style={{
                                                fontSize: 8.5,
                                                color: accent,
                                                background: '#f5f3ff',
                                                padding: '1px 8px',
                                                borderRadius: 10,
                                            }}
                                        >
                                            {ex.startDate} – {ex.current ? 'Nay' : ex.endDate}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 9, color: accent, fontWeight: 600, marginBottom: 3 }}>
                                        {ex.company}
                                    </div>
                                    <div style={{ fontSize: 9, color: '#4b5563', whiteSpace: 'pre-line' }}>
                                        {ex.description}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {education.length > 0 && (
                        <>
                            <SectionTitle title="Học vấn" />
                            {education.map((ed) => (
                                <div
                                    key={ed.id}
                                    style={{
                                        marginBottom: 8,
                                        padding: '6px 10px',
                                        background: '#f9f8ff',
                                        borderRadius: 6,
                                        border: '1px solid #ede9fe',
                                    }}
                                >
                                    <div style={{ fontWeight: 700, color: '#1f2937' }}>
                                        {ed.degree} – {ed.field}
                                    </div>
                                    <div style={{ fontSize: 9, color: accent }}>{ed.school}</div>
                                    <div style={{ fontSize: 8.5, color: '#9ca3af' }}>
                                        {ed.startDate} – {ed.endDate}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {projects.length > 0 && (
                        <>
                            <SectionTitle title="Dự án" />
                            {projects.map((pr) => (
                                <div key={pr.id} style={{ marginBottom: 8 }}>
                                    <div style={{ fontWeight: 700, color: '#1f2937' }}>{pr.name}</div>
                                    {pr.url && <div style={{ fontSize: 8.5, color: accent }}>{pr.url}</div>}
                                    <div style={{ fontSize: 9, color: '#4b5563', whiteSpace: 'pre-line' }}>
                                        {pr.description}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                <div
                    style={{
                        width: '30%',
                        background: '#f9f8ff',
                        padding: '12px 16px 28px',
                        borderLeft: '1px solid #ede9fe',
                        boxSizing: 'border-box',
                    }}
                >
                    {skills.length > 0 && (
                        <>
                            <SectionTitle title="Kỹ năng" />
                            {skills.map((sk) => (
                                <div key={sk.id} style={{ marginBottom: 8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
                                        <span style={{ color: '#374151', fontWeight: 600 }}>{sk.name}</span>
                                        <span style={{ color: accent }}>{sk.level}%</span>
                                    </div>
                                    <div style={{ height: 4, background: '#ede9fe', borderRadius: 2, marginTop: 3 }}>
                                        <div
                                            style={{
                                                height: '100%',
                                                width: `${sk.level}%`,
                                                background: accent,
                                                borderRadius: 2,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {certifications.length > 0 && (
                        <>
                            <SectionTitle title="Chứng chỉ" />
                            {certifications.map((ct) => (
                                <div
                                    key={ct.id}
                                    style={{
                                        marginBottom: 6,
                                        padding: '4px 8px',
                                        background: '#ffffff',
                                        borderRadius: 4,
                                        border: '1px solid #ddd6fe',
                                    }}
                                >
                                    <div style={{ fontSize: 8.5, fontWeight: 700, color: '#4c1d95' }}>{ct.name}</div>
                                    <div style={{ fontSize: 7.5, color: accent }}>{ct.issuer}</div>
                                    <div style={{ fontSize: 7, color: '#9ca3af' }}>{ct.date}</div>
                                </div>
                            ))}
                        </>
                    )}

                    {customSections.length > 0 &&
                        customSections.map(
                            (cs) =>
                                getSafeArray(cs.items).length > 0 && (
                                    <div key={cs.id}>
                                        <SectionTitle title={cs.title} />
                                        {cs.items.map((ci) => (
                                            <div
                                                key={ci.id}
                                                style={{ fontSize: 8.5, color: '#374151', marginBottom: 2 }}
                                            >
                                                • {ci.content}
                                            </div>
                                        ))}
                                    </div>
                                ),
                        )}
                </div>
            </div>
        </div>
    );
}
