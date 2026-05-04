<template>
	<v-bottom-sheet v-model="sheet" max-width="520">
		<template v-slot:activator="{ props: activatorProps }">
			<v-btn v-bind="{ ...activatorProps, ...$attrs }" />
		</template>

		<div class="bts-wrapper">
			<div class="bts-handle" />

			<!-- Header -->
			<div class="bts-header">
				<div class="bts-header-left">
					<div class="bts-header-icon">
						<v-icon size="16" color="white">mdi-book-multiple</v-icon>
					</div>
					<div>
						<div class="bts-title">Môn học</div>
						<div class="bts-subtitle">
							{{ currentMonHocSelected.length }}/{{ DSMonHoc.length }} môn được chọn
						</div>
					</div>
				</div>

				<button class="bts-toggle-all" :class="{ active: isCheckAllMonHoc }"
					@click="toggleAll(!isCheckAllMonHoc)">
					<v-icon size="13">{{ isCheckAllMonHoc ? 'mdi-check-all' : 'mdi-checkbox-blank-outline' }}</v-icon>
					{{ isCheckAllMonHoc ? 'Bỏ chọn tất cả' : 'Chọn tất cả' }}
				</button>
			</div>

			<!-- Progress bar -->
			<div class="bts-progress-track">
				<div class="bts-progress-fill"
					:style="{ width: DSMonHoc.length ? (currentMonHocSelected.length / DSMonHoc.length * 100) + '%' : '0%' }" />
			</div>

			<!-- Subject list -->
			<div class="bts-list">
				<div v-if="DSMonHoc.length === 0" class="bts-empty">
					<v-icon size="36" color="grey-lighten-3">mdi-book-off-outline</v-icon>
					<span>Không có môn học</span>
				</div>

				<div v-for="mh in DSMonHoc" :key="mh.MonHocID" class="bts-item"
					:class="{ 'bts-item--active': currentMonHocSelected.some(x => x.MonHocID === mh.MonHocID) }" :style="currentMonHocSelected.some(x => x.MonHocID === mh.MonHocID)
            ? { '--item-color': mh.Color || 'rgb(var(--v-theme-primary))' } : {}" @click="onToggle(mh)">

					<div class="bts-item-icon"
						:style="{ background: (mh.Color || 'rgb(var(--v-theme-primary))') + '18' }">
						<v-icon :color="mh.Color || 'primary'" size="18">{{ mh.Icon }}</v-icon>
					</div>

					<div class="bts-item-name">{{ mh.TenMonHoc_HienThi }}</div>

					<div class="bts-item-check" :style="currentMonHocSelected.some(x => x.MonHocID === mh.MonHocID)
              ? { background: mh.Color || 'rgb(var(--v-theme-primary))', borderColor: mh.Color || 'rgb(var(--v-theme-primary))' }
              : {}">
						<v-icon v-if="currentMonHocSelected.some(x => x.MonHocID === mh.MonHocID)" size="12"
							color="white">
							mdi-check
						</v-icon>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="bts-footer">
				<v-btn block color="primary" size="large" rounded="lg" elevation="0" class="bts-btn-apply"
					@click="sheet = false">
					Xác nhận &nbsp;·&nbsp; {{ currentMonHocSelected.length }} môn
				</v-btn>
			</div>
		</div>
	</v-bottom-sheet>
</template>

<script>
	export default {
  props: {
    monHocSelected: Array,
    NienKhoa: Number,
    HocSinh: Object
  },
  data() {
    return {
      DSMonHoc: [],
      currentMonHocSelected: [],
      isCheckAllMonHoc: true,
      sheet: false,
      vueData
    }
  },
  watch: {
    "HocSinh.HocSinhID": {
      immediate: true,
      async handler(hocSinhID) {
        if (!hocSinhID) return
        this.DSMonHoc = await ajaxCALLPromise(
          "lms/EL_Student_Get_MonHoc_ByHocSinhID",
          { HocSinhID: hocSinhID, NienKhoa: this.NienKhoa }
        )
        this.currentMonHocSelected = [...this.DSMonHoc]
        this.emitSelected()
      }
    },
    currentMonHocSelected(newVal) {
      this.isCheckAllMonHoc = newVal.length === this.DSMonHoc.length
      this.emitSelected()
    }
  },
  methods: {
    emitSelected() {
      this.$emit("update:monHocSelected", this.currentMonHocSelected)
    },
    toggleAll(isCheck) {
      this.currentMonHocSelected = isCheck ? [...this.DSMonHoc] : []
    },
    onToggle(mh) {
      const exists = this.currentMonHocSelected.some(x => x.MonHocID === mh.MonHocID)
      this.currentMonHocSelected = exists
        ? this.currentMonHocSelected.filter(x => x.MonHocID !== mh.MonHocID)
        : [...this.currentMonHocSelected, mh]
    }
  }
}
</script> 