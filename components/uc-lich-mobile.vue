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
							<v-btn @click="slotProps?.isActive && (slotProps.isActive.value = false)"
								icon="mdi-close" />
						</template>
					</v-list-item>
				</div>

				<v-progress-linear v-if="loading" indeterminate color="primary" />

				<!-- Chọn tuần -->
				<div class="m-week-nav d-flex align-center justify-space-between px-3 py-1 border-b">
					<v-btn icon="mdi-chevron-left" size="small" variant="text" @click="changeWeek(-1)"
						:disabled="loading" />
					<div class="d-flex flex-column align-center" style="cursor:pointer" @click="goToCurrentWeek">
						<span class="text-caption font-weight-medium">
							{{ weekLabel }}
						</span>
						<span v-if="!isCurrentWeek" class="text-caption text-primary" style="font-size:10px">
							Nhấn để về tuần này
						</span>
					</div>
					<v-btn icon="mdi-chevron-right" size="small" variant="text" @click="changeWeek(1)"
						:disabled="loading" />
				</div>

				<!-- Tab ngày scroll ngang -->
				<div class="m-day-tabs-scroll" ref="dayTabsRef">
					<div v-for="day in allDays" :key="day.thu" class="m-day-tab" :class="{
							'm-day-tab--active': isCurrentWeek && selectedThu === day.thu,
							'm-day-tab--today': day.thu === todayThu && isCurrentWeek
						}" @click="selectedThu = day.thu" :ref="(day.thu === todayThu && isCurrentWeek) ? 'todayTab' : undefined">
						<div class="m-day-tab-label">{{ day.label }}</div>
						<div class="m-day-tab-date">{{ day.date }}</div>
						<div v-if="day.thu === todayThu && isCurrentWeek" class="m-today-dot"></div>
					</div>
				</div>

				<!-- Cảnh báo tuần khác -->
				<v-alert v-if="!isCurrentWeek" type="warning" variant="tonal" density="compact" class="mx-3 mt-2 mb-1"
					icon="mdi-alert-circle-outline">
					<span class="text-caption">
						Đây <strong>không phải</strong> lịch học tuần này. Hãy kiểm tra lại ngày trước khi sắp xếp.
					</span>
				</v-alert>

				<!-- Nội dung ngày được chọn -->
				<div :style="inline ? 'min-height: 200px' : 'height: calc(100dvh - 220px); overflow: auto'">
					<template v-if="currentDayData">
						<div v-for="buoi in currentDayData.DSBuoi" :key="buoi.Buoi" class="m-buoi-section">
							<!-- Header buổi -->
							<div class="m-buoi-header" :class="buoi.Buoi === 1 ? 'm-buoi-sang' : 'm-buoi-chieu'">
								<span class="m-buoi-dot-sm mr-1"
									:class="buoi.Buoi === 1 ? 'm-dot-morning' : 'm-dot-afternoon'"></span>
								{{ buoi.TenBuoi }}
							</div>
							<!-- Danh sách tiết -->
							<div v-for="tiet in buoi.jsonTiet" :key="tiet.Tiet" class="m-tiet-row-item">
								<div class="m-tiet-badge" :class="buoi.Buoi === 1 ? 'm-badge-sang' : 'm-badge-chieu'">
									{{ tiet.Tiet }}
								</div>
								<div class="m-tiet-main">
									<span class="m-tiet-mon">{{ tiet.TenMon }}</span>
									<span class="m-tiet-sep">·</span>
									<span class="m-tiet-gv">{{ tiet.GiaoVien }}</span>
								</div>
								<!-- Chỉ hiện TenLop khi khác lớp chính của học sinh -->
								<v-chip v-if="isOtherClass(tiet.TenLop)" size="x-small" color="primary" variant="tonal"
									label class="ml-1">
									{{ tiet.TenLop }}
								</v-chip>
							</div>
						</div>
					</template>

					<!-- Ngày nghỉ -->
					<div v-else-if="!loading" class="text-center py-10">
						<v-icon size="36" color="grey-lighten-2">mdi-sleep</v-icon>
						<div class="text-body-2 text-grey mt-2">Không có tiết học</div>
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
	      vueData,
	      DSLopHoc: [],
	      ThoiKhoaBieu: { ThoiGian: null, DSTKB: [] },
	      selectedThu: null,
	      weekOffset: 0, // 0 = tuần hiện tại, -1 = tuần trước, +1 = tuần sau
	      allDays: [
	        { thu: 2, label: 'T2', date: '' },
	        { thu: 3, label: 'T3', date: '' },
	        { thu: 4, label: 'T4', date: '' },
	        { thu: 5, label: 'T5', date: '' },
	        { thu: 6, label: 'T6', date: '' },
	        { thu: 7, label: 'T7', date: '' },
	        { thu: 8, label: 'CN', date: '' }
	      ]
	    }
	  },
	  computed: {
	    todayThu() {
	      const day = new Date().getDay()
	      return day === 0 ? 8 : day + 1
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
	    currentDayData() {
	      return this.ThoiKhoaBieu.DSTKB.find(x => x.Thu === this.selectedThu) ?? null
	    },
	  },
	  mounted() {
	    this.rebuildDays()
	    this.selectedThu = this.todayThu
	    if (this.HocSinh) this.getLop()
	  },
	  watch: {
	    HocSinh(val) {
	      if (!val) return
	      this.getLop()
	    },
	    selectedThu() {
	      this.$nextTick(() => this.scrollToToday())
	    }
	  },
	  methods: {
	    rebuildDays() {
	      const baseDays = [
	        { thu: 2, label: 'T2' },
	        { thu: 3, label: 'T3' },
	        { thu: 4, label: 'T4' },
	        { thu: 5, label: 'T5' },
	        { thu: 6, label: 'T6' },
	        { thu: 7, label: 'T7' },
	        { thu: 8, label: 'CN' }
	      ]
	      const monday = this.getMondayOfWeek(this.weekOffset)
	      this.allDays = baseDays.map((d, i) => {
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
	      this.selectedThu = this.todayThu
	      if (this.HocSinh) this.getAllTKB()
	    },

	    async getLop() {
	      this.DSLopHoc = await ajaxCALLPromise("quansinh/TKB_LopHocSelectByHocSinh", { HocSinhID: this.HocSinh.HocSinhID })
	      await this.getAllTKB()
	    },

	    isOtherClass(tenLop) {
	      if (!tenLop) return false
	      return tenLop !== this.HocSinh?.TenLop
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

	    formatDateShort(date) {
	      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
	    },

	    // Convert "09/03/2026" → "2026-03-09" để truyền vào API
	    parseDateDMY(str) {
	      if (!str) return str
	      const [d, m, y] = str.split('/')
	      return `${y}-${m}-${d}`
	    },

	    async getAllTKB() {
	      if (!this.DSLopHoc.length) return
	      this.loading = true
	      try {
	        const mondayDate = this.getMondayOfWeek(this.weekOffset)
	        const monday = this.formatDate(mondayDate)
	        const results = await Promise.all(
	          this.DSLopHoc.map(lh =>
	            ajaxCALLPromise("quansinh/TKB_Lop_HocSinh", { LopHocID: lh.LopHocID, NgayDauTuan: monday })
	              .then(tkb => ({ lh, tkb }))
	          )
	        )

	        this.ThoiKhoaBieu.ThoiGian = results[0]?.tkb[0][0] ?? {}
	        const mergedByThu = {}

	        for (const { lh, tkb } of results) {
	          const kb = tkb[2].map(x => ({
	            ...x,
	            jsonTiet: JSON.parse(x.jsonTiet).map(t => ({
	              ...t,
	              TenLop: lh.TenLop,
	              LopHocID: lh.LopHocID
	            }))
	          }))
	          for (const row of kb) {
	            const { Thu, Buoi, TenBuoi } = row
	            if (!mergedByThu[Thu]) mergedByThu[Thu] = {}
	            if (!mergedByThu[Thu][Buoi]) mergedByThu[Thu][Buoi] = { Buoi, TenBuoi, jsonTiet: [] }
	            mergedByThu[Thu][Buoi].jsonTiet.push(...row.jsonTiet)
	          }
	        }

	        this.ThoiKhoaBieu.DSTKB = Object.keys(mergedByThu)
	          .map(Number).sort((a, b) => a - b)
	          .map(Thu => ({
	            Thu,
	            DSBuoi: Object.values(mergedByThu[Thu])
	              .sort((a, b) => a.Buoi - b.Buoi)
	              .map(buoi => ({
	                ...buoi,
	                jsonTiet: [...buoi.jsonTiet].sort((a, b) => a.Tiet - b.Tiet)
	              }))
	          }))

	        this.$nextTick(() => this.scrollToToday())
	      } finally {
	        this.loading = false
	      }
	    },

	    scrollToToday() {
	      const tabs = this.$refs.dayTabsRef
	      const todayEl = this.$refs.todayTab
	      if (tabs && todayEl) {
	        const el = Array.isArray(todayEl) ? todayEl[0] : todayEl
	        if (el?.$el) el.$el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
	        else el?.scrollIntoView?.({ behavior: 'smooth', inline: 'center', block: 'nearest' })
	      }
	    }
	  }
}
</script>