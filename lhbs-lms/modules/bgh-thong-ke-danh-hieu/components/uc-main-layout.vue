<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title>{{ TitlePage }} • {{ TitleCap }}</v-card-title>
				<v-card-text>
					<v-row align="center">
						<v-col cols="12" sm="3">
							<v-select v-model="CapID" label="Cấp học" :items="DSCap" item-title="title"
								item-value="value" />
						</v-col>
						<v-col cols="12" sm="3">
							<v-select v-model="HocKi" label="Chọn học kì" :items="DSHocKi" item-title="title"
								item-value="textValue" />
						</v-col>
						<v-col class="d-flex align-center ga-2 flex-wrap text-no-wrap">
							<v-btn variant="outlined" color="primary" :disabled="!HocKi" @click="onRefresh">
								<v-icon start>mdi-reload</v-icon>Làm mới
							</v-btn>						<v-btn variant="outlined" color="teal" :disabled="!HocKi" @click="onExportExcel">
							<v-icon start>mdi-file-excel</v-icon>Xuất Excel
						</v-btn>							<v-btn variant="elevated" color="success" :disabled="!HocKi || isLocked"
								@click="onConfirmChot">
								<v-icon start>mdi-lock-check</v-icon>Chốt báo cáo
							</v-btn>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-divider />

		<div class="pa-4">
			<uc-tab-tieuhoc ref="tabRef" v-if="CapID == 1" :HocKi="HocKi" @onStateChange="updateActionState" />
			<uc-tab-trunghoc ref="tabRef" v-if="CapID == 2" :HocKi="HocKi" @onStateChange="updateActionState" />
			<uc-tab-trunghoc-pt ref="tabRef" v-if="CapID == 3" :HocKi="HocKi" @onStateChange="updateActionState" />
		</div>
	</Global>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
		data() {
			const hkUrl = vueData.hk
			let DSHocKi = []
			if (vueData.CapID === 1)
				DSHocKi = [{ title: "Giữa HK1", textValue: "GK_HK1" },
				{ title: "Cuối HK1", textValue: "CK_HK1" },
				{ title: "Giữa HK2", textValue: "GK_HK2" },
				{ title: "Cuối HK2", textValue: "CK_HK2" },]
			else
				DSHocKi = [{ title: "Học kì 1", textValue: "HK1" },
				{ title: "Học kì 2", textValue: "HK2" },
				{ title: "Cả năm", textValue: "CaNam" }]
			return {
				vueData,
				CapID: parseInt(vueData.CapID || vueData.capid) || 1,
				HocKi: hkUrl,
				isLocked: false,
				DSCap: [
					{ title: "Tiểu học", value: 1 },
					{ title: "Trung học cơ sở", value: 2 },
					{ title: "Trung học phổ thông", value: 3 },
				],
				DSHocKi
			}
		},
		computed: {
			TitleCap() { return renderText(this.CapID) },
			TitlePage() {
				return getTitlePageByURL(window.location.pathname + window.location.search) || 'THỐNG KÊ DANH HIỆU'
			},
		},
		watch: {
			CapID(v) {
				vueData.CapID = v
				this.isLocked = false
			}
		},
		mounted() {
			if (!window.XLSX) {
				const s = document.createElement('script')
				s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
				document.head.appendChild(s)
			}
		},
		methods: {
			updateActionState(state) {
				this.isLocked = state.isLocked
			},
			onExportExcel() {
				if (this.$refs.tabRef?.onExportExcel) {
					this.$refs.tabRef.onExportExcel()
				}
			},
			onRefresh() {
				if (this.$refs.tabRef?.onRefresh) {
					this.$refs.tabRef.onRefresh()
				}
			},
			onConfirmChot() {
				if (this.$refs.tabRef?.onChotBaoCao) {
					this.$refs.tabRef.onChotBaoCao()
				}
			}
		}
	}
</script>