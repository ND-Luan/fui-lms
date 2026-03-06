<template>
	<v-sheet class="pa-4">

		<!-- KPI Cards -->
		<v-row dense class="mb-4">
			<v-col cols="12" sm="4">
				<v-card color="primary" rounded="lg" elevation="2">
					<v-card-text class="d-flex align-center ga-3 py-3">
						<v-avatar color="white" size="42" rounded="md">
							<v-icon color="primary" size="22">mdi-book-multiple</v-icon>
						</v-avatar>
						<div>
							<div class="text-caption text-white" style="opacity:.8">Tổng học liệu</div>
							<div class="text-h5 font-weight-bold text-white">{{ totalHL }}</div>
						</div>
					</v-card-text>
				</v-card>
			</v-col>
			<v-col cols="12" sm="4">
				<v-card color="success" rounded="lg" elevation="2">
					<v-card-text class="d-flex align-center ga-3 py-3">
						<v-avatar color="white" size="42" rounded="md">
							<v-icon color="success" size="22">mdi-check-circle</v-icon>
						</v-avatar>
						<div>
							<div class="text-caption text-white" style="opacity:.8">Có nội dung</div>
							<div class="d-flex align-center ga-2">
								<div class="text-h5 font-weight-bold text-white">{{ totalHasND }}</div>
								<v-chip size="x-small" color="white" variant="tonal"
									class="text-success font-weight-bold">
									{{ totalHL ? Math.round(totalHasND / totalHL * 100) : 0 }}%
								</v-chip>
							</div>
						</div>
					</v-card-text>
				</v-card>
			</v-col>
			<v-col cols="12" sm="4">
				<v-card color="warning" rounded="lg" elevation="2">
					<v-card-text class="d-flex align-center ga-3 py-3">
						<v-avatar color="white" size="42" rounded="md">
							<v-icon color="warning" size="22">mdi-clock-outline</v-icon>
						</v-avatar>
						<div>
							<div class="text-caption text-white" style="opacity:.8">Chưa có nội dung</div>
							<div class="d-flex align-center ga-2">
								<div class="text-h5 font-weight-bold text-white">{{ totalHL - totalHasND }}</div>
								<v-chip size="x-small" color="white" variant="tonal"
									class="text-warning font-weight-bold">
									{{ totalHL ? Math.round((totalHL - totalHasND) / totalHL * 100) : 0 }}%
								</v-chip>
							</div>
						</div>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>

		<!-- Filter khối -->
		<v-card rounded="lg" elevation="0" border class="mb-4 pa-3">
			<div class="d-flex align-center ga-2 flex-wrap">
				<v-icon size="16" color="primary">mdi-filter-outline</v-icon>
				<span class="text-caption text-medium-emphasis">Lọc theo khối:</span>
				<v-btn-toggle v-model="activeKhoi" color="primary" variant="outlined" density="compact" rounded="lg"
					divided>
					<v-btn :value="0" size="small" class="text-caption">Tất cả</v-btn>
					<v-btn v-for="k in khoiList" :key="k" :value="k" size="small" class="text-caption">Khối {{ k }}
					</v-btn>
				</v-btn-toggle>
				<v-spacer />
				<v-chip size="small" color="success" variant="tonal" prepend-icon="mdi-check-circle">Có nội dung
				</v-chip>
				<v-chip size="small" color="warning" variant="tonal" prepend-icon="mdi-clock-outline">Chưa có nội dung
				</v-chip>
			</div>
		</v-card>

		<!-- Chart + Table -->
		<v-row dense>

			<!-- Chart -->
			<v-col cols="12" md="7">
				<v-card rounded="lg" elevation="0" border height="100%">
					<v-card-title class="text-body-2 font-weight-medium text-medium-emphasis pa-3 pb-2">
						<v-icon size="16" color="primary" class="mr-1">mdi-chart-bar</v-icon>
						Nội dung theo môn học
						<v-chip v-if="activeKhoi" size="x-small" color="primary" variant="tonal" class="ml-2">
							Khối {{ activeKhoi }}
						</v-chip>
					</v-card-title>
					<v-divider />
					<v-card-text class="pa-3">
						<uc-chart-apex :options="chartOptions" :show-custom-legend="activeKhoi === 0"
							:legend-config="legendConfig" />
					</v-card-text>
				</v-card>
			</v-col>

			<!-- Table -->
			<v-col cols="12" md="5">
				<v-card rounded="lg" elevation="0" border>
					<v-card-title class="text-body-2 font-weight-medium text-medium-emphasis pa-3 pb-2">
						<v-icon size="16" color="primary" class="mr-1">mdi-table</v-icon>
						Chi tiết học liệu
						<v-chip v-if="activeKhoi !== 0" size="x-small" color="primary" variant="tonal" class="ml-2">
							Khối {{ activeKhoi }}
						</v-chip>
					</v-card-title>
					<v-divider />
					<v-data-table :headers="tableHeaders" :items="filteredItems" density="compact" hide-default-footer
						fixed-header height="420" :items-per-page="-1" hover>
						<template #item.KhoiID="{ item }">
							<v-chip size="x-small" color="primary" variant="tonal" label class="font-weight-bold">
								Khối {{ item.KhoiID }}
							</v-chip>
						</template>

						<template #item.TenMonHoc_HienThi="{ item }">
							<div class="d-flex align-center ga-2 py-1">
								<v-avatar size="26" :color="getSubjectColor(item.TenMonHoc_HienThi)" rounded="sm">
									<v-icon size="14" color="white">mdi-book-open-variant</v-icon>
								</v-avatar>
								<span class="text-body-2">{{ item.TenMonHoc_HienThi }}</span>
							</div>
						</template>

						<template #item.TongNoiDung="{ item }">
							<div v-if="item.TongNoiDung > 0" class="d-flex align-center ga-2">
								<span class="text-body-2 font-weight-bold" style="min-width:28px;text-align:right">
									{{ item.TongNoiDung }}
								</span>
								<v-progress-linear :model-value="item.TongNoiDung / maxND * 100" color="primary" rounded
									height="5" style="width:60px;flex-shrink:0" />
							</div>
							<span v-else class="text-disabled">—</span>
						</template>

						<template #item.HocLieuCoNoiDung="{ item }">
							<v-chip :color="item.HocLieuCoNoiDung ? 'success' : 'warning'" variant="tonal"
								size="x-small"
								:prepend-icon="item.HocLieuCoNoiDung ? 'mdi-check' : 'mdi-clock-outline'">
								{{ item.HocLieuCoNoiDung ? 'Có nội dung' : 'Chưa có' }}
							</v-chip>
						</template>

						<!-- Footer tổng -->
						<template #bottom>
							<v-divider />
							<div class="d-flex align-center px-4 py-2 ga-3 flex-wrap bg-primary-lighten-5">
								<span class="text-caption font-weight-bold text-primary text-uppercase">Tổng cộng</span>
								<v-spacer />
								<div class="d-flex align-center ga-1">
									<v-icon size="13" color="primary">mdi-book-multiple</v-icon>
									<span class="text-body-2 font-weight-bold text-primary">{{ filteredItems.length }}
										học liệu</span>
								</div>
								<v-divider vertical class="mx-1" />
								<div class="d-flex align-center ga-1">
									<v-icon size="13" color="success">mdi-check-circle</v-icon>
									<span class="text-body-2 font-weight-bold text-success">
										{{ filteredItems.filter(i => i.HocLieuCoNoiDung).length }} có nội dung
									</span>
								</div>
								<v-divider vertical class="mx-1" />
								<div class="d-flex align-center ga-1">
									<v-icon size="13" color="warning">mdi-clock-outline</v-icon>
									<span class="text-body-2 font-weight-bold text-warning">
										{{ filteredItems.filter(i => !i.HocLieuCoNoiDung).length }} chưa có
									</span>
								</div>
							</div>
						</template>
					</v-data-table>
				</v-card>
			</v-col>

		</v-row>
	</v-sheet>
