"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Search, Package, X, Tag, Layers, AlertTriangle, UploadCloud } from "lucide-react";

const API = "http://localhost:5000/api/manager/products";
const TOKEN_KEY = "auth_token"; // matches lib/auth-storage.ts

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = { id: string; name: string; description?: string; status?: string };
type Brand = { id: string; name: string; description?: string; country?: string; status?: string };
type Policy = { id: string; name: string; durationMonths: number };

type Product = {
    id: string;
    categoryId?: string;
    brandId?: string;
    warrantyPolicyId?: string;
    name: string;
    description?: string;
    unitPrice: number;
    status?: string;
    imageUrl?: string;
    category?: Category;
    brand?: Brand;
    productVariants?: any[];
    lensesVariants?: any[];
};

type Modal =
    | { type: "none" }
    | { type: "addProduct" }
    | { type: "editProduct"; product: Product }
    | { type: "categories" }
    | { type: "brands" }
    | { type: "addCategory" }
    | { type: "editCategory"; category: Category }
    | { type: "addBrand" }
    | { type: "editBrand"; brand: Brand }
    | { type: "variants"; product: Product };

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) ?? "" : "";

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                                    type: "image/webp",
                                    lastModified: Date.now(),
                                });
                                resolve(newFile);
                            } else {
                                reject(new Error("Chuyển đổi ảnh thất bại"));
                            }
                        },
                        "image/webp",
                        quality
                    );
                } else {
                    reject(new Error("Lỗi Canvas"));
                }
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function ModalShell({ title, onClose, children, maxWidth = "max-w-lg" }: { title: string; onClose: () => void; children: React.ReactNode; maxWidth?: string }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-bold text-primary">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
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
            <input
                id={id}
                {...props}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent disabled:bg-secondary/40"
            />
        </div>
    );
}

function TextareaField({ label, id, ...props }: { label: string; id: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-primary mb-1">{label}</label>
            <textarea
                id={id}
                rows={3}
                {...props}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none"
            />
        </div>
    );
}

function SelectField({ label, id, children, ...props }: { label: string; id: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-primary mb-1">{label}</label>
            <select
                id={id}
                {...props}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-white"
            >
                {children}
            </select>
        </div>
    );
}

// ─── Product Form Modal ───────────────────────────────────────────────────────

