
// ─── Constants ───────────────────────────────────────────────────────────────
const LIB_ICON_COT_DIEM = [
    { name: 'Listening', icon: 'mdi mdi-headphones' },
    { name: 'Reading', icon: 'mdi mdi-book-open-variant-outline' },
    { name: 'Writing', icon: 'mdi mdi-lead-pencil' },
    { name: 'Speaking', icon: 'mdi mdi-account-voice' },
    { name: 'Language', icon: 'mdi mdi-account-school-outline' },
    { name: 'Total', icon: 'mdi mdi-star' },
    { name: 'default', icon: 'mdi mdi-set-none' },
]
const LIB_ICON_ACTIVITIES = [
    { name: 'EC Videos', icon: 'mdi mdi-video' },
    { name: 'My Journal', icon: 'mdi mdi-book-open-variant-outline' },
    { name: 'Hobbies', icon: 'mdi mdi-music' },
    { name: '1:1 session', icon: 'mdi mdi-account-voice' },
    { name: 'DEAR', icon: 'mdi mdi-checkbook' },
    { name: 'Class Projects', icon: 'mdi mdi-account-group-outline' },
    { name: 'Total', icon: 'mdi mdi-star' },
]
// ─── Utilities ───────────────────────────────────────────────────────────────
function MergedDataResult(arr) {
    return arr.reduce((acc, item) => {
        if (item.MaCotDiem.includes('_IELTS')) return acc
        if (item.MaCotDiem.includes('_Conv')) {
            const baseItem = acc.find(obj => item.TenCotDiem_EN.includes(obj.TenCotDiem_EN))
            if (baseItem) {
                baseItem.Convert_MaCotDiem = item.MaCotDiem
                baseItem.Convert_TenCotDiem_EN = item.TenCotDiem_EN
                baseItem.Convert_KetQuaDanhGia_VI = item.KetQuaDanhGia_VI
                baseItem.Convert_GiaTriCotDiem = item.GiaTriCotDiem
                baseItem.Convert_TenCotDiem_VI = item.TenCotDiem_VI
            }
        } else {
            acc.push({
                TenCotDiem_EN: item.TenCotDiem_EN,
                MaCotDiem: item.MaCotDiem,
                KetQuaDanhGia_VI: item.KetQuaDanhGia_VI,
                GiaTriCotDiem: item.GiaTriCotDiem,
                TenCotDiem_VI: item.TenCotDiem_VI,
                DiemMax: item.DiemMax,
                TenNhomCotDiem_EN: item.TenNhomCotDiem_EN,
                TenNhomCotDiem_VI: item.TenNhomCotDiem_VI,
                isResultCB: item.isResultCB,
            })
        }
        return acc
    }, [])
}
function buildSkillItem(item, dataIELTS) {
    const foundIELTS = dataIELTS.find(i => i.TenCotDiem_EN.includes(item.TenCotDiem_EN))
    let percent = (item.KetQuaDanhGia_VI && item.DiemMax)
        ? parseFloat(((parseFloat(item.KetQuaDanhGia_VI) / parseFloat(item.DiemMax)) * 100).toFixed(2))
        : null
    if (percent !== null) percent = Math.min(100, Math.max(0, percent))
    const data = {
        label: item.TenCotDiem_VI,
        name: item.TenCotDiem_VI,
        percent: percent ?? '- ',
        score: item.KetQuaDanhGia_VI ?? null,
        scoreMax: item.DiemMax,
        icon: 'mdi mdi-account-school-outline',
        label_EN: item.TenCotDiem_EN,
        MaCotDiem: item.MaCotDiem,
        ielts: item.ielts,
        TenNhomCotDiem_EN: item.TenNhomCotDiem_EN,
        TenNhomCotDiem_VI: item.TenNhomCotDiem_VI,
        isResultCB: item.isResultCB,
        KetQuaDanhGia_VI: item.KetQuaDanhGia_VI,
        colorKQHT: 'purple-lighten-1',
        bgcolorKQHT: 'purple-lighten-5',
        Label_IELTS_VI: item.Label_IELTS_VI,
        Label_IELTS_EN: item.Label_IELTS_EN,
        Score_IELTS: foundIELTS?.KetQuaDanhGia_VI ?? null,
    }
    const ketQua = item.Convert_KetQuaDanhGia_VI?.split('/')[0].trim().toLowerCase()
    if (ketQua === 'meeting requirements') {
        data.status = vueData.t('message.MeetingRequirements')
        data.color = 'yellow-darken-3'
        data.bgcolor = 'yellow-lighten-4'
    } else if (ketQua === 'not meeting requirements') {
        data.status = vueData.t('message.NotMeetingRequirements')
        data.color = 'red'
        data.bgcolor = 'red-lighten-5'
    } else if (ketQua === 'exceeding requirements') {
        data.status = vueData.t('message.ExceedingRequirements')
        data.color = 'green'
        data.bgcolor = 'green-lighten-5'
    } else {
        data.status = '-'
        data.color = 'green'
        data.bgcolor = 'grey-lighten-5'
    }
    const objIcon = LIB_ICON_COT_DIEM.find(obj => item.TenCotDiem_EN.includes(obj.name))
    if (objIcon) data.icon = objIcon.icon
    return data
}
function buildActivityItem(item, capID) {
    let percent = item.DiemMax
        ? parseFloat(((parseFloat(item.KetQuaDanhGia_VI) / parseFloat(item.DiemMax)) * 100).toFixed(1))
        : 0
    percent = Math.min(100, Math.max(0, percent))
    const data = {
        label: item.TenCotDiem_VI,
        name: item.TenCotDiem_VI,
        percent,
        status: item.Convert_KetQuaDanhGia_VI,
        score: item.KetQuaDanhGia_VI ?? null,
        scoreMax: item.DiemMax,
        icon: 'mdi mdi-account-school-outline',
        color: 'red',
        bgcolor: 'red-lighten-5',
        MaNhomCotDiem: item.MaNhomCotDiem,
        label_EN: item.TenCotDiem_EN,
        MaCotDiem: item.MaCotDiem,
    }
    const score = parseFloat(item.KetQuaDanhGia_VI)
    if (capID === 2) {
        if (score >= 4 && score <= 7) { data.color = 'yellow-darken-3'; data.bgcolor = 'yellow-lighten-4' }
        else if (score >= 8 && score <= 9) { data.color = 'blue'; data.bgcolor = 'blue-lighten-4' }
        else if (score > 9) { data.color = 'green'; data.bgcolor = 'green-lighten-5' }
    } else {
        if (score >= 5 && score < 8) { data.color = 'yellow-darken-3'; data.bgcolor = 'yellow-lighten-4' }
        else if (score >= 8) { data.color = 'green'; data.bgcolor = 'green-lighten-5' }
        else if (score < 1) { data.color = 'grey'; data.bgcolor = 'grey-lighten-5' }
    }
    const objIcon = LIB_ICON_ACTIVITIES.find(obj => item.TenCotDiem_EN.includes(obj.name))
    if (objIcon) data.icon = objIcon.icon
    return data
}
// ─── Init ────────────────────────────────────────────────────────────────────
function init() {
    vueData.handleData = handleData
}
// ─── Main data handlers ───────────────────────────────────────────────────────
function handleData() {
    const [cotDiem, themes] = vueData.DSCotDiem
    if (!cotDiem?.length) { console.warn('CotDiem rỗng'); return }
    if (!themes?.length) { console.warn('Theme rỗng'); return }
    const capID = vueData.HocSinhDetail.CapID
    // Build skill list
    const dataIELTS = cotDiem.filter(i => i.MaCotDiem.includes('_IELTS'))
    const dataResult = MergedDataResult(cotDiem.filter(i => !i.MaCotDiem.includes('_TA2')).map(i => ({ ...i, isResultCB: 0 })))
    const dataResultCB = MergedDataResult(cotDiem.filter(i => i.MaCotDiem.includes('_TA2')).map(i => ({ ...i, isResultCB: 1 })))
    const mergedData = [...dataResult, ...dataResultCB, ...dataIELTS]
    const skills = mergedData.map(item => buildSkillItem(item, dataIELTS))
    // Calculate overall percent
    const overallSource = capID === 2
        ? skills.slice(0, -1)
        : skills.filter(s => s.MaCotDiem.includes('_TA2_')).slice(0, -1)
    const percentSum = overallSource.reduce((sum, s) => sum + parseFloat(s.percent), 0)
    const overallPct = overallSource.length ? (percentSum / overallSource.length).toFixed(2) : '-'
    skills[skills.length - 1].percent = overallPct === 'NaN' ? '-' : overallPct
    vueData.skills = skills
    // Build activities list
    const themeItems = themes.filter(i =>
        !i.MaCotDiem.includes('_TST') &&
        !i.MaCotDiem.includes('_BNS_VNM') &&
        !i.MaCotDiem.includes('_BNS_EXP')
    )
    vueData.activities = themeItems.map(item => buildActivityItem(item, capID))
    // Build theme number list
    const uniqueThemes = [...new Set(themes.map(x => x.MaNhomCotDiem))]
    vueData.DSThemeNumber = uniqueThemes.map(i => {
        const [p0, p1] = i.split('_')
        return { title: `${p0} ${p1}`, value: i }
    })
    // Color legend for activities
    vueData.defColorActivities = capID === 2 ? [
        { status: vueData.t('message.NotImplementingWithoutSpecificReasons'), des: `0-3 ${vueData.t('message.points')}`, color: 'red', bgcolor: 'red-lighten-5' },
        { status: vueData.t('message.NotMeetingRequirements'), des: `4-7 ${vueData.t('message.points')}`, color: 'yellow-darken-3', bgcolor: 'yellow-lighten-4' },
        { status: vueData.t('message.MeetingRequirements'), des: `8-9 ${vueData.t('message.points')}`, color: 'blue', bgcolor: 'blue-lighten-4' },
        { status: vueData.t('message.ExceedingRequirements'), des: `10 ${vueData.t('message.points')}`, color: 'green', bgcolor: 'green-lighten-5' },
    ] : [
        { status: vueData.t('message.NotMeetingRequirements'), des: `1 - 4.9 ${vueData.t('message.points')}`, color: 'red', bgcolor: 'red-lighten-5' },
        { status: vueData.t('message.MeetingRequirements'), des: `5 - 7.9 ${vueData.t('message.points')}`, color: 'yellow-darken-3', bgcolor: 'yellow-lighten-4' },
        { status: vueData.t('message.ExceedingRequirements'), des: `8.0 - 10 ${vueData.t('message.points')}`, color: 'green', bgcolor: 'green-lighten-5' },
    ]
}
function handleDataNhomLop() {
    if (!vueData.DataNhomLop[0]?.HocSinhID) return
    const loai = vueData.DataNhomLop[0].LoaiHocSinh
    const row = vueData.DataNhomLop[0]
    const BG = 'rgb(209 231 211)'
    const diemKeys = loai === 'Moi'
        ? [{ title: 'Nghe', key: 'Nghe', icon: 'mdi-headphones' },
        { title: 'Ngôn ngữ', key: 'NgonNgu', icon: 'mdi-book-open-outline' },
        { title: 'Viết', key: 'Viet', icon: 'mdi-lead-pencil' },
        { title: 'Nói', key: 'Noi', icon: 'mdi-account-voice' }]
        : [{ title: 'Nghe', key: 'Nghe', icon: 'mdi-headphones' },
        { title: 'Đọc', key: 'Doc', icon: 'mdi-book-open-outline' },
        { title: 'Viết', key: 'Viet', icon: 'mdi-lead-pencil' },
        { title: 'Nói', key: 'Noi', icon: 'mdi-account-voice' }]
    const cefrKeys = [
        { title: 'Nghe', key: 'CEFR_Nghe', icon: 'mdi-headphones' },
        { title: 'Ngôn ngữ', key: 'CEFR_Language', icon: 'mdi-book-open-outline' },
        { title: 'Viết', key: 'CEFR_Viet', icon: 'mdi-lead-pencil' },
        { title: 'Nói', key: 'CEFR_Noi', icon: 'mdi-account-voice' },
    ]
    const propertiesShow = [
        { title: 'Mã học sinh', key: 'HocSinhID' },
        { title: 'Nghe (%)', key: 'Nghe' },
        { title: 'Ngôn ngữ (%)', key: 'Doc' },
        { title: 'Viết (%)', key: 'Viet' },
        { title: 'Nói (%)', key: 'Noi' },
        { title: 'Chung (%)', key: 'Chung' },
        { title: 'Điểm Cambrige', key: 'Diem_Cambridge' },
        { title: 'CEFR', key: 'CEFR_Tong' },
        { title: 'Ghi chú (thi chính thức)', key: 'GhiChu' },
        { title: 'Xếp nhóm Tiếng Anh', key: 'XepNhomTiengAnh' },
    ]
    vueData.HocSinhDiemTiengAnh = diemKeys.map(i => ({ ...i, backgroundColor: BG, value: row[i.key] }))
    vueData.HocSinhDiemCEFR = cefrKeys.map(i => ({ ...i, backgroundColor: BG, value: row[i.key] }))
    vueData.HocSinhNhomLopDetail = propertiesShow.map(i => ({ ...i, value: row[i.key] }))
}
// ─── Color legends ────────────────────────────────────────────────────────────
function initdefColorResult() {
    vueData.defColorResult = [
        { status: vueData.t('message.NotMeetingRequirements'), des: `<50% ${vueData.t('message.PointsTotalSkill')}`, color: 'red', bgcolor: 'red-lighten-5' },
        { status: vueData.t('message.MeetingRequirements'), des: `>= 50% - 79% ${vueData.t('message.PointsTotalSkill')}`, color: 'yellow-darken-3', bgcolor: 'yellow-lighten-4' },
        { status: vueData.t('message.ExceedingRequirements'), des: `>= 80% - 100% ${vueData.t('message.PointsTotalSkill')}`, color: 'green', bgcolor: 'green-lighten-5' },
    ]
}
function initdefColorActivities() { }