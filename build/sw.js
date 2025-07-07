/* eslint-disable no-restricted-globals */


// sw.js
self.addEventListener("push", (event) => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: "/icon.png", // optional
    badge: "/badge.png", // optional
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Yangi xabar", options)
  );
});
