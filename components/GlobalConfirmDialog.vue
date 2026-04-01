<template>
    <v-dialog v-model="visible" max-width="420" persistent>
        <v-card>
            <v-card-title class="d-flex align-center ga-2 pt-4" :class="titleClass">
                <v-icon :color="typeConfig.color">{{ typeConfig.icon }}</v-icon>
                {{ config.title }}
            </v-card-title>

            <v-card-text v-if="config.text" class="text-body-2">
                {{ config.text }}
            </v-card-text>

            <v-card-actions>
                <v-spacer />
                <v-btn v-if="typeConfig.showCancel" variant="text" @click="onCancel">
                    {{ config.cancelText || 'Đóng' }}
                </v-btn>
                <v-btn :color="typeConfig.color" variant="flat" @click="onConfirm">
                    {{ config.confirmText || 'Xác nhận' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'GlobalConfirmDialog',
    data() {
        return {
            visible: false,
            config: {
                title: '',
                text: '',
                type: 'confirm',
                confirmText: '',
                cancelText: '',
                action: null,
                cancel: null,
            },
            _resolve: null,
            TYPE_MAP: {
                confirm: { icon: 'mdi-help-circle-outline', color: 'primary', showCancel: true },
                alert: { icon: 'mdi-information-outline', color: 'info', showCancel: false },
                warning: { icon: 'mdi-alert-outline', color: 'warning', showCancel: true },
                info: { icon: 'mdi-information-outline', color: 'info', showCancel: true },
            }
        }
    },
    computed: {
        typeConfig() {
            return this.TYPE_MAP[this.config.type] ?? this.TYPE_MAP.confirm
        },
        titleClass() {
            return `text-${this.typeConfig.color}`
        },
    },
    methods: {
        show({ title = '', text = '', type = 'confirm', confirmText = '', cancelText = '', action = null, cancel = null } = {}) {
            this.config = { title, text, type, confirmText, cancelText, action, cancel }
            this.visible = true
            if (typeof action === 'function') return
            return new Promise(resolve => { this._resolve = resolve })
        },
        onConfirm() {
            this.visible = false
            if (typeof this.config.action === 'function') {
                this.config.action()
            } else if (this._resolve) {
                this._resolve(true)
                this._resolve = null
            }
        },
        onCancel() {
            this.visible = false
            if (typeof this.config.cancel === 'function') {
                this.config.cancel()
            } else if (this._resolve) {
                this._resolve(false)
                this._resolve = null
            }
        },
    },
}
</script>
