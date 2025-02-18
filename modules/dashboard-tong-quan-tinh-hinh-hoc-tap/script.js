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
function convertChartDiemTrungBinh() {
    const datasets = [
        {
            label: "Điểm giữa học kỳ 1",
            data: vueData.DiemTrungBinh_API.map(x => x.DiemGiua_HK1)
        },
        {
            label: "Điểm cuối học kỳ 1",
            data: vueData.DiemTrungBinh_API.map(x => x.DiemCuoi_HK1)
        },
        {
            label: "Điểm trung bình học kỳ 1",
            data: vueData.DiemTrungBinh_API.map(x => x.DiemTB_HK1)
        }
    ]
    vueData.DataChart1.DiemTrungBinh = {
        labels: vueData.DiemTrungBinh_API.map(x => x.TenLop),
        datasets: datasets
    }
}
// function convertChartHistogram() {
//     // Chuẩn bị dữ liệu series và categories từ API
//     const seriesData = vueData.DataChartHistogram_API.map(item => item.TanSuat); // Giá trị tần suất
//     const categories = vueData.DataChartHistogram_API.map(item => item.PhoDiem); // Giá trị điểm
//     // Định nghĩa cấu hình cho ApexCharts
//     vueData.DataChartHistogram = {
//         ...vueData.DataChartHistogram,
//         series: [{
//             name: 'Tần suất',
//             data: seriesData // Giá trị tần suất
//         }],
//         xaxis: {
//             categories: categories, // Điểm số làm trục X
//             title: {
//                 text: 'Điểm số' // Tiêu đề trục X
//             }
//         },
//         yaxis: {
//             title: {
//                 text: 'Tần suất' // Tiêu đề trục Y
//             },
//             min: 0 // Đảm bảo giá trị bắt đầu từ 0
//         },
//         title: {
//             text: 'Phổ điểm theo tần suất', // Tiêu đề biểu đồ
//             align: 'center' // Căn giữa tiêu đề
//         },
//         tooltip: {
//             y: {
//                 formatter: function (val) {
//                     return `${val} lượt`; // Định dạng tooltip
//                 }
//             }
//         }
//     };
// }
function convertChartHistogram() {
    let bin_x;
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
    function createHistogramDataWithFixedBins(data) {
        const points = data.map(item => item.Diem);
        const min = Math.min(...points);
        const max = Math.max(...points);
        let numBins = 15;//max - min;
        const bins = linspace(min, max, numBins + 1)
        console.log(bins)
        bin_x = bins;
        const counts = Array(numBins).fill(0)
        for (const value of points) {
            for (let i = 0; i < numBins; i++) {
                if (value >= bins[i] && value < bins[i + 1]) {
                    counts[i]++;
                    break;
                }
            }
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
        console.log(histogramData);
        console.log(bin_x);
        return { histogramData, fixedBins: bins };
    }
    // 1. Lấy dữ liệu điểm từ API
    const rawData = vueData.DataChartHistogram_API;
    // 2. Tạo histogram data với bin cố định
    const { histogramData, fixedBins } = createHistogramDataWithFixedBins(rawData);
    // 3. Lấy trung điểm của bin
    const midPoints = histogramData.map(item => item.midPoint)
    // 4. Tính toán KDE
    const kdeData = calculateKDE(rawData, midPoints);
    const histogramDataWithKDE = histogramData.map((item, index) => ({
        ...item,
        kde: kdeData[index]?.y || 0
    }));
    vueData.DataChartHistogram = {
        ...vueData.DataChartHistogram,
        series: [
            {
                name: 'Histogram',
                type: 'column',
                data: histogramDataWithKDE.map(item => item.y),
                borderColor: '#000',
                borderWidth: 1,
                backgroundColor: 'rgba(255, 193, 7, 0.7)',
                yAxis: 0
            },
            {
                name: 'KDE',
                type: 'line',
                //data: histogramDataWithKDE.map(item => ({ x: item.x, y: item.kde })),
                data: histogramDataWithKDE.map(item => item.kde),
                borderColor: 'red',
                yAxis: 1,
                tension: 0.4,
            }
        ],
        chart: {
            height: 500,
            type: 'line',
            stacked: false
        },
        stroke: {
            width: [1, 2],
            curve: 'smooth'
        },
        plotOptions: {
            bar: {
                columnWidth: '100%'
            }
        },
        xaxis: {
            categories: bin_x,//histogramDataWithKDE.map(item => item.x),
            title: {
                text: 'Tổng (Total) Score',
                style: {
                    fontSize: '12px',
                    fontWeight: 600
                }
            },
            labels: {
                hideOverlappingLabels: false, // Hiển thị tất cả nhãn, ngay cả khi chúng bị chồng chéo
                formatter: function (value) {
                    if (typeof value === 'number') {
                        return value.toFixed(2);  // Định dạng thành số thập phân
                    }
                    return value;  // Trả lại giá trị nguyên gốc nếu không phải là số
                },
                style: {
                    fontSize: '10px'
                },
                show: true, // Hiển thị nhãn
            },
            // tickAmount: 20, // Thử tăng số lượng tick
            // min: bin_x[0], // Thiết lập giá trị min để đảm bảo hiển thị đầy đủ
            // max: bin_x[bin_x.length - 1], // Thiết lập giá trị max
        },
        yaxis: [
            {
                seriesName: 'Histogram',
                min: 0,
                title: {
                    text: 'Frequency',
                    style: {
                        color: '#008FFB'
                    }
                },
                labels: {
                    formatter: function (value) {
                        return value.toFixed(2);
                    },
                    style: {
                        color: '#008FFB'
                    }
                }
            },
            {
                seriesName: 'KDE',
                opposite: true,
                min: 0,
                title: {
                    text: 'Mật Độ KDE',
                    style: {
                        color: '#FF4560'
                    }
                },
                labels: {
                    formatter: function (value) {
                        return value.toFixed(2);
                    },
                    style: {
                        color: '#FF4560'
                    }
                }
            }
        ],
        tooltip: {
            shared: true,
            intersect: false
        },
        legend: {
            show: true,
            position: 'top'
        },
        grid: {
            show: true,
            borderColor: '#90A4AE',
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: true,
                }
            },
            yaxis: {
                lines: {
                    show: true,
                }
            },
        },
        title: {
            text: 'Distribution of Tổng (Total) Scores',
            align: 'center'
        }
    };
}
function linspace(start, end, steps) {
    const result = [];
    const step = (end - start) / (steps - 1);
    for (let i = 0; i < steps; i++) {
        result.push(start + step * i);
    }
    return result;
}
function convertChartBoxPlot() {
    const data = vueData.DataChartHistogram_API.map(x => x.Diem)
    // Hàm tính toán các giá trị thống kê
    // Hàm tính toán các giá trị thống kê
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
    const stats = calculateBoxplotStats(data);
    vueData.DataChartBoxPlot = {
        ...vueData.DataChartBoxPlot,
        series: [{
            data: [{
                x: '',
                y: [stats.min, stats.q1, stats.median, stats.q3, stats.max],
                goals: stats.outliers.map(outlier => ({
                    name: 'Điểm Ngoại Lai',
                    value: outlier,
                    strokeColor: '#FF4560',
                    strokeWidth: 10,
                    strokeHeight: 0,
                    strokeLineCap: 'round',
                }))
            }]
        }],
        chart: {
            type: 'boxPlot',
            height: 350,
            toolbar: { show: true }
        },
        title: {
            text: 'Phân Phối Điểm',
            align: 'center'
        },
        plotOptions: {
            bar: { horizontal: true },
            boxPlot: {
                horizontal: true,
                colors: {
                    upper: '#2E93fA',
                    lower: '#66DA26'
                }
            }
        },
        xaxis: {
            title: { text: 'Điểm Số' },
            min: 0,
            max: 10,
            tickAmount: 10,
            decimalsInFloat: 1
        },
        tooltip: {
            shared: false,
            intersect: true
        }
    };
}
function convertChartMultipleLop() {
    vueData.List_DataChart_Histogram = []
    const dataChart = {
        "id": "chart-histogram",
        "chart": {
            "type": "line"
        },
        "xaxis": {
            "categories": []
        },
        "yaxis": {},
        "series": [],
        "options": {
            "plotOptions": {
                "bar": {
                    "columnWidth": "100%",
                    "endingShape": "flat"
                }
            }
        }
    }
    const sortData = vueData.DataChartHistogram_API.sort((a, b) => {
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
    const uniqueLopID = [...new Set(sortData.map(x => x.LopID))]
    for (const lopID of uniqueLopID) {
        const lop = vueData.DataChartHistogram_API.find(x => x.LopID === lopID)
        let bin_x;
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
        function createHistogramDataWithFixedBins(data) {
            const points = data.map(item => item.Diem);
            const min = Math.min(...points);
            const max = Math.max(...points);
            let numBins = 15;//max - min;
            const bins = linspace(min, max, numBins + 1)
            console.log(bins)
            bin_x = bins;
            const counts = Array(numBins).fill(0)
            for (const value of points) {
                for (let i = 0; i < numBins; i++) {
                    if (value >= bins[i] && value < bins[i + 1]) {
                        counts[i]++;
                        break;
                    }
                }
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
            console.log(histogramData);
            console.log(bin_x);
            return { histogramData, fixedBins: bins };
        }
        // 1. Lấy dữ liệu điểm từ API
        const rawData = vueData.DataChartHistogram_API.filter(x => x.LopID === lopID);
        // 2. Tạo histogram data với bin cố định
        const { histogramData, fixedBins } = createHistogramDataWithFixedBins(rawData);
        // 3. Lấy trung điểm của bin
        const midPoints = histogramData.map(item => item.midPoint)
        // 4. Tính toán KDE
        const kdeData = calculateKDE(rawData, midPoints);
        const histogramDataWithKDE = histogramData.map((item, index) => ({
            ...item,
            kde: kdeData[index]?.y || 0
        }));
        vueData.List_DataChart_Histogram.push({
            ...dataChart,
            id: `chart-histogram-${lopID}`,
            series: [
                {
                    name: 'Histogram',
                    type: 'column',
                    data: histogramDataWithKDE.map(item => item.y),
                    borderColor: '#000',
                    borderWidth: 1,
                    backgroundColor: 'rgba(255, 193, 7, 0.7)',
                    yAxis: 0
                },
                {
                    name: 'KDE',
                    type: 'line',
                    //data: histogramDataWithKDE.map(item => ({ x: item.x, y: item.kde })),
                    data: histogramDataWithKDE.map(item => item.kde),
                    borderColor: 'red',
                    yAxis: 1,
                    tension: 0.4,
                }
            ],
            chart: {
                height: 500,
                type: 'line',
                stacked: false
            },
            stroke: {
                width: [1, 2],
                curve: 'smooth'
            },
            plotOptions: {
                bar: {
                    columnWidth: '100%'
                }
            },
            xaxis: {
                categories: bin_x,//histogramDataWithKDE.map(item => item.x),
                title: {
                    text: 'Tổng (Total) Score',
                    style: {
                        fontSize: '12px',
                        fontWeight: 600
                    }
                },
                labels: {
                    hideOverlappingLabels: false, // Hiển thị tất cả nhãn, ngay cả khi chúng bị chồng chéo
                    formatter: function (value) {
                        if (typeof value === 'number') {
                            return value.toFixed(2);  // Định dạng thành số thập phân
                        }
                        return value;  // Trả lại giá trị nguyên gốc nếu không phải là số
                    },
                    style: {
                        fontSize: '10px'
                    },
                    show: true, // Hiển thị nhãn
                },
                // tickAmount: 20, // Thử tăng số lượng tick
                // min: bin_x[0], // Thiết lập giá trị min để đảm bảo hiển thị đầy đủ
                // max: bin_x[bin_x.length - 1], // Thiết lập giá trị max
            },
            yaxis: [
                {
                    seriesName: 'Histogram',
                    min: 0,
                    title: {
                        text: 'Frequency',
                        style: {
                            color: '#008FFB'
                        }
                    },
                    labels: {
                        formatter: function (value) {
                            return value.toFixed(2);
                        },
                        style: {
                            color: '#008FFB'
                        }
                    }
                },
                {
                    seriesName: 'KDE',
                    opposite: true,
                    min: 0,
                    title: {
                        text: 'Mật Độ KDE',
                        style: {
                            color: '#FF4560'
                        }
                    },
                    labels: {
                        formatter: function (value) {
                            return value.toFixed(2);
                        },
                        style: {
                            color: '#FF4560'
                        }
                    }
                }
            ],
            tooltip: {
                shared: true,
                intersect: false
            },
            legend: {
                show: true,
                position: 'top'
            },
            grid: {
                show: true,
                borderColor: '#90A4AE',
                strokeDashArray: 4,
                xaxis: {
                    lines: {
                        show: true,
                    }
                },
                yaxis: {
                    lines: {
                        show: true,
                    }
                },
            },
            title: {
                text: `Distribution of Tổng (Total) Scores - ${lop.TenLop}`,
                align: 'center'
            }
        });
    }
}
function convertChartLine() {
    // Dữ liệu điểm số
    const rawData = vueData.DataChartHistogram_API
    // Xử lý dữ liệu
    function processData(data) {
        const classScores = {};
        data.forEach(item => {
            if (!classScores[item.TenLop]) {
                classScores[item.TenLop] = [];
            }
            classScores[item.TenLop].push(item.Diem);
        });
        // Tính toán các chỉ số thống kê
        const stats = {};
        for (let lop in classScores) {
            const scores = classScores[lop];
            stats[lop] = {
                mean: calculateMean(scores),
                median: calculateMedian(scores),
                standardDeviation: calculateStandardDeviation(scores)
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
        const mean = calculateMean(scores);
        const variance = scores.reduce((acc, score) => {
            return acc + Math.pow(score - mean, 2);
        }, 0) / scores.length;
        return Number(Math.sqrt(variance).toFixed(2));
    }
    // Xử lý dữ liệu thống kê
    const stats = processData(rawData);
    const classes = Object.keys(stats);
    // Chuẩn bị dữ liệu cho biểu đồ
    const seriesData = [
        {
            name: 'Trung bình (Mean)',
            type: 'line',
            data: classes.map(lop => stats[lop].mean)
        },
        {
            name: 'Trung vị (Median)',
            type: 'line',
            data: classes.map(lop => stats[lop].median)
        },
        {
            name: 'Độ lệch chuẩn (Std Dev)',
            type: 'line',
            data: classes.map(lop => stats[lop].standardDeviation)
        }
    ];
    console.log(123)
    vueData.DataChartLine = {
        ...vueData.DataChartLine,
        series: seriesData,
        chart: {
            height: 450,
            type: 'line',
            zoom: {
                enabled: true
            },
            toolbar: {
                show: true
            }
        },
        dataLabels: {
            enabled: true,
            style: {
                fontSize: '10px'
            }
        },
        stroke: {
            curve: 'smooth',
            width: [3, 3, 3]
        },
        title: {
            text: 'Mean, Median, and Standard Deviation of Total Scores by Class',
            align: 'center'
        },
        grid: {
            row: {
                colors: ['#f3f3f3', 'transparent'],
                opacity: 0.5
            },
        },
        xaxis: {
            categories: classes,
            title: {
                text: 'Class'
            }
        },
        yaxis: {
            title: {
                text: 'Scores'
            },
            labels: {
                formatter: function (value) {
                    return value ? value.toFixed(2) : (value ?? 0);
                }
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'center'
        },
        colors: ['#008FFB', '#00E396', '#FEB019'],
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: function (value) {
                    return value.toFixed(2);
                }
            }
        }
    }
}
function convertChartLineTongDiemTheoKhoi() {
    const chart = {
        "id": "chart-line-tong-diem-theo-khoi",
        "series": [],
        "chart": {
            "height": 350,
            "type": "line",
            "zoom": {
                "enabled": false
            }
        },
        "grid": {
            "row": {
                "colors": [
                    "#f3f3f3",
                    "transparent"
                ],
                "opacity": 0.5
            }
        },
        "dataLabels": {
            "enabled": false
        },
        "stroke": {
            "curve": "straight"
        },
        "xaxis": {
            "categories": []
        }
    }
    const rawData = vueData.DataChartHistogram_Khoi_API
    // Xử lý dữ liệu
    function processData(data) {
        const classScores = {};
        data.forEach(item => {
            if (!classScores[item.TenKhoi]) {
                classScores[item.TenKhoi] = [];
            }
            classScores[item.TenKhoi].push(item.Diem);
        });
        // Tính toán các chỉ số thống kê
        const stats = {};
        for (let lop in classScores) {
            const scores = classScores[lop];
            stats[lop] = {
                mean: calculateMean(scores),
                median: calculateMedian(scores),
                standardDeviation: calculateStandardDeviation(scores)
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
        const mean = calculateMean(scores);
        const variance = scores.reduce((acc, score) => {
            return acc + Math.pow(score - mean, 2);
        }, 0) / scores.length;
        return Number(Math.sqrt(variance).toFixed(2));
    }
    // Xử lý dữ liệu thống kê
    const stats = processData(rawData);
    const classes = Object.keys(stats);
    // Chuẩn bị dữ liệu cho biểu đồ
    const seriesData = [
        {
            name: 'Trung bình (Mean)',
            type: 'line',
            data: classes.map(lop => stats[lop].mean)
        },
        {
            name: 'Trung vị (Median)',
            type: 'line',
            data: classes.map(lop => stats[lop].median)
        },
        {
            name: 'Độ lệch chuẩn (Std Dev)',
            type: 'line',
            data: classes.map(lop => stats[lop].standardDeviation)
        }
    ];
    vueData.DataChart_TongDiemTheoKhoi = {
        ...chart,
        series: seriesData,
        chart: {
            height: 450,
            type: 'line',
            zoom: {
                enabled: true
            },
            toolbar: {
                show: true
            }
        },
        dataLabels: {
            enabled: true,
            style: {
                fontSize: '10px'
            }
        },
        stroke: {
            curve: 'smooth',
            width: [3, 3, 3]
        },
        title: {
            text: 'Mean, Median, and Standard Deviation of Total Scores (Listening, Language, Reading, Writing, Speaking) by Grade',
            align: 'center'
        },
        grid: {
            row: {
                colors: ['#f3f3f3', 'transparent'],
                opacity: 0.5
            },
        },
        xaxis: {
            categories: classes,
            title: {
                text: 'Grade'
            }
        },
        yaxis: {
            title: {
                text: 'Scores'
            },
            labels: {
                formatter: function (value) {
                    return value ? value.toFixed(2) : (value ?? 0);
                }
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'center'
        },
        colors: ['#008FFB', '#00E396', '#FEB019'],
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: function (value) {
                    return value.toFixed(2);
                }
            }
        }
    }
}
function convertChartLineTongDiemTheoLop() {
    const chart = {
        "id": "chart-line-tong-diem-theo-lop",
        "series": [],
        "chart": {
            "height": 350,
            "type": "line",
            "zoom": {
                "enabled": false
            }
        },
        "grid": {
            "row": {
                "colors": [
                    "#f3f3f3",
                    "transparent"
                ],
                "opacity": 0.5
            }
        },
        "dataLabels": {
            "enabled": false
        },
        "stroke": {
            "curve": "straight"
        },
        "xaxis": {
            "categories": []
        }
    }
    vueData.DataChart_TongDiemTheoLop = {
        ...chart,
    }
    console.log(vueData.DataChart_TongDiemTheoLop)
}
function convertChartStatistic() {
    vueData.List_DataChartStatistic = []
    const chart = {
        "id": "chart-line-statistic",
        "series": [],
        "chart": {
            "height": 350,
            "type": "line",
            "zoom": {
                "enabled": false
            }
        },
        "grid": {
            "row": {
                "colors": [
                    "#f3f3f3",
                    "transparent"
                ],
                "opacity": 0.5
            }
        },
        "dataLabels": {
            "enabled": false
        },
        "stroke": {
            "curve": "straight"
        },
        "xaxis": {
            "categories": []
        }
    }
    const uniqueKhoiID = [... new Set(vueData.DataChartLine_Statistic_API.map(x => x.KhoiID))]
    for (const khoiID of uniqueKhoiID) {
        const rawData = vueData.DataChartLine_Statistic_API.filter(x => x.KhoiID === vueData.ChartHistogram_KhoiID)
        const khoiObj = vueData.DataChartLine_Statistic_API.find(x => x.KhoiID === khoiID)
        // Xử lý dữ liệu
        function processData(data) {
            const classScores = {};
            data.forEach(item => {
                if (!classScores[item.TenCotDiem_EN]) {
                    classScores[item.TenCotDiem_EN] = [];
                }
                classScores[item.TenCotDiem_EN].push(item.Diem);
            });
            // Tính toán các chỉ số thống kê
            const stats = {};
            for (let lop in classScores) {
                const scores = classScores[lop];
                stats[lop] = {
                    mean: calculateMean(scores),
                    median: calculateMedian(scores),
                    standardDeviation: calculateStandardDeviation(scores)
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
            const mean = calculateMean(scores);
            const variance = scores.reduce((acc, score) => {
                return acc + Math.pow(score - mean, 2);
            }, 0) / scores.length;
            return Number(Math.sqrt(variance).toFixed(2));
        }
        // Xử lý dữ liệu thống kê
        const stats = processData(rawData);
        const classes = Object.keys(stats);
        // Chuẩn bị dữ liệu cho biểu đồ
        const seriesData = [
            {
                name: 'Trung bình (Mean)',
                type: 'line',
                data: classes.map(lop => stats[lop].mean)
            },
            {
                name: 'Trung vị (Median)',
                type: 'line',
                data: classes.map(lop => stats[lop].median)
            },
            {
                name: 'Độ lệch chuẩn (Std Dev)',
                type: 'line',
                data: classes.map(lop => stats[lop].standardDeviation)
            }
        ];
        vueData.List_DataChartStatistic.push({
            ...chart,
            series: seriesData,
            chart: {
                height: 450,
                type: 'line',
                zoom: {
                    enabled: true
                },
                toolbar: {
                    show: true
                }
            },
            dataLabels: {
                enabled: true,
                style: {
                    fontSize: '10px'
                }
            },
            stroke: {
                curve: 'smooth',
                width: [3, 3, 3]
            },
            title: {
                text: khoiObj?.TenKhoi,// 'Mean, Median, and Standard Deviation of Total Scores by Grade ' + khoiObj?.TenKhoi,
                align: 'center'
            },
            grid: {
                row: {
                    colors: ['#f3f3f3', 'transparent'],
                    opacity: 0.5
                },
            },
            xaxis: {
                categories: classes,
                title: {
                    text: 'Grade'
                }
            },
            yaxis: {
                title: {
                    text: 'Scores'
                },
                labels: {
                    formatter: function (value) {
                        return value ? value.toFixed(2) : (value ?? 0);
                    }
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'center'
            },
            colors: ['#008FFB', '#00E396', '#FEB019'],
            tooltip: {
                shared: true,
                intersect: false,
                y: {
                    formatter: function (value) {
                        return value.toFixed(2);
                    }
                }
            }
        })
    }
}
function convertChartStatistic_KyNang() {
    vueData.List_DataChartStatistic_KyNang = []
    let kyNang = {
        Listening: {},
        Language: {},
        Reading: {},
        Writing: {},
        Speaking: {},
    }
    const chart = {
        "id": "chart-line",
        "series": [],
        "chart": {
            "height": 350,
            "type": "line",
            "zoom": {
                "enabled": false
            }
        },
        "grid": {
            "row": {
                "colors": [
                    "#f3f3f3",
                    "transparent"
                ],
                "opacity": 0.5
            }
        },
        "dataLabels": {
            "enabled": false
        },
        "stroke": {
            "curve": "straight"
        },
        "xaxis": {
            "categories": []
        }
    }
    //Listening
    const dataListening = vueData.DataChartLine_Statistic_API.filter(x => x.TenCotDiem_EN === 'Listening')
    const dataLanguage = vueData.DataChartLine_Statistic_API.filter(x => x.TenCotDiem_EN === 'Language')
    const dataReading = vueData.DataChartLine_Statistic_API.filter(x => x.TenCotDiem_EN === 'Reading')
    const dataWriting = vueData.DataChartLine_Statistic_API.filter(x => x.TenCotDiem_EN === 'Writing')
    const dataSpeaking = vueData.DataChartLine_Statistic_API.filter(x => x.TenCotDiem_EN === 'Speaking')
    const sortDataListening = dataListening.sort((a, b) => {
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
    const sortDataLanguage = dataLanguage.sort((a, b) => {
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
    const sortDataReading = dataReading.sort((a, b) => {
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
    const sortDataWriting = dataWriting.sort((a, b) => {
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
    const sortDataSpeaking = dataSpeaking.sort((a, b) => {
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
    //Xử lý về line
    //Xử lý dữ liệu
    function processData(data) {
        const classScores = {};
        data.forEach(item => {
            if (!classScores[item.TenLop]) {
                classScores[item.TenLop] = [];
            }
            classScores[item.TenLop].push(item.Diem);
        });
        // Tính toán các chỉ số thống kê
        const stats = {};
        for (let lop in classScores) {
            const scores = classScores[lop];
            stats[lop] = {
                mean: calculateMean(scores),
                median: calculateMedian(scores),
                standardDeviation: calculateStandardDeviation(scores)
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
        const mean = calculateMean(scores);
        const variance = scores.reduce((acc, score) => {
            return acc + Math.pow(score - mean, 2);
        }, 0) / scores.length;
        return Number(Math.sqrt(variance).toFixed(2));
    }
    // Xử lý dữ liệu thống kê
    const stats_Listening = processData(sortDataListening);
    const stats_Language = processData(sortDataLanguage);
    const stats_Reading = processData(sortDataReading);
    const stats_Writing = processData(sortDataWriting);
    const stats_Speaking = processData(sortDataSpeaking);
    const classes = Object.keys(stats_Listening); //Lấy data là đủ lớp
    // Chuẩn bị dữ liệu cho biểu đồ
    const seriesData_Listening = [
        {
            name: 'Trung bình (Mean)',
            type: 'line',
            data: classes.map(lop => stats_Listening[lop].mean)
        },
        {
            name: 'Trung vị (Median)',
            type: 'line',
            data: classes.map(lop => stats_Listening[lop].median)
        },
        {
            name: 'Độ lệch chuẩn (Std Dev)',
            type: 'line',
            data: classes.map(lop => stats_Listening[lop].standardDeviation)
        }
    ];
    const seriesData_Language = [
        {
            name: 'Trung bình (Mean)',
            type: 'line',
            data: classes.map(lop => stats_Language[lop].mean)
        },
        {
            name: 'Trung vị (Median)',
            type: 'line',
            data: classes.map(lop => stats_Language[lop].median)
        },
        {
            name: 'Độ lệch chuẩn (Std Dev)',
            type: 'line',
            data: classes.map(lop => stats_Language[lop].standardDeviation)
        }
    ];
    const seriesData_Reading = [
        {
            name: 'Trung bình (Mean)',
            type: 'line',
            data: classes.map(lop => stats_Reading[lop].mean)
        },
        {
            name: 'Trung vị (Median)',
            type: 'line',
            data: classes.map(lop => stats_Reading[lop].median)
        },
        {
            name: 'Độ lệch chuẩn (Std Dev)',
            type: 'line',
            data: classes.map(lop => stats_Reading[lop].standardDeviation)
        }
    ];
    const seriesData_Writing = [
        {
            name: 'Trung bình (Mean)',
            type: 'line',
            data: classes.map(lop => stats_Writing[lop].mean)
        },
        {
            name: 'Trung vị (Median)',
            type: 'line',
            data: classes.map(lop => stats_Writing[lop].median)
        },
        {
            name: 'Độ lệch chuẩn (Std Dev)',
            type: 'line',
            data: classes.map(lop => stats_Writing[lop].standardDeviation)
        }
    ];
    const seriesData_Speaking = [
        {
            name: 'Trung bình (Mean)',
            type: 'line',
            data: classes.map(lop => stats_Speaking[lop].mean)
        },
        {
            name: 'Trung vị (Median)',
            type: 'line',
            data: classes.map(lop => stats_Speaking[lop].median)
        },
        {
            name: 'Độ lệch chuẩn (Std Dev)',
            type: 'line',
            data: classes.map(lop => stats_Speaking[lop].standardDeviation)
        }
    ];
    const option = {
        chart: {
            height: 450,
            type: 'line',
            zoom: {
                enabled: true
            },
            toolbar: {
                show: true
            }
        },
        dataLabels: {
            enabled: true,
            style: {
                fontSize: '10px'
            }
        },
        stroke: {
            curve: 'smooth',
            width: [3, 3, 3]
        },
        title: {
            text: 'Mean, Median, and Standard Deviation of Total Scores (Listening, Language, Reading, Writing, Speaking) by Grade',
            align: 'center'
        },
        grid: {
            row: {
                colors: ['#f3f3f3', 'transparent'],
                opacity: 0.5
            },
        },
        xaxis: {
            categories: classes,
            title: {
                text: 'Class'
            }
        },
        yaxis: {
            title: {
                text: 'Scores'
            },
            labels: {
                formatter: function (value) {
                    return value ? value.toFixed(2) : (value ?? 0);
                }
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'center'
        },
        colors: ['#008FFB', '#00E396', '#FEB019'],
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: function (value) {
                    return value.toFixed(2);
                }
            }
        }
    }
    kyNang.Listening = {
        ...chart,
        id: "chart-line-listening",
        series: seriesData_Listening,
        ...option,
        title: {
            text: 'Mean, Median, and Standard Deviation of Listening Scores by Grade',
            align: 'center'
        }
    }
    kyNang.Language = {
        ...chart,
        id: "chart-line-language",
        series: seriesData_Language,
        ...option,
        title: {
            text: 'Mean, Median, and Standard Deviation of Language Scores by Grade',
            align: 'center'
        }
    }
    kyNang.Reading = {
        ...chart,
        id: "chart-line-reading",
        series: seriesData_Reading,
        ...option,
        title: {
            text: 'Mean, Median, and Standard Deviation of Reading Scores by Grade',
            align: 'center'
        }
    }
    kyNang.Writing = {
        ...chart,
        id: "chart-line-writing",
        series: seriesData_Writing,
        ...option,
        title: {
            text: 'Mean, Median, and Standard Deviation of Writing Scores by Grade',
            align: 'center'
        }
    }
    kyNang.Speaking = {
        ...chart,
        id: "chart-line-speaking",
        series: seriesData_Speaking,
        ...option,
        title: {
            text: 'Mean, Median, and Standard Deviation of Speaking Scores by Grade',
            align: 'center'
        }
    }
    vueData.List_DataChartStatistic_KyNang = [kyNang.Listening, kyNang.Language, kyNang.Reading, kyNang.Writing, kyNang.Speaking]
}
function convertChartStatistic_Theme() {
    vueData.List_DataChartStatistic_Theme = []
    const chart = {
        "id": "chart-line",
        "series": [],
        "chart": {
            "height": 350,
            "type": "line",
            "zoom": {
                "enabled": false
            }
        },
        "grid": {
            "row": {
                "colors": [
                    "#f3f3f3",
                    "transparent"
                ],
                "opacity": 0.5
            }
        },
        "dataLabels": {
            "enabled": false
        },
        "stroke": {
            "curve": "straight"
        },
        "xaxis": {
            "categories": []
        }
    }
    const sortData = vueData.DataChartLine_Statistic_API.sort((a, b) => {
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
    const uniqueLopID = [...new Set(sortData.map(x => parseInt(x.LopID)))]
    console.log('uniqueLopID', uniqueLopID)
    for (const lopID of uniqueLopID) {
        const lop = vueData.DataChartLine_Statistic_API.find(x => parseInt(x.LopID) === lopID)
        const rawData = vueData.DataChartLine_Statistic_API.filter(x => parseInt(x.LopID) === lopID);
        // Xử lý dữ liệu
        function processData(data) {
            const classScores = {};
            data.forEach(item => {
                if (!classScores[item.TenCotDiem_EN]) {
                    classScores[item.TenCotDiem_EN] = [];
                }
                classScores[item.TenCotDiem_EN].push(item.Diem);
            });
            // Tính toán các chỉ số thống kê
            const stats = {};
            for (let lop in classScores) {
                const scores = classScores[lop];
                stats[lop] = {
                    mean: calculateMean(scores),
                    median: calculateMedian(scores),
                    standardDeviation: calculateStandardDeviation(scores)
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
            const mean = calculateMean(scores);
            const variance = scores.reduce((acc, score) => {
                return acc + Math.pow(score - mean, 2);
            }, 0) / scores.length;
            return Number(Math.sqrt(variance).toFixed(2));
        }
        // Xử lý dữ liệu thống kê
        const stats = processData(rawData);
        const classes = Object.keys(stats);
        // Chuẩn bị dữ liệu cho biểu đồ
        const seriesData = [
            {
                name: 'Trung bình (Mean)',
                type: 'line',
                data: classes.map(lop => stats[lop].mean)
            },
            {
                name: 'Trung vị (Median)',
                type: 'line',
                data: classes.map(lop => stats[lop].median)
            },
            {
                name: 'Độ lệch chuẩn (Std Dev)',
                type: 'line',
                data: classes.map(lop => stats[lop].standardDeviation)
            }
        ];
        vueData.List_DataChartStatistic_Theme.push({
            ...vueData.List_DataChartStatistic_Theme,
            ...chart,
            "id": "chart-line-theme-" + lopID,
            series: seriesData,
            chart: {
                height: 450,
                type: 'line',
                zoom: {
                    enabled: true
                },
                toolbar: {
                    show: true
                }
            },
            dataLabels: {
                enabled: true,
                style: {
                    fontSize: '10px'
                }
            },
            stroke: {
                curve: 'smooth',
                width: [3, 3, 3]
            },
            title: {
                text: 'Mean, Median, and Standard Deviation of Total Scores by Class ' + lop?.TenLop,
                align: 'center'
            },
            grid: {
                row: {
                    colors: ['#f3f3f3', 'transparent'],
                    opacity: 0.5
                },
            },
            xaxis: {
                categories: classes,
                title: {
                    text: 'Class'
                }
            },
            yaxis: {
                title: {
                    text: 'Scores'
                },
                labels: {
                    formatter: function (value) {
                        return value ? value.toFixed(2) : (value ?? 0);
                    }
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'center'
            },
            colors: ['#008FFB', '#00E396', '#FEB019'],
            tooltip: {
                shared: true,
                intersect: false,
                y: {
                    formatter: function (value) {
                        return value.toFixed(2);
                    }
                }
            }
        })
    }
}
function convertChartCompareGiuaKyCuoiKi() {
    const categories = [...new Set(vueData.DataChartCompare_GiuaKy_CuoiKi_API.map(x => x.TenLop))]
    // const series = [
    //     {
    //         name: 'Exceeding Requirements/Vượt yêu cầu',
    //         group: 'S1_Mid_Total_Conv',
    //         data: vueData.DataChartCompare_GiuaKy_CuoiKi_API.filter(x => x.MaCotDiem === 'S1_Mid_Total_Conv').map(x => x.TyLe)
    //     },
    //     {
    //         name: 'Meeting Requirements/Đạt yêu cầu',
    //         group: 'S1_Mid_Total_Conv',
    //         data: vueData.DataChartCompare_GiuaKy_CuoiKi_API.filter(x => x.MaCotDiem === 'S1_Mid_Total_Conv').map(x => x.TyLe)
    //     },
    //     {
    //         name: 'Not Meeting Requirements/Chưa đạt',
    //         group: 'S1_Mid_Total_Conv',
    //         data: vueData.DataChartCompare_GiuaKy_CuoiKi_API.filter(x => x.MaCotDiem === 'S1_Mid_Total_Conv').map(x => x.TyLe)
    //     }
    // ]
    const series = [
        {
            name: 'Exceeding Requirements/Vượt yêu cầu - Giữa kỳ',
            group: 'S1_Mid_Total_Conv',
            data: vueData.DataChartCompare_GiuaKy_CuoiKi_API.filter(x => x.MaCotDiem === 'S1_Mid_Total_Conv' && x.KetQuaDanhGia_VI === 'Exceeding Requirements/Vượt yêu cầu').map(x => x.TyLe)
        },
        {
            name: 'Exceeding Requirements/Vượt yêu cầu - Cuối kỳ',
            group: 'S1_Final_Total_Conv',
            data: vueData.DataChartCompare_GiuaKy_CuoiKi_API.filter(x => x.MaCotDiem === 'S1_Final_Total_Conv' && x.KetQuaDanhGia_VI === 'Exceeding Requirements/Vượt yêu cầu').map(x => x.TyLe)
        },
        {
            name: 'Meeting Requirements/Đạt yêu cầu - Giữa kỳ',
            group: 'S1_Mid_Total_Conv',
            data: vueData.DataChartCompare_GiuaKy_CuoiKi_API.filter(x => x.MaCotDiem === 'S1_Mid_Total_Conv' && x.KetQuaDanhGia_VI === 'Meeting Requirements/Đạt yêu cầu').map(x => x.TyLe)
        },
        {
            name: 'Meeting Requirements/Đạt yêu cầu - Cuối kỳ',
            group: 'S1_Final_Total_Conv',
            data: vueData.DataChartCompare_GiuaKy_CuoiKi_API.filter(x => x.MaCotDiem === 'S1_Final_Total_Conv' && x.KetQuaDanhGia_VI === 'Meeting Requirements/Đạt yêu cầu').map(x => x.TyLe)
        },
        {
            name: 'Not Meeting Requirements/Chưa đạt - Giữa kỳ',
            group: 'S1_Mid_Total_Conv',
            data: vueData.DataChartCompare_GiuaKy_CuoiKi_API.filter(x => x.MaCotDiem === 'S1_Mid_Total_Conv' && x.KetQuaDanhGia_VI === 'Not Meeting Requirements/Chưa đạt').map(x => x.TyLe)
        },
        {
            name: 'Not Meeting Requirements/Chưa đạt - Cuối kỳ',
            group: 'S1_Final_Total_Conv',
            data: vueData.DataChartCompare_GiuaKy_CuoiKi_API.filter(x => x.MaCotDiem === 'S1_Final_Total_Conv' && x.KetQuaDanhGia_VI === 'Not Meeting Requirements/Chưa đạt').map(x => x.TyLe)
        }
    ]
    console.log('series', series)
    vueData.DataChart_Compare_GiuaKy_CuoiKi = {
        ...vueData.DataChart_Compare_GiuaKy_CuoiKi,
        series: series,
        colors: ['#008FFB', '#008FFB', '#80c7fd', '#80c7fd', '#fdb72f', '#fdb72f'],
        xaxis: {
            categories: categories
        },
        plotOptions: {
            bar: {
                horizontal: false
            }
        },
    }
}
function convertChartThayDoiTongDiem() {
    const datasets = [
        {
            label: "Điểm giữa kì 1",
            data: vueData.TongDiem_API.map(x => x.DiemGK1)
        },
        {
            label: "Điểm cuối kì 1",
            data: vueData.TongDiem_API.map(x => x.DiemCK1)
        }
    ]
    vueData.DataChart2.TongDiem = {
        labels: vueData.TongDiem_API.map(x => x.HoTen),
        datasets: datasets
    }
}
function convertChartTyLeDatChart3() {
    vueData.DataChart3 = {
        ...vueData.DataChart3,
        TyLeHocSinh: {
            labels: vueData.TiLeDat_Chart3_API.map(x => x.KetQuaDanhGia_VI),
            datasets: [
                {
                    "label": "Tỷ lệ học sinh",
                    "data": vueData.TiLeDat_Chart3_API.map(x => x.TyLeChinhXac)
                }
            ]
        }
    }
}
function convertChartTyLeDatChart4() {
    vueData.DataChart4 = {
        ...vueData.DataChart4,
        TyLeHocSinh: {
            labels: vueData.TiLeDat_Chart4_API.map(x => x.KetQuaDanhGia_VI),
            datasets: [
                {
                    "label": "Tỷ lệ học sinh",
                    "data": vueData.TiLeDat_Chart4_API.map(x => x.TyLeChinhXac)
                }
            ]
        }
    }
}