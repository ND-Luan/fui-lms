<template>
	<v-data-table :headers="headers" :items="items">

	</v-data-table>

	<uc-dialog-reject v-model="action" :monHocItem="monHocItem" :dsMaNhomCotDiem_MonHoc="DSMaNhomCotDiem_MonHoc"
		@onFinishDialog="onLoadHocSinh" />

	<uc-dialog-approve v-model="action" :monHocItem="monHocItem" :dsMaNhomCotDiem_MonHoc="DSMaNhomCotDiem_MonHoc"
		@onFinishDialog="onLoadHocSinh" />
</template>

<script>
export default {
	props: {
		modelValue: {
			type: Object,
			required: true
		}
	},

	data() {
		return {
			vueData,
			tab: 0,
			action: {
				isShowDialogReject: false,
				isShowDialogApprove: false
			},
			monHocItem: null,
			DSMaNhomCotDiem_MonHoc: [],
			tabItems: [
				{ label: 'Môn chính khóa', value: 0 },
				{ label: 'Môn bổ trợ', value: 1 },
			],
			specialSubjects: {
				// TA: {
				//     ids: [5, 46, 76],
				//     name: 'Tiếng Anh'
				// },
				TV: {
					ids: [1, 74, 104],
					name: 'Tiếng Việt'
				},
				Toan: {
					ids: [2, 73, 103],
					name: 'Toán'
				}
			}
		}
	},
	computed: {
		hocSinh() {
			return this.modelValue
		},

		urlAvatarHocSinh() {
			return vueData.v_Set.urlAvatarHocSinh
		},
		rejectedByToTruong() {
			return this.getSubjectsRejectedBy('ToTruong');
		},
		rejectedByBGH() {
			return this.getSubjectsRejectedBy('BGH');
		},

		allSpecialSubjectIds() {
			return Object.values(this.specialSubjects).flatMap(subject => subject.ids)
		},

		filteredSubjects() {
			return vueData.DSMonHoc.filter(x =>
				!this.allSpecialSubjectIds.includes(x.MonHocID)
			)
		},

		DSMonHoc_ChinhKhoa() {
			return this.filteredSubjects.filter(x => x.Is_MonHoc_BoTro === 0)
		},

		DSMonHoc_BoTro() {
			const arr = this.filteredSubjects.filter(x => x.Is_MonHoc_BoTro === 1).map(monHoc => {
				const baseInfo = {
					MonHocID: monHoc.MonHocID,
					TenMonDuLieuNganh: monHoc.TenMonDuLieuNganh,

				}
				const grades = this.getGradesForSubject(monHoc)
				return { ...baseInfo, ...grades }
			})
			return arr
		},

		headers_ChinhKhoa() {
			const firstSubject = this.DSMonHoc_ChinhKhoa[0]
			if (!firstSubject) return []

			return this.buildHeaders(firstSubject)
		},

		items_ChinhKhoa() {
			return this.DSMonHoc_ChinhKhoa.map(monHoc => {
				const baseInfo = {
					MonHocID: monHoc.MonHocID,
					TenMonDuLieuNganh: monHoc.TenMonDuLieuNganh,

				}

				const grades = this.getGradesForSubject(monHoc)
				return { ...baseInfo, ...grades }
			})
		},
		headers() {
			let headers = this.modelValue.DSCotDiem
			const addHeaders = [
				{
					title: "NL-Mức độ đánh giá"
				},
				{
					title: "NL-Nhận xét"
				}
			]
			headers = headers.map(x => {
				return {
					title: x.TenCotDiem_VI,
					align: "center",
					value: x.MaCotDiem
				}
			})
			headers = [...headers, ...addHeaders]
			return headers
		},
		items() {
			const items = this.modelValue.DSCotDiem
			const obj = {}
			for (var item of items) {
				obj.HocSinhID = item.HocSinhID
				obj.HoTen = item.HoTen
				obj.NgaySinh = item.NgaySinh
				obj.Nu = item.NgaySinh
				obj[item.MaCotDiem] = item.KetQuaDanhGia_VI || item.KetQuaDanhGia_EN
			}
			return [obj]
		}
	},

	methods: {
		buildHeaders(monHoc) {
			const baseHeaders = [
				{
					title: "Tên môn học",
					value: "combineTenMonDuLieuNganh",
					minWidth: 200,
					fixed: true
				}
			]

			const gradeHeaders = this.getGradeHeaders(monHoc)

			return [
				...baseHeaders,
				...gradeHeaders,
				{
					title: "",
					value: "actions",
					right: 0,
					lastFixed: true
				}
			]
		},

		getGradeHeaders(monHoc) {
			const DSCotDiem = this.modelValue.DSCotDiem
				.filter(x => x.MonHocID === monHoc.MonHocID)

			const groupedColumns = _.groupBy(DSCotDiem, 'MaNhomCotDiem')

			return Object.entries(groupedColumns).map(([groupId, columns]) => {
				const group = columns[0]
				return {
					title: group.TenNhomCotDiem_VI,
					value: group.MaNhomCotDiem,
					align: 'center',
					children: columns.map(col => ({
						title: col.TenCotDiem_VI,
						value: col.MaCotDiem,
						minWidth: col.LoaiCotDiem === 'text' ? 500 : 200,
						align: 'center'
					}))
				}
			})
		},

		getSubjectsRejectedBy(type) {
			const rejected = {};

			if (!this.hocSinh?.DSCotDiem) return rejected;

			this.hocSinh.DSCotDiem.forEach(cotDiem => {
				// Xác định điều kiện từ chối dựa vào type
				const isRejected = type === 'ToTruong'
					? (cotDiem.ReasonReject_GV && cotDiem.Is_Reject_GV && cotDiem.TinhTrang === 3)
					: (cotDiem.ReasonReject_TT && cotDiem.Is_Reject_TT && cotDiem.TinhTrang === 5); // Giả sử TinhTrang = 5 là BGH từ chối

				const reasonReject = type === 'ToTruong'
					? cotDiem.ReasonReject_GV
					: cotDiem.ReasonReject_TT;

				const rejectTime = type === 'ToTruong'
					? cotDiem.TuChoi_GuiDiemTime
					: cotDiem.TuChoi_TT_Time; // Giả sử có trường này cho BGH

				if (isRejected) {
					const monHoc = cotDiem.TenMonDuLieuNganh;

					// Khởi tạo object môn học nếu chưa tồn tại
					if (!rejected[monHoc]) {
						rejected[monHoc] = {
							tenMon: monHoc,
							isBoTro: cotDiem.Is_MonHoc_BoTro === 1,
							nhomDiem: {}
						};
					}

					const maNhom = cotDiem.MaNhomCotDiem;

					// Kiểm tra và cập nhật thông tin nhóm điểm
					if (!rejected[monHoc].nhomDiem[maNhom]) {
						rejected[monHoc].nhomDiem[maNhom] = {
							maNhom: maNhom,
							tenNhom: cotDiem.TenNhomCotDiem_VI,
							ngayDuyet: rejectTime,
							reasonReject: reasonReject || 'Không có lý do'
						};
					} else {
						// Cập nhật nếu có thông tin mới hơn
						const existingDate = new Date(rejected[monHoc].nhomDiem[maNhom].ngayDuyet);
						const newDate = new Date(rejectTime);
						if (newDate > existingDate) {
							rejected[monHoc].nhomDiem[maNhom].ngayDuyet = rejectTime;
							rejected[monHoc].nhomDiem[maNhom].reasonReject = reasonReject;
						}
					}
				}
			});

			// Chuyển đổi nhomDiem từ object sang array và sắp xếp theo ngày
			Object.keys(rejected).forEach(monHoc => {
				rejected[monHoc].nhomDiem = Object.values(rejected[monHoc].nhomDiem)
					.sort((a, b) => new Date(b.ngayDuyet) - new Date(a.ngayDuyet));
			});

			return rejected;
		},
		getGradesForSubject(monHoc) {
			const grades = {
				List_MaNhomCotDiem: [],
				GroupedByTinhTrang: {}
			}

			const DSCotDiem = this.modelValue.DSCotDiem
				.filter(x => x.MonHocID === monHoc.MonHocID)

			DSCotDiem.forEach(cotDiem => {
				// Lưu điểm theo mã cột điểm
				grades[cotDiem.MaCotDiem] = cotDiem.KetQuaDanhGia_VI ?? cotDiem.KetQuaDanhGia_EN

				// Tạo object chứa thông tin nhóm
				const nhomInfo = {
					TinhTrang: cotDiem.TinhTrang,
					TenTinhTrang: cotDiem.TenTinhTrang,
					MauTinhTrang: cotDiem.MauTinhTrang,
					MaNhomCotDiem: cotDiem.MaNhomCotDiem,
					TenNhomCotDiem_VI: cotDiem.TenNhomCotDiem_VI
				}

				// Kiểm tra xem nhóm đã tồn tại trong danh sách chưa
				const existingNhom = grades.List_MaNhomCotDiem.find(
					nhom => nhom.MaNhomCotDiem === cotDiem.MaNhomCotDiem
				)

				// Nếu chưa tồn tại thì thêm vào danh sách
				if (!existingNhom) {
					grades.List_MaNhomCotDiem.push(nhomInfo)

					// Thêm vào grouped list
					const tinhTrangKey = cotDiem.TinhTrang.toString()
					if (!grades.GroupedByTinhTrang[tinhTrangKey]) {
						grades.GroupedByTinhTrang[tinhTrangKey] = {
							TenTinhTrang: cotDiem.TenTinhTrang,
							MauTinhTrang: cotDiem.MauTinhTrang,
							Nhoms: []
						}
					}
					grades.GroupedByTinhTrang[tinhTrangKey].Nhoms.push(nhomInfo)
				}

				// Cập nhật thông tin tình trạng chung của môn học
				grades.TinhTrang = cotDiem.TinhTrang
				grades.TenTinhTrang = cotDiem.TenTinhTrang
				grades.MauTinhTrang = cotDiem.MauTinhTrang
			})

			return grades
		},


		getHeadersForBoTro(monHoc) {
			return this.getGradeHeaders(monHoc)
		},

		getItemsForBoTro(monHoc) {
			return [{
				MonHocID: monHoc.MonHocID,
				...this.getGradesForSubject(monHoc)
			}]
		},

		getSpecialSubject(type) {
			const subjectIds = this.specialSubjects[type].ids
			return vueData.DSMonHoc.find(x => subjectIds.includes(x.MonHocID))
		},

		getSpecialSubjectHeaders(type) {
			const subject = this.getSpecialSubject(type)
			if (!subject) return []

			return this.getGradeHeaders(subject)
		},

		getSpecialSubjectItems(type) {
			const subject = this.getSpecialSubject(type)
			if (!subject) return []

			return [{
				MonHocID: subject.MonHocID,
				...this.getGradesForSubject(subject)
			}]
		},
		getSubjectStatus(type) {
			const subject = this.getSpecialSubject(type);
			if (!subject) return null;

			const grades = this.getGradesForSubject(subject);
			return grades.GroupedByTinhTrang;
		},

		isSubjectDisabled(type) {
			const subject = this.getSpecialSubject(type);
			if (!subject) return true;

			const grades = this.getGradesForSubject(subject);
			return grades.TinhTrang === 4;
		},

		handleReject(item) {
			const listMonHoc = this.modelValue.DSCotDiem.filter(x => x.MonHocID === item.MonHocID)
			const DSMaNhomCotDiem = [...new Set(listMonHoc.map(x => x.MaNhomCotDiem))]

			this.monHocItem = _.cloneDeep({ ...item, ...listMonHoc[0] })
			this.DSMaNhomCotDiem_MonHoc = DSMaNhomCotDiem.map(x => {
				const objExist = listMonHoc.find(y => y.MaNhomCotDiem === x)
				return {
					TenNhomCotDiem_VI: objExist?.TenNhomCotDiem_VI ?? '',
					MaNhomCotDiem: objExist?.MaNhomCotDiem ?? '',
					TinhTrang: objExist?.TinhTrang ?? '',
					TenTinhTrang: objExist?.TenTinhTrang ?? '',
					MauTinhTrang: objExist?.MauTinhTran ?? ''
				}
			})
			this.action.isShowDialogReject = true
		},

		handleSendManager(item) {
			const $this = this

			const listMonHoc = this.modelValue.DSCotDiem.filter(x => x.MonHocID === item.MonHocID)
			const DSMaNhomCotDiem = [...new Set(listMonHoc.map(x => x.MaNhomCotDiem))]

			this.monHocItem = _.cloneDeep({ ...item, ...listMonHoc[0] })
			this.DSMaNhomCotDiem_MonHoc = DSMaNhomCotDiem.map(x => {
				const objExist = listMonHoc.find(y => y.MaNhomCotDiem === x)
				return {
					TenNhomCotDiem_VI: objExist?.TenNhomCotDiem_VI ?? '',
					MaNhomCotDiem: objExist?.MaNhomCotDiem ?? '',
					TinhTrang: objExist?.TinhTrang ?? '',
					TenTinhTrang: objExist?.TenTinhTrang ?? '',
					MauTinhTrang: objExist?.MauTinhTran ?? ''
				}
			})
			this.action.isShowDialogApprove = true
		},
		onLoadHocSinh() {
			CALL('HocSinhBangDiem_Get')
		}
	}
}
</script>