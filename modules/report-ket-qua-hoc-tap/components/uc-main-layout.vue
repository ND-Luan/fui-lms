<template>
	<div>
		<v-card-item class="pa-2">
			<v-card-title class="pb-0">
				<div class="d-flex justify-space-between w-100">
					<v-avatar :size="120" variant="tonal">
						<v-img alt="John" :src="urlAvatarHocSinh + HocSinhDetail.HocSinhID"></v-img>
					</v-avatar>
					<div>
						<v-menu>
							<template v-slot:activator="{ props }">
								<v-btn color="primary" prepend-icon="mdi-account-circle-outline" size="small"
									variant="text" v-bind="props">Chọn học
									sinh</v-btn>
							</template>
							<v-list>
								<v-list-item v-for="(item, index) in DSHocSinh" :key="index" :value="index"
									@click="onHandleSelectedSTD(item)" :disabled="item.Khoi <= 0">
									<v-list-item-title>{{ item.HoTen }}</v-list-item-title>
									<v-list-item-subtitle>{{ item.TenLop }}</v-list-item-subtitle>
									<template v-slot:prepend>
										<v-avatar>
											<v-img :src="urlAvatarHocSinh + item.StudentID" />
										</v-avatar>
									</template>
								</v-list-item>
							</v-list>
						</v-menu>
					</div>
				</div>
				<p class="font-weight-bold text-primary ms-3 mt-2">
					{{ HocSinhDetail.HoTen ?? "Chưa có thông tin" }}
				</p>
			</v-card-title>
			<v-card-text>
				<div class="d-flex">
					<b>Ngày sinh </b>
					<v-spacer /> <span>{{ HocSinhDetail.NgaySinh ?? '-' }}</span>
				</div>
				<div class="d-flex">
					<b>Giới tính </b>
					<v-spacer /> <span>{{ HocSinhDetail.Nu ? 'Nữ' : 'Nam' }}</span>
				</div>
				<div class="d-flex">
					<b>Năm học </b>
					<v-spacer /> <span>{{ HocSinhDetail.NienKhoa ?? '-' }}</span>
				</div>
				<div class="d-flex">
					<b>Lớp học </b>
					<v-spacer /> <span>{{ HocSinhDetail.TenLop ?? '-' }}</span>
				</div>
			</v-card-text>
		</v-card-item>
		<v-divider class="mx-auto" inset></v-divider>
		<p class="text-primary pl-4 pt-4 font-weight-medium text-title">
			Phụ huynh
		</p>
		<v-card class="ma-4" :flat="false" variant="elevated">
			<v-list-item>
				<v-list-item-title>
					{{ userAccount.LastName }} {{ userAccount.FirstName }}
					<v-icon v-if="userAccount.Sex" color="pink">mdi-gender-female</v-icon>
					<v-icon v-else color="primary">mdi-gender-male</v-icon>
				</v-list-item-title>
				<v-list-item-subtitle>{{ userAccount.Phone ?? '-' }}</v-list-item-subtitle>
				<template v-slot:prepend>
					<v-avatar>
						<v-img :src="urlAvatarPhuHuynh + userAccount.UserID" />
					</v-avatar>
				</template>
			</v-list-item>
		</v-card>
		<v-divider class="mx-auto mt-2" inset></v-divider>
		<p class="text-primary pl-4 pt-4 font-weight-medium text-title">Kỳ thi</p>
		<v-card>
			<v-card-title>
				<img src="/_cdn/lhbs-lms/icon_hk.png" height="30" />
				<p class="ml-4">Học kỳ 1</p>
			</v-card-title>
			<v-card-text class="d-flex flex-column ga-4">
				<v-card v-for="item in DSMonHocGroup" @click="handleClickMonHocGroup(item)" :flat="false"
					variant="elevated">
					<v-alert border="start" border-color="primary accent-4" elevation="2">
						<b>{{ item.Name_VI }}</b>
					</v-alert>
				</v-card>
			</v-card-text>
		</v-card>
		<v-bottom-sheet v-model="isShowSheet" fullscreen origin="overlap">
			<v-card size="small" style="
			background-image: url(/_cdn/lhbs-lms/bg_report.png);
			background-repeat: no-repeat;
			background-size: 100% 100%;
			height: 100vh;
			background-attachment: fixed;
			">
				<v-card-item class="pa-0">
					<v-card-title class="pa-2 bg-primary" style="height: 48px;">
						<v-avatar class="me-2">
							<v-img src="https://cdn.fui.vn/filedata/lhbs-lms/hinh1.jpg"></v-img>
						</v-avatar>
						<span>{{ MonHocGroup_Obj.Name_VI }}</span>
						<v-spacer />
						<v-btn icon="mdi-close" @click="isShowSheet = false" variant="text" />
					</v-card-title>
					<v-card-text class="pa-0" style="height: calc(100vh - 60px); overflow: auto">
						<h2 class="text-primary px-5 mt-3">Các môn học</h2>
						<v-expansion-panels v-model="arrayExpandValue" rounded multiple variant="popout"
							v-if="DSMonHoc_ByGroup.length > 0">

							<v-expansion-panel v-for="(item) in DSMonHoc_ByGroup" :key="item.id" class="my-2 shadow-box"
								selected-class="bg-primary">
								<v-expansion-panel-title style="border-radius: 0">
									<div class="d-flex flex-column justify-space-between">
										<p class="text-title font-weight-medium text-primary">{{ item.MonHocName }}</p>
										<p class="text-caption">Xếp loại: {{ item.XepLoai ?? '-' }}</p>
										<p class="text-caption">Điểm trung bình:
											<v-chip :color="getColorChipDiem(item.Diem)" size="small">
												{{ item.Diem ?? '-' }}
											</v-chip>
										</p>
									</div>
								</v-expansion-panel-title>
								<v-expansion-panel-text>
									<v-divider class="mx-auto w-50"></v-divider>
									<v-list>
										<div v-for="(diem, index) in DSDiem.filter(e => e.MonHocID === item.MonHocID)">
											<v-list-subheader class="text-primary font-weight-medium"
												v-if="DSDiem.filter(e => e.MonHocID === item.MonHocID)[index].TenNhomCotDiem_VI !== DSDiem.filter(e => e.MonHocID === item.MonHocID)[index - 1]?.TenNhomCotDiem_VI">
												<v-icon size="small" class="mb-1 me-1">mdi-star-four-points</v-icon>
												{{ diem.TenNhomCotDiem_VI }}
											</v-list-subheader>
											<v-list-item>
												<v-list-item-title class="text-body-2">
													<v-icon size="x-large">mdi-star-four-points-small</v-icon>
													{{ diem.TenCotDiem_VI }}
												</v-list-item-title>
												<template v-slot:append>
													<v-chip
														:color="getColorChipDiem(parseFloat(diem.KetQuaDanhGia_VI))">{{
															parseFloat(diem.KetQuaDanhGia_VI) }}</v-chip>
												</template>
											</v-list-item>
										</div>
										<v-divider class="mx-auto w-50"></v-divider>
										<v-list-item>
											<v-list-item-title class="text-body-2 font-weight-medium text-primary">
												<v-icon size="small" class="mb-1">mdi-lead-pencil</v-icon> Nhận xét
											</v-list-item-title>
											<v-list-item-subtitle class="noLineClamp">
												-
											</v-list-item-subtitle>
										</v-list-item>
									</v-list>
								</v-expansion-panel-text>
								<v-divider></v-divider>
							</v-expansion-panel>
						</v-expansion-panels>
						<uc-empty v-else />
					</v-card-text>
				</v-card-item>
			</v-card>
		</v-bottom-sheet>
	</div>
