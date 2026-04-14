<template>
    <span>
        <slot :open="openWindow" />

        <v-dialog
            :model-value="stack.length > 0"
            :max-width="current?.width"
            :fullscreen="current?.fullscreen || $vuetify.display.smAndDown"
            scrollable
            transition="dialog-bottom-transition"
            persistent
        >
            <v-card v-if="current" class="ifw__card" :style="!current.fullscreen && !$vuetify.display.smAndDown ? 'height:' + current.height : ''">

                <!-- Titlebar — luôn hiển thị của item trên cùng -->
                <v-toolbar density="compact" color="primary" class="ifw__toolbar" flat>
                    <v-icon size="18" class="ml-2 mr-2">{{ current.icon || 'mdi-web' }}</v-icon>
                    <v-toolbar-title class="ifw__title text-truncate">{{ current.title }}</v-toolbar-title>
                    <v-spacer />
                    <v-btn color="white" :icon="current.fullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'" size="small" variant="text"
                        @click="current.fullscreen = !current.fullscreen" />
                    <v-btn color="white" icon="mdi-refresh" size="small" variant="text" :loading="current.loading"
                        @click="reloadIframe" />
                    <v-btn color="white" icon="mdi-close" size="small" variant="text" @click="closeWindow" />
                </v-toolbar>

                <v-progress-linear v-if="current.loading" indeterminate color="primary" height="2" />

                <v-card-text class="ifw__body pa-0" style="position:relative;">
                    <!-- Render tất cả iframe, chỉ show cái trên cùng — giữ state khi quay lại -->
                    <iframe
                        v-for="(win, i) in stack"
                        :key="win._id"
                        :ref="'iframeEl_' + i"
                        :src="win.url"
                        class="ifw__iframe"
                        frameborder="0"
                        allowfullscreen
                        :style="i === stack.length - 1 ? '' : 'display:none'"
                        @load="win.loading = false"
                        @error="win.loading = false; win.hasError = true"
                    ></iframe>
                    <div v-if="current.hasError" class="ifw__error">
                        <v-icon size="48" color="grey-lighten-2">mdi-alert-circle-outline</v-icon>
                        <div class="mt-2 text-grey">Không thể tải trang</div>
                        <v-btn class="mt-3" size="small" variant="tonal" @click="reloadIframe">Thử lại</v-btn>
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>
    </span>
</template>

<script>
export default {
    name: 'GlobalIframeWindow',

    props: {
        title: { type: String, default: '' },
        url: { type: String, default: '' },
        icon: { type: String, default: 'mdi-web' },
        defaultWidth: { type: String, default: '1100px' },
        defaultHeight: { type: String, default: '88vh' },
    },

    emits: ['closed'],

    data() {
        return {
            stack: [],
        };
    },

    mounted() {
        this._msgHandler = (e) => {
            if (e.data?.type !== 'iframeRef_openWindow') return
            // Nếu mình cũng đang trong iframe → bubble lên tiếp
            if (window !== window.top) {
                window.parent.postMessage(e.data, '*')
                return
            }
            const { title, url, icon, width, height, reloadOnClose } = e.data
            this.stack.push({
                title: title || '',
                url: url || '',
                icon: icon || this.icon,
                width: width || this.defaultWidth,
                height: height || this.defaultHeight,
                fullscreen: true,
                loading: true,
                hasError: false,
                onclose: reloadOnClose ? () => {
                    // Gửi iframeRef_closed vào iframe bên dưới (index stack.length - 1 sau khi pop)
                    this.$nextTick(() => {
                        const i = this.stack.length - 1
                        const refs = this.$refs['iframeEl_' + i]
                        const el = Array.isArray(refs) ? refs[0] : refs
                        el?.contentWindow?.postMessage({ type: 'iframeRef_closed' }, '*')
                    })
                } : null,
            })
        }
        window.addEventListener('message', this._msgHandler)
    },

    beforeUnmount() {
        window.removeEventListener('message', this._msgHandler)
    },

    computed: {
        current() {
            return this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
        },
    },

    methods: {
        openWindow({ title = '', url = '', icon = '', width, height, onclose = null } = {}) {
            // Đang trong iframe → bubble lên parent xử lý
            if (window !== window.top) {
                window.parent.postMessage({
                    type: 'iframeRef_openWindow',
                    title, url, icon, width, height,
                    reloadOnClose: typeof onclose === 'function',
                }, '*')
                return
            }
            this.stack.push({
                _id: Date.now() + Math.random(),
                title: title || this.title,
                url: url || this.url,
                icon: icon || this.icon,
                width: width || this.defaultWidth,
                height: height || this.defaultHeight,
                fullscreen: true,
                loading: true,
                hasError: false,
                onclose,
            });
        },

        closeWindow() {
            const i = this.stack.length - 1
            const win = this.stack.pop();
            if (typeof win?.onclose === 'function') {
                win.onclose();
            } else if (win?.onclose?.EXE) {
                try { eval(win.onclose.EXE); } catch (e) { console.warn('[IframeWindow] onclose EXE lỗi:', e); }
            }
            this.$emit('closed');
        },

        reloadIframe() {
            const i = this.stack.length - 1
            const refs = this.$refs['iframeEl_' + i]
            const el = Array.isArray(refs) ? refs[0] : refs
            if (!el || !this.current) return;
            this.current.loading = true;
            this.current.hasError = false;
            el.src = this.current.url;
        },
    },
}
</script>