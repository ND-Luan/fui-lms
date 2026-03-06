const ColorEnum = {
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
    },
    warning: ({ type = 'warning', title = null, text = '', icon = 'mdi-alert-circle-outline' }) => {
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

    if (_.isNaN(value)) {
        colorChip = ''
        return
    }

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
    if (TinhTrang === 4) color = 'success'
    else if (TinhTrang === 3) color = 'error'
    else if (TinhTrang === 2) color = 'warning'
    else if (TinhTrang === 1) color = 'primary'
    else if (TinhTrang === 0) color = ''
    return color
}

function getTextTinhTrangDiem(TinhTrang) {
    let text = ''
    if (TinhTrang === 4) text = 'Đã công bố điểm cho phụ huynh'
    else if (TinhTrang === 3) text = 'Từ chối'
    else if (TinhTrang === 2) text = 'Gửi điểm'
    else if (TinhTrang === 1) text = 'Lưu tạm'
    else if (TinhTrang === 0) text = 'Chưa gửi điểm'
    return text
}

/* 
    0: Chưa lưu, 
    1: Lưu tạm, 
    2: GVBM gửi điểm, 
    3: GVCN từ chối gửi điểm bộ môn, 
    4: GVCN gửi điểm, 
    5: Tổ trưởng từ chối, 
    6: Tổ trưởng Gửi BGH, 
    7: BGH từ chối, 
    8: BGH duyệt (Công bố phụ huynh)
*/
function getColorTinhTrangDiem_C1(TinhTrang) {
    let color = ''
    if (TinhTrang === 8) color = 'success'
    else if (TinhTrang === 7) color = 'error'
    else if (TinhTrang === 6) color = 'primary'
    else if (TinhTrang === 5) color = 'error'
    else if (TinhTrang === 4) color = 'primary'
    else if (TinhTrang === 3) color = 'error'
    else if (TinhTrang === 2) color = 'orange'
    else if (TinhTrang === 1) color = 'light-green-lighten-1'
    else if (TinhTrang === 0) color = ''
    return color
}
function getTextTinhTrangDiem_C1(TinhTrang) {
    let text = ''
    if (TinhTrang === 8) text = 'Duyệt (Công bố phụ huynh)'
    else if (TinhTrang === 7) text = 'BGH từ chối'
    else if (TinhTrang === 6) text = 'Tổ trưởng Gửi BGH'
    else if (TinhTrang === 5) text = 'Tổ trưởng từ chối'
    else if (TinhTrang === 4) text = 'GVCN gửi điểm'
    else if (TinhTrang === 3) text = 'GVCN từ chối gửi điểm bộ môn'
    else if (TinhTrang === 2) text = 'GVBM gửi điểm'
    else if (TinhTrang === 1) text = 'Lưu tạm'
    else if (TinhTrang === 0) text = 'Chưa lưu'
    return text
}


function fn_IsDisabledTinhTrangDiem({ TinhTrang, type, CapID }) {
    let arrStatusGV = [0, 1, 2, 3, 4]
    const obj = {
        color: CapID === 1 ? getColorTinhTrangDiem_C1(TinhTrang) : getColorTinhTrangDiem(TinhTrang),
        isDisabled: false,
        text: CapID === 1 ? getTextTinhTrangDiem_C1(TinhTrang) : getTextTinhTrangDiem(TinhTrang),
        type: type,
        TinhTrang: TinhTrang
    }
    if (TinhTrang === null) obj

    if (CapID === 1) arrStatusGV = [0, 1, 2, 3, 4, 6, 7, 8]
    else arrStatusGV = [0, 1, 2, 3, 4]

    if (CapID === 1) {
        if (arrStatusGV.indexOf(TinhTrang) >= 0) {
            if (TinhTrang == 0
                || TinhTrang == 1
                || TinhTrang == 3
                || TinhTrang == 5
                || TinhTrang == 7
            ) obj.isDisabled = false
            else obj.isDisabled = true
        }
        return obj
    } else {
        if (type === 'GV') {
            if (arrStatusGV.indexOf(TinhTrang) >= 0) {
                if (TinhTrang == 0 || TinhTrang == 1 || TinhTrang == 3) obj.isDisabled = false
                else obj.isDisabled = true

            }
        } else {
            //Tình trang 2: Gửi tổ trưởng
            if (TinhTrang === 2) obj.isDisabled = false
            else obj.isDisabled = true
        }
        return obj
    }

}

