<!-- === uc-sach-card (Sử dụng Vuetify Components) === -->
<template>
	<v-card :flat="false" class="sach-card" @click="handleClick" hover height="100%">
		<!-- Sử dụng v-img để hiển thị ảnh, có cả placeholder -->
		<v-img v-if="item.ThumbnailURL" :src="item.ThumbnailURL" height="160px" contain
			@error="() => item.ThumbnailURL = '/_cdn/lhbs-lms/image_not_found.jpg'">
			<template v-slot:placeholder>
				<div class="d-flex align-center justify-center fill-height">
					<v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
				</div>
			</template>
		</v-img>
		<v-img v-else src="/_cdn/lhbs-lms/image_not_found.jpg" height="160px" contain />

		<v-card-text class="sach-info">
			<div class="sach-title">{{ item.TenHocLieu }}</div>
			<div class="sach-description">{{ item.TenBoSach }}</div>
		</v-card-text>

		<v-divider></v-divider>

		<v-card-actions class="sach-meta">
			<v-chip color="green" variant="tonal" size="small">
				<v-icon start icon="mdi-check-circle"></v-icon>
				{{item.TinhTrang}}
			</v-chip>
		</v-card-actions>
	</v-card>
</template>

<script>
	export default {
		name: 'uc-sach-card',
		props: {
			item: { type: Object, required: true }
		},
		methods: {
			handleClick() {
				redirect(`/chi-tiet-hoc-lieu?id=${this.item.HocLieuID}`)
				// openWindow({
				// 	"title": "Chi tiết học liệu",
				// 	"url": `/chi-tiet-hoc-lieu?id=${this.item.HocLieuID}`
				// })
			}
		}
	}
</script>

<style scoped>
	.sach-card {
		display: flex;
		flex-direction: column;
	}

	.sach-info {
		flex-grow: 1;
		/* Đẩy action xuống dưới */
		padding: 16px;
	}

	.sach-title {
		font-size: 1rem;
		font-weight: 600;
		color: #212529;
		line-height: 1.4;
		margin-bottom: 4px;
	}

	.sach-description {
		font-size: 0.85rem;
		color: #6c757d;
	}

	.sach-meta {
		padding: 8px 16px;
	}
</style>