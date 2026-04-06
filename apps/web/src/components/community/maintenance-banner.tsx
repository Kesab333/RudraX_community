export function MaintenanceBanner() {
  return (
    <div className="maintenance-banner" role="status">
      <strong>Maintenance Mode</strong>
      <span>Writes are temporarily disabled. Browsing remains available in read-only mode.</span>
    </div>
  );
}
