<template>
	<v-menu
		v-model="menuOpen"
		:close-on-content-click="false"
		transition="scale-transition"
		location="bottom start"
		offset="8"
	>
		<!-- ── Activator ── -->
		<template #activator="{ props: menuProps }">
			<v-btn
				v-bind="menuProps"
				variant="outlined"
				color="primary"
				prepend-icon="mdi-calendar-range"
				:append-icon="menuOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"
				style="min-width:240px; font-weight:500; font-size:13px"
			>
				<template v-if="picking.from && picking.to">
					{{ formatDisplay(picking.from) }}
					<v-icon size="14" class="mx-1" color="medium-emphasis">mdi-arrow-right</v-icon>
					{{ formatDisplay(picking.to) }}
				</template>
				<template v-else>
					<span class="text-medium-emphasis">Chọn khoảng thời gian</span>
				</template>
			</v-btn>
		</template>

		<!-- ── Nội dung menu ── -->
		<v-card rounded="xl" elevation="8" border style="overflow:hidden">

			<!-- Header: shortcuts -->
			<div class="d-flex align-center justify-space-between px-4 pt-3 pb-2 ga-3">
				<span class="text-subtitle-2 font-weight-bold">Khoảng thời gian</span>
				<div class="d-flex ga-1 flex-wrap justify-end">
					<v-chip
						v-for="s in shortcuts"
						:key="s.label"
						size="x-small"
						variant="tonal"
						color="primary"
						label
						class="cursor-pointer"
						@click="applyShortcut(s)"
					>
						{{ s.label }}
					</v-chip>
				</div>
			</div>

			<v-divider />

			<!-- Hai calendar song song -->
			<div class="d-flex">

				<!-- Trái: Từ ngày (from) -->
				<div style="flex:1">
					<div class="d-flex align-center ga-1 px-4 pt-3 pb-1">
						<v-icon size="15" color="primary">mdi-calendar-start</v-icon>
						<span class="text-caption font-weight-bold text-primary text-uppercase" style="letter-spacing:.5px">
							Từ ngày
						</span>
						<v-chip v-if="picking.from" size="x-small" color="primary" variant="tonal" label class="ml-1">
							{{ formatDisplay(picking.from) }}
						</v-chip>
					</div>
					<v-date-picker
						:model-value="isoToDate(picking.from)"
						:max="isoToDate(picking.to)"
						hide-header
						show-adjacent-months
						color="primary"
						elevation="0"
						style="border-radius:0; box-shadow:none; width:100%"
						@update:model-value="onPickFrom"
					/>
				</div>

				<v-divider vertical />

				<!-- Phải: Đến ngày (to) -->
				<div style="flex:1">
					<div class="d-flex align-center ga-1 px-4 pt-3 pb-1">
						<v-icon size="15" color="success">mdi-calendar-end</v-icon>
						<span class="text-caption font-weight-bold text-success text-uppercase" style="letter-spacing:.5px">
							Đến ngày
						</span>
						<v-chip v-if="picking.to" size="x-small" color="success" variant="tonal" label class="ml-1">
							{{ formatDisplay(picking.to) }}
						</v-chip>
					</div>
					<v-date-picker
						:model-value="isoToDate(picking.to)"
						:min="isoToDate(picking.from)"
						hide-header
						show-adjacent-months
						color="success"
						elevation="0"
						style="border-radius:0; box-shadow:none; width:100%"
						@update:model-value="onPickTo"
					/>
				</div>

			</div>

			<v-divider />

			<!-- Footer -->
			<div class="d-flex align-center px-4 py-2 ga-3">
				<div class="d-flex align-center ga-2">
					<v-chip
						size="small"
						:color="picking.from ? 'primary' : 'default'"
						:variant="picking.from ? 'tonal' : 'outlined'"
						label
						prepend-icon="mdi-calendar-start"
					>
						{{ picking.from ? formatDisplay(picking.from) : 'Từ ngày' }}
					</v-chip>
					<v-icon size="16" color="medium-emphasis">mdi-arrow-right</v-icon>
					<v-chip
						size="small"
						:color="picking.to ? 'success' : 'default'"
						:variant="picking.to ? 'tonal' : 'outlined'"
						label
						prepend-icon="mdi-calendar-end"
					>
						{{ picking.to ? formatDisplay(picking.to) : 'Đến ngày' }}
					</v-chip>
				</div>

				<v-spacer />

				<v-btn variant="text" size="small" color="error" @click="onClear">
					<v-icon start size="14">mdi-close</v-icon>Xóa
				</v-btn>
				<v-btn
					variant="tonal"
					size="small"
					color="primary"
					:disabled="!picking.from || !picking.to"
					@click="onApply"
				>
					<v-icon start size="14">mdi-check</v-icon>Áp dụng
				</v-btn>
			</div>

		</v-card>
	</v-menu>
</template>

