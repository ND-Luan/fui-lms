const ColorEnum = {
    ThamMy: "#FFB300",
    NgonNgu: "#FB8C00",
    NhanThuc: "#217D47",
    TheChat: "#42A5F5",
    TinhCamVaQuanHeXaHoi: "#5C6BC0",

    VuotTroi: "#0091EA",
    Dat: "#00ACC1",
    ChuaDat: "#CD5D5B",
    KhongNhanXet: "#607D8B",

    //0: Mở; 1: GVCN Lưu Tạm; 2 : GVCN Gửi BGH Chờ duyệt; 3: BGH: Reject -> Duyệt lại ; 4: BGH Duyệt
    TinhTrangThangChuDe: {
        Mo: "#546E7A",
        LuuTam: "orange",
        DaLuu: "primary",
        BGHTuChoi: "red",
        DaDuyet: "primary"
    },
    TinhTrangTopic: {
        KetThuc: "red",
        DangMo: "primary"
    },
    GiaoVien: {
        GVLop: "#42A5F5",
        KhoiTruong: "#26A69A",
        GVBoMon: "green lighten-1"
    }
}

const propsSwal = {
    title: 'Thông báo',
    cancelButtonText: 'Đóng',
    confirmButtonText: "Xác nhận",
    // closeOnCancel: true,
    // preConfirm: true
    // closeOnConfirm: true,
}

const Alert = {
    confirm: ({ text = '' }) => {
        return new Promise(resolve => {
            swal({
                title: "Thông báo",
                text: text,
                icon: "info",
                buttons: {
                    cancel: 'Đóng',
                    confirm: 'Xác nhận'
                },
            }).then(result => {
                resolve(result)
            })
        })
    }
}

const propsToast = {
    toast: true,
    position: "top",
    showConfirmButton: false,
    // timer: 3000,
    // timerProgressBar: true,
    // didOpen: (toast) => {
    //     toast.onmouseenter = Swal.stopTimer;
    //     toast.onmouseleave = Swal.resumeTimer;
    // }
}

const domMessage = (type, title, text, icon) => {
    let strColorClass = 'v-alert v-alert--border-start v-theme--light v-alert--density-default v-alert--variant-flat'
    let strDOMIcon = "mdi-alert-circle-outline mdi v-icon notranslate v-theme--light " + icon
    if (type === 'success') {
        strColorClass += ' text-success'
    } else if (type === 'error') {
        strColorClass += ' text-error'
    } else if (type === 'warning') {
        strColorClass += ' text-error'
    }
    else if (type === 'info') {
        strColorClass += ' text-error'
    }
    return /*html*/`   
    <div class="black-text v-card v-theme--light v-card--density-default v-card--variant-elevated" style="height:100%">
        <div class="${strColorClass}" role="alert"
            style="background-color: white; height:100%">
            <span class="v-alert__underlay"></span>
            <div class="v-alert__border"></div>

            ${icon !== null ? `<div class="v-alert__prepend">
                <i class="${strDOMIcon}"  density="default" style="font-size: 28px; height: 28px; width: 28px;"></i>
            </div>` : ''}
         
            <div class="v-alert__content">
                ${title ? `<div class="v-alert-title">${title}</div>` : ''}
                ${text}
            </div> 
        </div>
    </div>
`
}

const Toast = {
    success: ({ type = 'success', title = null, text = '', icon = 'mdi-check-circle' }) => {
        Vue.$toast.open({
            message: domMessage(type, title, text, icon),
            position: 'top',
            duration: 3000
        })
    },
    error: ({ type = 'error', title = null, text = '', icon = 'mdi-alert-circle-outline' }) => {
        Vue.$toast.open({
            message: domMessage(type, title, text, icon),
            position: 'top',
            duration: 3000
        })
    }
}



function getColorChipLoaiCotDiem(value) {
    let colorChip = ''
    if (value === 'Nhập') {
        colorChip = 'warning'
    } else if (value === 'Tự động') {
        colorChip = 'success'
    }
    else if (value === 'Công thức') {
        colorChip = 'blue'
    } else if (value === 'Hằng số') {
        colorChip = 'cyan'
    }
    return colorChip
}

function getColorChipDiem(value) {
    let colorChip = null
    if (value >= 8) {
        colorChip = 'success'
    } else if (value >= 6.5) {
        colorChip = 'primary'
    }
    else {
        colorChip = 'warning'
    }
    return colorChip
}

function getColorChipGiaTriCotDiem(value) {
    let colorChip = ''
    if (value === 'text') {
        colorChip = 'blue'
    } else if (value === 'number') {
        colorChip = 'success'
    } else if (value === 'ICO_Star') {
        colorChip = 'warning'
    }
    return colorChip
}

function getColorTinhTrangDiem(TinhTrang) {
    let color = ''
    if (TinhTrang === 0) color = ''
    if (TinhTrang === 1) color = 'primary'
    if (TinhTrang === 2) color = 'warning'
    if (TinhTrang === 3) color = 'error'
    if (TinhTrang === 4) color = 'success'
    return color
}

function getTextTinhTrangDiem(TinhTrang) {
    let text = ''
    if (TinhTrang === 0) text = 'Chưa gửi điểm'
    if (TinhTrang === 1) text = 'Đã gửi điểm'
    if (TinhTrang === 2) text = 'Đã duyệt điểm'
    if (TinhTrang === 3) text = 'Từ chối'
    if (TinhTrang === 4) text = 'Đã công bố điểm cho phụ huynh'
    return text
}

function fn_IsDisabledTinhTrangDiem(TinhTrang, type) {
    const arrStatusGV = [0, 1, 2, 3, 4]
    const obj = {
        color: getColorTinhTrangDiem(TinhTrang),
        isDisabled: false,
        text: getTextTinhTrangDiem(TinhTrang)
    }
    if (type === 'GV') {
        if (arrStatusGV.indexOf(TinhTrang) >= 0) {
            if (TinhTrang == 0 || TinhTrang == 3) {
                obj.isDisabled = false
            } else {
                obj.isDisabled = true
            }
        }
    } else {
        if (TinhTrang == 1) {
            obj.isDisabled = false
        } else {
            obj.isDisabled = true
        }
    }
    return obj
}

// Tính chiều rộng dựa trên số lượng ký tự
function calculateColumnWidth(text) {
    const charWidth = 15; // Kích thước trung bình mỗi ký tự
    return text.length * charWidth;
}

// Hàm để chuyển tên cột thành địa chỉ cột trong Excel
function getColumnAddress(columns, columnName) {
    const columnMap = {};
    columns.forEach((column, index) => {
        const columnAddress = String.fromCharCode(67 + index); // 67 là mã ASCII của 'C'
        columnMap[column.name] = columnAddress;
    });
    return columnMap[columnName] || columnName; // Trả về địa chỉ cột nếu có, nếu không giữ nguyên tên cột
}
function replaceFormula(columns, formula, indexRow) {
    return formula.replace(/\b\w+_\w+\b/g, (match) => {
        try {
            // Lấy địa chỉ cột từ tên cột
            const columnAddress = getColumnAddress(columns, match);

            // Trả về địa chỉ cột + số dòng
            return `${columnAddress}${indexRow}`;
        } catch (error) {
            // Nếu có lỗi, trả về nguyên mẫu (match) mà không thay thế
            console.error(`Error processing column ${match}:`, error);
            return match;  // Trả về tên cột nếu có lỗi
        }
    });
}
