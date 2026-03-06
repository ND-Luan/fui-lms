<template>
	<span>
		<slot :open="openWindow" />

		<v-dialog v-model="isOpen" :max-width="width" :fullscreen="fullscreen || $vuetify.display.smAndDown" scrollable
			transition="dialog-bottom-transition" persistent>
			<v-card class="ifw__card" :style="!fullscreen && !$vuetify.display.smAndDown ? 'height:'+height : ''">

				<!-- Titlebar -->
				<v-toolbar density="compact" color="primary" class="ifw__toolbar" flat>
					<v-icon size="18" class="ml-2 mr-2">{{ currentIcon || 'mdi-web' }}</v-icon>
					<v-toolbar-title class="ifw__title text-truncate">{{ currentTitle }}</v-toolbar-title>
					<v-spacer />
					<v-btn :icon="fullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'" size="small" variant="text"
						@click="fullscreen = !fullscreen" />
					<v-btn icon="mdi-refresh" size="small" variant="text" :loading="loading" @click="reloadIframe" />

					<!-- Bấm X → đóng dialog và chạy onclose -->
					<v-btn icon="mdi-close" size="small" variant="text" @click="closeWindow" />
				</v-toolbar>

				<v-progress-linear v-if="loading" indeterminate color="primary" height="2" />

				<v-card-text class="ifw__body pa-0">
					<iframe v-if="isOpen" ref="iframeRef" :src="currentUrl" class="ifw__iframe" frameborder="0"
						allowfullscreen @load="onIframeLoad" @error="onIframeError"></iframe>
					<div v-if="hasError" class="ifw__error">
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
		name: 'UcIframeWindow',
	
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
				isOpen: false,
				loading: false,
				hasError: false,
				fullscreen: true,
				currentTitle: '',
				currentUrl: '',
				currentIcon: '',
				width: this.defaultWidth,
				height: this.defaultHeight,
				_onclose: null,
			};
		},
	
		methods: {
			// Gọi từ bên ngoài: this.$refs.win.openWindow({ title, url, icon, onclose })
			openWindow({ title = '', url = '', icon = '', width, height, onclose = null } = {}) {
				this.currentTitle = title || this.title;
				this.currentUrl = url || this.url;
				this.currentIcon = icon || this.icon;
				this.width = width || this.defaultWidth;
				this.height = height || this.defaultHeight;
				this._onclose = onclose;
	
				this.loading = true;
				this.hasError = false;
				this.isOpen = true;
			},
	
			// Bấm X → đóng + chạy callback
			closeWindow() {
				this.isOpen = false;
				this.currentUrl = '';
	
				// Hỗ trợ Function lẫn { EXE: '...' } giống openWindow cũ
				const cb = this._onclose;
				if (typeof cb === 'function') {
					cb();
				} else if (cb?.EXE) {
					try { eval(cb.EXE); } catch (e) { console.warn('[IframeWindow] onclose EXE lỗi:', e); }
				}
	
				this.$emit('closed');
				this._onclose = null;
			},
	
			reloadIframe() {
				if (!this.$refs.iframeRef) return;
				this.loading = true;
				this.hasError = false;
				this.$refs.iframeRef.src = this.currentUrl;
			},
	
			onIframeLoad() { this.loading = false; },
			onIframeError() { this.loading = false; this.hasError = true; },
		},
	}
</script>