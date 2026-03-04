"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, User, Shield, Phone, Mail, UserPlus, X } from "lucide-react";

type StaffUser = {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    role: string;
    status: string;
};

export default function UsersPage() {
    const [users, setUsers] = useState<StaffUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // For simplicity in this mock-up
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
        phone: "",
        role: "staff"
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:5000/api/manager/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:5000/api/manager/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchUsers();
                handleCloseModal();
                setFormData({ email: "", password: "", fullName: "", phone: "", role: "staff" });
            } else {
                alert("Failed to create user account.");
            }
        } catch (error) {
            console.error("Error saving user", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this user account?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/manager/users/${id}`, { method: "DELETE" });
            if (res.ok) fetchUsers();
        } catch (error) {
            console.error("Error deleting user", error);
        }
    };

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200"><Shield size={12} /> Admin</span>;
            case 'manager':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"><Shield size={12} /> Manager</span>;
            case 'staff':
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200"><User size={12} /> Staff</span>;
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-primary mb-2">User & Staff Management</h1>
                    <p className="text-muted">Manage system access, employee accounts, and roles.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-black transition-colors"
                >
                    <UserPlus size={18} />
                    <span>Add Staff</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl border border-border mb-6 flex items-center gap-4 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-secondary/30"
                    />
                </div>
            </div>

            {/* User List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-border p-6 flex gap-4 animate-pulse">
                            <div className="w-12 h-12 bg-secondary rounded-full shrink-0"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-secondary rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-secondary rounded w-1/2 mb-4"></div>
                                <div className="h-4 bg-secondary rounded w-1/4"></div>
                            </div>
                        </div>
                    ))
                ) : filteredUsers.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted bg-white rounded-xl border border-border">
                        <Users size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg">No user accounts found.</p>
                    </div>
                ) : (
                    filteredUsers.map(user => (
                        <div key={user.id} className="bg-white rounded-xl border border-border p-5 hover:border-accent hover:shadow-md transition-all group flex gap-4">
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
                                        <span>{user.phone || "No phone provided"}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${user.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                        {user.status || "Active"}
                                    </span>

                                    <div className="flex gap-2">
                                        <button className="p-1 text-muted hover:text-accent disabled:opacity-50 transition-colors" title="Edit">
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className="p-1 text-muted hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                            title="Delete Account"
                                            onClick={() => handleDelete(user.id)}
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

            {/* Create Staff Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-primary text-white">
                            <h2 className="text-xl font-heading font-bold">Register New Staff Account</h2>
                            <button onClick={handleCloseModal} className="text-gray-300 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-primary mb-1">Full Name</label>
                                    <input
                                        type="text" required value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-primary mb-1">Email</label>
                                        <input
                                            type="email" required value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-1">Temporary Password</label>
                                        <input
                                            type="password" required minLength={6} value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-1">Phone</label>
                                        <input
                                            type="tel" value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary mb-1">Role Assignment</label>
                                    <select
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                    >
                                        <option value="staff">Sales Staff</option>
                                        <option value="customer_service">Customer Service</option>
                                        <option value="manager">Store Manager</option>
                                        <option value="admin">System Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-border text-primary font-medium rounded-lg hover:bg-secondary transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors">Create Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Re-using the lucide icon component manually since it failed imported above if it wasn't there
const Users = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