function fn_ProrityTinhTrang(DSHocSinh) {
    if (!DSHocSinh?.length) return;

    const priorityOrder = [8, 7, 6, 5, 4, 2, 3, 1, 0]; // Thứ tự ưu tiên

    return DSHocSinh.reduce((max, hs) => {
        return priorityOrder.indexOf(hs.TinhTrang) < priorityOrder.indexOf(max.TinhTrang) ? hs : max;
    }, DSHocSinh[0]);
}

function IsCheck_NotRoleParent(user) {
    if (user.GroupID === 2) {
        vueData.v_Set.menu = false
        confirm({
            title: "Bạn không có quyền truy cập",
            action: function () {
                redirect('/ph-report')
            },
            cancel: function () {
                redirect('/ph-report')
            },
        })
        return
    } else if (user.GroupID === 3) {
        vueData.v_Set.menu = false
        confirm({
            title: "Bạn không có quyền truy cập",
            action: function () {
                redirect('/lms-student-dashboard-COPY')
            },
            cancel: function () {
                redirect('/lms-student-dashboard-COPY')
            },
        })
        return
    }
}



//------------------ SỬ DỤNG CHO CHART  ------------------------///
// Tính chiều rộng dựa trên số lượng ký tự
function calculateColumnWidth(text) {
    const charWidth = 15; // Kích thước trung bình mỗi ký tự
    return text.length * charWidth;
}

// function getColumnAddress(columns, columnName, numberCols) {
//     let char = 68
//     let charOver = 65
//     if (numberCols === 4) char = 69
//     const columnMap = {};
//     columns.forEach((column, index) => {
//         //Mẫn thêm 24/07 nếu vượt qua kí tự Z thì set về AA,..
//         const columnAddress = (char + index) <= 90 ? String.fromCharCode(char + index) : (String.fromCharCode(65) + String.fromCharCode(65+(index-22))) ; // 67 là mã ASCII của 'C'
//         columnMap[column.name] = columnAddress;
//     });
//     return columnMap[columnName] || columnName; // Trả về địa chỉ cột nếu có, nếu không giữ nguyên tên cột
// }

function getColumnAddress(columns, columnName, freezeColumns = 0) {
    const columnMap = {};

    // Hàm chuyển index thành địa chỉ cột Excel (A, B, ..., Z, AA, AB, ...)
    function numberToExcelColumn(n) {
        let result = '';
        while (n >= 0) {
            result = String.fromCharCode((n % 26) + 65) + result;
            n = Math.floor(n / 26) - 1;
        }
        return result;
    }

    columns.forEach((column, index) => {
        const columnAddress = numberToExcelColumn(index + freezeColumns); // cộng offset freeze
        columnMap[column.name] = columnAddress;
    });

    return columnMap[columnName] || columnName;
}
function replaceFormula(columns, formula, indexRow, numberCols) {
    // Thay IIF thành IF trước (hoặc sau đều được)
    formula = formula.replace(/\bIIF\b/g, 'IF');

    const formulaReplace = formula.replace(/\b\w+_\w+\b/g, (match) => {
        try {
            // Lấy địa chỉ cột từ tên cột

            const columnAddress = getColumnAddress(columns, match, numberCols);
            // Trả về địa chỉ cột + số dòng
            const string = `${columnAddress}${indexRow}`
            return string;
        } catch (error) {
            // Nếu có lỗi, trả về nguyên mẫu (match) mà không thay thế
            console.error(`Error processing column ${match}:`, error);
            return match;  // Trả về tên cột nếu có lỗi
        }
    });
    return formulaReplace
}


function getColumnAddressTH(columns, columnName) {
    let char = 68
    const columnMap = {};
    columns.forEach((column, index) => {
        const columnAddress = String.fromCharCode(char + index); // 67 là mã ASCII của 'C'
        columnMap[column.name] = columnAddress;
    });
    return columnMap[columnName] || columnName; // Trả về địa chỉ cột nếu có, nếu không giữ nguyên tên cột
}
function replaceFormulaTH(columns, formula, indexRow) {
    // Thay IIF thành IF trước (hoặc sau đều được)
    formula = formula.replace(/\bIIF\b/g, 'IF');

    return formula.replace(/\b\w+_\w+\b/g, (match) => {
        try {
            // Lấy địa chỉ cột từ tên cột
            const columnAddress = getColumnAddressTH(columns, match);
            // Trả về địa chỉ cột + số dòng
            return `${columnAddress}${indexRow}`;
        } catch (error) {
            // Nếu có lỗi, trả về nguyên mẫu (match) mà không thay thế
            console.error(`Error processing column ${match}:`, error);
            return match;  // Trả về tên cột nếu có lỗi
        }
    });
}

