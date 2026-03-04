"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";

type WarrantyPolicy = {
    id: string;
    name: string;
    description: string;
    durationMonths: number;
    termsAndConditions: string;
};

export default function PoliciesPage() {
    const [policies, setPolicies] = useState<WarrantyPolicy[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<WarrantyPolicy | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        durationMonths: 6,
        termsAndConditions: ""
    });

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:5000/api/manager/policies");
            if (res.ok) {
                const data = await res.json();
                setPolicies(data);
            }
        } catch (error) {
            console.error("Failed to fetch policies", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (policy?: WarrantyPolicy) => {
        if (policy) {
            setEditingPolicy(policy);
            setFormData({
                name: policy.name,
                description: policy.description || "",
                durationMonths: policy.durationMonths,
                termsAndConditions: policy.termsAndConditions || ""
            });
        } else {
            setEditingPolicy(null);
            setFormData({ name: "", description: "", durationMonths: 6, termsAndConditions: "" });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingPolicy
                ? `http://localhost:5000/api/manager/policies/${editingPolicy.id}`
                : `http://localhost:5000/api/manager/policies`;

            const method = editingPolicy ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchPolicies();
                handleCloseModal();
            } else {
                alert("Failed to save policy");
            }
        } catch (error) {
            console.error("Error saving policy", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this policy?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/manager/policies/${id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                fetchPolicies();
            } else {
                alert("Failed to delete policy");
            }
        } catch (error) {
            console.error("Error deleting policy", error);
        }
    };

    const filteredPolicies = policies.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-primary mb-2">Policy Management</h1>
                    <p className="text-muted">Manage warranty, return, and exchange policies.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-black transition-colors"
                >
                    <Plus size={18} />
                    <span>Create Policy</span>
                </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-xl border border-border mb-6 flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search policies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                    />
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary/50 border-b border-border text-sm text-primary uppercase font-medium">
                                <th className="px-6 py-4">Policy Name</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4 flex justify-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted animate-pulse">
                                        Loading policies...
                                    </td>
                                </tr>
                            ) : filteredPolicies.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted">
                                        No policies found.
                                    </td>
                                </tr>
                            ) : (
                                filteredPolicies.map(policy => (
                                    <tr key={policy.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-primary">{policy.name}</div>
                                            <div className="text-xs text-muted mt-1 truncate max-w-xs">{policy.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {policy.durationMonths} Months
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700 max-w-md truncate">
                                                {policy.description || "No description"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 flex items-center justify-end gap-3 text-sm">
                                            <button
                                                onClick={() => handleOpenModal(policy)}
                                                className="text-muted hover:text-accent p-1 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(policy.id)}
                                                className="text-muted hover:text-red-500 p-1 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary/30">
                            <h2 className="text-xl font-heading font-bold text-primary">
                                {editingPolicy ? "Edit Policy" : "Create New Policy"}
                            </h2>
                            <button onClick={handleCloseModal} className="text-muted hover:text-primary">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-primary mb-1">Policy Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                        placeholder="e.g., 6 Months Premium Warranty"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-primary mb-1">Duration (Months) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.durationMonths}
                                        onChange={(e) => setFormData({ ...formData, durationMonths: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-primary mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                        placeholder="Short description..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-primary mb-1">Terms & Conditions</label>
                                    <textarea
                                        rows={4}
                                        value={formData.termsAndConditions}
                                        onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none"
                                        placeholder="Detailed terms and conditions..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border border-border text-primary font-medium rounded-lg hover:bg-secondary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors"
                                >
                                    {editingPolicy ? "Save Changes" : "Create Policy"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
