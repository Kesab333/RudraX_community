import { CommunityShell } from "@/components/community/community-shell";
import { getNotifications } from "@/lib/api";

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <CommunityShell
      title="Notifications"
      subtitle="In-app delivery is a required part of the MVP and remains available even when email is disabled."
    >
      <section className="rail-card">
        {notifications.length > 0 ? (
          <ul className="notification-list">
            {notifications.map((notification) => (
              <li key={notification.id} className={notification.readAt ? "notification-item read" : "notification-item"}>
                <strong>{notification.type}</strong>
                <p>{notification.message}</p>
                <span>{new Date(notification.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <h2>No notifications yet</h2>
            <p>Wire authenticated delivery from /api/v1/notifications to populate this inbox.</p>
          </>
        )}
      </section>
    </CommunityShell>
  );
}
