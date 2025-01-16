function getJsonImg(canvasId) {
    // Lấy đối tượng biểu đồ từ ID canvas
    const chartInstance = Chart.getChart(canvasId);  // canvasId là ID của canvas mà bạn muốn lấy dữ liệu
    // Kiểm tra nếu không có biểu đồ với canvasId
    if (!chartInstance) {
        console.error("Biểu đồ không tồn tại với canvasId:", canvasId);
        return null;
    }
    // Lấy dữ liệu biểu đồ từ đối tượng chartInstance
    const chartData = chartInstance.data;
    // Chuyển dữ liệu thành JSON và trả về
    return JSON.stringify(chartData, null, 2);
}
// Lấy Base64 từ canvas
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file); // Chuyển tệp thành Base64
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};
const  fetchGPTResponse = (message = []) => {
    let res = new Promise((resolve) => {
        vueData.v_Loading = true
        $.ajax({
            type: 'POST',
            headers: {
                authorization: `Bearer ${'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'}`,
            },
            url:'https://api.openai.com/v1/chat/completions',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            crossDomain: true,
            data: JSON.stringify({
                model: "o1-mini", // Hoặc "gpt-4" nếu bạn sử dụng GPT-4
                messages: message,
                temperature: 0.7, // Điều chỉnh theo nhu cầu
            }),
            success: function (d) {
                response = {
                    IsSuccess: true,
                    Message: null,
                    Result: d.data
                }
                resolve(response)
            },
            error: function (xhr, ajaxOptions, thrownError) {
                Toast.error({
                    title: 'Thông báo',
                    text: xhr?.responseJSON?.Message,
                })
                response = {
                    IsSuccess: false,
                    Message: xhr.responseJSON?.Message,
                    Result: null
                }
                resolve(response)
            },
            complete: function (data) {
                vueData.v_Loading = false
            },
        })
    })
    console.log(res)
    return res
}
const sendChartImageToGPT = async (params) => {
    let { chart1, chart2, prompt } = params
    let promptSend = vueData.PromptGPT[prompt]
    const charts = Object.entries(params).filter(([key]) => key.startsWith("chart"));
    // Sinh ra các biến JSON tương ứng
    const chartJsons = charts.map(([key, value]) => ({
        [key + "Json"]: getJsonImg(value) // Gọi hàm `getJsonImg` với dữ liệu tương ứng
    }));
    // Kết quả là một mảng các đối tượng JSON
    console.log(chartJsons);
    debugger
    let res=  await new Promise((resolve) => {
        vueData.v_Loading = true
        $.ajax({
            type: 'POST',
            headers: {
                // key 1: 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
                // key 2: sk - proj - v3qYrBAmYotum9Dt0jqmeIkQeQUT52rVZqPxkE3i0g - tvwrTKb3rLgc1mQUWaXsgrtYGIpnotUT3BlbkFJFSvDGL37PWBIeYPjFXH3BW0Hw_dZsiGE6qmr3j0pCKlQiT - 2Vt4rPOZVEFAuwF0cP3NU0Oq3MA
                authorization: `Bearer ${'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'}`,
            },
            url: 'https://api.openai.com/v1/chat/completions',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            crossDomain: true,
            data: JSON.stringify({
                model: "gpt-4o-mini", // Hoặc "gpt-4" nếu bạn sử dụng GPT-4
                messages: [
                    { role: "system", content: "You are a data visualization expert." },
                    { role: "system", content: promptSend },
                    { role: "user", content: JSON.stringify({ chartData: chartJsons }) },
                ],
                temperature: 1, // Điều chỉnh theo nhu cầu
            }),
            success: function (d) {
                response = {
                    IsSuccess: true,
                    Message: null,
                    Result: d.data
                }
                resolve(response)
            },
            error: function (xhr, ajaxOptions, thrownError) {
                Toast.error({
                    title: 'Thông báo',
                    text: xhr?.responseJSON?.Message,
                })
                response = {
                    IsSuccess: false,
                    Message: xhr.responseJSON?.Message,
                    Result: null
                }
                resolve(response)
            },
            complete: function (data) {
                vueData.v_Loading = false
            },
        })
    })
    console.log(res)
    return res
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