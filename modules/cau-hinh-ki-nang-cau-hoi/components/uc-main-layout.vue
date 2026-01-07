<template>
	<uc-admin-layout class="pa-4">
		<v-card class="elevation-2 ">
			<v-card-title class='text-primary'>Tìm kiếm</v-card-title>
			<v-card-text>
				<v-row>
					<v-col cols="12" sm="12" md="2" lg="2">
						<v-autocomplete v-model="CapID" label="Chọn cấp" :items="DSCap" min-width="50"
							variant="outlined" hide-details="auto" :clearable="false"></v-autocomplete>
					</v-col>
					<v-col cols="12" sm="12" md="2" lg="2">
						<v-autocomplete v-model="MonHocID" label="Chọn môn học" :items="DSMonHoc" min-width="50"
							variant="outlined" hide-details="auto" :clearable="false"></v-autocomplete>
					</v-col>
					<!-- <v-col cols="12" sm="12" md="2" lg="2">
						<v-btn @click="loadDSCommentGroup" color="primary" variant="elevated">Lấy dữ liệu</v-btn>
					</v-col> -->
				</v-row>
			</v-card-text>
		</v-card>
		<v-card class="mt-4 elevation-2">
			<v-row no-gutters>
				<v-col cols="12" md="5"><v-card-title class="d-flex text-primary align-center">
						Nhóm kĩ năng
						<v-chip v-if="TenMonHoc" class="ml-2" color="primary">
							{{ TenMonHoc }}
						</v-chip>
						<v-spacer></v-spacer>
						<v-text-field v-model="SearchGroup" label="Tìm kiếm" variant="filled"
							prepend-inner-icon="mdi-magnify" color="primary" :clearable="false" />
						<v-btn @click="openGroupCreateModal" icon="mdi-plus" variant="outlined" color="primary"
							size="medium" class="ml-2"></v-btn>
					</v-card-title>
					<v-data-table class="tTable overflow-auto" :items="DSCommentGroup" :search="SearchGroup"
						:headers="createHeadersCommentGroup()" hide-default-footer items-per-page="-1" fixed-header
						style="max-height: calc(100dvh - 104px);">
						<template v-slot:item.STT="{ index }">
							<span>{{ index + 1 }}</span>
						</template>
						<template v-slot:item.Detail="{ item }">
							<v-btn @click="onOpenDetail(item)" size="small" variant="tonal" color="primary">
								Chi tiết
							</v-btn>
						</template>
						<template v-slot:item.SoLuongMau="{ item }">
							<v-chip color="success" size="small">{{ item.SoLuongMau }} mẫu</v-chip>
						</template>

						<template v-slot:item.Actions="{ item }">
							<v-btn @click="onEditGroupItem(item)" density="compact" icon="mdi-square-edit-outline"
								variant="text" color="green darken-2" size="medium" />
							<v-btn @click="onDeleteGroupItem(item)" density="compact" icon="mdi-trash-can-outline"
								variant="text" color="red darken-3" size="medium" />
						</template>
					</v-data-table>
				</v-col>
				<v-divider vertical></v-divider>
				<v-col cols="12" md="7">
					<v-card-title class="d-flex text-primary align-center ">
						Chi tiết nhóm kĩ năng
						<v-chip class="ml-2" v-if="titleCommentDetail">{{ titleCommentDetail }}</v-chip>
						<v-spacer></v-spacer>
						<v-text-field v-model="SearchDetail" label="Tìm kiếm" variant="filled"
							prepend-inner-icon="mdi-magnify"></v-text-field>
						<v-btn @click="openDetailCreateModal" class="ml-2" icon="mdi-plus" variant="outlined"
							size="medium" />
					</v-card-title>
					<v-data-table class="tTable" :search="SearchDetail" :items="DSCommentDetail"
						:headers="createHeadersCommentDetail()" hide-default-footer :items-per-page="-1" fixed-header
						style="max-height: calc(100dvh - 104px);">
						<template v-slot:item.STT="{ index }">
							<span>{{ index + 1 }}</span>
						</template>
						<template v-slot:item.Actions="{ item }">
							<v-btn @click="onEditDetailItem(item)" density="compact" icon="mdi-square-edit-outline"
								variant="text" color="green darken-2" size="medium" />
							<span>
								<v-btn @click="onDeleteDetailItem(item)" density="compact" icon="mdi-trash-can-outline"
									variant="text" color="red darken-3" size="medium" />
							</span>
						</template>
					</v-data-table>
				</v-col>
			</v-row>
		</v-card>
		<uc-group-create-modal v-model="isOpenCreateGroup" :submit="Ins_Group" />
		<uc-group-edit-modal v-model="isOpenEditGroup" :skillGroup="SkillGroupEdit" :submit="Upd_Group" />
		<uc-detail-create-modal v-model="isOpenCreateDetail" :submit="insCommentDetail" />
		<uc-detail-edit-modal v-model="isOpenEditDetail" :skillDetailEdit="SkillDetailEdit"
			:submit="editCommentDetail" />
	</uc-admin-layout>
