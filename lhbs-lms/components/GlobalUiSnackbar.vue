<template>
    <span>
        <slot :show="showSnackbar" :showPromise="showPromise" />
        
        <v-snackbar
            v-for="msg in visibleMessages"
            :key="msg.id"
            v-model="msg.visible"
            :color="msg.color"
            :timeout="msg.timeout"
            :timer="msg.timer"
            location="top end"
        >
            <div class="d-flex align-center ga-2">
                <v-icon v-if="msg.prependIcon" :class="msg.spinning ? 'mdi-spin' : ''">
                    {{ msg.prependIcon }}
                </v-icon>
                {{ msg.text }}
            </div>
            <template #actions>
                <v-btn variant="text" icon="mdi-close" size="small" @click="msg.visible = false" />
            </template>
        </v-snackbar>
    </span>
</template>

<script>
export default {
    name: 'GlobalUiSnackbar',
    data() {
        return {
            PRESETS: {
                error:   { color: 'error',   icon: 'mdi-alert-circle-outline',  timeout: 5000, timer: 'white', reverseTimer: true  },
                success: { color: 'success', icon: 'mdi-check-circle-outline',  timeout: 2000, timer: 'white', reverseTimer: false },
                warning: { color: 'warning', icon: 'mdi-alert-outline',         timeout: 4000, timer: 'white', reverseTimer: false },
                info:    { color: 'info',    icon: 'mdi-information-outline',   timeout: 3000, timer: 'white', reverseTimer: false },
            },
            messages: [],
        }
    },

    computed: {
        visibleMessages() {
            return this.messages.filter(m => m.visible)
        }
    },

    methods: {
        showSnackbar({ message = '', type = 'info', color, icon, timeout, timer } = {}) {
            const preset = this.PRESETS[type] ?? this.PRESETS.info
            this.messages.push({
                id: this._genId(),
                visible: true,
                text: message,
                color: color ?? preset.color,
                prependIcon: icon ?? preset.icon,
                timeout: timeout ?? preset.timeout,
                timer: timer ?? preset.timer,
            })
        },

        showPromise(promise, {
            loadingText = 'Đang xử lý...',
            onSuccess = () => ({ text: 'Thành công!', color: 'success', prependIcon: 'mdi-check-circle-outline', timeout: 2000 }),
            onError = (err) => ({ text: `Lỗi: ${err?.message ?? 'Không xác định'}`, color: 'error', prependIcon: 'mdi-alert-circle-outline', timeout: 5000 }),
        } = {}) {
            const id = this._genId()
            // Push loading msg
            this.messages.push({
                id,
                visible: true,
                text: loadingText,
                color: 'info',
                prependIcon: 'mdi-loading',
                spinning: true,
                timeout: -1, // giữ mãi cho đến khi replace
            })

            promise
                .then(() => this._replaceMessage(id, { ...onSuccess(), spinning: false }))
                .catch((err) => this._replaceMessage(id, { ...onError(err), spinning: false }))
        },

        _replaceMessage(id, newMsg) {
            const msg = this.messages.find(m => m.id === id)
            if (!msg) return
            // Ẩn snackbar cũ
            msg.visible = false
            // Push snackbar mới sau khi animation ẩn xong
            setTimeout(() => {
                this.messages.push({
                    ...newMsg,
                    id: this._genId(),
                    visible: true,
                })
            }, 300)
        },

        _genId() {
            return `snackbar_${Date.now()}_${Math.random().toString(36).slice(2)}`
        },

        clearAll() {
            this.messages.forEach(m => m.visible = false)
        },
    },
}
</script>