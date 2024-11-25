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
    // locale: {
    //     locale: 'vi',
    //     fallback: 'en',
    //     messages
    // },
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
})

