<template>
	<!-- <Global>
		<div class="d-flex flex-wrap ga-2 pa-4">
			<v-btn @click="openPage">Mở trang</v-btn>
			<v-btn color="primary" @click="testConfirm">confirm (Promise)</v-btn>
			<v-btn color="warning" @click="testWarning">warning (callback)</v-btn>
			<v-btn color="info" @click="testAlert">alert (chỉ OK)</v-btn>
			<v-btn color="secondary" @click="testInfo">info</v-btn>
		</div>
		<div v-if="lastResult !== null" class="pa-4">
			Kết quả: <strong>{{ lastResult }}</strong>
		</div>
		<GlobalDataTable :headers :items />
	</Global> -->

	<v-btn @click="isOpen=true" />
	<uc-dialog-1 v-model="isOpen" />
</template>

<script>
	export default {
		inject: ['iframeRef', 'confirmRef'],
		data() {
			return {
				headers: [{ title: "xxx", value: "xxx" }],
				items: [{ xxx: "Nooijk dung 1" }],
				lastResult: null,
				isOpen: false
			}
		},
		methods: {
			openPage() {
				this.iframeRef.value?.openWindow({
					title: 'Google',
					url: '/nhap-diem?capid=1',
					icon: 'mdi-google',
					onclose: () => console.log('đã đóng'),
				})
			},
			_confirm() {
				if (!this.confirmRef?.value?.show) {
					console.error('GlobalConfirmDialog chưa được đăng ký — thử hard reload (Ctrl+Shift+R)')
					return null
				}
				return this.confirmRef.value
			},
			async testConfirm() {
				const dlg = this._confirm(); if (!dlg) return
				const ok = await dlg.show({
					title: 'Xác nhận thao tác?',
					text: 'Bạn có chắc chắn muốn tiếp tục không?',
					type: 'confirm',
				})
				this.lastResult = ok ? 'Đã xác nhận ✓' : 'Đã huỷ ✗'
			},
			testWarning() {
				const dlg = this._confirm(); if (!dlg) return
				const $this = this
				dlg.show({
					title: 'Cảnh báo xoá dữ liệu!',
					text: 'Hành động này không thể hoàn tác.',
					type: 'warning',
					confirmText: 'Xoá',
					action() {
						$this.lastResult = 'Đã xoá (callback) ✓'
					},
					cancel() {
						$this.lastResult = 'Huỷ xoá ✗'
					},
				})
			},
			async testAlert() {
				const dlg = this._confirm(); if (!dlg) return
				await dlg.show({
					title: 'Thông báo',
					text: 'Lưu dữ liệu thành công.',
					type: 'alert',
				})
				this.lastResult = 'Đã đóng alert'
			},
			async testInfo() {
				const dlg = this._confirm(); if (!dlg) return
				const ok = await dlg.show({
					title: 'Thông tin',
					text: 'Có cập nhật mới từ hệ thống.',
					type: 'info',
				})
				this.lastResult = ok ? 'Xác nhận info ✓' : 'Đóng info ✗'
			},
		},
	}
</script>