</template>

<script>
	export default {
		name: 'UcHocLieuSo',
		props: { CapID: { default: null } },
	
		data() {
			return {
				items: [],
				activeKhoi: 0,
				SUBJECT_COLORS: [
					'primary', 'teal', 'deep-purple', 'indigo', 'cyan',
					'pink', 'blue', 'green', 'orange', 'red',
				],
				colorPalette: [
					'rgb(var(--v-theme-primary))',
					'#F59E0B', '#22C55E', '#F472B6',
					'#06B6D4', '#8B5CF6', '#EF4444',
					'#84CC16', '#F97316', '#EC4899',
					'#14B8A6', '#6366F1', '#A78BFA',
				],
	
				tableHeaders: [
					{ title: 'Khối', value: 'KhoiID', width: 80, sortable: true },
					{ title: 'Môn học', value: 'TenMonHoc_HienThi', sortable: false },
					{ title: 'Nội dung', value: 'TongNoiDung', width: 140, sortable: true },
					{ title: 'Trạng thái', value: 'HocLieuCoNoiDung', width: 120, sortable: true },
				],
			}
		},
	
		mounted() { if (this.CapID) this.onLoad() },
		watch: {
			CapID(val) { if (val) this.onLoad() },
		},
	
		computed: {
			totalHL() { return this.items.length },
			totalHasND() { return this.items.filter(i => i.HocLieuCoNoiDung).length },
			maxND() { return Math.max(...this.items.map(i => i.TongNoiDung), 1) },
	
			khoiList() {
				return [...new Set(this.items.map(i => i.KhoiID))].sort((a, b) => a - b)
			},
			chartSubjects() {
				return [...new Set(this.items.map(i => i.TenMonHoc_HienThi))].sort()
			},
			activeKhoiList() {
				return this.activeKhoi === 0 ? this.khoiList : [this.activeKhoi]
			},
			subjectTotalMap() {
				return Object.fromEntries(
					this.chartSubjects.map(s => [
						s,
						this.items
							.filter(i => this.activeKhoiList.includes(i.KhoiID) && i.TenMonHoc_HienThi === s)
							.reduce((sum, i) => sum + i.TongNoiDung, 0),
					])
				)
			},
			filteredItems() {
				return this.activeKhoi === 0
					? this.items
					: this.items.filter(i => i.KhoiID === this.activeKhoi)
			},
			legendConfig() {
				if (this.activeKhoi !== 0) return []
				return this.chartSubjects.map((s, si) => ({
					category: s,
					label: `${s} (${this.subjectTotalMap[s]})`,
					color: this.colorPalette[si % this.colorPalette.length],
				}))
			},
			chartSeries() {
				if (this.activeKhoi === 0) {
					return this.chartSubjects.map((s, si) => ({
						name: s,
						category: s,
						data: this.khoiList.map(k =>
							this.items
								.filter(i => i.KhoiID === k && i.TenMonHoc_HienThi === s)
								.reduce((sum, i) => sum + i.TongNoiDung, 0)
						),
						color: this.colorPalette[si % this.colorPalette.length],
					}))
				}
				return [{
					name: 'Khối ' + this.activeKhoi,
					category: 'Khối ' + this.activeKhoi,
					data: this.chartSubjects.map(s =>
						this.items
							.filter(i => i.KhoiID === this.activeKhoi && i.TenMonHoc_HienThi === s)
							.reduce((sum, i) => sum + i.TongNoiDung, 0)
					),
					color: 'rgb(var(--v-theme-primary))',
				}]
			},
			chartOptions() {
				const isAll = this.activeKhoi === 0
				return {
					series: this.chartSeries,
					chart: {
						type: isAll ? 'line' : 'bar',
						height: 380,
						toolbar: { show: false },
						fontFamily: 'inherit',
					},
					stroke: isAll
						? { curve: 'smooth', width: 2 }
						: { show: true, width: 2, colors: ['transparent'] },
					markers: isAll ? { size: 4, hover: { size: 6 } } : {},
					plotOptions: isAll ? {} : {
						bar: { horizontal: false, columnWidth: '50%', borderRadius: 4, borderRadiusApplication: 'end' },
					},
					dataLabels: { enabled: false },
					xaxis: {
						categories: isAll
							? this.khoiList.map(k => 'Khối ' + k)
							: this.chartSubjects,
						labels: {
							style: { fontSize: '11px' },
							rotate: isAll ? 0 : -35,
							trim: true,
							maxHeight: 80,
						},
					},
					yaxis: { labels: { style: { fontSize: '11px' } } },
					legend: { show: false },
					fill: { opacity: 1 },
					tooltip: { y: { formatter: val => val + ' nội dung' } },
					grid: { borderColor: 'rgba(128,128,128,0.15)', strokeDashArray: 4 },
				}
			},
		},
	
		methods: {
			async onLoad() {
				this.items = await fetchPromise('lms/BaoCao_2_ThongKe_HocLieuSo_ByCapID', { CapID: this.CapID })
			},
			getSubjectColor(name) {
				let hash = 0
				for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
				return this.SUBJECT_COLORS[Math.abs(hash) % this.SUBJECT_COLORS.length]
			},
		},
	}
</script>