</template>
<script>
export default {
	props: [],
	data() {
		return {
			MonHocID: null, //id môn học được chọn trên combobox,
			MonHocHienTai: null, // môn học đã load nhóm nhận xét, chỉ thay đổi khi load dữ liệu mới
			SkillGroupDaChon: null,
			SkillGroupEdit: {},
			SkillDetailEdit: {},
			DSMonHoc: [],
			DSCommentGroup: [],
			DSCommentDetail: [],
			isOpenCreateGroup: false,
			isOpenEditGroup: false,
			isOpenCreateDetail: false,
			isOpenEditDetail: false,
			SearchGroup: '',
			SearchDetail: '',
			DSCap: [
				{
					title: 'Cấp 1',
					value: 1
				},
				{
					title: 'Cấp 2',
					value: 2
				},
				{
					title: 'Cấp 3',
					value: 3
				}
			],
			CapID: null
		}
	},
	mounted() {
		// this.createDSMonHoc();
		this.CapID = 2
	},
	watch: {
		CapID: function (val) {
			if (val) {
				this.getDSMonHoc()
			}
		},
		MonHocID: function (val) {
			if (val) {
				this.DSCommentDetail = []
				this.getDSGroup()
			}
		}
	},
	computed: {
		titleCommentDetail: function () {
			return this.SkillGroupDaChon ? `${this.SkillGroupDaChon.NhomKyNang ?? ''}` : '';
		},
		TenMonHoc: function () {

			return this.DSMonHoc.find(mh => mh.value == this.MonHocID)?.title ?? '-'
		}
	},
	methods: {
		async getCommnetDetail(KyNang_MonHocID) {
			const res = await apiService('lms/EL_KyNang_MonHoc_ChiTiet_Get', { KyNang_MonHocID: KyNang_MonHocID }, 'GET')
			this.DSCommentDetail = res
		},

		async editCommentGroup(cmtGroup) {
			try {
				await apiUtil_V3.kqht('CommentGroup_Upd', cmtGroup);
				Vue.$toast.success('Cập nhật thành công', { position: 'top' })
				this.loadDSCommentGroup();
			} catch (error) {
				console.log("Error in editCommentGroup", error);
			}
		},
		onDeleteGroupItem(item) {
			confirm({
				title: 'Xác nhận xoá',
				//content:`Xoá nhóm nhận xét ${item.CommentDetailName_EN}`,
				action: async () => {
					const res = await this.apiService('lms/EL_KyNang_MonHoc_ChiTiet_Del', { KyNang_MonHoc_ChiTietID: item.KyNang_MonHoc_ChiTietID });
					this.getDSGroup();
					Vue.$toast.success('Xoá thành công', { position: 'top' })
				}
			})
		},
		async insCommentDetail(TenKiNang, MoTaKiNang) {
			try {
				await apiService('lms/EL_KyNang_MonHoc_ChiTiet_Ins', {
					KyNang_MonHocID: this.SkillGroupDaChon.KyNang_MonHocID,
					TenKyNang: TenKiNang,
					MoTaKyNang: MoTaKiNang
				})
				Vue.$toast.success('Thêm thành công', { position: 'top' })
				//load lại bảng detail
				this.getCommnetDetail(this.SkillGroupDaChon.KyNang_MonHocID);
				this.getDSGroup()
			} catch (error) {
				console.log("Error in insCommentDetail", error);
			}
		},
		async editCommentDetail(cmtDetail) {
			try {
				await apiService('lms/EL_KyNang_MonHoc_ChiTiet_Upd', cmtDetail);
				Vue.$toast.success('Cập nhật thành công', { position: 'top' })
				//load lại bảng detail
				this.getCommnetDetail(this.SkillGroupDaChon.KyNang_MonHocID);
				this.getDSGroup()
			} catch (error) {
				console.log("Error in editCommentGroup", error);
			}
		},
		onDeleteDetailItem(item) {
			confirm({
				title: 'Xác nhận xoá',
				//content:`Xoá nhóm nhận xét ${item.CommentDetailName_EN}`,
				action: async () => {
					await apiService('lms/EL_KyNang_MonHoc_Del', { KyNang_MonHocID: item.KyNang_MonHocID });
					Vue.$toast.success('Xoá thành công', { position: 'top' })
					//load lại bảng detail
					this.getCommnetDetail(this.SkillGroupDaChon.KyNang_MonHocID);
					this.getDSGroup()
				}
			})
		},
		async createDSMonHoc() {
			const subjects = await this.getSubject();
			this.DSMonHoc = subjects;
		},
		async loadDSCommentGroup() {
			if (!this.MonHocID) {
				this.DSCommentGroup = [];
			} else {
				try {
					const list = await this.getCommentGroup(this.MonHocID);
					this.DSCommentGroup = list;
				} catch (error) {
					console.log("Error in loadDSCommentGroup", error);
				}
			}
			this.MonHocHienTai = this.DSMonHoc.find(mh => mh.MonHocID === this.MonHocID);
			//khởi tạo lại dữ liệu khi load CommentGroup mới
			this.DSCommentDetail = [];
			this.SkillGroupDaChon = null;
			this.SearchGroup = '';
		},
		async onOpenDetail(item) {
			try {
				this.getCommnetDetail(item.KyNang_MonHocID);
				this.SkillGroupDaChon = item;

			} catch (error) {
				console.log("Error in onOpenDetail", error);
			}
		},
		renderTitleSubject(item) {
			return item.MonHocName;
		},
		createHeadersCommentGroup() {
			const headers = [
				{ title: 'STT', key: 'STT', align: 'center', sortable: false, width: "50px" },
				{ title: 'Nhóm kĩ năng', key: 'NhomKyNang', width: "35%", sortable: false },
				// { title: 'Số lượng mẫu', key: 'SoLuongMau', width: "15%", align: 'center', sortable: false, width: "100px" },
				{ key: 'Detail', value: 'Detail', title: 'Xem chi tiết', align: 'center', sortable: false, width: "100px" },
				{ key: 'Actions', value: 'Actions', minWidth: "80px", sortable: false, sortable: false, width: "80px", align: 'center' },
			];
			return headers;
		},
		createHeadersCommentDetail() {
			const headers = [
				{ title: 'STT', key: 'STT', align: 'center', width: "50px", sortable: false },
				{ title: 'Tên kĩ năng', value: 'TenKyNang', key: 'TenKyNang', minWidth: "100px", maxWidth: "200px", sortable: false },
				{ title: 'Mô tả', value: 'MoTaKyNang', key: 'MoTaKyNang', minWidth: "100px", maxWidth: "200px", sortable: false },
				{ key: 'Actions', value: 'Actions', align: 'center', minWidth: "80px", sortable: false, width: "80px" },
			];
			return headers;
		},
		onEditGroupItem(item) {
			this.SkillGroupEdit = JSON.parse(JSON.stringify(item)); //clone item
			this.openGroupEditModal();
		},
		openGroupCreateModal() {
			if (this.MonHocID) { // Chỉ mở khi đã lấy dữ liệu nhóm nhận xét của một môn học
				this.isOpenCreateGroup = true;
			}
		},
		openGroupEditModal() {
			const obj = this.SkillGroupEdit;
			if (obj.MonHocID && obj.KyNang_MonHocID) {
				this.isOpenEditGroup = true;
			}
		},
		onEditDetailItem(item) {
			this.SkillDetailEdit = JSON.parse(JSON.stringify(item));
			this.openDetailEditModal();
		},
		openDetailCreateModal() {
			if (this.SkillGroupDaChon) {
				this.isOpenCreateDetail = true;
			}
		},
		openDetailEditModal() {
			const obj = this.SkillDetailEdit;
			if (obj.KyNang_MonHoc_ChiTietID && obj.KyNang_MonHocID) {
				this.isOpenEditDetail = true;
			}
		},
		async getDSMonHoc() {
			let params = {
				CapID: this.CapID
			}
			const res = await apiService('lms/MonHoc_Get_ByCapID', params, 'GET')
			this.DSMonHoc = res.map(mh => ({ title: mh.MonHocName, value: mh.MonHocID }))
			if (this.CapID == 2) {
				this.MonHocID = 46

			} else {
				this.MonHocID = this.DSMonHoc[0].value

			}
			console.log('this.DSMonHoc ', this.DSMonHoc)
		},

		async getDSGroup() {
			let params = {
				MonHocID: this.MonHocID
			}
			const res = await apiService('lms/EL_KyNang_MonHoc_Get', params, 'GET')
			this.DSCommentGroup = res
		},

		async Ins_Group(NhomKyNang) {
			let params = {
				MonHocID: this.MonHocID,
				NhomKyNang: NhomKyNang
			}
			const res = await apiService('lms/EL_KyNang_MonHoc_Ins', params, 'CDT')
			if (res) {
				this.getDSGroup()
				Vue.$toast.success('Thêm nhóm nhận xét thành công!', { position: 'top' })
			}
		},

		async Upd_Group(cmtGroup) {
			let params = {
				KyNang_MonHocID: cmtGroup.KyNang_MonHocID,
				MonHocID: this.MonHocID,
				NhomKyNang: cmtGroup.NhomKyNang,
			}
			const res = await apiService('lms/EL_KyNang_MonHoc_Upd', params, 'CDT')
			if (res) {
				this.getDSGroup()
				Vue.$toast.success('Cập nhật nhóm nhận xét thành công!', { position: 'top' })
			}
		},
		apiService
	},
}
</script>