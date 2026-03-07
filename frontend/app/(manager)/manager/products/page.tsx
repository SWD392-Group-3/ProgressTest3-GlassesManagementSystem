"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Search, Package, X, Tag, Layers } from "lucide-react";

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
    | { type: "editBrand"; brand: Brand };

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) ?? "" : "";

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

// ─── Sub-components ──────────────────────────────────────────────────────────

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
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
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const body = {
                ...(isEdit ? { id: p!.id } : {}),
                name,
                description: desc || null,
                unitPrice: parseFloat(price) || 0,
                categoryId: catId || null,
                brandId: brandId || null,
                warrantyPolicyId: policyId || null,
                status,
                imageUrl: imageUrl || null,
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
        <ModalShell title={isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <InputField label="Tên sản phẩm *" id="pname" value={name} onChange={(e) => setName(e.target.value)} required />
                <TextareaField label="Mô tả" id="pdesc" value={desc} onChange={(e) => setDesc(e.target.value)} />
                <InputField label="Giá (VND) *" id="pprice" type="number" min="0" step="1000" value={price} onChange={(e) => setPrice(e.target.value)} required />
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
                <SelectField label="Trạng thái" id="pstatus" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </SelectField>
                <InputField label="URL hình ảnh" id="pimage" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
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
    const handleDelete = async (id: string) => {
        if (!confirm("Xóa danh mục này?")) return;
        await fetch(`${API}/categories/${id}`, { method: "DELETE", headers: authHeaders() });
        onChanged();
    };
    return (
        <ModalShell title="Quản lý danh mục" onClose={onClose}>
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
                                <button onClick={() => handleDelete(c.id)} className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={15} /></button>
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
    const handleDelete = async (id: string) => {
        if (!confirm("Xóa thương hiệu này?")) return;
        await fetch(`${API}/brands/${id}`, { method: "DELETE", headers: authHeaders() });
        onChanged();
    };
    return (
        <ModalShell title="Quản lý thương hiệu" onClose={onClose}>
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
                                <button onClick={() => handleDelete(b.id)} className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={15} /></button>
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

    const handleDelete = async (id: string) => {
        if (!confirm("Xóa sản phẩm này?")) return;
        try {
            const res = await fetch(`${API}/${id}`, { method: "DELETE", headers: authHeaders() });
            if (res.ok) fetchProducts();
            else alert("Xóa thất bại.");
        } catch (e) {
            console.error(e);
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
                                                onClick={() => setModal({ type: "editProduct", product })}
                                                className="p-1.5 text-muted hover:text-accent hover:bg-accent/10 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
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
