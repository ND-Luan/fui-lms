function showModuleSnackbarGVCN(message, color = 'warning') {
	if (vueData.snackbarRef?.value?.showSnackbar) {
		vueData.snackbarRef.value.showSnackbar({ message, color })
		return
	}
	if (window.Vue && Vue.$toast) {
		if (color === 'success') return Vue.$toast.success(message, { position: 'top' })
		if (color === 'error') return Vue.$toast.error(message, { position: 'top' })
		return Vue.$toast.warning(message, { position: 'top' })
	}
	alert(message)
}
function tenThu(thu) {
	if (thu === 8) return 'CN'
	return 'Thứ ' + thu
}
function chonTuanHienTai() {
	const active = (vueData.DSTuan || []).find(x => x.Is_Active === 1)
	vueData.TuanItem = active || vueData.DSTuan?.[0] || null
}
function renderDSDangKy() {
	vueData.DSDangKy = (vueData.DSDangKy || []).map(x => ({
		...x,
		ThuHienThi: tenThu(x.Thu),
		TietHienThi: x.TietBatDau + '-' + x.TietKetThuc
	}))
}
async function onXemChiTiet(item) {
	vueData.DangKyDangXem = item
	vueData.isLoadingChiTiet = true
	try {
		const res = await ajaxCALLPromise('lms/DangKyMangLaptop_HocSinh_Get', { DangKyID: item.DangKyID })
		vueData.DSHocSinhChiTiet = res || []
		vueData.IsShowDialogChiTiet = true
	} catch (error) {
		showModuleSnackbarGVCN('Không tải được chi tiết: ' + (error?.message || ''), 'error')
	} finally {
		vueData.isLoadingChiTiet = false
	}
}
async function danhDauViPham(hs) {
	const newValue = !hs.IsViPham
	try {
		await ajaxCALLPromise('lms/DangKyMangLaptop_DanhDauViPham', {
			DangKyHocSinhID: hs.DangKyHocSinhID,
			IsViPham: newValue,
			GhiChuViPham: hs.GhiChuViPham || ''
		})
		hs.IsViPham = newValue
		showModuleSnackbarGVCN(newValue ? 'Đã ghi nhận vi phạm' : 'Đã bỏ đánh dấu vi phạm', 'success')
	} catch (error) {
		showModuleSnackbarGVCN('Cập nhật thất bại: ' + (error?.message || ''), 'error')
	}
}
async function markReadThongBao(tb) {
	if (tb.IsRead) return
	tb.IsRead = true
	try {
		await ajaxCALLPromise('lms/DangKyMangLaptop_ThongBao_MarkRead', { ThongBaoID: tb.ThongBaoID })
	} catch (error) {
		// im lặng - không chặn UI vì đây chỉ là đánh dấu đã đọc
	}
}
vueData.chonTuanHienTai = chonTuanHienTai
vueData.renderDSDangKy = renderDSDangKy
vueData.onXemChiTiet = onXemChiTiet
vueData.danhDauViPham = danhDauViPham
vueData.markReadThongBao = markReadThongBao