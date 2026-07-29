<template>
	<v-card-text class="pa-2" :style="{ height: sheetHeight, overflow: 'hidden' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact">
			Chọn một lớp ở thanh trên để lập kế hoạch chủ nhiệm năm học.
		</v-alert>
		<div v-else class="d-flex h-100 ga-3">
			<div class="flex-shrink-0 overflow-y-auto"
				style="width: 260px; border-right: 1px solid rgba(0, 0, 0, 0.12);">
				<v-list density="compact" nav color="primary" class="pa-0">
					<v-list-subheader class="text-caption font-weight-bold text-primary px-3">
						I. ĐẶC ĐIỂM TÌNH HÌNH
					</v-list-subheader>
					<v-list-item :value="planCards[0].key" :active="activeCardKey === planCards[0].key"
						class="mb-1 rounded" @click="scrollToCard(planCards[0])">
						<template #prepend>
							<v-icon size="small" class="mr-2">{{ planCards[0].icon }}</v-icon>
						</template>
						<v-list-item-title class="text-caption font-weight-bold">
							{{ planCards[0].navTitle }}
						</v-list-item-title>
					</v-list-item>
					<v-list-subheader class="text-caption font-weight-bold text-primary px-3 mt-2">
						II. NỘI DUNG KẾ HOẠCH
					</v-list-subheader>
					<v-list-item v-for="card in planCards.slice(1)" :key="card.key" :value="card.key"
						:active="activeCardKey === card.key" class="mb-1 rounded" @click="scrollToCard(card)">
						<template #prepend>
							<v-icon size="small" class="mr-2" :color="activeCardKey === card.key ? 'primary' : ''">
								{{ card.icon }}
							</v-icon>
						</template>
						<v-list-item-title class="text-caption font-weight-bold text-wrap" style="line-height: 1.3;">
							{{ card.navTitle }}
						</v-list-item-title>
					</v-list-item>
				</v-list>
			</div>

			<div ref="scrollContainer" class="flex-grow-1 h-100 overflow-y-auto pr-1">
				<div class="text-h6 text-center font-weight-bold py-3">
					KẾ HOẠCH CHỦ NHIỆM NĂM HỌC
					<div class="text-body-2 mt-1">
						LỚP {{ selectedClass?.TenLop || '.....' }} - NĂM HỌC {{ schoolYearText }}
					</div>
				</div>

				<v-row dense class="pb-16">
					<v-col cols="12" class="py-2">
						<v-card :id="planCards[0].domId" variant="outlined" elevation="0">
							<v-card-title
								class="px-3 py-2 text-subtitle-2 font-weight-bold text-primary d-flex align-start"
								style="white-space: pre-line; line-height: 1.6;">
								<v-icon start color="primary" class="mr-2 mt-1" size="small">{{ planCards[0].icon }}
								</v-icon>
								{{ planCards[0].title }}
							</v-card-title>
							<v-divider />
							<v-card-text class="pa-2">
								<div class="wrapper-jexcel">
									<div :ref="planCards[0].refName" class="w-100 so-gvcn-sheet"
										:style="{ height: planCards[0].height }"></div>
								</div>
								<v-textarea v-model="planText.advantages" label="2. Thuận lợi" rows="4" auto-grow
									variant="outlined" density="compact" class="mt-3 mb-2" />
								<v-textarea v-model="planText.difficulties" label="3. Khó khăn" rows="4" auto-grow
									variant="outlined" density="compact" hide-details />
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" class="py-2">
						<v-card variant="outlined" elevation="0">
							<v-card-title class="px-3 py-2 text-subtitle-2 font-weight-bold text-primary">
								<v-icon start color="primary" class="mr-2" size="small">mdi-clipboard-text-outline
								</v-icon>
								II. NỘI DUNG KẾ HOẠCH CHỦ NHIỆM
							</v-card-title>
							<v-divider />
							<v-card-text class="pa-0">
								<section v-for="(card, index) in planCards.slice(1)" :id="card.domId" :key="card.key"
									class="pa-3" :class="{ 'border-t': index > 0 }">
									<div class="text-subtitle-2 font-weight-bold text-primary mb-3"
										style="white-space: pre-line; line-height: 1.6;">
										{{ card.title }}
									</div>

									<div v-if="!card.textOnly" class="wrapper-jexcel">
										<div :ref="card.refName" class="w-100 so-gvcn-sheet"
											:style="{ height: card.height }"></div>
									</div>

									<template v-if="card.key === 'duy-tri-so-luong'">
										<v-textarea v-model="planText.attendanceTarget" label="1.1. Chỉ tiêu phấn đấu"
											rows="4" auto-grow variant="outlined" density="compact" class="mb-2" />
										<v-textarea v-model="planText.attendanceSolution"
											label="1.2. Nhiệm vụ và giải pháp" rows="4" auto-grow variant="outlined"
											density="compact" hide-details />
									</template>
									<v-textarea v-if="card.key === 'pham-chat-nang-luc'"
										v-model="planText.qualitySolution" label="b. Nhiệm vụ và giải pháp" rows="4"
										auto-grow variant="outlined" density="compact" class="mt-3" hide-details />
									<v-textarea v-if="card.key === 'mon-hoc-hoat-dong'"
										v-model="planText.academicSolution" label="b. Nhiệm vụ và giải pháp" rows="4"
										auto-grow variant="outlined" density="compact" class="mt-3" hide-details />
									<template v-if="card.key === 'phong-trao-vo-sach'">
										<v-textarea v-model="planText.handwritingTarget" label="a. Chỉ tiêu phấn đấu"
											rows="4" auto-grow variant="outlined" density="compact" class="mb-2" />
										<v-textarea v-model="planText.handwritingSolution"
											label="b. Nhiệm vụ và giải pháp" rows="4" auto-grow variant="outlined"
											density="compact" hide-details />
									</template>
									<div v-if="card.key === 'hoat-dong-khac'">
										<div class="text-body-2 font-weight-bold mb-2">3.1. Hoạt động ngoài giờ lên lớp
										</div>
										<v-textarea v-model="planText.extracurricularTarget" label="a. Chỉ tiêu"
											rows="4" auto-grow variant="outlined" density="compact" class="mb-2" />
										<v-textarea v-model="planText.extracurricularSolution"
											label="b. Nhiệm vụ và giải pháp" rows="4" auto-grow variant="outlined"
											density="compact" class="mb-3" />

										<div class="text-body-2 font-weight-bold mb-2">
											3.2. Trang trí lớp học, giữ gìn và bảo quản CSVC của lớp
										</div>
										<v-textarea v-model="planText.classroomTarget"
											label="a. Chỉ tiêu (số lượng, tỉ lệ %)" rows="4" auto-grow
											variant="outlined" density="compact" class="mb-2" />
										<v-textarea v-model="planText.classroomSolution"
											label="b. Nhiệm vụ và giải pháp" rows="4" auto-grow variant="outlined"
											density="compact" class="mb-3" />

										<div class="text-body-2 font-weight-bold mb-2">
											3.3. Công tác lao động, xây dựng trường lớp xanh - sạch - đẹp
										</div>
										<v-textarea v-model="planText.laborTarget"
											label="a. Chỉ tiêu (số lượng, tỉ lệ %)" rows="4" auto-grow
											variant="outlined" density="compact" class="mb-2" />
										<v-textarea v-model="planText.laborSolution" label="b. Nhiệm vụ và giải pháp"
											rows="4" auto-grow variant="outlined" density="compact" class="mb-3" />

										<div class="text-body-2 font-weight-bold mb-2">3.4. Công tác xã hội hoá giáo dục
										</div>
										<v-textarea v-model="planText.socializationTarget"
											label="a. Chỉ tiêu (số lượng, tỉ lệ %)" rows="4" auto-grow
											variant="outlined" density="compact" class="mb-2" />
										<v-textarea v-model="planText.socializationSolution"
											label="b. Nhiệm vụ và giải pháp" rows="4" auto-grow variant="outlined"
											density="compact" class="mb-3" />
										<v-textarea v-model="planText.classTitle" label="* Lớp phấn đấu đạt danh hiệu"
											rows="3" auto-grow variant="outlined" density="compact" hide-details />
									</div>
								</section>
							</v-card-text>
						</v-card>
					</v-col>
				</v-row>
			</div>
		</div>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-c1-tab-ke-hoach-nam-hoc',
		props: {
			selectedLopID: { type: [String, Number], default: '__ALL__' },
			selectedClass: { type: Object, default: null },
			schoolYearText: { type: String, default: '' },
			sheetHeight: { type: String, default: 'calc(100vh - 230px)' },
			annualPlan: { type: [String, Object], default: '' }
		},
		data() {
			return {
				activeCardKey: 'dac-diem',
				sheetInstances: {},
				qualityCompetencySubjects: this.getDefaultQualityCompetencySubjects(),
				academicSubjects: this.getDefaultAcademicSubjects(),
				planText: this.buildPlanText(this.annualPlan),
				planCards: this.buildPlanCards(this.annualPlan)
			}
		},
		watch: {
			selectedLopID() {
				this.planText = this.buildPlanText(this.annualPlan)
				this.planCards = this.buildPlanCards(this.annualPlan)
				this.initAllSheets()
			},
			annualPlan(value) {
				this.planText = this.buildPlanText(value)
				this.planCards = this.buildPlanCards(value)
				this.initAllSheets()
			}
		},
		async mounted() {
			await this.loadQualityCompetencySubjects()
			this.planCards = this.buildPlanCards(this.annualPlan)
			this.initAllSheets()
		},
		beforeUnmount() {
			this.destroyAllSheets()
		},
		methods: {
			buildPlanCards(value) {
				const saved = this.parseAnnualPlan(value)
				return [
					{
						key: 'dac-diem',
						roman: 'I',
						navTitle: '1. Thống kê tình hình lớp học',
						icon: 'mdi-chart-box-outline',
						domId: 'ke-hoach-nam-hoc-muc-i',
						refName: 'annualSectionIRef',
						title: 'I. ĐẶC ĐIỂM TÌNH HÌNH\n1. THỐNG KÊ TÌNH HÌNH LỚP HỌC',
						height: '360px',
						columns: [
							{ title: 'Thời điểm / Nội dung', width: 190, readOnly: true },
							{ title: 'Tổng số', width: 85 },
							{ title: 'Nữ', width: 70 },
							{ title: 'Dân tộc', width: 85 },
							{ title: 'Lưu ban', width: 85 },
							{ title: 'Cần quan tâm', width: 120 },
							{ title: 'Con thương binh', width: 130 },
							{ title: 'Con liệt sĩ', width: 110 },
							{ title: 'Hộ nghèo', width: 90 },
							{ title: 'Hộ cận nghèo', width: 110 },
							{ title: 'CB/CCVC', width: 90 },
							{ title: 'Ghi chú', width: 240 }
						],
						rows: this.buildSituationRows(saved)
					},
					{
						key: 'duy-tri-so-luong',
						roman: 'II',
						navTitle: '1. Duy trì số lượng',
						icon: 'mdi-clipboard-text-outline',
						domId: 'ke-hoach-nam-hoc-muc-ii',
						title: '1. DUY TRÌ SỐ LƯỢNG',
						textOnly: true
					},
					{
						key: 'pham-chat-nang-luc',
						roman: 'II',
						navTitle: '2.1. Phẩm chất – Năng lực',
						icon: 'mdi-account-star-outline',
						domId: 'ke-hoach-nam-hoc-muc-ii-pcnl',
						refName: 'annualQualityCompetencyRef',
						title: '2. CHẤT LƯỢNG GIÁO DỤC\n2.1. PHẨM CHẤT – NĂNG LỰC\na. CHỈ TIÊU PHẤN ĐẤU',
						height: '205px',
						freezeColumns: 1,
						columns: this.buildQualityCompetencyColumns(),
						nestedHeaders: this.buildQualityCompetencyNestedHeaders(),
						rows: this.buildQualityCompetencyRows(saved)
					},
					{
						key: 'mon-hoc-hoat-dong',
						roman: 'II',
						navTitle: '2.2. Môn học và HĐGD',
						icon: 'mdi-book-open-page-variant-outline',
						domId: 'ke-hoach-nam-hoc-muc-ii-mon-hoc',
						refName: 'annualAcademicTargetRef',
						title: '2.2. MÔN HỌC VÀ HOẠT ĐỘNG GIÁO DỤC\na. CHỈ TIÊU PHẤN ĐẤU',
						height: '205px',
						freezeColumns: 1,
						columns: this.buildAcademicColumns(),
						nestedHeaders: this.buildAcademicNestedHeaders(),
						rows: this.buildAcademicRows(saved)
					},
					{
						key: 'phong-trao-vo-sach',
						roman: 'II',
						navTitle: '2.3. Vở sạch viết chữ đẹp',
						icon: 'mdi-text-box-edit-outline',
						domId: 'ke-hoach-nam-hoc-muc-ii-vo-sach',
						title: '2.3. PHONG TRÀO VỞ SẠCH VIẾT CHỮ ĐẸP',
						textOnly: true
					},
					{
						key: 'hoat-dong-khac',
						roman: 'II',
						navTitle: '3. Các hoạt động khác',
						icon: 'mdi-format-list-checks',
						domId: 'ke-hoach-nam-hoc-muc-iii-hoat-dong',
						title: '3. CÁC HOẠT ĐỘNG KHÁC',
						textOnly: true
					}
				]
			},
			getDefaultAcademicSubjects() {
				return [
					{ MonHocID: 1, TenMonHoc_HienThi: 'Tiếng Việt' },
					{ MonHocID: 2, TenMonHoc_HienThi: 'Toán' },
					{ MonHocID: 5, TenMonHoc_HienThi: 'Ngoại ngữ' },
					{ MonHocID: 19, TenMonHoc_HienThi: 'Lịch sử và Địa lí' },
					{ MonHocID: 4, TenMonHoc_HienThi: 'Khoa học' },
					{ MonHocID: 6, TenMonHoc_HienThi: 'Tin học và Công nghệ (Tin học)' },
					{ MonHocID: 35, TenMonHoc_HienThi: 'Tin học và Công nghệ (Công nghệ)' },
					{ MonHocID: 8, TenMonHoc_HienThi: 'Đạo đức' },
					{ MonHocID: 12, TenMonHoc_HienThi: 'Giáo dục thể chất' },
					{ MonHocID: 9, TenMonHoc_HienThi: 'Nghệ thuật (Âm nhạc)' },
					{ MonHocID: 10, TenMonHoc_HienThi: 'Nghệ thuật (Mĩ thuật)' },
					{ MonHocID: 11, TenMonHoc_HienThi: 'Hoạt động trải nghiệm' }
				]
			},
			getDefaultQualityCompetencySubjects() {
				return [
					{ MonHocID: 23, TenMonHoc_HienThi: 'Phẩm chất-Yêu nước', group: 'Phẩm chất' },
					{ MonHocID: 24, TenMonHoc_HienThi: 'Phẩm chất-Nhân ái', group: 'Phẩm chất' },
					{ MonHocID: 25, TenMonHoc_HienThi: 'Phẩm chất-Chăm chỉ', group: 'Phẩm chất' },
					{ MonHocID: 26, TenMonHoc_HienThi: 'Phẩm chất-Trung thực', group: 'Phẩm chất' },
					{ MonHocID: 27, TenMonHoc_HienThi: 'Phẩm chất-Trách nhiệm', group: 'Phẩm chất' },
					{ MonHocID: 20, TenMonHoc_HienThi: 'Năng lực-Tự chủ và tự học', group: 'Năng lực' },
					{ MonHocID: 21, TenMonHoc_HienThi: 'Năng lực-Giao tiếp và hợp tác', group: 'Năng lực' },
					{ MonHocID: 22, TenMonHoc_HienThi: 'Năng lực-Giải quyết vấn đề và sáng tạo', group: 'Năng lực' },
					{ MonHocID: 28, TenMonHoc_HienThi: 'Năng lực-Ngôn ngữ', group: 'Năng lực' },
					{ MonHocID: 29, TenMonHoc_HienThi: 'Năng lực-Tính toán', group: 'Năng lực' },
					{ MonHocID: 30, TenMonHoc_HienThi: 'Năng lực-Khoa học', group: 'Năng lực' },
					{ MonHocID: 31, TenMonHoc_HienThi: 'Năng lực-Công nghệ', group: 'Năng lực' },
					{ MonHocID: 32, TenMonHoc_HienThi: 'Năng lực-Tin học', group: 'Năng lực' },
					{ MonHocID: 33, TenMonHoc_HienThi: 'Năng lực-Thẩm mĩ', group: 'Năng lực' },
					{ MonHocID: 34, TenMonHoc_HienThi: 'Năng lực-Thể chất', group: 'Năng lực' }
				]
			},
			async loadQualityCompetencySubjects() {
				if (typeof ajaxCALLPromise !== 'function') return
				try {
					const subjects = await ajaxCALLPromise('lms/MonHoc_Get_ByCapID', { CapID: 1 })
					const subjectById = new Map((subjects || []).map(subject => [Number(subject.MonHocID), subject]))
					this.qualityCompetencySubjects = this.getDefaultQualityCompetencySubjects().map(fallback => ({
						...fallback,
						...(subjectById.get(fallback.MonHocID) || {})
					}))
					this.academicSubjects = this.getDefaultAcademicSubjects().map(fallback => ({
						...fallback,
						...(subjectById.get(fallback.MonHocID) || {})
					}))
				} catch (error) {
					console.error('Không thể tải danh sách môn học, phẩm chất và năng lực từ tblMonHoc:', error)
				}
			},
			getQualityCompetencyName(subject) {
				const name = subject.TenMonHoc_HienThi || subject.MonHocName || subject.TenMonHoc || ''
				return name.replace(/^(Phẩm chất|Năng lực)\s*[-–]\s*/i, '').trim()
			},
			buildQualityCompetencyColumns() {
				const subjects = this.qualityCompetencySubjects || this.getDefaultQualityCompetencySubjects()
				return [
					{ title: 'Xếp loại', width: 150, readOnly: true },
					...subjects.flatMap(() => [
						{ title: 'Số lượng', width: 95, type: 'numeric' },
						{ title: 'Tỉ lệ', width: 85, type: 'numeric' }
					])
				]
			},
			buildQualityCompetencyNestedHeaders() {
				const subjects = this.qualityCompetencySubjects || this.getDefaultQualityCompetencySubjects()
				const qualityCount = subjects.filter(subject => subject.group === 'Phẩm chất').length
				const competencyCount = subjects.length - qualityCount
				return [
					[
						{ title: '', colspan: 1 },
						{ title: 'Phẩm chất', colspan: qualityCount * 2 },
						{ title: 'Năng lực', colspan: competencyCount * 2 }
					],
					[
						{ title: '', colspan: 1 },
						...subjects.map(subject => ({
							title: this.getQualityCompetencyName(subject),
							colspan: 2
						}))
					]
				]
			},
			buildQualityCompetencyRows(saved) {
				const subjects = this.qualityCompetencySubjects || this.getDefaultQualityCompetencySubjects()
				const savedRows = saved.qualityCompetencyTargets || saved['pham-chat-nang-luc']
				if (Array.isArray(savedRows)) {
					return savedRows.map(row => row.slice())
				}
				return ['Tốt (T)', 'Đạt (Đ)', 'Cần cố gắng (C)'].map(title => [
					title,
					...subjects.flatMap(() => ['', ''])
				])
			},
			buildAcademicColumns() {
				const subjects = this.academicSubjects || this.getDefaultAcademicSubjects()
				return [
					{ title: 'Xếp loại', width: 170, readOnly: true },
					...subjects.flatMap(() => [
						{ title: 'Số lượng', width: 95, type: 'numeric' },
						{ title: 'Tỉ lệ', width: 85, type: 'numeric' }
					])
				]
			},
			buildAcademicNestedHeaders() {
				const subjects = this.academicSubjects || this.getDefaultAcademicSubjects()
				return [[
					{ title: '', colspan: 1 },
					...subjects.map(subject => ({
						title: subject.TenMonHoc_HienThi || subject.MonHocName || subject.TenMonHoc || '',
						colspan: 2
					}))
				]]
			},
			buildAcademicRows(saved) {
				const subjects = this.academicSubjects || this.getDefaultAcademicSubjects()
				const savedRows = saved.academicTargets || saved['mon-hoc-hoat-dong']
				if (Array.isArray(savedRows)) return savedRows.map(row => row.slice())
				return ['Hoàn thành tốt (T)', 'Hoàn thành (H)', 'Chưa hoàn thành (C)'].map(title => [
					title,
					...subjects.flatMap(() => ['', ''])
				])
			},
			parseAnnualPlan(value) {
				if (!value) return {}
				try {
					return typeof value === 'string' ? JSON.parse(value) : value
				} catch (error) {
					return {}
				}
			},
			buildPlanText(value) {
				const saved = this.parseAnnualPlan(value)
				const savedRows = Array.isArray(saved.sectionII) ? saved.sectionII : []
				const getLegacyValues = (prefix, key) => {
					const row = savedRows.find(item => String(item?.[0] || '').startsWith(prefix))
					return {
						target: row?.[1] || saved.sections?.[key]?.target || '',
						solution: row?.[2] || saved.sections?.[key]?.solution || ''
					}
				}
				const academic = getLegacyValues('2.2.', 'subjects')
				const attendance = getLegacyValues('1.', 'attendance')
				const quality = getLegacyValues('2.1.', 'qualities')
				const handwriting = getLegacyValues('2.3.', 'handwriting')
				const extracurricular = getLegacyValues('3.1.', 'extracurricular')
				const classroom = getLegacyValues('3.2.', 'classroom')
				const labor = getLegacyValues('3.3.', 'labor')
				const socialization = getLegacyValues('3.4.', 'socialization')
				const classTitleRow = savedRows.find(item => String(item?.[0] || '').startsWith('* Lớp phấn đấu'))
				const attendanceTargetRow = savedRows.find(item => String(item?.[0] || '').startsWith('1.1.'))
				const attendanceSolutionRow = savedRows.find(item => String(item?.[0] || '').startsWith('1.2.'))
				return {
					advantages: saved.advantages || '',
					difficulties: saved.difficulties || '',
					attendanceTarget: saved.attendanceTarget || attendanceTargetRow?.[1] || attendance.target,
					attendanceSolution: saved.attendanceSolution || attendanceSolutionRow?.[2] || attendance.solution,
					qualitySolution: saved.qualitySolution || quality.solution,
					academicSolution: saved.academicSolution || academic.solution,
					handwritingTarget: saved.handwritingTarget || handwriting.target,
					handwritingSolution: saved.handwritingSolution || handwriting.solution,
					extracurricularTarget: saved.extracurricularTarget || extracurricular.target,
					extracurricularSolution: saved.extracurricularSolution || extracurricular.solution,
					classroomTarget: saved.classroomTarget || classroom.target,
					classroomSolution: saved.classroomSolution || classroom.solution,
					laborTarget: saved.laborTarget || labor.target,
					laborSolution: saved.laborSolution || labor.solution,
					socializationTarget: saved.socializationTarget || socialization.target,
					socializationSolution: saved.socializationSolution || socialization.solution,
					classTitle: saved.classTitle || classTitleRow?.[1] || ''
				}
			},
			buildSituationRows(saved) {
				if (Array.isArray(saved.sectionI)) return saved.sectionI.map(row => row.slice())
				const periods = ['Đầu năm', 'Giữa HKI', 'Cuối HKI', 'Đầu HKII', 'Giữa HKII', 'Cuối năm']
				const keys = ['total', 'female', 'ethnic', 'repeater', 'special', 'wounded', 'martyr', 'poor', 'nearPoor', 'official', 'note']
				return periods.map((period, index) => {
					const source = saved.statistics?.[index] || {}
					return [period, ...keys.map(key => source[key] || '')]
				})
			},
			buildContentRows(saved) {
				const sections = [
					['classroom', '3.2. Trang trí lớp học, giữ gìn và bảo quản CSVC của lớp'],
					['labor', '3.3. Công tác lao động, xây dựng trường lớp xanh - sạch - đẹp'],
					['socialization', '3.4. Công tác xã hội hóa giáo dục']
				]
				const savedRows = Array.isArray(saved.sectionII) ? saved.sectionII : []
				const findSavedRow = prefix => savedRows.find(row => String(row?.[0] || '').startsWith(prefix))
				const getSavedValues = (key, title) => {
					const row = findSavedRow(title)
					return [
						row?.[1] || saved.sections?.[key]?.target || '',
						row?.[2] || saved.sections?.[key]?.solution || ''
					]
				}
				const rows = []
				rows.push(...sections.map(([key, title]) => {
					const [target, solution] = getSavedValues(key, title)
					return [title, target, solution]
				}))
				rows.push(['* Lớp phấn đấu đạt danh hiệu', saved.classTitle || '', ''])
				return rows
			},
			scrollToCard(card) {
				this.activeCardKey = card.key
				const target = document.getElementById(card.domId)
				if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
			},
			destroySheet(key) {
				const instance = this.sheetInstances[key]
				if (!instance) return
				try {
					const sheet = Array.isArray(instance) ? instance[0] : instance
					if (sheet && typeof sheet.destroy === 'function') sheet.destroy()
				} catch (error) {}
				delete this.sheetInstances[key]
			},
			destroyAllSheets() {
				Object.keys(this.sheetInstances).forEach(key => this.destroySheet(key))
			},
			initSheet(card) {
				this.$nextTick(() => {
					let container = this.$refs[card.refName]
					if (Array.isArray(container)) container = container[0]
					if (!container || typeof jspreadsheet !== 'function') return
					this.destroySheet(card.key)
					container.innerHTML = ''
					this.sheetInstances[card.key] = jspreadsheet(container, {
						worksheets: [{
							data: card.rows,
							columns: card.columns,
							nestedHeaders: card.nestedHeaders,
							...(card.freezeColumns ? { freezeColumns: card.freezeColumns } : {}),
							rowResize: true,
							columnDrag: false,
							tableWidth: '100%',
							tableOverflow: true,
							tableHeight: card.height,
							lazyLoading: false,
							wordWrap: true,
							allowInsertColumn: false,
							allowInsertRow: false,
							showHeader: true
						}],
						contextMenu: () => false,
						onchange: worksheet => {
							card.rows = worksheet.getData()
						}
					})
				})
			},
			initAllSheets() {
				if (this.selectedLopID === '__ALL__') {
					this.destroyAllSheets()
					return
				}
				this.planCards.filter(card => !card.textOnly).forEach(card => this.initSheet(card))
			},
			toNullableNumber(value) {
				if (value === '' || value === null || value === undefined) return null
				const number = Number(value)
				return Number.isFinite(number) ? number : null
			},
			buildNormalizedSubjectTargets(rows, subjects, ratingFields) {
				const lopID = String(this.selectedClass?.LopID || this.selectedLopID || '').trim()
				return subjects.map((subject, subjectIndex) => {
					const target = {
						LopID: lopID || null,
						MonHocID: subject.MonHocID
					}
					ratingFields.forEach((field, ratingIndex) => {
						target[`${field}_SoLuong`] = this.toNullableNumber(rows?.[ratingIndex]?.[1 + subjectIndex * 2])
						target[`${field}_TiLe`] = this.toNullableNumber(rows?.[ratingIndex]?.[2 + subjectIndex * 2])
					})
					return target
				})
			},
			buildNormalizedClassStatistics(rows) {
				const lopID = String(this.selectedClass?.LopID || this.selectedLopID || '').trim()
				const fields = [
					'TongSo', 'Nu', 'DanToc', 'LuuBan', 'CanQuanTam', 'ConThuongBinh',
					'ConLietSi', 'HoNgheo', 'HoCanNgheo', 'CBCCVC'
				]
				const periodCodes = ['DauNam', 'GK_HK1', 'CK_HK1', 'GK_HK2', 'CK_HK2', 'CuoiNam']
				return (rows || []).map((row, index) => {
					const statistic = {
						LopID: lopID || null,
						ThoiDiem: row?.[0] || '',
						ThoiDiemCode: periodCodes[index] || `Moc${index + 1}`,
						GhiChu: row?.[11] || ''
					}
					fields.forEach((field, fieldIndex) => {
						statistic[field] = this.toNullableNumber(row?.[fieldIndex + 1])
					})
					return statistic
				})
			},
			getPlanData() {
				const result = this.planCards.reduce((data, card) => {
					if (card.textOnly) return data
					const instance = this.sheetInstances[card.key]
					const sheet = Array.isArray(instance) ? instance[0] : instance
					data[card.key] = sheet && typeof sheet.getData === 'function'
						? sheet.getData()
						: card.rows
					return data
				}, {})
				result.version = 3
				result.type = 'c1-annual-plan'
				result.sectionI = result['dac-diem']
				result.sectionII = result['noi-dung'] || []
				result.classStatistics = this.buildNormalizedClassStatistics(result.sectionI)
				result.qualityCompetencyTargets = result['pham-chat-nang-luc']
				result.academicTargets = result['mon-hoc-hoat-dong']
				result.subjectTargets = [
					...this.buildNormalizedSubjectTargets(
						result.qualityCompetencyTargets,
						this.qualityCompetencySubjects,
						['Tot', 'Dat', 'CanCoGang']
					),
					...this.buildNormalizedSubjectTargets(
						result.academicTargets,
						this.academicSubjects,
						['HoanThanhTot', 'HoanThanh', 'ChuaHoanThanh']
					)
				]
				delete result['dac-diem']
				delete result['noi-dung']
				delete result['pham-chat-nang-luc']
				delete result['mon-hoc-hoat-dong']
				Object.assign(result, this.planText)
				return result
			}
		}
	}
</script>