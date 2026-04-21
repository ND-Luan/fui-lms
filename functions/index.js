/**
 * BACKEND REFERENCE — FCM V1 Push Notification
 * =============================================
 * Frontend gọi 2 endpoint qua fetchPromise:
 *   POST lms/fcm/subscribe-topic  { token, topic }
 *   POST lms/fcm/send             { topic, title, body, data }
 *
 * Backend cần:
 *   1. Service Account JSON (notilms-e405e-firebase-adminsdk-*.json)
 *   2. Xác thực OAuth2 để lấy Bearer token gọi FCM V1 API
 *
 * Node.js reference implementation (dùng firebase-admin):
 * ─────────────────────────────────────────────────────────
 *
 * const admin = require('firebase-admin');
 * const serviceAccount = require('./notilms-e405e-firebase-adminsdk.json');
 *
 * admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
 *
 * // POST lms/fcm/subscribe-topic
 * async function subscribeToTopic(token, topic) {
 *     await admin.messaging().subscribeToTopic(token, topic);
 * }
 *
 * // POST lms/fcm/send
 * async function sendToTopic(topic, title, body, data = {}) {
 *     await admin.messaging().send({
 *         topic,
 *         notification: { title, body },
 *         data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
 *         webpush: {
 *             notification: { title, body, icon: '/favicon.ico' },
 *         },
 *     });
 * }
 *
 * ─────────────────────────────────────────────────────────
 * FCM V1 REST (nếu backend không dùng Node — C#, PHP, ...):
 * ─────────────────────────────────────────────────────────
 * 1. Lấy access token:
 *    POST https://oauth2.googleapis.com/token
 *    grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer
 *    assertion=<JWT ký bằng service account private key>
 *    scope=https://www.googleapis.com/auth/firebase.messaging
 *
 * 2. Gửi message:
 *    POST https://fcm.googleapis.com/v1/projects/notilms-e405e/messages:send
 *    Authorization: Bearer <access_token>
 *    Content-Type: application/json
 *    {
 *      "message": {
 *        "topic": "admin-alerts",
 *        "notification": { "title": "...", "body": "..." }
 *      }
 *    }
 *
 * 3. Subscribe token vào topic:
 *    POST https://iid.googleapis.com/iid/v1/<token>/rel/topics/<topic>
 *    Authorization: Bearer <access_token>
 *    access_token_auth: true
 */
