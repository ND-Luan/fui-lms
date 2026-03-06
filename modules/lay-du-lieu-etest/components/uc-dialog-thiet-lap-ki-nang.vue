<template>
	<v-dialog max-width="1000" persistent>
		<template v-slot:activator="{ props: activatorProps }">
			<slot :activator-props="activatorProps" />
		</template>

		<template v-slot:default="{ isActive }">
			<v-card rounded="lg" elevation="8" style="overflow:hidden">

				<!-- ══ HEADER ══ -->
				<div class="d-flex align-center px-5 py-3" style="background:rgb(var(--v-theme-primary))">
					<div
						style="width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;margin-right:12px">
						<v-icon size="18" color="white">mdi-tune</v-icon>
					</div>
					<div>
						<div class="text-subtitle-2 font-weight-bold" style="color:#fff">Thiết lập kỹ năng</div>
						<div class="text-caption" style="color:rgba(255,255,255,.65)">Cấu hình số câu đúng cho từng kỹ
							năng</div>
					</div>
					<v-spacer />
					<v-btn icon variant="text" size="small" @click="isActive.value = false"
						style="color:rgba(255,255,255,.7)">
						<v-icon size="18">mdi-close</v-icon>
					</v-btn>
				</div>

				<!-- ══ FORM ══ -->
				<div class="px-5 pt-4 pb-3" style="background:#f5f6fa;border-bottom:1px solid #e4e6f0">
					<div class="d-flex align-center mb-3 gap-2">
						<div style="width:3px;height:14px;border-radius:2px;background:var(--v-theme-primary)" />
						<span class="text-caption font-weight-bold text-uppercase"
							style="color:var(--v-theme-primary);letter-spacing:.07em">
							{{ editingID ? '✏️ Đang chỉnh sửa' : '＋ Thêm mới' }}
						</span>
						<v-chip v-if="maCotDiem" size="x-small" color="primary" variant="tonal" class="ml-1">
							<v-icon start size="11">mdi-tag-outline</v-icon>{{ maCotDiem }}
						</v-chip>
					</div>

					<v-row dense align="center">
						<v-col cols="3">
							<v-select v-model="form.HocKi" :items="hocKiOptions" item-title="label" item-value="key"
								label="Học kì" density="compact" variant="outlined" hide-details bg-color="white" />
						</v-col>
						<v-col cols="3">
							<v-select v-model="form.LoaiDiem" :items="loaiDiemOptions" item-title="label"
								item-value="key" label="Loại điểm" density="compact" variant="outlined" hide-details
								bg-color="white" @update:model-value="onLoaiDiemChange" />
						</v-col>
						<v-col cols="3">
							<v-select v-model="form.TenKiNang" :items="kiNangOptions" label="Kỹ năng" density="compact"
								variant="outlined" hide-details bg-color="white" />
						</v-col>
						<v-col cols="3">
							<v-text-field v-model.number="form.SoCau" label="Số câu" density="compact"
								variant="outlined" hide-details type="number" min="0" bg-color="white" />
						</v-col>
					</v-row>

					<v-row dense align="center" class="mt-2">
						<v-col>
							<v-select v-model="form.NhomIDs" :items="classOptions" item-title="name" item-value="id"
								label="Lớp áp dụng" density="compact" variant="outlined" hide-details bg-color="white"
								multiple chips closable-chips />
						</v-col>
						<v-col cols="auto" class="d-flex gap-2 pl-3">
							<v-btn color="primary" variant="flat" size="small" :loading="saving" :disabled="!canSave"
								@click="save" style="min-width:80px;background:var(--v-theme-primary)">
								<v-icon start size="14">{{ editingID ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
								{{ editingID ? 'Lưu' : 'Thêm' }}
							</v-btn>
							<v-btn v-if="editingID" variant="tonal" size="small" color="grey-darken-1"
								@click="cancelEdit">
								<v-icon start size="14">mdi-close</v-icon>Huỷ
							</v-btn>
						</v-col>
					</v-row>
				</div>

				<!-- ══ FILTER BAR ══ -->
				<div style="background:#fff;border-bottom:1px solid #e8eaf0">
					<div class="d-flex align-center gap-0 px-4" style="min-height:46px">

						<!-- Filter pill groups -->
						<div class="d-flex align-center gap-2 flex-wrap py-2" style="flex:1">

							<!-- Loại điểm: solid active -->
							<div class="d-flex" style="border:1.5px solid #e0e3ef;border-radius:8px;overflow:hidden">
								<button v-for="opt in loaiDiemOptions" :key="opt.key" @click="filterLoaiDiem = opt.key"
									:style="{
										padding:'3px 12px',
										fontSize:'12px',
										fontWeight:600,
										border:'none',
										cursor:'pointer',
										transition:'background .15s,color .15s',
										background: filterLoaiDiem === opt.key ? 'rgb(var(--v-theme-primary))' : 'transparent',
										color: filterLoaiDiem === opt.key ? '#ffffff' : '#607d8b',
										webkitTextFillColor: filterLoaiDiem === opt.key ? '#ffffff' : '#607d8b',
									}">{{ opt.label }}</button>
							</div>

							<!-- Separator -->
							<div style="width:1px;height:18px;background:#e0e3ef;margin:0 2px" />

							<!-- Học kì: tonal active -->
							<div class="d-flex" style="border:1.5px solid #e0e3ef;border-radius:8px;overflow:hidden">
								<button @click="filterHocKi = null" :style="{
										padding:'3px 10px',
										fontSize:'12px',
										fontWeight:500,
										border:'none',
										cursor:'pointer',
										transition:'background .15s,color .15s',
										background: filterHocKi === null ? 'rgba(var(--v-theme-primary),.08)' : 'transparent',
										color: filterHocKi === null ? 'var(--v-theme-primary)' : '#78909c',
									}">Tất cả</button>
								<button v-for="opt in hocKiOptions" :key="opt.key" @click="filterHocKi = opt.key"
									:style="{
										padding:'3px 10px',
										fontSize:'12px',
										fontWeight:500,
										border:'none',
										borderLeft:'1px solid #e0e3ef',
										cursor:'pointer',
										transition:'background .15s,color .15s',
										background: filterHocKi === opt.key ? 'rgba(var(--v-theme-primary),.08)' : 'transparent',
										color: filterHocKi === opt.key ? 'var(--v-theme-primary)' : '#78909c',
									}">{{ opt.label }}</button>
							</div>

							<!-- Khối filter (optional) -->
							<div v-if="khoiOptions.length" class="d-flex"
								style="border:1.5px solid #e0e3ef;border-radius:8px;overflow:hidden">
								<button @click="filterKhoi = null" :style="{
										padding:'3px 10px',
										fontSize:'12px',
										fontWeight:500,
										border:'none',
										cursor:'pointer',
										transition:'background .15s,color .15s',
										background: filterKhoi === null ? 'rgba(var(--v-theme-primary),.08)' : 'transparent',
										color: filterKhoi === null ? 'var(--v-theme-primary)' : '#78909c',
									}">Tất cả khối</button>
								<button v-for="opt in khoiOptions" :key="opt.id" @click="filterKhoi = opt.id" :style="{
										padding:'3px 10px',
										fontSize:'12px',
										fontWeight:500,
										border:'none',
										borderLeft:'1px solid #e0e3ef',
										cursor:'pointer',
										transition:'background .15s,color .15s',
										background: filterKhoi === opt.id ? 'rgba(var(--v-theme-primary),.08)' : 'transparent',
										color: filterKhoi === opt.id ? 'var(--v-theme-primary)' : '#78909c',
									}">{{ opt.label }}</button>
							</div>
						</div>

						<!-- Right: count + group toggle -->
						<div class="d-flex align-center gap-3" style="flex-shrink:0;padding-left:8px">
							<span style="font-size:11px;color:#b0bec5;white-space:nowrap">{{ totalRows }} bản ghi</span>

							<button @click="groupByClass = !groupByClass" :style="{
									display:'flex',alignItems:'center',gap:'5px',
									padding:'4px 10px',
									fontSize:'11px',fontWeight:600,
									border:'1.5px solid',
									borderColor: groupByClass ? 'rgb(var(--v-theme-primary))' : '#cfd8dc',
									borderRadius:'7px',
									cursor:'pointer',
									transition:'all .15s',
									background: groupByClass ? 'rgba(var(--v-theme-primary),.08)' : 'transparent',
									color: groupByClass ? 'rgb(var(--v-theme-primary))' : '#90a4ae',
								}">
								<v-icon size="13" :color="groupByClass ? 'rgb(var(--v-theme-primary))' : '#90a4ae'">
									{{ groupByClass ? 'mdi-format-list-group' : 'mdi-format-list-bulleted' }}
								</v-icon>
								{{ groupByClass ? 'Nhóm lớp' : 'Tất cả' }}
							</button>
						</div>
					</div>
				</div>

				<!-- ══ TABLE ══ -->
				<div style="background:#fff">
					<div v-if="loading" class="d-flex justify-center align-center" style="height:220px">
						<v-progress-circular indeterminate color="primary" size="26" width="2" />
					</div>

					<div v-else-if="tableData.length === 0"
						class="d-flex flex-column align-center justify-center text-medium-emphasis"
						style="height:220px;gap:8px">
						<v-icon size="44" color="grey-lighten-2">mdi-table-off</v-icon>
						<span class="text-body-2">Chưa có dữ liệu</span>
					</div>

					<div v-else style="max-height:380px;overflow-y:auto">
						<table style="width:100%;border-collapse:collapse">
							<thead>
								<tr
									style="position:sticky;top:0;z-index:2;background:#f8f9fb;border-bottom:2px solid #e8eaf0">
									<th class="text-left px-4 py-2"
										style="width:175px;font-size:11px;font-weight:700;text-transform:uppercase;color:#90a4ae;letter-spacing:.07em">
										Kì / Loại</th>
									<th class="text-left px-4 py-2"
										style="font-size:11px;font-weight:700;text-transform:uppercase;color:#90a4ae;letter-spacing:.07em">
										Kỹ năng</th>
									<th v-if="!groupByClass" class="text-left px-4 py-2"
										style="font-size:11px;font-weight:700;text-transform:uppercase;color:#90a4ae;letter-spacing:.07em">
										Lớp áp dụng</th>
									<th style="width:76px" />
								</tr>
							</thead>

							<tbody>

								<!-- ── GROUPED MODE ── -->
								<template v-if="groupByClass">
									<template v-for="(group, gi) in tableData" :key="group.key">

										<!-- Group header row — click to collapse/expand -->
										<tr @click="toggleGroup(group.key)" style="cursor:pointer;user-select:none">
											<td :colspan="3" :style="{
													padding:0,
													borderTop: gi > 0 ? '3px solid rgba(var(--v-theme-primary),.08)' : 'none',
													background: collapsedGroups.has(group.key) ? '#f5f6fa' : 'rgba(var(--v-theme-primary),.06)',
												}">
												<div class="d-flex align-center gap-2 flex-wrap px-4 py-2">
													<v-icon size="14" :style="{
															color:'rgb(var(--v-theme-primary))',
															transform: collapsedGroups.has(group.key) ? 'rotate(-90deg)' : 'rotate(0deg)',
															transition:'transform .2s',
															flexShrink:0,
														}">mdi-chevron-down</v-icon>

													<v-icon size="13" color="primary">mdi-account-multiple-outline
													</v-icon>

													<v-chip v-for="c in group.chips" :key="c.id" size="x-small"
														color="primary" variant="tonal"
														style="font-size:11px;font-weight:600;margin:1px">{{ c.name }}
													</v-chip>

													<v-spacer />
													<span
														style="font-size:11px;color:rgba(var(--v-theme-primary),.45);font-weight:500">
														{{ group.rows.length }} kỹ năng
													</span>
												</div>
											</td>
										</tr>

										<!-- Collapsed indicator -->
										<tr v-if="collapsedGroups.has(group.key)">
											<td :colspan="3"
												style="padding:4px 16px 5px 44px;background:#fafbff;border-bottom:1px solid #f0f2f5">
												<span style="font-size:11px;color:#b0bec5;font-style:italic">
													{{ group.rows.length }} bản ghi đã ẩn — nhấn để mở rộng
												</span>
											</td>
										</tr>

										<!-- Group rows -->
										<template v-if="!collapsedGroups.has(group.key)">
											<tr v-for="(item, ri) in group.rows" :key="item.ThietLapID" :style="{
													background: item.ThietLapID === editingID ? '#e8f0fe' : ri % 2 === 0 ? '#fff' : '#fafbff',
													borderBottom: '1px solid #f0f2f5',
													transition: 'background .12s',
												}" @mouseenter="e => e.currentTarget.style.background = item.ThietLapID === editingID ? '#e8f0fe' : '#f3f6ff'"
												@mouseleave="e => e.currentTarget.style.background = item.ThietLapID === editingID ? '#e8f0fe' : ri % 2 === 0 ? '#fff' : '#fafbff'">
												<td style="padding:8px 16px;vertical-align:middle">
													<div class="text-body-2 font-weight-medium" style="color:#37474f">{{
														item.HocKi }}</div>
													<v-chip size="x-small" variant="flat" class="mt-1"
														style="font-size:10px"
														:color="item.LoaiDiem === 'HK' ? 'blue-lighten-4' : item.LoaiDiem === 'TA2' ? 'teal-lighten-4' : 'orange-lighten-4'">
														{{ item.LoaiDiem }}
													</v-chip>
												</td>
												<td style="padding:8px 16px;vertical-align:middle">
													<div class="d-flex align-center gap-2">
														<span class="text-body-2 font-weight-medium"
															style="color:#37474f">{{ item.TenKiNang }}</span>
														<v-chip size="x-small" color="primary" variant="tonal"
															style="font-size:10px">{{ item.SoCau }} câu</v-chip>
													</div>
													<div class="text-caption mt-1 font-italic" style="color:#b0bec5">{{
														item.MaCotDiem }}</div>
												</td>
												<td style="padding:6px 10px;text-align:right;vertical-align:middle">
													<v-btn icon variant="text" size="x-small" color="primary"
														@click.stop="startEdit(item)">
														<v-icon size="15">mdi-pencil-outline</v-icon>
													</v-btn>
													<v-btn icon variant="text" size="x-small" color="error"
														:loading="deletingID === item.ThietLapID"
														@click.stop="del(item)">
														<v-icon size="15">mdi-delete-outline</v-icon>
													</v-btn>
												</td>
											</tr>
										</template>

									</template>
								</template>

								<!-- ── FLAT MODE ── -->
								<template v-else>
									<tr v-for="(item, ri) in tableData" :key="item.ThietLapID" :style="{
											background: item.ThietLapID === editingID ? '#e8f0fe' : ri % 2 === 0 ? '#fff' : '#fafbff',
											borderBottom: '1px solid #f0f2f5',
											transition: 'background .12s',
										}" @mouseenter="e => e.currentTarget.style.background = item.ThietLapID === editingID ? '#e8f0fe' : '#f3f6ff'"
										@mouseleave="e => e.currentTarget.style.background = item.ThietLapID === editingID ? '#e8f0fe' : ri % 2 === 0 ? '#fff' : '#fafbff'">
										<td style="padding:8px 16px;vertical-align:middle">
											<div class="text-body-2 font-weight-medium" style="color:#37474f">{{
												item.HocKi }}</div>
											<v-chip size="x-small" variant="flat" class="mt-1" style="font-size:10px"
												:color="item.LoaiDiem === 'HK' ? 'blue-lighten-4' : item.LoaiDiem === 'TA2' ? 'teal-lighten-4' : 'orange-lighten-4'">
												{{ item.LoaiDiem }}
											</v-chip>
										</td>
										<td style="padding:8px 16px;vertical-align:middle">
											<div class="d-flex align-center gap-2">
												<span class="text-body-2 font-weight-medium" style="color:#37474f">{{
													item.TenKiNang }}</span>
												<v-chip size="x-small" color="primary" variant="tonal"
													style="font-size:10px">{{ item.SoCau }} câu</v-chip>
											</div>
											<div class="text-caption mt-1 font-italic" style="color:#b0bec5">{{
												item.MaCotDiem }}</div>
										</td>
										<td style="padding:8px 16px;vertical-align:middle">
											<div class="d-flex flex-wrap gap-1">
												<v-chip v-for="c in item._chips" :key="c.id" size="x-small"
													color="indigo" variant="tonal"
													style="font-size:10px;font-weight:600">{{ c.name }}</v-chip>
											</div>
										</td>
										<td style="padding:6px 10px;text-align:right;vertical-align:middle">
											<v-btn icon variant="text" size="x-small" color="primary"
												@click="startEdit(item)">
												<v-icon size="15">mdi-pencil-outline</v-icon>
											</v-btn>
											<v-btn icon variant="text" size="x-small" color="error"
												:loading="deletingID === item.ThietLapID" @click="del(item)">
												<v-icon size="15">mdi-delete-outline</v-icon>
											</v-btn>
										</td>
									</tr>
								</template>

							</tbody>
						</table>
					</div>
				</div>

			</v-card>
		</template>
	</v-dialog>
