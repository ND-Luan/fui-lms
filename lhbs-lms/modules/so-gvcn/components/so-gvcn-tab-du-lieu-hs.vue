<template>
	<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<uc-jexcel v-if="rows && rows.length" :key="sheetKey" v-model="sheetInstance"
			:data-source="rows" :columns="computedColumns" :freeze-columns="5"
			:nestedHeaders="nestedHeaders" :table-height="sheetHeight" table-width="100%"
			:disable-lazy-loading="true" class="so-gvcn-sheet so-gvcn-student-sheet" />
		<uc-card-empty v-else />
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-tab-du-lieu-hs',
	props: {
		rows: { type: Array, default: () => [] },
		sheetHeight: { type: String, default: 'calc(100vh - 230px)' },
		sheetKey: { type: [Number, String], default: 0 },
		nestedHeaders: { type: Array, default: () => [] }
	},
	data() {
		return {
			sheetInstance: null,
			baseColumns: [
				{ title: 'STT', width: 45, readOnly: true },
				{ title: 'Họ và tên học sinh', width: 180, readOnly: true },
				{ title: 'Mã học sinh', width: 95, readOnly: true },
				{ title: 'Lớp mới', width: 70, readOnly: true },
				{ title: 'Lớp cũ', width: 70, readOnly: true },
				{ title: 'Toán', isScoreCol: true, readOnly: true },
				{ title: 'Tiếng Việt/Văn', isScoreCol: true, readOnly: true },
				{ title: 'Anh', isScoreCol: true, readOnly: true },
				{ title: 'KHTN', isScoreCol: true, readOnly: true },
				{ title: 'LS-ĐL', isScoreCol: true, readOnly: true },
				{ title: 'GDCD/GDKTPL', isScoreCol: true, readOnly: true },
				{ title: 'Tin', isScoreCol: true, readOnly: true },
				{ title: 'CN', isScoreCol: true, readOnly: true },
				{ title: 'Địa lí', isScoreCol: true, readOnly: true },
				{ title: 'Vật lí', isScoreCol: true, readOnly: true },
				{ title: 'Hóa', isScoreCol: true, readOnly: true },
				{ title: 'Sinh', isScoreCol: true, readOnly: true },
				{ title: 'KQRL', width: 65, readOnly: true },
				{ title: 'KQHT', width: 65, readOnly: true },
				{ title: 'Nhận xét GVCN', width: 280, align: 'left', readOnly: true },
				{ title: 'Cha', width: 140, readOnly: true },
				{ title: 'Nghề nghiệp cha', width: 130, readOnly: true },
				{ title: 'SDT cha', width: 105, readOnly: true },
				{ title: 'Mẹ', width: 140, readOnly: true },
				{ title: 'Nghề nghiệp mẹ', width: 130, readOnly: true },
				{ title: 'SDT mẹ', width: 105, readOnly: true },
				{ title: 'Người đỡ đầu', width: 130, readOnly: true },
				{ title: 'SDT người đỡ đầu', width: 125, readOnly: true },
				{ title: 'Địa chỉ', width: 240, align: 'left', readOnly: true },
				{ title: 'Ghi chú', width: 150, readOnly: true }
			]
		}
	},
	computed: {
		computedColumns() {
			if (!this.rows || !this.rows.length) return this.baseColumns

			return this.baseColumns.map((col, colIdx) => {
				let maxLen = (col.title || '').length
				for (let i = 0; i < Math.min(this.rows.length, 50); i++) {
					const val = this.rows[i][colIdx]
					if (val != null) {
						const strLen = String(val).trim().length
						if (strLen > maxLen) maxLen = strLen
					}
				}

				if (col.isScoreCol) {
					// Đối với các cột điểm: tính vừa khít độ dài tiêu đề + dữ liệu điểm số
					const calculatedWidth = Math.max(45, maxLen * 8.5 + 16)
					return {
						...col,
						width: Math.ceil(calculatedWidth)
					}
				}

				const autoWidth = Math.max(45, Math.min(maxLen * 8 + 20, 320))
				return {
					...col,
					width: col.width ? Math.min(col.width, autoWidth) : Math.ceil(autoWidth)
				}
			})
		}
	}
	}
</script>