<template>
	<v-card>
		<v-card-title class="d-flex">
			<p>Kiểm tra tiến độ nhập điểm</p>
			<v-spacer></v-spacer>
			<div class="d-flex ga-2">
				<v-select label="Chọn cấp" v-model="CapID" :items="DSCap" style="width: 200px;"></v-select>
				<v-select label="Chọn khối" v-model="KhoiID" :items="DSKhoi" item-title="TenKhoiHoc" item-value="KhoiID"
					style="width: 200px;"></v-select>
				<v-btn variant="outlined" @click="getData()">Làm mới</v-btn>
			</div>
		</v-card-title>
		<v-card-text>
			<div class="d-flex ga-2 align-center" v-if="vueData.user.UserID == 'NA0000022'">
				<h3>Phân công giáo viên:</h3>
				<v-text-field label="Mã giáo viên" v-model="formData.GiaoVienID" style="max-width: 200px;"
					density="compact" hide-details="auto"></v-text-field>
				<v-select :items="DSLopOriginal" item-title="TenLop" item-value="LopID" label="Lớp học"
					v-model="formData.LopID" style="max-width: 200px;" density="compact" hide-details="auto"></v-select>
				<v-select :items="DSMonHocOriginal" item-title="TenMonHoc_HienThi" item-value="MonHocID"
					label="Môn học " v-model="formData.MonHocID" style="max-width: 200px;" density="compact"
					hide-details="auto"></v-select>
				<v-btn variant="outlined" @click="addGiaoVienLop()">Thêm</v-btn>
			</div>
			<div class="d-flex my-3" style="background-color: aliceblue;">
				<div class="pa-3  d-flex flex-column ga-2">
					<div>
						<v-chip color="orange" size="x-small">unknow</v-chip>: Chưa phân giáo viên hoặc không phân giáo
						viên
						vì lớp không học môn này
					</div>
					<div>
						<v-chip color="pink" size="x-small">{MaNhomCotDiem}</v-chip> : Đã chấm điểm
					</div>
					<div>
						<v-chip color="primary" size="x-small">{MaGiaoVien}</v-chip> : Đã phân công giáo viên cho lớp và
						môn
						học
					</div>
				</div>
				<v-spacer></v-spacer>

			</div>

			<v-data-table :items="DataTable" :headers="headers" class="custom-table" hide-default-footer>
				<template #item.TenLop="{ item }">
					<div class="d-flex flex-column ga-2">
						<span @click="(item) => { console.log('Lop', item) }">{{ item.TenLop }}</span>
					</div>
				</template>
				<template v-for="(c, index) in DSMonHocCode" v-slot:[getStringSlot(c)]="{ item }">
					<div class="d-flex flex-column ga-2 py-2">
						<div>
							<v-chip :color="renderGVMonHoc(item.TenLop, c).color" size="x-small">
								{{ renderGVMonHoc(item.TenLop, c).MaGiaoVien }}
							</v-chip>
						</div>
						<div class="d-flex ga-2">
							<v-chip color="pink" v-for="(mnd, index1) in item[c]" size="x-small"
								@click="(mnd) => { console.log('MaNhomDiem', mnd) }">
								{{ mnd.MaNhomCotDiem }}
							</v-chip>
						</div>
					</div>
				</template>
			</v-data-table>
		</v-card-text>
	</v-card>
</template>

