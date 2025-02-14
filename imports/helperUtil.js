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

function fn_IsDisabledTinhTrangDiem({ TinhTrang, type }) {
    if (!TinhTrang) return
    const arrStatusGV = [0, 1, 2, 3, 4]
    const obj = {
        isDisabled: false,
    }
    if (type === 'GV') {
        if (arrStatusGV.indexOf(TinhTrang) >= 0) {
            if (TinhTrang == 0 || TinhTrang == 1 || TinhTrang == 3) {
                obj.isDisabled = false
            } else {
                obj.isDisabled = true
            }
        }
    } else {
        if (TinhTrang === 2) obj.isDisabled = false
        else obj.isDisabled = true
    }
    return obj
}


//------------------ SỬ DỤNG CHO CHART  ------------------------///
// Tính chiều rộng dựa trên số lượng ký tự
function calculateColumnWidth(text) {
    const charWidth = 15; // Kích thước trung bình mỗi ký tự
    return text.length * charWidth;
} 

function getColumnAddress(columns, columnName) {
    const columnMap = {};
    columns.forEach((column, index) => {
        const columnAddress = String.fromCharCode(68 + index); // 67 là mã ASCII của 'C'
        columnMap[column.name] = columnAddress;
        // console.log(columnMap)
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
    const bandwidth = 1.06 * std * Math.pow(n, -1 / 5); // Scott
    //const bandwidth = 0.3 * std * Math.pow(n, -1 / 3); //giai thuat ban đầu Silverman
    // Hàm Gaussian kernel
    const gaussianKernel = (u) => (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);
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
function createHistogramDataWithFixedBins(data) {
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
    console.log(counts)
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