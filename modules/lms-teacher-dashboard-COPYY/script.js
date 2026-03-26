/**
 * Ghép nối 3 bảng dữ liệu từ API GetGroupedDashboard thành một cấu trúc lồng nhau hoàn chỉnh.
 * @param {object} response - Phản hồi từ ajaxCALL.
 */
function processGroupedDashboardData(response) {
    console.log("BƯỚC 1: Dữ liệu thô từ API", response);
    if (!response || !response.data || response.data.length < 3) {
        console.error("LỖI: API GetGroupedDashboard không trả về đủ 3 bảng dữ liệu.");
        vueData.teachingGroups = [];
        return;
    }
    //Dữ liệu giao bài theo khối - môn
    const groups = response.data[0];
    //Dữ liệu lớp học
    const classes = response.data[1];
    // gom cả 2 loại assignment
    const assignments = [...response.data[2], ...response.data[3]];
    // Gom theo Khối → Tuần → Lớp
    const groupedData = groups.map(group => {
        // lấy các lớp thuộc group
        const childClasses = classes.filter(c =>
            String(c.KhoiID) === String(group.KhoiID) &&
            String(c.MonHocID) === String(group.MonHocID)
        );
        // từ assignments, gom thành weeks
        const weeksMap = {};
        assignments.filter(a => a.MonHocID == group.MonHocID && a.KhoiID == group.KhoiID).forEach(a => {
            if (!weeksMap[a.TuanHocID]) {
                weeksMap[a.TuanHocID] = {
                    TuanHocID: a.TuanHocID,
                    Tuan_HienThi: a.Tuan_HienThi,
                    Is_Tuan_Active: a.Is_Tuan_Active,
                    classes: []
                };
            }
            // tìm hoặc thêm lớp
            let week = weeksMap[a.TuanHocID];
            // chỉ giữ assignment thuộc lớp trong childClasses
            if (a.AssignType == 'CLASS' && childClasses.some(c => String(c.LopID) === String(a.LopID))) {
                let cls = week.classes.find(c => c.LopID === a.LopID);
                if (!cls) {
                    const classInfo = childClasses.find(c => c.LopID === a.LopID);
                    cls = { ...classInfo, assignments: [] };
                    week.classes.push(cls);
                }
                cls.assignments.push(a);
            } else if (a.AssignType == "STUDENT") {
                let ats = week.classes.find(c => c.TenLop == a.AssignmentTitle);
                if (!ats) {
                    const atsInfo = {
                        KhoiID: a.KhoiID,
                        LopID: -1,
                        MonHocID: a.MonHocID,
                        PendingGradingCountInClass: 0,
                        StudentCount: 0,
                        TenLop: a.AssignmentTitle
                    }
                    ats = { ...atsInfo, assignments: [] };
                    week.classes.push(ats);
                }
                ats.assignments.push(a);
            }
        });
        const currentWeek = Object.values(weeksMap).find(w => w.Is_Tuan_Active);
        const currentId = currentWeek?.TuanHocID ?? 0;
        const sortedArray = Object.values(weeksMap).sort((a, b) => {
            // Đưa tuần hiện tại lên đầu
            if (a.Is_Tuan_Active && !b.Is_Tuan_Active) return -1;
            if (!a.Is_Tuan_Active && b.Is_Tuan_Active) return 1;
            // Nếu cả 2 đều ở tương lai so với tuần hiện tại
            if (a.TuanHocID > currentId && b.TuanHocID > currentId) {
                return a.TuanHocID - b.TuanHocID; // tăng dần
            }
            // Nếu cả 2 đều ở quá khứ so với tuần hiện tại
            if (a.TuanHocID < currentId && b.TuanHocID < currentId) {
                return b.TuanHocID - a.TuanHocID; // giảm dần
            }
            // Nếu 1 cái quá khứ, 1 cái tương lai
            return a.TuanHocID > currentId ? -1 : 1;
        });
        const obj = Object.fromEntries(
            sortedArray.map(item => [`week_${item.TuanHocID}`, item])
        );
        return {
            ...group,
            weeks: Object.values(obj)
        };
    });
    vueData.teachingGroups = groupedData;
    vueData.GiaoVienID_Selected = response.data[4][0].GiaoVienID
}
/**
 * Xử lý dữ liệu thư viện (danh sách phẳng) và gom nhóm thành cấu trúc cây lồng nhau.
 * @param {Array} flatLibraryData - Dữ liệu thô từ API GetMyContentLibrary.
 * @returns {Array} - Dữ liệu đã được gom nhóm.
 */
