// /**
//  * Firebase Cloud Messaging (FCM)
//  *
//  * Global API — gọi từ bất kỳ đâu:
//  *   window.fcm.requestToken(vapidKey)              → Promise<string|null>
//  *   window.fcm.onMessage(callback)                 → Promise<unsubscribe fn>
//  *   window.fcm.subscribeToTopic(topic, vapidKey?)  → Promise<void>
//  *   window.fcm.sendNotification({ topic, title, body, data? }) → Promise<void>
//  *   window.fcm.ADMIN_TOPIC                         → 'admin-alerts'
//  *   window.fcm.ADMIN_USER_IDS                      → string[]
//  *
//  * VAPID Key: Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
//  * SW path: phải trùng với tên file SW thực tế trên web server
//  *
//  * Backend cần implement 2 endpoint:
//  *   POST lms/fcm/subscribe-topic  { token, topic }           → subscribe device vào topic
//  *   POST lms/fcm/send             { topic, title, body, data } → gửi push tới topic
//  *   (Xem functions/index.js để tham khảo logic Node.js)
//  */

// ;(function () {
//     // ─── Cấu hình ────────────────────────────────────────────────────────────
//     const ADMIN_TOPIC      = 'admin-alerts';
//     const ADMIN_USER_IDS   = ['NA0000022'];

//     const FIREBASE_VERSION = '12.12.1';
//     const CDN              = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;

//     const firebaseConfig = {
//         apiKey: 'AIzaSyBpukG13UMtmDHENh9i4fs8xytOrx5knLs',
//         authDomain: 'notilms-e405e.firebaseapp.com',
//         projectId: 'notilms-e405e',
//         storageBucket: 'notilms-e405e.firebasestorage.app',
//         messagingSenderId: '178371331854',
//         appId: '1:178371331854:web:b9deda442166fc70c9b95f',
//         measurementId: 'G-1MR45F1BPV',
//     };

//     // ─── Helpers ─────────────────────────────────────────────────────────────
//     function loadScript(src) {
//         return new Promise((resolve, reject) => {
//             if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
//             const s = document.createElement('script');
//             s.src = src; s.onload = resolve; s.onerror = reject;
//             document.head.appendChild(s);
//         });
//     }

//     // ─── Lazy SDK instances ───────────────────────────────────────────────────
//     let _messaging = null;
//     let _sdkReady  = null;

//     function ensureSDK() {
//         if (!_sdkReady) {
//             _sdkReady = loadScript(`${CDN}/firebase-app-compat.js`)
//                 .then(() => loadScript(`${CDN}/firebase-messaging-compat.js`))
//                 .then(() => {
//                     if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
//                     _messaging = firebase.messaging();
//                 });
//         }
//         return _sdkReady;
//     }


//     // ─── Service Worker ───────────────────────────────────────────────────────
//     let _swReg       = null;
//     let _cachedToken = null;

//     async function ensureServiceWorker() {
//         if (_swReg) return _swReg;
//         // 1. Thử file tĩnh tại web root
//         try {
//             _swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
//             return _swReg;
//         } catch (_) { /* file không tồn tại / sai MIME → fallback */ }
//         // 2. Inline blob SW — đủ để lấy token & nhận foreground notification
//         console.info('[FCM] /firebase-messaging-sw.js không có → dùng inline SW (foreground only)');
//         const swContent = [
//             `importScripts('${CDN}/firebase-app-compat.js');`,
//             `importScripts('${CDN}/firebase-messaging-compat.js');`,
//             `firebase.initializeApp(${JSON.stringify(firebaseConfig)});`,
//             `const messaging=firebase.messaging();`,
//             `messaging.onBackgroundMessage(p=>{`,
//             `  const t=p.notification?.title??'Thông báo mới';`,
//             `  const b=p.notification?.body??'';`,
//             `  const i=p.notification?.icon??'/favicon.ico';`,
//             `  self.registration.showNotification(t,{body:b,icon:i});`,
//             `});`,
//         ].join('\n');
//         const blob = new Blob([swContent], { type: 'application/javascript' });
//         _swReg = await navigator.serviceWorker.register(URL.createObjectURL(blob), { scope: '/' });
//         return _swReg;
//     }

//     async function getDeviceToken(vapidKey = '') {
//         if (_cachedToken) return _cachedToken;
//         await ensureSDK();
//         const swReg = await ensureServiceWorker();
//         _cachedToken = await _messaging.getToken({ vapidKey, serviceWorkerRegistration: swReg });
//         return _cachedToken;
//     }

//     // ─── Public API ───────────────────────────────────────────────────────────
//     window.fcm = {
//         ADMIN_TOPIC,
//         ADMIN_USER_IDS,

//         /**
//          * Yêu cầu quyền thông báo và trả về FCM device token.
//          * @param {string} vapidKey
//          * @returns {Promise<string|null>}
//          */
//         async requestToken(vapidKey = '') {
//             if (!('Notification' in window) || !('serviceWorker' in navigator)) {
//                 console.warn('[FCM] Trình duyệt không hỗ trợ Notification / ServiceWorker');
//                 return null;
//             }
//             const permission = await Notification.requestPermission();
//             if (permission !== 'granted') {
//                 console.warn('[FCM] Người dùng từ chối quyền thông báo');
//                 return null;
//             }
//             try {
//                 const token = await getDeviceToken(vapidKey);
//                 console.log('[FCM] Token:', token);
//                 return token;
//             } catch (err) {
//                 console.error('[FCM] Lấy token thất bại:', err);
//                 return null;
//             }
//         },

//         /**
//          * Lắng nghe tin nhắn foreground (khi app đang mở).
//          * @param {function} callback - nhận payload { notification, data }
//          * @returns {Promise<function>} unsubscribe function
//          */
//         async onMessage(callback) {
//             await ensureSDK();
//             return _messaging.onMessage(callback);
//         },

//         /**
//          * Subscribe thiết bị hiện tại vào một topic.
//          * Backend: POST lms/fcm/subscribe-topic { token, topic }
//          * @param {string} topic
//          * @param {string} vapidKey
//          */
//         async subscribeToTopic(topic, vapidKey = '') {
//             try {
//                 const token = await getDeviceToken(vapidKey);
//                 if (!token) { console.warn('[FCM] Không có token, bỏ qua subscribe'); return; }
//                 await fetchPromise('lms/fcm/subscribe-topic', { token, topic }, { cache: false, suppressError: true });
//                 console.log('[FCM] Subscribed to topic:', topic);
//             } catch (err) {
//                 console.error('[FCM] Subscribe topic thất bại:', err);
//             }
//         },

//         /**
//          * Gửi push notification đến một topic.
//          * Backend: POST lms/fcm/send { topic, title, body, data }
//          * Gọi từ bất kỳ component nào — không cần biết token người nhận.
//          * @param {{ topic: string, title: string, body?: string, data?: object }} options
//          */
//         async sendNotification({ topic, title, body = '', data = {} }) {
//             try {
//                 await fetchPromise('lms/fcm/send', { topic, title, body, data: JSON.stringify(data) }, { cache: false, suppressError: true });
//             } catch (err) {
//                 console.error('[FCM] Gửi thông báo thất bại:', err);
//             }
//         },
//     };
// }());
