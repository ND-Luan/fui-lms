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