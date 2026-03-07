"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Calendar, Clock, X, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

const API = "http://localhost:5000/api/manager/slots";
const TOKEN_KEY = "auth_token";

type Slot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string | null;
  note: string | null;
};

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) ?? "" : "";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

function toDateString(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatTime(t: string) {
  return t.slice(0, 5);
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-secondary transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="p-2 bg-red-100 rounded-full shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <p className="text-sm font-medium text-primary leading-relaxed">
            {message}
          </p>
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
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  id,
  ...props
}: { label: string; id: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-primary mb-1"
      >
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
      />
    </div>
  );
}

function SelectField({
  label,
  id,
  children,
  ...props
}: {
  label: string;
  id: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-primary mb-1"
      >
        {label}
      </label>
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

function TextareaField({
  label,
  id,
  ...props
}: {
  label: string;
  id: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-primary mb-1"
      >
        {label}
      </label>
      <textarea
        id={id}
        rows={2}
        {...props}
        className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none"
      />
    </div>
  );
}

// ─── Slot Form Modal ──────────────────────────────────────────────────────────

function SlotFormModal({
  slot,
  onClose,
  onSaved,
}: {
  slot?: Slot;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!slot;
  const [date, setDate] = useState(slot?.date ?? toDateString(new Date()));
  const [startTime, setStartTime] = useState(
    slot ? formatTime(slot.startTime) : "09:00"
  );
  const [endTime, setEndTime] = useState(
    slot ? formatTime(slot.endTime) : "09:30"
  );
  const [status, setStatus] = useState(slot?.status ?? "Available");
  const [note, setNote] = useState(slot?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = isEdit
        ? { date, startTime: startTime + ":00", endTime: endTime + ":00", status: status || null, note: note || null }
        : { date, startTime: startTime + ":00", endTime: endTime + ":00", status: status || "Available", note: note || null };
      const res = await fetch(isEdit ? `${API}/${slot!.id}` : API, {
        method: isEdit ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || res.statusText);
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title={isEdit ? "Sửa khung giờ" : "Thêm khung giờ mới"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <InputField
          label="Ngày *"
          id="slot-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-4 mb-4">
          <InputField
            label="Giờ bắt đầu *"
            id="slot-start"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <InputField
            label="Giờ kết thúc *"
            id="slot-end"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
        <SelectField
          label="Trạng thái"
          id="slot-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="Available">Trống</option>
          <option value="Booked">Đã đặt</option>
          <option value="Completed">Hoàn thành</option>
          <option value="Cancelled">Đã hủy</option>
        </SelectField>
        <TextareaField
          label="Ghi chú"
          id="slot-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-primary hover:bg-secondary transition-colors text-sm"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-black transition-colors text-sm disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SlotsPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(() => toDateString(new Date()));
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return toDateString(d);
  });
  const [modalSlot, setModalSlot] = useState<Slot | null | undefined>(
    undefined
  );
  const [deleteSlotId, setDeleteSlotId] = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API}?dateFrom=${dateFrom}&dateTo=${dateTo}`,
        { headers: authHeaders() }
      );
      if (res.ok) setSlots(await res.json());
      else setSlots([]);
    } catch (e) {
      console.error(e);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleDelete = async () => {
    if (!deleteSlotId) return;
    try {
      const res = await fetch(`${API}/${deleteSlotId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message || "Không thể xóa.");
      }
      setDeleteSlotId(null);
      fetchSlots();
    } catch (e) {
      alert((e as Error).message);
      setDeleteSlotId(null);
    }
  };

  const availableCount = slots.filter(
    (s) => s.status === "Available" || !s.status
  ).length;
  const bookedCount = slots.filter((s) => s.status === "Booked").length;

  return (
    <>
      {modalSlot !== undefined && (
        <SlotFormModal
          slot={modalSlot ?? undefined}
          onClose={() => setModalSlot(undefined)}
          onSaved={fetchSlots}
        />
      )}

      {deleteSlotId && (
        <ConfirmModal
          message="Bạn có chắc chắn muốn xóa khung giờ này?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteSlotId(null)}
        />
      )}

      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => router.back()}
                className="text-muted hover:text-primary transition-colors text-sm"
              >
                ← Dashboard
              </button>
              <span className="text-muted">/</span>
              <span className="text-sm font-medium text-primary">
                Khung giờ đặt lịch
              </span>
            </div>
            <h1 className="text-3xl font-heading font-bold text-primary mb-2">
              Quản lý khung giờ (Slots)
            </h1>
            <p className="text-muted">
              Tạo và quản lý các khung giờ để khách đặt lịch dịch vụ.
            </p>
          </div>
          <button
            onClick={() => setModalSlot(null)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-black transition-colors"
          >
            <Plus size={18} /> Thêm khung giờ
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Tổng slot", value: slots.length, color: "text-primary" },
            { label: "Trống", value: availableCount, color: "text-green-600" },
            { label: "Đã đặt", value: bookedCount, color: "text-amber-600" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-border p-5"
            >
              <p className="text-sm text-muted mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded-xl border border-border mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-primary">Từ ngày</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-primary">Đến ngày</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-muted">
              Đang tải...
            </div>
          ) : slots.length === 0 ? (
            <div className="py-16 text-center text-muted">
              <Calendar size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-base mb-3">Chưa có khung giờ nào trong khoảng ngày đã chọn.</p>
              <button
                onClick={() => setModalSlot(null)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition-colors text-sm"
              >
                <Plus size={16} /> Thêm khung giờ đầu tiên
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-primary">
                    Ngày
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-primary">
                    Giờ bắt đầu
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-primary">
                    Giờ kết thúc
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-primary">
                    Trạng thái
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-primary">
                    Ghi chú
                  </th>
                  <th className="w-24 py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {slots.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/20"
                  >
                    <td className="py-3 px-4 text-primary">{s.date}</td>
                    <td className="py-3 px-4 text-primary">
                      <Clock size={14} className="inline mr-1 text-muted" />
                      {formatTime(s.startTime)}
                    </td>
                    <td className="py-3 px-4 text-primary">
                      {formatTime(s.endTime)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.status === "Available" || !s.status
                            ? "bg-green-100 text-green-700"
                            : s.status === "Booked"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {s.status === "Available" || !s.status
                          ? "Trống"
                          : s.status === "Booked"
                            ? "Đã đặt"
                            : s.status || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted max-w-[160px] truncate">
                      {s.note || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModalSlot(s)}
                          className="p-1.5 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteSlotId(s.id)}
                          className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
