"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Tag, Percent, Clock, Box } from "lucide-react";

type Promotion = {
    id: string;
    code: string;
    description: string;
    discountType: string;
    discountValue: number;
    startDate: string;
    endDate: string;
    status: string;
};

export default function PromotionsPage() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"promotions" | "combos" | "services">("promotions");

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:5000/api/manager/pricing/promotions");
            if (res.ok) {
                const data = await res.json();
                setPromotions(data);
            }
        } catch (error) {
            console.error("Failed to fetch promotions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this promotion?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/manager/pricing/promotions/${id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                fetchPromotions();
            } else {
                alert("Failed to delete promotion");
            }
        } catch (error) {
            console.error("Error deleting promotion", error);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-primary mb-2">Pricing & Promotions</h1>
                    <p className="text-muted">Manage store discounts, combos, and service pricings.</p>
                </div>
                <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-black transition-colors">
                    <Plus size={18} />
                    <span>Create New</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-border mb-6">
                <button
                    onClick={() => setActiveTab("promotions")}
                    className={`pb-3 font-medium transition-colors ${activeTab === "promotions" ? "text-accent border-b-2 border-accent" : "text-muted hover:text-primary"}`}
                >
                    Promotions & Discounts
                </button>
                <button
                    onClick={() => setActiveTab("combos")}
                    className={`pb-3 font-medium transition-colors ${activeTab === "combos" ? "text-accent border-b-2 border-accent" : "text-muted hover:text-primary"}`}
                >
                    Product Combos
                </button>
                <button
                    onClick={() => setActiveTab("services")}
                    className={`pb-3 font-medium transition-colors ${activeTab === "services" ? "text-accent border-b-2 border-accent" : "text-muted hover:text-primary"}`}
                >
                    Services (e.g. Eye Test)
                </button>
            </div>

            {/* Content Area */}
            {activeTab === "promotions" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-border p-6 animate-pulse">
                                <div className="w-1/3 bg-secondary h-6 rounded mb-4"></div>
                                <div className="w-2/3 bg-secondary h-4 rounded mb-2"></div>
                                <div className="w-1/2 bg-secondary h-4 rounded mt-6"></div>
                            </div>
                        ))
                    ) : promotions.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-muted bg-white rounded-xl border border-border">
                            <Tag size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-lg">No active promotions found.</p>
                        </div>
                    ) : (
                        promotions.map(promo => {
                            const isPercentage = promo.discountType.toLowerCase() === "percentage";
                            const isActive = promo.status === "Active";

                            return (
                                <div key={promo.id} className={`bg-white rounded-xl border ${isActive ? "border-accent/30 shadow-sm" : "border-border"} p-6 relative hover:shadow-md transition-shadow group flex flex-col`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent font-bold uppercase tracking-wider text-sm rounded-md border border-accent/20">
                                            <Tag size={14} />
                                            {promo.code}
                                        </div>
                                        <div className={`text-xs font-semibold px-2 py-1 rounded ${isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                            {promo.status}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-primary mb-1">
                                        {isPercentage ? (
                                            <span className="flex items-center gap-1 text-red-500">
                                                {promo.discountValue}<Percent size={20} /> OFF
                                            </span>
                                        ) : (
                                            <span className="text-red-500">
                                                ${promo.discountValue} OFF
                                            </span>
                                        )}
                                    </h3>

                                    <p className="text-sm text-gray-600 mb-6 flex-1">
                                        {promo.description || "Special discount code applies to eligible items."}
                                    </p>

                                    <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            <span>
                                                {new Date(promo.startDate).toLocaleDateString()} -
                                                {new Date(promo.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="text-muted hover:text-accent transition-colors"><Edit2 size={16} /></button>
                                            <button className="text-muted hover:text-red-500 transition-colors" onClick={() => handleDelete(promo.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {activeTab === "combos" && (
                <div className="py-12 text-center text-muted bg-white rounded-xl border border-border">
                    <Box size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-lg">Combo configurations will appear here.</p>
                </div>
            )}

            {activeTab === "services" && (
                <div className="py-12 text-center text-muted bg-white rounded-xl border border-border">
                    <p className="text-lg">Additional store services (e.g. eye exams) will appear here.</p>
                </div>
            )}

        </div>
    );
}
