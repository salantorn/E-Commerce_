// app/loading.tsx
export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-[100]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 animate-pulse" />
        <p className="text-sm font-medium text-text-muted animate-pulse">กำลังโหลด...</p>
      </div>
    </div>
  );
}
