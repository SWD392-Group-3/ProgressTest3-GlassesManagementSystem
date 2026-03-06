// Operation pages nằm trong route group (staff),
// layout cha (staff)/layout.tsx đã cung cấp sidebar.
// File này chỉ đóng vai trò pass-through, tránh chồng layout.
export default function OperationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
