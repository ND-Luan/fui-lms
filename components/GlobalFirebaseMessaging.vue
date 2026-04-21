<template>
    
</template>

<script>
export default {
    name: 'GlobalFirebaseMessaging',
    inject: ['snackbarRef'],
    data() {
        return {
            _unsubscribe: null,
            FCM_VAPID_KEY: 'BOQEQWQoxX159NCnw_hadCAkP0EbslxpGb0RZP0CzPma60lUGlnYxKMjdLBdnJaOfCDKa3KNXr7lr1bmqVWLXc0',
        }
    },
    async mounted() {
        if (!window.fcm) {
            console.warn('[FCM] firebase-messaging.js chưa được load');
            return;
        }
        try {
            const token = await window.fcm.requestToken(this.FCM_VAPID_KEY);

            if (!token) {
                if (Notification.permission === 'denied') {
                    this.snackbarRef?.value?.showSnackbar({
                        message: 'Thông báo đang bị chặn. Vào cài đặt trình duyệt (🔒 trên thanh địa chỉ) → cho phép Thông báo, rồi tải lại trang.',
                        type: 'warning',
                        timeout: 12000,
                    });
                }
                return;
            }

            vueData.fcmToken = token;

            // Nếu là admin → subscribe topic nhận báo lỗi
            if (window.fcm.ADMIN_USER_IDS.includes(vueData.user?.UserID)) {
                window.fcm.subscribeToTopic(window.fcm.ADMIN_TOPIC, this.FCM_VAPID_KEY);
            }

            // Lắng nghe thông báo foreground (khi app đang mở)
            this._unsubscribe = await window.fcm.onMessage((payload) => {
                const title = payload.notification?.title ?? 'Thông báo mới';
                const body = payload.notification?.body ?? '';
                this.snackbarRef?.value?.showSnackbar({
                    message: body ? `${title}: ${body}` : title,
                    type: 'info',
                    timeout: 6000,
                });
            });
        } catch (err) {
            console.error('[FCM] Khởi tạo thất bại:', err);
        }
    },
    beforeUnmount() {
        if (typeof this._unsubscribe === 'function') this._unsubscribe();
    },
}
</script>
