function convertDSHocSinh() {
    let headers = []
    let DSCotDiem_ByMaNhomCotDiem = []
    vueData.DSHocSinh = [...new Set(vueData.DSCotDiem.map(x => x.HocSinhID))].map(id => {
        const hs = vueData.DSCotDiem.find(y => y.HocSinhID === id)
        return {
            Ho: hs.Ho,
            HocSinhID: hs.HocSinhID,
            NgaySinh: hs.NgaySinh,
            Nu: hs.Nu,
            SoDanhBo: hs.SoDanhBo,
            Ten: hs.Ten,
            TinhTrang: hs.TinhTrang,
        }
    })
    let SLCotDiem_OfFirstSTD = vueData.DSCotDiem.filter((item) => item.HocSinhID === fn_ProrityTinhTrang(vueData.DSHocSinh).HocSinhID) // lấy ra các cột điểm của học sinh đầu tiên
    DSCotDiem_ByMaNhomCotDiem = SLCotDiem_OfFirstSTD
    console.log('DSCotDiem_ByMaNhomCotDiem', DSCotDiem_ByMaNhomCotDiem)
    //Xử lý động cột điểm header jexcel
    const arrCotDiemWithAlignCenter = [
        'MucDoDanhGia',
    ]
    const ListMonHoc = [5, 46, 76]
    let columnsCotDiem = SLCotDiem_OfFirstSTD
        .map((x) => {
            if (x.GiaTriCotDiem === 'number') { // cấu hình header cột điểm có dạng number
                let column = {
                    type: 'numeric',
                    title: ListMonHoc.includes(vueData.MonHocItem.MonHocID) ? x.TenCotDiem_EN : x.TenCotDiem_VI,
                    name: x.MaCotDiem,
                    typeValue: x.GiaTriCotDiem,
                    autoWidth: true,
                    decimal: '.',
                    // mask: '0.0',
                    backGroundColor: x.HexBackground,
                    width: x.WidthCSS,
                    wrapText: true,
                    readOnly: x.LoaiCotDiem === 'Công thức' ? true : false,
                }
                return column
            } else if (x.GiaTriCotDiem === 'text') { // cấu hình header cột điểm có dạng text
                let column = {
                    type: 'text',
                    title: x.TenCotDiem_VI,
                    name: x.MaCotDiem,
                    width: x.WidthCSS,
                    typeValue: x.GiaTriCotDiem,
                    width: x.WidthCSS,
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    align: arrCotDiemWithAlignCenter.some(item => x.MaCotDiem.includes(item)) ? 'center' : 'left',
                    readOnly: x.LoaiCotDiem === 'Công thức' ? true : false,
                }
                return column
            } else if (x.GiaTriCotDiem === 'ICO_Star') { // cấu hình header cột điểm có dạng ICO_Star
                let column = {
                    type: 'html',
                    title: x.TenCotDiem_VI, // + fn_IsDisabledTinhTrangDiem(x.TinhTrang, 'GV').isDisabled,
                    name: x.MaCotDiem,
                    width: x.WidthCSS,
                    typeValue: x.GiaTriCotDiem,
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    align: 'center',
                    // readOnly: x.LoaiCotDiem === 'Công thức' ? true : false,
                }
                return column
            }
            else if (x.GiaTriCotDiem === 'Dropdown_text') { // cấu hình header cột điểm có dạng ICO_Star
                let column = {
                    type: 'dropdown',
                    title: x.TenCotDiem_VI, // + fn_IsDisabledTinhTrangDiem(x.TinhTrang, 'GV').isDisabled,
                    name: x.MaCotDiem,
                    width: x.WidthCSS,
                    typeValue: x.GiaTriCotDiem,
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    align: 'center',
                    source: ['Done', 'Not Yet'] //x.MaCotDiem === '' ? ['Done', 'Not Yet'] : ['Đ', 'T', 'H']
                    // readOnly: x.LoaiCotDiem === 'Công thức' ? true : false,
                }
                return column
            }
        })
    //Nếu là gửi điểm thì freezecolumn = 4 để thêm cột từ chối
    vueData.freezeColumns = ListMonHoc.includes(vueData.MonHocItem.MonHocID) ? 4 : 3
    let columnThongTinHocSinh = [
        {
            type: 'text',
            title: 'Mã học sinh',
            name: 'HocSinhID',
            width: 100,
            backGroundColor: null,
            wrap: true,
            readOnly: true
        },
        {
            type: 'text',
            title: 'Số Danh Bộ',
            name: 'SoDanhBo',
            width: 100,
            backGroundColor: null,
            wrap: true,
            readOnly: true
        },
        {
            type: 'text',
            title: 'Họ tên học sinh',
            name: 'HoVaTenHocSinh',
            width: 200,
            backGroundColor: null,
            wrap: true,
            align: "left",
            readOnly: true
        },
    ]
    if (ListMonHoc.includes(vueData.MonHocItem.MonHocID)) {
        columnThongTinHocSinh.push({
            type: 'text',
            title: 'English Name',
            name: 'EnglishName',
            width: 100,
            backGroundColor: null,
            wrap: true,
            align: "left",
            readOnly: true
        })
    }
    headers = [...columnThongTinHocSinh, ...columnsCotDiem]
    //Xử lý data jexcel
    const dataJexcel = []
    let indexRow = 1
    for (var hocSinh of vueData.DSHocSinh) {
        const arrCotDiemExist = vueData.DSCotDiem.filter((x) => x.HocSinhID === hocSinh.HocSinhID) // Lấy danh sách điểm của học sinh
        if (arrCotDiemExist.length === 0) return
        let obj = {
            HocSinhID: arrCotDiemExist[0].HocSinhID,
            HoVaTenHocSinh: arrCotDiemExist[0].Ho + ' ' + arrCotDiemExist[0].Ten,
            SoDanhBo: arrCotDiemExist[0].SoDanhBo,
        }
        if (ListMonHoc.includes(vueData.MonHocItem.MonHocID)) obj.EnglishName = arrCotDiemExist[0].EnglishName
        //Xử lý nếu từ chối từ bên Tổ trưởng
        for (var cotDiemExist of arrCotDiemExist) {
            if (cotDiemExist.LoaiCotDiem !== 'Công thức') {
                //Text
                obj[cotDiemExist.MaCotDiem] = cotDiemExist.GiaTriCotDiem === 'number' ? (
                    (cotDiemExist.KetQuaDanhGia_VI === '' || cotDiemExist.KetQuaDanhGia_VI === null) ? null : parseFloat(cotDiemExist.KetQuaDanhGia_VI)
                ) : cotDiemExist.KetQuaDanhGia_VI
                //Set default giá trị nếu cột điểm Mức độ đánhg giá null hoặc rỗng
                if (cotDiemExist.MaCotDiem.includes('MucDoDanhGia') && cotDiemExist.KQHTID === 0) {
                    if (obj[cotDiemExist.MaCotDiem] === null || obj[cotDiemExist.MaCotDiem] === '') obj[cotDiemExist.MaCotDiem] = 'T'
                }
            } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.Formula !== null && arrCotDiemExist.length === 1) {
                //dùng cho formula để hiển thị
                obj[cotDiemExist.MaCotDiem] = parseFloat(cotDiemExist?.KetQuaDanhGia_VI ?? 0)
            } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'number') {
                //Công thức // parseFloat(cotDiemExist.KetQuaDanhGia_VI ?? 0) //
                obj[cotDiemExist.MaCotDiem] = '=' + replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow, vueData.freezeColumns)
            } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'text') {
                //Công thức // parseFloat(cotDiemExist.KetQuaDanhGia_VI ?? 0) //
                obj[cotDiemExist.MaCotDiem] = '=' + replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow, vueData.freezeColumns)
            }
            else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'ICO_Star') {
                //Ngôi sao
                //obj[cotDiemExist.MaCotDiem] = `=RATING(${replaceFormula(columnsCotDiem, cotDiemExist.Formula.replace(/IIF/g, 'IF'), indexRow)})`
                obj[cotDiemExist.MaCotDiem] = parseFloat(cotDiemExist.KetQuaDanhGia_VI ?? 0)
            }
        }
        indexRow++
        dataJexcel.push(obj)
    }
    const firstStudent = dataJexcel[0]
    const dsCotDiem = vueData.DSCotDiem.filter(x => x.HocSinhID === firstStudent.HocSinhID)
    vueData.styleSheet = {}
    vueData.comments = {}
    // console.log('dataJexcel,', dataJexcel)
    for (var i = 0; i < dataJexcel.length; i++) {
        for (var j = 0; j < dsCotDiem.length; j++) {
            const cellAdresss = jspreadsheet.helpers.getCellNameFromCoords(j + vueData.freezeColumns, i) // (j+3) là địa chỉ cột điểm đầu tiên, i là row let
            if (dsCotDiem[j].HexBackground) {
                vueData.styleSheet[cellAdresss] = `background-color: ${dsCotDiem[j].HexBackground ?? 'unset'}`
            }
            const giaTri = dataJexcel[i][dsCotDiem[j].MaCotDiem]
            if (giaTri === null || giaTri === '') {
                vueData.styleSheet[cellAdresss] = `background-color : #ffff0052`
            }
        }
    }
    for (var i = 0; i < dataJexcel.length; i++) {
        for (var j = 0; j < dsCotDiem.length; j++) {
            const cellAdresss = jspreadsheet.helpers.getCellNameFromCoords(j + vueData.freezeColumns, i) // (j+3) là địa chỉ cột điểm đầu tiên, i là row let
            const obj = vueData.DSCotDiem.find(x => x.HocSinhID === dataJexcel[i].HocSinhID && x.MaCotDiem === dsCotDiem[j].MaCotDiem && x.Is_Comment)
            if (obj) {
                // vueData.styleSheet[cellAdresss] = 'color: red !important;'
                vueData.comments[cellAdresss] = 'Cột điểm do ' + dsCotDiem[j].NhapDiemUser + ' đã nhập'
            }
            // if(obj.)
        }
    }
    vueData.keyComp++
    vueData.columnHeader = headers
    vueData.DSHocSinh = dataJexcel
    vueData.DSCotDiem_ByMaNhomCotDiem = DSCotDiem_ByMaNhomCotDiem
}
// function convertDSHocSinh() {
//     const ListMonHoc = [5, 46, 76];
//     const isSpecialMonHoc = ListMonHoc.includes(vueData.MonHocItem.MonHocID);
//     const arrCotDiemWithAlignCenter = ['MucDoDanhGia'];
//     const uniqueHocSinhIDs = [...new Set(vueData.DSCotDiem.map(x => x.HocSinhID))];
//     vueData.DSHocSinh = uniqueHocSinhIDs.map(id => {
//         const hs = vueData.DSCotDiem.find(y => y.HocSinhID === id);
//         return {
//             Ho: hs.Ho,
//             HocSinhID: hs.HocSinhID,
//             NgaySinh: hs.NgaySinh,
//             Nu: hs.Nu,
//             SoDanhBo: hs.SoDanhBo,
//             Ten: hs.Ten,
//             TinhTrang: hs.TinhTrang,
//         };
//     });
//     const firstStudent = fn_ProrityTinhTrang(vueData.DSHocSinh);
//     const SLCotDiem_OfFirstSTD = vueData.DSCotDiem.filter(item => item.HocSinhID === firstStudent.HocSinhID);
//     const DSCotDiem_ByMaNhomCotDiem = SLCotDiem_OfFirstSTD;
//     const columnsCotDiem = SLCotDiem_OfFirstSTD.map(x => {
//         const baseColumn = {
//             title: isSpecialMonHoc ? x.TenCotDiem_EN : x.TenCotDiem_VI,
//             name: x.MaCotDiem,
//             typeValue: x.GiaTriCotDiem,
//             backGroundColor: x.HexBackground,
//             width: x.WidthCSS,
//             wrap: true,
//             readOnly: x.LoaiCotDiem === 'Công thức',
//         };
//         switch (x.GiaTriCotDiem) {
//             case 'number':
//                 return { ...baseColumn, type: 'numeric', decimal: '.' };
//             case 'text':
//                 return {
//                     ...baseColumn,
//                     type: 'text',
//                     align: arrCotDiemWithAlignCenter.some(item => x.MaCotDiem.includes(item)) ? 'center' : 'left'
//                 };
//             case 'ICO_Star':
//                 return { ...baseColumn, type: 'html', align: 'center' };
//             case 'Dropdown_text':
//                 return { ...baseColumn, type: 'dropdown', align: 'center', source: ['Done', 'Not Yet'] };
//             default:
//                 return null;
//         }
//     }).filter(Boolean);
//     vueData.freezeColumns = isSpecialMonHoc ? 4 : 3;
//     const columnThongTinHocSinh = [
//         { type: 'text', title: 'Mã học sinh', name: 'HocSinhID', width: 100, wrap: true, readOnly: true },
//         { type: 'text', title: 'Số Danh Bộ', name: 'SoDanhBo', width: 100, wrap: true, readOnly: true },
//         { type: 'text', title: 'Họ tên học sinh', name: 'HoVaTenHocSinh', width: 200, wrap: true, readOnly: true, align: 'left' },
//     ];
//     if (isSpecialMonHoc) {
//         columnThongTinHocSinh.push({
//             type: 'text',
//             title: 'English Name',
//             name: 'EnglishName',
//             width: 100,
//             wrap: true,
//             align: 'left',
//             readOnly: true
//         });
//     }
//     const headers = [...columnThongTinHocSinh, ...columnsCotDiem];
//     const dataJexcel = vueData.DSHocSinh.map((hocSinh, index) => {
//         const arrCotDiem = vueData.DSCotDiem.filter(x => x.HocSinhID === hocSinh.HocSinhID);
//         if (!arrCotDiem.length) return;
//         const row = {
//             HocSinhID: hocSinh.HocSinhID,
//             HoVaTenHocSinh: hocSinh.Ho + ' ' + hocSinh.Ten,
//             SoDanhBo: hocSinh.SoDanhBo
//         };
//         if (isSpecialMonHoc) row.EnglishName = arrCotDiem[0].EnglishName;
//         arrCotDiem.forEach(cot => {
//             const val = cot.KetQuaDanhGia_VI;
//             const ma = cot.MaCotDiem;
//             if (cot.LoaiCotDiem !== 'Công thức') {
//                 row[ma] = cot.GiaTriCotDiem === 'number'
//                     ? (val === '' || val == null ? null : parseFloat(val))
//                     : val;
//                 if (ma.includes('MucDoDanhGia') && cot.KQHTID === 0 && !row[ma]) {
//                     row[ma] = 'T';
//                 }
//             } else if (cot.Formula !== null) {
//                 if (cot.GiaTriCotDiem === 'ICO_Star') {
//                     row[ma] = parseFloat(val ?? 0);
//                 } else {
//                     row[ma] = '=' + replaceFormula(columnsCotDiem, cot.Formula, index + 1, vueData.freezeColumns);
//                 }
//             }
//         });
//         return row;
//     }).filter(Boolean);
//     const dsCotDiem = DSCotDiem_ByMaNhomCotDiem;
//     vueData.styleSheet = {};
//     vueData.comments = {};
//     dataJexcel.forEach((row, i) => {
//         dsCotDiem.forEach((col, j) => {
//             const cell = jspreadsheet.helpers.getCellNameFromCoords(j + vueData.freezeColumns, i);
//             const value = row[col.MaCotDiem];
//             const style = col.HexBackground ?? null;
//             if (style) {
//                 vueData.styleSheet[cell] = `background-color: ${style}`;
//             }
//             if (value === null || value === '') {
//                 vueData.styleSheet[cell] = 'background-color: #ffff0052';
//             }
//             if (col.Is_Comment && vueData.DSCotDiem.find(x => x.HocSinhID === row.HocSinhID && x.MaCotDiem === col.MaCotDiem)) {
//                 vueData.comments[cell] = `Cột điểm do ${col.NhapDiemUser} đã nhập`;
//             }
//         });
//     });
//     vueData.keyComp++;
//     vueData.columnHeader = headers;
//     vueData.DSHocSinh = dataJexcel;
//     vueData.DSCotDiem_ByMaNhomCotDiem = DSCotDiem_ByMaNhomCotDiem;
// }
function validateSave(typeCell, value, min, max) {
    if ((typeCell === 'number' && value < min) || value > max) return 1
    else return 0
}
const page = {
    isError: false,
    process: processBeforePushAPI
}
function onLuuDiem() {
    page.isError = false
    vueData.StatusButton = 'luu'
    processBeforePushAPI()
    if (!page.isError) {
        const dataFilter = vueData.dataBeforeInsertToDB
            .filter(x =>
                (x.KQHTID && x.KQHTID > 0) || // Nếu KQHTID tồn tại và lớn hơn 0 thì giữ lại
                (
                    x.KetQuaDanhGia_VI != null &&
                    x.KetQuaDanhGia_VI !== '' &&
                    !Number.isNaN(x.KetQuaDanhGia_VI)
                ) // Hoặc KetQuaDanhGia_VI hợp lệ thì giữ lại
            );
        vueData.dataBeforeInsertToDB = dataFilter.filter(x => !Number.isNaN(x.KetQuaDanhGia_VI)) //Filter thêm lần nữa khi có Công thức ko có tính được 'Error: #VALUE!'
        console.log('dataFilter', vueData.dataBeforeInsertToDB)
        // Insert xong cập nhật tình trạng
        CALL("insKQHT_MonHocLop")
        vueData.keyComp++
    }
}
function processBeforePushAPI() {
    vueData.dataBeforeInsertToDB = []
    let val = vueData.DSHocSinh
    //val là dữ liệu trên sheet jexcel
    let DSCotDiem = vueData.DSCotDiem_ByMaNhomCotDiem //DS cột điểm của nhóm bảng điểm
    //Xử lý data mapping giá trị
    //B1: Vòng lặp thứ nhất để lặp các học sinh
    //B2: Vòng lặp bên trong để lặp các cột điểm của 1 học sinh
    for (let i = 0; i < val.length; i++) {
        for (let j = 0; j < DSCotDiem.length; j++) {
            const cellAdresss = jspreadsheet.helpers.getCellNameFromCoords(j + vueData.freezeColumns, i) // (j+3) là địa chỉ cột điểm đầu tiên, i là row
            let giaTriCotDiem = val[i][DSCotDiem[j].MaCotDiem] //vueData.instance[0].getValueFromCoords(j + vueData.freezeColumns, i)
            // console.log(val[i].HocSinhID, vueData.instance[0])
            // console.log(val[i].HocSinhID, val[i][DSCotDiem[j].MaCotDiem], vueData.instance[0].getValueFromCoords(j + vueData.freezeColumns, i))
            if (DSCotDiem[j].LoaiCotDiem === 'Công thức') {
                giaTriCotDiem = vueData.instance[0].records[i][j + vueData.freezeColumns]?.element?.innerHTML
            }
            if (DSCotDiem[j].GiaTriCotDiem === 'number') {
                if (giaTriCotDiem === null || giaTriCotDiem === NaN || giaTriCotDiem === '') {
                    console.log('FIND NULL OR NaN=>', val[i].HocSinhID, DSCotDiem[j].MaCotDiem, giaTriCotDiem)
                    giaTriCotDiem = ''
                } else {
                    console.log('NUMBER =>', val[i].HocSinhID, DSCotDiem[j].MaCotDiem, giaTriCotDiem)
                    giaTriCotDiem = parseFloat(giaTriCotDiem)
                }
            }
            if (DSCotDiem[j].CotDiemID === 2772) {
                console.log(val[i].HocSinhID, DSCotDiem[j].MaCotDiem, giaTriCotDiem)
            }
            let cotDiem_HS = {
                HocSinhID: val[i].HocSinhID,
                LopID: vueData.LopItem.LopID,
                NienKhoa: vueData.NienKhoa,
                CotDiemID: DSCotDiem[j].CotDiemID,
                KetQuaDanhGia_VI: giaTriCotDiem,
                KetQuaDanhGia_EN: giaTriCotDiem,
                KQHTID: vueData.DSCotDiem.find(x => x.HocSinhID === val[i].HocSinhID && x.MaCotDiem === DSCotDiem[j].MaCotDiem)?.KQHTID ?? 0
            }
            let typeColumn = DSCotDiem[j].GiaTriCotDiem
            let value = cotDiem_HS.KetQuaDanhGia_VI
            const min = DSCotDiem[j].DiemMin
            const max = DSCotDiem[j].DiemMax
            cotDiem_HS.IsError = validateSave(typeColumn, value, min, max)
            if (cotDiem_HS.IsError === 1) {
                vueData.instance[0].setStyle(cellAdresss, 'background-color', 'red')
                Vue.$toast.error(`Cột điểm chỉ cho phép nhập thang điểm từ ${min} đến ${max}!`, { position: 'top' })
                page.isError = true
                return
            }
            cotDiem_HS.KetQuaDanhGia_VI = cotDiem_HS.KetQuaDanhGia_VI === NaN ? null : cotDiem_HS.KetQuaDanhGia_VI
            if (DSCotDiem[j].CotDiemID === 2772) {
                console.log(val[i].HocSinhID, DSCotDiem[j].MaCotDiem, giaTriCotDiem, cotDiem_HS)
            }
            vueData.dataBeforeInsertToDB.push(cotDiem_HS)
        }
    }
    let validIndex = vueData.dataBeforeInsertToDB.findIndex((item) => item.IsError === 1)
    if (validIndex != -1) {
        Vue.$toast.error('Cột điểm chỉ cho phép nhập thang điểm 10!', { position: 'top' })
        page.isError = true
        return
    }
}
const isShowReasonReject = () => {
    let defaultObj = {
        disabled: false,
        NoiDungNhanXet: null
    }
    const DSHocSinh_Semester = vueData.DSCotDiem
    if (DSHocSinh_Semester.length > 0) {
        const obj = DSHocSinh_Semester.find(x => x.TinhTrang === 3 || x.TinhTrang === 5 || x.TinhTrang === 7)
        defaultObj.disabled = obj ? true : false
        defaultObj.NoiDungNhanXet = obj?.NoiDungNhanXet ?? ''
        defaultObj.TinhTrang = obj?.TinhTrang ?? ''
    }
    return defaultObj
}
const renderText_Person_Reject = (TinhTrang) => {
    if (!TinhTrang) return
    let text = ''
    if (vueData.CapID === 1) {
        if (TinhTrang === 3) text = 'Giáo viên chủ nhiệm từ chối'
        if (TinhTrang === 5) text = 'Tổ trưởng từ chối'
        if (TinhTrang === 7) text = 'BGH chủ nhiệm từ chối'
    } else {
        if (TinhTrang === 3) text = 'BGH từ chối'
    }
    return text
}