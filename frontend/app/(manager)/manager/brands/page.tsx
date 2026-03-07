"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Search, Layers, X, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

const API = "http://localhost:5000/api/manager/products/brands";
const TOKEN_KEY = "auth_token";

type Brand = {
    id: string;
    name: string;
    description?: string;
    country?: string;
    status?: string;
};

const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) ?? "" : "";

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

// ─── Modal Shell ──────────────────────────────────────────────────────────────

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-bold text-primary">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
                <div className="flex items-start gap-3 mb-5">
                    <div className="p-2 bg-red-100 rounded-full shrink-0"><AlertTriangle size={20} className="text-red-500" /></div>
                    <p className="text-sm font-medium text-primary leading-relaxed">{message}</p>
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-border text-primary text-sm hover:bg-gray-50 transition-colors">Hủy</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">Xóa</button>
                </div>
            </div>
        </div>
    );
}

function InputField({ label, id, ...props }: { label: string; id: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-primary mb-1">{label}</label>
            <input id={id} {...props} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
        </div>
    );
}

function TextareaField({ label, id, ...props }: { label: string; id: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-primary mb-1">{label}</label>
            <textarea id={id} rows={3} {...props} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none" />
        </div>
    );
}

function SelectField({ label, id, children, ...props }: { label: string; id: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-primary mb-1">{label}</label>
            <select id={id} {...props} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-white">{children}</select>
        </div>
    );
}

// ─── Brand Form Modal ─────────────────────────────────────────────────────────

function BrandFormModal({
    brand,
    onClose,
    onSaved,
}: {
    brand?: Brand;
    onClose: () => void;
    onSaved: () => void;
}) {
    const isEdit = !!brand;
    const [name, setName] = useState(brand?.name ?? "");
    const [desc, setDesc] = useState(brand?.description ?? "");
    const [country, setCountry] = useState(brand?.country ?? "");
    const [status, setStatus] = useState(brand?.status ?? "Active");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const res = await fetch(isEdit ? `${API}/${brand!.id}` : API, {
                method: isEdit ? "PUT" : "POST",
                headers: authHeaders(),
                body: JSON.stringify({ name, description: desc || null, country: country || null, status }),
            });
            if (!res.ok) throw new Error(await res.text());
            onSaved();
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Lỗi không xác định");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ModalShell title={isEdit ? "Sửa thương hiệu" : "Thêm thương hiệu mới"} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <InputField label="Tên thương hiệu *" id="bname" value={name} onChange={(e) => setName(e.target.value)} required />
                <InputField label="Quốc gia" id="bcountry" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Vietnam, Italy, Japan..." />
                <TextareaField label="Mô tả" id="bdesc" value={desc} onChange={(e) => setDesc(e.target.value)} />
                <SelectField label="Trạng thái" id="bstatus" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Active">Hoạt động</option>
                    <option value="Inactive">Dừng hoạt động</option>
                </SelectField>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-primary hover:bg-secondary transition-colors text-sm">Hủy</button>
                    <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-black transition-colors text-sm disabled:opacity-60">
                        {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BrandsPage() {
    const router = useRouter();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modalBrand, setModalBrand] = useState<Brand | null | undefined>(undefined); // undefined = closed
    const [deleteBrandId, setDeleteBrandId] = useState<string | null>(null);

    const fetchBrands = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(API);
            if (res.ok) setBrands(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchBrands(); }, [fetchBrands]);

    const handleDelete = async () => {
        if (!deleteBrandId) return;
        await fetch(`${API}/${deleteBrandId}`, { method: "DELETE", headers: authHeaders() });
        setDeleteBrandId(null);
        fetchBrands();
    };

    const filtered = brands.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        (b.country && b.country.toLowerCase().includes(search.toLowerCase()))
    );

    const active = brands.filter((b) => b.status === "Active").length;
    const inactive = brands.filter((b) => b.status !== "Active").length;

    return (
        <>
            {modalBrand !== undefined && (
                <BrandFormModal
                    brand={modalBrand ?? undefined}
                    onClose={() => setModalBrand(undefined)}
                    onSaved={fetchBrands}
                />
            )}

            {deleteBrandId && (
                <ConfirmModal
                    message="Bạn có chắc chắn muốn xóa thương hiệu này?"
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteBrandId(null)}
                />
            )}

            <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <button onClick={() => router.back()} className="text-muted hover:text-primary transition-colors text-sm">← Sản phẩm</button>
                            <span className="text-muted">/</span>
                            <span className="text-sm font-medium text-primary">Thương hiệu</span>
                        </div>
                        <h1 className="text-3xl font-heading font-bold text-primary mb-2">Quản lý thương hiệu</h1>
                        <p className="text-muted">Thêm, sửa, xóa thương hiệu kính mắt.</p>
                    </div>
                    <button
                        onClick={() => setModalBrand(null)}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-black transition-colors"
                    >
                        <Plus size={18} /> Thêm thương hiệu
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: "Tổng thương hiệu", value: brands.length, color: "text-primary" },
                        { label: "Hoạt động", value: active, color: "text-green-600" },
                        { label: "Dừng hoạt động", value: inactive, color: "text-gray-400" },
                    ].map((s) => (
                        <div key={s.label} className="bg-white rounded-xl border border-border p-5">
                            <p className="text-sm text-muted mb-1">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-xl border border-border mb-6">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên hoặc quốc gia..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse h-32">
                                <div className="w-3/4 bg-secondary h-4 rounded mb-3" />
                                <div className="w-1/2 bg-secondary h-3 rounded mb-2" />
                                <div className="w-2/3 bg-secondary h-3 rounded" />
                            </div>
                        ))
                    ) : filtered.length === 0 ? (
                        <div className="col-span-full py-16 text-center text-muted bg-white rounded-xl border border-border">
                            <Layers size={40} className="mx-auto mb-3 opacity-20" />
                            <p className="text-base mb-3">Chưa có thương hiệu nào.</p>
                            <button
                                onClick={() => setModalBrand(null)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition-colors text-sm"
                            >
                                <Plus size={16} /> Thêm thương hiệu đầu tiên
                            </button>
                        </div>
                    ) : (
                        filtered.map((brand) => (
                            <div key={brand.id} className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all group">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="p-2 bg-accent/10 rounded-lg shrink-0">
                                            <Layers size={16} className="text-accent" />
                                        </div>
                                        <h3 className="font-bold text-primary truncate">{brand.name}</h3>
                                    </div>
                                    <span className={`ml-2 shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${brand.status === "Active"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-500"
                                        }`}>
                                        {brand.status === "Active" ? "Hoạt động" : "Dừng"}
                                    </span>
                                </div>
                                {brand.country && (
                                    <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-1">
                                        🌏 {brand.country}
                                    </p>
                                )}
                                <p className="text-sm text-muted line-clamp-2 min-h-[40px]">
                                    {brand.description || "Chưa có mô tả."}
                                </p>
                                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                                    <button
                                        onClick={() => setModalBrand(brand)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={14} /> Sửa
                                    </button>
                                    <button
                                        onClick={() => setDeleteBrandId(brand.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={14} /> Xóa
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
