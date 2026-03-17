/**
 * Grade Management System - All Utilities
 * Tất cả helper functions tập trung trong 1 file
 */
// ════════════════════════════════════════════════════════════════
// CONFIGURATION & CONSTANTS
// ════════════════════════════════════════════════════════════════
const GRADE_CONFIG = {
    FREEZE_COLS: 5,
    IELTS_SKILLS: ['Listening', 'Reading', 'Writing', 'Speaking'],
    SEMESTER_OPTIONS: [
        // { key: 'S1_Mid', label: 'HK1 - Giữa kì', HocKi: 1 },
        // { key: 'S1_Final', label: 'HK1 - Cuối kì', HocKi: 1 },
        { key: 'S2_Mid', label: 'HK2 - Giữa kì', HocKi: 2 },
        // { key: 'S2_Final', label: 'HK2 - Cuối kì', HocKi: 2 },
    ],
    SCORE_TYPES_CAP2: [
        { key: 'HK', label: 'Điểm HK + Cambridge' },
    ],
    SCORE_TYPES_CAP3: [
        // { key: 'HK', label: 'Điểm HK' },
        { key: 'TA2', label: 'Điểm TA2 + IELTS' },
    ],
    VALID_COT_DIEM_SUFFIXES: [
        'Listening_Point', 'Listening_Conv',
        'Language_Point', 'Language_Conv',
        'Reading_Point', 'Reading_Conv',
        'Writing_Point', 'Writing_Conv',
        'Speaking_Point', 'Speaking_Conv',
        'Total_Point', 'Total_Conv',
        'TA2_Listening_Point', 'TA2_Listening_Conv',
        'TA2_Reading_Point', 'TA2_Reading_Conv',
        'TA2_Writing_Point', 'TA2_Writing_Conv',
        'TA2_Speaking_Point', 'TA2_Speaking_Conv',
        'TA2_Avg_Point', 'TA2_Avg_Conv',
        'TA2_Point',
        'CB_Listening_Point', 'CB_Listening_Conv',
        'CB_Reading_Point', 'CB_Reading_Conv',
        'CB_Writing_Point', 'CB_Writing_Conv',
        'CB_Speaking_Point', 'CB_Speaking_Conv',
        'CB_Avg_Point', 'CB_Avg_Conv',
        'IELTS_Listening_Conv',
        'IELTS_Reading_Conv',
        'IELTS_Writing_Conv',
        'IELTS_Speaking_Conv',
        'IELTS_Band_Conv',
    ],
    API_ENDPOINTS: {
        CLASSES: 'lms/NhomAV_Get',
        STUDENTS_BY_CLASS: 'lms/HocSinhNhom_Get_ByNhomID',
        TEMPLATE_COLS: 'lms/HocSinhBangDiem_Get_ByMonHocID_MaNhom',
        SKILL_CONFIG: 'lms/ThietLap_KiNang_Get',
        IELTS_CONFIG: 'lms/ThietLap_KiNang_IELTS_Get',
        SAVE_GRADES: 'lms/KQHT_MonHocLop_Ins',
        MON_HOC_LOP_CAP2: 'lms/MonHocLop_CapID_Get',
    },
    IELTS_NHOM_IDS: new Set([
        'N251101', 'N251102',
        'N251201', 'N251202', 'N251203', 'N251204', 'N251205', 'N251206',
    ]),
    MON_HOC_ID: 76,
    MON_HOC_ID_CAP2: 46,
    MON_HOC_CODE_CAP2: 'ANH',
    DEFAULT_TEMPLATE_SCORE_ORDER: 14,
}
// ════════════════════════════════════════════════════════════════
// GRADE CALCULATION HELPERS
// ════════════════════════════════════════════════════════════════
/**
 * Chuyển đổi index cột sang ký tự (0→A, 1→B, ..., 26→AA)
 */
function colIndexToLetter(index) {
    let letter = ''
    let n = index + 1
    while (n > 0) {
        const rem = (n - 1) % 26
        letter = String.fromCharCode(65 + rem) + letter
        n = Math.floor((n - 1) / 26)
    }
    return letter
}
/**
 * Tính chiều rộng cột dựa trên độ dài tiêu đề
 */
function getColumnWidth(title, colType, options = {}) {
    const { minWidth = 60, maxWidth = 400, charWidth = 8, padding = 24, extraForNumeric = 20 } = options
    if (!title) return `${minWidth}px`
    const base = title.length * charWidth + padding
    const w = colType === 'numeric' ? base + extraForNumeric : base
    return `${Math.ceil(Math.min(Math.max(w, minWidth), maxWidth) / 10) * 10}px`
}
/**
 * Xử lý công thức: thay tên cột bằng tọa độ (e.g. S2_Mid_TA2_Listening_Point → C2)
 */