<script>
export default {
	name: 'UcDateRangePicker',
	props: {
		// modelValue lưu dạng string 'YYYY-MM-DD' để dễ truyền SP
		modelValue: {
			type: Object,
			default: () => ({ from: null, to: null }),
		},
	},
	emits: ['update:modelValue'],

	data() {
		return {
			menuOpen: false,
			// picking lưu string 'YYYY-MM-DD' | null — convert sang Date chỉ khi truyền vào picker
			picking: {
				from: this.modelValue?.from ?? null,
				to:   this.modelValue?.to   ?? null,
			},
			shortcuts: [
				{ label: 'Hôm nay',     fn: () => { const t = this.today(); return { from: t, to: t } } },
				{ label: 'Tuần này',    fn: () => this.currentWeek() },
				{ label: 'Tháng này',   fn: () => this.currentMonth() },
				{ label: 'Tháng trước', fn: () => this.lastMonth() },
				{ label: 'Học kỳ 1',    fn: () => this.hocKy(1) },
				{ label: 'Học kỳ 2',    fn: () => this.hocKy(2) },
			],
		}
	},

	watch: {
		modelValue(v) {
			this.picking = { from: v?.from ?? null, to: v?.to ?? null }
		},
		menuOpen(open) {
			if (open) {
				this.picking = {
					from: this.modelValue?.from ?? null,
					to:   this.modelValue?.to   ?? null,
				}
			}
		},
	},

	methods: {
		// ── Chuyển string 'YYYY-MM-DD' → JS Date (truyền vào picker) ──
		// Dùng UTC để tránh lệch múi giờ khi parse
		isoToDate(iso) {
			if (!iso) return null
			const [y, m, d] = iso.split('-').map(Number)
			return new Date(y, m - 1, d)   // local time, không UTC → khớp với picker
		},

		// ── Chuyển JS Date (emit từ picker) → string 'YYYY-MM-DD' ──
		dateToISO(date) {
			if (!date) return null
			const y  = date.getFullYear()
			const m  = String(date.getMonth() + 1).padStart(2, '0')
			const d  = String(date.getDate()).padStart(2, '0')
			return `${y}-${m}-${d}`
		},

		onPickFrom(dateVal) {
			const iso = this.dateToISO(dateVal)
			this.picking.from = iso
			// Nếu to đang nhỏ hơn from mới → reset to
			if (this.picking.to && iso > this.picking.to) {
				this.picking.to = null
			}
		},

		onPickTo(dateVal) {
			this.picking.to = this.dateToISO(dateVal)
		},

		onApply() {
			this.$emit('update:modelValue', { ...this.picking })
			this.menuOpen = false
		},

		onClear() {
			this.picking = { from: null, to: null }
			this.$emit('update:modelValue', { from: null, to: null })
			this.menuOpen = false
		},

		applyShortcut(s) {
			const range = s.fn()
			this.picking = range
			this.$emit('update:modelValue', { ...range })
			this.menuOpen = false
		},

		// ── Hiển thị dd/MM/yyyy ──
		formatDisplay(iso) {
			if (!iso) return ''
			const [y, m, d] = iso.split('-')
			return `${d}/${m}/${y}`
		},

		// ── Shortcut helpers — trả về string 'YYYY-MM-DD' ──
		today() {
			return this.dateToISO(new Date())
		},
		currentWeek() {
			const now = new Date()
			const day = now.getDay() || 7
			const mon = new Date(now); mon.setDate(now.getDate() - day + 1)
			const sun = new Date(now); sun.setDate(now.getDate() - day + 7)
			return { from: this.dateToISO(mon), to: this.dateToISO(sun) }
		},
		currentMonth() {
			const now   = new Date()
			const first = new Date(now.getFullYear(), now.getMonth(), 1)
			const last  = new Date(now.getFullYear(), now.getMonth() + 1, 0)
			return { from: this.dateToISO(first), to: this.dateToISO(last) }
		},
		lastMonth() {
			const now   = new Date()
			const first = new Date(now.getFullYear(), now.getMonth() - 1, 1)
			const last  = new Date(now.getFullYear(), now.getMonth(), 0)
			return { from: this.dateToISO(first), to: this.dateToISO(last) }
		},
		hocKy(ky) {
			const now = new Date()
			const y   = now.getFullYear()
			const m   = now.getMonth() + 1  // 1-12

			// Xác định năm bắt đầu của năm học hiện tại:
			// Nếu tháng >= 8 → đang ở HK1 của năm học y-(y+1)  → namBatDau = y
			// Nếu tháng  < 8 → đang ở HK2 của năm học (y-1)-y  → namBatDau = y-1
			const namBatDau = m >= 8 ? y : y - 1

			// HK1: 01/08/namBatDau   → 31/12/namBatDau
			// HK2: 01/01/namBatDau+1 → 31/05/namBatDau+1
			return ky === 1
				? { from: `${namBatDau}-08-01`,     to: `${namBatDau}-12-31` }
				: { from: `${namBatDau + 1}-01-01`, to: `${namBatDau + 1}-05-31` }
		},
	},
}
</script>
