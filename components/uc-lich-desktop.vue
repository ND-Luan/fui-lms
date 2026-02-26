<template>
  <component :is="inline ? 'div' : 'v-dialog'" v-bind="inline ? {} : { fullscreen: true }">
    <template v-if="!inline" v-slot:activator="{ props: activatorProps }">
      <slot name="activator" :activator-props="activatorProps">
        <v-btn v-bind="activatorProps" variant="flat" size="small">
          <v-icon start>mdi-calendar-month</v-icon>
          Thời khóa biểu
        </v-btn>
      </slot>
    </template>

    <template v-slot:default="slotProps">
      <v-card elevation="0">
        <!-- Header -->
        <div class="d-flex align-center border-b w-100">
          <v-list-item class="w-100">
            <v-list-item-title class="font-weight-medium">Thời Khóa Biểu</v-list-item-title>
            <v-list-item-subtitle class="text-caption text-grey-darken-1">
              {{ ThoiKhoaBieu.ThoiGian?.TuNgay }} - {{ ThoiKhoaBieu.ThoiGian?.DenNgay }}
            </v-list-item-subtitle>
            <template #prepend>
              <v-icon size="20" color="primary" class="mr-2">mdi-calendar-month</v-icon>
            </template>
            <template v-if="!inline" #append>
              <v-btn @click="slotProps?.isActive && (slotProps.isActive.value = false)" icon="mdi-close" />
            </template>
          </v-list-item>
        </div>

        <v-progress-linear v-if="loading" indeterminate color="primary" />

        <!-- Grid TKB -->
        <div :style="inline ? '' : 'max-height: calc(100dvh - 80px); overflow: auto'">
          <table class="tkb-table" v-if="!loading && maxTiet > 0">
            <thead>
              <tr>
                <th class="col-buoi">Buổi</th>
                <th class="col-tiet">Tiết</th>
                <th v-for="day in days" :key="day.thu"
                  :class="['col-day', day.thu === getCurrentDay() ? 'current-day-header' : '']">
                  <div class="day-label">{{ day.label }}</div>
                  <div class="day-date text-caption text-grey">{{ day.date }}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="buoi in buoiList" :key="buoi.value">
                <tr v-for="(tietNum, tietIdx) in getTietOfBuoi(buoi.value)" :key="tietNum">
                  <td v-if="tietIdx === 0" :rowspan="getTietOfBuoi(buoi.value).length" class="td-buoi"
                    :class="buoi.value === 1 ? 'buoi-sang' : 'buoi-chieu'">
                    <span>{{ buoi.label }}</span>
                  </td>
                  <td class="td-tiet">{{ tietNum }}</td>
                  <td v-for="day in days" :key="day.thu" class="td-cell"
                    :class="day.thu === getCurrentDay() ? 'current-day-cell' : ''">
                    <template v-if="getCell(day.thu, buoi.value, tietNum)">
                      <div class="cell-content">
                        <div class="mon-ten">{{ getCell(day.thu, buoi.value, tietNum).TenMon }}</div>
                        <div class="gv-ten">{{ getCell(day.thu, buoi.value, tietNum).GiaoVien }}</div>
                        <!-- Chỉ hiện TenLop khi khác lớp chính của học sinh -->
                        <div v-if="isOtherClass(getCell(day.thu, buoi.value, tietNum).TenLop)" class="lop-ten">
                          {{ getCell(day.thu, buoi.value, tietNum).TenLop }}
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <span class="empty-cell">—</span>
                    </template>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>

          <div v-if="!loading && maxTiet === 0" class="text-center py-10">
            <v-icon size="48" color="grey-lighten-2">mdi-calendar-blank</v-icon>
            <div class="text-body-2 text-grey mt-2">Chưa có thời khóa biểu</div>
          </div>
        </div>
      </v-card>
    </template>
  </component>
</template>