function stringToColor(str) {
    if (str) {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash)
        }
        let color = '#'
        for (let i = 0; i < 3; i++) {
            let value = (hash >> (i * 8)) & 0xFF
            color += ('00' + value.toString(16)).slice(-2)
        }
        return color
    }
}

function renderDSKhoi() {
    const DSKhoi = Array.from({ length: 12 }).map((_, i) => {
        const value = i + 1;
        let CapID;
        if (value >= 1 && value <= 5) {
            CapID = 1;
        } else if (value >= 6 && value <= 9) {
            CapID = 2;
        } else if (value >= 10 && value <= 12) {
            CapID = 3;
        }
        return {
            title: `Khối ${value}`,
            value,
            CapID,
        };
    });
    return DSKhoi;
}

function calculateKDE(data, xValues) {
    // 1. Trích xuất điểm dữ liệu từ trường "Diem"
    const points = data.map(item => item.Diem);
    // 2. Tính toán các tham số thống kê
    const n = points.length;
    const mean = points.reduce((a, b) => a + b, 0) / n;
    const variance = points.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (n - 1);
    const std = Math.sqrt(variance);
    // 3. Bandwidth theo Scott's rule
    //const bandwidth = 1.06 * std * Math.pow(n, -1 / 5); // Scott
    //const bandwidth = 0.3 * std * Math.pow(n, -1 / 3); //giai thuat ban đầu Silverman
    //const bandwidth = 0.8 * std;  //Anh Tâm thử để cho kde mượt hơn , ban đầu dùng Scott
    const bandwidth = Math.max(1.2 * std, 0.5);
    // Hàm Gaussian kernel
    const gaussianKernel = (u) => (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);
    //const epanechnikovKernel = (u) => Math.abs(u) <= 1 ? 0.75 * (1 - u * u) : 0;

    // 5. Tính mật độ KDE cho từng điểm x trong xValues
    const kdeData = xValues.map(x => {
        let density = 0;
        for (const point of points) {
            const u = (x - point) / bandwidth;
            density += gaussianKernel(u);
        }
        density /= (n * bandwidth);
        return {
            x: x,
            y: Number(density.toFixed(2))
        };
    });
    return kdeData;
}
function linspace(start, end, steps) {
    const result = [];
    const step = (end - start) / (steps - 1);
    for (let i = 0; i < steps; i++) { result.push(start + step * i); } return result;
}
function createHistogramDataWithFixedBins_OLD(data) {
    const points = data.map(item => item.Diem);
    const min = Math.min(...points);
    const max = Math.max(...points);
    let numBins = 15;//max - min;
    const bins = this.linspace(min, max, numBins + 1)
    // console.log(bins)
    // bin_x = bins;
    const counts = Array(numBins).fill(0)
    for (const value of points) {
        for (let i = 0; i < numBins; i++) { if (value >= bins[i] && value < bins[i + 1]) { counts[i]++; break; } }
    }
    let binWidth;
    if (bins.length > 1) {
        binWidth = bins[1] - bins[0];
    }
    else {
        binWidth = 1
    }
    const density = counts.map(count => count / (points.length * binWidth));
    const histogramData = bins.slice(0, -1).map((binStart, index) => ({
        x: binStart,
        binStart: binStart.toFixed(2),
        binEnd: bins[index + 1],
        y: counts[index],
        midPoint: (binStart + bins[index + 1]) / 2,
        label: `${binStart.toFixed(2)}`
    }));
    //Add last element if it is equal to max
    if (bins[bins.length - 1] === 10) {
        histogramData.push({
            x: 10, // Use 10 for x coordinate
            binStart: 10,
            binEnd: 10,
            y: 0,
            midPoint: 10,
            label: `10`
        })
    }
    // console.log(histogramData);
    // console.log(bin_x);
    return { histogramData, fixedBins: bins, bin_x_data: bins };
}

