<template>
	<div style="overflow-x: auto;">
		<v-table class="grade-table" fixed-header style="max-height: calc(100dvh - 121px);">
			<thead>
				<tr>
					<th rowspan="3" class="text-center sticky-col">Lớp</th>
					<th rowspan="3" class="text-center">Sĩ số</th>
					<template v-for="category in categories" :key="category.key">
						<th :colspan="category.colspan" class="text-center" :class="category.bgClass">
							{{ category.label }}
						</th>
					</template>
				</tr>
				<tr>
					<template v-for="category in categories" :key="category.key">
						<th :colspan="category.colspan" class="text-center" :class="category.bgClass">
							{{ category.range }}
						</th>
					</template>
				</tr>
				<tr>
					<template v-for="category in categories" :key="category.key">
						<th class="text-center" :class="category.bgClass">SL</th>
						<th class="text-center" :class="category.bgClass">TL</th>
						<th class="text-center" :class="category.bgClass">TL chỉ tiêu</th>
						<th class="text-center" :class="category.bgClass">
							Tăng (+) giảm (-)<br>so với chỉ tiêu
						</th>
					</template>
				</tr>
			</thead>

			<tbody>
				<template v-for="khoi in groupedData" :key="khoi.name">
					<!-- Rows từng lớp -->
					<tr v-for="(row, index) in khoi.classes" :key="row.TenLop"
						:class="{ 'bg-grey-lighten-4': !isDatChuaDat && index % 2 === 0 }">
						<td :class="['sticky-col', { 'font-weight-bold': !isDatChuaDat }]">{{ row.TenLop }}</td>
						<td class="text-center">{{ row.TongSoHocSinh }}</td>

						<template v-for="category in categories" :key="category.key">
							<td class="text-center">{{ getValueByCategory(row, category.key) }}</td>
							<td class="text-center">{{ calculatePercent(getValueByCategory(row, category.key),
								row.TongSoHocSinh) }}</td>
							<td class="text-center">{{ getChiTieuPercent(row, category.key) }}</td>
							<td class="text-center" :class="getDifferenceClass(calculateDifference(row, category.key))">
								{{ formatDifference(calculateDifference(row, category.key)) }}
							</td>
						</template>
					</tr>

					<!-- Tổng khối -->
					<tr class="font-weight-bold bg-blue-grey-lighten-4">
						<td class="text-center sticky-col">{{ khoi.name }}</td>
						<td class="text-center">{{ khoi.totals.tongSiSo }}</td>

						<template v-for="category in categories" :key="category.key">
							<td class="text-center">{{ getTotalByCategory(khoi.totals, category.key) }}</td>
							<td class="text-center">{{ calculatePercent(getTotalByCategory(khoi.totals, category.key),
								khoi.totals.tongSiSo) }}</td>
							<td class="text-center" colspan="2">-</td>
						</template>
					</tr>
				</template>

				<!-- Tổng cộng -->
				<tr v-if="tongCong"
					:class="isDatChuaDat ? 'font-weight-bold bg-grey-lighten-4' : 'font-weight-bold bg-indigo-lighten-4'">
					<td class="text-center sticky-col">TỔNG CỘNG</td>
					<td class="text-center">{{ tongCong.totals.tongSiSo }}</td>

					<template v-for="category in categories" :key="category.key">
						<td class="text-center">{{ getTotalByCategory(tongCong.totals, category.key) }}</td>
						<td class="text-center">{{ calculatePercent(getTotalByCategory(tongCong.totals, category.key),
							tongCong.totals.tongSiSo) }}</td>
						<td class="text-center" v-if="isDatChuaDat">{{ getChiTieuTongCong(category.key) }}</td>
						<td class="text-center" v-if="isDatChuaDat">
							{{ formatDifference(calculateDifferenceTongCong(category.key)) }}
						</td>
						<td class="text-center" v-else colspan="2">-</td>
					</template>
				</tr>
			</tbody>
		</v-table>
	</div>
</template>

