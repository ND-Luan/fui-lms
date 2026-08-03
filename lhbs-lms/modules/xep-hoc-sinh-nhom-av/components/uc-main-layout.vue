<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title>{{TitlePage}}</v-card-title>
				<v-card-text>
					<v-row>
						<v-col cols="3">
							<v-select v-model="KhoiItem" label="Chọn khối" :items="DSKhoi" item-title="TenKhoiHoc"
								item-value="KhoiID" return-object />
						</v-col>
						<v-col class="d-flex ga-2" cols="3">
							<v-btn text="Làm mới" prepend-icon="mdi-refresh" @click="onRefresh" variant="outlined"
								color="primary" />
							<uc-btn-dialog-add v-model:DSNhom="itemNhoms" prepend-icon="mdi-plus" text="Thêm học sinh"
								variant="outlined" color="teal" @onSubmitFinish="onRefresh(true)"
								:disabled="NhomDetail === null" :NhomDetail_Child="NhomDetail" />
							<v-btn :text="textChuyenNhom" prepend-icon="mdi-swap-horizontal" @click="onOpenDialogChange"
								variant="outlined" color="blue" :disabled="NhomDetail === null" />
							<v-btn text="Cập nhật số thứ tự" prepend-icon="mdi-sort-numeric-ascending"
								@click="onUpdateSTT" variant="outlined" color="green" :disabled="NhomDetail === null" />
							<v-btn text="Lấy học sinh từ Calen" prepend-icon="mdi-account-multiple-plus"
								@click="onImportHocSinhCalen" variant="outlined" color="deep-purple"
								:disabled="NhomDetail === null" />
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-divider />
		<v-row>
			<v-col cols="4">
				<v-data-table :headers="headerNhoms" :items="itemNhoms" items-per-page="-1"
					style="max-height: calc(100dvh - 93px)" hide-default-footer>
					<template #item.NhomID="{item, value}">
						<div class="d-flex ga-2">
							<p>{{value}}</p>
							<v-chip :color="item.Color">{{item.TenMonHoc_HienThi}}</v-chip>
						</div>
					</template>
					<template #item.XemNhom="{item}">
						<v-btn icon="mdi-account-group-outline" @click="onSelectNhomDetail(item)" size="small"
							variant="text" />
					</template>
				</v-data-table>
			</v-col>
			<v-divider vertical />
			<v-col cols="8">
				<v-data-table v-model="DSHocSinhSeleceted" :headers="headerHocSinhs" :items="itemHocSinhs"
					:item-value="v => v" items-per-page="-1" style="max-height: calc(100dvh - 93px)" hide-default-footer
					show-select>
					<template #item.SoTT="{item}">
						<v-text-field v-model="item.SoTT" placeholder="Nhập số thứ tự..." @blur="onSoTTBlur(item)" />
					</template>
					<template #item.ChuyenNhom="{item}">
						<v-btn icon="mdi-transfer-right" @click="onChangeNhomHocSinh(item)" size="small" variant="text"
							color="green" />
					</template>
					<template #item.Xoa="{item}">
						<v-btn icon="mdi-delete" color="red" @click="onDeleteHocSinh(item)" size="small"
							variant="text" />
					</template>
				</v-data-table>
			</v-col>
		</v-row>
		<uc-dialog-change v-model="IsShowDialogChange" :HocSinhDetail :NhomDetail :DSNhom="itemNhoms"
			@onSubmitFinish="onRefresh(true)" />
		<v-dialog v-model="IsShowDialogCalen" max-width="1000">
			<v-card style="max-height: 90vh;">
				<v-card-title class="d-flex align-center">
					<v-icon color="deep-purple" class="mr-2">mdi-account-check-outline</v-icon>
					Đối chiếu học sinh với Calen
				</v-card-title>
				<v-card-text style="overflow-y: auto; max-height: calc(90vh - 140px);">
					<v-row dense class="mb-3">
						<v-col cols="3">
							<v-card variant="tonal" color="deep-purple" class="pa-3 text-center">
								<div class="text-caption">Calen</div>
								<div class="text-h5 font-weight-bold">{{ CalenCompare.total }}</div>
							</v-card>
						</v-col>
						<v-col cols="3">
							<v-card variant="tonal" color="success" class="pa-3 text-center">
								<div class="text-caption">Nhóm hiện tại</div>
								<div class="text-h5 font-weight-bold">{{ CalenCompare.existing.length }}</div>
							</v-card>
						</v-col>
						<v-col cols="3">
							<v-card variant="tonal" color="warning" class="pa-3 text-center">
								<div class="text-caption">Cần thêm</div>
								<div class="text-h5 font-weight-bold">{{ CalenCompare.missing.length }}</div>
							</v-card>
						</v-col>
						<v-col cols="3">
							<v-card variant="tonal" color="error" class="pa-3 text-center">
								<div class="text-caption">Cần xóa</div>
								<div class="text-h5 font-weight-bold">{{ CalenCompare.extra.length }}</div>
							</v-card>
						</v-col>
					</v-row>
					<v-alert v-if="isCalenFullySynced()" type="success" variant="tonal" icon="mdi-check-decagram"
						class="my-3">
						<div class="font-weight-bold">Danh sách đã đồng bộ với Calen</div>
						<div class="text-body-2">Không có học sinh cần thêm, cần xóa hoặc cập nhật số thứ tự.</div>
					</v-alert>
					<v-alert v-if="CalenCompare.missing.length" type="warning" variant="tonal" class="my-3">
						Có {{ CalenCompare.missing.length }} học sinh trong Calen chưa có trong nhóm.
					</v-alert>
					<v-card v-if="CalenCompare.missing.length" variant="outlined" class="mb-3 overflow-hidden">
						<v-card-title class="text-subtitle-1 bg-orange-lighten-5 text-warning">Danh sách cần bổ sung
						</v-card-title>
						<v-table density="compact" fixed-header height="260">
							<thead>
								<tr>
									<th class="text-center">STT</th>
									<th>Mã học sinh</th>
									<th>Họ và tên</th>
									<th>Lớp Calen</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="item in CalenCompare.missing" :key="getStudentKey(item, 'missing')">
									<td class="text-center font-weight-medium">{{ item.STT }}</td>
									<td>
										<v-chip size="small" variant="tonal">{{ item.HocSinhID }}</v-chip>
									</td>
									<td class="font-weight-medium">{{ item.HoTen }}</td>
									<td>{{ item.TenLop }}</td>
								</tr>
							</tbody>
						</v-table>
					</v-card>
					<v-expansion-panels class="mt-3">
						<v-expansion-panel v-if="CalenCompare.misordered.length" :title="getMisorderedTitle()">
							<v-list density="compact">
								<v-list-item v-for="item in CalenCompare.misordered" :key="getStudentKey(item, 'stt')"
									:title="getStudentTitle(item)" :subtitle="getStudentSubtitle(item)"><template
										#prepend>
										<v-icon color="warning">mdi-sort-numeric-variant</v-icon>
									</template></v-list-item>
							</v-list>
						</v-expansion-panel>
						<v-expansion-panel v-if="CalenCompare.extra.length"
							title="Có trong nhóm nhưng không có ở Calen">
							<v-table density="compact" fixed-header height="280">
								<thead>
									<tr>
										<th>STT LMS</th>
										<th>Mã học sinh</th>
										<th>Họ và tên</th>
										<th class="text-center">Trạng thái</th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="item in CalenCompare.extra" :key="item.HocSinhID">
										<td>{{ item.SoTT }}</td>
										<td>
											<v-chip size="small" variant="tonal">{{ item.HocSinhID }}</v-chip>
										</td>
										<td class="font-weight-medium">{{ item.HoTen }}</td>
										<td class="text-center">
											<v-chip color="error" size="small" variant="tonal"
												prepend-icon="mdi-account-minus">Cần xóa</v-chip>
										</td>
									</tr>
								</tbody>
							</v-table>
						</v-expansion-panel>
					</v-expansion-panels>
					<v-alert v-if="CalenCompare.pendingGroupAdds" type="info" variant="tonal" class="mt-3">{{
						getGroupSyncSummary() }}</v-alert>
				</v-card-text>
				<v-card-actions>
					<v-spacer />
					<v-btn text="Đóng" @click="IsShowDialogCalen = false" />
					<v-btn v-if="CalenCompare.extra.length" color="error" variant="outlined"
						text="Xóa học sinh không còn ở Calen" @click="confirmRemoveExtraCalen" />
					<v-btn v-if="hasCalenSyncChanges()" color="primary" text="Đồng bộ học sinh và STT"
						@click="confirmImportCalen" />
				</v-card-actions>
			</v-card>
		</v-dialog>
	</Global>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				vueData,
				DSKhoi: [],
				KhoiItem: null,
				IsShowDialogChange: false,
				NhomDetail: null,
				headerNhoms: [
					{ title: "Mã nhóm", value: "NhomID" },
					{ title: "Tên nhóm", value: "TenNhom" },
					{ title: "Xem nhóm", value: "XemNhom", align: "center" },
				],
				itemNhoms: [],
				headerHocSinhs: [
					{ title: "Mã nhóm", value: "NhomID", align: "center" },
					{ title: "STT", value: "SoTT", align: "center", width: 150, minWidth: 150, },
					{ title: "Mã học sinh", value: "HocSinhID", align: "center" },
					{ title: "Họ tên", value: "HoTen" },
					{ title: "Chuyển nhóm", value: "ChuyenNhom", align: "center" },
					{ title: "Xóa", value: "Xoa", align: "center" },
				],
				itemHocSinhs: [],
				DSHocSinhSeleceted: [],
				HocSinhDetail: null,
				DSHocSinh_Calen: []
				,IsShowDialogCalen: false
				,CalenCompare: { total: 0, existing: [], missing: [], extra: [], misordered: [], groupSync: [], pendingGroupAdds: 0 }
				,compareHeaders: [{ title: 'Mã học sinh', value: 'HocSinhID' }, { title: 'Họ tên', value: 'HoTen' }]
			}
		},
		mounted() {
			this.getKhoi()
		},
		computed: {
			TitlePage: function () { return getTitlePageByURL(window.location.pathname + window.location.search) },
			textChuyenNhom: function () {
				let str = 'Chuyển nhóm'
				if (this.DSHocSinhSeleceted.length > 0) str += ` ${this.DSHocSinhSeleceted.length}`
				return str
			}
		},
		watch: {
			"KhoiItem.KhoiID": function (KhoiItem) {
				this.getDanhSachNhom()
			},
			"NhomDetail": function (NhomDetail) {
				this.getDanhSachHocSinh_ByNhomID(NhomDetail?.NhomID, true)
			},
		},
		methods: {
			getStudentKey(item, prefix) {
				return `${prefix}-${item?.HocSinhID ?? ''}`
			},
			getStudentTitle(item) {
				return `${item?.HocSinhID ?? ''} - ${item?.HoTen ?? ''}`
			},
			getStudentSubtitle(item) {
				return `Calen: ${item?.CalenSTT ?? ''} | Nhóm LMS: ${item?.LmsSTT ?? 'chưa có'}`
			},
			getMisorderedTitle() {
				return `Lệch STT (${this.CalenCompare.misordered.length})`
			},
			getExistingTitle() {
				return `Danh sách đã có (${this.CalenCompare.existing.length})`
			},
			getStudentCodeSubtitle(item) {
				return `Mã học sinh: ${item?.HocSinhID ?? ''}`
			},
			getGroupSyncSummary() {
				const groups = (this.CalenCompare.groupSync || []).filter(x => x.missing.length)
				return groups.map(x => `Nhóm ${x.NhomID}: thiếu ${x.missing.length}`).join(' • ')
			},
			hasCalenSyncChanges() {
				return this.CalenCompare.pendingGroupAdds > 0 || this.CalenCompare.misordered.length > 0
			},
			isCalenFullySynced() {
				return this.CalenCompare.missing.length === 0
					&& this.CalenCompare.extra.length === 0
					&& this.CalenCompare.misordered.length === 0
					&& this.CalenCompare.pendingGroupAdds === 0
			},
			async getKhoi() {
				this.DSKhoi = await fetchPromise("lms/KhoiHocByCapHoc_Get", { CapID: 3 })
			},
			async getDanhSachNhom() {
				const data = await fetchPromise("lms/NhomAV_Get", { NienKhoa: vueData.NienKhoa })
				this.itemNhoms = data.filter(x => x.KhoiID === this.KhoiItem.KhoiID)
			},
			async getDanhSachHocSinh_ByNhomID(NhomID, forceRefresh = false) {
				this.itemHocSinhs = await fetchPromise("lms/HocSinhNhom_Get_ByNhomID", {
					NienKhoa: vueData.NienKhoa,
					NhomID
				}, { forceRefresh })
			},
			async onRefresh(forceRefresh = false) {
				if (!this.NhomDetail?.NhomID) return
				this.getDanhSachHocSinh_ByNhomID(this.NhomDetail.NhomID, forceRefresh)
			},
			async getDanhSachHocSinh_Calen() {
				const DSKhoi = await fetchPromise("quansinh/Basic_KhoiSelectByNamHocID", { DonViID: 1, NamHocID: vueData.NienKhoa }, { forceRefresh: true, cache: false })
				console.log('[XEP-STT][Calen] Khoi dang chon:', this.KhoiItem)
				console.log('[XEP-STT][Calen] DSKhoi:', DSKhoi)
				// KhoiID LMS va Quan sinh khong dong nhat, map theo ten khoi.
				const normalize = value => String(value ?? '')
					.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
					.toLowerCase().replace(/\s+/g, ' ').trim()
				const currentKhoi = DSKhoi.find(x => normalize(x.TenKhoi) === normalize(this.KhoiItem?.TenKhoiHoc))
				console.log('[XEP-STT][Calen] currentKhoi:', currentKhoi)
				if (!currentKhoi) {
					return Vue.$toast.error("Không tìm thấy khối Calen")
				}
	
				const DSLop = await fetchPromise("quansinh/Basic_LopHocSelectByKhoiNamHocID", {
					NamHocID: vueData.NienKhoa,
					// KhoiID Calen khác KhoiID LMS; dùng mã ánh xạ từ API Calen.
					KhoiID: currentKhoi.KhoiID
				}, { forceRefresh: true, cache: false })
				console.log('[XEP-STT][Calen] Params lop:', { NamHocID: vueData.NienKhoa, KhoiID: currentKhoi.KhoiID })
				console.log('[XEP-STT][Calen] DSLop:', DSLop)
				const tenNhom = normalize(this.NhomDetail?.TenNhom)
				const tenNhomCompact = tenNhom.replace(/[^a-z0-9]/g, '')
				console.log('[XEP-STT][Calen] Nhom dang chon:', this.NhomDetail)
				console.log('[XEP-STT][Calen] TenNhom sau normalize:', tenNhom, tenNhomCompact)
				const currentLop = (Array.isArray(DSLop) ? DSLop : []).find(x => {
					const tenLop = normalize(x.TenLop)
					const tenLopCompact = tenLop.replace(/[^a-z0-9]/g, '')
					return tenLop === tenNhom || tenLopCompact === tenNhomCompact
				}) || (Array.isArray(DSLop) ? DSLop : [])
					.filter(x => normalize(x.TenLop).replace(/[^a-z0-9]/g, '')
						&& tenNhomCompact.includes(normalize(x.TenLop).replace(/[^a-z0-9]/g, '')))
					.sort((a, b) => normalize(b.TenLop).length - normalize(a.TenLop).length)[0]
				console.log('[XEP-STT][Calen] currentLop:', currentLop)
				if (!currentLop) {
					return Vue.$toast.error("Không tìm thấy lớp Calen")
				}
	
				return await fetchPromise("quansinh/Basic_HocSinhSelectByLopHocID", {
					LopHocID: currentLop.LopHocID
				}, { forceRefresh: true, cache: false })
			},
			async onUpdateSTT() {
				this.DSHocSinh_Calen = await this.getDanhSachHocSinh_Calen()
				if (!Array.isArray(this.DSHocSinh_Calen)) return
	
				const arr = []
				for (var itemHS_Calen of this.DSHocSinh_Calen) {
					const itemHS = this.itemHocSinhs.find(x => x.HocSinhID === itemHS_Calen.HocSinhID)
					if (itemHS) arr.push({ ...itemHS, SoTT: itemHS_Calen?.STT || 0 })
				}
	
				for (var ndetail of this.NhomDetail.ListNhomID_Child.split(',')) {
					const dshs = await fetchPromise("lms/HocSinhNhom_Get_ByNhomID", {
						NienKhoa: vueData.NienKhoa,
						NhomID: ndetail
					})
					for (var itemHS_Calen of this.DSHocSinh_Calen) {
						const itemHS = dshs.find(x => x.HocSinhID === itemHS_Calen.HocSinhID)
						if (itemHS) arr.push({ ...itemHS, SoTT: itemHS_Calen?.STT || 0 })
					}
				}
	
				for (var item of arr) {
					await fetchPromise("lms/SoTT_Udp_ByHSNhomID", {
						HSNhomID: item.HSNhomID,
						SoTT: item.SoTT
					})
				}
	
				Vue.$toast.success("Cập nhật số thứ tự thành công!", { position: "top" })
				await this.onRefresh(true)
			},
			async onImportHocSinhCalen() {
				const studentsCalen = await this.getDanhSachHocSinh_Calen()
				if (!Array.isArray(studentsCalen)) return

				const students = studentsCalen
					.map(x => {
						return { ...x, HoTen: [x.Ho, x.Ten].filter(Boolean).join(' ').trim(), CalenSTT: x.STT }
					})
					.filter(Boolean)
				if (!students.length) return Vue.$toast.warning('Lớp Calen chưa có học sinh')
				// Calen là nguồn gốc; danh sách LMS chỉ dùng làm dữ liệu đối chiếu hiện tại.
				const currentStudents = await fetchPromise('lms/HocSinhNhom_Get_ByNhomID', {
					NienKhoa: vueData.NienKhoa,
					NhomID: this.NhomDetail.NhomID
				}, { forceRefresh: true, cache: false })
				const currentIDs = new Set(currentStudents.map(x => String(x.HocSinhID)))
				this.CalenCompare = {
					total: students.length,
					existing: students.filter(x => currentIDs.has(String(x.HocSinhID))),
					missing: students.filter(x => !currentIDs.has(String(x.HocSinhID))),
					extra: currentStudents.filter(x => !students.some(s => String(s.HocSinhID) === String(x.HocSinhID))),
					misordered: students.filter(calen => {
						const lms = currentStudents.find(x => String(x.HocSinhID) === String(calen.HocSinhID))
						const lmsSTT = lms?.SoTT ?? lms?.STT ?? 0
						return lms && Number(lmsSTT) !== Number(calen.CalenSTT || 0)
					}).map(calen => {
						const lms = currentStudents.find(x => String(x.HocSinhID) === String(calen.HocSinhID))
						return { ...calen, LmsSTT: lms?.SoTT ?? lms?.STT }
					})
				}
				const latestGroups = await fetchPromise('lms/NhomAV_Get', { NienKhoa: vueData.NienKhoa }, { forceRefresh: true, cache: false })
				const latestNhomDetail = latestGroups.find(x => String(x.NhomID) === String(this.NhomDetail.NhomID)) || this.NhomDetail
				this.NhomDetail.ListNhomID_Child = latestNhomDetail.ListNhomID_Child
				const nhomIDs = [latestNhomDetail.NhomID, ...(latestNhomDetail.ListNhomID_Child || '').split(',')]
					.map(x => String(x).trim()).filter(Boolean)
				const groupSync = []
				for (const NhomID of [...new Set(nhomIDs)]) {
					const groupStudents = String(NhomID) === String(this.NhomDetail.NhomID)
						? currentStudents
						: await fetchPromise('lms/HocSinhNhom_Get_ByNhomID', { NienKhoa: vueData.NienKhoa, NhomID }, { forceRefresh: true, cache: false })
					const groupIDs = new Set(groupStudents.map(x => String(x.HocSinhID)))
					groupSync.push({ NhomID, missing: students.filter(x => !groupIDs.has(String(x.HocSinhID))) })
				}
				this.CalenCompare.groupSync = groupSync
				this.CalenCompare.pendingGroupAdds = groupSync.reduce((total, group) => total + group.missing.length, 0)
				this.CalenCompare.missingStudents = this.CalenCompare.missing
				this.CalenCompare.allStudents = students
				this.IsShowDialogCalen = true
			},
			async confirmImportCalen() {
				const studentsLms = await fetchPromise('lms/HocSinh_Get', { NienKhoa: vueData.NienKhoa }, { forceRefresh: true, cache: false })
				const groupSync = this.CalenCompare.groupSync || []
				const uniqueNhomIDs = groupSync.map(x => x.NhomID)
				let totalAdded = 0
				for (const group of groupSync) {
					const students = group.missing.map(calen => {
						const student = studentsLms.find(x => String(x.HocSinhID) === String(calen.HocSinhID))
						return student ? { ...student, SoTT: calen.STT } : null
					}).filter(Boolean)
					if (!students.length) continue
					await fetchPromise('lms/HocSinhNhom_Ins', {
						Json_HocSinhNhom: JSON.stringify(students),
						NhomID: group.NhomID
					}, { cache: false })
					totalAdded += students.length
				}
				const calenStudents = this.CalenCompare.allStudents || []
				for (const NhomID of uniqueNhomIDs) {
					const groupStudents = await fetchPromise('lms/HocSinhNhom_Get_ByNhomID', {
						NienKhoa: vueData.NienKhoa,
						NhomID
					}, { forceRefresh: true, cache: false })
					for (const student of groupStudents) {
						const calenStudent = calenStudents.find(x => String(x.HocSinhID) === String(student.HocSinhID))
						if (!calenStudent) continue
						await fetchPromise('lms/SoTT_Udp_ByHSNhomID', {
							HSNhomID: student.HSNhomID,
							SoTT: calenStudent.STT
						}, { cache: false })
					}
				}
				this.IsShowDialogCalen = false
				Vue.$toast.success(`Đã thêm ${totalAdded} lượt học sinh và cập nhật STT theo Calen`, { position: 'top' })
				await this.onRefresh(true)
			},
			async confirmRemoveExtraCalen() {
				if (!this.CalenCompare.extra.length) return
				if (!confirm(`Xóa ${this.CalenCompare.extra.length} học sinh không còn thuộc lớp Calen khỏi nhóm và các nhóm con?`)) return
				const nhomIDs = [this.NhomDetail.NhomID, ...(this.NhomDetail.ListNhomID_Child || '').split(',')]
					.map(x => String(x).trim()).filter(Boolean)
				const extraIDs = new Set(this.CalenCompare.extra.map(x => String(x.HocSinhID)))
				for (const NhomID of [...new Set(nhomIDs)]) {
					const students = await fetchPromise('lms/HocSinhNhom_Get_ByNhomID', { NienKhoa: vueData.NienKhoa, NhomID }, { forceRefresh: true, cache: false })
					for (const student of students.filter(x => extraIDs.has(String(x.HocSinhID)))) {
						await fetchPromise('lms/HocSinhNhom_Del_HSNhomID', { HSNhomID: student.HSNhomID }, { cache: false })
					}
				}
				this.IsShowDialogCalen = false
				Vue.$toast.success(`Đã xóa ${this.CalenCompare.extra.length} học sinh khỏi nhóm`, { position: 'top' })
				await this.onRefresh(true)
			},
			onChangeNhomHocSinh(item) {
				this.HocSinhDetail = _.cloneDeep(item)
				this.IsShowDialogChange = true
			},
			onOpenDialogChange() { },
			onDeleteHocSinh(item) {
				const $this = this
				confirm({
					title: "Xác nhận xóa học sinh?",
					message: "Bạn có chắc muốn xóa học sinh đã chọn vào nhóm này?",
					action: function () {
						fetchPromise('lms/HocSinhNhom_Del_HSNhomID', {
							HSNhomID: item.HSNhomID,
						}).then(() => {
							Vue.$toast.success("Đã xóa học sinh!", { position: "top" });
							$this.onRefresh(true)
						})
					}
				})
			},
			onSelectNhomDetail(item) { this.NhomDetail = _.cloneDeep(item) },
			onSoTTBlur(item) {
				ajaxCALL('lms/SoTT_Udp_ByHSNhomID', { HSNhomID: item.HSNhomID, SoTT: item.SoTT }, () => {})
			},
		},
	}
</script>