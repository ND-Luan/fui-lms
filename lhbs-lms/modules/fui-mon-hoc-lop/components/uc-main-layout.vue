<template>
	<div class="pa-2">
		<v-card border>
			<v-card-title class="d-flex align-center px-3 py-2 text-primary">
				<span>{{ vueData.TitlePage }}</span>
				<v-switch v-if="vueData.CapItem?.CapID === 3" v-model="vueData.ShowNhom" label="Hiển thị lớp nhóm"
					class="ml-4" color="primary" hide-details density="compact" @update:model-value="toggleDisplayMode" />
				<v-spacer />
				<v-btn variant="outlined" color="primary" prepend-icon="mdi-checkbox-multiple-marked"
					@click="vueData.IsShowDialogChonNhanh = true">Chọn nhanh</v-btn>
				<v-btn variant="outlined" color="primary" prepend-icon="mdi-content-save" @click="vueData.onSave">Lưu</v-btn>
			</v-card-title>
			<v-card-text class="px-2 pt-0">
				<v-row dense>
					<v-col cols="3"><v-select v-model="vueData.CapItem" label="Chọn cấp học" :items="vueData.DSCap" item-title="TenCapHoc" item-value="CapID" return-object /></v-col>
					<v-col cols="2"><v-select v-model="vueData.KhoiID" label="Chọn khối" :items="vueData.DSKhoi" item-title="title" item-value="value" /></v-col>
					<v-col cols="3"><v-select v-model="vueData.MonHocItem" label="Chọn môn học" :items="vueData.DSMonHoc" item-title="MonHocName" item-value="MonHocID" return-object /></v-col>
					<v-col cols="2"><f-button label="Làm mới" prepend-icon="mdi-refresh" color="primary" variant="outlined" :action="refresh" /></v-col>
				</v-row>
			</v-card-text>
		</v-card>
		<uc-table />
		<f-dialog v-model="vueData.IsShowDialogChonNhanh" :width="800" title="Chọn nhanh"
			:button="[{ label: 'Đóng', action: { EXE: 'vueData.IsShowDialogChonNhanh = false' } }]">
			<v-list><v-list-item v-for="item in vueData.DSMonHoc.filter(x => x.MonHocID !== 0)" :key="item.MonHocID" :title="item.MonHocName">
				<template #append><v-select :items="vueData.DSTemplate" item-title="TemplateBangDiemName" item-value="TemplateBangDiemID" style="min-width:300px" @update:model-value="val => vueData.onSaveChonNhanh(val, item)" /></template>
			</v-list-item></v-list>
		</f-dialog>
	</div>
</template>
<script>
export default {
	data() { return { vueData } },
	methods: {
		toggleDisplayMode() { this.vueData.toggleDisplayMode() },
		refresh() { CALL('getMonHocLop') }
	}
}
</script>
