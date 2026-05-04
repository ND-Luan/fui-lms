<template>
	<div style="max-height: calc(100dvh - 212px); height: 100%; overflow: auto; padding-bottom: 42px;">
		<v-divider></v-divider>
		<v-list lines="two">
			<v-list-subheader> {{ $t('message.monthList') }}</v-list-subheader>
			<div v-for="(thang, index) in vueData.DSHocTapThang">
				<v-list-item :title="renderTextTitle(thang)" @click="onRedirect(thang)">
					<template v-slot:prepend>
						<v-avatar>
							<v-img :src="thang.IconUrl" :cover="false" />
						</v-avatar>
					</template>
					<template v-slot:append>
						<v-chip v-if="thang.Is_Viewed" variant="text" class="font-weight-medium" :color="thang.MauTinhTrang">
							{{ $t('message.announced') }}</v-chip>
						<v-chip variant="text" class="font-weight-medium" v-else>{{ $t('message.notYetAnnounced') }}</v-chip>
					</template>
				</v-list-item>
				<v-divider inset v-if="index !== vueData.DSHocTapThang.length - 1"></v-divider>
			</div>
			<uc-empty v-if="vueData.DSHocTapThang.length === 0" class="text-center" />
		</v-list>
	</div>
</template>

<script>
export default {
	props: [],
	data() {
		return {
			vueData,
			IsLanguage: JSON.parse(localStorage.getItem('IsLanguage'))
		}
	},
	mounted() {
		if (!vueData.HocSinhSelected || !vueData.NienKhoa) return

		const IsPassRoleParentString = localStorage.getItem("IsPassRoleParent")
		const IsPassRoleParent = Boolean(IsPassRoleParentString) ?? false
		console.log('MOUNTED....', IsPassRoleParent, vueData.NienKhoa)
		let url = ''
		//Nếu từ bên Giáo viên qua
		if (IsPassRoleParent) url = 'lms/GV_Thang_NhanXetThang_Lop_Get'
		else url = 'lms/PH_Thang_NhanXetThang_Lop_Get'
		ajaxCALL(url, {
			"LopID": vueData.HocSinhSelected.LopID,
			"HSLopID": vueData.HocSinhSelected.HSLopID,
			NienKhoa: vueData.NienKhoa
		}, res => {
			vueData.DSHocTapThang = res.data
		})
	},
	watch: {
		'$i18n.locale': function (locale) {
			if (locale === 'en') this.IsLanguage = true;
			else this.IsLanguage = false;
		},
	},
	methods: {
		onRedirect(thangObj) {
			console.log('redirect')
			openWindow({
				title: "Thông báo tháng",
				url: `report-ket-qua-hoc-tap-thang-hoc-sinh?id=${vueData.HocSinhSelected.HocSinhID}&lop_nxtid=${thangObj.Lop_NhanXetThangID}&nienkhoa=${vueData.NienKhoa}`,
				onclose: [
					{
						"EXE": "console.log('vueData',vueData)"
					},
					{
						"CALL": "getDSThang"
					}
				]
			})
		},
		renderTextTitle(thang) {
			return this.IsLanguage ? thang.Thang_HienThi_EN : thang.Thang_HienThi_VI
		},
		redirect,
	},
}
</script>