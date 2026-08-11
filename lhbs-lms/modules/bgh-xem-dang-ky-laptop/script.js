function tenThu(thu) {
	if (thu === 8) return 'CN'
	return 'Thứ ' + thu
}
function formatNgay(ngayStr) {
	if (!ngayStr) return ''
	const d = new Date(ngayStr)
	const pad = n => String(n).padStart(2, '0')
	return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}
function renderDSDangKy() {
	vueData.DSDangKy = (vueData.DSDangKy || []).map(x => ({
		...x,
		ThuHienThi: tenThu(x.Thu),
		TietHienThi: x.TietBatDau + '-' + x.TietKetThuc,
		NgayApDungHienThi: formatNgay(x.NgayApDung),
		TreHanHienThi: x.IsTreHan ? 'Trễ hạn' : ''
	}))
}
function onExportExcel() {
	if (!vueData.DSDangKy || !vueData.DSDangKy.length) return
	vueData.isLoadingExcel = true
	try {
		const headerRow = vueData.headersDangKy.map(h => h.text)
		const keys = vueData.headersDangKy.map(h => h.value)
		const dataRows = vueData.DSDangKy.map(x => keys.map(k => x[k] != null ? x[k] : ''))
		const aoa = [headerRow, ...dataRows]
		const worksheet = XLSX.utils.aoa_to_sheet(aoa)
		const workbook = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(workbook, worksheet, 'DangKyLaptop')
		XLSX.writeFile(workbook, `DangKyMangLaptop_${vueData.NienKhoa}.xlsx`)
	} finally {
		vueData.isLoadingExcel = false
	}
}
vueData.renderDSDangKy = renderDSDangKy
vueData.onExportExcel = onExportExcel