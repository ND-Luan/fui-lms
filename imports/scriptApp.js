const messages = {
    vi: {
        "badge": "Badge",
        "open": "Open",
        "close": "Close",
        "dismiss": "Dismiss",
        "confirmEdit": {
            "ok": "OK",
            "cancel": "Cancel"
        },
        "dataIterator": {
            "noResultsText": "No matching records found",
            "loadingText": "Loading items..."
        },
        "dataTable": {
            "itemsPerPageText": "Rows per page:",
            "ariaLabel": {
                "sortDescending": "Sorted descending.",
                "sortAscending": "Sorted ascending.",
                "sortNone": "Not sorted.",
                "activateNone": "Activate to remove sorting.",
                "activateDescending": "Activate to sort descending.",
                "activateAscending": "Activate to sort ascending."
            },
            "sortBy": "Sort by"
        },
        "dataFooter": {
            "itemsPerPageText": "Items per page:",
            "itemsPerPageAll": "All",
            "nextPage": "Next page",
            "prevPage": "Previous page",
            "firstPage": "First page",
            "lastPage": "Last page",
            "pageText": "{0}-{1} of {2}"
        },
        "dateRangeInput": {
            "divider": "to"
        },
        "datePicker": {
            "itemsSelected": "{0} selected",
            "range": {
                "title": "Select dates",
                "header": "Enter dates"
            },
            "title": "Select date",
            "header": "Enter date",
            "input": {
                "placeholder": "Enter date"
            }
        },
        "noDataText": "No data available",
        "carousel": {
            "prev": "Previous visual",
            "next": "Next visual",
            "ariaLabel": {
                "delimiter": "Carousel slide {0} of {1}"
            }
        },
        "calendar": {
            "moreEvents": "{0} more",
            "today": "Today"
        },
        "input": {
            "clear": "Clear {0}",
            "prependAction": "{0} prepended action",
            "appendAction": "{0} appended action",
            "otp": "Please enter OTP character {0}"
        },
        "fileInput": {
            "counter": "{0} files",
            "counterSize": "{0} files ({1} in total)"
        },
        "timePicker": {
            "am": "AM",
            "pm": "PM",
            "title": "Select Time"
        },
        "pagination": {
            "ariaLabel": {
                "root": "Pagination Navigation",
                "next": "Next page",
                "previous": "Previous page",
                "page": "Go to page {0}",
                "currentPage": "Page {0}, Current page",
                "first": "First page",
                "last": "Last page"
            }
        },
        "stepper": {
            "next": "Next",
            "prev": "Previous"
        },
        "rating": {
            "ariaLabel": {
                "item": "Rating {0} of {1}"
            }
        },
        "loading": "Loading...",
        "infiniteScroll": {
            "loadMore": "Load more",
            "empty": "No more"
        }
    }
}

