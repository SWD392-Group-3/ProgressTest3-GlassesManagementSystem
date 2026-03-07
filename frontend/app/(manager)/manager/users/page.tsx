"use client";

import { useState, useEffect } from "react";
import { Search, User, Shield, Phone, Mail, UserPlus, X, Lock, LockOpen, AlertTriangle } from "lucide-react";

const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("auth_token") ?? "" : "";

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

type StaffUser = {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    role: string;
    status: string;
};

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({
    message,
    confirmLabel = "Xác nhận",
    confirmClass = "bg-orange-500 hover:bg-orange-600 text-white",
    onConfirm,
    onCancel,
}: {
    message: string;
    confirmLabel?: string;
    confirmClass?: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
                <div className="flex items-start gap-3 mb-5">
                    <div className="p-2 bg-orange-100 rounded-full shrink-0 mt-0.5">
                        <AlertTriangle size={20} className="text-orange-500" />
                    </div>
                    <p className="text-sm font-medium text-primary leading-relaxed">{message}</p>
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg border border-border text-primary text-sm hover:bg-gray-50 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${confirmClass}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UsersPage() {
    const [users, setUsers] = useState<StaffUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formError, setFormError] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
        phone: "",
        role: "Staff",
    });

    // Custom confirm modal state
    const [confirmOpts, setConfirmOpts] = useState<{
        message: string;
        confirmLabel: string;
        confirmClass: string;
        onConfirm: () => void;
    } | null>(null);

    const askConfirm = (opts: typeof confirmOpts) => setConfirmOpts(opts);
    const closeConfirm = () => setConfirmOpts(null);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:5000/api/manager/users", {
                headers: authHeaders(),
            });
            if (res.ok) setUsers(await res.json());
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormError("");
        setFormData({ email: "", password: "", fullName: "", phone: "", role: "Staff" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        try {
            const res = await fetch("http://localhost:5000/api/manager/users", {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                fetchUsers();
                handleCloseModal();

            } else {
                const text = await res.text();
                setFormError(text || "Tạo tài khoản thất bại.");
            }
        } catch (err) {
            console.error(err);
            setFormError("Đã xảy ra lỗi kết nối.");
        }
    };

    const handleToggleLock = (user: StaffUser) => {
        const newStatus = user.status === "Active" ? "Inactive" : "Active";
        const isLocking = newStatus === "Inactive";
        askConfirm({
            message: `Bạn có chắc muốn ${isLocking ? "khóa" : "mở khóa"} tài khoản "${user.fullName || user.email}"?`,
            confirmLabel: isLocking ? "Khóa tài khoản" : "Mở khóa",
            confirmClass: isLocking
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white",
            onConfirm: async () => {
                closeConfirm();
                const res = await fetch(
                    `http://localhost:5000/api/manager/users/${user.id}/status`,
                    { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ status: newStatus }) }
                );
                if (res.ok) fetchUsers();
            },
        });
    };

    const filteredUsers = users.filter(
        (u) =>
            u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        switch (role?.toLowerCase()) {
            case "admin":
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200"><Shield size={12} /> Admin</span>;
            case "manager":
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"><Shield size={12} /> Manager</span>;
            case "staff":
            case "sales":
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200"><User size={12} /> Sales</span>;
        }
    };

    return (
        <>
            {/* Custom confirm modal */}
            {confirmOpts && (
                <ConfirmModal
                    message={confirmOpts.message}
                    confirmLabel={confirmOpts.confirmLabel}
                    confirmClass={confirmOpts.confirmClass}
                    onConfirm={confirmOpts.onConfirm}
                    onCancel={closeConfirm}
                />
            )}

            <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-primary mb-2">Quản lý nhân viên</h1>
                        <p className="text-muted">Quản lý tài khoản và quyền truy cập nhân viên.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-black transition-colors"
                    >
                        <UserPlus size={18} />
                        <span>Thêm nhân viên</span>
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-xl border border-border mb-6 flex items-center gap-4 shadow-sm">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên hoặc email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-secondary/30"
                        />
                    </div>
                </div>

                {/* User Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-border p-6 flex gap-4 animate-pulse">
                                <div className="w-12 h-12 bg-secondary rounded-full shrink-0" />
                                <div className="flex-1">
                                    <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-secondary rounded w-1/2 mb-4" />
                                    <div className="h-4 bg-secondary rounded w-1/4" />
                                </div>
                            </div>
                        ))
                    ) : filteredUsers.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-muted bg-white rounded-xl border border-border">
                            <UsersIcon size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-lg">Không có tài khoản nào.</p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className={`bg-white rounded-xl border p-5 hover:shadow-md transition-all flex gap-4 ${user.status !== "Active" ? "border-red-200 opacity-75" : "border-border"
                                    }`}
                            >
                                <div className="w-12 h-12 rounded-full bg-secondary text-primary font-heading font-bold text-xl flex items-center justify-center shrink-0 border border-border/50">
                                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1 h-6">
                                        <h3 className="font-bold text-primary truncate max-w-[70%]">
                                            {user.fullName || "Unnamed User"}
                                        </h3>
                                        {getRoleBadge(user.role)}
                                    </div>

                                    <div className="space-y-1 mt-3">
                                        <div className="flex items-center gap-2 text-sm text-muted">
                                            <Mail size={14} className="shrink-0" />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted">
                                            <Phone size={14} className="shrink-0" />
                                            <span>{user.phone || "Chưa có số điện thoại"}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${user.status === "Active"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                            }`}>
                                            {user.status === "Active" ? "Hoạt động" : "Đã khóa"}
                                        </span>

                                        <button
                                            onClick={() => handleToggleLock(user)}
                                            title={user.status === "Active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${user.status === "Active"
                                                ? "text-orange-600 hover:bg-orange-50 border border-orange-200"
                                                : "text-green-600 hover:bg-green-50 border border-green-200"
                                                }`}
                                        >
                                            {user.status === "Active"
                                                ? <><Lock size={13} /> Khóa</>
                                                : <><LockOpen size={13} /> Mở khóa</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Sales Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-primary text-white">
                            <h2 className="text-xl font-heading font-bold">Thêm nhân viên mới</h2>
                            <button onClick={handleCloseModal} className="text-gray-300 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-primary mb-1">Họ và tên</label>
                                    <input
                                        type="text" required value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary mb-1">Email</label>
                                    <input
                                        type="email" required value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-1">Mật khẩu tạm</label>
                                        <input
                                            type="password" required minLength={6} value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-1">Số điện thoại</label>
                                        <input
                                            type="tel" value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary mb-1">Vai trò</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent bg-white"
                                    >
                                        <option value="Staff">Nhân viên bán hàng (Staff)</option>
                                        <option value="sales">Sales</option>
                                        <option value="customer_service">Customer Service</option>
                                        <option value="manager">Quản lý (Manager)</option>
                                        <option value="admin">Quản trị viên (Admin)</option>
                                        <option value="Customer">Khách hàng (Customer)</option>
                                    </select>
                                </div>
                                {formError && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        <AlertTriangle size={16} className="shrink-0" />
                                        {formError}
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-border text-primary font-medium rounded-lg hover:bg-secondary transition-colors">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-black transition-colors">Tạo tài khoản</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

// SVG Users icon
const UsersIcon = ({ size, className }: { size: number; className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