function createHistogramDataWithFixedBins(data) {
    const points = data.map(item => item.Diem);

    const min = 0;
    const max = 10;
    const binWidth = 0.5;

    // Tạo bins cố định: [0, 0.5, 1.0, ..., 10.0]
    const bins = [];
    for (let i = min; i <= max; i += binWidth) {
        bins.push(parseFloat(i.toFixed(2)));
    }

    const numBins = bins.length - 1;
    const counts = Array(numBins).fill(0);

    for (const value of points) {
        for (let i = 0; i < numBins; i++) {
            if (value >= bins[i] && value < bins[i + 1]) {
                counts[i]++;
                break;
            }
        }
        // Trường hợp đặc biệt nếu value = 10 thì cho vào bin cuối cùng
        if (value === max) {
            counts[numBins - 1]++;
        }
    }

    const density = counts.map(count => count / (points.length * binWidth));

    const histogramData = bins.slice(0, -1).map((binStart, index) => ({
        x: binStart,
        binStart: binStart.toFixed(2),
        binEnd: bins[index + 1],
        y: counts[index],
        midPoint: (binStart + bins[index + 1]) / 2,
        label: `${binStart.toFixed(2)}–${bins[index + 1].toFixed(2)}`
    }));

    return { histogramData, fixedBins: bins, bin_x_data: bins };
}

function calculateBoxplotStats(arr) {
    const sortedData = [...arr].sort((a, b) => a - b);
    const n = sortedData.length;
    // Tính Q1, Q3, Median
    const q1Index = Math.floor(n / 4);
    const medianIndex = Math.floor(n / 2);
    const q3Index = Math.floor(3 * n / 4);
    const q1 = sortedData[q1Index];
    const median = sortedData[medianIndex];
    const q3 = sortedData[q3Index];
    // Tính IQR
    const iqr = q3 - q1;
    // Tính ngưỡng cho outliers
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    // Tìm outliers
    const outliers = sortedData.filter(x => x < lowerBound || x > upperBound);
    return {
        min: sortedData[0],
        q1,
        median,
        q3,
        max: sortedData[n - 1],
        outliers,
        lowerBound,
        upperBound
    };
}
//Lấy column để render ra trục x
function processData(data, column) {
    const classScores = {};
    data.forEach(item => {
        if (!classScores[item[column]]) {
            classScores[item[column]] = [];
        }
        classScores[item[column]].push(item.Diem);
    });
    // Tính toán các chỉ số thống kê
    const stats = {};
    for (let lop in classScores) {
        const scores = classScores[lop];
        stats[lop] = {
            mean: this.calculateMean(scores),
            median: this.calculateMedian(scores),
            standardDeviation: this.calculateStandardDeviation(scores)
        };
    }
    return stats;
}
// Tính trung bình
function calculateMean(scores) {
    return Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
}
// Tính trung vị
function calculateMedian(scores) {
    const sorted = [...scores].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
        ? (sorted[middle - 1] + sorted[middle]) / 2
        : sorted[middle];
    return Number(median.toFixed(2));
}
// Tính độ lệch chuẩn
function calculateStandardDeviation(scores) {
    const mean = this.calculateMean(scores);
    const variance = scores.reduce((acc, score) => {
        return acc + Math.pow(score - mean, 2);
    }, 0) / scores.length;
    return Number(Math.sqrt(variance).toFixed(2));
}
function sortTenLop(data) {

    const rawData = _.cloneDeep(data)
    return rawData.sort((a, b) => {
        const parseTenLop = (lop) => {
            const match = lop.match(/(\d+)([A-Z]+)/); // Tách số và chữ cái
            return match ? [parseInt(match[1], 10), match[2]] : [0, ''];
        };
        const [numA, charA] = parseTenLop(a.TenLop);
        const [numB, charB] = parseTenLop(b.TenLop);
        // So sánh số trước, nếu bằng thì so sánh chữ
        if (numA === numB) {
            return charA.localeCompare(charB);
        }
        return numA - numB;
    });
}
// Hàm tính hồi quy tuyến tính
function calculateLinearRegression(xData, yData) {
    const n = xData.length;
    // Tính tổng các giá trị
    const sumX = xData.reduce((a, b) => a + b, 0);
    const sumY = yData.reduce((a, b) => a + b, 0);
    const sumXY = xData.reduce((a, b, i) => a + b * yData[i], 0);
    const sumXSquare = xData.reduce((a, b) => a + b * b, 0);
    // Tính hệ số góc (slope) và hệ số chặn (intercept)
    const slope = (n * sumXY - sumX * sumY) / (n * sumXSquare - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    // Tính hệ số tương quan (R-squared)
    const yMean = sumY / n;
    const totalSumSquares = yData.reduce((a, b) => a + Math.pow(b - yMean, 2), 0);
    const regressionPredictions = xData.map(x => slope * x + intercept);
    const regressionSumSquares = regressionPredictions.reduce((a, pred, i) => a + Math.pow(pred - yMean, 2), 0);
    const rSquared = regressionSumSquares / totalSumSquares;
    return {
        slope,
        intercept,
        rSquared,
        equation: `y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`,
        regressionLine: xData.map(x => ({
            x: x,
            y: slope * x + intercept
        }))
    };
}


function renderText(capid) {

    return "Cấp " + capid
}

function getTitlePageByURL(url) {
    let text = ""
    let parentMenu = $projectData.menuLeft
    for (let i = 0; i < parentMenu.length; i++) {
        let childMenu = parentMenu[i]?.submenu
        if (childMenu?.length > 0) {
            let objFindMenu = childMenu.find(item => item.url.includes(url))
            if (objFindMenu) {
                text = objFindMenu.name
                break
            }
        }

    }
    return text
}

function renderUrlYoutube(source) {
    let urlObj;

    try {
        urlObj = new URL(source);
    } catch (e) {
        // Nếu không phải URL hợp lệ → trả lại nguyên chuỗi
        return source;
    }

    let videoId = '';
    let startTime = '';

    const host = urlObj.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
        // Dạng rút gọn
        videoId = urlObj.pathname.slice(1);
        startTime = urlObj.searchParams.get('t');
    } else if (host === 'youtube.com' || host === 'm.youtube.com') {
        // Dạng đầy đủ
        videoId = urlObj.searchParams.get('v');
        startTime = urlObj.searchParams.get('t') || urlObj.searchParams.get('start');
    } else {
        // Không phải YouTube → trả lại nguyên URL
        return source;
    }

    if (!videoId) {
        // Không có videoId → không chuyển đổi
        return source;
    }

    // Tạo URL embed
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return startTime
        ? `${embedUrl}?start=${parseInt(startTime, 10)}`
        : embedUrl;
}

