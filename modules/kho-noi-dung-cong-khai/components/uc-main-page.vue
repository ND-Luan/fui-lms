<template>
	<v-card>
		<v-card-title class="d-flex px-0 text-primary pt-0">
			{{ $t('message.PublicContentLibrary') }}
		</v-card-title>
		<v-card-text class="pa-0 d-flex flex-column ga-2">
			<div class="d-flex ga-2 flex-wrap">
				<v-select v-model="FormData.KhoiID" :label="$t('message.grade')" hide-details="auto" density="compact"
					:items="DSKhoi" style="max-width: 200px"></v-select>
				<v-select v-model="FormData.MonHocID" :label="$t('message.Subject')" hide-details="auto"
					density="compact" :items="DSMonHoc.filter(mh => mh.KhoiID == FormData.KhoiID)"
					:disabled="!FormData.KhoiID" style="min-width: 200px;max-width: fit-content"></v-select>
				<v-btn variant="outlined" @click="getResourcePublic()" color="primary">{{ $t('message.Refresh')
				}}</v-btn>
			</div>
			<v-data-table :items="DataResourcePublic" :headers :hide-default-footer="true" class="custom-table">
				<template v-slot:item.Preview="{ item }">
					<v-btn v-if="item.ResourceType == 'ASSIGNMENT'" color="primary" @click="PreviewContent(item)"
						variant="tonal" size="small">{{ $t('message.Preview') }}</v-btn>
				</template>
				<template v-slot:item.ResourceType="{ item }">
					<v-chip :color="item.ResourceType == 'ASSIGNMENT' ? 'blue' : 'green'">
						{{ item.ResourceType == 'ASSIGNMENT' ? $t('message.Assignment') : $t('message.Lesson') }}
					</v-chip>
				</template>
				<template v-slot:item.actions="{ item }">
					<v-btn color="orange" @click="GetContent(item)" variant="tonal" size="small"
						:disabled="item.IsGetResource == 1">{{ $t('message.RetrieveContent') }}</v-btn>
				</template>
				<template v-slot:item.IsGetResource="{ item }">
					<v-chip :color="item.IsGetResource == 1 ? 'pink' : 'grey'">
						{{ item.IsGetResource == 1 ? $t('message.ContentRetrieved') : $t('message.NotRetrieved') }}
					</v-chip>
				</template>
			</v-data-table>
		</v-card-text>
		<uc-confirm-get-resource v-model:isOpen="isShowModalSelectWeek" :resource="resourceSelected" @finish-save="getResourcePublic"></uc-confirm-get-resource>
	</v-card>
</template>

<script>
export default {
	props: [],
	data() {
		this.$i18n.locale = (localStorage.getItem('IsLanguage') && localStorage.getItem('IsLanguage') == 'true') ? 'en' : 'vi'
		return {
			DSKhoi: [],
			DSMonHoc: [],
			FormData: {
				KhoiID: null,
				MonHocID: null
			},
			DataResourcePublic: [],
			headers: [
				{
					title: this.$t('message.Title'),
					value: "Title"
				},
				{
					title: this.$t('message.ContentType'),
					key: "ResourceType",
					width: 150,
					align: 'center'
				},
				{
					title: this.$t('message.Creator'),
					value: "NguoiTao"
				},
				{
					title: this.$t('message.PreviewContent'),
					key: "Preview",
					width: 200,
					align: 'center'
				},
				{
					title: this.$t('message.Status'),
					key: "IsGetResource",
					width: 150,
					align: 'center'
				},
				{
					title: this.$t('message.Actions'),
					key: "actions",
					width: 150,
					align: 'center'
				}
			],
			resourceSelected:{},
			isShowModalSelectWeek:false
		}
	},
	mounted() {
		if (vueData.KhoiID && vueData.MonHocID) {
			this.FormData.KhoiID = vueData.KhoiID
			this.FormData.MonHocID = vueData.MonHocID
		}
		this.GetKhoiMonHoc()
	},
	computed: {},
	watch: {
		'FormData.KhoiID': function (val) {
			if (val) {
				this.FormData.MonHocID = null
			}
		},
		'FormData.MonHocID': function (val) {
			if (val) {
				this.getResourcePublic()
			}
		}
	},
	methods: {
		GetKhoiMonHoc() {
			let payload = {
				NienKhoa: vueData.NienKhoa,
				HocKi: vueData.NienKhoaItem?.HocKi
			}
			ajaxCALL('/lms/EL_Teacher_GetKhoi_MonHoc_ByGiaoVienID', payload, res => {
				this.DSKhoi = res.data[0].map(khoi => ({ title: 'Khối ' + khoi.KhoiID, value: khoi.KhoiID }))
				this.DSMonHoc = res.data[1].map(mon => ({ title: mon.TenMonHoc_HienThi, value: mon.MonHocID, KhoiID: mon.KhoiID }))
			})

		},
		getResourcePublic() {
			if (!this.FormData.MonHocID && !this.FormData.KhoiID) return
			this.DataResourcePublic = []
			let payload = {
				NienKhoa: vueData.NienKhoa,
				MonHocID: this.FormData.MonHocID,
				KhoiID: this.FormData.KhoiID
			}
			ajaxCALL('/lms/EL_Teacher_GetResourcePublic', payload, res => {
				this.DataResourcePublic = res.data
			})
		},
		PreviewContent(item) {
			openWindow({
				title: this.$t('message.PreviewDraftLesson'),
				url: `/lms-tc-asm-preview?AssignmentID=${item.ResourceID || 0}`
			})
			console.log('item', item)
		},
		GetContent(item) {
			if (!item.ResourceID) return
			this.resourceSelected = item
			this.isShowModalSelectWeek = true
			
		}
	},
}
</script>