vueData.v_Set.themeStyle = {
    display: {
        mobileBreakpoint: 'lg',
        thresholds: {
            xs: 0,
            sm: 340,
            md: 540,
            lg: 800,
            xl: 1280,
        },
    },
    // theme: {
    //     options: { customProperties: true },
    //     themes: {
    //         light: {
    //             dark: false,
    //             colors: {
    //                 primary: "#217D46",
    //                 secondary: "#5BB377"
    //             }
    //         },
    //     },
    // },
    locale: {
        locale: 'vi',
        fallback: 'en',
        messages
    },
    // date: {
    //     locale: {
    //         en: 'en-GB',
    //     },
    // },
    defaults: {
        global: {
            // transition: 'no',
            ripple: false,
            flat: true
        },
        VTextField: {
            density: "compact",
            clearable: true,
            color: 'primary',
            variant: "outlined",
            hideDetails: "auto",
        },
        VAutocomplete: {
            density: "compact",
            clearable: true,
            color: 'primary',
            hideDetails: "auto",
            variant: "outlined",
            noDataText: "Chưa có dữ liệu"
        },
        VSelect: {
            density: "compact",
            // clearable: true,
            color: 'primary',
            variant: "outlined",
            hideDetails: "auto",
            noDataText: "Chưa có dữ liệu"
        },
        VSwitch: {
            density: "compact",
            color: 'primary',
            hideDetails: "auto",
        },
        VRadioGroup: {
            color: 'primary',
            hideDetails: "auto",
        },
        VCheckbox: {
            density: "compact",
            color: "primary",
            hideDetails: "auto",
            class: "mt-0"
        },
        VList: {
            density: "compact",
        },
        VTabs: {
            color: 'primary',
            elevated: 4,
            sliderColor: 'primary',
            density: 'compact',
        },
        VTab: {
            color: 'primary',
            elevated: 4,
            sliderColor: 'primary',
            density: 'compact',
        },
        VTabsWindowItem: {
            transition: true
        },
        VProgressCircular: {
            color: 'primary'
        },
        VAvatar: {
            color: '',
        },
        VDataTable: {
            density: "compact",
            loadingText: "Đang tải dữ liệu...",
            noDataText: "Chưa có dữ liệu",
            itemsPerPageText: 'Dữ liệu trên mỗi trang',
            pageText: "{0}-{1} trên {2}",
            itemsPerPage: 15,
            itemsPerPageOptions: [
                { value: 10, title: '10' },
                { value: 15, title: '15' },
                { value: 25, title: '25' },
                { value: 50, title: '50' },
                { value: 100, title: '100' },
                { value: -1, title: 'Tất cả' }
            ],
            showCurrentPage: true,
            hover: true,
            fixedHeader: true,
            sticky: true,
            VProgressLinear: {
                color: 'primary'
            }
        },
        VDataTableVirtual: {
            density: "compact",
            loadingText: "Đang tải dữ liệu...",
            noDataText: "Chưa có dữ liệu",
            itemsPerPageText: 'Dữ liệu trên mỗi trang',
            pageText: "{0}-{1} trên {2}",
            itemsPerPage: 15,
            itemsPerPageOptions: [
                { value: 10, title: '10' },
                { value: 15, title: '15' },
                { value: 25, title: '25' },
                { value: 50, title: '50' },
                { value: 100, title: '100' },
                { value: -1, title: 'Tất cả' }
            ],
            showCurrentPage: true,
            hover: true,
            fixedHeader: true,
            sticky: true,
            VProgressLinear: {
                color: 'primary'
            },
        },
        VFileInput: {
            density: "compact",
            color: 'primary',
            variant: "outlined",
            hideDetails: "auto",
        },
        VCard: {
            VCardTitle: {
                class: 'pb-2 d-flex align-center',
            }
        },
        VDialog: {
            zIndex: 1006,
        },
        VExpansionPanels: {
            variant: 'accordion'
        }
    }
}

$('document').ready(() => {
    // app.component(Toasted)
    const i18n = VueI18n.createI18n({
        legacy: false,
        locale: 'vi',
        fallbackLocale: 'en',
        messages: {
            en: {
                message: {
                    language: 'English',
                    studyResult: 'STUDY RESULT',
                    selectedStudent: 'Selected student',
                    grade: "Grade",
                    class: "Class",
                    parent: "Parent",
                    semester: "Semester",
                    Skill_Knowledge: 'SKILL - KNOWLEDGE',
                    Common_Ability: 'COMMON ABILITY',
                    Quality: 'QUALITY',
                    Personal_Ability: 'PERSONAL ABILITY',

                    evaluation: "Evaluation",
                    comment: "Comment",

                    studentList: "Student list",

                    selectLanguage: "Select Language",
                    vietNam: "Vietnam",
                    english: "English",
                    next: "Next",
                    back: "Back",
                    confirm: "Confirm",

                    parent: "Parent",

                    monthList: "Month list",
                    studentNotFound: "Student not found",
                    month: "Month",
                    semester: "Semester",

                    rating: "Rating",
                    averageScore: "Average score",
                    comment: "Comment",
                    commentNotFound: "No comments yet"

                }
            },
            vi: {
                message: {
                    language: 'Tiếng Việt',
                    studyResult: 'KẾT QUẢ HỌC TẬP',
                    selectedStudent: 'Học sinh đang chọn',
                    grade: "Khối",
                    class: "Lớp",
                    parent: "Phụ huynh",
                    semester: "Kỳ thi",
                    Skill_Knowledge: 'KIẾN THỨC - KỸ NĂNG',
                    Common_Ability: 'NĂNG LỰC CHUNG',
                    Quality: 'PHẨM CHẤT',
                    Personal_Ability: 'NĂNG LỰC RIÊNG',
                    evaluation: "Nội dung đánh giá",
                    comment: "Nhận xét",

                    studentList: "Danh sách học sinh",

                    selectLanguage: "Chọn ngôn ngữ",
                    vietNam: "Việt Nam",
                    english: "Tiếng Anh",
                    next: "Tiếp tục",
                    confirm: "Xác nhận",

                    parent: "Phụ huynh",

                    monthList: "Danh sách tháng",
                    studentNotFound: "Không tìm thấy học sinh",
                    month: "Tháng",
                    semester: "Học kỳ",

                    rating: "Xếp loại",
                    averageScore: "Điểm trung bình",
                    comment: "Nhận xét",
                    commentNotFound: "Chưa có nhận xét",

                }
            }
        }
    })
    app.use(i18n);
    console.log('======================')
})