function resolveFormula(formula, allColDefs, rowIndex, constMap = {}) {
    if (!formula) return ''
    let f = formula.replace(/\bIIF\b/g, 'IF')
    for (const [k, v] of Object.entries(constMap)) {
        f = f.replace(new RegExp(`\\b${k}\\b`, 'g'), String(v))
    }
    f = f.replace(/\b([A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)+)\b/g, match => {
        const found = allColDefs.find(c => c.key === match)
        return found ? `${found.colLetter}${rowIndex}` : match
    })
    return `=${f}`
}
/**
 * Evaluate formula string với valueMap (dùng trong eTest apply, không dùng jspreadsheet)
 * Hỗ trợ IF/IIF, thay tên cột → giá trị thực rồi eval
 */
function evaluateFormulaString(formula, valueMap) {
    if (!formula) return null
    try {
        let expr = formula
            .replace(/\bIIF\b/g, 'IF')
            .replace(/\bIF\s*\(/g, '_IF(')
        const sortedKeys = Object.keys(valueMap).sort((a, b) => b.length - a.length)
        for (const key of sortedKeys) {
            const val = valueMap[key]
            const safeVal = (val === null || val === undefined || val === '')
                ? 'null'
                : (typeof val === 'string' ? `"${val}"` : val)
            expr = expr.replace(
                new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'),
                safeVal
            )
        }
        const _IF = (condition, trueVal, falseVal) => condition ? trueVal : falseVal
        // eslint-disable-next-line no-new-func
        const result = new Function('_IF', `"use strict"; return (${expr})`)(_IF)
        return result ?? null
    } catch (e) {
        console.warn('[evaluateFormulaString] error:', formula, e)
        return null
    }
}
/**
 * Build valueMap cho 1 row từ scoreDescs + allUpdates + ws
 * Pass 1: lấy giá trị thực, bỏ qua formula string (bắt đầu bằng '=')
 * Pass 2: evaluate các cột trung gian có _formulaTemplate
 */
function buildValueMapForRow(scoreDescs, rowIdx, allUpdates, ws, FREEZE_COLS) {
    const valueMap = {}
    // Pass 1: lấy giá trị thực
    scoreDescs.forEach((sd, si) => {
        if (!sd.key) return
        const ci = FREEZE_COLS + si
        let val = allUpdates[rowIdx]?.[ci] ?? ws.getValueFromCoords(ci, rowIdx) ?? null
        if (typeof val === 'string' && val.startsWith('=')) val = null
        valueMap[sd.key] = val
    })
    // Pass 2: evaluate các cột trung gian (Avg_Point, v.v.)
    scoreDescs.forEach((sd) => {
        if (!sd.key || !sd._formulaTemplate) return
        if (valueMap[sd.key] !== null && valueMap[sd.key] !== undefined) return
        const resolved = evaluateFormulaString(sd._formulaTemplate, valueMap)
        if (resolved !== null && resolved !== undefined) valueMap[sd.key] = resolved
    })
    return valueMap
}
/**
 * Lấy số câu từ cấu hình dựa trên mã cột và ID nhóm
 */
function getSoCau(thietLapList, nhomID, maCotDiem) {
    const row = thietLapList.find(t =>
        t.MaCotDiem === maCotDiem &&
        t.Enable !== false &&
        t.List_NhomID.split(',').map(s => s.trim()).includes(String(nhomID))
    )
    return row ? row.SoCau : null
}
/**
 * Tạo bảng định nghĩa cột từ danh sách desc
 */
function buildColDefs(descs) {
    return descs.map((d, i) => ({
        key: d.key,
        colLetter: colIndexToLetter(i),
        index: i,
    }))
}
// ════════════════════════════════════════════════════════════════
// IELTS BAND SCORE CALCULATIONS
// ════════════════════════════════════════════════════════════════
/**
 * Lấy band score từ bảng chuyển đổi dựa trên số câu đúng (Listening/Reading)
 */
function getBandScoreFromTable(thietLapList, kiNang, soCauDung) {
    if (soCauDung === null || soCauDung === undefined || soCauDung === '') return null
    const num = Number(soCauDung)
    if (isNaN(num)) return null
    const row = thietLapList.find(t =>
        t.TenKiNang === kiNang &&
        num >= t.MinCorrectAns &&
        num <= t.MaxCorrectAns
    )
    return row ? row.BandScore : null
}
/**
 * Tính IELTS Band cho Writing/Speaking từ điểm kỹ năng (thang 10)
 * Công thức: MROUND((2/3)*diemKiNang + (1/3) + 0.25, 0.5)
 * Dùng integer math để tránh floating point
 */
function calcWritingSpeakingBand(diemKiNang) {
    if (diemKiNang === null || diemKiNang === undefined || diemKiNang === '') return null
    const val = Number(diemKiNang)
    if (isNaN(val)) return null
    // Nhân 1000 để tránh floating point, sau đó MROUND với 500 (= 0.5 * 1000)
    const raw1000 = Math.round(((2 / 3) * val + (1 / 3) + 0.25) * 1000)
    return Math.floor(raw1000 / 500 + 0.5) * 500 / 1000
}
/**
 * Tính Overall Band từ danh sách band scores có giá trị (không bắt buộc đủ 4 kỹ năng)
 * Quy tắc IELTS: <0.25→floor | <0.75→floor+0.5 | >=0.75→ceil
 */
function calcOverallBandFromAvailable(scores) {
    const valid = scores.filter(v => v !== null && v !== undefined && v !== '' && !isNaN(Number(v))).map(Number)
    if (!valid.length) return null
    const avg = valid.reduce((a, b) => a + b, 0) / valid.length
    const dec = avg - Math.floor(avg)
    if (dec < 0.25) return Math.floor(avg)
    else if (dec < 0.75) return Math.floor(avg) + 0.5
    else return Math.ceil(avg)
}
/**
 * Tính Overall Band từ đúng 4 kỹ năng (dùng cho IELTS_OVERALL formula trong jspreadsheet)
 * Trả null nếu thiếu bất kỳ kỹ năng nào
 */
function calcOverallBand(listening, reading, writing, speaking) {
    return calcOverallBandFromAvailable([listening, reading, writing, speaking].map(v =>
        (v === null || v === undefined || v === '') ? null : v
    ).every(v => v !== null) ? [listening, reading, writing, speaking] : [])
}
/**
 * Lấy giá trị IELTS band của 1 kỹ năng cho 1 row
 * Ưu tiên: allUpdates → ws value → DOM innerHTML (fallback khi ws trả formula string)
 */
function getIeltsValForRow(kiNang, scoreDescs, rowIdx, allUpdates, ws, FREEZE_COLS) {
    const desc = scoreDescs.find(d => d._kiNang === kiNang && d._isIeltsScore)
    if (!desc) return null
    const ci = FREEZE_COLS + scoreDescs.indexOf(desc)
    // 1. Ưu tiên allUpdates (đã recordUpdate trong cùng batch)
    if (allUpdates[rowIdx]?.[ci] !== undefined) return allUpdates[rowIdx][ci]
    // 2. Thử ws value (bỏ qua nếu là formula string chưa evaluated)
    const wsVal = ws.getValueFromCoords(ci, rowIdx)
    if (wsVal !== null && wsVal !== undefined && wsVal !== '' &&
        !(typeof wsVal === 'string' && wsVal.startsWith('='))) {
        const num = Number(wsVal)
        return isNaN(num) ? null : num
    }
    // 3. Fallback DOM innerHTML (jspreadsheet đã render formula result vào đây)
    const rec = ws.records?.[rowIdx]?.[ci]
    if (rec?.element) {
        const domVal = rec.element.innerHTML
        if (domVal !== '' && domVal !== null && domVal !== undefined) {
            const num = Number(domVal)
            return isNaN(num) ? null : num
        }
    }
    return null
}
/**
 * Phân loại type của cột (TA2, IELTS, hoặc other)
 */
function classifyColumnType(maCotDiem) {
    if (maCotDiem?.includes('_IELTS_')) return 'ielts'
    if (maCotDiem?.includes('_TA2_') || maCotDiem?.includes('__SoCauDung')) return 'ta2'
    if (maCotDiem?.includes('_CB_')) return 'cambridge'
    return 'other'
}
// ════════════════════════════════════════════════════════════════
// CAMBRIDGE HELPERS
// ════════════════════════════════════════════════════════════════
function calcCambridgeConv(pct, khoiID) {
    if (pct === null || pct === undefined || pct === '') return null
    const p = Number(pct), khoi = Number(khoiID)
    if (isNaN(p)) return null
    if (khoi === 9) {
        if (p >= 90) return 'Exceeding Requirements/Vượt yêu cầu'
        if (p >= 60) return 'Meeting Requirements/Đạt yêu cầu'
        return 'Not Meeting Requirements/Chưa đạt'
    }
    // Khối 6, 7, 8
    if (p >= 80) return 'Exceeding Requirements/Vượt yêu cầu'
    if (p >= 50) return 'Meeting Requirements/Đạt yêu cầu'
    return 'Not Meeting Requirements/Chưa đạt'
}
// ════════════════════════════════════════════════════════════════
// SPREADSHEET FORMATTERS
// ════════════════════════════════════════════════════════════════
/**
 * Apply formatter "Số câu đúng" dạng "X/Y" vào worksheetConfig
 */
function applyColumnFormatters(worksheetConfig, scoreDescs, FREEZE_COLS) {
    if (!worksheetConfig.columns) return
    worksheetConfig.columns = worksheetConfig.columns.map((col, colIdx) => {
        const scoreIdx = colIdx - FREEZE_COLS
        if (scoreIdx < 0) return col
        const desc = scoreDescs[scoreIdx]
        if (!desc || !desc.key?.includes('__SoCauDung') || !desc._soCau) return col
        return {
            ...col,
            render: (cell, value) => {
                if (!value && value !== 0) { cell.innerText = ''; return }
                cell.innerText = `${value}/${desc._soCau}`
            },
        }
    })
}
// ════════════════════════════════════════════════════════════════
// API HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════
/**
 * Fetch danh sách lớp/nhóm
 * - cap3: dùng API cũ lms/NhomAV_Get, filter theo MonHocID
 * - cap2: dùng API Lop_Get_By_CapID, trả về danh sách lớp trực tiếp
 */
async function fetchClasses(nienKhoa, cap = 'cap3') {
    if (cap === 'cap2') {
        const CAP_ID_MAP = { cap2: 2, cap3: 3 }
        const capID = CAP_ID_MAP[cap] ?? 2
        // Fetch song song: danh sách lớp + MonHocLop (để lấy TemplateBangDiemID, MonHocLopID)
        const [lopData, monHocLopData] = await Promise.all([
            fetchPromise('lms/Lop_Get_By_CapID', {
                NienKhoa: nienKhoa,
                CapID: capID,
                HocKi: vueData.NienKhoaItem.HocKi
            }),
            fetchPromise(GRADE_CONFIG.API_ENDPOINTS.MON_HOC_LOP_CAP2, { NienKhoa: nienKhoa, CapID: capID }),
        ])
        // Build map LopID → MonHocLop (filter theo MonHocCode = 'ANH')
        const monHocLopMap = new Map()
            ; (monHocLopData ?? [])
                .filter(x => x.MonHocCode === GRADE_CONFIG.MON_HOC_CODE_CAP2)
                .forEach(x => monHocLopMap.set(String(x.LopNhomID), x))
        return (lopData ?? []).map(x => {
            const mhl = monHocLopMap.get(String(x.LopID))
            return {
                id: x.LopID,
                name: x.TenLop,
                khoiID: x.KhoiID,
                templateBangDiemID: mhl?.TemplateBangDiemID ?? null,
                monHocLopID: mhl?.MonHocLopID ?? null,
                maDonVi: x.MaDonVi ?? null,
                gvcn: x.Ten_GVCN ?? null,
            }
        })
    }
    // cap3: API cũ
    const data = await fetchPromise(GRADE_CONFIG.API_ENDPOINTS.CLASSES, { NienKhoa: nienKhoa })
    return data
        .filter(x => x.MonHocID === GRADE_CONFIG.MON_HOC_ID && x.IsNhomLMS_GiaoBai === false)
        .map(x => ({
            id: x.NhomID,
            name: x.TenNhom,
            khoiID: x.KhoiID,
            templateBangDiemID: x.TemplateBangDiemID,
            monHocLopID: x.MonHocLopID ?? null,
        }))
}
/**
 * Fetch + process records từ API thành colsMap + studentsMap
 * Dùng chung cho cả TA2 và IELTS
 */
function processApiRecords(records, colsMap, studentsMap, monHocLopIDRef, gradesMap = null) {
    if (!Array.isArray(records)) return
    records.forEach(record => {
        if (!monHocLopIDRef.value && record.MonHocLopID)
            monHocLopIDRef.value = record.MonHocLopID
        if (record.MaCotDiem && !colsMap.has(record.MaCotDiem)) {
            colsMap.set(record.MaCotDiem, {
                MaCotDiem: record.MaCotDiem,
                TenCotDiem_VI: record.TenCotDiem_VI,
                TenCotDiem_EN: record.TenCotDiem_EN,
                GiaTriCotDiem: record.GiaTriCotDiem,
                Formula: record.Formula || null,
                CotDiemID: record.CotDiemID,
                ThuTuCotDiem: record.ThuTuCotDiem,
                MaNhomCotDiem: record.MaNhomCotDiem,
                DiemMin: record.DiemMin,
                DiemMax: record.DiemMax,
                LoaiCotDiem: record.LoaiCotDiem,
                HeSo: record.HeSo,
            })
        }
        if (record.HocSinhID && !studentsMap.has(record.HocSinhID)) {
            studentsMap.set(record.HocSinhID, {
                id: record.HocSinhID,
                soTT: record.SoDanhBo || 0,
                hoTen: record.HoTen,
                englishName: record.EnglishName || '',
                tenLop: record.TenLop || '',
            })
        }
        if (gradesMap && record.HocSinhID && record.MaCotDiem) {
            gradesMap.set(`${record.HocSinhID}_${record.MaCotDiem}`, {
                kqhtID: record.KQHTID || null,
                cotDiemID: record.CotDiemID ?? null,       // ✅ thêm
                monHocLopID: record.MonHocLopID ?? null,   // ✅ thêm
                value: record.KetQuaDanhGia_VI ?? null,  // ✅ thêm dòng này
            })
        }
    })
}
/**
 * Lọc và sort cols từ cache theo nhóm cột điểm hợp lệ
 */
function filterAndSortCols(cachedCols, activeNhomCotDiem, ieltsNhomCotDiem, cbNhomCotDiem = null) {
    const groupOrder = (nhom) => {
        if (nhom === ieltsNhomCotDiem) return 2
        if (cbNhomCotDiem && nhom === cbNhomCotDiem) return 1
        return 0
    }
    return cachedCols
        .filter(c =>
            (c.MaNhomCotDiem === activeNhomCotDiem ||
             c.MaNhomCotDiem === ieltsNhomCotDiem ||
             (cbNhomCotDiem && c.MaNhomCotDiem === cbNhomCotDiem)) &&
            GRADE_CONFIG.VALID_COT_DIEM_SUFFIXES.some(s => c.MaCotDiem.endsWith(s))
        )
        .sort((a, b) => {
            const gDiff = groupOrder(a.MaNhomCotDiem) - groupOrder(b.MaNhomCotDiem)
            if (gDiff !== 0) return gDiff
            return a.ThuTuCotDiem - b.ThuTuCotDiem
        })
        .map(c => ({
            key: c.MaCotDiem,
            title: c.TenCotDiem_VI,
            type: c.GiaTriCotDiem,
            formula: c.Formula,
            cotDiemID: c.CotDiemID,
            diemMin: c.DiemMin,
            diemMax: c.DiemMax,
            loaiCotDiem: c.LoaiCotDiem,
            heSo: c.HeSo,
        }))
}
async function fetchSkillConfig(nienKhoa) {
    return await fetchPromise(GRADE_CONFIG.API_ENDPOINTS.SKILL_CONFIG, { NienKhoa: nienKhoa })
}
async function fetchIeltsConfig(nienKhoa) {
    return await fetchPromise(GRADE_CONFIG.API_ENDPOINTS.IELTS_CONFIG, { NienKhoa: nienKhoa })
}
async function saveGrades(saveData) {
    return await fetchPromise(GRADE_CONFIG.API_ENDPOINTS.SAVE_GRADES, { ...saveData })
}
/**
 * Tính Overall Band từ 4 kỹ năng
 * Nếu kỹ năng nào rỗng/null → tính như 0, vẫn chia 4
 */
function calcOverallBand(listening, reading, writing, speaking) {
    const scores = [listening, reading, writing, speaking]
    const nums = scores.map(v => (v === '' || v === null || v === undefined) ? 0 : Number(v))
    if (nums.some(v => isNaN(v))) return null
    const avg = nums.reduce((a, b) => a + b, 0) / 4
    const dec = avg - Math.floor(avg)
    if (dec < 0.25) return Math.floor(avg)
    else if (dec < 0.75) return Math.floor(avg) + 0.5
    else return Math.ceil(avg)
}
// ════════════════════════════════════════════════════════════════
// PROPAGATE HELPERS
// ════════════════════════════════════════════════════════════════
/**
 * ctx = { cls, students, scoreDescs, gradesMap, hasIelts, instances, wsMeta, FREEZE_COLS, changedCells }
 * Trả về { changedCells patch, cellUpdates } để component merge vào
 */
function propagateSoCauDung(
    { cls, students, scoreDescs, gradesMap, FREEZE_COLS, cap },
    idx, rowIndex, soCauDungDesc, soCauDungVal, ws
) {
    const diemThoDesc = scoreDescs.find(d => d._soCauDungKey === soCauDungDesc.key)
    if (!diemThoDesc || !diemThoDesc._soCau) {
        console.warn('[propagateSoCauDung] Không tìm thấy diemThoDesc hoặc _soCau=null cho', soCauDungDesc.key,
            '→ diemThoDesc:', diemThoDesc)
        return { patch: {}, cellUpdates: {} }
    }
    const diemThoIdx = scoreDescs.findIndex(d => d.key === diemThoDesc.key)
    if (diemThoIdx === -1) return { patch: {}, cellUpdates: {} }
    const isCap2 = cap === 'cap2'
    const diemThoVal = (soCauDungVal !== null && soCauDungVal !== undefined)
        ? isCap2
            ? parseFloat((soCauDungVal / diemThoDesc._soCau * (diemThoDesc.diemMax ?? 10)).toFixed(2))
            : parseFloat((soCauDungVal * 10 / diemThoDesc._soCau).toFixed(2))
        : ''
    const diemThoCi = FREEZE_COLS + diemThoIdx
    const snapOld = (ci) => {
        const raw = ws?.getValueFromCoords(ci, rowIndex)
        return (raw === null || raw === undefined || raw === '' ||
            (typeof raw === 'string' && raw.startsWith('=')))
            ? null : (isNaN(Number(raw)) ? raw : Number(raw))
    }
    const student = students[rowIndex]
    const makeEntry = (desc, value, oldValue) => {
        const existingGrade = gradesMap?.get(`${student.id}_${desc.key}`)
        return {
            wsIdx: idx, nhomID: cls.id, tenNhom: cls.name,
            monHocLopID: cls.monHocLopID,
            hocSinhID: student.id, hoTen: student.hoTen,
            maCotDiem: desc.key, tenCotDiem: desc.title,
            cotDiemID: desc.cotDiemID ?? existingGrade?.cotDiemID ?? null,
            value, oldValue,
            kqhtID: existingGrade?.kqhtID ?? null,
        }
    }
    const patch = {}
    const cellUpdates = {}  // { ci: val } để caller _applyCell
    const oldDiemTho = snapOld(diemThoCi)
    cellUpdates[diemThoCi] = diemThoVal
    patch[`${idx}_${rowIndex}_${diemThoCi}`] = makeEntry(diemThoDesc, diemThoVal, oldDiemTho)
    // Conv (cap3 only — cap2 ẩn _Conv HK)
    if (!isCap2) {
        const expectedConvKey = diemThoDesc.key.replace('_Point', '_Conv')
        const convDesc = scoreDescs.find(d => d.key === expectedConvKey)
        if (convDesc?._formulaTemplate) {
            const convIdx = scoreDescs.findIndex(d => d.key === convDesc.key)
            const convCi = FREEZE_COLS + convIdx
            const valueMap = {}
            scoreDescs.forEach((sd, si) => {
                if (!sd.key) return
                const v = ws.options?.data?.[rowIndex]?.[FREEZE_COLS + si]
                if (v !== null && v !== undefined && v !== '') valueMap[sd.key] = Number(v)
            })
            valueMap[diemThoDesc.key] = diemThoVal
            const convVal = evaluateFormulaString(convDesc._formulaTemplate, valueMap)
            if (convVal !== null && convVal !== undefined) {
                const oldConv = snapOld(convCi)
                cellUpdates[convCi] = convVal
                patch[`${idx}_${rowIndex}_${convCi}`] = makeEntry(convDesc, convVal, oldConv)
            }
        }
    }
    // CB_Point + CB_Conv (cap2 only)
    if (isCap2) {
        const cbPointDesc = scoreDescs.find(d => d._isCambridgePoint && d._hkPointKey === diemThoDesc.key)
        if (cbPointDesc && cbPointDesc._diemMax) {
            const cbIdx = scoreDescs.findIndex(d => d.key === cbPointDesc.key)
            const cbCi = FREEZE_COLS + cbIdx
            const cbVal = parseFloat((diemThoVal / cbPointDesc._diemMax * 100).toFixed(2))
            cellUpdates[cbCi] = cbVal
            patch[`${idx}_${rowIndex}_${cbCi}`] = makeEntry(cbPointDesc, cbVal, snapOld(cbCi))
            // CB_Conv
            const cbConvDesc = scoreDescs.find(d => d._isCambridgeConv && d._cbPointKey === cbPointDesc.key)
            if (cbConvDesc) {
                const cbConvIdx = scoreDescs.findIndex(d => d.key === cbConvDesc.key)
                const cbConvCi = FREEZE_COLS + cbConvIdx
                const cbConvVal = calcCambridgeConv(cbVal, cls.khoiID) ?? ''
                if (cbConvVal !== '') {
                    cellUpdates[cbConvCi] = cbConvVal
                    patch[`${idx}_${rowIndex}_${cbConvCi}`] = makeEntry(cbConvDesc, cbConvVal, snapOld(cbConvCi))
                }
            }
        }
    }
    return { patch, cellUpdates }
}
/**
 * Tính Avg_Point, Avg_Conv, TA2_Point/CB_Avg cho 1 row
 * pendingUpdates: { ci: val } — các ô đã _applyCell trước đó trong cùng batch (DiemTho mới nhất)
 * Trả về { patch, cellUpdates }
 */
function propagateAvgPoint(
    { cls, students, scoreDescs, gradesMap, FREEZE_COLS, cap },
    idx, rowIndex, ws,
    pendingUpdates = {}
) {
    const isCap2 = cap === 'cap2'
    // Helper đọc ưu tiên pendingUpdates → ws.records.value → ws.options.data
    const readVal = (ci) => {
        if (pendingUpdates[ci] !== undefined && pendingUpdates[ci] !== '') return pendingUpdates[ci]
        // ✅ Đọc từ records.value trước (jspreadsheet lưu giá trị hiện tại ở đây)
        const recVal = ws.records?.[rowIndex]?.[ci]?.value
        if (recVal !== null && recVal !== undefined && recVal !== '' &&
            !(typeof recVal === 'string' && recVal.startsWith('='))) {
            return recVal
        }
        const v = ws.options?.data?.[rowIndex]?.[ci]
        return (v !== null && v !== undefined && v !== '' &&
            !(typeof v === 'string' && v.startsWith('='))) ? v : null
    }
    const snapOld = (ci) => {
        const raw = ws?.getValueFromCoords(ci, rowIndex)
        return (raw === null || raw === undefined || raw === '' ||
            (typeof raw === 'string' && raw.startsWith('=')))
            ? null : (isNaN(Number(raw)) ? raw : Number(raw))
    }
    const student = students[rowIndex]
    const makeEntry = (desc, value, oldValue) => {
        const existingGrade = gradesMap?.get(`${student.id}_${desc.key}`)
        return {
            wsIdx: idx, nhomID: cls.id, tenNhom: cls.name,
            monHocLopID: cls.monHocLopID,
            hocSinhID: student.id, hoTen: student.hoTen,
            maCotDiem: desc.key, tenCotDiem: desc.title,
            cotDiemID: desc.cotDiemID ?? existingGrade?.cotDiemID ?? null,
            value, oldValue,
            kqhtID: existingGrade?.kqhtID ?? null,
        }
    }
    const patch = {}
    const cellUpdates = {}
    // ── HK Avg_Point ──
    const hkAvgDesc = scoreDescs.find(d => d._isAvgPoint && !d.key?.includes('_CB_'))
    if (hkAvgDesc) {
        const avgIdx = scoreDescs.findIndex(d => d.key === hkAvgDesc.key)
        const avgCi = FREEZE_COLS + avgIdx
        const diemThoDescs = isCap2
            ? scoreDescs.filter(d => d._isDiemTho)
            : ['Listening', 'Reading', 'Writing', 'Speaking'].map(k =>
                scoreDescs.find(sd => sd.key?.includes(`TA2_${k}_Point`) && sd._isDiemTho)
              ).filter(Boolean)
        const vals = diemThoDescs.map(d => {
            const ci = FREEZE_COLS + scoreDescs.indexOf(d)
            const v = readVal(ci)
            console.log(`[propagateAvgPoint] DiemTho "${d.key}" ci=${ci} readVal=${v}`,
                '| pending:', pendingUpdates[ci],
                '| records.value:', ws.records?.[rowIndex]?.[ci]?.value,
                '| options.data:', ws.options?.data?.[rowIndex]?.[ci])
            return v !== null ? Number(v) : null
        })
        console.log('[propagateAvgPoint] vals:', vals, '| isCap2:', isCap2, '| diemThoDescs count:', diemThoDescs.length)
        const valid = vals.filter(v => v !== null && !isNaN(v))
        if (valid.length > 0) {
            const avg = parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2))
            cellUpdates[avgCi] = avg
            pendingUpdates = { ...pendingUpdates, [avgCi]: avg }
            patch[`${idx}_${rowIndex}_${avgCi}`] = makeEntry(hkAvgDesc, avg, snapOld(avgCi))
            // Build valueMap từ scoreDescs + pendingUpdates
            const valueMap = {}
            scoreDescs.forEach((sd, si) => {
                if (!sd.key) return
                const v = readVal(FREEZE_COLS + si)
                if (v !== null && v !== undefined) valueMap[sd.key] = Number(v)
            })
            valueMap[hkAvgDesc.key] = avg
            // Avg_Conv (cap3 only)
            if (!isCap2) {
                const avgConvKey = hkAvgDesc.key.replace('_Avg_Point', '_Avg_Conv')
                const avgConvDesc = scoreDescs.find(d => d.key === avgConvKey)
                if (avgConvDesc?._formulaTemplate) {
                    const avgConvIdx = scoreDescs.findIndex(d => d.key === avgConvDesc.key)
                    const avgConvCi = FREEZE_COLS + avgConvIdx
                    const avgConvVal = evaluateFormulaString(avgConvDesc._formulaTemplate, valueMap)
                    if (avgConvVal !== null && avgConvVal !== undefined) {
                        cellUpdates[avgConvCi] = avgConvVal
                        valueMap[avgConvDesc.key] = avgConvVal
                        patch[`${idx}_${rowIndex}_${avgConvCi}`] = makeEntry(avgConvDesc, avgConvVal, snapOld(avgConvCi))
                    }
                }
            }
            // TA2_Point (cap3 only)
            if (!isCap2) {
                const ta2PointDesc = scoreDescs.find(d =>
                    d.key?.endsWith('_TA2_Point') && !d.key?.includes('_Avg_') && d._formulaTemplate
                )
                if (ta2PointDesc) {
                    const ta2PointIdx = scoreDescs.findIndex(d => d.key === ta2PointDesc.key)
                    const ta2PointCi = FREEZE_COLS + ta2PointIdx
                    const ta2Val = evaluateFormulaString(ta2PointDesc._formulaTemplate, valueMap)
                    console.log('[propagateAvgPoint] TA2_Point formula:', ta2PointDesc._formulaTemplate,
                        '| valueMap keys:', Object.keys(valueMap), '| result:', ta2Val)
                    if (ta2Val !== null && ta2Val !== undefined) {
                        cellUpdates[ta2PointCi] = ta2Val
                        patch[`${idx}_${rowIndex}_${ta2PointCi}`] = makeEntry(ta2PointDesc, ta2Val, snapOld(ta2PointCi))
                    }
                } else {
                    console.warn('[propagateAvgPoint] Không tìm thấy TA2_Point desc với _formulaTemplate trong scoreDescs.',
                        scoreDescs.filter(d => d.key?.endsWith('_TA2_Point')).map(d => ({ key: d.key, hasFormula: !!d._formulaTemplate })))
                }
            }
        }
    }
    // ── CB_Avg_Point (cap2 only) ──
    if (isCap2) {
        const cbAvgDesc = scoreDescs.find(d => d._isAvgPoint && d.key?.includes('_CB_'))
        if (cbAvgDesc) {
            const cbAvgIdx = scoreDescs.findIndex(d => d.key === cbAvgDesc.key)
            const cbAvgCi = FREEZE_COLS + cbAvgIdx
            const cbSkillDescs = scoreDescs.filter(d => d._isCambridgePoint)
            const vals = cbSkillDescs.map(d => {
                const ci = FREEZE_COLS + scoreDescs.indexOf(d)
                const v = readVal(ci)
                return v !== null ? Number(v) : null
            }).filter(v => v !== null && !isNaN(v))
            if (vals.length > 0) {
                const cbAvg = parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2))
                cellUpdates[cbAvgCi] = cbAvg
                patch[`${idx}_${rowIndex}_${cbAvgCi}`] = makeEntry(cbAvgDesc, cbAvg, snapOld(cbAvgCi))
                // CB_Avg_Conv
                const cbAvgConvKey = cbAvgDesc.key.replace('_Avg_Point', '_Avg_Conv')
                const cbAvgConvDesc = scoreDescs.find(d => d.key === cbAvgConvKey)
                if (cbAvgConvDesc) {
                    const cbAvgConvIdx = scoreDescs.findIndex(d => d.key === cbAvgConvKey)
                    const cbAvgConvCi = FREEZE_COLS + cbAvgConvIdx
                    const convVal = calcCambridgeConv(cbAvg, cls.khoiID) ?? ''
                    if (convVal !== '') {
                        cellUpdates[cbAvgConvCi] = convVal
                        patch[`${idx}_${rowIndex}_${cbAvgConvCi}`] = makeEntry(cbAvgConvDesc, convVal, snapOld(cbAvgConvCi))
                    }
                }
            }
        }
    }
    return { patch, cellUpdates }
}
// ════════════════════════════════════════════════════════════════
// SAVE HELPERS
// ════════════════════════════════════════════════════════════════
/**
 * Filter + map changedCells → saveRows (bỏ SoCauDung, bỏ formula)
 */
