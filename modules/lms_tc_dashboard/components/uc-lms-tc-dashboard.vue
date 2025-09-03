<template>
	<div class="teacher-dashboard pa-4">
		<!-- 1. Header -->
		<h1 class="text-h6 mb-4">Bảng điều khiển của Giáo viên</h1>

		<!-- 2. Hàng thống kê nhanh (Stats Row) -->
		<v-row class="mb-4">
			<v-col cols="12" sm="6" md="3">
				<uc-stats-card title="Số lớp đang dạy" :value="stats.classCount" icon="mdi-google-classroom"
					color="primary" />
			</v-col>
			<v-col cols="12" sm="6" md="3">
				<uc-stats-card title="Bài giảng đã tạo" :value="stats.lessonCount" icon="mdi-book-open-variant"
					color="info" @click="openWindowTo('Bài giảng của tôi', '/lms_tc_asm_list')" />
			</v-col>
			<v-col cols="12" sm="6" md="3">
				<uc-stats-card title="Bài tập cần chấm" :value="stats.pendingAssignments" icon="mdi-file-check-outline"
					color="warning" @click="openWindowTo('Chấm bài', '/lms_tc_list_grade_asm')" />
			</v-col>
			<v-col cols="12" sm="6" md="3">
				<uc-stats-card title="Học sinh hoạt động" :value="stats.activeStudents" icon="mdi-account-group"
					color="success" />
			</v-col>
		</v-row>

		<!-- 3. Nội dung chính (2 cột) -->
		<v-row>
			<!-- Cột trái -->
			<v-col cols="12" md="8">
				<uc-task-list title="Lịch dạy hôm nay" :items="schedule" icon="mdi-calendar-clock" />
				<uc-task-list title="Bài giảng cập nhật gần đây" :items="recentLessons[0]" icon="mdi-book-edit-outline"
					class="mt-4" />
			</v-col>
			<!-- Cột phải -->
			<v-col cols="12" md="4">
				<uc-activity-feed title="Hoạt động gần đây" :activities="activities" />
			</v-col>
		</v-row>
	</div>
</template>

<script>
	export default {
	    name: 'uc-lms-tc-dashboard',
	    props: {
	        // Nhận dữ liệu từ ALLDRAW của trang cha
	        stats: { type: Object, default: () => ({}) },
	        schedule: { type: Array, default: () => [] },
	        recentLessons: { type: Array, default: () => [] },
	        activities: { type: Array, default: () => [] },
	    },
	    methods: {
	        openWindowTo(title, url) {
	            openWindow({
	                title: title,
	                url: url,
	                onclose: {
	                    "CALL": "onRefresh"
	                }
	            })
	        }
	    }
	}
</script>