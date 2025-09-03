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
    // vueData.processColor = this.processColor
    // vueData.activities = vueData.processColor(vueData.activities, vueData.defColor)
    vueData.handleData = this.handleData
    // vueData.initdefColorResult = initdefColorResult
}
function handleData() {
    if (vueData.DSCotDiem[0].length <= 0) {
        console.log('CotDiem rỗng')
        return
    } else if (vueData.DSCotDiem[1].length <= 0) {
          console.log('Theme rỗng')
        return
    }
    //Bước 1: Xử lý gộp điểm point và convert
    let mergedData = vueData.DSCotDiem[0].map(item => {
        let isResultCB = item.MaCotDiem.includes('_TA2') ? 1 : 0
        return { ...item, isResultCB: isResultCB }
    })
      console.log('mergedData11111', mergedData)
    let dataResult = mergedData.filter(item => item.isResultCB === 0)
    let mergeDataResult = MergedDataResult(dataResult)
    let dataResultCB = mergedData.filter(item => item.isResultCB === 1)
    let mergeDataResultCB = MergedDataResult(dataResultCB)
    let dataIELTS = vueData.DSCotDiem[0].filter(item => item.MaCotDiem.includes('_IELTS'))
    mergedData = [...mergeDataResult, ...mergeDataResultCB,...dataIELTS]
    console.log('Data 3 loại điểm', mergedData)
    //Bước 3: Xử lý dữ liệu màu sắc, icon và filter attr trước khi render
    const handleDataScore = mergedData.map(item => {
        let data = {
            label: item.TenCotDiem_VI,
            name: item.TenCotDiem_VI,
            percent: item.KetQuaDanhGia_VI && item.DiemMax ? (((parseFloat(item.KetQuaDanhGia_VI) / parseFloat(item.DiemMax)) * 100).toFixed(2)) : '- ',
            score: item.KetQuaDanhGia_VI ?? null,
            scoreMax: item.DiemMax,
            icon: "mdi mdi-account-school-outline",
            label_EN: item.TenCotDiem_EN,
            MaCotDiem: item.MaCotDiem,
            ielts: item.ielts,
            TenNhomCotDiem_EN: item.TenNhomCotDiem_EN,
            TenNhomCotDiem_VI: item.TenNhomCotDiem_VI,
            isResultCB: item.isResultCB,
            KetQuaDanhGia_VI: item.KetQuaDanhGia_VI,
            colorKQHT: 'purple-lighten-1',
            bgcolorKQHT: 'purple-lighten-5',
            Label_IELTS_VI: item.Label_IELTS_VI,
            Label_IELTS_EN: item.Label_IELTS_EN
        }
        if (data.percent > 100) {
            data.percent = 100
        } else if (data.percent < 0) {
            data.percent = 0
        }
        let ketQuaDanhGia = item.Convert_KetQuaDanhGia_VI?.split('/')[0].trim().toLowerCase()
        // if (item.Convert_KetQuaDanhGia_VI?.includes('Đạt yêu cầu') || item.Convert_KetQuaDanhGia_VI?.includes('Meeting Requirements')) {
        //      data.status= vueData.t('message.MeetingRequirements')
        //     data.color= 'yellow-darken-3'
        //     data.bgcolor= 'yellow-lighten-4'
        // }
        // else if (item.Convert_KetQuaDanhGia_VI?.includes('Not meeting requirements') || item.Convert_KetQuaDanhGia_VI?.includes('Chưa đạt')) {
        //     data.status = vueData.t('message.NotMeetingRequirements')
        //     data.color = 'red'
        //     data.bgcolor = 'red-lighten-5'
        // } else if (item.Convert_KetQuaDanhGia_VI?.includes('Exceeding')) {
        //     data.status = vueData.t('message.ExceedingRequirements')
        //     data.color = 'green'
        //     data.bgcolor = 'green-lighten-5'
        // } else if (item.Convert_KetQuaDanhGia_VI == null || item.Convert_KetQuaDanhGia_VI == '') {
        //     data.status = '-'
        //     data.color = 'grey'
        //     data.bgcolor = 'grey-lighten-5'
        // }
        if (ketQuaDanhGia == 'meeting requirements') {
             data.status= vueData.t('message.MeetingRequirements')
            data.color= 'yellow-darken-3'
            data.bgcolor= 'yellow-lighten-4'
        }
        else if (ketQuaDanhGia == 'not meeting requirements') {
            data.status = vueData.t('message.NotMeetingRequirements')
            data.color = 'red'
            data.bgcolor = 'red-lighten-5'
        } else if (ketQuaDanhGia == 'exceeding requirements') {
            data.status = vueData.t('message.ExceedingRequirements')
            data.color = 'green'
            data.bgcolor = 'green-lighten-5'
        } else if (ketQuaDanhGia == null || ketQuaDanhGia == '') {
            data.status = '-'
            data.color = 'green'
            data.bgcolor = 'grey-lighten-5'
        }
        let objIcon = libIconCotDiem.find(obj => item.TenCotDiem_EN.includes(obj.name))
        if (objIcon) {
            data.icon = objIcon.icon
        }
        return data
    })
    //Xử lý điểm overal
    let percentTotal = 0
    let countMark = 0
    //OVERAL cấp 2
    if (vueData.HocSinhDetail.CapID == 2) {
        let handleDataScoreExceptLanguage = handleDataScore.filter(item => item.label_EN != 'Language')
        for (let i = 0; i < handleDataScoreExceptLanguage.length - 1; i++) {
            percentTotal += parseFloat(handleDataScoreExceptLanguage[i].percent)
            countMark = i + 1
        }
        handleDataScore[handleDataScore.length - 1].percent = (percentTotal / countMark).toFixed(2)
        console.log(percentTotal, countMark, handleDataScore)
        const handleDataTheme = vueData.DSCotDiem[1].filter(item => !(item.MaCotDiem.includes('_TST') || item.MaCotDiem.includes('_BNS_VNM') || item.MaCotDiem.includes('_BNS_EXP') )).map(item => {
            let data = {
                label: item.TenCotDiem_VI,
                name: item.TenCotDiem_VI,
                percent: ((parseFloat(item.KetQuaDanhGia_VI) / parseFloat(item.DiemMax)) * 100).toFixed(1),
                status: item.Convert_KetQuaDanhGia_VI,
                score: item.KetQuaDanhGia_VI ?? null,
                scoreMax: item.DiemMax,
                icon: "mdi mdi-account-school-outline",
                color: 'red',
                bgcolor: 'red-lighten-5',
                MaNhomCotDiem: item.MaNhomCotDiem,
                label_EN: item.TenCotDiem_EN,
                MaCotDiem:item.MaCotDiem
            }
            if (data.score >= 4 && data.score <= 7) {
                data.color = 'yellow-darken-3'
                data.bgcolor = 'yellow-lighten-4'
            } else if (data.score >= 8 && data.score <= 9) {
                data.color = 'blue'
                data.bgcolor = 'blue-lighten-4'
            } else if (data.score > 9) {
                data.color = 'green'
                data.bgcolor = 'green-lighten-5'
            }
            let objIcon = libIconActivities.find(obj => item.TenCotDiem_EN.includes(obj.name))
            if (objIcon) {
                data.icon = objIcon.icon
            }
            if (data.percent > 100) {
                data.percent = 100
            } else if (data.percent < 0) {
                data.percent = 0
            }
            return data
        })
        vueData.activities = handleDataTheme
        console.log(' activities ', handleDataTheme)
    }
    //OVERAL cấp 3
    else{
        let handleDataScoreExceptLanguage = handleDataScore.filter(item => item.MaCotDiem.includes('_TA2_'))
        for (let i = 0; i < handleDataScoreExceptLanguage.length - 1; i++) {
            percentTotal += parseFloat(handleDataScoreExceptLanguage[i].percent)
            countMark = i + 1
        }
        handleDataScore[handleDataScore.length - 1].percent = (percentTotal / countMark).toFixed(2)
        if(handleDataScore[handleDataScore.length - 1].percent == 'NaN' ){
            handleDataScore[handleDataScore.length - 1].percent = '-'
        }
        console.log(percentTotal, countMark, handleDataScore)
        const handleDataTheme = vueData.DSCotDiem[1].filter(item => !(item.MaCotDiem.includes('_TST') || item.MaCotDiem.includes('_BNS_VNM') || item.MaCotDiem.includes('_BNS_EXP'))).map(item => {
            let data = {
                label: item.TenCotDiem_VI,
                name: item.TenCotDiem_VI,
                percent: ((parseFloat(item.KetQuaDanhGia_VI) / parseFloat(item.DiemMax)) * 100).toFixed(1),
                status: item.Convert_KetQuaDanhGia_VI,
                score: item.KetQuaDanhGia_VI ?? null,
                scoreMax: item.DiemMax,
                icon: "mdi mdi-account-school-outline",
                color: 'red',
                bgcolor: 'red-lighten-5',
                MaNhomCotDiem: item.MaNhomCotDiem,
                label_EN: item.TenCotDiem_EN,
                MaCotDiem: item.MaCotDiem
            }
            if (data.score >= 5 && data.score < 8) {
                data.color = 'yellow-darken-3'
                data.bgcolor = 'yellow-lighten-4'
            }  else if (data.score >= 8) {
                data.color = 'green'
                data.bgcolor = 'green-lighten-5'
            } else if (data.score < 1){
                data.color = 'grey'
                data.bgcolor = 'grey-lighten-5'
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
    if (vueData.HocSinhDetail.CapID == 2) {
        let color = [
            // {
            //     "status": vueData.t('message.NotImplementingWithoutSpecificReasons'),
            //     "des": `0-3 ${vueData.t('message.points')}`,
            //     "color": "grey",
            //     "bgcolor": "grey-lighten-5"
            // },
            {
                "status": vueData.t('message.NotImplementingWithoutSpecificReasons'),
                "des": `0-3 ${vueData.t('message.points')}`,
                "color": "red",
                "bgcolor": "red-lighten-5"
            },
            {
                "status": vueData.t('message.NotMeetingRequirements'),
                "des": `4-7 ${vueData.t('message.points')}`,
                "color": "yellow-darken-3",
                "bgcolor": "yellow-lighten-4"
            },
            {
                "status": vueData.t('message.MeetingRequirements'),
                "des": `8-9 ${vueData.t('message.points')}`,
                "color": "blue",
                "bgcolor": "blue-lighten-4"
            },
            {
                "status": vueData.t('message.ExceedingRequirements'),
                "des": `10 ${vueData.t('message.points')}`,
                "color": "green",
                "bgcolor": "green-lighten-5"
            },
        ]
        vueData.defColorActivities = color
    } else if (vueData.HocSinhDetail.CapID == 3) {
        let color = [
            {
                "status": vueData.t('message.NotMeetingRequirements'),
                "des": `1 - 4.9 ${vueData.t('message.points')}`,
                "color": "red",
                "bgcolor": "red-lighten-5"
            },
            {
                "status": vueData.t('message.MeetingRequirements'),
                "des": `5 - 7.9 ${vueData.t('message.points')}`,
                "color": "yellow-darken-3",
                "bgcolor": "yellow-lighten-4"
            },
            {
                "status": vueData.t('message.ExceedingRequirements'),
                "des": `8.0 - 10 ${vueData.t('message.points')}`,
                "color": "green",
                "bgcolor": "green-lighten-5"
            },
        ]
        vueData.defColorActivities = color
    }
}
function handleDataNhomLop() {
    if (!vueData.DataNhomLop[0] || !vueData.DataNhomLop[0]?.HocSinhID) return
    let dataDiemTiengAnh = [
        {
            title: "Nghe",
            key: 'Nghe',
            backgroundColor: "rgb(209 231 211)",
            icon: "mdi-headphones"
        }, {
            title: "Đọc",
            key: 'Doc',
            backgroundColor: "rgb(209 231 211)",
            icon: "mdi-book-open-outline"
        },
        {
            title: "Viết",
            key: 'Viet',
            backgroundColor: "rgb(209 231 211)",
            icon: "mdi-lead-pencil"
        },
        {
            title: "Nói",
            key: 'Noi',
            backgroundColor: "rgb(209 231 211)",
            icon: "mdi-account-voice"
        }
    ]
    if (vueData.DataNhomLop[0].LoaiHocSinh == 'Moi') {
        dataDiemTiengAnh = [
            {
                title: "Nghe",
                key: 'Nghe',
                backgroundColor: "rgb(209 231 211)",
                icon: "mdi-headphones"
            }, {
                title: "Ngôn ngữ",
                key: 'NgonNgu',
                backgroundColor: "rgb(209 231 211)",
                icon: "mdi-book-open-outline"
            },
            {
                title: "Viết",
                key: 'Viet',
                backgroundColor: "rgb(209 231 211)",
                icon: "mdi-lead-pencil"
            },
            {
                title: "Nói",
                key: 'Noi',
                backgroundColor: "rgb(209 231 211)",
                icon: "mdi-account-voice"
            }
        ]
    }
    let dataDiemCEFR = [
        {
            title: "Nghe",
            key: 'CEFR_Nghe',
            backgroundColor: "rgb(209 231 211)",
            icon: "mdi-headphones"
        }, {
            title: "Ngôn ngữ",
            key: 'CEFR_Language',
            backgroundColor: "rgb(209 231 211)",
            icon: "mdi-book-open-outline"
        },
        {
            title: "Viết",
            key: 'CEFR_Viet',
            backgroundColor: "rgb(209 231 211)",
            icon: "mdi-lead-pencil"
        },
        {
            title: "Nói",
            key: 'CEFR_Noi',
            backgroundColor: "rgb(209 231 211)",
            icon: "mdi-account-voice"
        }
    ]
    let propertiesShow = [
        // {
        //     title: "Lớp cũ",
        //     key: 'LopCu'
        // },
        {
            title: "Mã học sinh",
            key: 'HocSinhID'
        },
        // {
        //     title: "Họ",
        //     key: 'Ho'
        // },
        // {
        //     title: "Tên",
        //     key: 'Ten'
        // },
        // {
        //     title: "Ngày sinh",
        //     key: 'NgaySinh'
        // },
        // {
        //     title: "Phái",
        //     key: 'Phai'
        // },
        // {
        //     title: "Số điện thoại",
        //     key: 'SDT'
        // },
        {
            title: "Nghe (%)",
            key: 'Nghe'
        }, {
            title: "Ngôn ngữ (%)",
            key: 'Doc'
        },
        {
            title: "Viết (%)",
            key: 'Viet'
        },
        {
            title: "Nói (%)",
            key: 'Noi'
        },
        {
            title: "Chung (%)",
            key: 'Chung'
        },
        {
            title: "Điểm Cambrige",
            key: 'Diem_Cambridge'
        },
        {
            title: "CEFR",
            key: 'CEFR_Tong'
        },
        {
            title: "Ghi chú (thi chính thức)",
            key: 'GhiChu'
        }, {
            title: "Xếp nhóm Tiếng Anh",
            key: 'XepNhomTiengAnh'
        }
    ]
    let resultData = propertiesShow.map(item => { return { ...item, value: vueData.DataNhomLop[0][item.key] } })
    let resultDiemTiengAnh = dataDiemTiengAnh.map(item => { return { ...item, value: vueData.DataNhomLop[0][item.key] } })
    let resultDiemCEFR = dataDiemCEFR.map(item => { return { ...item, value: vueData.DataNhomLop[0][item.key] } })
    vueData.HocSinhDiemTiengAnh = resultDiemTiengAnh
    vueData.HocSinhNhomLopDetail = resultData
    vueData.HocSinhDiemCEFR = resultDiemCEFR
}
//render cái mô tả kết quả học tập
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
//render cái mô tả các hoạt động theme
function initdefColorActivities() {
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