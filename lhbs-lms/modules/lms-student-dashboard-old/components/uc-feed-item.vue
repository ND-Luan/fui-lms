<template>
	<v-list-item link class="feed-item mb-2" @click="handleNavigation">
		<template v-slot:prepend>
			<div class="feed-avatar" :style="{ background: feedInfo.gradient }">
				<v-icon :icon="feedInfo.icon" color="white" size="20"></v-icon>
			</div>
		</template>

		<v-list-item-title class="feed-title" v-html="feedInfo.title" />
		<v-list-item-subtitle class="feed-time">
			<v-icon size="12" class="mr-1">mdi-clock-outline</v-icon>
			{{ formatTimeAgo(feed.EventTime) }}
		</v-list-item-subtitle>

		<!-- Nút hành động chỉ hiển thị cho loại GRADED (DESKTOP)-->
		<template v-slot:append>
			<div v-if="feed.FeedType === 'GRADED' && !isMobile" class="d-flex align-center ga-2">
				<v-btn v-if='feed.Is_SendToClass == true' size="small" variant="outlined" @click.stop="onViewSummaryClick">
					<v-icon start class="me-1">mdi-clipboard-text-outline</v-icon> Xem điểm
				</v-btn>
				<v-btn size="small" variant="outlined" color="primary" @click.stop="onViewDetailsClick">
					<v-icon start class="me-1">mdi-eye-outline</v-icon> Xem chi tiết
				</v-btn>
				<v-btn v-if="feed.Is_MaxAssigned == 0" size="small" variant="outlined" @click.stop="onResubmitAssignment">
					<v-icon start class="me-1">mdi-replay</v-icon>Làm lại
				</v-btn>
				<v-btn size="small" color="primary" variant="outlined" @click.stop="onOpenLeaderboard">
					<v-icon start class="me-1">mdi-trophy-outline</v-icon> Bảng xếp hạng
				</v-btn>
			</div>
			<div v-else-if="feed.FeedType === 'SUBMITTED' && !isMobile" class="d-flex align-center ga-2">
				<v-btn v-if="feed.Is_MaxAssigned == 0" size="small" variant="outlined" @click.stop="onResubmitAssignment">
					Làm lại
				</v-btn>
			</div>
		</template>

		<!-- MOBILE: Sử dụng Menu dropdown cho GRADED -->
		<div v-if="feed.FeedType === 'GRADED' && isMobile" class="mobile-actions-container">
			<v-btn size="small" variant="outlined" color="primary" @click.stop="onViewDetailsClick"
				class="mobile-primary-btn">
				<v-icon size="18" class="mr-1">mdi-eye</v-icon>
				CHI TIẾT
			</v-btn>

			<v-menu location="bottom end">
				<template v-slot:activator="{ props }">
					<v-btn size="small" variant="tonal" v-bind="props" class="mobile-menu-btn" icon="mdi-dots-vertical">
					</v-btn>
				</template>
				<v-list density="compact" class="mobile-action-menu">
					<v-list-item v-if='feed.Is_SendToClass == true' @click="onViewSummaryClick">
						<template v-slot:prepend>
							<v-icon size="20">mdi-chart-box</v-icon>
						</template>
						<v-list-item-title>Xem điểm</v-list-item-title>
					</v-list-item>

					<v-list-item v-if="feed.Is_MaxAssigned == 0" @click="onResubmitAssignment">
						<template v-slot:prepend>
							<v-icon size="20">mdi-refresh</v-icon>
						</template>
						<v-list-item-title>Làm lại</v-list-item-title>
					</v-list-item>

					<v-list-item @click="onOpenLeaderboard">
						<template v-slot:prepend>
							<v-icon size="20">mdi-trophy</v-icon>
						</template>
						<v-list-item-title>Bảng xếp hạng</v-list-item-title>
					</v-list-item>
				</v-list>
			</v-menu>
		</div>

		<!-- MOBILE: SUBMITTED -->
		<div v-else-if="feed.FeedType === 'SUBMITTED' && isMobile" class="d-flex ga-2 mt-2">
			<v-btn v-if="feed.Is_MaxAssigned == 0" size="small" variant="tonal" @click.stop="onResubmitAssignment"
				block>
				<v-icon size="18" class="mr-1">mdi-refresh</v-icon>
				Làm lại
			</v-btn>
		</div>
	</v-list-item>
	<uc-leaderboard v-if="isOpenLeaderboard" :AssignToClassID="feed.AssignToClassID" v-model:isOpen="isOpenLeaderboard">
	</uc-leaderboard>
</template>