<script>
	export default {
	props: {
		monHocName: {
			type: String,
			required: true
		},
		groupedData: {
			type: Array,
			required: true
		},
		tongCong: {
			type: Object,
			default: null
		},
		dsChiTieu: {
			type: Array,
			required: true
		},
		isDatChuaDat: {
			type: Boolean,
			required: true
		}
	},
	computed: {
		categories() {
			if (this.isDatChuaDat) {
				return [
					{ 
						key: 'ChuaDat', 
						label: 'Chưa đạt', 
						range: 'Chưa đạt',
						colspan: 4,
						bgClass: 'bg-red-lighten-4',
						field: 'Diem_CD', 
						chiTieuField: 'ChiTieu_ChuaDat' 
					},
					{ 
						key: 'Dat', 
						label: 'Đạt', 
						range: 'Đạt',
						colspan: 4,
						bgClass: 'bg-green-lighten-4',
						field: 'Diem_D', 
						chiTieuField: 'ChiTieu_Dat' 
					}
				];
			} else {
				return [
					{ 
						key: 'ChuaDat', 
						label: 'Chưa đạt', 
						range: '0 ≤ Điểm < 5',
						colspan: 4,
						bgClass: 'bg-red-lighten-4',
						field: 'Diem_0_5', 
						chiTieuField: 'ChiTieu_ChuaDat' 
					},
					{ 
						key: 'Dat', 
						label: 'Đạt', 
						range: '5 ≤ Điểm < 6.5',
						colspan: 4,
						bgClass: 'bg-orange-lighten-4',
						field: 'Diem_5_6_5', 
						chiTieuField: 'ChiTieu_Dat' 
					},
					{ 
						key: 'Kha', 
						label: 'Khá', 
						range: '6.5 ≤ Điểm < 8',
						colspan: 4,
						bgClass: 'bg-blue-lighten-4',
						field: 'Diem_6_5_8', 
						chiTieuField: 'ChiTieu_Kha' 
					},
					{ 
						key: 'Tot', 
						label: 'Tốt', 
						range: '8 ≤ Điểm ≤ 10',
						colspan: 4,
						bgClass: 'bg-green-lighten-4',
						field: 'Diem_8_10', 
						chiTieuField: 'ChiTieu_Tot' 
					},
					{ 
						key: 'DatTroLen', 
						label: 'Đạt trở lên', 
						range: '5 ≤ Điểm ≤ 10',
						colspan: 4,
						bgClass: 'bg-purple-lighten-4',
						field: 'Diem_5_10', 
						chiTieuField: 'ChiTieu_DatTroLen' 
					}
				];
			}
		}
	},
	methods: {
		getValueByCategory(row, categoryKey) {
			const category = this.categories.find(c => c.key === categoryKey);
			if (!category) {
				console.warn('Category not found:', categoryKey);
				return 0;
			}
			const value = row[category.field];
			if (value === undefined || value === null) {
				console.warn('Field not found:', category.field, 'in row:', row);
				return 0;
			}
			return value;
		},

		getTotalByCategory(totals, categoryKey) {
			const fieldMapping = {
				'ChuaDat': this.isDatChuaDat ? 'diem_CD' : 'diem_0_5',
				'Dat': this.isDatChuaDat ? 'diem_D' : 'diem_5_6_5',
				'Kha': 'diem_6_5_8',
				'Tot': 'diem_8_10',
				'DatTroLen': 'diem_5_10'
			};
			const field = fieldMapping[categoryKey];
			return field ? (totals[field] || 0) : 0;
		},

		calculatePercent(value, total) {
			if (!value || !total) return '0.00%';
			return ((value / total) * 100).toFixed(2) + '%';
		},

		getChiTieu(row) {
			const khoiID = parseInt(row.TenLop.substring(0, 2));
			return this.dsChiTieu.find(ct =>
				ct.KhoiID === khoiID && ct.TenMonHoc_HienThi === this.monHocName
			);
		},

		getChiTieuPercent(row, categoryKey) {
			const category = this.categories.find(c => c.key === categoryKey);
			if (!category) return '';

			const chiTieu = this.getChiTieu(row);
			if (!chiTieu) return '';

			const value = chiTieu[category.chiTieuField] || 0;
			return value.toFixed(0) + '%';
		},

		calculateDifference(row, categoryKey) {
			const category = this.categories.find(c => c.key === categoryKey);
			if (!category) return 0;

			const chiTieu = this.getChiTieu(row);
			if (!chiTieu) return 0;

			const soLuong = row[category.field] || 0;
			const chiTieuValue = chiTieu[category.chiTieuField] || 0;

			if (soLuong === 0 && chiTieuValue === 0) return 0;

			const thucTe = (soLuong / row.TongSoHocSinh) * 100;
			return parseFloat((thucTe - chiTieuValue).toFixed(2));
		},

		formatDifference(value) {
			if (value === null || value === undefined) return '-';
			if (Math.abs(value) < 0.01) return '0.00%';
			return (value > 0 ? '+' : '') + value.toFixed(2) + '%';
		},

		getDifferenceClass(value) {
			if (value === null || value === undefined || value === 0) return '';
			return value > 0 ? 'text-success font-weight-bold' : 'text-error font-weight-bold';
		},

		getChiTieuTongCong(categoryKey) {
			const category = this.categories.find(c => c.key === categoryKey);
			if (!category) return '';

			const chiTieu = this.dsChiTieu.find(ct => ct.TenMonHoc_HienThi === this.monHocName && !ct.KhoiID);
			if (!chiTieu) return '';

			return (chiTieu[category.chiTieuField] || 0).toFixed(0) + '%';
		},

		calculateDifferenceTongCong(categoryKey) {
			const category = this.categories.find(c => c.key === categoryKey);
			if (!category || !this.tongCong) return 0;

			const chiTieu = this.dsChiTieu.find(ct => ct.TenMonHoc_HienThi === this.monHocName && !ct.KhoiID);
			if (!chiTieu) return 0;

			const soLuong = this.getTotalByCategory(this.tongCong.totals, categoryKey);
			const chiTieuValue = chiTieu[category.chiTieuField] || 0;

			if (soLuong === 0 && chiTieuValue === 0) return 0;

			const thucTe = (soLuong / this.tongCong.totals.tongSiSo) * 100;
			return parseFloat((thucTe - chiTieuValue).toFixed(2));
		}
	}
}
</script>

<style scoped>
	.sticky-col {
		position: sticky;
		left: 0;
		background: white;
		z-index: 1;
	}
</style>