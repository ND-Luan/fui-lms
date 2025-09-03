// Thay thế toàn bộ file SCRIPT
function initPage() {
    console.log('[LOG 1 - SCRIPT] initPage() bắt đầu. AssignToClassID =', vueData.assignToClassId);
    const assignId = parseInt(vueData.assignToClassId);
    if (assignId && assignId > 0) {
        console.log('[LOG 2 - SCRIPT] ID hợp lệ, đang thực hiện CALL("getLessonData")...');
        CALL('getLessonData');
    } else {
        console.log('[LOG 2b - SCRIPT] ID không hợp lệ. Hiển thị giao diện lỗi.');
        vueData.lesson = null;
        vueData.dataReady = true;
    }
    console.log('[LOG 3 - SCRIPT] initPage() kết thúc.');
}
function processInitialData(apiResponse) {
    console.log('[LOG B - SCRIPT] processInitialData() được gọi với dữ liệu thô:', apiResponse);
    if (apiResponse && Array.isArray(apiResponse) && apiResponse.length >= 2 && apiResponse[0] && apiResponse[0][0]) {
        // Dữ liệu hợp lệ, tiếp tục xử lý
        let lessonHeader = apiResponse[0][0];
        console.log('[LOG C - SCRIPT] Đã bóc tách được lessonHeader:', lessonHeader);
        const elementsRaw = apiResponse[1];
        let statusCompletion = apiResponse[2][0]
        console.log('statusCompletion', statusCompletion)
        lessonHeader.elements = (elementsRaw || []).map(el => {
            try {
                el.ElementData = typeof el.ElementData === 'string' ? JSON.parse(el.ElementData) : (el.ElementData || {});
            } catch (e) {
                el.ElementData = {};
            }
            return el;
        });
        console.log('[LOG D - SCRIPT] Đã xử lý xong. Dữ liệu lesson sạch:', lessonHeader);
        lessonHeader = { ...lessonHeader, ...statusCompletion }
        vueData.lesson = lessonHeader;
    } else {
        console.error('[LOG D-ERROR - SCRIPT] Dữ liệu API không hợp lệ hoặc rỗng. Kiểm tra lại điều kiện IF.');
        vueData.lesson = null;
    }
    console.log('[LOG E - SCRIPT] Chuẩn bị bật dataReady=true và tăng dataVersion...');
    vueData.dataReady = true;
    vueData.dataVersion++;
    console.log(`[LOG F - SCRIPT] Đã cập nhật: dataReady=${vueData.dataReady}, dataVersion=${vueData.dataVersion}. Giao diện SẼ được render/re-render.`);
}
function updateProgress(payload) {
    if (!vueData.lesson) return;
    const dataToSend = {
        HocSinhID: vueData.user.UserID,
        LessonID: vueData.lesson.LessonID,
        IsCompleted: payload.isCompleted,
        TimeSpentSeconds: payload.timeSpent
    };
    console.log('dataSend', dataToSend)
    console.log('call api....')
    fetch(vueData.v_Set.apiDomain + "lms/EL_Student_UpdateProgress",
        {
            method: 'POST',
            headers: {
                "Authorization": $awt,
                "Content-type": "application/json;charset=UTF-8"
            },
            body: JSON.stringify(dataToSend)
        }
    )
}
vueData.initPage = initPage;
vueData.processInitialData = processInitialData;
vueData.updateProgress = updateProgress;