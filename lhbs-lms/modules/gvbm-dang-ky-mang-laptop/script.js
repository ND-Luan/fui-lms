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
		const tenMonHoc = x.TenMonHoc_HienThi || x.TenMonHoc || x.MonHocName || x.MonHocName_HienThi || ''
		out.push({
			LopID: lopID,
			MonHocID: monHocID,
			// GiaoVienLop_Get_By_GiaoVienID trả về lớp thường từ tblLop và
			// lớp nhóm từ tblNhom. Giữ nguyên các khóa nhận diện để không
			// biến lớp thường thành lớp nhóm chỉ vì trùng tên hiển thị.
			NhomID: x.NhomID ?? x.LopNhomID ?? x.NhomLopID ?? null,
			LoaiLop: x.LoaiLop ?? x.Loai ?? x.IsLopNhom ?? null,
			TenLop: x.TenLop || '',
			KhoiID: x.KhoiID,
			TenMonHoc: tenMonHoc,
			TenHienThi: (x.TenLop || '') + (tenMonHoc ? ' - ' + tenMonHoc : '')
		})
	})
	// Lớp chủ nhiệm (tiết Sinh hoạt): TKB hiển thị tên lớp gốc (vd "11B"), khác với các
	// lớp-nhóm theo tổ hợp môn ở trên (vd "11B1"/"11B2") nên phải nạp riêng từ tblLop.GVCN.
	;(vueData.DSLopChuNhiem || []).forEach(x => {
		const lopID = x.LopID
		if (!lopID) return
		const key = lopID + '_CN'
		if (seen.has(key)) return
		seen.add(key)
		out.push({
			LopID: lopID,
			MonHocID: 0,
			TenLop: x.TenLop || '',
			KhoiID: x.KhoiID,
			TenMonHoc: 'Sinh hoạt',
			TenHienThi: (x.TenLop || '') + ' - Sinh hoạt (Chủ nhiệm)'
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
	const boldText = match ? match[1].trim() : ''
	const withoutBold = html.replace(/<b>[\s\S]*?<\/b>/, '')
	const parts = withoutBold.split('<br>').map(s => s.replace(/<[^>]+>/g, '').trim()).filter(Boolean)
	// TKB quansinh có 2 dạng: <b>Lớp</b><br>Môn và
	// <b>Lớp - Môn</b>. Chuẩn hóa cả hai để tra đúng tblLop/tblNhom.
	const inlineParts = boldText.split(/\s+-\s+/)
	const tenLop = inlineParts[0] || boldText
	const tenMon = parts[0] || inlineParts.slice(1).join(' - ')
	return { TenLop: tenLop, TenMon: tenMon }
}
function renderTKB() {
	const raw = vueData.TKBRaw || []
	vueData.TKBTuanInfo = (raw[0] && raw[0][0]) || null
	const lich = raw[1] || []
	const thuKeys = ['2', '3', '4', '5', '6', '7', '1']
	vueData.DSTKB = lich
		.filter(row => row.Buoi !== 3) // ẩn buổi Tối - trường chưa có lớp học tối
		.map(row => {
			const cells = thuKeys.map(k => {
				const parsed = parseTKBCell(row[k])
				return { ThuKey: k, TenLop: parsed?.TenLop || '', TenMon: parsed?.TenMon || '', CoTiet: !!parsed }
			})
			return { Buoi: row.Buoi, Tiet: row.Tiet, TenBuoi: tenBuoi(row.Buoi), Cells: cells }
		})
	danhDauDaDangKyTKB()
}
// Đánh dấu các ô TKB trùng với đăng ký đã lưu (lớp + ngày + buổi + tiết) để hiện icon/màu riêng.
function danhDauDaDangKyTKB() {
	const dsDangKy = vueData.DSDangKy || []
	;(vueData.DSTKB || []).forEach(row => {
		row.Cells.forEach(cell => {
			if (!cell.CoTiet) {
				cell.IsDaDangKy = false
				return
			}
			const ngayCell = tinhNgayTuThuKey(cell.ThuKey)
			cell.IsDaDangKy = dsDangKy.some(dk =>
				dk.TenLop === cell.TenLop &&
				dk.Buoi === row.Buoi &&
				dk.TietBatDau <= row.Tiet && dk.TietKetThuc >= row.Tiet &&
				String(dk.NgayApDung || '').slice(0, 10) === ngayCell
			)
		})
	})
	vueData.DSTKB = [...vueData.DSTKB]
}
function keyTKB(row, cell) {
	return row.Buoi + '_' + row.Tiet + '_' + cell.ThuKey
}
function tinhNgayTuThuKey(thuKey) {
	const tuNgay = vueData.TKBTuanInfo?.TuNgay // "dd/mm/yyyy", là Thứ 2 của tuần
	if (!tuNgay) return null
	const [d, m, y] = tuNgay.split('/').map(Number)
	const base = new Date(y, m - 1, d)
	const offsetMap = { '2': 0, '3': 1, '4': 2, '5': 3, '6': 4, '7': 5, '1': 6 }
	base.setDate(base.getDate() + (offsetMap[thuKey] ?? 0))
	const pad = n => String(n).padStart(2, '0')
	return `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`
}
function normalizeLookupText(value) {
	let text = String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, ' va ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')
	const aliases = {
		'gd kt va pl': 'giao duc kinh te va phap luat',
		'gdkt va pl': 'giao duc kinh te va phap luat',
		'gdcd': 'giao duc cong dan',
		'hd trai nghiem': 'hoat dong trai nghiem'
	}
	Object.keys(aliases).forEach(key => {
		text = text.replace(new RegExp('(^| )' + key + '(?= |$)', 'g'), '$1' + aliases[key])
	})
	return text.replace(/\s+/g, ' ').trim()
}
function scoreSubjectMatch(source, candidate) {
	const sourceTokens = new Set(normalizeLookupText(source).split(' ').filter(Boolean))
	const candidateTokens = new Set(normalizeLookupText(candidate).split(' ').filter(Boolean))
	let score = 0
	sourceTokens.forEach(token => {
		if (candidateTokens.has(token)) score += token.length >= 2 ? 2 : 1
	})
	return score
}
function dienFormTuTiet(item) {
	const tenLop = normalizeLookupText(item.TenLop)
	const tenMon = normalizeLookupText(item.TenMon)
	const candidates = (vueData.DSLop_HienThi || []).filter(x => normalizeLookupText(x.TenLop) === tenLop)
	const exactCandidates = candidates.filter(x => normalizeLookupText(x.TenMonHoc) === tenMon)
	const exact = exactCandidates.find(x => !x.NhomID && !x.IsLopNhom && !x.LoaiLop) || exactCandidates[0]
	const scored = candidates.map(x => ({ item: x, score: scoreSubjectMatch(tenMon, x.TenMonHoc) })).sort((a, b) => b.score - a.score)
	const bestScore = scored[0]?.score || 0
	const bestMatches = scored.filter(x => x.score === bestScore && x.score > 0)
	// Khi TKB là lớp thường (tblLop), ưu tiên bản ghi không có NhomID.
	// Chỉ yêu cầu chọn lớp nhóm khi thực sự có nhiều bản ghi cùng môn.
	const normalCandidates = candidates.filter(x => !x.NhomID && !x.IsLopNhom && !x.LoaiLop)
	// Tạm thời không chặn luồng đăng ký khi API trả nhiều bản ghi lớp nhóm.
	// Ưu tiên lớp thường; nếu chưa có metadata phân biệt tblLop/tblNhom thì
	// dùng bản ghi đầu tiên để giáo viên vẫn thao tác được.
	const found = exact || (bestMatches.length === 1 ? bestMatches[0].item :
		(normalCandidates[0] || candidates[0] || null))
	if (found) {
		vueData.LopItem = found
	} else {
		const message = `Không tìm thấy lớp "${item.TenLop}" trong danh sách lớp bạn dạy — vui lòng chọn tay`
		showModuleSnackbarDKLT(message, 'warning')
		return false
	}
	vueData.Buoi = item.Buoi
	vueData.TietBatDau = item.Tiet
	vueData.TietKetThuc = item.Tiet
	vueData.NgayApDung = item.NgayApDung
	vueData.TKBKeyDangChon = item.key
	return true
}
function onChonTietTKB(row, cell) {
	if (!cell.CoTiet) return false
	if (cell.IsDaDangKy) {
		showModuleSnackbarDKLT('Tiết này đã được đăng ký, không thể đăng ký lại', 'warning')
		return false
	}
	if (cell.IsBiTrungLich) {
		showModuleSnackbarDKLT('Tiết này đã có đăng ký trùng lịch', 'warning')
		return false
	}
	const key = keyTKB(row, cell)
	const daCo = (vueData.TKBQueue || []).find(x => x.key === key)
	if (daCo) {
		return dienFormTuTiet(daCo)
	}
	const item = {
		key,
		Buoi: row.Buoi,
		Tiet: row.Tiet,
		ThuKey: cell.ThuKey,
		TenLop: cell.TenLop,
		TenMon: cell.TenMon,
		NgayApDung: tinhNgayTuThuKey(cell.ThuKey)
	}
	vueData.TKBQueue = [...(vueData.TKBQueue || []), item]
	if (!dienFormTuTiet(item)) {
		vueData.TKBQueue = (vueData.TKBQueue || []).filter(x => x.key !== key)
		return false
	}
	return true
}
function isTietDaChon(row, cell) {
	const key = keyTKB(row, cell)
	return (vueData.TKBQueue || []).some(x => x.key === key)
}
function boChonTietTKB(item) {
	vueData.TKBQueue = (vueData.TKBQueue || []).filter(x => x.key !== item.key)
	if (vueData.TKBKeyDangChon === item.key) vueData.TKBKeyDangChon = null
}
function initHocSinhThietBi() {
	vueData.HocSinhThietBi = (vueData.DSHocSinhLop || []).map(hs => ({
		HocSinhID: hs.HocSinhID,
		SoDanhBo: hs.SoDanhBo,
		HoTen: hs.HoTen,
		IsChon: true,
		GhiChu: '',
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
function isCotThietBiChonHet(loai) {
	const list = vueData.HocSinhThietBi || []
	return list.length > 0 && list.every(x => x.ThietBiChon.includes(loai))
}
function toggleCotThietBi(loai) {
	const list = vueData.HocSinhThietBi || []
	const chonHet = isCotThietBiChonHet(loai)
	list.forEach(x => {
		const idx = x.ThietBiChon.indexOf(loai)
		if (chonHet) {
			if (idx > -1) x.ThietBiChon.splice(idx, 1)
		} else {
			if (idx === -1) x.ThietBiChon.push(loai)
		}
	})
}
function toggleThietBi(hs, loai) {
	const idx = hs.ThietBiChon.indexOf(loai)
	if (idx > -1) hs.ThietBiChon.splice(idx, 1)
	else hs.ThietBiChon.push(loai)
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
		BuoiHienThi: tenBuoi(x.Buoi),
		TietHienThi: x.TietBatDau + '-' + x.TietKetThuc,
		NgayApDungHienThi: formatNgay(x.NgayApDung),
		TreHanHienThi: x.IsTreHan ? 'Trễ hạn' : ''
	}))
	danhDauDaDangKyTKB()
}
function danhDauTietBiTrungLich() {
	const key = vueData.TKBKeyDangChon
	if (!key) return
	const parts = String(key).split('_')
	const buoi = Number(parts[0])
	const tiet = Number(parts[1])
	const thuKey = parts[2]
	;(vueData.DSTKB || []).forEach(row => {
		if (row.Buoi !== buoi || row.Tiet !== tiet) return
		;(row.Cells || []).forEach(cell => {
			if (cell.ThuKey === thuKey) cell.IsBiTrungLich = true
		})
	})
	vueData.DSTKB = [...(vueData.DSTKB || [])]
	vueData.TKBQueue = (vueData.TKBQueue || []).filter(item => item.key !== key)
	vueData.TKBKeyDangChon = null
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
		const jsonHocSinh = dsChon.map(x => ({
			HocSinhID: x.HocSinhID,
			HoTen: x.HoTen,
			LoaiThietBi: x.ThietBiChon.join(','),
			GhiChu: x.GhiChu || ''
		}))
		await fetchPromise('lms/DangKyMangLaptop_Ins_JSON', {
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
		}, { cache: false })
		showModuleSnackbarDKLT('Đăng ký thành công' + (isTreHan ? ' (đã trễ hạn quy định)' : ''), 'success')
		if (vueData.TKBKeyDangChon) {
			vueData.TKBQueue = (vueData.TKBQueue || []).filter(x => x.key !== vueData.TKBKeyDangChon)
			vueData.TKBKeyDangChon = null
		}
		initHocSinhThietBi()
		vueData.GhiChu = ''
		vueData.NgayApDung = null
		await fetchPromise('lms/DangKyMangLaptop_Get', {
			NienKhoa: vueData.NienKhoa, TuanHocID: 0, LopID: vueData.LopItem.LopID, KhoiID: 0, ViewMode: 'GVBM'
		}, { cache: false }).then(res => {
			vueData.DSDangKy = res || []
			renderDSDangKy()
		})
	} catch (error) {
		const errorText = String(error?.message || error || '')
		if (/trùng buổi|đã có đăng ký trùng|đã đăng ký trùng/i.test(errorText)) danhDauTietBiTrungLich()
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
vueData.boChonTietTKB = boChonTietTKB
vueData.dienFormTuTiet = dienFormTuTiet
vueData.isTietDaChon = isTietDaChon
vueData.chonTatCaHocSinh = chonTatCaHocSinh
vueData.boChonTatCaHocSinh = boChonTatCaHocSinh
vueData.toggleChonHocSinh = toggleChonHocSinh
vueData.isCotThietBiChonHet = isCotThietBiChonHet
vueData.toggleCotThietBi = toggleCotThietBi