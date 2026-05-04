<template>
	<v-card class="group-header-card mb-2 w-100" flat border>
		<v-card-text class="py-2">
			<div class="d-flex justify-space-between align-center">
				<div class="d-flex align-center ga-2">
					<div class="">
						<v-icon color="primary" size="20">mdi-folder-text-outline</v-icon>
					</div>
					<div class="group-info">
						<h3 class="group-title-main">{{ group.title }}</h3>
						<div class="group-meta">
							<span class="text-caption text-medium-emphasis">
								{{ group.questions.length }} câu hỏi
							</span>
							<span class="mx-2">•</span>
							<span class="text-caption text-medium-emphasis">
								Tối đa {{ groupMaxPoint }} điểm
							</span>
						</div>
					</div>
				</div>
				<div class="group-progress-badge">
					<v-chip color="primary" variant="text" size="small" class="progress-chip justify-center font-weight-medium">
						{{ answeredCount }} / {{ group.questions.length }}
					</v-chip>
				</div>
			</div>
			<p v-if="group.description" class="group-description mb-0" style="text-wrap: auto;">
				{{ group.description }}
			</p>

			<!-- Media -->
			<div v-if="group.media" class="media-container mt-2">
				<div v-if="group.media.sourceYT.source?.length > 0" class="youtube-container">
					<iframe :src="renderUrlYoutube(group.media.sourceYT.source)" frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen></iframe>
				</div>
				<uc-wave-audio-player v-if="group.media.sourceRecord.source?.length > 0"
					v-model:audioUrl="group.media.sourceRecord.source" />
				<div v-if="group.media.sourceFiles.image.length > 0" style="min-height: 350px">
					<v-img v-for="file in group.media.sourceFiles.image" :key="file.source"
						:src="'https://drive.google.com/thumbnail?id=' + getDriveFileId(file.source) + '&sz=w1000'"
						:lazy-src="'https://drive.google.com/thumbnail?id=' + getDriveFileId(file.source) + '&sz=w1000'"
						class="rounded-lg" height="400">
						<template #placeholder>
							<v-row align="center" class="fill-height ma-0" justify="center">
								<v-progress-circular color="grey-lighten-5" indeterminate />
							</v-row>
						</template>
					</v-img>
				</div>
				<div v-if="group.media.sourceFiles.file.length > 0">
					<iframe v-for="file in group.media.sourceFiles.file" :key="file.source" :src="file.source"
						style="width: 100%; height: 400px;"></iframe>
				</div>
			</div>
		</v-card-text>
	</v-card>
</template>

<script>
	export default {
		name: 'GroupHeader',
		props: {
			group: {
				type: Object,
				required: true
			},
			answeredCount: {
				type: Number,
				default: 0
			}
		},
		computed: {
		groupMaxPoint() {
		if (!this.group?.questions?.length) return 0;
		
		const total = this.group.questions.reduce(
		(sum, q) => sum + (Number(q.points) || 0),
		0
		);
		
		// Làm tròn 2 chữ số, tránh 7.000000000000001
		return Math.round((total + Number.EPSILON) * 100) / 100;
		}
		},
		methods: {
			renderUrlYoutube(url) {
				if (!url) return '';
				let videoId = '';
				const standardMatch = url.match(/[?&]v=([^&]+)/);
				if (standardMatch) videoId = standardMatch[1];
				const shortMatch = url.match(/youtu\.be\/([^?]+)/);
				if (shortMatch) videoId = shortMatch[1];
				const embedMatch = url.match(/embed\/([^?]+)/);
				if (embedMatch) videoId = embedMatch[1];
				if (videoId) return `https://www.youtube.com/embed/${videoId}`;
				return url;
			},
	
			getDriveFileId(url) {
				if (!url) return null;
				const match = url.match(/\/d\/([^/]+)\//);
				return match ? match[1] : null;
			}
		}
	}
</script> 