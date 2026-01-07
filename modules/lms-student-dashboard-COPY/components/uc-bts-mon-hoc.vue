<template>
	<v-bottom-sheet v-model="sheet">
		<template v-slot:activator="{ props: activatorProps }">
			<v-btn v-bind="{ ...activatorProps, ...$attrs }" />
		</template>

		<v-card title="Chọn môn học">
			<v-divider />

			<v-list>
				<v-list-subheader>
					<div class="d-flex align-center">
						Danh sách môn học
						<v-spacer />

						<!-- CHECK ALL -->
						<v-checkbox v-model="isCheckAllMonHoc" label="Chọn tất cả môn học" :density="vueData.density"
							@change="toggleAll" />
					</div>
				</v-list-subheader>

				<!-- LIST MÔN HỌC -->
				<v-list-item v-for="mh in DSMonHoc" :key="mh.MonHocID" @click="onToggle(mh)" :class="{'bg-primary text-white': currentMonHocSelected.some(x => x.MonHocID === mh.MonHocID)}">
					<template #prepend>
						<v-icon :color="mh.Color">{{ mh.Icon }}</v-icon>
					</template>

					<v-list-item-title>
						{{ mh.TenMonHoc_HienThi }}
					</v-list-item-title>
				</v-list-item>
			</v-list>
		</v-card>
	</v-bottom-sheet>
</template>

<script>
	export default {
	props: {
		monHocSelected: Array,
		NienKhoa: Number
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

	async mounted() {
		this.DSMonHoc = await ajaxCALLPromise(
			"lms/EL_Student_Get_MonHoc_ByHocSinhID",
			{
				HocSinhID: vueData.user.UserID,
				NienKhoa: this.NienKhoa
			}
		);

		// Mặc định chọn hết
		this.currentMonHocSelected = [...this.DSMonHoc];
		this.emitSelected();
	},

	watch: {
		// Auto-check khi chọn đủ số lượng
		currentMonHocSelected(newVal) {
			this.isCheckAllMonHoc = newVal.length === this.DSMonHoc.length;
			this.emitSelected();
		}
	},

	methods: {
		emitSelected() {
			this.$emit("update:monHocSelected", this.currentMonHocSelected);
		},

		// Nhấn check-all
		toggleAll(isCheck) {
			this.currentMonHocSelected = isCheck ? [...this.DSMonHoc] : [];
		},

		// Nhấn từng môn
		onToggle(mh) {
			const exists = this.currentMonHocSelected.some(x => x.MonHocID === mh.MonHocID);

			if (exists) {
				this.currentMonHocSelected = this.currentMonHocSelected.filter(
					x => x.MonHocID !== mh.MonHocID
				);
			} else {
				this.currentMonHocSelected = [...this.currentMonHocSelected, mh];
			}
		}
	}
}
</script>