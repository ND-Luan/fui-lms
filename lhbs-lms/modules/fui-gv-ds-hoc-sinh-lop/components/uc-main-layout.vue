<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title>
					{{ TitlePage }} • {{ TitleCap }}
				</v-card-title>
				<v-card-text>
					<v-row align="center">
						<v-col cols="12" sm="3">
							<v-select v-model="KhoiItem" label="Chọn khối" :items="DSKhoi" item-title="TenKhoiHoc"
								item-value="KhoiID" return-object />
						</v-col>
						<v-col cols="12" sm="3">
							<v-select v-model="LopItem" label="Chọn lớp" :items="DSLop" item-title="TenLop"
								item-value="LopID" :disabled="!KhoiItem" return-object />
						</v-col>
						<v-col class="d-flex align-center ga-2 flex-wrap">
							<v-btn @click="getHocSinh()" variant="outlined" color="primary" :disabled="!LopItem">
								<v-icon start>mdi-reload</v-icon>Làm mới
							</v-btn>
							<v-btn @click="insHocSinh()" color="teal" :disabled="DSHocSinhSelected.length === 0">
								<v-icon start>mdi-sync</v-icon>
								Cập nhật DS học sinh
								<v-badge v-if="DSHocSinhSelected.length > 0" :content="DSHocSinhSelected.length"
									color="white" text-color="teal" inline />
							</v-btn>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-divider />

		<!-- Thay toàn bộ phần template v-data-table -->
		<v-data-table v-model="DSHocSinhSelected" :headers :items :show-select="true" items-per-page="-1"
			:item-value="(item) => item" hide-default-footer hover
			style="max-height: calc(100dvh - 77px); overflow-y: auto;">
			<!-- STT -->
			<template #item.STT="{ item }">
				<span class="text-caption text-medium-emphasis font-weight-medium">{{ item.STT }}</span>
			</template>

			<!-- Thông tin học sinh — gộp avatar + tên + ID + tên tiếng Anh vào 1 hàng ngang -->
			<template #item.ThongTinHocSinh="{ item }">
				<div class="d-flex align-center ga-3 py-2">
					<v-avatar :size="52" class="elevation-2 flex-shrink-0">
						<v-img :src="vueData.v_Set.urlAvatarHocSinh + item.HocSinhID" />
					</v-avatar>
					<div class="d-flex flex-column ga-1">
						<span class="font-weight-bold text-body-2">{{ item.HoTen }}</span>
						<div class="d-flex align-center ga-2 flex-wrap">
							<v-chip size="x-small" variant="tonal" color="primary" label>
								{{ item.HocSinhID }}
							</v-chip>
							<v-chip size="x-small" variant="tonal" color="secondary" label>
								SDB: {{ item.SoDanhBo ?? '—' }}
							</v-chip>
						</div>
						<div class="d-flex align-center ga-1">
							<span class="text-caption text-success font-weight-medium">
								{{ item.EnglishName ?? '—' }}
							</span>
							<v-btn icon="mdi-square-edit-outline" color="success" variant="text" size="x-small"
								v-tooltip="'Cập nhật tên tiếng Anh'" @click="onOpenModalEditProfile(item)" />
						</div>
					</div>
				</div>
			</template>

			<!-- Tình trạng KQHT -->
			<template #item.TinhTrangKQHT="{ item }">
				<v-chip v-if="item.isExistInKQHT" :color="renderColorTinhTrang(item.TinhTrangKQHT)" size="small" label>
					<v-icon start size="13">mdi-school</v-icon>
					{{ item.TenTinhTrangKQHT ?? 'Không có' }}
				</v-chip>
				<v-chip v-else color="warning" variant="tonal" size="small" label>
					<v-icon start size="13">mdi-alert-outline</v-icon>
					Chưa có trong KQHT
				</v-chip>
			</template>

			<!-- Tình trạng QLHS -->
			<template #item.TinhTrangQLHS="{ item }">
				<v-chip :color="renderColorTinhTrang(item.TinhTrangQLHS)" size="small" label>
					<v-icon start size="13">mdi-account-check</v-icon>
					{{ item.TenTinhTrangQLHS ?? 'Không có' }}
				</v-chip>
			</template>

			<!-- Xem chi tiết -->
			<template #item.XemChiTiet="{ item }">
				<v-btn @click="localStorageSetItem(item)" icon="mdi-eye-outline" variant="text" color="primary"
					size="small" v-tooltip="'Xem chi tiết ' + item.HoTen" />
			</template>
		</v-data-table>

		<uc-modal-edit-profile v-model="isOpenModalEditProfile" :StudentProfile @onSubmitFinish="getHocSinh(false)" />
	</Global>
