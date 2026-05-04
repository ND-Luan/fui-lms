<template>
	<v-fade-transition>
		<div v-if="isLoadingPage" class="d-flex flex-column ga-2 justify-center align-center" style="height: 100dvh">
			<v-progress-circular :size="50" color="primary" indeterminate />
			<p>Đang tải dữ liệu...</p>
		</div>
		<div v-else>
			<!-- <v-toolbar density="compact" title="Báo cáo cấp 1" >
				<template v-slot:append>
					<div class="d-flex ga-2" style="min-width: 200px">
						<v-select v-model="NienKhoa" label="Niên khóa" :items="DSNienKhoa" chips />
					</div>
				</template>
			</v-toolbar>-->
			<div class="d-flex flex-row">
				<v-tabs v-model="tab" direction="vertical">
					<v-tab :value="0" text="Đánh giá Môn học / HK"></v-tab>
					<v-tab :value="1" text="Môn học - Tất cả HK"></v-tab>
					<v-tab :value="2" text="Phẩm chất"></v-tab>
					<v-tab :value="3" text="Phẩm chất - Tất cả HK"></v-tab>
					<v-tab :value="4" text="Năng lực"></v-tab>
					<v-tab :value="5" text="Năng lực - Tất cả HK"></v-tab>
					<v-tab :value="6" text="Điểm - chung"></v-tab>
				</v-tabs>
				<v-divider vertical></v-divider>
				<v-tabs-window v-model="tab">
					<v-tabs-window-item :value="0">
						<uc-tab-mon-hoc-hk v-if="isExistNK_HK" :NienKhoa />
					</v-tabs-window-item>
					<v-tabs-window-item :value="1">
						<uc-tab-mon-hoc-ss-kn v-if="isExistNK_HK" :NienKhoa />
					</v-tabs-window-item>
					<v-tabs-window-item :value="2">
						<uc-tab-mon-hoc-pc v-if="isExistNK_HK" :NienKhoa />
					</v-tabs-window-item>
					<v-tabs-window-item :value="3">
						<uc-tab-mon-hoc-pc-tat-ca-hk v-if="isExistNK_HK" :NienKhoa />
					</v-tabs-window-item>
					<v-tabs-window-item :value="4">
						<uc-tab-mon-hoc-nl v-if="isExistNK_HK" :NienKhoa />
					</v-tabs-window-item>
					<v-tabs-window-item :value="5">
						<uc-tab-mon-hoc-nl-tat-ca-hk v-if="isExistNK_HK" :NienKhoa />
					</v-tabs-window-item>
					<v-tabs-window-item :value="6">
						<uc-tab-mon-hoc-diem-chung v-if="isExistNK_HK" :NienKhoa />
					</v-tabs-window-item>
				</v-tabs-window>
			</div>
		</div>
	</v-fade-transition>
</template>

<script>
	export default {
		data() {
			return {
				tab: 0,
				DSNienKhoa: [],
				NienKhoa: null,
				isLoadingPage: false,
				vueData
			}
		},
		computed: {
			isExistNK_HK: function () {
				return vueData.NienKhoa > 0
			}
		},
		watch: {
			"vueData.NienKhoa": function (nk) {
				this.NienKhoa = nk
			}
		}
	}
</script>