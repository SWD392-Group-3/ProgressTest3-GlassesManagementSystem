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
import {
  getOrderById,
  OrderDto,
  isOrderItemReturnEligible,
  orderHasReturnEligibleItems,
} from "@/lib/api/order";
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
      if (data.status === "Returned") {
        throw new Error(
          "This order has been fully returned. Return or exchange is no longer available."
        );
      }
      if (
        data.status !== "Delivered" &&
        data.status !== "Completed" &&
        data.status !== "PartiallyReturned"
      ) {
        throw new Error(
          "Return/exchange is only available for Delivered, Completed, or partially returned orders."
        );
      }
      if (!orderHasReturnEligibleItems(data)) {
        throw new Error(
          "Return/exchange only applies to orders that include products or lenses. Service-only lines (e.g. consultation) are not eligible."
        );
      }
      setOrder(data);

      const initialForm: Record<string, UIItemData> = {};
      data.orderItems.forEach((item) => {
        if (!isOrderItemReturnEligible(item)) return;
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
      setError("Please select at least one product to return or exchange.");
      return;
    }
    for (const item of selectedItems) {
      if (!item.reason.trim()) {
        setError("Please enter a specific reason for each selected product.");
        return;
      }
      if (item.files.length === 0) {
        setError("Please upload at least one evidence photo for the defective product.");
        return;
      }
    }
    if (!globalReason.trim()) {
      setError("Please enter the overall reason.");
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
          imageUrls: uploadedUrls,
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
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2 font-heading">
              Return / Exchange request
            </h1>
            <p className="text-sm text-[#6B7280] mb-8">
              Order ID: #{orderId?.slice(0, 8).toUpperCase()}
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
                      Request type
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
                          Direct return (Return)
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
                          Exchange for new item (Exchange)
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Overall reason
                    </label>
                    <textarea
                      value={globalReason}
                      onChange={(e) => setGlobalReason(e.target.value)}
                      placeholder="Wrong specs delivered, product scratched..."
                      rows={3}
                      className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm resize-none"
                    />
                  </div>
                </div>

                {/* Items selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#1A1A1A] pb-2 border-b border-[#E5E7EB]">
                    Select defective product(s)
                  </h3>

                  {order.orderItems.filter(isOrderItemReturnEligible).map((item) => {
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
                            aria-label={`Select product ${item.id}`}
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
                                  Glasses / accessory
                                </p>
                                <p className="text-xs text-gray-500">
                                  ID: {item.id.slice(0, 8)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Purchased: {item.quantity}
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
                                      Defective quantity
                                    </label>
                                    <input
                                      aria-label="Defective quantity"
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
                                      Specific reason (required)
                                    </label>
                                    <input
                                      aria-label="Specific reason"
                                      type="text"
                                      value={uiData.reason}
                                      onChange={(e) =>
                                        updateItemField(
                                          item.id,
                                          "reason",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="e.g. Frame scratch..."
                                      className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-[#D4AF37] outline-none"
                                    />
                                  </div>
                                </div>

                                {/* Upload ảnh */}
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                                    Evidence photos (at least 1)
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
                                          aria-label={`Remove photo ${idx}`}
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
                                        Upload
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
                    Submit request
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
