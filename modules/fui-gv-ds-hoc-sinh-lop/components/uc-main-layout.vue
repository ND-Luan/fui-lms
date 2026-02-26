<template>
	<Global>
		<v-card class="sticky-header">
			<v-card-title>{{TitlePage}} • {{TitleCap}}</v-card-title>
			<v-card-text>
				<v-row>
					<v-col cols="3"><v-select v-model="KhoiItem" label="Chọn khối" :items="DSKhoi"
							item-title="TenKhoiHoc" item-value="KhoiID" return-object /></v-col>
					<v-col cols="3"><v-select v-model="LopItem" label="Chọn lớp" :items="DSLop" item-title="TenLop"
							item-value="LopID" return-object /></v-col>
					<v-col class="d-flex ga-2">
						<v-btn @click="getHocSinh()" text="Làm mới" variant="outlined" color="primary" />
						<v-btn @click="insHocSinh()" text="Cập nhật DS học sinh" variant="outlined" color="teal"
							:disabled="DSHocSinhSelected.length === 0" />
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
		<v-divider />
		<v-data-table v-model="DSHocSinhSelected" :headers :items :show-select="true" items-per-page="-1"
			:item-value="(item) => item" hide-default-footer style="max-height: calc(100dvh - 89px)">
			<template #item.ThongTinHocSinh="{item}">
				<div class="d-flex flex-column align-center justify-center">
					<v-avatar :size="80">
						<v-img :src="vueData.v_Set.urlAvatarHocSinh + item.HocSinhID" />
					</v-avatar>
					<p>{{item.HocSinhID}} • {{item.SoDanhBo}}</p>
					<p class="font-weight-medium">{{item.HoTen}}</p>
					<div class="d-flex align-center justify-center">
						<p class="font-weight-medium text-success"> {{item.EnglishName ?? '-'}} </p>
						<v-btn icon="mdi-square-edit-outline" color="success" variant="text" size="small"
							@click="onOpenModalEditProfile(item)" v-tooltip="'Cập nhật tên tiếng anh'" />
					</div>
				</div>
			</template>
			<template #item.XemChiTiet="{item}">
				<v-btn @click="localStorageSetItem(item)" text="Xem chi tiết" variant="tonal" color="primary" />
			</template>
			<template #item.TinhTrangKQHT="{item}">
				<v-chip v-if="item.isExistInKQHT" :color="renderColorTinhTrang(item.TinhTrangKQHT)">
					{{ item.TenTinhTrangKQHT ?? 'Không có' }}
				</v-chip>
				<v-chip v-else color="warning">
					Chưa có trong KQHT
				</v-chip>
			</template>
			<template #item.TinhTrangQLHS="{item}">
				<v-chip :color="renderColorTinhTrang(item.TinhTrangQLHS)">
					{{item.TenTinhTrangQLHS ? item.TenTinhTrangQLHS : 'Không có'}}
				</v-chip>
			</template>
		</v-data-table>
		<uc-modal-edit-profile v-model="isOpenModalEditProfile" :StudentProfile @onSubmitFinish="getHocSinh(false)" />
	</Global>
</template>

