<!-- === uc-sach-card (Sử dụng Vuetify Components) === -->
<template>
	<v-card class="sach-card" @click="handleClick" hover height="100%">
		<!-- Sử dụng v-img để hiển thị ảnh, có cả placeholder -->
		<v-img :src="item.ThumbnailURL" height="160px" cover>
			<template v-slot:placeholder>
				<div class="d-flex align-center justify-center fill-height">
					<v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
				</div>
			</template>
		</v-img>

		<v-card-text class="sach-info">
			<div class="sach-title">{{ item.TenHocLieu }}</div>
			<div class="sach-description">{{ item.TenBoSach }}</div>
		</v-card-text>

		<v-divider></v-divider>

		<v-card-actions class="sach-meta">
			<v-chip color="green" variant="tonal" size="small">
				<v-icon start icon="mdi-check-circle"></v-icon>
				Miễn phí
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
            window.location.href = `/chi-tiet-hoc-lieu?id=${this.item.HocLieuID}`;
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