function buildSaveRows(changedCells) {
    const saveRows = []
    for (const cellKey of Object.keys(changedCells)) {
        const cell = changedCells[cellKey]
        if (cell.maCotDiem?.includes('__SoCauDung')) continue
        if (typeof cell.value === 'string' && cell.value.startsWith('=')) continue
        if (typeof cell.value === 'number' && isNaN(cell.value)) continue
        if (cell.value === null || cell.value === undefined || cell.value === '') continue
        if (typeof cell.oldValue === 'string' && cell.oldValue.startsWith('=')) continue
        const [wsIdx, rowIndex, colIndex] = cellKey.split('_').map(Number)
        saveRows.push({
            tenNhom: cell.tenNhom, maSoHS: cell.hocSinhID, hoTen: cell.hoTen,
            maCotDiem: cell.maCotDiem, tenCotDiem: cell.tenCotDiem,
            oldValue: cell.oldValue ?? null, newValue: cell.value,
            isOverwrite: cell.oldValue !== null && cell.oldValue !== undefined && cell.oldValue !== '',
            type: classifyColumnType(cell.maCotDiem),
            _internal: {
                wsIdx, rowIndex, colIndex,
                hocSinhID: cell.hocSinhID, cotDiemID: cell.cotDiemID,
                maCotDiem: cell.maCotDiem, monHocLopID: cell.monHocLopID,
                kqhtID: cell.kqhtID ?? null,
            },
        })
    }
    return saveRows
}