</template>

<script>
export default {
	props: [],
	data() {
		return {
			urlAvatarHocSinh: vueData.v_Set.urlAvatarHocSinh,
			urlAvatarPhuHuynh: vueData.v_Set.urlAvatarPhuHuynh,
			tabs: 'HK1',
			tabIndex: 0,
			isShowSheet: false,
			arrayExpandValue: [],
			DSHocSinh: [],
			userAccount: vueData.user,
			HocSinhDetail: {},
			DSHocKy: [
				{
					id: 1,
					name: 'HK1',
				},
				{
					id: 2,
					name: 'HK2',
				}
			],
			DSMonHocGroup: [
				{
					MonHocGroup: 1,
					Name_VI: 'KIẾN THỨC - KỸ NĂNG',
					Name_EN: '',
				},
				{
					MonHocGroup: 2,
					Name_VI: 'NĂNG LỰC CHUNG',
					Name_EN: '',
				},
				{
					MonHocGroup: 3,
					Name_VI: 'PHẨM CHẤT',
					Name_EN: '',
				},
				{
					MonHocGroup: 4,
					Name_VI: 'NĂNG LỰC RIÊNG',
					Name_EN: '',
				}
			],
			DSMonHoc: [],
			DSMonHoc_ByGroup: [],
			MonHocGroup_Obj: {},
			DSNhomDiem: [],
			HocSinhSelected: null
		}
	},
	mounted() {
		this.loadInfoHocSinh()
	},
	computed: {},
	watch: {
		tabs: function (val) {
			if (val) {
				this.loadHocSinhKQHT()
			}
		},
		HocSinhSelected: function (val) {
			console.log(val);
			if (val) {
				this.loadHocSinhDetail()
			}
		},
	},
	methods: {
		async loadInfoHocSinh() {
			const response = await hocSinhLopService.Calen_GetInfoStudentByPhuHuynhID()
			if (response.IsSuccess) {
				this.DSHocSinh = response.Result
				this.HocSinhSelected = response.Result[0]
			}

		},
		async loadHocSinhDetail() {
			const response = await hocSinhLopService.HocSinh_Detail_GetBy_HocSinhID({
				HocSinhID: this.HocSinhSelected.StudentID
			})
			console.log('response.Result', response);
			if (response.IsSuccess) {
				this.HocSinhDetail = response.Result
				this.loadHocSinhKQHT()
			}

		},
		async loadHocSinhKQHT() {
			const { DSMonHoc, DSDiem } = await HocSinhLMS_Service.HocSinh_KQHT({
				HocSinhID: this.DSHocSinh[0].StudentID,
				LopID: this.HocSinhDetail.LopID,
				Semester: this.tabs
			})
			this.DSMonHoc = _.cloneDeep(DSMonHoc)
			this.DSDiem = _.cloneDeep(DSDiem)
			this.DSNhomDiem
				= DSDiem.reduce((result, element) => {
					if (!result[element.TenNhomCotDiem_VI]) {
						result[element.TenNhomCotDiem_VI] = []
					}
					result[element.TenNhomCotDiem_VI].push(element)
					return result
				}, {});
			for (var i = 0; i < this.DSDiem.length; i++) {

			}
			console.log('this.DSNhomDiem', this.DSNhomDiem)
		},
		handleClickMonHocGroup(item) {
			this.isShowSheet = true
			this.DSMonHoc_ByGroup = this.DSMonHoc.filter(i => i.MonHocGroup === item.MonHocGroup)
			this.MonHocGroup_Obj = _.cloneDeep(item)
		},
		onHandleSelectedSTD(item) {
			this.HocSinhSelected = item
		},
		getColorChipDiem: getColorChipDiem
	},
}
</script>