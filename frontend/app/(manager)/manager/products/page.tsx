"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Package } from "lucide-react";

type Category = { id: string; name: string };
type Brand = { id: string; name: string };

type Product = {
    id: string;
    categoryId: string;
    brandId: string;
    name: string;
    description: string;
    status: string;
    imageUrl: string;
    category?: Category;
    brand?: Brand;
};

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Add these when implementing full CRUD
    // const [categories, setCategories] = useState<Category[]>([]);
    // const [brands, setBrands] = useState<Brand[]>([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:5000/api/manager/products");
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/manager/products/${id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                fetchProducts();
            } else {
                alert("Failed to delete product");
            }
        } catch (error) {
            console.error("Error deleting product", error);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.brand?.name && p.brand.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-primary mb-2">Product Catalog</h1>
                    <p className="text-muted">Manage frames, lenses, and variant configurations.</p>
                </div>
                <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-black transition-colors">
                    <Plus size={18} />
                    <span>Add Product</span>
                </button>
            </div>

            {/* View Switching & Searching */}
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
                    <button className="px-4 py-2 bg-secondary text-primary font-medium rounded-lg hover:bg-secondary/80 transition-colors">
                        Manage Categories
                    </button>
                    <button className="px-4 py-2 bg-secondary text-primary font-medium rounded-lg hover:bg-secondary/80 transition-colors">
                        Manage Brands
                    </button>
                </div>
            </div>

            {/* Product List Grid */}
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
                        <p className="text-lg">No products found matching your search.</p>
                    </div>
                ) : (
                    filteredProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-all group">
                            <div className="h-48 bg-secondary/30 relative flex items-center justify-center p-4">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} className="max-h-full object-contain mix-blend-multiply" />
                                ) : (
                                    <Package size={48} className="text-muted opacity-30" />
                                )}
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <div className={`px-2 py-1 rounded text-xs font-semibold ${product.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                        {product.status}
                                    </div>
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

                                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                                    <span className="text-xs font-medium text-gray-500 bg-secondary px-2 py-1 rounded">
                                        {product.category?.name || "Uncategorized"}
                                    </span>

                                    <div className="flex gap-2">
                                        <button className="p-1.5 text-muted hover:text-accent hover:bg-accent/10 rounded transition-colors" title="Edit">
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                            title="Delete"
                                            onClick={() => handleDelete(product.id)}
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
    );
}