</template>

<script>
export default {
	inject: ['snackbarRef', 'iframeRef'],

	data() {
		return {
			vueData,
			items: [],
			headers: [
				{ title: "#", value: "STT", align: "center", width: 56 },
				{ title: "Học sinh", value: "ThongTinHocSinh", align: "start", minWidth: 280 },
				{ title: "Trạng thái LMS", value: "TinhTrangKQHT", align: "center", width: 180 },
				{ title: "Trạng thái QLHS", value: "TinhTrangQLHS", align: "center", width: 180 },
				{ title: "", value: "XemChiTiet", align: "center", width: 120, sortable: false },
			],
			DSKhoi: [],
			DSLop: [],
			KhoiItem: null,
			LopItem: null,
			DSHocSinhSelected: [],
			StudentProfile: null,
			isOpenModalEditProfile: false,
		}
	},

	computed: {
		TitleCap() { return renderText(parseInt(vueData.capid)) },
		TitlePage() { return getTitlePageByURL(window.location.pathname + window.location.search) },
	},

	watch: {
		"vueData.NienKhoa"() {
			this.getKhoi()
			this.KhoiItem = null
			this.LopItem = null
			this.items = []
		},
		KhoiItem(val) {
			if (!val) return
			this.LopItem = null
			this.items = []
			this.getLop()
		},
		LopItem(val) {
			if (!val) return
			this.items = []
			this.getHocSinh(true)
		},
	},

	mounted() {
		this.getKhoi()
	},

	methods: {
		async getKhoi() {
			this.DSKhoi = await fetchPromise("lms/KhoiHocByCapHoc_Get", { CapID: vueData.CapID })
		},

		async getLop() {
			const _dsLop = await fetchPromise("lms/Lop_Get_ByKhoiID", {
				NienKhoa: vueData.NienKhoa,
				KhoiID: this.KhoiItem.KhoiID,
			})
			this.DSLop = _dsLop.filter(x => x.IsNhom === false)
		},

		async getHocSinh(forceRefresh = false) {
			this.DSHocSinhSelected = []
			const [DSHocSinhLop, DSHocSinh_LMS, DSHocSinhLop_LMS] = await fetchBatchPromise([
				{ url: 'lms/HocSinhLop_Get', params: { LopID: this.LopItem?.LopID, NienKhoa: vueData.NienKhoa } },
				{ url: 'student/LMS_GetHocSinh', params: { LopID: this.LopItem?.LopID, NienKhoa: vueData.NienKhoa } },
				{ url: 'student/LMS_GetHocSinhLop', params: { LopID: this.LopItem?.LopID, NienKhoa: vueData.NienKhoa } },
			], { forceRefresh })

			this.items = this.renderDSHocSinh(DSHocSinhLop, DSHocSinh_LMS, DSHocSinhLop_LMS)
		},

		async insHocSinh() {
			const payload = this.DSHocSinhSelected.map(x => ({
				...x,
				TinhTrang: x.TinhTrangQLHS,
				TenTinhTrang: x.TenTinhTrangQLHS,
			}))

			const promise = Promise.all([
				fetchPromise("lms/IO_IN_HocSinh_Ins", { HocSinhObjArr: payload }, { cache: false, suppressError: true }),
				fetchPromise("lms/IO_IN_HocSinhLop_Ins", { HocSinhLopObjArr: payload }, { cache: false, suppressError: true }),
			])

			// Tách getHocSinh ra — không để nó kéo dài promise
			promise.then(() => this.getHocSinh(true))

			this.snackbarRef.value.showPromise(promise, {
				loadingText: `Đang cập nhật ${payload.length} học sinh...`,
				onSuccess: () => ({
					text: `Cập nhật ${payload.length} học sinh thành công!`,
					color: 'success',
					prependIcon: 'mdi-check-circle-outline',
					timeout: 3000,
					timer: 'white',
				}),
				onError: (err) => ({
					text: `Cập nhật thất bại: ${err?.message ?? 'Lỗi không xác định'}`,
					color: 'error',
					prependIcon: 'mdi-alert-circle-outline',
					timeout: 5000,
					timer: 'white',
					reverseTimer: true,
				}),
			})
		},

		onOpenModalEditProfile(item) {
			this.StudentProfile = { ...item }
			this.isOpenModalEditProfile = true
		},

		localStorageSetItem(item) {
			if (!localStorage.getItem('tabBottomNavigation')) localStorage.setItem('tabBottomNavigation', 0)
			if (!localStorage.getItem('Semester')) localStorage.setItem('Semester', 1)
			localStorage.setItem('IsPassRoleParent', true)

			this.iframeRef.value.openWindow({
				title: 'Xem chi tiết ' + item.HoTen,
				url: `/ph-report?HocSinhID=${item.HocSinhID}`
			})
		},

		renderColorTinhTrang(TinhTrang) {
			if (TinhTrang === 0) return 'green'
			if (TinhTrang === 1) return 'red'
			if (TinhTrang === 2) return 'success'
			return ''
		},

		renderDSHocSinh(DSHocSinhLop, DSHocSinh_LMS, DSHocSinhLop_LMS) {
			const eduBotHocSinhLop = []
			const currentDSHocSinhLop_LMS = DSHocSinhLop_LMS.filter(x => x.LopID == this.LopItem.LopID)

			for (const hsl of currentDSHocSinhLop_LMS) {
				const hs = DSHocSinh_LMS.find(x => x.HocSinhID === hsl.HocSinhID)
				if (hs) eduBotHocSinhLop.push({ ...hsl, ...hs })
			}

			const uniqueHocSinhID = [...new Set(eduBotHocSinhLop.map(x => x.HocSinhID))]

			const items = uniqueHocSinhID.map(id => {
				const hocSinh = DSHocSinhLop.find(x => x.HocSinhID === id)
				const hocSinhLMS = eduBotHocSinhLop.find(x => x.HocSinhID === id)
				let obj = { isExistInKQHT: !!hocSinh }

				if (hocSinh) {
					Object.assign(obj, {
						HSLopID: hocSinh.HSLopID,
						LopID: hocSinh.LopID,
						HocSinhID: hocSinh.HocSinhID,
						HoTen: hocSinh.Ho + ' ' + hocSinh.Ten,
						Ho: hocSinh.Ho,
						Ten: hocSinh.Ten,
						NgaySinh: hocSinh.NgaySinh,
						Nu: hocSinh.Nu,
						TinhTrangKQHT: hocSinh.TinhTrang,
						TenTinhTrangKQHT: hocSinh.TinhTrang === 2 ? 'Nghỉ học (Tốt nghiệp)' : hocSinh.TenTinhTrang,
						EnglishName: hocSinh.EnglishName,
					})
				}

				if (hocSinhLMS) {
					Object.assign(obj, {
						HSLopID: hocSinhLMS.HSLopID,
						LopID: hocSinhLMS.LopID,
						HocSinhID: hocSinhLMS.HocSinhID,
						HoTen: hocSinhLMS.Ho + ' ' + hocSinhLMS.Ten,
						Ho: hocSinhLMS.Ho,
						Ten: hocSinhLMS.Ten,
						NgaySinh: hocSinhLMS.NgaySinh,
						Nu: hocSinhLMS.Nu,
						TinhTrangQLHS: hocSinhLMS.TinhTrang,
						TenTinhTrangQLHS: hocSinhLMS.TinhTrang === 2 ? 'Nghỉ học (Tốt nghiệp)' : hocSinhLMS.TenTinhTrang,
						SoDanhBo: hocSinhLMS.SoDanhBo,
						CreateUser: hocSinhLMS.CreateUser,
						CreateTime: hocSinhLMS.CreateTime,
						UpdateUser: hocSinhLMS.UpdateUser,
						UpdateTime: hocSinhLMS.UpdateTime,
					})
				}

				return obj
			})

			return items
				.sort((a, b) => {
					const soA = isNaN(a.SoDanhBo) ? a.SoDanhBo : parseInt(a.SoDanhBo)
					const soB = isNaN(b.SoDanhBo) ? b.SoDanhBo : parseInt(b.SoDanhBo)
					if (soA !== soB) return soA < soB ? -1 : 1
					return (a.Ten?.toLowerCase() || '').localeCompare(b.Ten?.toLowerCase() || '')
				})
				.map((x, i) => ({ ...x, STT: i + 1, HoTen: x.Ho + ' ' + x.Ten }))
		},
	},
}
</script>