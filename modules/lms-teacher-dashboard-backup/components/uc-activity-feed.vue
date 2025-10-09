<template>
	<v-card variant="outlined">
		<v-card-title class="d-flex align-center">
			<v-icon class="mr-2" color="purple">mdi-history</v-icon>
			<span class="text-h6 font-weight-regular">Hoạt động gần đây</span>
		</v-card-title>
		<v-divider></v-divider>
		<v-list lines="two" style="max-height: 400px; overflow-y: auto;">
			<div v-if="!activities || activities.length === 0" class="text-center pa-5 text-grey">
				Chưa có hoạt động nào
			</div>

			<v-list-item v-for="(activity, index) in activities" :key="index"
				:subtitle="formatTimeAgo(activity.Timestamp)">
				<template v-slot:prepend>
					<v-avatar color="blue-grey-lighten-4" class="mr-3">
						<v-icon color="blue-grey-darken-1">{{ getActivityIcon(activity.ActivityType) }}</v-icon>
					</v-avatar>
				</template>

				<v-list-item-title>
					<strong class="text-primary">{{ activity.StudentName }}</strong> ({{ activity.ClassName }})
					{{ getActivityText(activity.ActivityType) }}
					<strong>"{{ activity.ResourceTitle }}"</strong>
				</v-list-item-title>
			</v-list-item>
		</v-list>
	</v-card>
</template>

<script>
	export default {
    name: 'uc-activity-feed',
    props: {
        activities: { type: Array, default: () => [] }
    },
    methods: {
        getActivityIcon(type) {
            const map = {
                'SUBMITTED_ASSIGNMENT': 'mdi-file-upload-outline',
                'COMPLETED_LESSON': 'mdi-check-decagram-outline',
            };
            return map[type] || 'mdi-bell-outline';
        },
        getActivityText(type) {
            const map = {
                'SUBMITTED_ASSIGNMENT': 'vừa nộp bài tập',
                'COMPLETED_LESSON': 'vừa hoàn thành bài học',
            };
            return map[type] || 'vừa có hoạt động mới';
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
            return `${days} ngày trước`;
        }
    }
}
</script>