<template>
	<div>
		<div class="px-2 text-h6 text-primary">
			<v-icon class="mr-2" color="white" size="large">mdi-school</v-icon>
			Danh sách học liệu - {{ TenCap }}
		</div>

		<v-expansion-panels v-model="panel" multiple>
			<!-- Tổ hợp có ít nhất 1 môn có học liệu -->
			<v-expansion-panel v-for="toHop in toHopHienThi" :key="toHop.id">
				<v-expansion-panel-title>
					{{ toHop.name }}
				</v-expansion-panel-title>

				<v-expansion-panel-text class="scroll-panel">
					<!-- MON CÓ HỌC LIỆU -->
					<div v-for="mon in dsMonHienThi[toHop.id]" :key="mon.MonHocID" class="mb-2">
						<v-card class="pa-2">
							<v-card-title>{{ mon.MonHocName }}</v-card-title>

							<v-row>
								<v-col v-for="sach in DSHocLieuTheoMon[mon.MonHocID]" :key="sach.HocLieuID" cols="12"
									sm="4" md="2">
									<uc-sach-card :item="sach" />
								</v-col>
							</v-row>
						</v-card>
					</div>
				</v-expansion-panel-text>
			</v-expansion-panel>
		</v-expansion-panels>
	</div>
</template>
<script>
	export default {
	data() {
		const config = {
			2: {
				batBuoc: [73, 74],
				xh: [60, 53, 52],
				tn: [61, 57, 67],
				ta: [46]
			},
			3: {
				batBuoc: [103, 104],
				xh: [100, 79, 82],
				tn: [91, 88, 97],
				ta: [76]
			}
		}

		const capCfg = config[vueData.CapID] || {}

		return {
			DSHocLieu: [],
			DSMonHoc: [],
			panel: undefined,

			DSToHop: [
				{ id: 1, name: "Môn học bắt buộc", List_MonHocID: capCfg.batBuoc || [] },
				{ id: 2, name: "Khoa học xã hội", List_MonHocID: capCfg.xh || [] },
				{ id: 3, name: "Khoa học tự nhiên", List_MonHocID: capCfg.tn || [] },
				{ id: 4, name: "Tiếng Anh", List_MonHocID: capCfg.ta || [] },
				{ id: 5, name: "Các môn còn lại", List_MonHocID: null }
			]
		}
	},

	mounted() {
		this.getDSMonHoc()
		this.getDSHocLieu()
	},

	computed: {
		TenCap() {
			return {
				1: "Tiểu học",
				2: "Trung học cơ sở",
				3: "Trung học phổ thông"
			}[vueData.CapID] || ""
		},

		/** 1) Gom học liệu theo môn */
		DSHocLieuTheoMon() {
			const map = {}
			for (const sach of this.DSHocLieu) {
				(map[sach.MonHocID] ||= []).push(sach)
			}
			return map
		},

		/** 2) Lọc danh sách môn theo từng tổ hợp */
		dsMonTheoToHop() {
			const result = {}

			const usedMon = this.DSToHop
				.filter(t => t.List_MonHocID)
				.flatMap(t => t.List_MonHocID)

			for (const toHop of this.DSToHop) {
				if (toHop.id === 5) {
					// MON CÒN LẠI
					result[toHop.id] = this.DSMonHoc.filter(
						m => !usedMon.includes(m.MonHocID)
					)
				} else {
					result[toHop.id] = this.DSMonHoc.filter(
						m => toHop.List_MonHocID.includes(m.MonHocID)
					)
				}
			}

			return result
		},

		/** 3) Chỉ lấy môn có học liệu */
		dsMonHienThi() {
			const result = {}
			for (const toHop of this.DSToHop) {
				result[toHop.id] = (this.dsMonTheoToHop[toHop.id] || []).filter(
					m => this.DSHocLieuTheoMon[m.MonHocID]?.length > 0
				)
			}
			return result
		},

		/** 4) Chỉ hiện tổ hợp có môn có học liệu */
		toHopHienThi() {
			return this.DSToHop.filter(
				t => this.dsMonHienThi[t.id]?.length > 0
			)
		}
	},

	methods: {
		getDSHocLieu() {
			ajaxCALL("lms/FP_HocLieu_GetAll", {
				PageNumber: 1,
				PageSize: 1000,
				KhoiID: 0,
				MonHocID: 0,
				BoSachID: 0
			}, res => {
				this.DSHocLieu = res.data
				this.panel = 0
			})
		},

		getDSMonHoc() {
			ajaxCALL("lms/MonHoc_Get_ByCapID", {
				CapID: vueData.CapID
			}, res => {
				this.DSMonHoc = res.data
			})
		}
	}
}
</script>