function processLibraryData(flatLibraryData) {
    if (!flatLibraryData || flatLibraryData.length === 0) {
        return [];
    }
    // Bước 1: Gom nhóm theo (Môn-Khối) -> Tuần -> Chương
    const groupedDataStructure = flatLibraryData.reduce((acc, item) => {
        const groupKey = `${item.KhoiID}-${item.MonHocID}`;
        if (!acc[groupKey]) {
            acc[groupKey] = {
                KhoiID: item.KhoiID,
                TenKhoi: item.TenKhoi,
                MonHocID: item.MonHocID,
                MonHocName: item.MonHocName,
                weeks: {}
            };
        }
        const weekKey = `${item.Tuan_HienThi || '[Chưa xếp tuần]'}`;
        if (!acc[groupKey].weeks[weekKey]) {
            acc[groupKey].weeks[weekKey] = {
                title: weekKey,
                chapters: {}
            };
        }
        const chapterKey = item.Chuong || 'Nội dung chung';
        if (!acc[groupKey].weeks[weekKey].chapters[chapterKey]) {
            acc[groupKey].weeks[weekKey].chapters[chapterKey] = {
                title: chapterKey,
                items: []
            };
        }
        acc[groupKey].weeks[weekKey].chapters[chapterKey].items.push(item);
        return acc;
    }, {});
    const _ = Object.values(groupedDataStructure).map(group => {
        group.weeks = Object.values(group.weeks).map(week => {
            week.chapters = Object.values(week.chapters);
            return week;
        });
        return group;
    });
    console.log('DataLibery', _)
    // Bước 2: Chuyển đổi các object lồng nhau thành mảng để v-for có thể duyệt qua
    return _
}
/**
 * Hàm khởi tạo chính, gọi tất cả các API cần thiết khi trang tải.
 */
function apiCall1() {
    return new Promise((resolve, reject) => {
        ajaxCALL("lms/EL_Teacher_GetGroupedDashboard", { HocKi: vueData.NienKhoaItem.HocKi }, response => {
            processGroupedDashboardData(response);
            resolve();
        }, reject);
    })
};
function apiCall2() {
    return new Promise((resolve, reject) => {
        ajaxCALL("lms/EL_Teacher_GetRecentActivities", { PageSize: 10, HocKi: vueData.NienKhoaItem?.HocKi }, response => {
            vueData.activities = response.data;
            resolve();
        }, reject);
    })
};
function apiCall3() {
    return new Promise((resolve, reject) => {
        ajaxCALL("lms/EL_Teacher_GetMyContentLibrary", { NienKhoa: vueData.NienKhoa }, response => {
            vueData.contentLibrary = processLibraryData(response.data);
            resolve();
        }, reject);
    })
};
async function initPage() {
    vueData.dataReady = false;
    try {
        await Promise.all([apiCall1(), apiCall2(), apiCall3()]);
        GET_EL_Teacher_GetFocusTasks_Student(); // fire-and-forget
    } catch (error) {
        console.error("Tải dữ liệu dashboard thất bại:", error);
    }
    vueData.dataReady = true;
}
Vue.component('FWindowCustom', {
    props: ['winData', 'dialogOpen'],
    emits: ['update:dialogOpen'],
    template: `
       <v-dialog ref="refsWindow" v-model="dialogOpen" :fullscreen="true" scrollable persistent>
          <v-card height="100%">
            <v-toolbar  density="compact" color="primary">
              <v-toolbar-title class="font-weight-medium" v-html="winData?.title" style="max-height: 48px;"></v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn icon @click="closeDialog" class="ml-4"><v-icon>mdi-close</v-icon></v-btn>
            </v-toolbar>
             <iframe v-if="winData.url" :src="winData?.url" v-bind="$attrs" :id="winData?.id" name='frameName' height="100%" width="100%" style="border:none;" allow="fullscreen"></iframe>
          </v-card>
        </v-dialog>
    `,
    data: function () {
        return {
        }
    },
    mounted: function () { },
    methods: {
        closeDialog() {
            this.$emit('update:dialogOpen', false)
        },
    }
});
function onOpenWindowCustom(object) {
    console.log('object', object)
    setTimeout(function () {
        if (object.id != undefined && vueData.arrWindowID.find(item => item.id === object.id) != undefined) {
            console.log("Cửa sổ bị trùng tên: ", object.id)
            return;
        }
        vueData.arrWindowID.push(object);
    }, 10);
    vueData.winData = object
    vueData.isOpenWindowCustom = true
}
function onCloseWindow(id) {
    let indexWindow = app.config.globalProperties.v_OpenWindowList.indexOf(item => item.id = id)
    if (indexWindow != -1) {
        app.config.globalProperties.v_OpenWindowList.splice(indexWindow, 1)
    }
}
async function GET_EL_Teacher_GetFocusTasks_Student() {
    ajaxCALL('lms/EL_Teacher_GetFocusTasks_Student', {}, res => {
        vueData.focusTasks_student = res.data
    })
}
async function Update_IsHided(AssignToClassID){
     ajaxCALL('lms/EL_Teacher_Dashboard_Update_IsHided', {AssignToClassID}, res => {
    })
}
// Đăng ký các hàm vào vueData để ALLDRAW có thể gọi
vueData.initPage = initPage;
vueData.onOpenWindowCustom = onOpenWindowCustom
vueData.onCloseWindow = onCloseWindow