<script>
export default {
	name: 'uc-feed-item',
	props: {
		feed: {
			type: Object,
			required: true
		}
	},
	emits: ['view-summary', 'view-details'],
	mounted() {
		window.addEventListener('resize', () => { this.ResizeWindow() })
		if (window.innerWidth < 960) this.isMobile = true
	},
	data() {
		return {
			isMobile: false,
			vueData,
			isOpenLeaderboard: false
		}
	},
	computed: {
		feedInfo() {
			switch (this.feed.FeedType) {
				case 'GRADED':
					if (this.feed.LanNop == 1 && this.feed.Is_MaxAssigned == 1 && this.feed.DSLanNop.length == 3) {
						return {
							gradient: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
							icon: 'mdi-check-decagram',
							title: `Bài <strong>${this.feed.Title}</strong> đã được chấm: <strong>${this.feed.Details}</strong> `
						};
					} else {
						return {
							gradient: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
							icon: 'mdi-check-decagram',
							title: `Bài <strong>${this.feed.Title}</strong> <span>(Lần ${this.feed.LanNop})</span> đã được chấm: <strong>${this.feed.Details}</strong> `
						};
					}
				case 'SUBMITTED':
					if (this.feed.LanNop == 1 && this.feed.Is_MaxAssigned == 1 && this.feed.DSLanNop.length == 3) {
						return {
							gradient: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
							icon: 'mdi-upload',
							title: `Bạn đã nộp bài tập <strong>${this.feed.Title}</strong> `
						};
					} else {
						return {
							gradient: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
							icon: 'mdi-upload',
							title: `Bạn đã nộp bài tập <strong>${this.feed.Title}</strong> <span>(Lần ${this.feed.LanNop})</span>`
						};
					}

				case 'SAVE_DRAFT':
					return {
						gradient: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
						icon: 'mdi-upload',
						title: `Bạn đã nộp bài tập <strong>${this.feed.Title}</strong>`
					};
				case 'LESSON_COMPLETED':
					return {
						gradient: 'linear-gradient(135deg, #9c27b0 0%, #ab47bc 100%)',
						icon: 'mdi-book-check',
						title: `Bạn đã hoàn thành bài học <strong>${this.feed.Title}</strong>`
					};
				case 'ACHIEVEMENT':
					return {
						gradient: 'linear-gradient(135deg, #ffc107 0%, #ffca28 100%)',
						icon: 'mdi-trophy-award',
						title: `Bạn nhận được thành tích <strong>"${this.feed.Title}"</strong> (${this.feed.Details})`
					};
				default:
					return {
						gradient: 'linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%)',
						icon: 'mdi-bell',
						title: 'Thông báo mới'
					};
			}
		},
	},
	methods: {
		// Hàm xử lý chung khi click vào item
		handleNavigation() {
			// Chỉ điều hướng cho các loại không có nút bấm riêng
			const type = this.feed.ResourceType?.toLowerCase();
			const id = this.feed.AssignToClassID;

			if (!type || !id) return;

			switch (this.feed.FeedType) {
				case 'SUBMITTED':
					// Chuyển đến trang xem lại bài đã nộp (chưa chấm)
					openWindow({
						title: `<p style="min-width: fit-content">${this.feed.Title}</p>`,
						url: `/lms-student-assignment?AssignToClassID=${id}&LanNop=${this.feed.LanNop ?? 1}&Is_SendToClass=${this.feed.Is_SendToClass}`,
						id: "123",
						onclose: {
							"EXE": "vueData.initPage()"
						}
					});
					break;
				case 'SAVE_DRAFT':
					// Chuyển đến trang xem lại bài đã nộp (chưa chấm)
					openWindow({
						title: this.feed.Title,
						url: `/lms-student-assignment?AssignToClassID=${id}&Is_SendToClass=${this.feed.Is_SendToClass}`,
						onclose: {
							"EXE": "vueData.initPage()"
						}
					});
					break;
				case 'LESSON_COMPLETED':
					// Chuyển đến trang xem lại bài học đã hoàn thành
					openWindow({
						title: '',
						url: `/lms-student-lesson-viewer?AssignToClassID=${id}`,
						onclose: {
							"EXE": "vueData.initPage()"
						}
					});
					break;
				// Các trường hợp khác (như GRADED) sẽ được xử lý bằng nút riêng
				default:
					break;
			}
		},
		// Hàm xử lý cho nút "Xem điểm"
		onViewSummaryClick() {
			if (this.feed.ObjectID) {
				this.$emit('view-summary', this.feed.ObjectID);
			}
		},
		// Hàm xử lý cho nút "Xem chi tiết" (thay cho "Xem bài làm")
		onViewDetailsClick() {
			if (this.feed.AssignToClassID) {
				let window = {
					title: this.feed.Title + ` - Nộp bài lần ${this.feed.LanNop}`,
					url: `/lms-student-assignment?AssignToClassID=${this.feed.AssignToClassID}&LanNop=${this.feed.LanNop ?? 1}&Is_SendToClass=${this.feed.Is_SendToClass}`,
					id: '12333',
					onclose: {
						"EXE": "vueData.initPage()"
					}
				}
				openWindow(window)
			}
		},
		// Hàm xử lý cho nút "Làm lại" 
		onResubmitAssignment() {
			if (this.feed.AssignToClassID) {
				if (!this.feed.AssignToClassID) return Vue.$toast.error("Không tìm thấy thông tin bài tập để điều hướng.")
				let window = {
					title: this.feed.Title,
					url: `/lms-student-assignment?AssignToClassID=${this.feed.AssignToClassID}&Is_Resubmit=1`,
					id: '123334',
					onclose: {
						"EXE": "vueData.initPage()"
					}
				}
				openWindow(window)
			}
		},
		formatTimeAgo(dateString) {
			if (!dateString) return '';
			const date = new Date(dateString);
			const now = new Date();
			const seconds = Math.floor((now - date) / 1000);

			if (seconds < 60) return "vài giây trước";
			const minutes = Math.floor(seconds / 60);
			if (minutes < 60) return `${minutes} phút trước`;
			const hours = Math.floor(minutes / 60);
			if (hours < 24) return `${hours} giờ trước`;
			const days = Math.floor(hours / 24);
			if (days < 30) return `${days} ngày trước`;

			return new Intl.DateTimeFormat('vi-VN').format(date);
		},
		ResizeWindow() {
			this.isMobile = window.innerWidth < 960
		},
		onOpenLeaderboard() {
			this.isOpenLeaderboard = true
		}
	}
}
</script>