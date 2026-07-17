<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title>{{ TitlePage }} • {{ TitleCap }}</v-card-title>
				<v-card-text>
					<v-row align="center">
						<v-col cols="12" sm="4" md="3" class="py-1">
							<v-select v-model="KhoiID" label="Chọn khối" :items="DSKhoi" item-title="TenKhoiHoc"
								item-value="KhoiID" hide-details />
						</v-col>
						<v-col cols="12" sm="4" md="3" class="py-1">
							<v-select v-model="LopID" label="Chọn lớp" :items="DSLop" item-title="TenLop"
								item-value="LopID" hide-details />
						</v-col>
						<v-col cols="auto" class="py-1">
							<v-btn color="primary" variant="outlined" prepend-icon="mdi-refresh" :disabled="!LopID"
								@click="getDSHocSinhLop(true)">
								Làm mới
							</v-btn>
						</v-col>

						<v-col cols="12" class="d-flex justify-space-between align-center flex-wrap ga-2 pt-2"
							v-if="items.length > 0">
							<v-chip color="primary" class="font-weight-medium" size="small">
								Tổng số học sinh: {{ items.length }}
							</v-chip>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-divider />

		<GlobalDataTable :headers="headers" :items="items" item-value="HocSinhID" items-per-page="-1"
			hide-default-footer hover density="compact" class="border rounded text-body-2 table-sticky-first-col"
			v-data-table-height="'calc(100dvh - 200px)'">
			<template #item.TenLop="{ item }">
				<v-chip color="pink" size="small">{{ item.TenLop }}</v-chip>
			</template>

			<template #item.hocSinh="{ item }">
				<div class="d-flex flex-column align-center justify-center py-2">
					<v-avatar size="80" class="mb-1">
						<v-img :src="`${vueData.v_Set?.urlAvatarHocSinh || ''}${item.HocSinhID}`" />
					</v-avatar>
					<p class="text-caption mb-0">{{ item.HocSinhID }} • {{ item.SoDanhBo }}</p>
					<p class="font-weight-medium mb-0">{{ item.HoTen }}</p>
					<div class="d-flex align-center justify-center">
						<p class="font-weight-medium text-success mb-0 me-1">{{ item.EnglishName || '-' }}</p>
						<v-btn icon="mdi-square-edit-outline" color="success" variant="text" size="small"
							@click="onOpenModalEditProfile(item)">
							<v-icon size="small">mdi-square-edit-outline</v-icon>
							<v-tooltip activator="parent" location="top">Cập nhật tên tiếng Anh</v-tooltip>
						</v-btn>
					</div>
				</div>
			</template>

			<template #item.actions="{ item }">
				<v-btn variant="tonal" color="primary" size="small" @click="localStorageSetItem(item)">
					Xem chi tiết
				</v-btn>
			</template>

			<template #no-data>
				<div class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
					<v-icon size="48" class="mb-3 opacity-40">mdi-table-search</v-icon>
					<p class="text-body-2">Chọn đầy đủ bộ lọc để xem danh sách học sinh</p>
				</div>
			</template>
		</GlobalDataTable>

		<uc-modal-edit-profile @refresh="getDSHocSinhLop(true)" />
	</Global>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
		data() {
			return {
				vueData,
				KhoiID: null,
				LopID: null,
				DSKhoi: [],
				DSLop: [],
				DSHocSinhLop: [],
				DSHocSinh_LMS_Local: [],
				DSHocSinhLop_LMS_Local: [],
				items: [],
				headers: [
					{ title: "STT", key: "STT", align: "center", width: 60 },
					{ title: "Lớp chủ nhiệm", key: "TenLop", align: "center", width: 150 },
					{ title: "Thông tin học sinh", key: "hocSinh", align: "center" },
					{ title: "Hành động", key: "actions", align: "center", width: 120 }
				]
			}
		},
		computed: {
			TitleCap() {
				return renderText(parseInt(vueData.CapID || 1))
			},
			TitlePage() {
				return getTitlePageByURL(window.location.pathname + window.location.search)
			},
		},
		watch: {
			'vueData.NienKhoa': {
				async handler() {
					await this.reloadFilterBySchoolYear()
				}
			},
			'vueData.NienKhoaItem.HocKi': {
				async handler() {
					await this.reloadFilterBySchoolYear()
				}
			},
			KhoiID(v) {
				this.LopID = null
				this.items = []
				this.DSLop = []
				this.DSHocSinhLop = []
				if (v) this.getLop(true)
			},
			LopID(v) {
				this.items = []
				this.DSHocSinhLop = []
				if (v) this.getDSHocSinhLop(true)
			}
		},
		mounted() {
			this.getKhoi()
		},
		methods: {
			async reloadFilterBySchoolYear() {
				this.LopID = null
				this.items = []
				this.DSLop = []
				this.DSHocSinhLop = []
				await this.getKhoi(true)
				if (this.KhoiID) {
					await this.getLop(true)
				}
			},
			async getKhoi(force = false) {
				try {
					const res = await fetchPromise('lms/KhoiHocByCapHoc_Get', {
						CapID: vueData.CapID,
						NienKhoa: vueData.NienKhoa,
						HocKi: vueData.NienKhoaItem?.HocKi
					}, { forceRefresh: force })
					this.DSKhoi = res ?? []
				} catch (err) {
					console.error('getKhoi error:', err)
				}
			},
			async getLop(force = false) {
				if (!this.KhoiID) return
				try {
					const res = await fetchPromise('lms/Lop_Get_ByKhoiID', {
						NienKhoa: vueData.NienKhoa,
						HocKi: vueData.NienKhoaItem?.HocKi,
						KhoiID: this.KhoiID
					}, { forceRefresh: force })
					this.DSLop = res.filter(x => x.IsNhom) ?? []
				} catch (err) {
					console.error('getLop error:', err)
				}
			},
			async getDSHocSinhLop(force = false) {
				if (!this.LopID) return
				try {
					const res = await fetchPromise('lms/HocSinhNhom_Get_ByNhomID', {
						NhomID: this.LopID
					}, { forceRefresh: force })
					this.DSHocSinhLop = res ?? []
					this.renderDSHocSinh()
				} catch (err) {
					console.error('getDSHocSinhLop error:', err)
				}
			},
			renderDSHocSinh() {
				const DSHocSinhLop = this.DSHocSinhLop || []
				const DSHocSinh_LMS = vueData.DSHocSinh_LMS || []
				const DSHocSinhLop_LMS = vueData.DSHocSinhLop_LMS || []
				
				const items = []
				
				for (const hocSinh of DSHocSinhLop) {
					let obj = {
						HSLopID: hocSinh.HSLopID,
						LopID: hocSinh.LopID,
						HocSinhID: hocSinh.HocSinhID,
						HoTen: hocSinh.HoTen || ((hocSinh.Ho || '') + ' ' + (hocSinh.Ten || '')).trim(),
						Ho: hocSinh.Ho,
						Ten: hocSinh.Ten,
						NgaySinh: hocSinh.NgaySinh,
						Nu: hocSinh.Nu,
						TinhTrangKQHT: hocSinh.TinhTrang,
						TenTinhTrangKQHT: hocSinh.TenTinhTrang,
						EnglishName: hocSinh.EnglishName,
						TenLop: hocSinh.TenLop,
						MonHocLopID: hocSinh.MonHocLopID,
						SoTT: hocSinh.SoTT,
						SoDanhBo: ''
					}
					
					const hsLMS = DSHocSinh_LMS.find(x => x.HocSinhID === hocSinh.HocSinhID)
					if (hsLMS) {
						obj.SoDanhBo = hsLMS.SoDanhBo
						obj.TinhTrangQLHS = hsLMS.TinhTrang
						obj.TenTinhTrangQLHS = hsLMS.TenTinhTrang
						obj.CreateUser = hsLMS.CreateUser
						obj.CreateTime = hsLMS.CreateTime
						obj.UpdateUser = hsLMS.UpdateUser
						obj.UpdateTime = hsLMS.UpdateTime
					}
					
					const hslLMS = DSHocSinhLop_LMS.find(x => x.HocSinhID === hocSinh.HocSinhID)
					if (hslLMS) {
						obj.HSLopID = hslLMS.HSLopID
						obj.LopID = hslLMS.LopID
					}
					
					items.push(obj)
				}
				
				this.items = items.sort((a, b) => {
					const soA = isNaN(a.SoDanhBo) || !a.SoDanhBo ? a.SoDanhBo : parseInt(a.SoDanhBo)
					const soB = isNaN(b.SoDanhBo) || !b.SoDanhBo ? b.SoDanhBo : parseInt(b.SoDanhBo)
					
					if (soA && soB) {
						if (soA < soB) return -1
						if (soA > soB) return 1
					} else if (soA) {
						return -1
					} else if (soB) {
						return 1
					}
					
					const tenA = a.Ten?.toLowerCase() || ''
					const tenB = b.Ten?.toLowerCase() || ''
					return tenA.localeCompare(tenB)
				}).map((x, index) => {
					return {
						...x,
						STT: index + 1
					}
				})
			},
			localStorageSetItem(item) {
				const lop = this.DSLop.find(x => x.LopID == item.LopID)
				localStorage.setItem('HocSinhSelected',
					JSON.stringify({
						StudentID: item.HocSinhID,
						HocSinhID: item.HocSinhID,
						HoTen: item.HoTen,
						TenLop: lop ? lop.TenLop : (item.TenLop || ''),
						Khoi: this.KhoiID,
						HinhThucHoc: item.HinhThucHoc,
						MaDonVi: item.MaDonVi,
						NgaySinh: item.NgaySinh,
						Nu: item.Nu,
						LopID: item.LopID,
						HSLopID: item.HSLopID,
						NienKhoa: vueData.NienKhoa,
						KhoiID: this.KhoiID,
						CapID: vueData.CapID,
					})
				)
				const bottomNavigation = localStorage.getItem('tabBottomNavigation')
				if (bottomNavigation === null) localStorage.setItem('tabBottomNavigation', 0)
				const Semester = localStorage.getItem('Semester')
				if (Semester === null) localStorage.setItem('Semester', 1)
				localStorage.setItem('IsPassRoleParent', true)
	
				if (this.iframeRef?.value) {
					this.iframeRef.value.openWindow({
						title: 'Xem chi tiết ' + item.HoTen,
						url: `/ph-report?HocSinhID=${item.HocSinhID}`
					})
				} else if (typeof openWindow === 'function') {
					openWindow({
						title: 'Xem chi tiết ' + item.HoTen,
						url: `/ph-report?HocSinhID=${item.HocSinhID}`
					})
				}
			},
			onOpenModalEditProfile(item) {
				vueData.StudentProfile = { ...item }
				vueData.isOpenModalEditProfile = true
			}
		}
	}
</script>