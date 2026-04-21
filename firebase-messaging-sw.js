/**
 * Firebase Messaging Service Worker
 * Xử lý thông báo nền (background) khi app không mở.
 *
 * File này PHẢI đặt ở thư mục gốc web (web root) — cùng cấp với index.html.
 */

importScripts('https://www.gstatic.com/firebasejs/12.12.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.12.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBpukG13UMtmDHENh9i4fs8xytOrx5knLs",
    authDomain: "notilms-e405e.firebaseapp.com",
    projectId: "notilms-e405e",
    storageBucket: "notilms-e405e.firebasestorage.app",
    messagingSenderId: "178371331854",
    appId: "1:178371331854:web:b9deda442166fc70c9b95f",
    measurementId: "G-1MR45F1BPV",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title ?? 'Thông báo mới';
    const body  = payload.notification?.body  ?? '';
    const icon  = payload.notification?.icon  ?? '/favicon.ico';

    self.registration.showNotification(title, { body, icon });
});
