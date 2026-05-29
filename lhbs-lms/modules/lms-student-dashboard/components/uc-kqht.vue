<template>
	<div class="kqht-wrapper">

		<!-- Header học sinh -->
		<div v-if="!hideHeader" class="kqht-header">
			<div class="kqht-header-left">
				<div class="hs-avatar">{{ hoTenViet }}</div>
				<div>
					<div class="hs-name">{{ HocSinh.HoTen || 'Học sinh' }}</div>
					<div class="hs-meta">{{ HocSinh.TenLop }} · {{ HocSinh.TenTruong }}</div>
				</div>
			</div>
			<v-chip v-if="NienKhoa" color="primary" variant="tonal" size="small">
				Niên khóa {{ NienKhoa }}–{{ NienKhoa + 1 }}
			</v-chip>
		</div>

		<!-- Tabs học kỳ — render động từ DSHocKy (C2/C3: HK1/HK2/CaNam, C1: GHKI/CHKI/GHKII/CN) -->
		<v-tabs v-model="activeTab" color="primary" class="kqht-tabs">
			<v-tab v-for="hk in DSHocKy" :key="hk.id" :value="hk.id">
				<v-icon start size="16">mdi-calendar-month-outline</v-icon>
				{{ hk.name }}
			</v-tab>
		</v-tabs>
		<v-divider />

		<!-- Loading -->
		<div v-if="loading" class="kqht-loading">
			<v-progress-circular indeterminate color="primary" size="32" />
			<span>Đang tải kết quả học tập...</span>
		</div>

		<!-- C2 / C3: Bảng điểm dạng table -->
		<template v-else-if="isCapTrung">
			<v-window v-model="activeTab">
				<!-- HK1 -->
				<v-window-item :value="DSHocKy[0]?.id">
					<div class="kqht-section">
						<div class="section-label">
							<span class="dot dot-hk1" />
							Bảng điểm học kỳ 1
						</div>
						<v-card v-if="!isMobile" variant="outlined" rounded="lg" class="table-card">
							<v-data-table :headers="headersHK" :items="dataHK1.Diem" hide-default-footer
								:items-per-page="-1" density="comfortable" no-data-text="Chưa có dữ liệu điểm học kỳ 1">
								<template #item.TenMon="{ item }">
									<div class="d-flex align-center ga-2">
										<v-icon size="16" :color="getMonHocColor(item.TenMon)">{{
											getMonHocIcon(item.TenMon) }}</v-icon>
										<span class="mon-ten">{{ item.TenMon }}</span>
									</div>
								</template>
								<template #item.ktthuongxuyen="{ item }">
									<span>{{ fmtScore(item.ktthuongxuyen) }}</span>
								</template>
								<template #item.ktgiuaki="{ item }">
									<span>{{ fmtScore(item.ktgiuaki) }}</span>
								</template>
								<template #item.ktcuoiki="{ item }">
									<span>{{ fmtScore(item.ktcuoiki) }}</span>
								</template>
								<template #item.dtb="{ item }">
									<span class="font-weight-bold text-primary">{{ fmtScore(item.dtb) }}</span>
								</template>
							</v-data-table>
						</v-card>
						<div v-else class="kqht-mobile-list">
							<div v-if="!dataHK1.Diem.length" class="kqht-mobile-empty">Chưa có dữ liệu điểm học kỳ 1
							</div>
							<div v-for="item in dataHK1.Diem" :key="item.LopmonID || item.TenMon"
								class="kqht-mobile-card">
								<div class="kqht-mobile-subject">
									<v-icon size="16" :color="getMonHocColor(item.TenMon)">{{ getMonHocIcon(item.TenMon)
										}}</v-icon>
									<span>{{ item.TenMon }}</span>
								</div>
								<div class="kqht-mobile-score-row">
									<div class="kqht-mobile-score-label">KT thường xuyên</div>
									<div class="kqht-mobile-score-value">{{ fmtScore(item.ktthuongxuyen) }}</div>
								</div>
								<div class="kqht-mobile-score-row">
									<div class="kqht-mobile-score-label">KT giữa kì</div>
									<div class="kqht-mobile-score-value">{{ fmtScore(item.ktgiuaki) }}</div>
								</div>
								<div class="kqht-mobile-score-row">
									<div class="kqht-mobile-score-label">KT cuối kì</div>
									<div class="kqht-mobile-score-value">{{ fmtScore(item.ktcuoiki) }}</div>
								</div>
								<div class="kqht-mobile-score-row">
									<div class="kqht-mobile-score-label font-weight-bold text-primary">ĐTB môn</div>
									<div class="kqht-mobile-score-value font-weight-bold text-primary">{{
										fmtScore(item.dtb) }}</div>
								</div>
							</div>
						</div>
						<div class="summary-grid">
							<div class="summary-card">
								<div class="summary-label">Học lực HK1</div>
								<div class="summary-value rank-val">
									{{ dataHK1.TongKet?.hocluc || '—' }}
								</div>
							</div>
							<div class="summary-card">
								<div class="summary-label">Hạnh kiểm HK1</div>
								<div class="summary-value rank-val text-primary">
									{{ dataHK1.TongKet?.hanhkiem || '—' }}
								</div>
							</div>
						</div>
					</div>
				</v-window-item>

				<!-- HK2 -->
				<v-window-item :value="DSHocKy[1]?.id">
					<div class="kqht-section">
						<div class="section-label">
							<span class="dot dot-hk2" />
							Bảng điểm học kỳ 2
						</div>
						<v-card v-if="!isMobile" variant="outlined" rounded="lg" class="table-card">
							<v-data-table :headers="headersHK" :items="dataHK2.Diem" hide-default-footer
								:items-per-page="-1" density="comfortable" no-data-text="Chưa có dữ liệu điểm học kỳ 2">
								<template #item.TenMon="{ item }">
									<div class="d-flex align-center ga-2">
										<v-icon size="16" :color="getMonHocColor(item.TenMon)">{{
											getMonHocIcon(item.TenMon) }}</v-icon>
										<span class="mon-ten">{{ item.TenMon }}</span>
									</div>
								</template>
								<template #item.ktthuongxuyen="{ item }">
									<span>{{ fmtScore(item.ktthuongxuyen) }}</span>
								</template>
								<template #item.ktgiuaki="{ item }">
									<span>{{ fmtScore(item.ktgiuaki) }}</span>
								</template>
								<template #item.ktcuoiki="{ item }">
									<span>{{ fmtScore(item.ktcuoiki) }}</span>
								</template>
								<template #item.dtb="{ item }">
									<span class="font-weight-bold text-primary">{{ fmtScore(item.dtb) }}</span>
								</template>
							</v-data-table>
						</v-card>
						<div v-else class="kqht-mobile-list">
							<div v-if="!dataHK2.Diem.length" class="kqht-mobile-empty">Chưa có dữ liệu điểm học kỳ 2
							</div>
							<div v-for="item in dataHK2.Diem" :key="item.LopmonID || item.TenMon"
								class="kqht-mobile-card">
								<div class="kqht-mobile-subject">
									<v-icon size="16" :color="getMonHocColor(item.TenMon)">{{ getMonHocIcon(item.TenMon)
										}}</v-icon>
									<span>{{ item.TenMon }}</span>
								</div>
								<div class="kqht-mobile-score-row">
									<div class="kqht-mobile-score-label">KT thường xuyên</div>
									<div class="kqht-mobile-score-value">{{ fmtScore(item.ktthuongxuyen) }}</div>
								</div>
								<div class="kqht-mobile-score-row">
									<div class="kqht-mobile-score-label">KT giữa kì</div>
									<div class="kqht-mobile-score-value">{{ fmtScore(item.ktgiuaki) }}</div>
								</div>
								<div class="kqht-mobile-score-row">
									<div class="kqht-mobile-score-label">KT cuối kì</div>
									<div class="kqht-mobile-score-value">{{ fmtScore(item.ktcuoiki) }}</div>
								</div>
								<div class="kqht-mobile-score-row">
									<div class="kqht-mobile-score-label font-weight-bold text-primary">ĐTB môn</div>
									<div class="kqht-mobile-score-value font-weight-bold text-primary">{{
										fmtScore(item.dtb) }}</div>
								</div>
							</div>
						</div>
						<div class="summary-grid">
							<div class="summary-card">
								<div class="summary-label">Học lực HK2</div>
								<div class="summary-value rank-val">
									{{ dataHK2.TongKet?.hocluc || '—' }}
								</div>
							</div>
							<div class="summary-card">
								<div class="summary-label">Hạnh kiểm HK2</div>
								<div class="summary-value rank-val text-primary">
									{{ dataHK2.TongKet?.hanhkiem || '—' }}
								</div>
							</div>
						</div>
					</div>
				</v-window-item>

				<!-- Cả năm -->
				<v-window-item :value="DSHocKy[2]?.id">
					<div class="kqht-section">
						<div class="section-label">
							<span class="dot dot-cn" />
							Tổng kết cả năm
						</div>
						<v-card v-if="!isMobile" variant="outlined" rounded="lg" class="table-card">
							<v-data-table :headers="headersCN" :items="dataCN.Diem" hide-default-footer
								:items-per-page="-1" density="comfortable"
								no-data-text="Chưa có dữ liệu kết quả cả năm">
								<template #item.TenMon="{ item }">
									<div class="d-flex align-center ga-2">
										<v-icon size="16" :color="getMonHocColor(item.TenMon)">{{
											getMonHocIcon(item.TenMon) }}</v-icon>
										<span class="mon-ten">{{ item.TenMon }}</span>
									</div>
								</template>
								<template #item.dtb="{ item }">
									<span class="font-weight-medium">{{ fmtScore(item.dtb) }}</span>
								</template>
							</v-data-table>
						</v-card>
						<div v-else class="kqht-mobile-list">
							<div v-if="!dataCN.Diem.length" class="kqht-mobile-empty">Chưa có dữ liệu kết quả cả năm
							</div>
							<div v-for="item in dataCN.Diem" :key="item.LopmonID || item.TenMon"
								class="kqht-mobile-card kqht-mobile-card--compact">
								<div class="d-flex justify-space-between align-center w-100">
									<div class="kqht-mobile-subject">
										<v-icon size="16" :color="getMonHocColor(item.TenMon)">{{
											getMonHocIcon(item.TenMon)
											}}</v-icon>
										<span>{{ item.TenMon }}</span>
									</div>
									<v-chip size="x-small" color="primary" variant="tonal"
										class="font-weight-bold flex-shrink-0">
										ĐTB: {{ fmtScore(item.dtb) }}
									</v-chip>
								</div>
							</div>
						</div>
						<div class="summary-grid">
							<div class="summary-card">
								<div class="summary-label">Học lực cả năm</div>
								<div class="summary-value rank-val">
									{{ dataCN.TongKet?.hocluc || '—' }}
								</div>
							</div>
							<div class="summary-card">
								<div class="summary-label">Hạnh kiểm cả năm</div>
								<div class="summary-value rank-val text-primary">
									{{ dataCN.TongKet?.hanhkiem || '—' }}
								</div>
							</div>
							<div class="summary-card">
								<div class="summary-label">Danh hiệu</div>
								<div class="summary-value rank-val text-warning">
									{{ dataCN.TongKet?.danhhieu || '—' }}
								</div>
							</div>
						</div>
					</div>
				</v-window-item>
			</v-window>
		</template>

		<!-- C1: Bảng điểm dạng nhóm (Kiến thức-Kĩ năng, Năng lực, Phẩm chất) -->
		<template v-else>
			<v-window v-model="activeTab">
				<v-window-item v-for="hk in DSHocKy" :key="hk.id" :value="hk.id">
					<div class="kqht-section">
						<!-- Kiến thức - Kĩ năng -->
						<div class="section-label">
							<v-img src="/_cdn/lhbs-lms/kienthuc_ki_nang_icon.png" height="18" width="18" />
							Kiến thức - Kĩ năng
						</div>
						<v-card variant="outlined" rounded="lg" class="table-card">
							<v-row no-gutters class="table-header-row">
								<v-col cols="7"><span class="col-label ml-2">Môn học</span></v-col>
								<v-col cols="2" class="text-center"><span class="col-label">Mức đạt</span></v-col>
								<v-col cols="3" class="text-center"><span class="col-label">Điểm / Sao</span></v-col>
							</v-row>
							<v-divider />
							<v-expansion-panels v-model="panelKTKN" flat multiple variant="accordion">
								<v-expansion-panel v-for="(val, key) in groupKTKN" :key="key">
									<v-expansion-panel-title class="px-2 py-1">
										<v-row no-gutters align="center">
											<v-col cols="7" class="pa-1">
												<v-chip size="small" class="font-weight-medium chip-ellipsis"
													:color="getMonHocColor(key)">
													<v-icon start size="14" :color="getMonHocColor(key)">
														{{ getMonHocIcon(key) }}
													</v-icon>
													{{ key }}
												</v-chip>
											</v-col>
											<v-col cols="2" class="d-flex justify-center">
												<v-chip v-if="getMucDat(val)" :color="getColorMuc(getMucDat(val))"
													:class="'bg-' + getBgMuc(getMucDat(val))" size="small"
													variant="outlined" class="font-weight-bold">
													{{ getMucDat(val) }}
												</v-chip>
											</v-col>
											<v-col cols="3" class="d-flex justify-center">
												<!-- Sao cho môn đặc biệt -->
												<template v-if="List_MonHoc_Change.includes(key) && getSao(val)">
													<v-icon v-for="i in 5" :key="i" size="14"
														:color="i <= getSao(val) ? 'amber' : 'grey-lighten-2'">
														mdi-star
													</v-icon>
												</template>
												<!-- Điểm số cho môn thường -->
												<span v-else-if="getDiem(val) && !List_MonHoc_Change.includes(key)"
													class="font-weight-medium">
													{{ getDiem(val) }}
												</span>
											</v-col>
										</v-row>
									</v-expansion-panel-title>
									<v-expansion-panel-text v-if="getNhanXet(val)">
										<div class="note-wrapper">
											<div class="pin-icon">📌</div>
											<v-card class="note-paper" flat>
												<v-card-text>{{ getNhanXet(val) }}</v-card-text>
											</v-card>
										</div>
									</v-expansion-panel-text>
									<v-divider />
								</v-expansion-panel>
							</v-expansion-panels>
						</v-card>

						<!-- Năng lực chung -->
						<div class="section-label mt-2">
							<v-img src="/_cdn/lhbs-lms/nang_luc_chung_icon.png" height="18" width="18" />
							Năng lực chung
						</div>
						<v-card variant="outlined" rounded="lg" class="table-card">
							<v-expansion-panels v-model="panelNLC" flat multiple variant="accordion">
								<v-expansion-panel v-for="(val, key) in groupNLC" :key="key">
									<v-expansion-panel-title class="px-2 py-1">
										<v-row no-gutters align="center">
											<v-col cols="9" class="pa-1">
												<span class="mon-ten">{{ key }}</span>
											</v-col>
											<v-col cols="3" class="d-flex justify-center">
												<v-chip v-if="getMucDatNLC(val)" :color="getColorMuc(getMucDatNLC(val))"
													:class="'bg-' + getBgMuc(getMucDatNLC(val))" size="small"
													variant="outlined" class="font-weight-bold">
													{{ getMucDatNLC(val) }}
												</v-chip>
											</v-col>
										</v-row>
									</v-expansion-panel-title>
									<v-expansion-panel-text v-if="getNhanXet(val)">
										<div class="note-wrapper">
											<div class="pin-icon">📌</div>
											<v-card class="note-paper" flat>
												<v-card-text>{{ getNhanXet(val) }}</v-card-text>
											</v-card>
										</div>
									</v-expansion-panel-text>
									<v-divider />
								</v-expansion-panel>
							</v-expansion-panels>
						</v-card>

						<!-- Phẩm chất -->
						<div class="section-label mt-2">
							<v-img src="/_cdn/lhbs-lms/pham_chat_icon.png" height="18" width="18" />
							Phẩm chất
						</div>
						<v-card variant="outlined" rounded="lg" class="table-card">
							<v-expansion-panels v-model="panelPC" flat multiple variant="accordion">
								<v-expansion-panel v-for="(val, key) in groupPC" :key="key">
									<v-expansion-panel-title class="px-2 py-1">
										<v-row no-gutters align="center">
											<v-col cols="9" class="pa-1">
												<span class="mon-ten">{{ key }}</span>
											</v-col>
											<v-col cols="3" class="d-flex justify-center">
												<v-chip v-if="getMucDatNLC(val)" :color="getColorMuc(getMucDatNLC(val))"
													:class="'bg-' + getBgMuc(getMucDatNLC(val))" size="small"
													variant="outlined" class="font-weight-bold">
													{{ getMucDatNLC(val) }}
												</v-chip>
											</v-col>
										</v-row>
									</v-expansion-panel-title>
									<v-expansion-panel-text v-if="getNhanXet(val)">
										<div class="note-wrapper">
											<div class="pin-icon">📌</div>
											<v-card class="note-paper" flat>
												<v-card-text>{{ getNhanXet(val) }}</v-card-text>
											</v-card>
										</div>
									</v-expansion-panel-text>
									<v-divider />
								</v-expansion-panel>
							</v-expansion-panels>
						</v-card>

						<!-- Năng lực riêng -->
						<div class="section-label mt-2">
							<v-img src="/_cdn/lhbs-lms/nang_luc_rieng.png" height="18" width="18" />
							Năng lực riêng
						</div>
						<v-card variant="outlined" rounded="lg" class="table-card">
							<v-expansion-panels v-model="panelNLR" flat multiple variant="accordion">
								<v-expansion-panel v-for="(val, key) in groupNLR" :key="key">
									<v-expansion-panel-title class="px-2 py-1">
										<v-row no-gutters align="center">
											<v-col cols="9" class="pa-1">
												<span class="mon-ten">{{ key }}</span>
											</v-col>
											<v-col cols="3" class="d-flex justify-center">
												<v-chip v-if="getMucDatNLC(val)" :color="getColorMuc(getMucDatNLC(val))"
													:class="'bg-' + getBgMuc(getMucDatNLC(val))" size="small"
													variant="outlined" class="font-weight-bold">
													{{ getMucDatNLC(val) }}
												</v-chip>
											</v-col>
										</v-row>
									</v-expansion-panel-title>
									<v-expansion-panel-text v-if="getNhanXet(val)">
										<div class="note-wrapper">
											<div class="pin-icon">📌</div>
											<v-card class="note-paper" flat>
												<v-card-text>{{ getNhanXet(val) }}</v-card-text>
											</v-card>
										</div>
									</v-expansion-panel-text>
									<v-divider />
								</v-expansion-panel>
							</v-expansion-panels>
						</v-card>

						<!-- Chuyên cần -->
						<div class="section-label mt-2">
							<v-icon size="18" color="primary">mdi-star-check</v-icon>
							Chuyên cần
						</div>
						<div class="summary-grid mb-3">
							<div class="summary-card">
								<div class="summary-label">Vắng không phép</div>
								<div class="summary-value text-error">{{ ChuyenCan?.khongphep ?? '—' }}</div>
								<div class="summary-sub">buổi</div>
							</div>
							<div class="summary-card">
								<div class="summary-label">Vắng có phép</div>
								<div class="summary-value text-warning">{{ ChuyenCan?.cophep ?? '—' }}</div>
								<div class="summary-sub">buổi</div>
							</div>
							<div class="summary-card">
								<div class="summary-label">Đi trễ</div>
								<div class="summary-value text-orange">{{ ChuyenCan?.ditre ?? '—' }}</div>
								<div class="summary-sub">lần</div>
							</div>
						</div>
					</div>
				</v-window-item>
			</v-window>
		</template>

	</div>
