function showModuleSnackbarTKLT(message, color = 'warning') {
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
function chonTuanHienTai() {
	const active = (vueData.DSTuan || []).find(x => x.Is_Active === 1)
	vueData.TuanItem = active || vueData.DSTuan?.[0] || null
}
function renderChartTheoKhoi() {
	const map = new Map()
	;(vueData.DSTheoLop || []).forEach(x => {
		map.set(x.KhoiID, (map.get(x.KhoiID) || 0) + (x.SoLuot || 0))
	})
	const khoiSorted = Array.from(map.keys()).sort((a, b) => a - b)
	const categories = khoiSorted.map(k => 'Khối ' + k)
	const data = khoiSorted.map(k => map.get(k))
	vueData.ChartTheoKhoi = {
		...vueData.ChartTheoKhoi,
		series: [{ name: 'Số lượt đăng ký', data }],
		xaxis: { categories }
	}
}
function formatNgay(ngayStr) {
	if (!ngayStr) return ''
	const d = new Date(ngayStr)
	const pad = n => String(n).padStart(2, '0')
	return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}
function renderDSThongBaoPH() {
	vueData.DSThongBaoPH = (vueData.DSThongBaoPH || []).map(x => ({
		...x,
		NgayApDungHienThi: formatNgay(x.NgayApDung),
		TrangThaiHienThi: x.DaThongBaoHet ? 'Đã thông báo PH' : 'Chưa thông báo PH'
	}))
}
vueData.chonTuanHienTai = chonTuanHienTai
vueData.renderChartTheoKhoi = renderChartTheoKhoi
vueData.renderDSThongBaoPH = renderDSThongBaoPH