// Service Worker for Push Notifications
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()

    const options = {
      body: data.body,
      icon: data.icon || "/icon-192x192.png",
      badge: data.badge || "/badge-72x72.png",
      data: data.data || {},
      actions: data.actions || [
        {
          action: "view",
          title: "View Details",
        },
        {
          action: "dismiss",
          title: "Dismiss",
        },
      ],
      requireInteraction: true,
      tag: data.tag || "tabiazetu-notification",
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "view") {
    // Open the app
    event.waitUntil(clients.openWindow("/"))
  } else if (event.action === "dismiss") {
    // Just close the notification
    return
  } else {
    // Default action - open the app
    event.waitUntil(clients.openWindow("/"))
  }
})

self.addEventListener("notificationclose", (event) => {
  // Track notification dismissal if needed
  console.log("Notification closed:", event.notification.tag)
})
