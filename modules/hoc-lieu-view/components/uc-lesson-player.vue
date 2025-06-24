<template>
	<div class="lesson-player-container">
		<!-- Header: Breadcrumb -->
		<div class="lesson-header">
			<v-btn icon variant="text" @click="goBack">
				<v-icon>mdi-arrow-left</v-icon>
			</v-btn>
			<v-breadcrumbs :items="breadcrumbs" class="pa-0"></v-breadcrumbs>
		</div>

		<!-- Main Content Area -->
		<div class="lesson-content-area">
			<!-- <v-skeleton-loader v-if="isLoading" type="article, paragraph, paragraph"></v-skeleton-loader> -->
			<div v-else-if="currentSlide" class="slide-wrapper">
				<uc-slide-viewer :slide-data="currentSlide" />
			</div>
			<div v-else class="d-flex align-center justify-center fill-height text-grey">
				{{ lessonTitle }}
			</div>
		</div>

		<!-- ============================================== -->
		<!--        SỬA LẠI TOÀN BỘ FOOTER Ở ĐÂY             -->
		<!-- ============================================== -->
		<v-footer app class="lesson-toolbar">
			<!-- Cụm nút bên trái: Các công cụ hỗ trợ -->
			<div class="toolbar-group">
				<v-btn icon variant="text">
					<v-icon>mdi-format-list-bulleted</v-icon>
				</v-btn>
				<v-btn icon variant="text">
					<v-icon>mdi-highlighter</v-icon>
				</v-btn>
				<v-btn icon variant="text">
					<v-icon>mdi-magnify</v-icon>
				</v-btn>
			</div>

			<v-spacer></v-spacer>

			<!-- Cụm nút ở giữa: Các chức năng chính -->
			<div class="toolbar-group main-actions">
				<v-btn variant="text" class="action-btn">
					<v-icon left>mdi-key-outline</v-icon>
					Gợi ý
				</v-btn>
				<v-btn variant="text" class="action-btn">
					<v-icon left>mdi-key-chain-variant</v-icon>
					Đáp án
				</v-btn>
				<v-btn color="primary" variant="flat" rounded="lg" class="action-btn check-btn">
					<v-icon left>mdi-check-bold</v-icon>
					Kiểm tra
				</v-btn>
			</div>

			<v-spacer></v-spacer>

			<!-- Cụm nút bên phải: Điều hướng -->
			<div class="toolbar-group navigation-actions">
				<v-btn icon variant="text" :disabled="currentSlideIndex === 0" @click="goToPrevSlide">
					<v-icon>mdi-chevron-left</v-icon>
				</v-btn>
				<span class="slide-counter">{{ currentSlideIndex + 1 }} / {{ slides.length }}</span>
				<v-btn icon variant="text" :disabled="currentSlideIndex >= slides.length - 1" @click="goToNextSlide">
					<v-icon>mdi-chevron-right</v-icon>
				</v-btn>
			</div>
		</v-footer>
	</div>
</template>

<script>
	export default {
	    name: 'uc-lesson-player',
	    props: {
	        lessonIdProp: [String, Number]
	    },
	    data() {
	        return {
	            lessonTitle: "Đang tải bài giảng...",
	            slides: [],
	            currentSlideIndex: -1,
	            isLoading: true,
	            breadcrumbs: ['Ngữ văn 6', 'Bài 1', 'Thực hành đọc']
	        }
	    },
	    mounted() {
	        // Vì có v-if ở trang cha, khi mounted() được gọi,
	        // this.lessonIdProp chắc chắn đã có giá trị.
	        this.fetchData();
	    },
	    computed: {
	        currentSlide() {
	            return (this.currentSlideIndex >= 0 && this.slides[this.currentSlideIndex]) ? this.slides[this.currentSlideIndex] : null;
	        }
	    },
	    methods: {
	        fetchData() {
	            this.isLoading = true;
	            ajaxCALL('lms/FP_NoiDung_GetDetail', { NoiDungID: this.lessonIdProp }, (res) => {
	                this.isLoading = false;
	                if (res && res.data?.[0]) {
	                    const lessonData = res.data[0];
	                    this.lessonTitle = lessonData.TenNoiDung;
	                    try {
	                        const parsed = JSON.parse(lessonData.DataJson);
	                        // Xử lý cả hai trường hợp: có cấu trúc slides hoặc không
	                        if (parsed && Array.isArray(parsed.slides)) {
	                            this.slides = parsed.slides;
	                        } else {
	                            this.slides = [{ type: 'RawHTML', content: parsed }];
	                        }
	                    } catch (e) {
	                        // Nếu DataJson không phải là JSON, hiển thị nó như HTML thô
	                        this.slides = [{ type: 'RawHTML', content: lessonData.DataJson }];
	                    }
	                    this.currentSlideIndex = this.slides.length > 0 ? 0 : -1;
	                } else {
	                    this.lessonTitle = "Lỗi tải dữ liệu bài giảng.";
	                }
	            });
	        },
	        goToNextSlide() {
	            if (this.currentSlideIndex < this.slides.length - 1) this.currentSlideIndex++;
	        },
	        goToPrevSlide() {
	            if (this.currentSlideIndex > 0) this.currentSlideIndex--;
	        },
	        goBack() {
	            window.history.back();
	        }
	    }
	}
</script>

<style scoped>
	.lesson-player-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f0f2f5;
	}

	.lesson-header {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		padding: 0 16px;
		height: 56px;
		background-color: #fff;
		border-bottom: 1px solid #e0e0e0;
	}

	.lesson-content-area {
		flex-grow: 1;
		overflow-y: auto;
		padding: 24px;
	}

	.slide-wrapper {
		max-width: 900px;
		margin: 0 auto;
		background-color: #fff;
		padding: 32px;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	.lesson-toolbar {
		flex-shrink: 0;
		background-color: #fff;
		border-top: 1px solid #e0e0e0;
		display: flex;
		align-items: center;
		padding: 0 16px;
		height: 56px;
	}

	.slide-counter {
		font-weight: 500;
		color: #555;
	}

	.lesson-toolbar {
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08) !important;
		background-color: #fff;
		display: flex;
		align-items: center;
		padding: 0 16px;
		height: 64px;
		/* Tăng chiều cao footer */
		gap: 16px;
	}

	.toolbar-group {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.slide-counter {
		font-weight: 500;
		color: #555;
		min-width: 50px;
		text-align: center;
	}

	.action-btn {
		text-transform: none;
		/* Bỏ viết hoa */
		font-weight: 500;
		letter-spacing: normal;
	}

	.check-btn {
		padding-left: 24px !important;
		padding-right: 24px !important;
	}
</style>