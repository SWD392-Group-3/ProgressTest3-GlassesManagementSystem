"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Plus, Edit2, Trash2, Tag, Percent, Clock, Box,
    Wrench, X, AlertTriangle, ChevronDown, ChevronUp, Package, Settings
} from "lucide-react";

// ─── Auth ────────────────────────────────────────────────────────────────────
const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("auth_token") ?? "" : "";

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

const BASE = "http://localhost:5000/api/manager/pricing-promotions";
const BASE_PRODUCTS = "http://localhost:5000/api/manager/products";

// ─── Types ───────────────────────────────────────────────────────────────────
type Promotion = {
    id: string; code: string; name?: string; description?: string;
    discountValue: number; startDate: string; endDate: string; status?: string;
};
type Service = {
    id: string; name: string; description?: string; price: number; status?: string;
};
type ComboItem = {
    id: string; quantity: number;
    frameVariant?: { productName?: string; color?: string; size?: string; price: number; imageUrl?: string };
    lensVariant?: { productName?: string; price: number };
};
type Combo = {
    id: string; name: string; description?: string;
    basePrice: number; startDate: string; endDate: string; status?: string;
    comboItems: ComboItem[];
};

// ─── Shared components ───────────────────────────────────────────────────────
function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-bold text-primary">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors"><X size={20} /></button>
                </div>
                <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-primary mb-1">{label}</label>
            {children}
        </div>
    );
}

const inputCls = "w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent";

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

function StatusBadge({ status }: { status?: string }) {
    const active = status === "Active";
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
            {active ? "Hoạt động" : "Dừng"}
        </span>
    );
}

