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
				<!-- Header + chọn tuần tích hợp -->
				<div class="d-flex align-center border-b w-100 px-2" style="min-height:56px">
					<!-- Prepend icon -->
					<v-icon size="20" color="primary" class="mr-2 flex-shrink-0">mdi-calendar-month</v-icon>

					<!-- Title + subtitle -->
					<div class="flex-shrink-0 mr-4">
						<div class="text-body-2 font-weight-medium">Thời Khóa Biểu</div>
						<div class="text-caption text-grey-darken-1">
							{{ ThoiKhoaBieu.ThoiGian?.TuNgay }} - {{ ThoiKhoaBieu.ThoiGian?.DenNgay }}
						</div>
					</div>

					<!-- Label tuần ở giữa -->
					<div class="d-flex flex-column align-center flex-grow-1 justify-center" style="cursor:pointer"
						@click="goToCurrentWeek">
						<span class="text-body-2 font-weight-medium">{{ weekLabel }}</span>
						<span v-if="!isCurrentWeek" class="text-primary" style="font-size:10px; line-height:1.2">
							Nhấn để về tuần này
						</span>
					</div>

					<!-- Nhóm nút chuyển tuần + đóng bên phải -->
					<div class="d-flex align-center flex-shrink-0 gap-1">
						<v-btn icon="mdi-chevron-left" size="small" variant="text" @click="changeWeek(-1)"
							:disabled="loading" />
						<v-btn icon="mdi-chevron-right" size="small" variant="text" @click="changeWeek(1)"
							:disabled="loading" />
						<v-divider v-if="!inline" vertical class="mx-1" style="height:20px" />
						<v-btn v-if="!inline" icon="mdi-close" size="small" variant="text"
							@click="slotProps?.isActive && (slotProps.isActive.value = false)" />
					</div>
				</div>

				<v-progress-linear v-if="loading" indeterminate color="primary" />

				<!-- Cảnh báo tuần khác -->
				<v-alert v-if="!isCurrentWeek" type="warning" variant="tonal" density="compact" class="mx-3 mt-2 mb-1"
					icon="mdi-alert-circle-outline">
					<span class="text-caption">
						Đây <strong>không phải</strong> lịch học tuần này. Hãy kiểm tra lại ngày trước khi sắp xếp.
					</span>
				</v-alert>

				<!-- Grid TKB -->
				<div :style="inline ? '' : 'max-height: calc(100dvh - 80px); overflow: auto'">
					<table class="tkb-table" v-if="!loading && maxTiet > 0">
						<thead>
							<tr>
								<th class="col-buoi">Buổi</th>
								<th class="col-tiet">Tiết</th>
								<th v-for="day in days" :key="day.thu"
									:class="['col-day', isCurrentWeek && day.thu === getCurrentDay() ? 'current-day-header' : '']">
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
										:class="isCurrentWeek && day.thu === getCurrentDay() ? 'current-day-cell' : ''">
										<template v-if="getCell(day.thu, buoi.value, tietNum)">
											<div class="cell-content">
												<div class="mon-ten">{{ getCell(day.thu, buoi.value, tietNum).TenMon }}
												</div>
												<div class="gv-ten">{{ getCell(day.thu, buoi.value, tietNum).GiaoVien }}
												</div>
												<div v-if="isOtherClass(getCell(day.thu, buoi.value, tietNum).TenLop)"
													class="lop-ten">
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
				weekOffset: 0,
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
			isCurrentWeek() {
				return this.weekOffset === 0
			},
			weekLabel() {
				if (this.weekOffset === 0) return 'Tuần này'
				if (this.weekOffset === -1) return 'Tuần trước'
				if (this.weekOffset === 1) return 'Tuần sau'
				const monday = this.getMondayOfWeek(this.weekOffset)
				const sunday = new Date(monday)
				sunday.setDate(monday.getDate() + 6)
				return `${this.formatDateShort(monday)} - ${this.formatDateShort(sunday)}`
			},
		},
		mounted() {
			this.rebuildDays()
			if (this.HocSinh) this.getLop()
		},
		watch: {
			HocSinh(val) {
				if (!val) return
				this.getLop()
			}
		},
		methods: {
			rebuildDays() {
				const baseDays = [
					{ thu: 2, label: 'Thứ 2' },
					{ thu: 3, label: 'Thứ 3' },
					{ thu: 4, label: 'Thứ 4' },
					{ thu: 5, label: 'Thứ 5' },
					{ thu: 6, label: 'Thứ 6' },
					{ thu: 7, label: 'Thứ 7' },
					{ thu: 8, label: 'CN' }
				]
				const monday = this.getMondayOfWeek(this.weekOffset)
				this.days = baseDays.map((d, i) => {
					const date = new Date(monday)
					date.setDate(monday.getDate() + i)
					return { ...d, date: this.formatDateShort(date) }
				})
			},
	
			changeWeek(delta) {
				this.weekOffset += delta
				this.rebuildDays()
				if (this.HocSinh) this.getAllTKB()
			},
	
			goToCurrentWeek() {
				if (this.isCurrentWeek) return
				this.weekOffset = 0
				this.rebuildDays()
				if (this.HocSinh) this.getAllTKB()
			},
	
			async getLop() {
				this.DSLopHoc = await ajaxCALLPromise("quansinh/TKB_LopHocSelectByHocSinh", { HocSinhID: this.HocSinh.HocSinhID })
				await this.getAllTKB()
			},
	
			async getAllTKB() {
				if (!this.DSLopHoc.length) return
				this.loading = true
				try {
					const monday = this.formatDate(this.getMondayOfWeek(this.weekOffset))
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
					this.insScreenSchedule() // ← gọi sau khi có ThoiGian
				} finally {
					this.loading = false
				}
			},
	
			getTietOfBuoi(buoi) {
				const max = buoi === 1 ? this.maxTietSang : this.maxTietChieu
				return Array.from({ length: max }, (_, i) => i + 1)
			},
	
			isOtherClass(tenLop) {
				if (!tenLop) return false
				return tenLop !== this.HocSinh?.TenLop
			},
	
			getCell(thu, buoi, tiet) {
				return this.cellMap[thu]?.[buoi]?.[tiet] ?? null
			},
	
			getMondayOfWeek(offset = 0) {
				const today = new Date()
				const day = today.getDay()
				const diff = day === 0 ? -6 : 1 - day
				const monday = new Date(today)
				monday.setDate(today.getDate() + diff + offset * 7)
				return monday
			},
	
			formatDate(date) {
				const y = date.getFullYear()
				const m = String(date.getMonth() + 1).padStart(2, '0')
				const d = String(date.getDate()).padStart(2, '0')
				return `${y}-${m}-${d}`
			},
	
			// Convert "09/03/2026" → "2026-03-09"
			parseDateDMY(str) {
				if (!str) return str
				const [d, m, y] = str.split('/')
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
	
			insScreenSchedule() {
				const ThoiGian = this.ThoiKhoaBieu.ThoiGian
				if (!ThoiGian) return
	
				fetchPromise("lms/LMS_Screen_Schedule_View", {
					NgayBatDau: this.parseDateDMY(ThoiGian?.TuNgay) ?? null,
					NgayKetThuc: this.parseDateDMY(ThoiGian?.DenNgay) ?? null,
					Date: new Date().toISOString().slice(0, 10), // ngày hôm nay
					TypeScreen: 1, // Desktop
				}, { silent: true, forceRefresh: true })
			},
		}
	}
</script>