<script>
	export default {
		data() {
			return {
				vueData,
				items: [],
				headers: [
					{
						title: "STT",
						value: "STT",
						align: "center",
						width: 50,
						minWidth: 50
					},
					{
						title: "Thông tin học sinh",
						value: "ThongTinHocSinh",
						align: "center",
						width: 200,
						minWidth: 200,
					},
					{
						title: "Xem chi tiết",
						align: "center",
						value: "XemChiTiet",
						width: 200,
						minWidth: 200,
					},
					{
						title: "Tình trạng HS của phần mềm LMS",
						value: "TinhTrangKQHT",
						key: "TinhTrangKQHT",
						align: "center",
						width: 200,
						minWidth: 200,
					},
					{
						title: "Tình trạng HS của phần mềm QLHS",
						value: "TinhTrangQLHS",
						key: "TinhTrangQLHS",
						align: "center",
						width: 200,
						minWidth: 200,
					}
				],
				DSKhoi: [],
				DSLop: [],
				KhoiItem: null,
				LopItem: null,
				DSHocSinhSelected: [],
				StudentProfile: null,
				isOpenModalEditProfile: false
			}
		},
		mounted() {
			this.getKhoi()
		},
		computed: {
			TitleCap: function () { return renderText(parseInt(vueData.capid)) },
			TitlePage: function () { return getTitlePageByURL(window.location.pathname + window.location.search) }
		},
		watch: {
			"vueData.NienKhoa": function (nk) {
				this.getKhoi()
				this.KhoiItem = null
				this.LopItem = null
				this.items = []
			},
			KhoiItem: function (KhoiItem) {
				if (!KhoiItem) return
				this.LopItem = null
				this.items = []
				this.getLop()
			},
			LopItem: function (LopItem) {
				if (!LopItem) return
				this.items = []
				this.getHocSinh(true)
			}
		},
		methods: {
			async getKhoi() {
				this.DSKhoi = await fetchPromise("lms/KhoiHocByCapHoc_Get", {
					CapID: vueData.CapID
				})
			},
			async getLop() {
				this.DSLop = await fetchPromise("lms/Lop_Get_ByKhoiID", {
					NienKhoa: vueData.NienKhoa,
					KhoiID: this.KhoiItem.KhoiID
				})
			},
			async getHocSinh(forceRefresh = false) {
				this.DSHocSinhSelected = []
				const [DSHocSinhLop, DSHocSinh_LMS, DSHocSinhLop_LMS] = await fetchBatchPromise([
					{ url: 'lms/HocSinhLop_Get', params: { LopID: this.LopItem?.LopID, NienKhoa: vueData.NienKhoa } },
					{ url: 'student/LMS_GetHocSinh', params: { LopID: this.LopItem?.LopID, NienKhoa: vueData.NienKhoa } },
					{ url: 'student/LMS_GetHocSinhLop', params: { LopID: this.LopItem?.LopID, NienKhoa: vueData.NienKhoa } }
				], { forceRefresh });
	
				this.items = this.renderDSHocSinh(DSHocSinhLop, DSHocSinh_LMS, DSHocSinhLop_LMS)
				console.log("items", this.items)
			},
			renderDSHocSinh(DSHocSinhLop, DSHocSinh_LMS, DSHocSinhLop_LMS) {
				const eduBotHocSinhLop = []
				let items = []
				const currentDSHocSinhLop_LMS = DSHocSinhLop_LMS.filter(x => x.LopID == this.LopItem.LopID)
				for (var hsl of currentDSHocSinhLop_LMS) {
					const hs = DSHocSinh_LMS.find(x => x.HocSinhID === hsl.HocSinhID)
					if (hs) {
						eduBotHocSinhLop.push({ ...hsl, ...hs })
					}
				}
				const uniqueHocSinhID = [...new Set(eduBotHocSinhLop.map(x => x.HocSinhID))]
				for (var id of uniqueHocSinhID) {
					let obj = {}
					const hocSinh = DSHocSinhLop.find(x => x.HocSinhID === id)
					const hocSinhLMS = eduBotHocSinhLop.find(x => x.HocSinhID === id)
	
					obj.isExistInKQHT = !!hocSinh // ← thêm dòng này
	
					if (hocSinh) {
						//KQHT
						const _hs = DSHocSinhLop.find(x => x.HocSinhID === hocSinh.HocSinhID)
						obj.HSLopID = hocSinh.HSLopID
						obj.LopID = hocSinh.LopID
						obj.HocSinhID = _hs.HocSinhID
						obj.HoTen = _hs.Ho + ' ' + _hs.Ten
						obj.Ho = _hs.Ho
						obj.Ten = _hs.Ten
						obj.NgaySinh = _hs.NgaySinh
						obj.Nu = _hs.Nu
						obj.TinhTrangKQHT = _hs?.TinhTrang
						obj.TenTinhTrangKQHT = _hs?.TinhTrang === 2
							? "Nghỉ học (Tốt nghiệp)"
							: _hs?.TenTinhTrang
						obj.EnglishName = _hs?.EnglishName
					}
					if (hocSinhLMS) {
						//EDUBOT
						const _hs = eduBotHocSinhLop.find(x => x.HocSinhID === hocSinhLMS.HocSinhID)
						obj.HSLopID = hocSinhLMS.HSLopID
						obj.LopID = hocSinhLMS.LopID
						obj.HocSinhID = _hs.HocSinhID
						obj.HoTen = _hs.Ho + ' ' + _hs.Ten
						obj.Ho = _hs.Ho
						obj.Ten = _hs.Ten
						obj.NgaySinh = _hs.NgaySinh
						obj.Nu = _hs.Nu
						obj.TinhTrangQLHS = _hs?.TinhTrang
						obj.TenTinhTrangQLHS = _hs?.TinhTrang === 2
							? "Nghỉ học (Tốt nghiệp)"
							: _hs?.TenTinhTrang
					}
					items.push({
						...obj,
						HSLopID: hocSinhLMS.HSLopID,
						LopID: hocSinhLMS.LopID,
						SoDanhBo: hocSinhLMS.SoDanhBo,
						CreateUser: hocSinhLMS.CreateUser,
						CreateTime: hocSinhLMS.CreateTime,
						UpdateUser: hocSinhLMS.UpdateUser,
						UpdateTime: hocSinhLMS.UpdateTime,
					})
				}
				return items.sort((a, b) => {
					// Ưu tiên sắp xếp theo SoDanhBo (chuyển sang số nếu cần)
					const soA = isNaN(a.SoDanhBo) ? a.SoDanhBo : parseInt(a.SoDanhBo)
					const soB = isNaN(b.SoDanhBo) ? b.SoDanhBo : parseInt(b.SoDanhBo)
					if (soA < soB) return -1
					if (soA > soB) return 1
					// Nếu SoDanhBo giống nhau, sắp tiếp theo Tên
					const tenA = a.Ten?.toLowerCase() || ''
					const tenB = b.Ten?.toLowerCase() || ''
					return tenA.localeCompare(tenB)
				}).map((x, index) => {
					return {
						...x,
						STT: index + 1,
						HoTen: x.Ho + ' ' + x.Ten,
					}
				})
			},
			async insHocSinh() {
				const x = await fetchPromise("lms/IO_IN_HocSinh_Ins", {
					HocSinhObjArr: this.DSHocSinhSelected.map(x => ({ ...x, TinhTrang: x.TinhTrangQLHS, TenTinhTrang: x.TenTinhTrangQLHS }))
				}, { forceRefresh: true })
				const y = await fetchPromise("lms/IO_IN_HocSinhLop_Ins", {
					HocSinhLopObjArr: this.DSHocSinhSelected.map(x => ({ ...x, TinhTrang: x.TinhTrangQLHS, TenTinhTrang: x.TenTinhTrangQLHS }))
				}, { forceRefresh: true })
	
				await this.getHocSinh(true)
			},
			onOpenModalEditProfile(item) {
				this.StudentProfile = { ...item }
				this.isOpenModalEditProfile = true
			},
			localStorageSetItem(item) {
				const bottomNavigation = localStorage.getItem('tabBottomNavigation')
				if (bottomNavigation === null) localStorage.setItem('tabBottomNavigation', 0)
				const Semester = localStorage.getItem('Semester')
				if (Semester === null) localStorage.setItem('Semester', 1)
				localStorage.setItem('IsPassRoleParent', true)
				openWindow({
					title: 'Xem chi tiết ' + item.HoTen,
					url: `/ph-report?HocSinhID=${item.HocSinhID}`
				})
			},
			renderColorTinhTrang(TinhTrang) {
				let color = ''
				if (TinhTrang === 0) color = 'green'
				else if (TinhTrang === 1) color = 'red'
				else if (TinhTrang === 2) color = 'success'
				return color
			}
		},
	}
</script>