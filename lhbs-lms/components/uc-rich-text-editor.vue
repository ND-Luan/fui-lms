<template>
	<div class="uc-rich-text-editor">
		<div v-if="$slots.toolbar || hasPlugin('ggb')" class="d-flex align-center mb-1">
			<slot name="toolbar"></slot>
			<v-btn v-if="hasPlugin('ggb')" size="small" color="deep-purple-darken-1" variant="tonal" class="text-none mb-1"
				:loading="pluginLoading" @click="openPluginFile('ggb')">
				<v-icon start size="small">mdi-shape-polygon-plus</v-icon>
				Chèn hình GeoGebra (.ggb)
			</v-btn>
			<input ref="pluginFileInput" type="file" accept=".ggb" style="display: none;" @change="handlePluginFile" />
		</div>
		<f-editor ref="fEditor" v-model="editorContent" :imageapi="imageApi || vueData?.v_Set?.apiFile" v-bind="$attrs" />
	</div>
</template>

<script>
export default {
	props: {
		modelValue: { type: String, default: '' },
		imageApi: { type: String, default: '' },
		plugins: { type: Array, default: function () { return [] } },
	},
	emits: ['update:modelValue', 'file-deleted', 'file-delete-error'],
	data() { return { vueData: typeof vueData !== 'undefined' ? vueData : {}, pluginLoading: false } },
	mounted() { this.bindUploadAdapter() },
	computed: {
		editorContent: {
			get() { return this.modelValue || '' },
			set(value) { this.$emit('update:modelValue', value) },
		},
	},
	watch: {
		modelValue(newHtml, oldHtml) {
			if (!oldHtml || newHtml === oldHtml) return
			console.log('[uc-rich-text-editor] nội dung thay đổi', { oldHtml: oldHtml, newHtml: newHtml })
			this.deleteRemovedFiles(oldHtml, newHtml)
		},
	},
	methods: {
		bindUploadAdapter() {
			const editorComponent = this.$refs.fEditor
			const editor = editorComponent && editorComponent.Editor
			if (!editor || !editor.plugins) {
				setTimeout(() => this.bindUploadAdapter(), 250)
				return
			}
			const repository = editor.plugins.get('FileRepository')
			if (!repository) return
			console.log('[uc-rich-text-editor] gắn upload adapter chuẩn hóa FileData')
			repository.createUploadAdapter = (loader) => ({
				upload: () => loader.file.then((file) => new Promise((resolve, reject) => {
					const manager = window.UploadManager
					if (!manager || !manager.uploadLmsFile) { reject(new Error('UploadManager.uploadLmsFile không khả dụng')); return }
					manager.uploadLmsFile(file, {
						onComplete: (response) => {
							const item = response && response.Files && response.Files[0] ? response.Files[0] : response
							const baseUrl = (this.vueData.v_Set && this.vueData.v_Set.urlReturnFile) || 'https://file.lhbs.vn/lms'
							const fileUrl = item && item.FILE_URL ? item.FILE_URL : ''
							const url = fileUrl ? (fileUrl.indexOf('http') === 0 ? fileUrl : baseUrl + (fileUrl.indexOf('/') === 0 ? fileUrl : '/' + fileUrl)) : item && item.FILE_ID ? baseUrl + '/FileData/' + item.FILE_ID : ''
							console.log('[uc-rich-text-editor] upload ảnh trả URL', { response: response, url: url })
							if (url) resolve({ default: url }); else reject(new Error('FileData không trả về URL file'))
						},
						onError: reject,
					})
				})),
				abort: () => {},
			})
		},
		hasPlugin(name) { return this.plugins.indexOf(name) >= 0 },
		openPluginFile(name) {
			if (!this.hasPlugin(name) || !this.$refs.pluginFileInput) return
			this.$refs.pluginFileInput.value = null
			this.$refs.pluginFileInput.click()
		},
		handlePluginFile(event) {
			const file = event.target.files && event.target.files[0]
			const manager = window.RichTextEditorPlugins
			if (!file || !manager || !manager.process) return
			this.pluginLoading = true
			manager.process('ggb', file, {
				insertImage: (url) => { this.editorContent = (this.editorContent || '') + '<p><img src="' + url + '" alt="GeoGebra PNG" style="max-width: 100%; height: auto; display: block; margin: 8px auto;" /></p>' },
				onComplete: () => { this.pluginLoading = false },
				onError: () => { this.pluginLoading = false },
			})
		},
		deleteRemovedFiles(oldHtml, newHtml) {
			const plugins = window.RichTextEditorPlugins
			console.log('[uc-rich-text-editor] kiểm tra file bị xóa', { hasPluginManager: !!plugins, hasDeleteHandler: !!(plugins && plugins.deleteRemovedFiles) })
			if (!plugins || !plugins.deleteRemovedFiles) return
			plugins.deleteRemovedFiles(oldHtml, newHtml, {
				onComplete: (fileId) => this.$emit('file-deleted', fileId),
				onError: (fileId, error) => this.$emit('file-delete-error', { fileId: fileId, error: error }),
			})
		},
	},
}
</script>
