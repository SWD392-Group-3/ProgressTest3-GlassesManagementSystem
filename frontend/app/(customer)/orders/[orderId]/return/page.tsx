"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Upload,
  X,
  AlertCircle,
  Package,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getUser } from "@/lib/auth-storage";
import { getOrderById, OrderDto, OrderItemDto } from "@/lib/api/order";
import {
  createReturnExchange,
  uploadReturnImages,
  CreateReturnExchangeItemRequest,
} from "@/lib/api/return-exchange";

function fmt(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

type UIItemData = {
  selected: boolean;
  orderItemId: string;
  isExchanged: boolean; // false = return (hoàn), true = exchange (đổi)
  quantity: number;
  reason: string;
  files: File[];
  maxQuantity: number;
};

export default function OrderReturnPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const router = useRouter();

  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [returnType, setReturnType] = useState<"Return" | "Exchange">("Return");
  const [globalReason, setGlobalReason] = useState("");
  const [itemForms, setItemForms] = useState<Record<string, UIItemData>>({});

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const data = await getOrderById(orderId);
      if (data.status !== "Delivered") {
        throw new Error("Chỉ có thể đổi trả cho đơn hàng Đã Giao (Delivered).");
      }
      const isServiceOrder =
        (data.shippingAddress == null || data.shippingAddress === "") &&
        (data.shippingPhone == null || data.shippingPhone === "");
      if (isServiceOrder) {
        throw new Error("Đơn dịch vụ không hỗ trợ yêu cầu đổi trả.");
      }
      setOrder(data);

      const initialForm: Record<string, UIItemData> = {};
      data.orderItems.forEach((item) => {
        initialForm[item.id] = {
          selected: false,
          orderItemId: item.id,
          isExchanged: false,
          quantity: 1,
          reason: "",
          files: [],
          maxQuantity: item.quantity,
        };
      });
      setItemForms(initialForm);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    fetchOrder();
  }, [fetchOrder, router]);

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setItemForms((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], selected: checked },
    }));
  };

  const updateItemField = (
    itemId: string,
    field: keyof UIItemData,
    value: any,
  ) => {
    setItemForms((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  };

  const handleFilesChange = (itemId: string, newFiles: FileList | null) => {
    if (!newFiles) return;
    const filesArray = Array.from(newFiles);
    setItemForms((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        files: [...prev[itemId].files, ...filesArray],
      },
    }));
  };

  const removeFile = (itemId: string, index: number) => {
    setItemForms((prev) => {
      const updatedFiles = [...prev[itemId].files];
      updatedFiles.splice(index, 1);
      return {
        ...prev,
        [itemId]: { ...prev[itemId], files: updatedFiles },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    // Validate
    const selectedItems = Object.values(itemForms).filter((i) => i.selected);
    if (selectedItems.length === 0) {
      setError("Vui lòng chọn ít nhất 1 sản phẩm để đổi/trả.");
      return;
    }
    for (const item of selectedItems) {
      if (!item.reason.trim()) {
        setError("Vui lòng nhập lý do cụ thể cho các sản phẩm đã chọn.");
        return;
      }
      if (item.files.length === 0) {
        setError("Vui lòng tải lên ít nhất 1 ảnh minh chứng cho sản phẩm lỗi.");
        return;
      }
    }
    if (!globalReason.trim()) {
      setError("Vui lòng nhập lý do tổng quan.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Prepare request items
      const requestItems: CreateReturnExchangeItemRequest[] = [];

      for (const item of selectedItems) {
        // Upload images first
        const formData = new FormData();
        item.files.forEach((f) => formData.append("files", f));
        const uploadedUrls = await uploadReturnImages(formData);

        requestItems.push({
          orderItemId: item.orderItemId,
          isReturned: returnType === "Return",
          isExchanged: returnType === "Exchange",
          quantity: item.quantity,
          reason: item.reason,
          images: uploadedUrls,
        });
      }

      // Create Return
      await createReturnExchange({
        orderId: order.id,
        type: returnType,
        reason: globalReason,
        items: requestItems,
      });

      router.push("/return-exchanges");
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F5F5F5] pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1A1A] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2 font-heading">
              Yêu cầu đổi / trả hàng
            </h1>
            <p className="text-sm text-[#6B7280] mb-8">
              Mã đơn: #{orderId?.slice(0, 8).toUpperCase()}
            </p>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
              </div>
            ) : error && !order ? (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                {error}
              </div>
            ) : order ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {/* Return Type & Global Reason */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Loại yêu cầu
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="returnType"
                          value="Return"
                          checked={returnType === "Return"}
                          onChange={(e) => setReturnType(e.target.value as any)}
                          className="w-4 h-4 text-[#D4AF37] focus:ring-[#D4AF37]"
                        />
                        <span className="text-sm font-medium">
                          Hoàn trả trực tiếp (Return)
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="returnType"
                          value="Exchange"
                          checked={returnType === "Exchange"}
                          onChange={(e) => setReturnType(e.target.value as any)}
                          className="w-4 h-4 text-[#D4AF37] focus:ring-[#D4AF37]"
                        />
                        <span className="text-sm font-medium">
                          Đổi mã mới (Exchange)
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Nguyên nhân tổng quan
                    </label>
                    <textarea
                      value={globalReason}
                      onChange={(e) => setGlobalReason(e.target.value)}
                      placeholder="Giao sai thông số, sản phẩm bị trầy xước..."
                      rows={3}
                      className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm resize-none"
                    />
                  </div>
                </div>

                {/* Items selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#1A1A1A] pb-2 border-b border-[#E5E7EB]">
                    Chọn sản phẩm lỗi
                  </h3>

                  {order.orderItems.map((item) => {
                    const uiData = itemForms[item.id];
                    if (!uiData) return null;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border ${
                          uiData.selected
                            ? "border-[#D4AF37] bg-yellow-50/10"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <input
                            aria-label={`Chọn sản phẩm ${item.id}`}
                            type="checkbox"
                            checked={uiData.selected}
                            onChange={(e) =>
                              handleSelectItem(item.id, e.target.checked)
                            }
                            className="mt-1 w-4 h-4 text-[#D4AF37] rounded focus:ring-[#D4AF37] cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-sm">
                                  Sản phẩm kính / phụ kiện
                                </p>
                                <p className="text-xs text-gray-500">
                                  ID: {item.id.slice(0, 8)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Đã mua: {item.quantity}
                                </p>
                              </div>
                              <p className="text-sm font-bold text-[#D4AF37]">
                                {fmt(item.unitPrice)}
                              </p>
                            </div>

                            {uiData.selected && (
                              <div className="mt-4 pt-4 border-t border-gray-200/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                      Số lượng lỗi
                                    </label>
                                    <input
                                      aria-label="Số lượng lỗi"
                                      type="number"
                                      min="1"
                                      max={uiData.maxQuantity}
                                      value={uiData.quantity}
                                      onChange={(e) =>
                                        updateItemField(
                                          item.id,
                                          "quantity",
                                          parseInt(e.target.value),
                                        )
                                      }
                                      className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-[#D4AF37] outline-none"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                      Lý do cụ thể (bắt buộc)
                                    </label>
                                    <input
                                      aria-label="Lý do cụ thể"
                                      type="text"
                                      value={uiData.reason}
                                      onChange={(e) =>
                                        updateItemField(
                                          item.id,
                                          "reason",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Ví dụ: Lỗi xước gọng..."
                                      className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-[#D4AF37] outline-none"
                                    />
                                  </div>
                                </div>

                                {/* Upload ảnh */}
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                                    Hình ảnh minh chứng (ít nhất 1 ảnh)
                                  </label>

                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {uiData.files.map((file, idx) => (
                                      <div
                                        key={idx}
                                        className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200 group"
                                      >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={URL.createObjectURL(file)}
                                          alt="preview"
                                          className="w-full h-full object-cover"
                                        />
                                        <button
                                          aria-label={`Xóa ảnh ${idx}`}
                                          type="button"
                                          onClick={() =>
                                            removeFile(item.id, idx)
                                          }
                                          className="absolute top-0 right-0 p-1 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                    <label className="w-16 h-16 rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                                      <Upload className="w-4 h-4 text-gray-400 mb-1" />
                                      <span className="text-[10px] text-gray-500">
                                        Tải lên
                                      </span>
                                      <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) =>
                                          handleFilesChange(
                                            item.id,
                                            e.target.files,
                                          )
                                        }
                                      />
                                    </label>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Nộp */}
                <div className="pt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-12 px-8 rounded-full bg-[#1A1A1A] text-white font-semibold flex items-center gap-2 hover:bg-black transition-colors disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Gửi yêu cầu ngay
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