</template>

<script>
	export default {
		name: 'ThietLapKiNangDialog',
	
		props: {
			nienKhoa: { type: Number, default: () => vueData.NienKhoa },
			classes: { type: Array, default: () => [] },
		},
	
		data() {
			return {
				items: [],
				loading: false,
				saving: false,
				deletingID: null,
				editingID: null,
				innerClasses: [],
	
				filterLoaiDiem: 'HK',
				filterHocKi: null,
				filterKhoi: null,
	
				groupByClass: true,
				collapsedGroups: new Set(),
	
				form: {
					HocKi: 'S1_Mid',
					LoaiDiem: 'HK',
					TenKiNang: null,
					SoCau: null,
					NhomIDs: [],
				},
	
				hocKiOptions: [
					{ key: 'S1_Mid', label: 'HK1 - Giữa kì' },
					{ key: 'S1_Final', label: 'HK1 - Cuối kì' },
					{ key: 'S2_Mid', label: 'HK2 - Giữa kì' },
					{ key: 'S2_Final', label: 'HK2 - Cuối kì' },
				],
	
				loaiDiemOptions: [
					{ key: 'HK', label: 'Điểm học kì' },
					{ key: 'TA2', label: 'Điểm TA2' },
					{ key: 'IELTS', label: 'Điểm IELTS' },
				],
	
				KI_NANG_MAP: {
					HK: ['Listening', 'Speaking', 'Reading', 'Writing', 'Total'],
					TA2: ['Listening', 'Speaking', 'Reading', 'Writing', 'Total'],
					IELTS: ['Listening', 'Speaking', 'Reading', 'Writing', 'Total'],
				},
	
				headers: [
					{ title: 'Kì / Loại điểm', key: 'HocKi', width: '170px' },
					{ title: 'Kỹ năng', key: 'TenKiNang', width: '240px' },
					{ title: 'Lớp áp dụng', key: 'TenNhom', minWidth: '200px' },
					{ title: '', key: 'actions', width: '80px', sortable: false, align: 'end' },
				],
			}
		},
	
		computed: {
			khoiOptions() {
				const map = new Map()
				for (const c of this.classOptions) {
					if (c.khoiID != null && !map.has(c.khoiID))
						map.set(c.khoiID, `Khối ${c.khoiID}`)
				}
				return Array.from(map.entries())
					.sort((a, b) => a[0] - b[0])
					.map(([id, label]) => ({ id, label }))
			},
	
			classOptions() {
				return this.classes.length > 0 ? this.classes : this.innerClasses
			},
	
			kiNangOptions() {
				return this.KI_NANG_MAP[this.form.LoaiDiem] || []
			},
	
			maCotDiem() {
				const { HocKi, LoaiDiem, TenKiNang } = this.form
				if (!HocKi || !LoaiDiem || !TenKiNang) return ''
				if (TenKiNang === 'Total') {
					if (LoaiDiem === 'HK') return `${HocKi}_Total_Point`
					if (LoaiDiem === 'TA2') return `${HocKi}_TA2_Point`
					if (LoaiDiem === 'IELTS') return `${HocKi}_IELTS_Band_Conv`
				}
				if (LoaiDiem === 'HK') return `${HocKi}_${TenKiNang}_Point`
				if (LoaiDiem === 'TA2') return `${HocKi}_TA2_${TenKiNang}_Point`
				if (LoaiDiem === 'IELTS') return `${HocKi}_IELTS_${TenKiNang}_Conv`
				return ''
			},
	
			filteredItems() {
				return this.items.filter(x => {
					if (x.LoaiDiem !== this.filterLoaiDiem) return false
					if (this.filterHocKi && x.HocKi !== this.filterHocKi) return false
					if (this.filterKhoi) {
						const ids = (x.List_NhomID || '').split(',').map(s => s.trim())
						const hasKhoi = ids.some(id =>
							this.classOptions.find(c => c.id === id)?.khoiID === this.filterKhoi
						)
						if (!hasKhoi) return false
					}
					return true
				}).map(x => ({
					...x,
					_chips: (x.List_NhomID || '').split(',').filter(Boolean).map(id => {
						const found = this.classOptions.find(c => c.id === id.trim())
						return { id: id.trim(), name: found?.name || id.trim() }
					}),
				}))
			},
	
			tableData() {
				if (!this.groupByClass) return this.filteredItems
	
				const map = new Map()
				for (const x of this.filteredItems) {
					const key = x.List_NhomID || ''
					if (!map.has(key)) map.set(key, [])
					map.get(key).push(x)
				}
				return Array.from(map.entries()).map(([key, rows]) => ({
					key,
					chips: key.split(',').filter(Boolean).map(id => {
						const found = this.classOptions.find(c => c.id === id.trim())
						return { id: id.trim(), name: found?.name || id.trim() }
					}),
					rows,
				}))
			},
	
			totalRows() {
				if (!this.groupByClass) return this.tableData.length
				return this.tableData.reduce((s, g) => s + g.rows.length, 0)
			},
	
			canSave() {
				const base = !!this.form.HocKi && !!this.form.LoaiDiem &&
					!!this.form.TenKiNang
				if (this.editingID) return base
				return base && this.form.NhomIDs.length > 0
			},
		},
	
		mounted() {
			this.load()
			if (this.classes.length === 0) this.loadClasses()
		},
	
		methods: {
			async loadClasses() {
				const data = await fetchPromise("lms/NhomAV_Get", { NienKhoa: this.nienKhoa })
				this.innerClasses = data
					.filter(x => x.MonHocID === 76 && x.IsNhomLMS_GiaoBai === false)
					.map(x => ({ id: x.NhomID, name: x.TenNhom, khoiID: x.KhoiID }))
			},
	
			onLoaiDiemChange() {
				this.form.TenKiNang = null
			},
	
			toggleGroup(key) {
				const next = new Set(this.collapsedGroups)
				if (next.has(key)) next.delete(key)
				else next.add(key)
				this.collapsedGroups = next
			},
	
			async load(forceRefresh = false) {
				this.loading = true
				try {
					this.items = await fetchPromise("lms/ThietLap_KiNang_Get", {
						NienKhoa: this.nienKhoa,
					}, { forceRefresh })
				} finally {
					this.loading = false
				}
			},
	
			async save() {
				if (!this.canSave || this.saving) return
				this.saving = true
				try {
					if (this.editingID) {
						await fetchPromise("lms/ThietLap_KiNang_Upd", {
							ThietLapID: this.editingID,
							TenKiNang: this.form.TenKiNang,
							MaCotDiem: this.maCotDiem,
							SoCau: this.form.SoCau,
							List_NhomID: this.form.NhomIDs.join(","),
						})
					} else {
						await fetchPromise("lms/ThietLap_KiNang_Ins", {
							NienKhoa: this.nienKhoa,
							HocKi: this.form.HocKi,
							LoaiDiem: this.form.LoaiDiem,
							TenKiNang: this.form.TenKiNang,
							MaCotDiem: this.maCotDiem,
							SoCau: this.form.SoCau,
							List_NhomID: this.form.NhomIDs.join(","),
						})
					}
					this.cancelEdit()
					await this.load(true)
				} finally {
					this.saving = false
				}
			},
	
			del(item) {
				const $this = this
				confirm({
					title: `Xóa kỹ năng "${item.TenKiNang}"?`,
					action: async function () {
						try {
							$this.deletingID = item.ThietLapID
							await fetchPromise("lms/ThietLap_KiNang_Del", { ThietLapID: item.ThietLapID })
							await $this.load(true)
						} finally {
							$this.deletingID = null
						}
					},
				})
			},
	
			startEdit(item) {
				this.editingID = item.ThietLapID
				this.form.HocKi = item.HocKi
				this.form.LoaiDiem = item.LoaiDiem
				this.form.TenKiNang = item.TenKiNang
				this.form.SoCau = item.SoCau
				this.filterLoaiDiem = item.LoaiDiem
				this.form.NhomIDs = item.List_NhomID
					? item.List_NhomID.split(',').map(x => x.trim()).filter(Boolean)
					: []
			},
	
			cancelEdit() {
				this.editingID = null
				this.form.TenKiNang = null
				this.form.SoCau = null
			},
		},
	}
</script>