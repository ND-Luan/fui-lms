const apiBaseUrl = (process.env.SO_GVCN_API_BASE_URL || 'https://tapi.lhbs.vn')
	.replace(/\/+$/, '')
const apiApplication = (process.env.SO_GVCN_API_APPLICATION || 'lms').trim()
const authorizationToken = (process.env.SO_GVCN_API_TOKEN || '').trim()
const apiFunctions = [
	'SoGVCNHsCanQuanTamGet',
	'SoGVCNHsCanQuanTamSave',
	'SoGVCNHsNhanXetThangLmsGet',
	'SoGVCNHsNhanXetThangLmsSave',
	'SoGVCNKeHoachNamHocGet',
	'SoGVCNKeHoachNamHocSave',
	'SoGVCNKeHoachTuanClear',
	'SoGVCNKeHoachTuanGet',
	'SoGVCNKeHoachTuanSave',
	'SoGVCNNoiDungHopPHGet',
	'SoGVCNNoiDungHopPHSave',
	'SoGVCNSoKetHKIGet',
	'SoGVCNSoKetHKISave',
	'SoGVCNTheoDoiPhuHuynhHopGet',
	'SoGVCNTheoDoiPhuHuynhHopSave',
	'SoGVCNTheoDoiSiSoThangGet',
	'SoGVCNTheoDoiSiSoThangSave',
	'SoGVCNTheoDoiThanhTichGet',
	'SoGVCNTheoDoiThanhTichSave',
	'SoGVCNThongKeDoTuoiGet',
	'SoGVCNThongKeDoTuoiSave',
	'SoGVCNToNhomHocSinhGet',
	'SoGVCNToNhomHocSinhSave',
	'SoGVCNTongKetNamC1Get',
	'SoGVCNTongKetNamC1Save'
]

if (!authorizationToken) {
	console.error('Thiếu biến môi trường SO_GVCN_API_TOKEN.')
	process.exit(1)
}

const authorization = authorizationToken.toLowerCase().startsWith('bearer ')
	? authorizationToken
	: `Bearer ${authorizationToken}`

async function resetApiCache() {
	const failures = []

	for (const apiFunction of apiFunctions) {
		const helpUrl = `${apiBaseUrl}/help/${encodeURIComponent(apiApplication)}/${encodeURIComponent(apiFunction)}`
		try {
			const response = await fetch(helpUrl, {
				method: 'GET',
				headers: {
					Authorization: authorization,
					Accept: 'application/json'
				}
			})
			const responseText = await response.text()

			if (!response.ok) {
				const detail = responseText.replace(/\s+/g, ' ').trim().slice(0, 300)
				throw new Error(`HTTP ${response.status}${detail ? `: ${detail}` : ''}`)
			}

			console.log(`CACHE_RESET_OK|FUNCTION=${apiFunction}|HTTP=${response.status}`)
		} catch (error) {
			failures.push({ apiFunction, message: error.message })
			console.error(`CACHE_RESET_FAILED|FUNCTION=${apiFunction}|${error.message}`)
		}
	}

	if (failures.length) {
		throw new Error(`${failures.length}/${apiFunctions.length} function reset cache thất bại`)
	}

	console.log(`CACHE_RESET_COMPLETE|TOTAL=${apiFunctions.length}`)
}

resetApiCache().catch(error => {
	const causeCode = error.cause?.code ? `|CODE=${error.cause.code}` : ''
	const causeMessage = error.cause?.message ? `|CAUSE=${error.cause.message}` : ''
	console.error(`CACHE_RESET_FAILED|${error.message}${causeCode}${causeMessage}`)
	process.exit(1)
})