function ProductFormModal({
    modal,
    categories,
    brands,
    policies,
    onClose,
    onSaved,
}: {
    modal: { type: "addProduct" } | { type: "editProduct"; product: Product };
    categories: Category[];
    brands: Brand[];
    policies: Policy[];
    onClose: () => void;
    onSaved: () => void;
}) {
    const isEdit = modal.type === "editProduct";
    const p = isEdit ? modal.product : null;

    const [name, setName] = useState(p?.name ?? "");
    const [desc, setDesc] = useState(p?.description ?? "");
    const [price, setPrice] = useState(p?.unitPrice?.toString() ?? "0");
    const [catId, setCatId] = useState(p?.categoryId ?? "");
    const [brandId, setBrandId] = useState(p?.brandId ?? "");
    const [policyId, setPolicyId] = useState(p?.warrantyPolicyId ?? "");
    const [status, setStatus] = useState(p?.status ?? "Active");
    const [imageUrl, setImageUrl] = useState(p?.imageUrl ?? "");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(p?.imageUrl ?? null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            try {
                const compressed = await compressImage(file);
                setImageFile(compressed);
                setImagePreview(URL.createObjectURL(compressed));
            } catch (err) {
                console.error("Lỗi nén ảnh:", err);
                alert("Không thể xử lý hình ảnh này.");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            let finalImageUrl = imageUrl;

            if (imageFile) {
                const formData = new FormData();
                formData.append("file", imageFile);
                const uploadRes = await fetch("http://localhost:5000/api/manager/upload/image", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${getToken()}` },
                    body: formData
                });
                if (!uploadRes.ok) {
                    throw new Error("Lỗi tải ảnh lên server.");
                }
                const uploadData = await uploadRes.json();
                finalImageUrl = uploadData.url;
            }

            const body = {
                ...(isEdit ? { id: p!.id } : {}),
                name,
                description: desc || null,
                unitPrice: parseFloat(price) || 0,
                categoryId: catId || null,
                brandId: brandId || null,
                warrantyPolicyId: policyId || null,
                status,
                imageUrl: finalImageUrl || null,
            };
            const res = await fetch(isEdit ? `${API}/${p!.id}` : API, {
                method: isEdit ? "PUT" : "POST",
                headers: authHeaders(),
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Error ${res.status}`);
            }
            onSaved();
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Lỗi không xác định");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ModalShell title={isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"} onClose={onClose} maxWidth="max-w-4xl">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                    {/* Cột 1 */}
                    <div>
                        <InputField label="Tên sản phẩm *" id="pname" value={name} onChange={(e) => setName(e.target.value)} required />
                        <InputField label="Giá (VND) *" id="pprice" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
                        <SelectField label="Trạng thái" id="pstatus" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </SelectField>
                        <TextareaField label="Mô tả" id="pdesc" value={desc} onChange={(e) => setDesc(e.target.value)} rows={5} />
                    </div>

                    {/* Cột 2 */}
                    <div>
                        <SelectField label="Danh mục" id="pcat" value={catId} onChange={(e) => setCatId(e.target.value)}>
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </SelectField>
                        <SelectField label="Thương hiệu" id="pbrand" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                            <option value="">-- Chọn thương hiệu --</option>
                            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </SelectField>
                        <SelectField label="Chính sách bảo hành *" id="ppolicy" value={policyId} onChange={(e) => setPolicyId(e.target.value)} required>
                            <option value="">-- Chọn chính sách --</option>
                            {policies.map((pol) => <option key={pol.id} value={pol.id}>{pol.name} ({pol.durationMonths} tháng)</option>)}
                        </SelectField>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-primary mb-1">Hình ảnh sản phẩm</label>
                            <div className="border border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center relative hover:bg-secondary/20 transition-colors h-[180px]">
                                {imagePreview ? (
                                    <div className="relative w-full h-full flex items-center justify-center z-10">
                                        <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImageFile(null); setImagePreview(null); setImageUrl(""); }}
                                            className="absolute top-2 right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md hover:bg-red-50 transition-colors z-20"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-6 text-center text-muted flex flex-col items-center gap-2">
                                        <UploadCloud size={32} className="opacity-50" />
                                        <span className="text-sm font-medium">Nhấn để tải ảnh lên</span>
                                        <span className="text-xs opacity-70">JPG, PNG, WEBP (Tối đa 5MB)</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                                    title="Chọn hình ảnh"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
                    <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg border border-border text-primary hover:bg-secondary transition-colors text-sm font-medium">Hủy</button>
                    <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-primary text-white hover:bg-black transition-colors text-sm font-medium disabled:opacity-60">
                        {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}

// ─── Category Modal ───────────────────────────────────────────────────────────

function CategoryModal({
    categories,
    onClose,
    onChanged,
    openAdd,
    openEdit,
}: {
    categories: Category[];
    onClose: () => void;
    onChanged: () => void;
    openAdd: () => void;
    openEdit: (c: Category) => void;
}) {
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!deleteId) return;
        await fetch(`${API}/categories/${deleteId}`, { method: "DELETE", headers: authHeaders() });
        setDeleteId(null);
        onChanged();
    };
    return (
        <ModalShell title="Quản lý danh mục" onClose={onClose}>
            {deleteId && (
                <ConfirmModal
                    message="Bạn có chắc chắn muốn xóa danh mục này?"
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteId(null)}
                />
            )}
            <button onClick={openAdd} className="mb-4 flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-lg text-sm hover:bg-black transition-colors">
                <Plus size={16} /> Thêm danh mục
            </button>
            {categories.length === 0 ? (
                <p className="text-muted text-sm text-center py-6">Chưa có danh mục nào.</p>
            ) : (
                <div className="space-y-2">
                    {categories.map((c) => (
                        <div key={c.id} className="flex items-center justify-between border border-border rounded-lg px-4 py-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-primary text-sm">{c.name}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === "Active"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-500"
                                        }`}>{c.status === "Active" ? "Hoạt động" : "Dừng hoạt động"}</span>
                                </div>
                                {c.description && <p className="text-xs text-muted mt-0.5">{c.description}</p>}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(c)} className="p-1.5 text-muted hover:text-accent hover:bg-accent/10 rounded transition-colors"><Edit2 size={15} /></button>
                                <button onClick={() => setDeleteId(c.id)} className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={15} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ModalShell>
    );
}

function CategoryFormModal({
    modal,
    onClose,
    onSaved,
}: {
    modal: { type: "addCategory" } | { type: "editCategory"; category: Category };
    onClose: () => void;
    onSaved: () => void;
}) {
    const isEdit = modal.type === "editCategory";
    const c = isEdit ? modal.category : null;
    const [name, setName] = useState(c?.name ?? "");
    const [desc, setDesc] = useState(c?.description ?? "");
    const [status, setStatus] = useState(c?.status ?? "Active");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const res = await fetch(isEdit ? `${API}/categories/${c!.id}` : `${API}/categories`, {
                method: isEdit ? "PUT" : "POST",
                headers: authHeaders(),
                body: JSON.stringify({ name, description: desc || null, status }),
            });
            if (!res.ok) throw new Error(await res.text());
            onSaved();
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Lỗi");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ModalShell title={isEdit ? "Sửa danh mục" : "Thêm danh mục"} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <InputField label="Tên danh mục *" id="cname" value={name} onChange={(e) => setName(e.target.value)} required />
                <TextareaField label="Mô tả" id="cdesc" value={desc} onChange={(e) => setDesc(e.target.value)} />
                <SelectField label="Trạng thái" id="cstatus" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </SelectField>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-primary hover:bg-secondary transition-colors text-sm">Hủy</button>
                    <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-black transition-colors text-sm disabled:opacity-60">
                        {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo"}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}

// ─── Brand Modal ──────────────────────────────────────────────────────────────

function BrandModal({
    brands,
    onClose,
    onChanged,
    openAdd,
    openEdit,
}: {
    brands: Brand[];
    onClose: () => void;
    onChanged: () => void;
    openAdd: () => void;
    openEdit: (b: Brand) => void;
}) {
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!deleteId) return;
        await fetch(`${API}/brands/${deleteId}`, { method: "DELETE", headers: authHeaders() });
        setDeleteId(null);
        onChanged();
    };
    return (
        <ModalShell title="Quản lý thương hiệu" onClose={onClose}>
            {deleteId && (
                <ConfirmModal
                    message="Bạn có chắc chắn muốn xóa thương hiệu này?"
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteId(null)}
                />
            )}
            <button onClick={openAdd} className="mb-4 flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-lg text-sm hover:bg-black transition-colors">
                <Plus size={16} /> Thêm thương hiệu
            </button>
            {brands.length === 0 ? (
                <p className="text-muted text-sm text-center py-6">Chưa có thương hiệu nào.</p>
            ) : (
                <div className="space-y-2">
                    {brands.map((b) => (
                        <div key={b.id} className="flex items-center justify-between border border-border rounded-lg px-4 py-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-primary text-sm">{b.name}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.status === "Active"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-500"
                                        }`}>{b.status === "Active" ? "Hoạt động" : "Dừng hoạt động"}</span>
                                </div>
                                {b.country && <p className="text-xs text-muted mt-0.5">{b.country}</p>}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(b)} className="p-1.5 text-muted hover:text-accent hover:bg-accent/10 rounded transition-colors"><Edit2 size={15} /></button>
                                <button onClick={() => setDeleteId(b.id)} className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={15} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ModalShell>
    );
}

function BrandFormModal({
    modal,
    onClose,
    onSaved,
}: {
    modal: { type: "addBrand" } | { type: "editBrand"; brand: Brand };
    onClose: () => void;
    onSaved: () => void;
}) {
    const isEdit = modal.type === "editBrand";
    const b = isEdit ? modal.brand : null;
    const [name, setName] = useState(b?.name ?? "");
    const [desc, setDesc] = useState(b?.description ?? "");
    const [country, setCountry] = useState(b?.country ?? "");
    const [status, setStatus] = useState(b?.status ?? "Active");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const res = await fetch(isEdit ? `${API}/brands/${b!.id}` : `${API}/brands`, {
                method: isEdit ? "PUT" : "POST",
                headers: authHeaders(),
                body: JSON.stringify({ name, description: desc || null, country: country || null, status }),
            });
            if (!res.ok) throw new Error(await res.text());
            onSaved();
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Lỗi");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ModalShell title={isEdit ? "Sửa thương hiệu" : "Thêm thương hiệu"} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <InputField label="Tên thương hiệu *" id="bname" value={name} onChange={(e) => setName(e.target.value)} required />
                <InputField label="Quốc gia" id="bcountry" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Vietnam, Italy..." />
                <TextareaField label="Mô tả" id="bdesc" value={desc} onChange={(e) => setDesc(e.target.value)} />
                <SelectField label="Trạng thái" id="bstatus" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </SelectField>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-primary hover:bg-secondary transition-colors text-sm">Hủy</button>
                    <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-black transition-colors text-sm disabled:opacity-60">
                        {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo"}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}

// ─── Variants Modal ────────────────────────────────────────────────────────
function ProductVariantsModal({ product, onClose, onRefresh }: { product: Product; onClose: () => void; onRefresh: () => void }) {
    const [activeTab, setActiveTab] = useState<"frame" | "lens">("frame");
    const [frames, setFrames] = useState<any[]>(product.productVariants || []);
    const [lenses, setLenses] = useState<any[]>(product.lensesVariants || []);
    const [loading, setLoading] = useState(false);

    // Frame Form State
    const [fColor, setFColor] = useState("");
    const [fSize, setFSize] = useState("");
    const [fMaterial, setFMaterial] = useState("");
    const [fPrice, setFPrice] = useState("0");

    // Lens Form State
    const [lDoCau, setLDoCau] = useState("");
    const [lDoTru, setLDoTru] = useState("");
    const [lChiSo, setLChiSo] = useState("");
    const [lPrice, setLPrice] = useState("0");

    const refreshVariants = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/${product.id}`, { headers: authHeaders() });
            if (res.ok) {
                const data = await res.json();
                setFrames(data.productVariants || []);
                setLenses(data.lensesVariants || []);
            }
            onRefresh();
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleAddFrame = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API}/frame-variants`, {
                method: "POST", headers: authHeaders(),
                body: JSON.stringify({
                    productId: product.id,
                    color: fColor || null,
                    size: fSize || null,
                    material: fMaterial || null,
                    price: parseFloat(fPrice) || 0,
                    status: "Active"
                })
            });
            if (res.ok) {
                setFColor(""); setFSize(""); setFMaterial(""); setFPrice("0");
                await refreshVariants();
            } else {
                alert("Lỗi: " + await res.text());
            }
        } finally { setLoading(false); }
    };

    const handleAddLens = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API}/lens-variants`, {
                method: "POST", headers: authHeaders(),
                body: JSON.stringify({
                    productId: product.id,
                    doCau: parseFloat(lDoCau) || null,
                    doTru: parseFloat(lDoTru) || null,
                    chiSoKhucXa: parseFloat(lChiSo) || null,
                    price: parseFloat(lPrice) || 0,
                    status: "Active"
                })
            });
            if (res.ok) {
                setLDoCau(""); setLDoTru(""); setLChiSo(""); setLPrice("0");
                await refreshVariants();
            } else {
                alert("Lỗi: " + await res.text());
            }
        } finally { setLoading(false); }
    };

    const handleDeleteFrame = async (id: string) => {
        if (!confirm("Xóa gọng kính này?")) return;
        setLoading(true);
        try {
            const res = await fetch(`${API}/frame-variants/${id}`, { method: "DELETE", headers: authHeaders() });
            if (res.ok) await refreshVariants();
            else alert("Lỗi: " + await res.text());
        } finally { setLoading(false); }
    };

    const handleDeleteLens = async (id: string) => {
        if (!confirm("Xóa tròng kính này?")) return;
        setLoading(true);
        try {
            const res = await fetch(`${API}/lens-variants/${id}`, { method: "DELETE", headers: authHeaders() });
            if (res.ok) await refreshVariants();
            else alert("Lỗi: " + await res.text());
        } finally { setLoading(false); }
    };

    return (
        <ModalShell title={`Biến thể: ${product.name}`} onClose={onClose} maxWidth="max-w-3xl">
            <div className="flex gap-2 border-b border-border mb-4">
                <button
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "frame" ? "border-accent text-accent" : "border-transparent text-muted hover:text-primary"}`}
                    onClick={() => setActiveTab("frame")}
                >
                    Gọng Kính ({frames.length})
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "lens" ? "border-accent text-accent" : "border-transparent text-muted hover:text-primary"}`}
                    onClick={() => setActiveTab("lens")}
                >
                    Tròng Kính ({lenses.length})
                </button>
            </div>

            {activeTab === "frame" && (
                <div className="space-y-4">
                    <form onSubmit={handleAddFrame} className="bg-secondary/30 p-4 rounded-lg border border-border">
                        <h4 className="font-bold text-sm mb-3">Thêm Gọng Kính</h4>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div><label className="text-xs font-medium block mb-1">Màu sắc</label><input required value={fColor} onChange={e => setFColor(e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="VD: Đen" /></div>
                            <div><label className="text-xs font-medium block mb-1">Kích thước</label><input value={fSize} onChange={e => setFSize(e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="VD: M, 52-18-140" /></div>
                            <div><label className="text-xs font-medium block mb-1">Chất liệu</label><input value={fMaterial} onChange={e => setFMaterial(e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="VD: Nhựa dẻo" /></div>
                            <div><label className="text-xs font-medium block mb-1">Giá cộng thêm (VND)</label><input type="number" required value={fPrice} onChange={e => setFPrice(e.target.value)} className="w-full border rounded px-2 py-1 text-sm" /></div>
                        </div>
                        <div className="flex justify-end"><button disabled={loading} className="bg-primary text-white text-xs px-3 py-1.5 rounded disabled:opacity-50">Thêm Gọng</button></div>
                    </form>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {frames.length === 0 ? <p className="text-xs text-muted text-center py-4">Chưa có gọng kính nào.</p> :
                            frames.map(f => (
                                <div key={f.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                                    <div className="text-sm">
                                        <p className="font-medium">Màu {f.color}</p>
                                        <p className="text-xs text-muted">Size: {f.size || 'N/A'} • Chất liệu: {f.material || 'N/A'} • Giá: +{f.price?.toLocaleString()}đ</p>
                                    </div>
                                    <button onClick={() => handleDeleteFrame(f.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16} /></button>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {activeTab === "lens" && (
                <div className="space-y-4">
                    <form onSubmit={handleAddLens} className="bg-secondary/30 p-4 rounded-lg border border-border">
                        <h4 className="font-bold text-sm mb-3">Thêm Tròng Kính</h4>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div><label className="text-xs font-medium block mb-1">Độ Cận (Diopter)</label><input type="number" step="0.25" value={lDoCau} onChange={e => setLDoCau(e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="-2.00" /></div>
                            <div><label className="text-xs font-medium block mb-1">Độ Loạn (Cylinder)</label><input type="number" step="0.25" value={lDoTru} onChange={e => setLDoTru(e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="-0.50" /></div>
                            <div><label className="text-xs font-medium block mb-1">Chiết xuất</label><input type="number" step="0.01" value={lChiSo} onChange={e => setLChiSo(e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="1.56, 1.60..." /></div>
                            <div><label className="text-xs font-medium block mb-1">Giá cộng thêm (VND)</label><input type="number" required value={lPrice} onChange={e => setLPrice(e.target.value)} className="w-full border rounded px-2 py-1 text-sm" /></div>
                        </div>
                        <div className="flex justify-end"><button disabled={loading} className="bg-primary text-white text-xs px-3 py-1.5 rounded disabled:opacity-50">Thêm Tròng</button></div>
                    </form>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {lenses.length === 0 ? <p className="text-xs text-muted text-center py-4">Chưa có tròng kính nào.</p> :
                            lenses.map(l => (
                                <div key={l.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                                    <div className="text-sm">
                                        <p className="font-medium">Tròng kính</p>
                                        <p className="text-xs text-muted">Cận(Cầu): {l.doCau || '0.00'} • Loạn(Trụ): {l.doTru || '0.00'} • CX: {l.chiSoKhucXa || 'N/A'} • Giá: +{l.price?.toLocaleString()}đ</p>
                                    </div>
                                    <button onClick={() => handleDeleteLens(l.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16} /></button>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </ModalShell>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [modal, setModal] = useState<Modal>({ type: "none" });
    const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(API);
            if (res.ok) setProducts(await res.json());
        } catch (e) {
            console.error("Failed to fetch products", e);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch(`${API}/categories`);
            if (res.ok) setCategories(await res.json());
        } catch (e) {
            console.error("Failed to fetch categories", e);
        }
    }, []);

    const fetchBrands = useCallback(async () => {
        try {
            const res = await fetch(`${API}/brands`);
            if (res.ok) setBrands(await res.json());
        } catch (e) {
            console.error("Failed to fetch brands", e);
        }
    }, []);

    const fetchPolicies = useCallback(async () => {
        try {
            const res = await fetch("http://localhost:5000/api/manager/policies");
            if (res.ok) setPolicies(await res.json());
        } catch (e) {
            console.error("Failed to fetch policies", e);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchBrands();
        fetchPolicies();
    }, [fetchProducts, fetchCategories, fetchBrands, fetchPolicies]);

    const handleDelete = async () => {
        if (!deleteProductId) return;
        try {
            const res = await fetch(`${API}/${deleteProductId}`, { method: "DELETE", headers: authHeaders() });
            if (res.ok) fetchProducts();
            else alert("Xóa thất bại.");
        } catch (e) {
            console.error(e);
        } finally {
            setDeleteProductId(null);
        }
    };

    const filteredProducts = products.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.brand?.name && p.brand.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const closeModal = () => setModal({ type: "none" });

    return (
        <>
            {/* ─── Modal Router ─── */}
            {(modal.type === "addProduct" || modal.type === "editProduct") && (
                <ProductFormModal
                    modal={modal}
                    categories={categories}
                    brands={brands}
                    policies={policies}
                    onClose={closeModal}
                    onSaved={fetchProducts}
                />
            )}
            {deleteProductId && (
                <ConfirmModal
                    message="Bạn có chắc chắn muốn xóa sản phẩm này?"
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteProductId(null)}
                />
            )}
            {modal.type === "categories" && (
                <CategoryModal
                    categories={categories}
                    onClose={closeModal}
                    onChanged={fetchCategories}
                    openAdd={() => setModal({ type: "addCategory" })}
                    openEdit={(c) => setModal({ type: "editCategory", category: c })}
                />
            )}
            {(modal.type === "addCategory" || modal.type === "editCategory") && (
                <CategoryFormModal
                    modal={modal}
                    onClose={() => setModal({ type: "categories" })}
                    onSaved={() => { fetchCategories(); setModal({ type: "categories" }); }}
                />
            )}
            {modal.type === "brands" && (
                <BrandModal
                    brands={brands}
                    onClose={closeModal}
                    onChanged={fetchBrands}
                    openAdd={() => setModal({ type: "addBrand" })}
                    openEdit={(b) => setModal({ type: "editBrand", brand: b })}
                />
            )}
            {(modal.type === "addBrand" || modal.type === "editBrand") && (
                <BrandFormModal
                    modal={modal}
                    onClose={() => setModal({ type: "brands" })}
                    onSaved={() => { fetchBrands(); setModal({ type: "brands" }); }}
                />
            )}
            {modal.type === "variants" && (
                <ProductVariantsModal
                    product={modal.product}
                    onClose={closeModal}
                    onRefresh={fetchProducts}
                />
            )}

            {/* ─── Page ─── */}
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-primary mb-2">Product Catalog</h1>
                        <p className="text-muted">Manage frames, lenses, and variant configurations.</p>
                    </div>
                    <button
                        onClick={() => setModal({ type: "addProduct" })}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-black transition-colors"
                    >
                        <Plus size={18} />
                        <span>Add Product</span>
                    </button>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-xl border border-border mb-6 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or brand..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.push("/manager/categories")}
                            className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-primary font-medium rounded-lg hover:bg-secondary/80 transition-colors text-sm"
                        >
                            <Tag size={15} />
                            Manage Categories
                        </button>
                        <button
                            onClick={() => router.push("/manager/brands")}
                            className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-primary font-medium rounded-lg hover:bg-secondary/80 transition-colors text-sm"
                        >
                            <Layers size={15} />
                            Manage Brands
                        </button>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-border p-4 animate-pulse h-64 flex flex-col justify-between">
                                <div className="w-full bg-secondary h-32 rounded-lg mb-4"></div>
                                <div className="w-3/4 bg-secondary h-4 rounded mb-2"></div>
                                <div className="w-1/2 bg-secondary h-4 rounded"></div>
                            </div>
                        ))
                    ) : filteredProducts.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-muted bg-white rounded-xl border border-border">
                            <Package size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-lg mb-2">No products found.</p>
                            <button
                                onClick={() => setModal({ type: "addProduct" })}
                                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition-colors text-sm"
                            >
                                <Plus size={16} /> Thêm sản phẩm đầu tiên
                            </button>
                        </div>
                    ) : (
                        filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-all group">
                                <div className="h-48 bg-secondary/30 relative flex items-center justify-center p-4">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className="max-h-full object-contain mix-blend-multiply" />
                                    ) : (
                                        <Package size={48} className="text-muted opacity-30" />
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${product.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                            {product.status === "Active" ? "Hoạt động" : "Dừng hoạt động"}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="text-xs text-accent font-bold mb-1 uppercase tracking-wider">
                                        {product.brand?.name || "Unknown Brand"}
                                    </div>
                                    <h3 className="text-lg font-heading font-bold text-primary mb-1 line-clamp-1" title={product.name}>
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-muted mb-4 line-clamp-2 min-h-[40px]">
                                        {product.description || "No description provided."}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-medium text-gray-500 bg-secondary px-2 py-1 rounded">
                                                {product.category?.name || "Uncategorized"}
                                            </span>
                                            <span className="text-sm font-bold text-primary">
                                                {product.unitPrice?.toLocaleString("vi-VN")} ₫
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setModal({ type: "variants", product })}
                                                className="px-2 py-1 text-xs font-medium bg-accent/10 text-accent rounded hover:bg-accent/20 transition-colors"
                                            >
                                                Cấu hình biến thể
                                            </button>
                                            <button
                                                onClick={() => setModal({ type: "editProduct", product })}
                                                className="p-1.5 text-muted hover:text-accent hover:bg-accent/10 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteProductId(product.id)}
                                                className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
