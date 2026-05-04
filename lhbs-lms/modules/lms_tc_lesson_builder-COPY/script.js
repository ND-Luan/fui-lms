function processInitialData(data) {
    if (data && data.length >= 2) {
        const lessonData = data[0][0];
        const elementsData = data[1];
        lessonData.elements = (elementsData || []).map(el => {
            try {
                el.ElementData = typeof el.ElementData === 'string' ? JSON.parse(el.ElementData) : (el.ElementData || {});
            } catch (e) {
                el.ElementData = {};
            }
            return el;
        });
        vueData.lesson = lessonData;
    } else {
        Vue.$toast.error("Tải dữ liệu bài giảng thất bại.", { position: 'top' });
    }
    console.log('process...')
    vueData.dataReady = true;
}
function initPage() {
    const LessonID = vueData.LessonID;
    if (LessonID && LessonID > 0) {
        vueData.isEditMode = true;
        CALL('getLessonData')
    } else {
        vueData.isEditMode = false;
        vueData.lesson = {
            Title: '', Description: '', Tuan: '', Chuong: '',
            Status: 1,
            elements: []
        };
        vueData.dataReady = true;
    }
}
function saveLesson(payload) {
    const dataToSend = { ...payload.lesson };
    dataToSend.Status = payload.isPublishing ? 2 : 1;
    dataToSend.EstimatedDuration = dataToSend.EstimatedDuration || 0
    // API 1: Lưu thông tin chính
    ajaxCALL("lms/EL_Lesson_Save", {
        LessonID: dataToSend.LessonID,
        TuanHocID: dataToSend.TuanHocID,
        Chuong: dataToSend.Chuong,
        Title: dataToSend.Title,
        Description: dataToSend.Description,
        KhoiID: dataToSend.KhoiID,
        MonHocID: dataToSend.MonHocID,
        NienKhoa: dataToSend.NienKhoa,
        HocKi: dataToSend.HocKi || 1,
        EstimatedDuration: dataToSend.EstimatedDuration,
        ThumbnailURL: dataToSend.ThumbnailURL,
        Status: dataToSend.Status,
    }, (response) => {
        console.log('response', response)
        if (response && response.data && response.data[0]) {
            const newLessonID = response.data[0].LessonID;
            if (!vueData.isEditMode) {
                window.history.pushState({}, '', `?LessonID=${newLessonID}`);
                vueData.isEditMode = true;
                vueData.LessonID = newLessonID; // Cập nhật lại ID
            }
            const Json_Elements = dataToSend.elements.map(x => ({ ...x, ElementData: JSON.stringify(x.ElementData) }))
            ajaxCALL('lms/EL_Element_Save_Multiple', {
                LessonID: newLessonID,
                Json_Elements
            }, res => {
                Vue.$toast.success('Lưu bài học thành công!', { position: 'top' });
                CALL('getLessonData') // Tải lại dữ liệu mới nhất
            })
            // // API 2: Lưu các elements
            // const elementSavePromises = dataToSend.elements.map((element, index) => {
            //     const elementPayload = {
            //         ElementID: element.ElementID || 0,
            //         LessonID: newLessonID,
            //         ElementType: element.ElementType,
            //         ElementData: JSON.stringify(element.ElementData),
            //         SortOrder: (index + 1) * 10
            //     };
            //     return new Promise(resolve => ajaxCALL("lms/EL_Element_Save", elementPayload, resolve));
            // });
            // Promise.all(elementSavePromises).then(() => {
            // });
        }
    });
}
vueData.initPage = initPage;
vueData.processInitialData = processInitialData;
vueData.saveLesson = saveLesson;