<script>
export default {
	props: [],
	data() {
		return {
			vueData,
			CapID: 2,
			KhoiID: 6,
			code: 'TD',
			DSCap: [
				{
					title: "Cấp 1",
					value: 1
				},
				{
					title: "Cấp 2",
					value: 2
				},
				{
					title: "Cấp 3",
					value: 3
				}
			],
			DSKhoi: [],
			DSMonHocCode: [],
			DataTable: [],
			headers: [],
			_,
			DSGiaoVien: [],
			DSLopOriginal: [],
			formData: {
				GiaoVienID: '',
				LopID: null,
				MonHocID: null
			},
			DSMonHocOriginal: [],
		}
	},
	mounted() {
		if (this.CapID && this.KhoiID) this.getKhoi(); this.getData()
	},
	computed: {
	},
	watch: {
		CapID(val) {
			if (val) {
				this.KhoiID = null
				this.formData = {
					GiaoVienID: '',
					LopID: null,
					MonHocID: null
				}
				this.getKhoi()
			}
		},
		KhoiID(val) {
			if (val) {
				this.formData = {
					GiaoVienID: '',
					LopID: null,
					MonHocID: null
				}
				this.getData()
			}
		}
	},
	methods: {
		getData() {
			if (!this.KhoiID || !this.CapID) return
			this.DataTable = []
			ajaxCALL('/lms/TienDo_NhapDiem', {
				NienKhoa: vueData.NienKhoa,
				CapID: this.CapID,
				KhoiID: this.KhoiID
			}, res => {
				let DSMonHocLopDaNhapDiem = res.data[0]
				let DSBangDiemChiTietCacMonHoc = res.data[1]
				this.DSGiaoVien = res.data[2]
				let DSMonHocOriginal = res.data[3]
				this.DSMonHocOriginal = [...DSMonHocOriginal]
				let DSLopOriginal = res.data[4]
				this.DSLopOriginal = [...DSLopOriginal]
				let DSLopHoc = [...new Set(DSMonHocLopDaNhapDiem.map(item => item.TenLop))]
				let DSMonHoc = [...new Set(DSBangDiemChiTietCacMonHoc.sort((a, b) => a.Sort - b.Sort).map(item => item.TenMonHoc_HienThi))]
				let DSMonHocCode = [...new Set(DSBangDiemChiTietCacMonHoc.sort((a, b) => a.Sort - b.Sort).map(item => item.MonHocCode))]
				this.DSMonHocCode = [...DSMonHocCode]
				let headers = [
					{
						title: 'Tên lớp',
						value: "TenLop"
					}
				]
				DSMonHoc.forEach((mh, index) => {
					let MonHocID = DSMonHocOriginal.find(item => mh == item.TenMonHoc_HienThi)?.MonHocID
					let title = mh
					if (vueData.user.UserID == 'NA0000022') {
						title = mh + ` - ${MonHocID}`
					}
					headers.push({
						title: title,
						key: DSMonHocCode[index],
						sortable: false
					})
				})
				DSLopHoc.forEach((item, index) => {
					let LopID = DSLopOriginal.find(lop => item == lop.TenLop)?.LopID
					let objLop = {
						TenLop: item,
						LopID: LopID
					}
					DSMonHocCode.forEach((mhc, index) => {
						objLop[mhc] = DSMonHocLopDaNhapDiem.filter(data => data.TenLop == item && data.MonHocCode == mhc)
						//Check Trùng
						objLop[mhc] = _(objLop[mhc])
							.groupBy('MaNhomCotDiem')
							.map(group => _.maxBy(group, 'TinhTrang'))
							.value()
					})
					this.DataTable.push(objLop)
				})
				this.headers = [...headers]
				console.log('headers', headers)
				console.log('this.DataTable', this.DataTable)
			})
		},
		getKhoi() {
			ajaxCALL('/lms/KhoiHocByCapHoc_Get', {
				CapID: this.CapID
			}, res => {
				this.DSKhoi = res.data
			})

		},
		getStringSlot(monhoccode) {
			let string = `item.${monhoccode}`
			return string
		},
		renderGVMonHoc(TenLop, MonHocCode) {
			let findGV = this.DSGiaoVien.find(item => item.TenLop == TenLop && item.MonHocCode == MonHocCode)
			if (!findGV) return { MaGiaoVien: 'unknow', color: 'orange' }
			return { MaGiaoVien: findGV?.GiaoVienID ?? 'null', color: 'primary' }
		},
		addGiaoVienLop() {
			if (!this.CapID || !this.KhoiID || !this.formData.LopID || !this.formData.MonHocID || !this.formData.GiaoVienID) return alert('Vui lòng chọn đầy đủ thông tin')
			let payload = {
				GiaoVienID: this.formData.GiaoVienID,
				LopID: this.formData.LopID,
				MonHocID: this.formData.MonHocID,
				NienKhoa: vueData.NienKhoa,
				CapID: this.CapID,
				KhoiID: this.KhoiID
			}
			ajaxCALL('/lms/GiaoVienLop_Ins', payload, res => {
				if (res) {
					Vue.$toast.success('Thêm thành công')
					this.getData()
					this.formData = {
						GiaoVienID: '',
						LopID: null,
						MonHocID: null
					}
				}
			})
			console.log('payload', payload)
		}
	}


}
</script>