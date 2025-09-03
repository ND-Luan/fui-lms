<template>
	<!-- Giao diện khi không có dữ liệu -->
	<div v-if="!initialLesson" class="text-center pa-10 fill-height d-flex flex-column justify-center align-center">
		<v-icon size="64" color="grey-lighten-1">mdi-alert-circle-outline</v-icon>
		<h2 class="mt-4 text-h6">Không tìm thấy nội dung</h2>
		<p class="text-medium-emphasis">Bài giảng này không tồn tại hoặc bạn không có quyền truy cập.</p>
	</div>

	<!-- Giao diện chính khi có dữ liệu -->
	<div v-else class="lesson-viewer-container">

		<!-- ===== CỘT TRÁI: SIDEBAR ===== -->
		<div class="lesson-sidebar">
			<div class="sidebar-sticky-content">
				<h3 class="text-subtitle-1 font-weight-bold mb-1">Nội dung bài học</h3>
				<p class="text-caption text-grey-darken-1 mb-3">{{ initialLesson.MonHocName }}</p>

				<v-progress-linear :model-value="scrollProgress" color="primary" height="6" rounded class="mb-4">
				</v-progress-linear>

				<ul class="lesson-toc" v-if="tocElements.length > 0">
					<li v-for="element in tocElements" :key="element.id">
						<a @click="scrollToElement(element.id)" :class="{ 'is-active': activeTocId === element.id }">
							{{ element.title }}
						</a>
					</li>
				</ul>
				<div v-else class="text-caption text-grey">
					Bài học này không có tiêu đề mục.
				</div>
			</div>
		</div>

		<!-- ===== CỘT PHẢI: NỘI DUNG CHÍNH ===== -->
		<div class="lesson-main-content" style="overflow: auto; height: calc(100dvh - 32px)">
			<!-- HEADER ĐÃ NÂNG CẤP -->
			<div class="lesson-header">
				<div class="text-caption text-grey-darken-1 mb-2 sub-title-lesson">
					<span>{{ initialLesson.MonHocName }}</span>
					<v-icon size="x-small" class="mx-1">mdi-chevron-right</v-icon>
					<span>Bài học</span>
				</div>
				<b class=" title-lesson font-weight-bold">{{ initialLesson.Title }}</b>
				<p v-if="initialLesson.Description" class="text-medium-emphasis mt-2 sub-title-lesson">{{ initialLesson.Description }}
				</p>

				<!-- <v-btn :color="isCompleted ? 'success' : 'primary'" @click="markAsCompleted" :disabled="!canComplete"
					:loading="isMarking" variant="flat" class="mt-4">
					<v-icon start>{{ isCompleted ? 'mdi-check-all' : 'mdi-check' }}</v-icon>
					{{ completionButtonText }}
				</v-btn> -->
			</div>

			<!-- Canvas hiển thị nội dung -->
			<div class="lesson-canvas-container" ref="canvasContainer">
				<uc-lesson-canvas :elements="initialLesson.elements" :is-viewer="true" />
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'uc-lesson-viewer',
		props: {
			initialLesson: Object,
			onUpdateProgress: { type: Function, default: () => { } }
		},
		data() {
			return {
				isCompleted: false,
				timeSpentInterval: null,
				timeCounter: 0,
				isMarking: false,
				MIN_TIME_TO_COMPLETE: 10,
				scrollProgress: 0,
				activeTocId: null,
				tocObserver: null,
				lastUpdateTime: 0
			}
		},
		computed: {
			canComplete() {
				if (this.isCompleted) return false;
				return this.timeCounter >= this.MIN_TIME_TO_COMPLETE;
			},
			completionButtonText() {
				if (this.isCompleted) return 'Đã hoàn thành';
				if (!this.canComplete) {
					const timeLeft = this.MIN_TIME_TO_COMPLETE - this.timeCounter;
					return `Hoàn thành (còn ${timeLeft}s)`;
				}
				return 'Đánh dấu hoàn thành';
			},
			tocElements() {
				if (!this.initialLesson || !this.initialLesson.elements) return [];
				return this.initialLesson.elements
					.map((el, index) => ({
						id: `element-${index}`,
						title: el.ElementData.title
					}))
					.filter(el => el.title && el.title.trim() !== '');
			}
		},
		watch: {
			initialLesson: {
				handler(newVal, oldVal) {
					console.log('[DEBUG] Watcher "initialLesson" được kích hoạt. Giá trị mới (newVal):', newVal);
	
					if (newVal && !this.timeSpentInterval) {
						const progressData = this.initialLesson
						if (progressData && progressData.IsCompleted) {
							this.isCompleted = true;
						} else {
							this.startTracking();
						}
	
						this.$nextTick(() => {
							this.setupScrollListener();
							this.setupTocObserver();
						});
					}
				},
				deep: true,
				immediate: true
			}
		},
		mounted() {
			window.addEventListener('scroll', this.updateScrollProgress, { passive: true });
	
			if (this.tocElements.length > 0) { this.activeTocId = this.tocElements[0].id }
		},
		beforeUnmount() {
			console.log('[DEBUG] Component "uc-lesson-viewer" SẼ BỊ HỦY (beforeUnmount). Đang xóa interval.');
			window.removeEventListener('scroll', this.updateScrollProgress);
			if (this.tocObserver) this.tocObserver.disconnect();
			clearInterval(this.timeSpentInterval);
		},
		methods: {
			startTracking() {
				console.log('[DEBUG] startTracking() được gọi.');
				this.onUpdateProgress({ isCompleted: false, timeSpent: 0 });
				this.lastUpdateTime = Date.now();
	
				this.timeSpentInterval = setInterval(() => {
					this.timeCounter++;
					console.log('timeCounter', this.timeCounter)
					const now = Date.now();
					const elapsedSeconds = (now - this.lastUpdateTime) / 1000;
					if (elapsedSeconds >= 5) {
						console.log(`%c[DEBUG] Đã trôi qua ${Math.round(elapsedSeconds)}s. Gọi onUpdateProgress.`);
						this.onUpdateProgress({ isCompleted: this.isCompleted, timeSpent: Math.round(elapsedSeconds) });
						this.lastUpdateTime = now;
					}
	
				}, 1000);
			},
	
			markAsCompleted() {
				if (!this.canComplete) return;
				this.isMarking = true;
				this.onUpdateProgress({ isCompleted: true, timeSpent: 0 });
				this.isCompleted = true;
				this.isMarking = false;
				Vue.$toast.success("Chúc mừng bạn đã hoàn thành bài học!", { position: "top" });
				clearInterval(this.timeSpentInterval);
			},
	
			scrollToElement(elementId) {
				const container = this.$refs.canvasContainer;
				if (!container) return;
				const element = container.querySelector(`#${elementId}`);
				if (element) {
					this.activeTocId = elementId
					element.scrollIntoView({
						behavior: "smooth", // cuộn mượt
						block: "start" // vị trí hiển thị: start | center | end | nearest
					});
					return
				}
			},
	
			setupScrollListener() {
				console.log("[DEBUG] setupScrollListener được gọi.");
			},
	
			updateScrollProgress() {
				const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
				const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
				this.scrollProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
	
			},
	
			setupTocObserver() {
				// console.log("[DEBUG] setupTocObserver được gọi.");
				// const container = this.$refs.canvasContainer;
				// if (!container || this.tocElements.length === 0) return;
				// if (this.tocObserver) this.tocObserver.disconnect();
	
				// this.tocObserver = new IntersectionObserver((entries) => {
				// 	entries.forEach(entry => {
				// 		if (entry.isIntersecting) {
				// 			this.activeTocId = entry.target.id;
				// 		}
				// 	});
				// }, {
				// 	root: null,
				// 	rootMargin: '0% 0px -20% 0px',
				// 	threshold: 0
				// });
	
				// this.tocElements.forEach(toc => {
				// 	const el = container.querySelector(`#${toc.id}`);
				// 	if (el) this.tocObserver.observe(el);
				// });
			}
		}
	}
</script>