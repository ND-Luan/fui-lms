function showModuleSnackbarDKLT(message, color = 'warning') {
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
function renderDSLop() {
	const seen = new Set()
	const out = []
	;(vueData.DSLop || []).forEach(x => {
		const lopID = x.LopID
		const monHocID = x.MonHocID
		if (!lopID) return
		const key = lopID + '_' + monHocID
		if (seen.has(key)) return
		seen.add(key)
		const tenMonHoc = x.TenMonHoc_HienThi || x.MonHocName || ''
		out.push({
			LopID: lopID,
			MonHocID: monHocID,
			TenLop: x.TenLop || '',
			KhoiID: x.KhoiID,
			TenMonHoc: tenMonHoc,
			TenHienThi: (x.TenLop || '') + (tenMonHoc ? ' - ' + tenMonHoc : '')
		})
	})
	out.sort((a, b) => String(a.TenLop).localeCompare(String(b.TenLop)))
	vueData.DSLop_HienThi = out
}
function getThu(dateStr) {
	if (!dateStr) return null
	const d = new Date(dateStr)
	const dow = d.getDay() // 0=CN,1=T2,...6=T7
	return dow === 0 ? 8 : dow + 1 // 2..7 = Thứ 2..7, 8 = Chủ nhật
}
function tenThu(thu) {
	if (thu === 8) return 'CN'
	return 'Thứ ' + thu
}
function computeDeadline(ngayApDung, thu) {
	const d = new Date(ngayApDung)
	const dow = d.getDay()
	const diffToMonday = dow === 0 ? -6 : 1 - dow
	const monday = new Date(d)
	monday.setDate(d.getDate() + diffToMonday)
	if (thu === 2) {
		const sunday = new Date(monday)
		sunday.setDate(monday.getDate() - 1)
		sunday.setHours(12, 0, 0, 0)
		return sunday
	}
	monday.setHours(8, 0, 0, 0)
	return monday
}
function canhBaoTreHan() {
	if (!vueData.NgayApDung) return false
	const thu = getThu(vueData.NgayApDung)
	if (!thu) return false
	const deadline = computeDeadline(vueData.NgayApDung, thu)
	return new Date() > deadline
}
function renderDSDangKy() {
	vueData.DSDangKy = (vueData.DSDangKy || []).map(x => ({
		...x,
		ThuHienThi: tenThu(x.Thu),
		TietHienThi: x.TietBatDau + '-' + x.TietKetThuc
	}))
}
async function onSubmitDangKy() {
	if (!vueData.LopItem?.LopID) {
		showModuleSnackbarDKLT('Vui lòng chọn lớp', 'warning')
		return
	}
	if (!vueData.NgayApDung) {
		showModuleSnackbarDKLT('Vui lòng chọn ngày áp dụng', 'warning')
		return
	}
	if (!vueData.HocSinhSelected || !vueData.HocSinhSelected.length) {
		showModuleSnackbarDKLT('Vui lòng chọn ít nhất 1 học sinh', 'warning')
		return
	}
	if (Number(vueData.TietKetThuc) < Number(vueData.TietBatDau)) {
		showModuleSnackbarDKLT('Tiết kết thúc phải >= tiết bắt đầu', 'warning')
		return
	}
	vueData.isLoadingSave = true
	try {
		const thu = getThu(vueData.NgayApDung)
		const isTreHan = canhBaoTreHan()
		const jsonHocSinh = vueData.HocSinhSelected.map(x => ({ HocSinhID: x.HocSinhID, HoTen: x.HoTen }))
		await ajaxCALLPromise('lms/DangKyMangLaptop_Ins_JSON', {
			LopID: vueData.LopItem.LopID,
			TenLop: vueData.LopItem.TenLop,
			KhoiID: vueData.LopItem.KhoiID,
			MonHocID: vueData.LopItem.MonHocID,
			TenMonHoc: vueData.LopItem.TenMonHoc,
			LoaiThietBi: vueData.LoaiThietBi || 'Laptop',
			Thu: thu,
			TietBatDau: Number(vueData.TietBatDau),
			TietKetThuc: Number(vueData.TietKetThuc),
			NgayApDung: vueData.NgayApDung,
			TuanHocID: 0,
			NienKhoa: vueData.NienKhoa,
			HocKy: vueData.Semester?.value || 1,
			GhiChu: vueData.GhiChu || '',
			IsTreHan: isTreHan,
			JsonHocSinh: JSON.stringify(jsonHocSinh),
			TenGiaoVienDangKy: vueData.user?.HoTen || vueData.user?.UserName || ''
		})
		showModuleSnackbarDKLT('Đăng ký thành công' + (isTreHan ? ' (đã trễ hạn quy định)' : ''), 'success')
		vueData.HocSinhSelected = []
		vueData.GhiChu = ''
		vueData.NgayApDung = null
		await ajaxCALLPromise('lms/DangKyMangLaptop_Get', {
			NienKhoa: vueData.NienKhoa, TuanHocID: 0, LopID: vueData.LopItem.LopID, KhoiID: 0, ViewMode: 'GVBM'
		}).then(res => {
			vueData.DSDangKy = res || []
			renderDSDangKy()
		})
	} catch (error) {
		showModuleSnackbarDKLT('Đăng ký thất bại: ' + (error?.message || ''), 'error')
	} finally {
		vueData.isLoadingSave = false
	}
}
vueData.renderDSLop = renderDSLop
vueData.renderDSDangKy = renderDSDangKy
vueData.canhBaoTreHan = canhBaoTreHan
vueData.onSubmitDangKy = onSubmitDangKy
vueData.submitDangKy = onSubmitDangKy