</template>

<script>
	export default {
		name: 'UcKQHT',
	inject: ['iframeRef'],
	props: {
		HocSinh: { type: Object, default: () => ({}) },
		NienKhoa: { type: Number, default: null },
		isMobile: { type: Boolean, default: false },
		hideHeader: { type: Boolean, default: false },
	},
	data() {
		return {
			loading: false,
			activeTab: null,
			DSHocKy: [],
			DSMonHoc: [],

			// C2/C3
			dataHK1: { Diem: [], TongKet: {} },
			dataHK2: { Diem: [], TongKet: {} },
			dataCN:  { Diem: [], TongKet: {} },

			// C1
			groupKTKN: {},
			groupNLC: {},
			groupPC: {},
			groupNLR: {},
			ChuyenCan: {},
			panelKTKN: [],
			panelNLC: [],
			panelPC: [],
			panelNLR: [],

			List_MonHoc_Change: [
				'STEM', 'JA-GD Tài chính', 'AI - Robotics',
				'GDKN-Vận động theo nhạc', 'GDKN-Cờ vua', 'GDKN-Ẩm thực nấu ăn'
			],

			headersHK: [
				{ title: 'Môn học', value: 'TenMon', width: '30%' },
				{ title: 'KT thường xuyên', value: 'ktthuongxuyen', align: 'center' },
				{ title: 'KT giữa kì', value: 'ktgiuaki', align: 'center' },
				{ title: 'KT cuối kì', value: 'ktcuoiki', align: 'center' },
				{ title: 'ĐTB môn', value: 'dtb', align: 'center' },
			],
			headersCN: [
				{ title: 'Môn học', value: 'TenMon', width: '60%' },
				{ title: 'Điểm trung bình', value: 'dtb', align: 'center' },
			],
		}
	},

	async mounted() {
		this.loading = true
		try {
			await this.loadDSMonHoc()
			await this.loadCongBoBangDiem()
		} finally {
			this.loading = false
		}
	},

	computed: {
		isCapTrung() {
			return this.HocSinh.CapID === 2 || this.HocSinh.CapID === 3
		},
		hoTenViet() {
			const ho = this.HocSinh?.HoTen || ''
			return ho.split(' ').filter(Boolean).map(w => w[0]).slice(-2).join('').toUpperCase() || 'HS'
		},
	},

	watch: {
		activeTab(tab) {
			if (!tab) return
			localStorage.setItem('Semester', tab)
			this.loadBangDiem(tab)
		},
	},

	methods: {
		// ─── API Calls ────────────────────────────────────────────────

		loadCongBoBangDiem() {
			return new Promise(resolve => {
				ajaxCALL('lms/CongBoBangDiem_Get', {
					CapID: this.HocSinh.CapID,
					NienKhoa: this.NienKhoa,
				}, res => {
					const data = res.data
					if (this.HocSinh.CapID === 1) {
						const nameMap = { 1: 'GHKI', 2: 'CHKI', 3: 'GHKII', 4: 'CN' }
						this.DSHocKy = data.map(x => ({ id: x.KyDanhGia, name: nameMap[x.KyDanhGia] ?? `Kỳ ${x.KyDanhGia}` }))
					} else {
						this.DSHocKy = [
							{ id: 1, name: 'Học kỳ 1' },
							{ id: 2, name: 'Học kỳ 2' },
							{ id: 3, name: 'Cả năm' },
						]
					}
					// Tab mặc định: kỳ đánh giá public gần nhất, hoặc kỳ cuối
					const lastPublic = [...data].reverse().find(x => x.Is_Public)
					this.activeTab = lastPublic
						? lastPublic.KyDanhGia
						: (data.length ? data[data.length - 1].KyDanhGia : 1)
					resolve()
				})
			})
		},

		loadDSMonHoc() {
			return new Promise(resolve => {
				ajaxCALL('lms/MonHoc_Get_ByCapID', { CapID: this.HocSinh.CapID }, res => {
					this.DSMonHoc = res.data
					resolve()
				})
			})
		},

		loadBangDiem(kyDanhGia) {
			if (!this.NienKhoa || !kyDanhGia) return
			return new Promise(resolve => {
				ajaxCALL('diemc3/LMS_GetBangDiem', {
					HocSinhID: this.HocSinh.HocSinhID,
					Khoi: this.HocSinh.KhoiID,
					NamHoc: this.NienKhoa,
					KyDanhGia: kyDanhGia,
				}, res => {
					if (this.HocSinh.CapID === 1) {
						// Cấp 1: res.data[0] là 1 object dữ liệu phẳng chứa tất cả mã cột điểm
						const raw = res.data[0] ?? {}
						this.groupKTKN = this.fn_groupKTKN(raw)
						this.groupNLC  = this.fn_groupNLC(raw)
						this.groupPC   = this.fn_groupPC(raw)
						this.groupNLR  = this.fn_groupNLR(raw)
						this.ChuyenCan = {
							khongphep: raw.khongphep,
							cophep: raw.cophep,
							ditre: raw.ditre,
						}

						// Gọi thêm API bổ sung điểm môn đặc biệt (STEM, JA, AI, GDKN…)
						ajaxCALL('lms/LMS_OutSLL_GetKetQuaHocTap_ByHocSinhID', {
							LopID: this.HocSinh.LopID,
							KyDanhGia: kyDanhGia,
							NamHoc: this.NienKhoa,
							HocSinhID: this.HocSinh.HocSinhID,
						}, res2 => {
							const rows = res2.data
							const byMon = {}
							for (const r of rows) {
								if (!byMon[r.MonHocName]) byMon[r.MonHocName] = {}
								byMon[r.MonHocName][r.MaCotDiem] = r.KetQuaDanhGia
								byMon[r.MonHocName].QuyDoiSao = r.QuyDoiSao
								byMon[r.MonHocName].NhanXet   = r.NhanXet
							}
							const patch = {}
							for (const tenMon of this.List_MonHoc_Change) {
								const m = byMon[tenMon]
								if (!m) continue
								const nxKey = tenMon.replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase() + 'NX'
								patch[tenMon] = {
									[`${tenMon.substring(0,2)}S`]: m.QuyDoiSao,
									KNATNANX: m.NhanXet,
									...this.groupKTKN[tenMon],
								}
							}
							this.groupKTKN = { ...this.groupKTKN, ...patch }

							// Mở panel nếu có nhận xét
							this.panelKTKN = Object.keys(this.groupKTKN).reduce((acc, k, i) => {
								const nxKey = Object.keys(this.groupKTKN[k]).find(x => x.endsWith('NX'))
								if (nxKey && this.groupKTKN[k][nxKey]) acc.push(i)
								return acc
							}, [])
							this.panelNLC = Object.keys(this.groupNLC).map((_, i) => i)
							this.panelPC  = Object.keys(this.groupPC).map((_, i) => i)
							this.panelNLR = Object.keys(this.groupNLR).map((_, i) => i)
							resolve()
						})
					} else {
						// Cấp 2/3: res.data là array 6 phần tử
						// [0]=Diem HK1, [1]=TongKet HK1, [2]=Diem HK2, [3]=TongKet HK2, [4]=Diem CN, [5]=TongKet CN
						this.dataHK1 = { Diem: res.data[0] ?? [], TongKet: res.data[1]?.[0] ?? {} }
						this.dataHK2 = { Diem: res.data[2] ?? [], TongKet: res.data[3]?.[0] ?? {} }
						this.dataCN  = { Diem: res.data[4] ?? [], TongKet: res.data[5]?.[0] ?? {} }
						resolve()
					}
				})
			})
		},

		// ─── Grouping cho Cấp 1 (giữ nguyên logic từ uc-hoc-ky-2) ───

		fn_groupKTKN(d) {
			const isTieuHoc = [1, 2, 3].includes(this.HocSinh.KhoiID)
			return {
				'Tiếng Việt': { TVM: d.TVM, TVD: d.TVD, TVNX: d.TVNX },
				'Toán': { TOM: d.TOM, TOD: d.TOD, TONX: d.TONX },
				[isTieuHoc ? 'Tự nhiên và Xã hội' : 'Khoa học']: { KHM: d.KHM, KHD: d.KHD, KHNX: d.KHNX },
				'Lịch sử/Địa lí': { SDM: d.SDM, SDD: d.SDD, SDNX: d.SDNX },
				'Ngoại ngữ': { NNM: d.NNM, NND: d.NND, NNNX: d.NNNX },
				'Tin học và Công nghệ (Tin học)': { THM: d.THM, THD: d.THD, THNX: d.THNX },
				'Tin học và Công nghệ (Công nghệ)': { CNM: d.CNM, CND: d.CND, CNNX: d.CNNX },
				'Đạo đức': { DDM: d.DDM, DDNX: d.DDNX },
				'Âm nhạc': { ANM: d.ANM, ANNX: d.ANNX },
				'Mĩ thuật': { MTM: d.MTM, MTNX: d.MTNX },
				'Hoạt động trải nghiệm': { KTM: d.KTM, KTNX: d.KTNX },
				'Giáo dục thể chất': { TDM: d.TDM, TDNX: d.TDNX },
				'STEM': { STENX: d.STENX },
				'JA-GD Tài chính': { JANX: d.JANX },
				'AI - Robotics': { AINX: d.AINX },
				'GDKN - Học tập TK21': { KNHNX: d.KNHNX },
				'GDKN-Vận động theo nhạc': { KNNNX: d.KNNNX },
				'GDKN-Cờ vua': { KNCNX: d.KNCNX },
			}
		},
		fn_groupNLC(d) {
			return {
				'Năng lực-Tự chủ và tự học': { NL1: d.NL1, NLC1NX: d.NLC1NX },
				'Năng lực-Giao tiếp và hợp tác': { NL2: d.NL2, NLC2NX: d.NLC2NX },
				'Năng lực-Giải quyết vấn đề và sáng tạo': { NL3: d.NL3, NLC3NX: d.NLC3NX },
			}
		},
		fn_groupPC(d) {
			return {
				'Phẩm chất-Yêu nước': { PC1: d.PC1, PC1NX: d.PC1NX },
				'Phẩm chất-Nhân ái': { PC2: d.PC2, PC2NX: d.PC2NX },
				'Phẩm chất-Chăm chỉ': { PC3: d.PC3, PC3NX: d.PC3NX },
				'Phẩm chất-Trung thực': { PC4: d.PC4, PC4NX: d.PC4NX },
				'Phẩm chất-Trách nhiệm': { PC5: d.PC5, PC5NX: d.PC5NX },
			}
		},
		fn_groupNLR(d) {
			return {
				'Năng lực-Ngôn ngữ': { NLR1: d.NLR1, NLR1NX: d.NLR1NX },
				'Năng lực-Tính toán': { NLR2: d.NLR2, NLR2NX: d.NLR2NX },
				'Năng lực-Khoa học': { NLR3: d.NLR3, NLR3NX: d.NLR3NX },
				'Năng lực-Công nghệ': { NLR4: d.NLR4, NLR4NX: d.NLR4NX },
				'Năng lực-Tin học': { NLR5: d.NLR5, NLR5NX: d.NLR5NX },
				'Năng lực-Thẩm mĩ': { NLR6: d.NLR6, NLR6NX: d.NLR6NX },
				'Năng lực-Thể chất': { NLR7: d.NLR7, NLR7NX: d.NLR7NX },
			}
		},

		// ─── Helpers lấy giá trị từ object cột điểm (C1) ─────────────

		getMucDat(val) {
			const k = Object.keys(val).find(x => x.endsWith('M'))
			return k ? val[k] : null
		},
		getDiem(val) {
			const k = Object.keys(val).find(x => x.endsWith('D'))
			return k ? val[k] : null
		},
		getSao(val) {
			const k = Object.keys(val).find(x => x.endsWith('S'))
			return k ? val[k] : null
		},
		getNhanXet(val) {
			const k = Object.keys(val).find(x => x.endsWith('NX'))
			return k ? val[k] : null
		},
		getMucDatNLC(val) {
			const k = Object.keys(val).find(x => !x.endsWith('NX'))
			return k ? val[k] : null
		},

		// ─── DSMonHoc helpers ──────────────────────────────────────────

		getMonHocItem(tenMon) {
			return this.DSMonHoc.find(x =>
				x.MonHocName === tenMon ||
				(tenMon === 'Giáo dục thể chất' && x.MonHocName === 'Thể dục')
			)
		},
		getMonHocColor(tenMon) {
			return this.getMonHocItem(tenMon)?.Color ?? '#000000'
		},
		getMonHocIcon(tenMon) {
			return this.getMonHocItem(tenMon)?.Icon ?? 'mdi-book-open'
		},

		fmtScore(v) {
			if (v === '' || v == null) return '—'
			return String(v)
				.replace(/\t/g, ' ')
				.replace(/\s*-\s*/g, ' - ')
				.replace(/\s+/g, ' ')
				.trim() || '—'
		},

		// ─── Mức độ đánh giá C1 ───────────────────────────────────────

		getColorMuc(muc) {
			if (muc === 'T') return 'success'
			if (muc === 'H') return 'primary'
			if (muc === 'Đ' || muc === 'Ð') return 'primary'
			if (muc === 'C') return 'amber'
			return 'default'
		},
		getBgMuc(muc) {
			if (muc === 'T') return 'green-lighten-5'
			if (muc === 'H') return 'blue-lighten-5'
			if (muc === 'Đ' || muc === 'Ð') return 'blue-lighten-5'
			if (muc === 'C') return 'amber-lighten-3'
			return ''
		},
	},
	}
</script>