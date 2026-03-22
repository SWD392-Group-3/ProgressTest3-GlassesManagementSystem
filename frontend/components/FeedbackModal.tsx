"use client";

import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { createFeedback } from "@/lib/api/feedback";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  orderItemId: string;
  productName: string;
  onSuccess: () => void;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  productId,
  orderItemId,
  productName,
  onSuccess,
}: FeedbackModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit() {
    if (rating < 1 || rating > 5) {
      alert("Vui lòng chọn số sao hợp lệ (1-5).");
      return;
    }

    setLoading(true);
    try {
      await createFeedback({
        productId,
        orderItemId,
        rating,
        comment,
      });
      // Optionally notify local state
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.message || "Có lỗi xảy ra khi gửi đánh giá.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Đánh giá sản phẩm</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Bạn đang đánh giá cho: <span className="font-semibold text-black">{productName}</span>
        </p>

        <div className="mb-6 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`p-1 transition-all hover:scale-110 ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              <Star className="w-10 h-10" fill="currentColor" stroke="currentColor" />
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Chia sẻ cảm nhận của bạn (Tùy chọn)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] text-sm text-gray-800 p-3 h-28 resize-none"
            placeholder="Sản phẩm dùng tốt không? Có đáng mua không?"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 rounded-full bg-[#D4AF37] text-white font-medium hover:bg-[#C9A030] transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Gửi đánh giá
          </button>
        </div>
      </div>
    </div>
  );
}