function questionsTypesLabel(type) {
    const questionsComponents = [
        //quiz
        { type: 'QUIZ_SINGLE_CHOICE', label: 'Trắc nghiệm', label_EN: 'Single Choice', description: "Một đáp án", icon: 'mdi-radiobox-marked', kind: "quiz" },
        { type: 'QUIZ_MULTIPLE_CHOICE', label: 'Trắc nghiệm', label_EN: 'Multiple Choice', description: "Nhiều đáp án", icon: 'mdi-checkbox-multiple-marked-outline', kind: "quiz" },
        { type: 'QUIZ_TRUE_FALSE', label: 'Đúng / Sai', label_EN: 'True / False', icon: 'mdi-check-circle-outline', kind: "quiz" },
        { type: 'QUIZ_MULTIPLE_TRUE_FALSE', label: 'Nhiều đúng / Sai', label_EN: 'Multiple True / False', icon: 'mdi-check-circle-outline', kind: "quiz" },
        { type: 'QUIZ_FILL_IN_BLANK', label: 'Điền vào chỗ trống', label_EN: 'Fill in the Blank', icon: 'mdi-form-textbox', kind: "quiz" },
        { type: 'QUIZ_MATCHING', label: 'Ghép nối', label_EN: 'Matching', icon: 'mdi-merge', kind: "quiz" },

        //manual
        { type: 'SHORT_ANSWER', label: 'Trả lời ngắn', label_EN: 'Short Answer', icon: 'mdi-text-short', kind: "manual" },
        { type: 'ESSAY', label: 'Tự luận', label_EN: 'Essay', description: "Soạn thảo", icon: 'mdi-text-long', kind: "manual" },
        { type: 'FILE_UPLOAD', label: 'Nộp File', label_EN: 'File Upload', icon: 'mdi-upload-multiple', kind: "manual" },
        { type: 'AUDIO_RESPONSE', label: 'Ghi âm trả lời', label_EN: 'Audio Response', icon: 'mdi-microphone-plus', kind: "manual" },

    ]
    let objTypeFind = _.find(questionsComponents, (item) => item.type === type)
    if (objTypeFind) {
        return { label_EN: objTypeFind.label_EN, label: objTypeFind.label, icon: objTypeFind.icon, kind: objTypeFind.kind, color: objTypeFind.kind === "quiz" ? "blue" : "warning" }
    } else {
        return undefined
    }
} 
/***********************
 * ajaxCallPromise
 ***********************/
function ajaxCALLPromise(url, params = null) {
    return new Promise(resolve => {
        ajaxCALL(url, params, res => {
            if (res?.data) resolve(res.data)
            else resolve(res)
        })
    })
}
