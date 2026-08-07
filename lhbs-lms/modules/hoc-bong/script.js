function showModuleSnackbarHB(message, color = 'warning') {
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
function renderDSHocBong() {
	vueData.columnHeader = [
		{ title: 'STT', name: 'STT', width: 50, readOnly: true },
		{ title: 'Mã HS', name: 'HocSinhID', width: 90, readOnly: true },
		{ title: 'Họ và tên', name: 'HoTen', width: 220, readOnly: true, align: 'left' },
		{ title: 'Lớp', name: 'TenLop', width: 70, readOnly: true },
		{ title: 'Khối', name: 'KhoiID', width: 60, readOnly: true },
		{ title: 'Mức học bổng', name: 'MucHocBong', width: 200 },
		{ title: 'Nhóm (VI)', name: 'TieuChi_VI', width: 340 },
		{ title: 'Nhóm (EN)', name: 'TieuChi_EN', width: 340 },
		{ title: 'Số quyết định', name: 'SoQuyetDinh', width: 110 },
		{ title: 'Vào sổ (STT)', name: 'VaoSo', width: 100, type: 'numeric' },
		{ title: 'Ngày cấp (VI)', name: 'NgayCap_VI', width: 200 },
		{ title: 'Ngày cấp (EN)', name: 'NgayCap_EN', width: 160 },
		{ title: 'Đã in', name: 'Is_DaIn', width: 70, readOnly: true }
	]
	vueData.DSHocSinh = (vueData.DSHocBong || []).map((x, index) => [
		index + 1,
		x.HocSinhID,
		x.HoTen || '',
		x.TenLop || '',
		x.KhoiID,
		x.MucHocBong || '',
		x.TieuChi_VI || '',
		x.TieuChi_EN || '',
		x.SoQuyetDinh || '',
		x.VaoSo ?? (index + 1),
		x.NgayCap_VI || '',
		x.NgayCap_EN || '',
		x.Is_DaIn ? 'Có' : 'Không'
	])
	vueData.DSHocSinhChange = []
	vueData.keyComp++
}
function renderDSHocSinhChange() {
	return (vueData.DSHocSinhChange || []).map(hocSinhID => {
		const hs = (vueData.DSHocBong || []).find(x => String(x.HocSinhID) === String(hocSinhID))
		return {
			HocSinhID: hocSinhID,
			HoTen: hs?.HoTen || '',
			TenLop: hs?.TenLop || ''
		}
	})
}
function onExportExcel() {
	if (!vueData.DSHocSinh || !vueData.DSHocSinh.length) return
	const headerRow = vueData.columnHeader.map(c => c.title)
	const aoa = [headerRow, ...vueData.DSHocSinh]
	const worksheet = XLSX.utils.aoa_to_sheet(aoa)
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, 'HocBong')
	XLSX.writeFile(workbook, `DanhSachHocBong_HK${vueData.Semester?.value}_${vueData.NienKhoa}.xlsx`)
}
function onSave() {
	if (!vueData.DSHocSinhChange || !vueData.DSHocSinhChange.length) {
		showModuleSnackbarHB('Không có thay đổi nào để lưu', 'warning')
		return
	}
	vueData.IsShowDialogConfirm = true
}
async function confirmSaveHocBong() {
	vueData.isLoadingSave = true
	try {
		const instance = Array.isArray(vueData.instance) ? vueData.instance[0] : vueData.instance
		const rows = instance.getData()
		const keys = vueData.columnHeader.map(c => c.name)
		const objs = rows.map(r => {
			const o = {}
			keys.forEach((k, i) => { o[k] = r[i] })
			return o
		})
		const changedIds = new Set((vueData.DSHocSinhChange || []).map(String))
		const payload = objs
			.filter(o => changedIds.has(String(o.HocSinhID)))
			.map(o => {
				const orig = (vueData.DSHocBong || []).find(x => String(x.HocSinhID) === String(o.HocSinhID))
				return {
					HocBongCertID: orig?.HocBongCertID,
					MucHocBong: o.MucHocBong,
					TieuChi_VI: o.TieuChi_VI,
					TieuChi_EN: o.TieuChi_EN,
					SoQuyetDinh: o.SoQuyetDinh,
					VaoSo: Number(o.VaoSo) || null,
					NgayCap_VI: o.NgayCap_VI,
					NgayCap_EN: o.NgayCap_EN
				}
			})
		await ajaxCALLPromise('lms/HocBongCert_Upd_JSON', { JsonData: JSON.stringify(payload) })
		payload.forEach(p => {
			const orig = (vueData.DSHocBong || []).find(x => x.HocBongCertID === p.HocBongCertID)
			if (orig) Object.assign(orig, p)
		})
		renderDSHocBong()
		vueData.IsShowDialogConfirm = false
		showModuleSnackbarHB('Đã lưu thành công', 'success')
	} catch (error) {
		showModuleSnackbarHB('Lưu thất bại: ' + (error?.message || ''), 'error')
	} finally {
		vueData.isLoadingSave = false
	}
}
async function exportGiayChungNhanHocBong() {
	if (!vueData.DSHocBong || !vueData.DSHocBong.length) {
		showModuleSnackbarHB('Không có dữ liệu để in', 'warning')
		return
	}
	vueData.isLoadingPrint = true
	const hocKyText = vueData.Semester?.value === 2 ? 'II' : 'I'
	const namHocLine = vueData.Semester?.value === 2
		? `Năm học/Academic Year ${vueData.NienKhoa} - ${vueData.NienKhoa + 1}`
		: ''
	const certs = vueData.DSHocBong.map(x => {
		const percentMatch = String(x.MucHocBong || '').match(/(\d+)\s*%/)
		const percent = percentMatch ? percentMatch[1] : ''
		return {
			khenTang_Vi: 'Trao tặng học sinh',
			khenTang_En: 'This certificate is proudly presented to',
			hoTen: String(x.HoTen || '').toUpperCase(),
			lop: x.TenLop || '',
			hocBong_Vi: `Đạt Học bổng ${percent}% Học phí Học kỳ ${hocKyText} khối ${x.KhoiID}`,
			hocBong_En: `Awarded a ${percent}% Tuition Scholarship for Semester ${hocKyText}, Grade ${x.KhoiID}`,
			nhom_Vi: x.TieuChi_VI || '',
			nhom_En: x.TieuChi_EN || '',
			namHoc_Vi: namHocLine,
			namHoc_En: '',
			ngayThangNam_Vi: x.NgayCap_VI || '',
			ngayThangNam_En: x.NgayCap_EN || '',
			soQuyetDinh: `${x.SoQuyetDinh || ''}/QĐ-SNLH.NO:${x.VaoSo ?? ''}`,
			tenHieuTruong: 'Hoàng Thị Diễm Trang'
		}
	})
	// TODO: endpoint tạm - chờ IoT cung cấp template "Giấy chứng nhận cấp học bổng" xong, đổi lại URL/tên hàm nếu IoT đặt khác.
	try {
		const response = await fetch('https://gencert.iotsoftvn.com/api/cert-generators/multi-pdf-scholarship', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ certs })
		})
		if (!response.ok) throw new Error('HTTP ' + response.status)
		const blob = await response.blob()
		const url = window.URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = 'DanhSachGiayChungNhanHocBong.pdf'
		document.body.appendChild(link)
		link.click()
		link.remove()
	} catch (error) {
		showModuleSnackbarHB('In giấy chứng nhận thất bại (template phía IoT có thể chưa sẵn sàng): ' + (error?.message || ''), 'error')
	} finally {
		vueData.isLoadingPrint = false
	}
}
async function reloadHocBongList() {
	if (vueData.KhoiItem?.value === null || vueData.KhoiItem?.value === undefined) return
	const res = await ajaxCALLPromise('lms/HocBongCert_Get', {
		NienKhoa: vueData.NienKhoa,
		HocKy: vueData.Semester?.value,
		KhoiID: vueData.KhoiItem?.value
	})
	vueData.DSHocBong = res || []
	renderDSHocBong()
}
async function submitAddHocSinh() {
	if (!vueData.AddHocSinhSelected) {
		showModuleSnackbarHB('Vui lòng chọn học sinh', 'warning')
		return
	}
	if (vueData.KhoiItem?.value === null || vueData.KhoiItem?.value === undefined) {
		showModuleSnackbarHB('Vui lòng chọn học kì trước', 'warning')
		return
	}
	vueData.isLoadingAdd = true
	try {
		const hs = vueData.AddHocSinhSelected
		const payload = [{
			HocSinhID: hs.HocSinhID,
			TenLop: hs.TenLop,
			NgaySinh: hs.NgaySinh || '',
			MucHocBong: vueData.AddMucHocBong || '',
			HocKy: vueData.Semester?.value,
			NienKhoa: vueData.NienKhoa
		}]
		const res = await ajaxCALLPromise('lms/HocBongCert_Ins_JSON', { JsonData: JSON.stringify(payload) })
		const inserted = Array.isArray(res) ? res[0]?.Inserted : res?.Inserted
		if (!inserted) {
			showModuleSnackbarHB('Học sinh này đã có trong danh sách học bổng của học kì hiện tại', 'warning')
		} else {
			showModuleSnackbarHB('Đã thêm học sinh', 'success')
		}
		vueData.IsShowDialogAdd = false
		vueData.AddHocSinhSelected = null
		await reloadHocBongList()
	} catch (error) {
		showModuleSnackbarHB('Thêm thất bại: ' + (error?.message || ''), 'error')
	} finally {
		vueData.isLoadingAdd = false
	}
}
async function submitDelHocSinh() {
	if (!vueData.DelHocSinhSelected || !vueData.DelHocSinhSelected.length) {
		showModuleSnackbarHB('Vui lòng chọn học sinh cần xóa', 'warning')
		return
	}
	vueData.isLoadingDel = true
	try {
		const ids = vueData.DelHocSinhSelected.map(x => x.HocBongCertID)
		await ajaxCALLPromise('lms/HocBongCert_Del_JSON', { JsonIDs: JSON.stringify(ids) })
		showModuleSnackbarHB('Đã xóa học sinh khỏi danh sách', 'success')
		vueData.IsShowDialogDel = false
		vueData.DelHocSinhSelected = []
		await reloadHocBongList()
	} catch (error) {
		showModuleSnackbarHB('Xóa thất bại: ' + (error?.message || ''), 'error')
	} finally {
		vueData.isLoadingDel = false
	}
}
vueData.renderDSHocBong = renderDSHocBong
vueData.renderDSHocSinhChange = renderDSHocSinhChange
vueData.onExportExcel = onExportExcel
vueData.onSave = onSave
vueData.confirmSaveHocBong = confirmSaveHocBong
vueData.exportGiayChungNhanHocBong = exportGiayChungNhanHocBong
vueData.submitAddHocSinh = submitAddHocSinh
vueData.submitDelHocSinh = submitDelHocSinh