<script>
  export default {
	props: {
		HocSinh: Object,
		inline: { type: Boolean, default: false }
	},
	data() {
		return {
			loading: false,
			DSLopHoc: [],
			ThoiKhoaBieu: { ThoiGian: null, DSTKB: [] },
			cellMap: {},
			buoiList: [
				{ value: 1, label: 'Sáng' },
				{ value: 2, label: 'Chiều' }
			],
			days: [
				{ thu: 2, label: 'Thứ 2' },
				{ thu: 3, label: 'Thứ 3' },
				{ thu: 4, label: 'Thứ 4' },
				{ thu: 5, label: 'Thứ 5' },
				{ thu: 6, label: 'Thứ 6' },
				{ thu: 7, label: 'Thứ 7' },
				{ thu: 8, label: 'CN' }
			],
			maxTietSang: 0,
			maxTietChieu: 0,
		}
	},
	computed: {
		maxTiet() {
			return this.maxTietSang + this.maxTietChieu
		},
		// (không cần computed hasMultipleClasses nữa)
	},
	mounted() {
		const monday = this.getMondayOfWeek()
		this.days = this.days.map((d, i) => {
			const date = new Date(monday)
			date.setDate(monday.getDate() + i)
			return { ...d, date: this.formatDateShort(date) }
		})
		if (this.HocSinh) this.getLop()
	},
	watch: {
		HocSinh(val) {
			if (!val) return
			this.getLop()
		}
	},
	methods: {
		async getLop() {
			this.DSLopHoc = await ajaxCALLPromise("quansinh/TKB_LopHocSelectByHocSinh", { HocSinhID: this.HocSinh.HocSinhID })
			await this.getAllTKB()
		},

		async getAllTKB() {
			if (!this.DSLopHoc.length) return
			this.loading = true
			try {
				const monday = this.formatDate(this.getMondayOfWeek())
				const results = await Promise.all(
					this.DSLopHoc.map(lh =>
						ajaxCALLPromise("quansinh/TKB_Lop_HocSinh", { LopHocID: lh.LopHocID, NgayDauTuan: monday })
							.then(tkb => ({ lh, tkb }))
					)
				)

				this.ThoiKhoaBieu.ThoiGian = results[0]?.tkb[0][0] ?? {}

				const map = {}
				let maxSang = 0
				let maxChieu = 0

				for (const { lh, tkb } of results) {
					const rows = tkb[2].map(x => ({ ...x, jsonTiet: JSON.parse(x.jsonTiet) }))
					for (const row of rows) {
						const { Thu, Buoi } = row
						if (!map[Thu]) map[Thu] = {}
						if (!map[Thu][Buoi]) map[Thu][Buoi] = {}
						for (const tiet of row.jsonTiet) {
							map[Thu][Buoi][tiet.Tiet] = {
								TenMon: tiet.TenMon,
								GiaoVien: tiet.GiaoVien,
								TenLop: lh.TenLop ?? null
							}
							if (Buoi === 1 && tiet.Tiet > maxSang) maxSang = tiet.Tiet
							if (Buoi === 2 && tiet.Tiet > maxChieu) maxChieu = tiet.Tiet
						}
					}
				}

				this.cellMap = map
				this.maxTietSang = maxSang
				this.maxTietChieu = maxChieu
			} finally {
				this.loading = false
			}
		},

		getTietOfBuoi(buoi) {
			const max = buoi === 1 ? this.maxTietSang : this.maxTietChieu
			return Array.from({ length: max }, (_, i) => i + 1)
		},

		// Chỉ show TenLop khi khác lớp chính (HocSinh.TenLop)
		isOtherClass(tenLop) {
			if (!tenLop) return false
			return tenLop !== this.HocSinh?.TenLop
		},

		getCell(thu, buoi, tiet) {
			return this.cellMap[thu]?.[buoi]?.[tiet] ?? null
		},

		getMondayOfWeek() {
			const today = new Date()
			const day = today.getDay()
			const diff = day === 0 ? -6 : 1 - day
			const monday = new Date(today)
			monday.setDate(today.getDate() + diff)
			return monday
		},

		formatDate(date) {
			const y = date.getFullYear()
			const m = String(date.getMonth() + 1).padStart(2, '0')
			const d = String(date.getDate()).padStart(2, '0')
			return `${y}-${m}-${d}`
		},

		formatDateShort(date) {
			const m = String(date.getMonth() + 1).padStart(2, '0')
			const d = String(date.getDate()).padStart(2, '0')
			return `${d}/${m}`
		},

		getCurrentDay() {
			const day = new Date().getDay()
			return day === 0 ? 8 : day + 1
		},
	}
}
</script> 