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
function tenBuoi(b) {
	return { 1: 'Sáng', 2: 'Chiều', 3: 'Tối' }[b] || ''
}
function chonTuanHienTai() {
	const active = (vueData.DSTuan || []).find(x => x.Is_Active === 1)
	vueData.TuanItem = active || vueData.DSTuan?.[0] || null
}
function formatThoiGianDangKy(t) {
	if (!t) return ''
	const d = new Date(t)
	const pad = n => String(n).padStart(2, '0')
	return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
}
function renderDSDangKy() {
	vueData.DSDangKy = (vueData.DSDangKy || []).map(x => ({
		...x,
		ThuHienThi: tenThu(x.Thu),
		BuoiHienThi: tenBuoi(x.Buoi),
		TietHienThi: x.TietBatDau + '-' + x.TietKetThuc,
		ThoiGianDangKyHienThi: formatThoiGianDangKy(x.CreateTime)
	}))
	nhomTheoNgay()
}
function nhomTheoNgay() {
	const map = new Map()
	;(vueData.DSDangKy || []).forEach(x => {
		const key = x.LopID + '_' + x.NgayApDung
		if (!map.has(key)) {
			map.set(key, {
				LopID: x.LopID,
				TenLop: x.TenLop,
				NgayApDung: x.NgayApDung,
				ThuHienThi: x.ThuHienThi,
				DSLuot: [],
				TongLuot: 0,
				TongHocSinh: 0,
				DaThongBaoHet: true,
				dangDanhDau: false
			})
		}
		const nhom = map.get(key)
		nhom.DSLuot.push(x)
		nhom.TongLuot++
		nhom.TongHocSinh += (x.SoHocSinh || 0)
		if (!x.IsDaThongBaoPH) nhom.DaThongBaoHet = false
	})
	vueData.DSNhomNgay = Array.from(map.values()).sort((a, b) => new Date(b.NgayApDung) - new Date(a.NgayApDung))
}
async function danhDauDaThongBaoPH(nhom) {
	nhom.dangDanhDau = true
	try {
		await ajaxCALLPromise('lms/DangKyMangLaptop_ThongBaoPH_MarkDone', { LopID: nhom.LopID, NgayApDung: nhom.NgayApDung })
		nhom.DaThongBaoHet = true
		nhom.DSLuot.forEach(x => { x.IsDaThongBaoPH = true })
		showModuleSnackbarGVCN('Đã đánh dấu thông báo phụ huynh', 'success')
	} catch (error) {
		showModuleSnackbarGVCN('Cập nhật thất bại: ' + (error?.message || ''), 'error')
	} finally {
		nhom.dangDanhDau = false
	}
}
function taoNoiDungThongBaoNhomMacDinh(nhom) {
	const ngay = nhom.NgayApDung ? new Date(nhom.NgayApDung).toLocaleDateString('vi-VN') : ''
	const dsLuotText = nhom.DSLuot.map(l => `- ${l.BuoiHienThi} tiết ${l.TietHienThi}, môn ${l.TenMonHoc} (GVBM: ${l.TenGiaoVienDangKy}), thiết bị: ${l.LoaiThietBi}`).join('\n')
	return `Kính gửi Quý phụ huynh,\n\n`
		+ `Nhà trường thông báo: con em thuộc lớp ${nhom.TenLop} được phép mang thiết bị điện tử đến trường vào ${nhom.ThuHienThi}, ngày ${ngay}, cụ thể:\n`
		+ `${dsLuotText}\n\n`
		+ `Kính mong Quý phụ huynh phối hợp nhắc nhở con em sử dụng thiết bị đúng mục đích học tập.\n\n`
		+ `Trân trọng,\nGVCN`
}
async function moDialogThongBaoNhom(nhom) {
	vueData.NhomDangThongBao = nhom
	vueData.isLoadingHocSinhThongBaoNhom = true
	vueData.IsShowDialogThongBaoPH = true
	vueData.NoiDungThongBaoPH = taoNoiDungThongBaoNhomMacDinh(nhom)
	try {
		const ketQua = await Promise.all(nhom.DSLuot.map(l => ajaxCALLPromise('lms/DangKyMangLaptop_HocSinh_Get', { DangKyID: l.DangKyID })))
		const map = new Map()
		;(ketQua.flat().filter(Boolean)).forEach(hs => { map.set(hs.HocSinhID, hs) })
		vueData.DSHocSinhThongBaoNhom = Array.from(map.values())
	} catch (error) {
		showModuleSnackbarGVCN('Không tải được danh sách học sinh: ' + (error?.message || ''), 'error')
		vueData.DSHocSinhThongBaoNhom = []
	} finally {
		vueData.isLoadingHocSinhThongBaoNhom = false
	}
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
// MOCK: chưa có API ME Messenger thật - giả lập độ trễ mạng, luôn thành công.
// TODO: thay bằng lời gọi ME Messenger API thật khi nhà trường cung cấp endpoint (gửi 1 lượt tới nhóm PH của lớp).
async function ajaxCALL_MeMessenger_Mock(payload) {
	console.log('[MOCK ME Messenger] Gửi thông báo nhóm:', payload)
	await new Promise(r => setTimeout(r, 700))
	return { success: true }
}
async function guiThongBaoNhom() {
	const nhom = vueData.NhomDangThongBao
	if (!nhom) return
	vueData.isDangGuiThongBaoPH = true
	try {
		await ajaxCALL_MeMessenger_Mock({
			LopID: nhom.LopID,
			TenLop: nhom.TenLop,
			NgayApDung: nhom.NgayApDung,
			DanhSachHocSinhID: (vueData.DSHocSinhThongBaoNhom || []).map(hs => hs.HocSinhID),
			NoiDung: vueData.NoiDungThongBaoPH
		})
		await ajaxCALLPromise('lms/DangKyMangLaptop_ThongBaoPH_MarkDone', { LopID: nhom.LopID, NgayApDung: nhom.NgayApDung })
		nhom.DaThongBaoHet = true
		nhom.DSLuot.forEach(x => { x.IsDaThongBaoPH = true })
		showModuleSnackbarGVCN(`Đã gửi thông báo cho ${(vueData.DSHocSinhThongBaoNhom || []).length} phụ huynh (mô phỏng - chưa nối API thật)`, 'success')
		vueData.IsShowDialogThongBaoPH = false
	} catch (error) {
		showModuleSnackbarGVCN('Gửi thất bại: ' + (error?.message || ''), 'error')
	} finally {
		vueData.isDangGuiThongBaoPH = false
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
vueData.danhDauDaThongBaoPH = danhDauDaThongBaoPH
vueData.moDialogThongBaoNhom = moDialogThongBaoNhom
vueData.guiThongBaoNhom = guiThongBaoNhom