function ActionsRow({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
    return (
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1.5 rounded text-muted hover:text-accent hover:bg-accent/10 transition-colors"><Edit2 size={15} /></button>
            <button onClick={onDelete} className="p-1.5 rounded text-muted hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
        </div>
    );
}

// ─── PROMOTIONS TAB ───────────────────────────────────────────────────────────
function PromotionForm({ initial, onSaved, onClose }: {
    initial?: Partial<Promotion>; onSaved: () => void; onClose: () => void;
}) {
    const isEdit = !!initial?.id;
    const [form, setForm] = useState({
        code: initial?.code ?? "",
        name: initial?.name ?? "",
        description: initial?.description ?? "",
        discountValue: initial?.discountValue?.toString() ?? "0",
        startDate: initial?.startDate ? initial.startDate.slice(0, 10) : "",
        endDate: initial?.endDate ? initial.endDate.slice(0, 10) : "",
        status: initial?.status ?? "Active",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError("");
        const body = {
            code: form.code, name: form.name, description: form.description,
            discountValue: parseFloat(form.discountValue) || 0,
            startDate: new Date(form.startDate).toISOString(),
            endDate: new Date(form.endDate).toISOString(),
            status: form.status,
        };
        const url = isEdit ? `${BASE}/promotions/${initial!.id}` : `${BASE}/promotions`;
        const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: authHeaders(), body: JSON.stringify(body) });
        if (res.ok) { onSaved(); onClose(); }
        else { setError(await res.text() || "Lỗi"); }
        setSaving(false);
    };

    return (
        <ModalShell title={isEdit ? "Chỉnh sửa khuyến mãi" : "Tạo khuyến mãi mới"} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <Field label="Mã khuyến mãi *">
                    <input className={inputCls} required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="VD: SUMMER20" />
                </Field>
                <Field label="Tên chương trình">
                    <input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </Field>
                <Field label="Mô tả">
                    <textarea className={inputCls} rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Giá trị giảm (VND) *">
                        <input className={inputCls} required type="number" min="0" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} />
                    </Field>
                    <Field label="Trạng thái">
                        <select className={inputCls} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                            <option value="Active">Hoạt động</option>
                            <option value="Inactive">Dừng</option>
                        </select>
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Ngày bắt đầu *">
                        <input className={inputCls} required type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                    </Field>
                    <Field label="Ngày kết thúc *">
                        <input className={inputCls} required type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                    </Field>
                </div>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-primary text-sm hover:bg-secondary transition-colors">Hủy</button>
                    <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-black transition-colors disabled:opacity-60">
                        {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}

function PromotionsTab({ promotions, loading, onRefresh }: { promotions: Promotion[]; loading: boolean; onRefresh: () => void }) {
    const [editTarget, setEditTarget] = useState<Promotion | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await fetch(`${BASE}/promotions/${deleteTarget.id}`, { method: "DELETE", headers: authHeaders() });
        setDeleteTarget(null); onRefresh();
    };

    return (
        <>
            {(showCreate || editTarget) && (
                <PromotionForm
                    initial={editTarget ?? undefined}
                    onSaved={onRefresh}
                    onClose={() => { setShowCreate(false); setEditTarget(null); }}
                />
            )}
            {deleteTarget && (
                <ConfirmModal
                    message={`Xóa khuyến mãi "${deleteTarget.code}"?`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
            <div className="flex justify-end mb-4">
                <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-black transition-colors">
                    <Plus size={16} /> Thêm khuyến mãi
                </button>
            </div>
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-border p-6 animate-pulse h-36" />)}
                </div>
            ) : promotions.length === 0 ? (
                <div className="py-16 text-center text-muted bg-white rounded-xl border border-border">
                    <Tag size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Chưa có khuyến mãi nào.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {promotions.map(p => (
                        <div key={p.id} className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow group flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent font-bold uppercase tracking-wider text-sm rounded-md border border-accent/20">
                                    <Tag size={13} />{p.code}
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={p.status} />
                                    <ActionsRow onEdit={() => setEditTarget(p)} onDelete={() => setDeleteTarget(p)} />
                                </div>
                            </div>
                            {p.name && <p className="font-semibold text-primary mb-1">{p.name}</p>}
                            <p className="text-red-500 font-bold text-xl mb-2 flex items-center gap-1">
                                <Percent size={18} />{p.discountValue.toLocaleString("vi-VN")} VND
                            </p>
                            {p.description && <p className="text-sm text-muted flex-1">{p.description}</p>}
                            <div className="flex items-center gap-1.5 text-xs text-muted mt-3 pt-3 border-t border-border">
                                <Clock size={13} />
                                {new Date(p.startDate).toLocaleDateString("vi-VN")} — {new Date(p.endDate).toLocaleDateString("vi-VN")}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

// ─── SERVICES TAB ─────────────────────────────────────────────────────────────
function ServiceForm({ initial, onSaved, onClose }: {
    initial?: Partial<Service>; onSaved: () => void; onClose: () => void;
}) {
    const isEdit = !!initial?.id;
    const [form, setForm] = useState({
        name: initial?.name ?? "",
        description: initial?.description ?? "",
        price: initial?.price?.toString() ?? "0",
        status: initial?.status ?? "Active",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError("");
        const body = { name: form.name, description: form.description, price: parseFloat(form.price) || 0, status: form.status };
        const url = isEdit ? `${BASE}/services/${initial!.id}` : `${BASE}/services`;
        const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: authHeaders(), body: JSON.stringify(body) });
        if (res.ok) { onSaved(); onClose(); }
        else { setError(await res.text() || "Lỗi"); }
        setSaving(false);
    };

    return (
        <ModalShell title={isEdit ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ"} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <Field label="Tên dịch vụ *">
                    <input className={inputCls} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Đo mắt" />
                </Field>
                <Field label="Mô tả">
                    <textarea className={inputCls} rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Giá (VND) *">
                        <input className={inputCls} required type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                    </Field>
                    <Field label="Trạng thái">
                        <select className={inputCls} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                            <option value="Active">Hoạt động</option>
                            <option value="Inactive">Dừng</option>
                        </select>
                    </Field>
                </div>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-primary text-sm hover:bg-secondary transition-colors">Hủy</button>
                    <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-black transition-colors disabled:opacity-60">
                        {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}

function ServicesTab({ services, loading, onRefresh }: { services: Service[]; loading: boolean; onRefresh: () => void }) {
    const [editTarget, setEditTarget] = useState<Service | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await fetch(`${BASE}/services/${deleteTarget.id}`, { method: "DELETE", headers: authHeaders() });
        setDeleteTarget(null); onRefresh();
    };

    return (
        <>
            {(showCreate || editTarget) && (
                <ServiceForm
                    initial={editTarget ?? undefined}
                    onSaved={onRefresh}
                    onClose={() => { setShowCreate(false); setEditTarget(null); }}
                />
            )}
            {deleteTarget && (
                <ConfirmModal
                    message={`Xóa dịch vụ "${deleteTarget.name}"?`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
            <div className="flex justify-end mb-4">
                <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-black transition-colors">
                    <Plus size={16} /> Thêm dịch vụ
                </button>
            </div>
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse h-24" />)}
                </div>
            ) : services.length === 0 ? (
                <div className="py-16 text-center text-muted bg-white rounded-xl border border-border">
                    <Wrench size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Chưa có dịch vụ nào.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map(s => (
                        <div key={s.id} className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow group flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Wrench size={16} className="text-accent shrink-0" />
                                    <p className="font-semibold text-primary truncate">{s.name}</p>
                                    <StatusBadge status={s.status} />
                                </div>
                                {s.description && <p className="text-sm text-muted mb-1 line-clamp-1">{s.description}</p>}
                                <p className="text-accent font-bold">{s.price.toLocaleString("vi-VN")} VND</p>
                            </div>
                            <ActionsRow onEdit={() => setEditTarget(s)} onDelete={() => setDeleteTarget(s)} />
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

// ─── COMBOS TAB ───────────────────────────────────────────────────────────────
function ComboForm({ initial, onSaved, onClose }: {
    initial?: Partial<Combo>; onSaved: () => void; onClose: () => void;
}) {
    const isEdit = !!initial?.id;
    const [form, setForm] = useState({
        name: initial?.name ?? "",
        description: initial?.description ?? "",
        basePrice: initial?.basePrice?.toString() ?? "0",
        startDate: initial?.startDate ? initial.startDate.slice(0, 10) : "",
        endDate: initial?.endDate ? initial.endDate.slice(0, 10) : "",
        status: initial?.status ?? "Active",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError("");
        const body = {
            name: form.name, description: form.description,
            basePrice: parseFloat(form.basePrice) || 0,
            startDate: new Date(form.startDate).toISOString(),
            endDate: new Date(form.endDate).toISOString(),
            status: form.status,
        };
        const url = isEdit ? `${BASE}/combos/${initial!.id}` : `${BASE}/combos`;
        const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: authHeaders(), body: JSON.stringify(body) });
        if (res.ok) { onSaved(); onClose(); }
        else { setError(await res.text() || "Lỗi"); }
        setSaving(false);
    };

    return (
        <ModalShell title={isEdit ? "Chỉnh sửa combo" : "Tạo combo mới"} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <Field label="Tên combo *">
                    <input className={inputCls} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Gọng titan + tròng chống UV" />
                </Field>
                <Field label="Mô tả">
                    <textarea className={inputCls} rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Giá gốc (VND) *">
                        <input className={inputCls} required type="number" min="0" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: e.target.value })} />
                    </Field>
                    <Field label="Trạng thái">
                        <select className={inputCls} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                            <option value="Active">Hoạt động</option>
                            <option value="Inactive">Dừng</option>
                        </select>
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Ngày bắt đầu *">
                        <input className={inputCls} required type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                    </Field>
                    <Field label="Ngày kết thúc *">
                        <input className={inputCls} required type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                    </Field>
                </div>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-primary text-sm hover:bg-secondary transition-colors">Hủy</button>
                    <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-black transition-colors disabled:opacity-60">
                        {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}

function ComboItemsModal({ combo, onClose, onRefresh }: { combo: Combo; onClose: () => void; onRefresh: () => void }) {
    const [products, setProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [itemType, setItemType] = useState<"frame" | "lens">("frame");
    const [selectedVariantId, setSelectedVariantId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingProducts(true);
            try {
                const res = await fetch(`${BASE_PRODUCTS}`, { headers: authHeaders() });
                if (res.ok) setProducts(await res.json());
            } catch { /* ignore */ } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);

    const frames = products.flatMap(p => p.productVariants?.map((v: any) => ({ ...v, productName: p.name })) || []);
    const lenses = products.flatMap(p => p.lensesVariants?.map((v: any) => ({ ...v, productName: p.name })) || []);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVariantId) return;
        setSaving(true);
        const body = {
            productVariantId: itemType === "frame" ? selectedVariantId : null,
            lensesVariantId: itemType === "lens" ? selectedVariantId : null,
            quantity: quantity
        };
        const res = await fetch(`${BASE}/combos/${combo.id}/items`, {
            method: "POST", headers: authHeaders(), body: JSON.stringify(body)
        });
        setSaving(false);
        if (res.ok) onRefresh();
        else alert("Lỗi khi thêm: " + await res.text());
    };

    const handleRemoveItem = async (itemId: string) => {
        if (!confirm("Bạn có chắc muốn xóa sản phẩm này khỏi combo?")) return;
        const res = await fetch(`${BASE}/combos/${combo.id}/items/${itemId}`, { method: "DELETE", headers: authHeaders() });
        if (res.ok) onRefresh();
        else alert("Lỗi khi xóa: " + await res.text());
    };

    return (
        <ModalShell title={`Chi tiết combo: ${combo.name}`} onClose={onClose}>
            <div className="space-y-6">
                <div>
                    <h3 className="font-bold text-primary mb-3">Sản phẩm trong combo ({combo.comboItems.length})</h3>
                    {combo.comboItems.length === 0 ? (
                        <p className="text-sm text-muted italic">Chưa có sản phẩm nào.</p>
                    ) : (
                        <div className="space-y-2 border border-border rounded-lg p-2 max-h-60 overflow-y-auto">
                            {combo.comboItems.map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded-md">
                                    <div className="flex items-center gap-3">
                                        <Package size={16} className="text-muted" />
                                        <div className="text-sm">
                                            {item.frameVariant ? (
                                                <span><span className="font-medium text-primary">[Gọng]</span> {item.frameVariant.productName} {item.frameVariant.color && `(${item.frameVariant.color})`}</span>
                                            ) : item.lensVariant ? (
                                                <span><span className="font-medium text-primary">[Tròng]</span> {item.lensVariant.productName}</span>
                                            ) : "Không xác định"}
                                            <span className="mx-2 text-xs text-muted">x{item.quantity}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <form onSubmit={handleAddItem} className="bg-secondary/20 p-4 rounded-lg border border-border">
                    <h3 className="font-bold text-primary mb-3 text-sm">Thêm sản phẩm</h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <select className={inputCls} value={itemType} onChange={e => { setItemType(e.target.value as any); setSelectedVariantId(""); }}>
                            <option value="frame">Thêm Gọng kính</option>
                            <option value="lens">Thêm Tròng kính</option>
                        </select>
                        <select className={inputCls} required value={selectedVariantId} onChange={e => setSelectedVariantId(e.target.value)} disabled={loadingProducts}>
                            <option value="">-- Chọn sản phẩm --</option>
                            {itemType === "frame" ? (
                                frames.map(f => (
                                    <option key={f.id} value={f.id}>{f.productName} {f.color && `- ${f.color}`} ({f.price?.toLocaleString()}đ)</option>
                                ))
                            ) : (
                                lenses.map(l => (
                                    <option key={l.id} value={l.id}>{l.productName} ({l.price?.toLocaleString()}đ)</option>
                                ))
                            )}
                        </select>
                    </div>
                    <div className="flex items-end gap-3">
                        <div className="flex-1">
                            <label className="block text-xs font-medium mb-1">Số lượng</label>
                            <input type="number" min="1" required className={inputCls} value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} />
                        </div>
                        <button type="submit" disabled={saving || !selectedVariantId} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-black disabled:opacity-50 h-[38px] flex items-center">
                            {saving ? "..." : "Thêm vào Combo"}
                        </button>
                    </div>
                </form>
            </div>
            <div className="flex justify-end pt-4 mt-2 border-t border-border">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-black transition-colors">Đóng</button>
            </div>
        </ModalShell>
    );
}

function ComboCard({ combo, onEdit, onDelete, onManageItems }: { combo: Combo; onEdit: () => void; onDelete: () => void; onManageItems: () => void }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className="bg-white rounded-xl border border-border hover:shadow-md transition-shadow group">
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <Box size={18} className="text-accent shrink-0" />
                        <h3 className="font-bold text-primary">{combo.name}</h3>
                        <StatusBadge status={combo.status} />
                    </div>
                    <ActionsRow onEdit={onEdit} onDelete={onDelete} />
                </div>
                {combo.description && <p className="text-sm text-muted mb-3">{combo.description}</p>}
                <p className="text-accent font-bold text-lg mb-2">{combo.basePrice.toLocaleString("vi-VN")} VND</p>
                <div className="flex items-center gap-1.5 text-xs text-muted mb-3">
                    <Clock size={13} />
                    {new Date(combo.startDate).toLocaleDateString("vi-VN")} — {new Date(combo.endDate).toLocaleDateString("vi-VN")}
                </div>
                {combo.comboItems.length > 0 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1 text-xs text-accent hover:underline mb-2"
                    >
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {combo.comboItems.length} sản phẩm trong combo
                    </button>
                )}

                <button onClick={onManageItems} className="w-full mt-2 py-1.5 text-sm font-medium border border-border rounded-md text-primary hover:bg-secondary/50 flex items-center justify-center gap-2 transition-colors">
                    <Settings size={14} /> Quản lý sản phẩm
                </button>
            </div>
            {expanded && combo.comboItems.length > 0 && (
                <div className="border-t border-border px-5 pb-4 pt-3 space-y-2">
                    {combo.comboItems.map(item => (
                        <div key={item.id} className="flex items-center gap-3 text-sm">
                            <Package size={14} className="text-muted shrink-0" />
                            <div className="flex-1">
                                {item.frameVariant && (
                                    <span className="text-primary">
                                        <span className="font-medium">[Gọng]</span> {item.frameVariant.productName ?? "—"}
                                        {item.frameVariant.color && ` · ${item.frameVariant.color}`}
                                        {item.frameVariant.size && ` · ${item.frameVariant.size}`}
                                        {" · "}<span className="text-accent">{item.frameVariant.price.toLocaleString("vi-VN")} VND</span>
                                    </span>
                                )}
                                {item.lensVariant && (
                                    <span className="text-primary">
                                        <span className="font-medium">[Tròng]</span> {item.lensVariant.productName ?? "—"}
                                        {" · "}<span className="text-accent">{item.lensVariant.price.toLocaleString("vi-VN")} VND</span>
                                    </span>
                                )}
                            </div>
                            <span className="text-muted text-xs">x{item.quantity}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function CombosTab({ combos, loading, onRefresh }: { combos: Combo[]; loading: boolean; onRefresh: () => void }) {
    const [editTarget, setEditTarget] = useState<Combo | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Combo | null>(null);
    const [manageItemsTarget, setManageItemsTarget] = useState<Combo | null>(null);

    // Refresh combo items dynamically when modified
    const handleRefreshItems = () => {
        onRefresh();
        // Since onRefresh fetches combos list, the selected combo will update soon via props.
        // We'll trust the parent re-render to update the items in manageItemsTarget,
        // but since `manageItemsTarget` is a separate state copy, we should update it:
        if (manageItemsTarget) {
            const updated = combos.find(c => c.id === manageItemsTarget.id);
            if (updated) setManageItemsTarget(updated);
        }
    };

    // Watch for `combos` updates and sync `manageItemsTarget` to reflect changes immediately
    useEffect(() => {
        if (manageItemsTarget) {
            const updated = combos.find(c => c.id === manageItemsTarget.id);
            if (updated && JSON.stringify(updated.comboItems) !== JSON.stringify(manageItemsTarget.comboItems)) {
                setManageItemsTarget(updated);
            }
        }
    }, [combos]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await fetch(`${BASE}/combos/${deleteTarget.id}`, { method: "DELETE", headers: authHeaders() });
        setDeleteTarget(null); onRefresh();
    };

    return (
        <>
            {(showCreate || editTarget) && (
                <ComboForm
                    initial={editTarget ?? undefined}
                    onSaved={onRefresh}
                    onClose={() => { setShowCreate(false); setEditTarget(null); }}
                />
            )}
            {deleteTarget && (
                <ConfirmModal
                    message={`Xóa combo "${deleteTarget.name}"?`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
            {manageItemsTarget && (
                <ComboItemsModal
                    combo={manageItemsTarget}
                    onClose={() => setManageItemsTarget(null)}
                    onRefresh={onRefresh}
                />
            )}
            <div className="flex justify-end mb-4">
                <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-black transition-colors">
                    <Plus size={16} /> Tạo combo
                </button>
            </div>
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse h-36" />)}
                </div>
            ) : combos.length === 0 ? (
                <div className="py-16 text-center text-muted bg-white rounded-xl border border-border">
                    <Box size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Chưa có combo nào. Hãy tạo combo gọng + tròng đầu tiên.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {combos.map(c => (
                        <ComboCard
                            key={c.id}
                            combo={c}
                            onEdit={() => setEditTarget(c)}
                            onDelete={() => setDeleteTarget(c)}
                            onManageItems={() => setManageItemsTarget(c)}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
type Tab = "promotions" | "combos" | "services";

export default function PromotionsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("promotions");
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [combos, setCombos] = useState<Combo[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loadingP, setLoadingP] = useState(true);
    const [loadingC, setLoadingC] = useState(true);
    const [loadingS, setLoadingS] = useState(true);

    const fetchPromotions = useCallback(async () => {
        setLoadingP(true);
        try { const r = await fetch(`${BASE}/promotions`, { headers: authHeaders() }); if (r.ok) setPromotions(await r.json()); }
        catch { /* ignore */ } finally { setLoadingP(false); }
    }, []);

    const fetchCombos = useCallback(async () => {
        setLoadingC(true);
        try { const r = await fetch(`${BASE}/combos`, { headers: authHeaders() }); if (r.ok) setCombos(await r.json()); }
        catch { /* ignore */ } finally { setLoadingC(false); }
    }, []);

    const fetchServices = useCallback(async () => {
        setLoadingS(true);
        try { const r = await fetch(`${BASE}/services`, { headers: authHeaders() }); if (r.ok) setServices(await r.json()); }
        catch { /* ignore */ } finally { setLoadingS(false); }
    }, []);

    useEffect(() => { fetchPromotions(); fetchCombos(); fetchServices(); }, [fetchPromotions, fetchCombos, fetchServices]);

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: "promotions", label: "Khuyến mãi & Giảm giá", icon: <Tag size={16} /> },
        { key: "combos", label: "Combo (Gọng + Tròng)", icon: <Box size={16} /> },
        { key: "services", label: "Dịch vụ cửa hàng", icon: <Wrench size={16} /> },
    ];

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-primary mb-2">Giá bán & Khuyến mãi</h1>
                <p className="text-muted">Quản lý giá gọng/tròng, combo, khuyến mãi và dịch vụ cửa hàng.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border mb-6">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`flex items-center gap-2 px-4 pb-3 pt-1 text-sm font-medium transition-colors ${activeTab === t.key
                            ? "text-accent border-b-2 border-accent"
                            : "text-muted hover:text-primary"
                            }`}
                    >
                        {t.icon}{t.label}
                    </button>
                ))}
            </div>

            {activeTab === "promotions" && <PromotionsTab promotions={promotions} loading={loadingP} onRefresh={fetchPromotions} />}
            {activeTab === "combos" && <CombosTab combos={combos} loading={loadingC} onRefresh={fetchCombos} />}
            {activeTab === "services" && <ServicesTab services={services} loading={loadingS} onRefresh={fetchServices} />}
        </div>
    );
}
