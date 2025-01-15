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
function convertChartScatterGV() {
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
    // Chuẩn bị dữ liệu
    const xData_NN = vueData.DataChartGV_API.map(item => item.PDP_GV_NN);
    const yData_NN = vueData.DataChartGV_API.map(item => item.DiemTB);
    // Tính toán hồi quy
    const regression_NN = calculateLinearRegression(xData_NN, yData_NN);
    // Chuẩn bị dữ liệu
    const xData_VN = vueData.DataChartGV_API.map(item => item.PDP_GV_VN);
    const yData_VN = vueData.DataChartGV_API.map(item => item.DiemTB);
    // Tính toán hồi quy
    const regression_VN = calculateLinearRegression(xData_VN, yData_VN);
    vueData.DataChartGV.NN = {
        datasets: [{
            label: 'Điểm',
            data: vueData.DataChartGV_API.map(item => ({ x: item.PDP_GV_NN, y: item.DiemTB })),
        },
        {
            label: 'Đường Hồi Quy',
            data: regression_NN.regressionLine,
            type: 'line',
        }]
    }
    vueData.DataChartGV.VN = {
        datasets: [{
            label: 'Điểm',
            data: vueData.DataChartGV_API.map(item => ({ x: item.PDP_GV_VN, y: item.DiemTB })),
        },
        {
            label: 'Đường Hồi Quy',
            data: regression_VN.regressionLine,
            type: 'line',
        }]
    }
}
function convertChartDiemTrungBinhTheme() {
    vueData.DataChart1.DiemTrungBinh = {
        labels: vueData.DataChart_DiemTrungBinhTheme_API.map(x => x.MaCotDiem),
        datasets: [{
            label: "Điểm",
            data: vueData.DataChart_DiemTrungBinhTheme_API.map(x => parseFloat(x.KetQuaDanhGia_VI)),
        }]
    }
}
function convertChartDiemTrungBinh_Lop_Theme() {
    vueData.DataChart2.DiemTrungBinh = {
        labels: vueData.DataChart_DiemTrungBinhTheme_Lop_API.map(x => x.MaCotDiem),
        datasets: [{
            label: "Điểm",
            data: vueData.DataChart_DiemTrungBinhTheme_Lop_API.map(x => parseFloat(x.DiemTrungBinhLop)),
        }]
    }
}
function convertChartDiemKyNang() {
    const kyNang = vueData.DataChart_KyNangTheme_API.filter(x => x.MaNhomCotDiem === 'S1_Mid' || x.MaNhomCotDiem === 'S1_Final')
    const labelsKyNang = [...new Set(kyNang.map(x => x.TenCotDiem_EN))]
    const theme = vueData.DataChart_KyNangTheme_API.filter(x => x.MaNhomCotDiem !== 'S1_Mid' && x.MaNhomCotDiem !== 'S1_Final')
    const labelsTheme = [...new Set(theme.map(x => x.TenCotDiem_EN))]
    const datasetsTheme_1 = theme.filter(x => x.MaNhomCotDiem === "Theme_1").map(x => x.KetQuaDanhGia_VI)
    const datasetsTheme_2 = theme.filter(x => x.MaNhomCotDiem === "Theme_2").map(x => x.KetQuaDanhGia_VI)
    const datasetsTheme_3 = theme.filter(x => x.MaNhomCotDiem === "Theme_3").map(x => x.KetQuaDanhGia_VI)
    const datasetsTheme_4 = theme.filter(x => x.MaNhomCotDiem === "Theme_4").map(x => x.KetQuaDanhGia_VI)
    const chartTheme = {
        labels: labelsTheme,
        datasets: [
            {
                label: "Theme 1",
                data: datasetsTheme_1
            },
            {
                label: "Theme 2",
                data: datasetsTheme_2
            },
            {
                label: "Theme 3",
                data: datasetsTheme_3
            },
            {
                label: "Theme 4",
                data: datasetsTheme_4
            }
        ]
    }
    const chartKyNang = {
        labels: labelsKyNang,
        datasets: [{
            label: "Điểm giữa kì",
            data: kyNang.filter(x => x.MaNhomCotDiem === 'S1_Mid').map(x => x.KetQuaDanhGia_VI)
        },
        {
            label: "Điểm cuối kì",
            data: kyNang.filter(x => x.MaNhomCotDiem === 'S1_Final').map(x => x.KetQuaDanhGia_VI)
        }]
    }
    vueData.DataChart_KyNang = {
        Theme: chartTheme,
        KyNang: chartKyNang
    }
}