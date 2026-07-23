<template>
	<v-card :flat="false" class="sach-card" @click="handleClick" hover height="100%">
		<!-- Sử dụng v-img để hiển thị ảnh, có cả placeholder -->
		<v-img v-if="displayImgUrl" :src="displayImgUrl" height="160px" contain @error="() => item.ThumbnailURL = ''">
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
		computed: {
			displayImgUrl() {
				const url = this.item.ThumbnailURL
				if (!url) return ''
				if (url.startsWith('http://') || url.startsWith('https://')) {
					return url
				}
				const domain = vueData?.v_Set?.urlReturnFile || ''
				if (url.startsWith('/FileData/')) {
					return domain + url
				}
				if (url.startsWith('/')) {
					return domain + url
				}
				return domain + '/FileData/' + url
			}
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