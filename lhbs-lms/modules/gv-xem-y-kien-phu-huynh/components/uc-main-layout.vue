<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title>{{ TitlePage }} • {{ TitleCap }}</v-card-title>
				<v-card-text>
					<v-row align="center">
						<v-col cols="12" sm="4">
							<v-select v-model="LopItem" label="Chọn lớp" :items="DSLop" item-title="TenLop"
								item-value="LopID" return-object />
						</v-col>
						<v-col cols="12" sm="4">
							<v-select v-model="ThangItem" label="Chọn tháng" :items="DSLop_NhanXetThang"
								item-title="Thang_HienThi" item-value="Lop_NhanXetThangID" return-object
								:disabled="!LopItem" />
						</v-col>
						<v-col cols="12" sm="4" class="d-flex align-center ga-2 flex-wrap">
							<v-btn variant="outlined" color="primary" :loading="loading" @click="onRefresh">
								<v-icon start>mdi-reload</v-icon>Làm mới
							</v-btn>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-divider />

		<GlobalDataTable :headers="headers" :items="items" item-value="HocSinhID" items-per-page="-1"
			hide-default-footer hover  >
			<template #item.hocSinh="{ item }">
				<uc-info-student :item="item" />
			</template>
			<template #item.PHConfirm="{ item }">
				<v-chip v-if="item.PHConfirm !== null && item.PHConfirm !== undefined" size="x-small"
					:color="item.PHConfirm ? 'success' : 'default'" variant="tonal">
					{{ item.PHConfirm ? 'Đã xác nhận' : 'Chưa xác nhận' }}
				</v-chip>
				<span v-else class="text-medium-emphasis text-body-2">—</span>
			</template>
			<template #item.PHConfirmTime="{ item }">
				<span class="text-body-2">{{ item.PHConfirmTime || '—' }}</span>
			</template>
			<template #item.LuotXem="{ item }">
				<span class="text-body-2 font-weight-medium">{{ item.LuotXem ?? 0 }}</span>
			</template>
			<template #item.YKienPhuHuynh="{ item }">
				<span class="text-body-2" style="white-space: pre-wrap;">{{ item.YKienPhuHuynh || '—' }}</span>
			</template>
			<template #no-data>
				<div class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
					<v-icon size="48" class="mb-3 opacity-40">mdi-comment-question-outline</v-icon>
					<p class="text-body-2">Chọn lớp và tháng để xem ý kiến phụ huynh</p>
				</div>
			</template>
		</GlobalDataTable>
	</Global>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
		data() {
			return {
				vueData,
				loading: false,
				DSLop: [],
				DSLop_NhanXetThang: [],
				LopItem: null,
				ThangItem: null,
				items: [],
				headers: [
					{ title: 'Học sinh', key: 'hocSinh', align: 'center', sortable: false },
					{ title: 'Phụ huynh xác nhận', key: 'PHConfirm', align: 'center' },
					{ title: 'Thời gian xác nhận', key: 'PHConfirmTime', align: 'center' },
					{ title: 'Lượt xem', key: 'LuotXem', align: 'right' },
					{ title: 'Ý kiến phụ huynh', key: 'YKienPhuHuynh', sortable: false },
				],
			}
		},
		computed: {
			TitleCap() {
				return renderText(parseInt(vueData.CapID))
			},
			TitlePage() {
				return getTitlePageByURL(window.location.pathname + window.location.search)
			},
		},
		watch: {
			'vueData.NienKhoa'() {
				this.LopItem = null
				this.ThangItem = null
				this.DSLop_NhanXetThang = []
				this.items = []
				this.getLop(true)
			},
			LopItem(v) {
				this.ThangItem = null
				this.DSLop_NhanXetThang = []
				this.items = []
				if (v) this.getNhanXetThang()
			},
			ThangItem(v) {
				this.items = []
				if (v) this.getYKien()
			},
		},
		mounted() {
			this.getLop()
		},
		methods: {
			async getLop(forceRefresh = false) {
				const res = await fetchPromise('lms/Lop_Get_By_CapID', {
					NienKhoa: vueData.NienKhoa,
					CapID: vueData.CapID,
				}, { forceRefresh })
				this.DSLop = res ?? []
			},
			async getNhanXetThang(forceRefresh = false) {
				if (!this.LopItem?.LopID) return
				const res = await fetchPromise('lms/NhanXetThang_Lop_Get', {
					NienKhoa: vueData.NienKhoa,
					LopID: this.LopItem.LopID,
				}, { forceRefresh })
				this.DSLop_NhanXetThang = res ?? []
			},
			async getYKien(forceRefresh = false) {
				if (!this.LopItem?.LopID || !this.ThangItem?.Lop_NhanXetThangID) return
				this.loading = true
				try {
					const res = await fetchPromise('lms/HocSinhYKienThang_Get_By_LopID_Lop_NhanXetThangID', {
						LopID: this.LopItem.LopID,
						Lop_NhanXetThangID: this.ThangItem.Lop_NhanXetThangID,
					}, { forceRefresh })
					this.items = res ?? []
				} finally {
					this.loading = false
				}
			},
			async onRefresh() {
				if (!this.LopItem) {
					await this.getLop(true)
					return
				}
				if (!this.ThangItem) {
					await this.getNhanXetThang(true)
					return
				}
				await this.getYKien(true)
			},
		},
	}
</script>