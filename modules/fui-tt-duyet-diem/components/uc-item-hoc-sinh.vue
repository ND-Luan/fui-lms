<template>
	<v-row class="ma-9">
		<!-- Phần thông tin học sinh -->
		<v-col cols="2" class="text-center">
			<v-avatar color="grey" size="80">
				<v-img :src="urlAvatarHocSinh + hocSinh?.HocSinhID" cover></v-img>
			</v-avatar>
			<p class="font-weight-medium">
				{{ hocSinh?.HoTen }} <uc-gender v-model="hocSinh.Nu" />
			</p>
			<p class="text-body-2">{{ hocSinh.HocSinhID }} • {{ hocSinh?.NgaySinh }}</p>
			<v-divider class="my-2"></v-divider>
			<div class="text-left">
				<p class="font-weight-medium text-title text-error">Tổ Trưởng - Môn học bị từ chối:</p>
				<div v-if="Object.keys(rejectedByToTruong).length > 0">
					<!-- Lặp qua từng môn học -->
					<div v-for="(subject, monHoc) in rejectedByToTruong" :key="monHoc" class="subject-container">
						<!-- Tên môn học -->
						<div class="subject-header">
							<v-icon color="error" size="small" class="mr-2">mdi-book-remove</v-icon>
							<span class="font-weight-medium">{{ subject.tenMon }}</span>
						</div>

						<!-- Danh sách nhóm điểm và lý do từ chối -->
						<div class="groups-list">
							<div v-for="nhom in subject.nhomDiem" :key="nhom.maNhom" class="group-item">
								<div>
									<span class="group-name mr-2">• {{ nhom.tenNhom }}:</span>
									<span>{{ nhom.reasonReject }}</span>
								</div>
							</div>
						</div>
						<v-divider inset class="my-2"></v-divider>
					</div>
				</div>
				<div v-else class="text-body-2 text-grey text-center">
					Không có môn học nào bị từ chối
				</div>
			</div>
			<v-divider class="my-2"></v-divider>
			<div class="text-left">
				<p class="font-weight-medium text-title text-error">BGH - Môn học bị từ chối:</p>
				<div v-if="Object.keys(rejectedByBGH).length > 0">
					<!-- Lặp qua từng môn học -->
					<div v-for="(subject, monHoc) in rejectedByBGH" :key="monHoc" class="subject-container">
						<!-- Tên môn học -->
						<div class="subject-header">
							<v-icon color="error" size="small" class="mr-2">mdi-book-remove</v-icon>
							<span class="font-weight-medium">{{ subject.tenMon }}</span>
						</div>

						<!-- Danh sách nhóm điểm và lý do từ chối -->
						<div class="groups-list">
							<div v-for="nhom in subject.nhomDiem" :key="nhom.maNhom" class="group-item">
								<div>
									<span class="group-name mr-2">• {{ nhom.tenNhom }}:</span>
									<span>{{ nhom.reasonReject }}</span>
								</div>
							</div>
						</div>
						<v-divider inset class="my-2"></v-divider>
					</div>
				</div>
				<div v-else class="text-body-2 text-grey text-center">
					Không có môn học nào bị từ chối
				</div>
			</div>
		</v-col>

		<!-- Phần tabs và nội dung -->
		<v-col cols="10">
			<v-tabs v-model="tab">
				<v-tab v-for="(item, index) in tabItems" :key="index" :value="index">
					{{ item.label }}
				</v-tab>
			</v-tabs>

			<v-tabs-window v-model="tab">
				<!-- Tab 1: Môn chính khóa -->
				<v-tabs-window-item :value="0">
					<!-- Lặp qua 2 môn học chính -->
					<v-card border class="mt-2">
						<v-card-title>
							<div class="d-flex justify-space-between align-center w-100">
								<div>
									<div class="text-h6">{{ specialSubjects['TV'].name }}</div>

									<!-- Phần trạng thái -->
									<div class="flex-grow-1 px-4">
										<template v-if="getSubjectStatus('TV')">
											<div v-for="(group, tinhTrang) in getSubjectStatus('TV')" :key="tinhTrang">
												<div :class="'text-'+group.MauTinhTrang">
													• {{ group.TenTinhTrang }}
												</div>
												<div class="d-flex flex-wrap ga-2">
													<v-chip v-for="nhom in group.Nhoms" :key="nhom.MaNhomCotDiem"
														size="small" :color="group.MauTinhTrang" class="ma-1">
														{{ nhom.TenNhomCotDiem_VI }}
													</v-chip>
												</div>
											</div>
										</template>
									</div>
								</div>

								<!-- Phần nút thao tác -->
								<div class="d-flex ga-2">
									<v-btn color="error" @click="handleReject(getSpecialSubject('TV'))"
										:disabled="isSubjectDisabled('TV')">
										Từ chối
									</v-btn>
									<v-btn color="primary" @click="handleSendManager(getSpecialSubject('TV'))"
										:disabled="isSubjectDisabled('TV')">
										Gửi BGH
									</v-btn>
								</div>
							</div>
						</v-card-title>

						<v-data-table class="custom-border border-t-sm" :headers="getSpecialSubjectHeaders('TV')"
							:items="getSpecialSubjectItems('TV')" :items-per-page="-1" hide-default-footer />
					</v-card>

					<!-- Môn Toán -->
					<v-card border class="mt-2">
						<v-card-title>
							<div class="d-flex justify-space-between align-center w-100">
								<div>
									<div class="text-h6">{{ specialSubjects['Toan'].name }}</div>

									<!-- Phần trạng thái -->
									<div class="flex-grow-1 px-4">
										<template v-if="getSubjectStatus('Toan')">
											<div v-for="(group, tinhTrang) in getSubjectStatus('Toan')"
												:key="tinhTrang">
												<div :class="'text-'+group.MauTinhTrang">
													• {{ group.TenTinhTrang }}
												</div>
												<div class="d-flex flex-wrap ga-2">
													<v-chip v-for="nhom in group.Nhoms" :key="nhom.MaNhomCotDiem"
														size="small" :color="group.MauTinhTrang" class="ma-1">
														{{ nhom.TenNhomCotDiem_VI }}
													</v-chip>
												</div>
											</div>
										</template>
									</div>
								</div>

								<!-- Phần nút thao tác -->
								<div class="d-flex ga-2">
									<v-btn color="error" @click="handleReject(getSpecialSubject('Toan'))"
										:disabled="isSubjectDisabled('Toan')">
										Từ chối
									</v-btn>
									<v-btn color="primary" @click="handleSendManager(getSpecialSubject('Toan'))"
										:disabled="isSubjectDisabled('Toan')">
										Gửi BGH
									</v-btn>
								</div>
							</div>
						</v-card-title>

						<v-data-table class="custom-border border-t-sm mt-2" :headers="getSpecialSubjectHeaders('Toan')"
							:items="getSpecialSubjectItems('Toan')" :items-per-page="-1" hide-default-footer />
					</v-card>

					<v-data-table class="custom-border border-t-sm" :headers="headers_ChinhKhoa"
						:items="items_ChinhKhoa" :items-per-page="-1" hide-default-footer>
						<template #item.combineTenMonDuLieuNganh="{ item }">
							<span class="mt-2 text-title font-weight-medium">{{ item.TenMonDuLieuNganh }}</span>
							<v-divider class="my-2" />
							<div v-for="(group, tinhTrang) in item.GroupedByTinhTrang" :key="tinhTrang">
								<p :class="'text-' + group.MauTinhTrang">
									• {{ group.TenTinhTrang }}
								</p>

								<!-- Hiển thị các nhóm trong tình trạng -->
								<div v-for="nhom in group.Nhoms" :key="nhom.MaNhomCotDiem" class="ml-2">
									<v-chip size="small" :color="group.MauTinhTrang" class="mt-1">
										{{ nhom.TenNhomCotDiem_VI }}
									</v-chip>
								</div>
							</div>
						</template>
						<template #item.actions="{ item }">
							<div class="d-flex ga-2">
								<v-btn color="error" @click="handleReject(item)" :disabled="item.TinhTrang === 4">
									Từ chối
								</v-btn>
								<v-btn color="primary" @click="handleSendManager(item)"
									:disabled="item.TinhTrang === 4"> Gửi BGH</v-btn>
							</div>
						</template>
					</v-data-table>
				</v-tabs-window-item>

				<!-- Tab 2: Môn bổ trợ -->
				<v-tabs-window-item :value="1">
					<v-card v-for="monHoc in DSMonHoc_BoTro" :key="monHoc.MonHocID" border class="mb-4">
						<v-card-title class="d-flex justify-space-between align-center">
							<div>
								<span class="mt-2 text-title font-weight-medium">{{ monHoc.TenMonDuLieuNganh }}</span>
								<div v-for="(group, tinhTrang) in monHoc.GroupedByTinhTrang" :key="tinhTrang">
									<div :class="'text-'+group.MauTinhTrang">
										• {{ group.TenTinhTrang }}
									</div>

									<div class="d-flex flex-wrap ga-2">
										<v-chip v-for="nhom in group.Nhoms" :key="nhom.MaNhomCotDiem" size="small"
											:color="group.MauTinhTrang" class="ma-1">
											{{ nhom.TenNhomCotDiem_VI }}
										</v-chip>
									</div>
								</div>
							</div>
							<div class="d-flex ga-2">
								<v-btn color="error" @click="handleReject(monHoc)" :disabled="monHoc.TinhTrang === 4">
									Từ chối
								</v-btn>
								<v-btn color="primary" @click="handleSendManager(monHoc)"
									:disabled="monHoc.TinhTrang === 4">
									Gửi BGH
								</v-btn>
							</div>
						</v-card-title>
						<v-data-table class="custom-border border-t-sm" :headers="getHeadersForBoTro(monHoc)"
							:items="getItemsForBoTro(monHoc)" :items-per-page="-1" hide-default-footer>
						</v-data-table>
					</v-card>
					<uc-empty v-if="DSMonHoc_BoTro.length === 0" />
				</v-tabs-window-item>

				<!-- Tab 3,4,5: Tiếng Anh, Tiếng Việt, Toán -->
				<v-tabs-window-item v-for="(type, index) in ['TA', 'TV', 'Toan']" :key="index" :value="index + 2">
					<v-card border>
						<v-card-title>{{ specialSubjects[type].name }}</v-card-title>
						<v-data-table class="custom-border border-t-sm" :headers="getSpecialSubjectHeaders(type)"
							:items="getSpecialSubjectItems(type)" :items-per-page="-1" hide-default-footer />
					</v-card>
				</v-tabs-window-item>
			</v-tabs-window>
		</v-col>
	</v-row>
	<uc-dialog-reject v-model="action" :monHocItem="monHocItem" :dsMaNhomCotDiem_MonHoc="DSMaNhomCotDiem_MonHoc"
		@onFinishDialog="onLoadHocSinh" />

	<uc-dialog-approve v-model="action" :monHocItem="monHocItem" :dsMaNhomCotDiem_MonHoc="DSMaNhomCotDiem_MonHoc"
		@onFinishDialog="onLoadHocSinh" />
</template>

<script>
	export default {
		name: 'StudentGrades',
	
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
							minWidth: col.LoaiCotDiem === 'text' ? 500 : 100,
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