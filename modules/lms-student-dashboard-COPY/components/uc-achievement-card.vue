<template>
	<v-tooltip location="top" content-class="achievement-tooltip">

		<template v-slot:activator="{ props }">
			<div v-bind="props" class="achievement-icon-wrapper">
				<v-img :src="achievement.ImageUrl" height="80" width="80" class="achievement-icon" contain
					:alt="achievement.Title"></v-img>
			</div>
		</template>

		<div>
			<div class="font-weight-bold mb-1">{{ achievement.Title }}</div>
			<div class="text-caption mb-2">{{ achievement.Description }}</div>
			<v-divider></v-divider>
			<div class="text-caption text-grey mt-2">
				<em>Đạt được {{ formatTimeAgo(achievement.CreateTime) }}</em>
			</div>
		</div>
	</v-tooltip>
</template>

<script>
	export default {
		name: 'uc-achievement-card',
	
		props: {
			achievement: {
				type: Object,
				required: true
			}
		},
	
		methods: {
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