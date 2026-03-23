"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star, 
  Search,
  MessageSquare
} from "lucide-react";
import { 
  getAllFeedbacks, 
  approveFeedback, 
  rejectFeedback, 
  FeedbackResponse 
} from "@/lib/api/feedback";

export default function FeedbackManagementPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await getAllFeedbacks();
      setFeedbacks(data);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn duyệt đánh giá này?")) return;
    try {
      await approveFeedback(id);
      await fetchFeedbacks();
    } catch (error) {
      alert("Lỗi khi duyệt đánh giá: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn từ chối đánh giá này?")) return;
    try {
      await rejectFeedback(id);
      await fetchFeedbacks();
    } catch (error) {
      alert("Lỗi khi từ chối đánh giá: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesSearch = 
      f.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.comment && f.comment.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === "All" || f.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><CheckCircle size={12} /> Approved</span>;
      case "Rejected":
        return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><Clock size={12} /> Pending</span>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-1 font-heading">Quản lý Đánh giá</h1>
          <p className="text-muted text-sm">Quản lý và kiểm duyệt các phản hồi từ khách hàng.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border bg-secondary/10 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="Tìm theo tên khách hàng hoặc nội dung..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/50"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="Pending">Đang chờ</option>
              <option value="Approved">Đã duyệt</option>
              <option value="Rejected">Đã từ chối</option>
            </select>
          </div>
        </div>

        {/* Table/List */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center text-muted">Đang tải đánh giá...</div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="py-20 text-center text-muted">Không tìm thấy đánh giá nào.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/20">
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider border-b border-border">Khách hàng</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider border-b border-border">Đánh giá</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider border-b border-border w-1/3">Nhận xét</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider border-b border-border">Ngày tạo</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider border-b border-border">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider border-b border-border">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFeedbacks.map((f) => (
                  <tr key={f.id} className="hover:bg-secondary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-primary text-sm">{f.customerName}</div>
                      <div className="text-xs text-muted mt-0.5">ID: {f.id.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-0.5 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < f.rating ? "currentColor" : "none"} strokeWidth={i < f.rating ? 0 : 2} className={i < f.rating ? "" : "text-gray-300"} />
                        ))}
                      </div>
                      <span className="text-xs font-medium ml-1 text-primary">{f.rating}/5</span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex gap-2 items-start">
                            <MessageSquare size={16} className="text-muted mt-1 shrink-0" />
                            <p className="text-sm text-primary leading-relaxed italic">
                                {f.comment || <span className="text-muted opacity-50 font-normal not-italic">Không có nội dung</span>}
                            </p>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                        {new Date(f.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(f.status)}
                    </td>
                    <td className="px-6 py-4">
                      {f.status === "Pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(f.id)}
                            className="p-1.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all"
                            title="Duyệt"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleReject(f.id)}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                            title="Từ chối"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}
                      {f.status !== "Pending" && (
                          <span className="text-xs text-muted italic">Đã xử lý</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
