const defColor = [
    {
        "status": "Not Meet",
        "des": "<50%",
        "color": "red",
        "bgcolor": "red-lighten-5"
    },
    {
        "status": "Meet",
        "des": "50%-79%",
        "color": "yellow-darken-3",
        "bgcolor": "yellow-lighten-4"
    },
    {
        "status": "Exceeded",
        "des": ">=80%",
        "color": "green",
        "bgcolor": "green-lighten-5"
    }
]
const libIconCotDiem = [
    {
        name: "Listening",
        icon: "mdi mdi-headphones",
    },
    {
        name: "Reading",
        icon: "mdi mdi-book-open-variant-outline",
    },
    {
        name: "Writing",
        icon: "mdi mdi-lead-pencil",
    },
    {
        name: "Speaking",
        icon: "mdi mdi-account-voice",
    },
    {
        name: "Language",
        icon: "mdi mdi-account-school-outline"
    },
    {
        name: "Total",
        icon: "mdi mdi-star",
    },
    {
        name: "default",
        icon: "mdi mdi-set-none"
    }
]
const libIconActivities = [
    {
        name: "EC Videos",
        icon: "mdi mdi-video",
    },
    {
        name: "My Journal",
        icon: "mdi mdi-book-open-variant-outline",
    },
    {
        name: "Hobbies",
        icon: "mdi mdi-music",
    },
    {
        name: "1:1 session",
        icon: "mdi mdi-account-voice",
    },
    {
        name: "DEAR",
        icon: "mdi mdi-checkbook",
    },
    {
        name: "Class Projects",
        icon: "mdi mdi-account-group-outline",
    },
    {
        name: "Total",
        icon: "mdi mdi-star",
    },
]
function processColor(arr, arrColor) {
    return arr.map(element => {
        // Xác định trạng thái dựa trên percent
        let computedStatus;
        if (element.percent < 50 || element.status == 'Not Meet') { computedStatus = "Not Meet"; } else if (element.percent <= 80 || element.status == 'Meeting') { computedStatus = "Meet"; }
        else { computedStatus = "Exceeded"; } // Tìm định nghĩa màu ứng với trạng thái vừa tính const
        colorDef = arrColor.find(item => item.status === computedStatus);
        // Nếu tìm thấy định nghĩa màu, gán lại thuộc tính cho element
        if (colorDef) {
            return {
                ...element,
                color: colorDef.color,
                bgcolor: colorDef.bgcolor
            };
        }
        // Nếu không tìm thấy, trả về element không thay đổi
        return element;
    });
}
function init() {
    vueData.processColor = this.processColor
    vueData.activities = vueData.processColor(vueData.activities, vueData.defColor)
    vueData.handleData = this.handleData
    // vueData.initdefColorResult = initdefColorResult
}
function handleData() {
    //Bước 1: Xử lý gộp điểm point và convert
    let mergedData = vueData.DSCotDiem[0].map(item => {
        let isResultCB = (item.MaCotDiem.includes('_TA2') || item.MaCotDiem.includes('_IELTS')) ? 1 : 0
        return { ...item, isResultCB: isResultCB }
    })
    let dataResult = mergedData.filter(item => item.isResultCB === 0)
    let mergeDataResult = MergedDataResult(dataResult)
    let dataResultCB = mergedData.filter(item => item.isResultCB === 1)
    let mergeDataResultCB = MergedDataResult(dataResultCB)
    mergedData = [...mergeDataResult, ...mergeDataResultCB]
    console.log('mergedData', mergedData)
    // Bước 2: Xử lý gắn điểm ielts
    mergedData = mergedData.map(d => {
        if (d.isResultCB == 0) return { ...d }
        let objIelts = vueData.DSCotDiem[0].find(obj => (obj.MaCotDiem.includes('_IELTS') && obj.MaCotDiem.includes(d.TenCotDiem_EN)) || obj.MaCotDiem.includes('_IELTS_Band'))
        if (!objIelts) return { ...d }
        return { ...d, ielts: objIelts.KetQuaDanhGia_VI ?? '-' }
    })
    //Bước 3: Xử lý dữ liệu màu sắc, icon và filter attr trước khi render
    const handleDataScore = mergedData.map(item => {
        let data = {
            label: item.TenCotDiem_VI,
            name: item.TenCotDiem_VI,
            percent: ((parseFloat(item.KetQuaDanhGia_VI) / parseFloat(item.DiemMax)) * 100).toFixed(1),
            status: vueData.t('message.NotMeetingRequirements'),
            score: item.KetQuaDanhGia_VI,
            scoreMax: item.DiemMax,
            icon: "mdi mdi-account-school-outline",
            color: 'red',
            bgcolor: 'red-lighten-5',
            label_EN: item.TenCotDiem_EN,
            MaCotDiem: item.MaCotDiem,
            ielts: item.ielts,
            TenNhomCotDiem_EN: item.TenNhomCotDiem_EN,
            TenNhomCotDiem_VI: item.TenNhomCotDiem_VI,
            isResultCB: item.isResultCB
        }
        if (item.Convert_KetQuaDanhGia_VI?.includes('Đạt yêu cầu')) {
            data.status = vueData.t('message.MeetingRequirements')
            data.color = 'yellow-darken-3'
            data.bgcolor = 'yellow-lighten-4'
        } else if (item.Convert_KetQuaDanhGia_VI?.includes('Exceeding')) {
            data.status = vueData.t('message.ExceedingRequirements')
            data.color = 'green'
            data.bgcolor = 'green-lighten-5'
        }
        let objIcon = libIconCotDiem.find(obj => item.TenCotDiem_EN.includes(obj.name))
        if (objIcon) {
            data.icon = objIcon.icon
        }
        return data
    })
    vueData.skills = handleDataScore
    //Xử lý tiêu đề Activities
    const uniqueTheme = [...new Set(vueData.DSCotDiem[1].map(x => x.MaNhomCotDiem))]
    const newTheme = uniqueTheme.map(i => {
        const themeSplit = i.split('_')
        const data = {
            title: themeSplit[0] + ' ' + themeSplit[1],
            value: i
        }
        return data
    })
    vueData.DSThemeNumber = newTheme
    const handleDataTheme = vueData.DSCotDiem[1].filter(item => !(item.MaCotDiem.includes('_TST') || item.MaCotDiem.includes('_BNS_VNM') || item.MaCotDiem.includes('_BNS_EXP') || item.MaCotDiem.includes('_Total'))).map(item => {
        let data = {
            label: item.TenCotDiem_VI,
            name: item.TenCotDiem_VI,
            percent: ((parseFloat(item.KetQuaDanhGia_VI) / parseFloat(item.DiemMax)) * 100).toFixed(1),
            status: item.Convert_KetQuaDanhGia_VI,
            score: item.KetQuaDanhGia_VI,
            scoreMax: item.DiemMax,
            icon: "mdi mdi-account-school-outline",
            color: 'red',
            bgcolor: 'red-lighten-5',
            MaNhomCotDiem: item.MaNhomCotDiem,
            label_EN: item.TenCotDiem_EN,
        }
        if (data.percent < 80 && data.percent >= 50) {
            data.color = 'yellow-darken-3'
            data.bgcolor = 'yellow-lighten-4'
        } else if (data.percent >= 80) {
            data.color = 'green'
            data.bgcolor = 'green-lighten-5'
        }
        let objIcon = libIconActivities.find(obj => item.TenCotDiem_EN.includes(obj.name))
        if (objIcon) {
            data.icon = objIcon.icon
        }
        return data
    })
    vueData.activities = handleDataTheme
    console.log(' activities ', handleDataTheme)
}
function initdefColorResult() {
    vueData.defColorResult = [
        {
            "status": vueData.t('message.NotMeetingRequirements'),
            "des": `<50% ${vueData.t('message.PointsTotalSkill')}`,
            "color": "red",
            "bgcolor": "red-lighten-5"
        },
        {
            "status": vueData.t('message.MeetingRequirements'),
            "des": `>= 50% - 79% ${vueData.t('message.PointsTotalSkill')}`,
            "color": "yellow-darken-3",
            "bgcolor": "yellow-lighten-4"
        },
        {
            "status": vueData.t('message.ExceedingRequirements'),
            "des": `>= 80% - 100% ${vueData.t('message.PointsTotalSkill')}`,
            "color": "green",
            "bgcolor": "green-lighten-5"
        }
    ]
}
function initdefColorActivities() {
    vueData.defColorActivities = [
        {
            "status": vueData.t('message.NotImplementingWithoutSpecificReasons'),
            "des": `0-3 ${vueData.t('message.points')}`,
            "color": "grey",
            "bgcolor": "grey-lighten-5"
        },
        {
            "status": vueData.t('message.NotMeetingRequirements'),
            "des": `4-7 ${vueData.t('message.points')}`,
            "color": "red",
            "bgcolor": "red-lighten-5"
        },
        {
            "status": vueData.t('message.MeetingRequirements'),
            "des": `8-9 ${vueData.t('message.points')}`,
            "color": "yellow-darken-3",
            "bgcolor": "yellow-lighten-4"
        },
        {
            "status": vueData.t('message.ExceedingRequirements'),
            "des": `10 ${vueData.t('message.points')}`,
            "color": "green",
            "bgcolor": "green-lighten-5"
        },
    ]
}
function MergedDataResult(arr) {
    let data = arr.reduce((acc, item) => {
        //Nếu object hiện tại là IELTS thì bỏ qua, xử lý ở bước 2
        if (item.MaCotDiem.includes("_IELTS")) return acc
        // Kiểm tra nếu object hiện tại là dạng Convert
        if (item.MaCotDiem.includes("_Conv")) {
            // Tìm object gốc trong acc
            let baseItem = acc?.find(obj => item.TenCotDiem_EN.includes(obj.TenCotDiem_EN));
            if (baseItem) {
                // Gộp thông tin của object Convert vào object gốc
                baseItem["Convert_MaCotDiem"] = item.MaCotDiem
                baseItem["Convert_TenCotDiem_EN"] = item.TenCotDiem_EN
                baseItem["Convert_KetQuaDanhGia_VI"] = item.KetQuaDanhGia_VI
                baseItem["Convert_GiaTriCotDiem"] = item.GiaTriCotDiem
                baseItem["Convert_TenCotDiem_VI"] = item.TenCotDiem_VI
            }
        }
        else {
            // Nếu là object gốc, thêm vào danh sách kết quả
            acc.push({
                TenCotDiem_EN: item.TenCotDiem_EN,
                MaCotDiem: item.MaCotDiem,
                KetQuaDanhGia_VI: item.KetQuaDanhGia_VI,
                GiaTriCotDiem: item.GiaTriCotDiem,
                TenCotDiem_VI: item.TenCotDiem_VI,
                DiemMax: item.DiemMax,
                TenNhomCotDiem_EN: item.TenNhomCotDiem_EN,
                TenNhomCotDiem_VI: item.TenNhomCotDiem_VI,
                isResultCB: item.isResultCB
            });
        }
        return acc;
    }, [])
    return data
}