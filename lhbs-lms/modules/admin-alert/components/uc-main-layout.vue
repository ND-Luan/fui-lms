<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title>
					{{ TitlePage }} • {{ TitleCap }}
				</v-card-title>
				<v-card-text>
					<v-row align="center">
						<v-col cols="12" sm="4">
							<v-select v-model="filterCapID" label="Cấp học" :items="DSCap" item-title="title"
								item-value="value" hide-details />
						</v-col>
						<v-col cols="12" sm="4">
							<v-select v-model="filterTypeAlert" label="Loại thông báo" :items="DSTypeOptions"
								item-title="title" item-value="value" hide-details />
						</v-col>
						<v-col cols="12" sm="4" class="d-flex align-center justify-end ga-2">
							<v-btn color="primary" variant="outlined" prepend-icon="mdi-plus" @click="openNew">
								Thêm mới
							</v-btn>
							<v-btn color="secondary" variant="outlined" prepend-icon="mdi-refresh" @click="getData">
								Làm mới
							</v-btn>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-divider />

		<GlobalDataTable :headers="headers" :items="DS" item-value="AlertID" items-per-page="-1" hide-default-footer
			hover >
			<!-- custom column slots -->
			<template #item.CapID="{ item }">
				<v-chip size="small" :color="getCapColor(item.CapID)" variant="tonal">
					{{ getCapName(item.CapID) }}
				</v-chip>
			</template>

			<template #item.TypeAlert="{ item }">
				<v-chip size="small" :color="getTypeColor(item.TypeAlert)" variant="tonal" class="font-weight-medium">
					{{ getTypeAlertText(item.TypeAlert) }}
				</v-chip>
			</template>

			<template #item.UserRight="{ item }">
				<v-chip size="small" :color="getUserRightColor(item.UserRight)" variant="tonal">
					{{ getUserRightName(item.UserRight) }}
				</v-chip>
			</template>

			<template #item.ContentAlert="{ item }">
				<span class="text-body-2 font-weight-medium text-high-emphasis">{{ item.ContentAlert }}</span>
			</template>

			<template #item.DateAlert="{ item }">
				<div class="d-flex align-center text-body-2 text-medium-emphasis">
					<v-icon size="16" class="mr-1 opacity-70">mdi-calendar-clock</v-icon>
					<span>{{ formatDateTime(item.DateAlert) }}</span>
				</div>
			</template>

			<template #item.actions="{ item }">
				<div class="d-flex align-center ga-1">
					<v-btn icon size="small" variant="text" color="primary" @click="openEdit(item)">
						<v-icon>mdi-pencil</v-icon>
						<v-tooltip activator="parent" location="top">Chỉnh sửa</v-tooltip>
					</v-btn>
					<v-btn icon size="small" variant="text" color="error" @click="onDelete(item)">
						<v-icon>mdi-delete-outline</v-icon>
						<v-tooltip activator="parent" location="top">Xóa</v-tooltip>
					</v-btn>
				</div>
			</template>

			<template #no-data>
				<div class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
					<v-icon size="48" class="mb-3 opacity-40">mdi-table-search</v-icon>
					<p class="text-body-2">Không tìm thấy thông báo nào</p>
				</div>
			</template>
		</GlobalDataTable>

		<!-- Dialog thêm / sửa -->
		<uc-dialog v-model="dialog" :title="isEditMode ? 'Cập nhật thông báo' : 'Thêm thông báo mới'" doneText="Lưu"
			:width="560" @onSubmit="onSave">
			<v-row dense class="mt-1">
				<v-col cols="12">
					<v-select v-model="editedItem.TypeAlert" label="Loại thông báo" :items="[
							{ title: 'Thông báo', value: 'ALERT' },
							{ title: 'Cảnh báo', value: 'WARNING' },
							{ title: 'Nhắc nhở', value: 'REMIND' },
							{ title: 'Hệ thống', value: 'SYSTEM' }
						]" item-title="title" item-value="value" :rules="[v => !!v || 'Bắt buộc']" />
				</v-col>
				<v-col cols="12">
					<v-select v-model="editedItem.UserRight" label="Đối tượng hiển thị" :items="[
							{ title: 'Tất cả mọi người', value: 'ALL' },
							{ title: 'Học sinh', value: 'STUDENT' },
							{ title: 'Tất cả giáo viên', value: 'TEACHER' },
							{ title: 'Giáo viên - Chủ nhiệm (SR 1)', value: '1' },
							{ title: 'Giáo viên - Bộ môn (SR 2)', value: '2' },
							{ title: 'Ban Giám Hiệu (SR 3)', value: '3' },
							{ title: 'Tổ trưởng (SR 5)', value: '5' },
							{ title: 'System Admin (SR 9)', value: '9' }
						]" item-title="title" item-value="value" :rules="[v => !!v || 'Bắt buộc']" />
				</v-col>
				<v-col cols="12">
					<v-textarea v-model="editedItem.ContentAlert" label="Nội dung thông báo" rows="3" counter="100"
						maxlength="100"
						:rules="[v => !!v || 'Bắt buộc', v => (v && v.length <= 100) || 'Tối đa 100 ký tự']" />
				</v-col>
				<v-col cols="12" sm="6">
					<v-select v-model="editedItem.CapID" label="Cấp học áp dụng" :items="DSCap" item-title="title"
						item-value="value" />
				</v-col>
				<v-col cols="12" sm="6">
					<v-text-field v-model="editedItem.DateAlert" label="Ngày hiển thị" type="datetime-local"
						:rules="[v => !!v || 'Bắt buộc']" />
				</v-col>
			</v-row>
		</uc-dialog>
	</Global>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
	data() {
		return {
			vueData,
			DS: [],
			filterCapID: parseInt(vueData.CapID) || 0,
			filterTypeAlert: '',
			dialog: false,
			isEditMode: false,
			editedItem: {
				AlertID: 0,
				TypeAlert: 'ALERT',
				ContentAlert: '',
				DateAlert: '',
				CapID: 0,
				UserRight: 'ALL'
			},
			DSCap: [
				{ value: 0, title: 'Tất cả các cấp' },
				{ value: 1, title: 'Tiểu học' },
				{ value: 2, title: 'Trung học cơ sở' },
				{ value: 3, title: 'Trung học phổ thông' }
			],
			headers: [
				{ title: 'STT', value: 'stt', width: 60, sortable: false },
				{ title: 'Cấp học', value: 'CapID', width: 160 },
				{ title: 'Loại thông báo', value: 'TypeAlert', width: 160 },
				{ title: 'Đối tượng', value: 'UserRight', width: 150 },
				{ title: 'Nội dung', value: 'ContentAlert' },
				{ title: 'Ngày thông báo', value: 'DateAlert', width: 180 },
				{ title: 'Thao tác', value: 'actions', width: 120, sortable: false, align: 'center' }
			]
		}
	},
	computed: {
		TitleCap() {
			const capId = parseInt(vueData.CapID)
			return capId ? renderText(capId) : 'Quản lý thông báo'
		},
		TitlePage() {
			return getTitlePageByURL(window.location.pathname + window.location.search) || 'Thông báo'
		},
		DSTypeOptions() {
			const defaults = [
				{ title: 'Thông báo', value: 'ALERT' },
				{ title: 'Cảnh báo', value: 'WARNING' },
				{ title: 'Nhắc nhở', value: 'REMIND' },
				{ title: 'Hệ thống', value: 'SYSTEM' }
			]
			const existing = this.DS.map(item => item.TypeAlert).filter(Boolean)
			const uniqueExisting = Array.from(new Set(existing)).filter(t => !['ALERT', 'WARNING', 'REMIND', 'SYSTEM'].includes(t))
			return [
				{ title: 'Tất cả loại thông báo', value: '' },
				...defaults,
				...uniqueExisting.map(t => ({ title: t, value: t }))
			]
		}
	},
	watch: {
		filterCapID() {
			this.getData()
		},
		filterTypeAlert() {
			this.getData()
		}
	},
	mounted() {
		this.getData()
	},
	methods: {
		async getData() {
			try {
				const res = await fetchPromise('lms/Alert_Get', {
					NienKhoa: vueData.NienKhoa || 0,
					CapID: this.filterCapID || 0,
					TypeAlert: this.filterTypeAlert || '',
					IsAdminQuery: 1
				}, { forceRefresh: true })
				this.DS = (res ?? []).map((item, index) => ({
					...item,
					stt: index + 1
				}))
			} catch (error) {
				console.error('Lỗi khi lấy danh sách alert:', error)
			}
		},

		toDatetimeLocal(dateStr) {
			if (!dateStr) return ''
			const d = new Date(dateStr)
			if (isNaN(d.getTime())) return ''
			const year = d.getFullYear()
			const month = String(d.getMonth() + 1).padStart(2, '0')
			const day = String(d.getDate()).padStart(2, '0')
			const hours = String(d.getHours()).padStart(2, '0')
			const minutes = String(d.getMinutes()).padStart(2, '0')
			return `${year}-${month}-${day}T${hours}:${minutes}`
		},

		formatDateTime(dateStr) {
			if (!dateStr) return ''
			const d = new Date(dateStr)
			if (isNaN(d.getTime())) return ''
			const day = String(d.getDate()).padStart(2, '0')
			const month = String(d.getMonth() + 1).padStart(2, '0')
			const year = d.getFullYear()
			const hours = String(d.getHours()).padStart(2, '0')
			const minutes = String(d.getMinutes()).padStart(2, '0')
			return `${day}/${month}/${year} ${hours}:${minutes}`
		},

		getCapName(capId) {
			if (capId === 1) return 'Tiểu học'
			if (capId === 2) return 'Trung học cơ sở'
			if (capId === 3) return 'Trung học phổ thông'
			return 'Tất cả các cấp'
		},

		getCapColor(capId) {
			if (capId === 1) return 'blue'
			if (capId === 2) return 'orange'
			if (capId === 3) return 'green'
			return 'grey'
		},

		getTypeColor(type) {
			if (!type) return 'default'
			const t = type.toUpperCase()
			if (t === 'WARNING') return 'error'
			if (t === 'REMIND') return 'warning'
			if (t === 'SYSTEM') return 'purple'
			if (t === 'ALERT') return 'primary'
			return 'primary'
		},

		getUserRightName(val) {
			const map = {
				'ALL': 'Tất cả mọi người',
				'STUDENT': 'Học sinh',
				'TEACHER': 'Tất cả giáo viên',
				'1': 'GV - Chủ nhiệm',
				'2': 'GV - Bộ môn',
				'3': 'Ban Giám Hiệu',
				'5': 'Tổ trưởng',
				'9': 'System Admin'
			}
			return map[val] || val || 'Tất cả mọi người'
		},

		getUserRightColor(val) {
			const map = {
				'ALL': 'grey',
				'STUDENT': 'success',
				'TEACHER': 'info',
				'1': 'primary',
				'2': 'purple',
				'3': 'teal',
				'5': 'deep-orange',
				'9': 'error'
			}
			return map[val] || 'grey'
		},

		getTypeAlertText(value) {
			const map = {
				'ALERT': 'Thông báo',
				'WARNING': 'Cảnh báo',
				'REMIND': 'Nhắc nhở',
				'SYSTEM': 'Hệ thống'
			}
			return map[value] || value
		},

		openNew() {
			this.isEditMode = false
			this.editedItem = {
				AlertID: 0,
				TypeAlert: 'ALERT',
				ContentAlert: '',
				DateAlert: this.toDatetimeLocal(new Date()),
				CapID: this.filterCapID || 0,
				UserRight: 'ALL'
			}
			this.dialog = true
		},

		openEdit(item) {
			this.isEditMode = true
			this.editedItem = {
				AlertID: item.AlertID || 0,
				TypeAlert: item.TypeAlert || 'ALERT',
				ContentAlert: item.ContentAlert || '',
				DateAlert: this.toDatetimeLocal(item.DateAlert),
				CapID: item.CapID || 0,
				UserRight: item.UserRight || 'ALL'
			}
			this.dialog = true
		},

		async onSave() {
			if (!this.editedItem.TypeAlert) {
				this.snackbarRef.value.showSnackbar({ message: 'Vui lòng nhập hoặc chọn loại thông báo', color: 'warning' })
				return
			}
			if (!this.editedItem.ContentAlert) {
				this.snackbarRef.value.showSnackbar({ message: 'Vui lòng nhập nội dung thông báo', color: 'warning' })
				return
			}
			if (this.editedItem.ContentAlert.length > 100) {
				this.snackbarRef.value.showSnackbar({ message: 'Nội dung không được vượt quá 100 ký tự', color: 'warning' })
				return
			}
			if (!this.editedItem.DateAlert) {
				this.snackbarRef.value.showSnackbar({ message: 'Vui lòng chọn ngày thông báo', color: 'warning' })
				return
			}

			const ok = await this.confirmRef.value.show({
				title: this.isEditMode ? 'Xác nhận cập nhật thông báo?' : 'Xác nhận thêm thông báo mới?'
			})
			if (!ok) return

			const url = this.isEditMode ? 'lms/Alert_Update' : 'lms/Alert_Insert'
			const payload = {
				TypeAlert: this.editedItem.TypeAlert || '',
				ContentAlert: this.editedItem.ContentAlert || '',
				DateAlert: this.editedItem.DateAlert || '',
				CapID: this.editedItem.CapID || 0,
				NienKhoa: vueData.NienKhoa || 0,
				SYS_USERID: vueData.user.UserID || '',
				UserRight: this.editedItem.UserRight || 'ALL'
			}
			if (this.isEditMode) {
				payload.AlertID = this.editedItem.AlertID || 0
			}

			try {
				const res = await fetchPromise(url, payload, { cache: false })
				if (res) {
					this.snackbarRef.value.showSnackbar({
						message: this.isEditMode ? 'Cập nhật thành công' : 'Thêm mới thành công',
						color: 'success'
					})
					this.dialog = false
					this.getData()
				}
			} catch (error) {
				console.error('Lỗi khi lưu thông báo:', error)
			}
		},

		async onDelete(item) {
			const ok = await this.confirmRef.value.show({
				title: `Xác nhận xóa thông báo «${item.ContentAlert}»?`
			})
			if (!ok) return

			try {
				const res = await fetchPromise('lms/Alert_Delete', {
					AlertID: item.AlertID || 0,
					SYS_USERID: vueData.user.UserID || ''
				}, { cache: false })
				if (res) {
					this.snackbarRef.value.showSnackbar({
						message: 'Xóa thành công',
						color: 'success'
					})
					this.getData()
				}
			} catch (error) {
				console.error('Lỗi khi xóa thông báo:', error)
			}
		}
	}
	}
</script>