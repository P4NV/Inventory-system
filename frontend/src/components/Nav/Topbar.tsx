export default function Topbar() {
  return (
    <div className="flex h-12 w-full items-center justify-start gap-10 border-b border-line bg-gray-200">
      <div className="flex h-full w-44 items-center justify-between bg-gray-700 px-4">
        <h1 className="text-sm text-white">User</h1>
        <span className="text-xs text-white">\/</span>
      </div>
      <div className="text-sm text-ink-soft">search</div>
      <div className="text-sm text-ink-soft">settings</div>
    </div>
  );
}
