<template>
	<v-card>
		<v-card-title class="d-flex px-0 text-primary pt-0">
			Kho nội dung công khai
		</v-card-title>
		<v-card-text class="pa-0 d-flex flex-column ga-2">
			<div class="d-flex ga-2 flex-wrap">
				<v-select v-model="FormData.KhoiID" label="Khối" hide-details="auto" density="compact" :items="DSKhoi"
					style="max-width: 200px"></v-select>
				<v-select v-model="FormData.MonHocID" label="Môn học" hide-details="auto" density="compact"
					:items="DSMonHoc.filter(mh => mh.KhoiID == FormData.KhoiID)" :disabled="!FormData.KhoiID"
					style="min-width: 200px;max-width: fit-content"></v-select>
				<v-btn variant="outlined" @click="getResourcePublic()" color="primary">Làm mới</v-btn>
			</div>
			<v-data-table :items="DataResourcePublic" :headers :hide-default-footer="true" class="custom-table">
				<template v-slot:item.Preview="{ item }">
					<v-btn v-if="item.ResourceType == 'ASSIGNMENT'" color="primary" @click="PreviewContent(item)"
						variant="tonal" size="small">Xem trước</v-btn>
				</template>
				<template v-slot:item.ResourceType="{ item }">
					<v-chip :color="item.ResourceType == 'ASSIGNMENT' ? 'blue' : 'green'">{{ item.ResourceType ==
						'ASSIGNMENT' ? 'Bài tập' : 'Bài học' }}
					</v-chip>
				</template>
				<template v-slot:item.actions="{ item }">
					<v-btn color="orange" @click="GetContent(item)" variant="tonal" size="small"
						:disabled="item.IsGetResource == 1">Lấy nội dung</v-btn>
				</template>
				<template v-slot:item.IsGetResource="{ item }">
					<v-chip :color="item.IsGetResource == 1 ? 'pink' : 'grey'">
						{{ item.IsGetResource == 1 ? 'Đã lấy nội dung' : 'Chưa lấy' }}</v-chip>
				</template>
			</v-data-table>
		</v-card-text>

	</v-card>
</template>

<script>
export default {
	props: [],
	data() {
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
					title: "Tiêu đề",
					value: "Title"
				},
				{
					title: "Loại nội dung",
					key: "ResourceType",
					width: 150,
					align: 'center'
				},
				{
					title: "Người tạo",
					value: "NguoiTao"
				},
				{
					title: "Xem trước nội dung",
					key: "Preview",
					width: 200,
					align: 'center'
				},
				{
					title: "Trạng thái",
					key: "IsGetResource",
					width: 150,
					align: 'center'
				},
				{
					title: "Thao tác",
					key: "actions",
					width: 150,
					align: 'center'
				}
			]
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
				NienKhoa: vueData.NienKhoa
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
				title: "Xem trước bài soạn",
				url: `/lms-tc-asm-preview?AssignmentID=${item.ResourceID || 0}`
			})
			console.log('item', item)
		},
		GetContent(item) {
			if (!item.ResourceID) return
			if (item.ResourceType == 'ASSIGNMENT') {
				let payload = {
					AssignmentID: item.ResourceID
				}
				ajaxCALL('/lms/EL_Teacher_Copy_ContentByAssignmentID', payload, res => {
					this.getResourcePublic()
					Vue.$toast.success('Lấy nội dung thành công!', { position: 'top' })
				})
			} else {
				let payload = {
					LessonID: item.ResourceID
				}
				ajaxCALL('/lms/EL_Teacher_Copy_ContentByLessonID', payload, res => {
					this.getResourcePublic()
					Vue.$toast.success('Lấy nội dung thành công!', { position: 'top' })
				})
			}

		}
	},
}
</script>