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
function tenBuoi(b) {
	return { 1: 'Sáng', 2: 'Chiều', 3: 'Tối' }[b] || ''
}
function chonTuanTKBHienTai() {
	const active = (vueData.DSTuan || []).find(x => x.Is_Active === 1)
	vueData.TuanXemTKB = active || vueData.DSTuan?.[0] || null
}
function tinhNgayDauTuanTKB() {
	const ngayBatDau = vueData.TuanXemTKB?.NgayBatDau
	if (!ngayBatDau) return ''
	// NgayBatDau dạng "2026-08-03T00:00:00" hoặc "2026-08-03"
	return String(ngayBatDau).slice(0, 10)
}
function parseTKBCell(html) {
	if (!html) return null
	const match = html.match(/<b>\s*([^<]+)<\/b>/)
	const tenLop = match ? match[1].trim() : ''
	const withoutBold = html.replace(/<b>[\s\S]*?<\/b>/, '')
	const parts = withoutBold.split('<br>').map(s => s.replace(/<[^>]+>/g, '').trim()).filter(Boolean)
	const tenMon = parts[0] || ''
	return { TenLop: tenLop, TenMon: tenMon }
}
function renderTKB() {
	const raw = vueData.TKBRaw || []
	vueData.TKBTuanInfo = (raw[0] && raw[0][0]) || null
	const lich = raw[1] || []
	const thuKeys = ['2', '3', '4', '5', '6', '7', '1']
	vueData.DSTKB = lich.map(row => {
		const cells = thuKeys.map(k => {
			const parsed = parseTKBCell(row[k])
			return { ThuKey: k, TenLop: parsed?.TenLop || '', TenMon: parsed?.TenMon || '', CoTiet: !!parsed }
		})
		return { Buoi: row.Buoi, Tiet: row.Tiet, TenBuoi: tenBuoi(row.Buoi), Cells: cells }
	})
}
function onChonTietTKB(row, cell) {
	if (!cell.CoTiet) return
	const found = (vueData.DSLop_HienThi || []).find(x => x.TenLop === cell.TenLop && x.TenMonHoc === cell.TenMon)
		|| (vueData.DSLop_HienThi || []).find(x => x.TenLop === cell.TenLop)
	if (found) {
		vueData.LopItem = found
	} else {
		showModuleSnackbarDKLT(`Không tìm thấy lớp "${cell.TenLop}" trong danh sách lớp bạn dạy — vui lòng chọn tay`, 'warning')
	}
	vueData.Buoi = row.Buoi
	vueData.TietBatDau = row.Tiet
	vueData.TietKetThuc = row.Tiet
	const tuNgay = vueData.TKBTuanInfo?.TuNgay // "dd/mm/yyyy", là Thứ 2 của tuần
	if (tuNgay) {
		const [d, m, y] = tuNgay.split('/').map(Number)
		const base = new Date(y, m - 1, d)
		const offsetMap = { '2': 0, '3': 1, '4': 2, '5': 3, '6': 4, '7': 5, '1': 6 }
		base.setDate(base.getDate() + (offsetMap[cell.ThuKey] ?? 0))
		const pad = n => String(n).padStart(2, '0')
		vueData.NgayApDung = `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`
	}
	showModuleSnackbarDKLT(`Đã điền: Lớp ${cell.TenLop}${cell.TenMon ? ' - ' + cell.TenMon : ''}, ${tenBuoi(row.Buoi)} tiết ${row.Tiet}`, 'success')
}
function initHocSinhThietBi() {
	vueData.HocSinhThietBi = (vueData.DSHocSinhLop || []).map(hs => ({
		HocSinhID: hs.HocSinhID,
		HoTen: hs.HoTen,
		IsChon: true,
		ThietBiChon: ['Laptop']
	}))
}
function chonTatCaHocSinh() {
	(vueData.HocSinhThietBi || []).forEach(x => { x.IsChon = true })
}
function boChonTatCaHocSinh() {
	(vueData.HocSinhThietBi || []).forEach(x => { x.IsChon = false })
}
function toggleChonHocSinh(hs) {
	hs.IsChon = !hs.IsChon
}
function toggleThietBi(hs, loai) {
	const idx = hs.ThietBiChon.indexOf(loai)
	if (idx > -1) hs.ThietBiChon.splice(idx, 1)
	else hs.ThietBiChon.push(loai)
}
function renderDSDangKy() {
	vueData.DSDangKy = (vueData.DSDangKy || []).map(x => ({
		...x,
		ThuHienThi: tenThu(x.Thu),
		BuoiHienThi: tenBuoi(x.Buoi),
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
	const dsChon = (vueData.HocSinhThietBi || []).filter(x => x.IsChon)
	if (!dsChon.length) {
		showModuleSnackbarDKLT('Vui lòng chọn ít nhất 1 học sinh', 'warning')
		return
	}
	const chuaChonThietBi = dsChon.find(x => !x.ThietBiChon || !x.ThietBiChon.length)
	if (chuaChonThietBi) {
		showModuleSnackbarDKLT(`Học sinh "${chuaChonThietBi.HoTen}" chưa chọn thiết bị nào`, 'warning')
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
		const jsonHocSinh = dsChon.map(x => ({ HocSinhID: x.HocSinhID, HoTen: x.HoTen, LoaiThietBi: x.ThietBiChon.join(',') }))
		await ajaxCALLPromise('lms/DangKyMangLaptop_Ins_JSON', {
			LopID: vueData.LopItem.LopID,
			TenLop: vueData.LopItem.TenLop,
			KhoiID: vueData.LopItem.KhoiID,
			MonHocID: vueData.LopItem.MonHocID,
			TenMonHoc: vueData.LopItem.TenMonHoc,
			Thu: thu,
			Buoi: Number(vueData.Buoi),
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
		initHocSinhThietBi()
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
vueData.initHocSinhThietBi = initHocSinhThietBi
vueData.toggleThietBi = toggleThietBi
vueData.chonTuanTKBHienTai = chonTuanTKBHienTai
vueData.tinhNgayDauTuanTKB = tinhNgayDauTuanTKB
vueData.renderTKB = renderTKB
vueData.onChonTietTKB = onChonTietTKB
vueData.chonTatCaHocSinh = chonTatCaHocSinh
vueData.boChonTatCaHocSinh = boChonTatCaHocSinh
vueData.toggleChonHocSinh = toggleChonHocSinh