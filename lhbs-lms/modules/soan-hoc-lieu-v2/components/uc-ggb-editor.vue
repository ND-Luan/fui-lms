<template>
	<div class="uc-ggb-inserter-wrapper">
		<uc-rich-text-editor v-model="editorContent" :image-api="imageApi" v-bind="$attrs">
			<template v-slot:toolbar>
			<label v-if="label" class="text-subtitle-2 text-medium-emphasis mr-2">{{ label }}</label>
			<v-btn size="small" color="deep-purple-darken-1" variant="tonal" class="text-none mb-1"
				:loading="isProcessing" @click="triggerFileSelect">
				<v-icon start size="small">mdi-shape-polygon-plus</v-icon>
				Chèn hình GeoGebra (.ggb)
			</v-btn>
			</template>
		</uc-rich-text-editor>

		<input ref="ggbFileInput" type="file" accept=".ggb" style="display: none;" @change="handleGGBSelect" />

	</div>
</template>

<script>
	export default {
	inject: { snackbarRef: { default: null } },
	props: {
		modelValue: { type: String, default: '' },
		label: { type: String, default: '' },
		imageApi: { type: String, default: '' },
	},
	emits: ['update:modelValue'],
	data() {
		return {
			vueData: typeof vueData !== 'undefined' ? vueData : {},
			isProcessing: false,
		}
	},
	computed: {
		editorContent: {
			get() { return this.modelValue || '' },
			set(val) { this.$emit('update:modelValue', val) },
		},
	},
	mounted() { this.ensureJSZipLoaded() },
	methods: {
		ensureJSZipLoaded() {
			if (window.JSZip) return
			const script = document.createElement('script')
			script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
			document.head.appendChild(script)
		},
		triggerFileSelect() {
			if (this.$refs.ggbFileInput) {
				this.$refs.ggbFileInput.value = null
				this.$refs.ggbFileInput.click()
			}
		},
		async handleGGBSelect(e) {
			const file = e.target.files?.[0]
			if (!file) return
			if (!window.JSZip) await this.loadJSZipAsync()
			this.isProcessing = true
			try {
				const zip = await window.JSZip.loadAsync(file)
				const thumbFile = zip.file('geogebra_thumbnail.png')
				if (!thumbFile) {
					this.showNotification('File .ggb này không chứa ảnh thumbnail!', 'error')
					this.isProcessing = false
					return
				}
				const base64Data = await thumbFile.async('base64')
				const blob = await this.cropThumbnailBlob('data:image/png;base64,' + base64Data, 85)
				const fileName = file.name.replace(/\.ggb$/i, '') + '_chuan.png'
				const pngFile = new File([blob], fileName, { type: 'image/png' })

				if (window.UploadManager && window.UploadManager.uploadLmsFile) {
					window.UploadManager.uploadLmsFile(pngFile, {
						onComplete: (res) => {
							this.isProcessing = false
							let imgUrl = ''
							const fileObj = res?.Files?.[0] || res
							const baseUrl = this.vueData?.v_Set?.urlReturnFile || 'https://file.lhbs.vn/lms'
							if (fileObj?.FILE_URL) imgUrl = fileObj.FILE_URL.startsWith('http') ? fileObj.FILE_URL : (baseUrl + fileObj.FILE_URL)
							else if (fileObj?.FILE_ID) imgUrl = `${baseUrl}/FileData/${fileObj.FILE_ID}`
							else if (res?.url) imgUrl = res.url
							else if (typeof res === 'string') imgUrl = res
							if (imgUrl) {
								this.insertImageToEditor(imgUrl)
								this.showNotification('Đã chèn ảnh GeoGebra thành công!', 'success')
							} else this.showNotification('Lỗi: Server không trả về đường dẫn ảnh hợp lệ', 'error')
						},
						onError: (err) => {
							this.isProcessing = false
							this.showNotification('Lỗi khi tải ảnh GeoGebra lên server: ' + (err?.message || ''), 'error')
						},
					})
				} else {
					const reader = new FileReader()
					reader.onload = (evt) => {
						this.isProcessing = false
						this.insertImageToEditor(evt.target.result)
						this.showNotification('Đã chèn ảnh GeoGebra thành công (Base64)!', 'success')
					}
					reader.readAsDataURL(pngFile)
				}
			} catch (err) {
				this.isProcessing = false
				this.showNotification('Lỗi khi xử lý file .ggb: ' + err.message, 'error')
			}
		},
		cropThumbnailBlob(srcUrl, cropRightPixels = 85) {
			return new Promise((resolve, reject) => {
				const img = new Image()
				img.crossOrigin = 'anonymous'
				img.onload = () => {
					const canvas = document.createElement('canvas')
					const ctx = canvas.getContext('2d')
					const cropWidth = Math.max(0, img.width - cropRightPixels)
					canvas.width = cropWidth
					canvas.height = img.height
					ctx.drawImage(img, 0, 0, cropWidth, img.height, 0, 0, cropWidth, img.height)
					canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')), 'image/png')
				}
				img.onerror = (err) => reject(err)
				img.src = srcUrl
			})
		},
		insertImageToEditor(imgUrl) {
			const imgTag = `<p><img src="${imgUrl}" alt="GeoGebra PNG" style="max-width: 100%; height: auto; display: block; margin: 8px auto;" /></p>`
			this.editorContent = (this.editorContent || '') + imgTag
		},
		loadJSZipAsync() {
			return new Promise((resolve, reject) => {
				if (window.JSZip) return resolve()
				const script = document.createElement('script')
				script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
				script.onload = () => resolve()
				script.onerror = (err) => reject(err)
				document.head.appendChild(script)
			})
		},
		showNotification(message, color = 'info') {
			if (this.snackbarRef?.value?.showSnackbar) this.snackbarRef.value.showSnackbar({ message, color })
			else console.log(`[${color.toUpperCase()}] ${message}`)
		},
	},
	}
</script>
