<template>
	<div class="office-reader-container">
		<div v-if="isLoading" class="loading-overlay">
			<v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
			<p class="mt-4 text-grey-darken-1">Đang tải tài liệu...</p>
		</div>

		<!-- <div v-if="" class="docx" id="docx-container"></div> -->
		<iframe v-else :src="viewerUrl" class="office-iframe" frameborder="0" @load="onIframeLoad"
			@error="onIframeError"></iframe>

		<div v-if="error" class="error-overlay">
			<v-icon color="warning" size="64">mdi-cloud-alert-outline</v-icon>
			<p class="mt-4 font-weight-medium text-body-1">{{ error }}</p>
			<div class="mt-6 d-flex ga-3">
				<v-btn color="primary" :href="fileUrl" target="_blank" prepend-icon="mdi-download">
					Tải về
				</v-btn>
				<!-- THÊM NÚT THỬ LẠI Ở ĐÂY -->
				<v-btn variant="tonal" @click="retryLoad" prepend-icon="mdi-refresh">
					Thử lại
				</v-btn>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'uc-office-reader',
		props: {
			fileUrl: {
				type: String,
				required: true
			}
		},
		data() {
			return {
				viewerUrl: '',
				isLoading: false,//true,
				error: null,
				vueData,
				window,
				_fileUrl: this.fileUrl
			}
		},
		mounted() {
			this.generateViewerUrl(this._fileUrl);
		},
		computed: {
			nameFile: function () {
				let name = ''
				if (this.fileUrl.includes('drive.google.com')) {
					name = 'drive'
				}
				else if (!this.fileUrl.includes("http")) {
	
				}
				return name
			}
		},
		methods: {
			async renderDocxFromUrl(url, containerId) {
				try {
					const response = await fetch(url, {
						headers: {
							"Authorization": $awt,
						}
					});
	
					if (!response.ok) {
						throw new Error(`Failed to fetch file from URL: ${url} - Status: ${response.status}`);
					}
	
					const arrayBuffer = await response.arrayBuffer();
					const container = document.getElementById(containerId);
	
					//document, bodyContainer, styleContainer = null, options
					await window.docx.renderAsync(arrayBuffer, container, null, {
						debug: true,
						experimental: true,
						className: "docx"
					});
	
					console.log("✅ DOCX rendered successfully.");
	
				} catch (err) {
					console.error("❌ Error rendering DOCX:", err);
				}
			},
			generateViewerUrl(url) {
				this.isLoading = true;
				this.error = null;
	
				if (!url) {
					this.error = "Không có đường dẫn file.";
					this.isLoading = false;
					return;
				}
	
				let absoluteUrl = url;
				if (!url.startsWith('http')) {
					absoluteUrl = (vueData.v_Set.urlReturnFile || '') + url;
				}
	
				const encodedUrl = encodeURIComponent(absoluteUrl);
				this.viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
	
				const isFileDrive = absoluteUrl.includes("drive.google.com")
				if (isFileDrive) {
					this.viewerUrl = absoluteUrl
				} else {
					this.renderDocxFromUrl(absoluteUrl, "docx-container");
				}
				this.isLoading = false
			},
			onIframeLoad() {
				setTimeout(() => {
					this.isLoading = false;
				}, 1500); // Giảm thời gian chờ một chút
			},
			onIframeError() {
				this.isLoading = false;
				this.error = "Không thể hiển thị bản xem trước. File có thể không truy cập được hoặc có lỗi tạm thời.";
			},
			// THÊM HÀM MỚI ĐỂ TẢI LẠI
			retryLoad() {
				// Đặt lại viewerUrl để buộc iframe tải lại hoàn toàn
				const urlToReload = this.viewerUrl;
				this.viewerUrl = ''; // Xóa URL cũ để iframe reset
				this.$nextTick(() => {
					this.isLoading = true;
					this.error = null;
					this.viewerUrl = urlToReload; // Gán lại URL mới để kích hoạt tải lại
				});
			}
		}
	}
</script>