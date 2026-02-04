/**
 * BangDiemService.js
 * Service xử lý nghiệp vụ bảng điểm
 * Version: 1.0.0
 */
// ==================== CONSTANTS ====================
const CONSTANTS = {
    SUBJECT_IDS: {
        ENGLISH_5: 5,
        ENGLISH_46: 46,
        ENGLISH_76: 76,
        STEM_36: 36,
        GROUP_101: 101
    },
    ENGLISH_SUBJECTS: [5, 46, 76],
    GROUP_SUBJECTS: [101, 76],
    CONVERT_STAR_SUBJECTS: [36, 37, 38, 40, 41, 42, 43, 106],
    COLUMN_TYPES: {
        NUMBER: 'number',
        TEXT: 'text',
        ICO_STAR: 'ICO_Star',
        DROPDOWN_TEXT: 'Dropdown_text',
        DROPDOWN_THC: 'Dropdown_THC',
        DROPDOWN_TDC: 'Dropdown_TDC',
        DROPDOWN_CD_D: 'Dropdown_CD_D'
    },
    FORMULA_COLUMN: 'Công thức',
    CENTER_ALIGN_COLUMNS: [
        'MucDoDanhGia', 'DiemGK_HK2', 'DiemGK_HK1', 'DiemCK_HK1',
        'Theme1_Result', 'Theme2_Result', 'Theme3_Result', 'Theme4_Result',
        'Theme5_Result', 'Theme6_Result', 'Theme7_Result', 'Theme8_Result'
    ],
    THEME_MAPPING: {
        'Theme_2': { nhom: 'S1_Mid_TA2', cot: 'S1_Mid_TA2_Point', target: 'Theme2_TST' },
        'Theme_4': { nhom: 'S1_Final_TA2', cot: 'S1_Final_TA2_Point', target: 'Theme4_TST' },
        'Theme_6': { nhom: 'S2_Mid_TA2', cot: 'S2_Mid_TA2_Point', target: 'Theme6_TST' },
        'Theme_8': { nhom: 'S2_Final_TA2', cot: 'S2_Final_TA2_Point', target: 'Theme8_TST' }
    },
    TINH_TRANG: {
        LUU_TAM: 1,
        GUI_BGH: 2,
        TU_CHOI_GVCN: 3,
        DUYET_GVCN: 4,
        TU_CHOI_TO_TRUONG: 5,
        DUYET_TO_TRUONG: 6,
        TU_CHOI_BGH: 7,
        DUYET_BGH: 8
    },
};
// ==================== API SERVICE ====================
const ApiService = {
    /**
     * Gọi API lấy dữ liệu bảng điểm
     */
    async fetchBangDiem(action, params) {
        return await ajaxCALLPromise(action, params);
    },
    /**
     * Lưu dữ liệu điểm
     */
    async saveGradeData(params) {
        return await ajaxCALLPromise("lms/KQHT_MonHocLop_Ins", params);
    },
    /**
     * Cập nhật tình trạng Cấp 1
     */
    async updateTinhTrang(params) {
        return await ajaxCALLPromise("lms/KQHT_MonHocLop_TinhTrang_Udp", {
            ...params,
            IsSendToManager: true
        });
    },
    /**
     * Cập nhật tình trạng Cấp 1 - Lưu tạm
     */
    async updateTinhTrangLuuTam(params) {
        return await ajaxCALLPromise("lms/KQHT_MonHocLop_TinhTrang_Udp", {
            ...params,
            IsSendToManager: false
        });
    },
    /**
     * Lấy MonHocLop theo MonHocID
     */
    async getMonHocLopByMonHocID(params) {
        return await ajaxCALLPromise("lms/MonHocLop_Select_By_MonHocID", params);
    },
    /**
     * Cập nhật tình trạng Cấp 2, Cấp 3
     */
    async updateTinhTrangC2C3(params) {
        return await ajaxCALLPromise("lms/KQHT_MonHocLop_TinhTrang_Udp_C2_C3", params);
    },
    /**
     * Lấy danh sách khóa cột điểm
     */
    async getKhoaCotDiem(params) {
        return await ajaxCALLPromise("lms/KhoaCotDiem_Get", params);
    },
    /**
     * Khóa/Mở khóa cột điểm
     */
    async toggleKhoaCotDiem(params) {
        return await ajaxCALLPromise("lms/KhoaCotDiem_Ins_And_Upd", params);
    }
};
// ==================== FILTER SERVICE ====================
const FilterService = {
    /**
     * Xác định action API dựa trên filter
     */
    getBangDiemAction(filter) {
        const monHocID = filter.MonHocItem?.MonHocID;
        const maNhom = filter.MaNhomCotDiemItem?.MaNhomCotDiem;
        // Môn 5 (English) - DiemCK/DiemGK
        if (monHocID === 5 && (maNhom?.includes('DiemCK') || maNhom?.includes('DiemGK'))) {
            return 'lms/HocSinhBangDiem_Get_ByThuTuNhom';
        }
        // Môn 36 (STEM) - DiemCK
        if (monHocID === CONSTANTS.SUBJECT_IDS.STEM_36 && maNhom?.includes('DiemCK')) {
            return 'lms/HocSinhBangDiem_STEM_CK_Get';
        }
        return 'lms/HocSinhBangDiem_Get_ByMonHocID_MaNhom';
    },
    /**
     * Kiểm tra môn học có phải Tiếng Anh
     */
    isEnglishSubject(monHocID) {
        return CONSTANTS.ENGLISH_SUBJECTS.includes(monHocID);
    },
    /**
     * Kiểm tra môn học có phải môn nhóm
     */
    isGroupSubject(monHocID) {
        return CONSTANTS.GROUP_SUBJECTS.includes(monHocID);
    },
    /**
     * Kiểm tra môn học có đổi sao
     */
    isMonHocConvertWithStar(monHocID) {
        return CONSTANTS.CONVERT_STAR_SUBJECTS.includes(monHocID);
    },
    /**
     * Kiểm tra filter hợp lệ
     */
    isValidFilter(filter) {
        return filter.KhoiItem !== null &&
            filter.LopItem !== null &&
            filter.MonHocItem !== null &&
            filter.MaNhomCotDiemItem !== null;
    }
};
// ==================== DATA PROCESSOR ====================
const DataProcessor = {
    /**
     * Xử lý danh sách học sinh duy nhất
     */
    processStudentList(apiData) {
        const uniqueIds = [...new Set(apiData.map(x => x.HocSinhID))];
        return uniqueIds.map(id => {
            const student = apiData.find(y => y.HocSinhID === id);
            return {
                Ho: student.Ho,
                HocSinhID: student.HocSinhID,
                NgaySinh: student.NgaySinh,
                Nu: student.Nu,
                SoDanhBo: student.SoDanhBo,
                Ten: student.Ten,
                TinhTrang: student.TinhTrang,
            };
        });
    },
    /**
     * Tính số cột freeze dựa trên môn học
     */
    calculateFreezeColumns(monHocID, isEnglish, isGroup) {
        if (monHocID === CONSTANTS.SUBJECT_IDS.ENGLISH_5 ||
            monHocID === CONSTANTS.SUBJECT_IDS.ENGLISH_46) {
            return isEnglish ? 4 : 3;
        }
        if (monHocID === CONSTANTS.SUBJECT_IDS.ENGLISH_76) {
            return isEnglish ? 5 : 3;
        }
        if (monHocID === CONSTANTS.SUBJECT_IDS.GROUP_101) {
            return 4;
        }
        return 3;
    },
    /**
     * Xử lý giá trị cột không có công thức
     */
    processNonFormulaValue(column) {
        const { GiaTriCotDiem, KetQuaDanhGia_VI, MaCotDiem, KQHTID } = column;
        // Cột số
        if (GiaTriCotDiem === CONSTANTS.COLUMN_TYPES.NUMBER) {
            return (KetQuaDanhGia_VI === '' || KetQuaDanhGia_VI === null)
                ? null
                : parseFloat(KetQuaDanhGia_VI);
        }
        // Cột text
        let value = KetQuaDanhGia_VI;
        // Giá trị mặc định cho cột "Mức độ đánh giá"
        if (MaCotDiem.includes('MucDoDanhGia') && KQHTID === 0) {
            value = value || 'T';
        }
        return value;
    },
    /**
     * Validate dữ liệu trước khi lưu
     */
    validateSave(typeCell, value, min, max) {
        if (value == null || value === '') return 0;
        if (typeCell === 'number' && (value < min || value > max)) return 1;
        return 0;
    },
    /**
     * Xử lý dữ liệu trước khi push API
     */
    processBeforePushAPI(editedCells, DSHocSinh, DSHocSinh_API, freezeColumns, filter, instance) {
        console.log(
            "editedCells", editedCells,
            "\nDSHocSinh", DSHocSinh,
            "\nDSHocSinh_API", DSHocSinh_API,
            "\nfreezeColumns", freezeColumns,
            "\nfilter", filter,
            "\ninstance", instance
        )
        const dataBeforeInsertToDB = [];
        for (let i = 0; i < DSHocSinh.length; i++) {
            const hocSinh = DSHocSinh[i];
            for (let j = 0; j < DSHocSinh_API.length; j++) {
                const exists = editedCells.find(cell => cell.x == j && cell.y == i);
                if (!exists) continue;
                const currentJ = j - freezeColumns;
                const currentI = i;
                const cotDiem = DSHocSinh_API[currentJ];
                let giaTriCotDiem = hocSinh[cotDiem.MaCotDiem];
                // Lấy giá trị từ công thức
                if (cotDiem.LoaiCotDiem === CONSTANTS.FORMULA_COLUMN) {
                    giaTriCotDiem = instance[0].records[exists.y][exists.x]?.element?.innerHTML;
                }
                // Xử lý giá trị number
                if (cotDiem.GiaTriCotDiem === 'number') {
                    if (giaTriCotDiem === null || giaTriCotDiem === NaN || giaTriCotDiem === '') {
                        giaTriCotDiem = '';
                    }
                }
                const cotDiem_HS = {
                    HocSinhID: hocSinh.HocSinhID,
                    LopID: filter.LopItem.LopID,
                    NienKhoa: filter.NienKhoa,
                    CotDiemID: cotDiem.CotDiemID,
                    KetQuaDanhGia_VI: giaTriCotDiem,
                    KetQuaDanhGia_EN: giaTriCotDiem,
                    KQHTID: DSHocSinh_API.find(x =>
                        x.HocSinhID === hocSinh.HocSinhID &&
                        x.MaCotDiem === cotDiem.MaCotDiem
                    )?.KQHTID ?? 0,
                    KhoaCotDiemID: DSHocSinh_API.find(x =>
                        x.HocSinhID === hocSinh.HocSinhID &&
                        x.MaCotDiem === cotDiem.MaCotDiem
                    )?.KhoaCotDiemID ?? 0,
                };
                // Validate
                cotDiem_HS.IsError = this.validateSave(
                    cotDiem.GiaTriCotDiem,
                    cotDiem_HS.KetQuaDanhGia_VI,
                    cotDiem.DiemMin,
                    cotDiem.DiemMax
                );
                if (cotDiem_HS.IsError === 1) {
                    const cellAddress = jspreadsheet.helpers.getCellNameFromCoords(currentJ, currentI);
                    instance[0].setStyle(cellAddress, 'background-color', 'red');
                    Vue.$toast.error(
                        `Cột điểm chỉ cho phép nhập thang điểm từ ${cotDiem.DiemMin} đến ${cotDiem.DiemMax}!`,
                        { position: 'top' }
                    );
                    return undefined;
                }
                cotDiem_HS.KetQuaDanhGia_VI = cotDiem_HS.KetQuaDanhGia_VI === NaN
                    ? null
                    : cotDiem_HS.KetQuaDanhGia_VI;
                dataBeforeInsertToDB.push(cotDiem_HS);
            }
        }
        // Filter data hợp lệ
        return dataBeforeInsertToDB.filter(x =>
            (x.KQHTID && x.KQHTID > 0) ||
            (x.KetQuaDanhGia_VI != null && x.KetQuaDanhGia_VI !== '' && !Number.isNaN(x.KetQuaDanhGia_VI))
        ).filter(x => !Number.isNaN(x.KetQuaDanhGia_VI));
    }
};
// ==================== HEADER BUILDER ====================
const HeaderBuilder = {
    /**
     * Build cột thông tin học sinh
     */
    buildStudentInfoColumns(isGroup, isEnglish) {
        const columns = [
            {
                type: 'text',
                title: 'Mã học sinh',
                name: 'HocSinhID',
                width: 100,
                backGroundColor: null,
                wrap: true,
                readOnly: true
            },
            {
                type: 'text',
                title: 'Số Danh Bộ',
                name: 'SoDanhBo',
                width: 100,
                backGroundColor: null,
                wrap: true,
                readOnly: true
            },
            {
                type: 'text',
                title: 'Họ tên học sinh',
                name: 'HoVaTenHocSinh',
                width: 200,
                backGroundColor: null,
                wrap: true,
                align: "left",
                readOnly: true
            }
        ];
        if (isGroup) {
            columns.push({
                type: 'text',
                title: 'Lớp chủ nhiệm',
                name: 'TenLop',
                width: 70,
                backGroundColor: null,
                wrap: true,
                align: "left",
                readOnly: true
            });
        }
        if (isEnglish) {
            columns.push({
                type: 'text',
                title: 'English Name',
                name: 'EnglishName',
                width: 100,
                backGroundColor: null,
                wrap: true,
                align: "left",
                readOnly: true
            });
        }
        return columns;
    },
    /**
     * Build cột điểm
     */
    buildGradeColumn(column, isEnglish, isDisabled, lockedColumns) {
        const isLocked = lockedColumns.some(x => x.MaCotDiem === column.MaCotDiem && x.TinhTrang);
        let title = isEnglish ? column.TenHienThi_EN : column.TenHienThi_VI;
        let backGroundColor = column.HexBackground;
        let width = parseInt(column?.WidthCSS ?? 80);
        if (isLocked) {
            title += ' (KHÓA)';
            backGroundColor = '#c1c1c157';
            width += 25;
        }
        const config = {
            title,
            name: column.MaCotDiem,
            width,
            typeValue: column.GiaTriCotDiem,
            backGroundColor,
            wrap: true,
            readOnly: column.LoaiCotDiem === CONSTANTS.FORMULA_COLUMN || isDisabled || isLocked
        };
        return this.buildColumnByType(column.GiaTriCotDiem, config, column);
    },
    /**
     * Build cấu hình cột theo type
     */
    buildColumnByType(valueType, baseConfig, columnData) {
        const builders = {
            [CONSTANTS.COLUMN_TYPES.NUMBER]: () => ({
                ...baseConfig,
                type: 'numeric',
                decimal: '.',
                autoWidth: true,
                align: 'center'
            }),
            [CONSTANTS.COLUMN_TYPES.TEXT]: () => ({
                ...baseConfig,
                type: 'text',
                align: this.shouldCenterAlign(columnData.MaCotDiem) ? 'center' : 'left'
            }),
            [CONSTANTS.COLUMN_TYPES.ICO_STAR]: () => ({
                ...baseConfig,
                type: 'html',
                align: 'center'
            }),
            [CONSTANTS.COLUMN_TYPES.DROPDOWN_TEXT]: () => ({
                ...baseConfig,
                type: 'dropdown',
                align: 'center',
                source: [{ id: '1', name: 'Done' }, { id: '0', name: 'Not Yet' }]
            }),
            [CONSTANTS.COLUMN_TYPES.DROPDOWN_THC]: () => ({
                ...baseConfig,
                type: 'dropdown',
                align: 'center',
                source: ['T', 'H', 'C']
            }),
            [CONSTANTS.COLUMN_TYPES.DROPDOWN_TDC]: () => ({
                ...baseConfig,
                type: 'dropdown',
                align: 'center',
                source: ['T', 'Đ', 'C']
            }),
            [CONSTANTS.COLUMN_TYPES.DROPDOWN_CD_D]: () => ({
                ...baseConfig,
                type: 'dropdown',
                align: 'center',
                source: ['CĐ', 'Đ']
            })
        };
        const builder = builders[valueType];
        return builder ? builder() : baseConfig;
    },
    shouldCenterAlign(columnCode) {
        return CONSTANTS.CENTER_ALIGN_COLUMNS.some(col => columnCode.includes(col));
    },
    /**
     * Build nested headers
     */
    buildNestedHeaders(gradeColumns, apiData, freezeColumns, isGroup) {
        const groupNames = [...new Set(apiData.map(x => x.MaNhomCotDiem))];
        const nestedHeader = [{
            title: 'Thông tin học sinh',
            colspan: freezeColumns + (isGroup ? 1 : 0)
        }];
        groupNames.forEach(groupName => {
            const matchingColumn = gradeColumns.find(col => col.MaNhomCotDiem === groupName);
            const columnCount = gradeColumns.filter(col => col.MaNhomCotDiem === groupName).length;
            nestedHeader.push({
                title: matchingColumn.TenNhomCotDiem_VI,
                colspan: columnCount
            });
        });
        return [nestedHeader];
    }
};
// ==================== FORMULA PROCESSOR ====================
const FormulaProcessor = {
    /**
     * Xử lý cột có công thức
     */
    processFormulaValue(column, allColumns, rowIndex, filter, headers, freezeColumns, isEnglish, vueData) {
        const { Formula, GiaTriCotDiem, KetQuaDanhGia_VI, MaCotDiem } = column;
        const groupCode = filter.MaNhomCotDiemItem?.MaNhomCotDiem;
        const columnsCotDiem = headers.filter(h => h.typeValue);
        if (!Formula) {
            return GiaTriCotDiem === CONSTANTS.COLUMN_TYPES.NUMBER
                ? parseFloat(KetQuaDanhGia_VI ?? 0)
                : KetQuaDanhGia_VI;
        }
        // CASE 1: DiemTBCK_HK1/HK2
        if (this.isCase_DiemTBCK(groupCode, MaCotDiem)) {
            return KetQuaDanhGia_VI;
        }
        // CASE 2: Cấp 1 - DanhHieu
        if (this.isCase_Cap1_DanhHieu(MaCotDiem, vueData)) {
            return '=' + replaceFormula(columnsCotDiem, Formula, rowIndex, freezeColumns);
        }
        // CASE 3: English Theme Result
        if (this.isCase_EnglishThemeResult(column, isEnglish, filter)) {
            return KetQuaDanhGia_VI;
        }
        // CASE 4: STEM TongDiem
        if (this.isCase_STEM_TongDiem(groupCode, MaCotDiem, filter.MonHocItem?.MonHocID)) {
            return KetQuaDanhGia_VI;
        }
        // CASE 5: Chỉ có 1 cột
        if (allColumns.length === 1) {
            return parseFloat(KetQuaDanhGia_VI ?? 0);
        }
        // CASE 6: ICO_Star
        if (GiaTriCotDiem === CONSTANTS.COLUMN_TYPES.ICO_STAR) {
            return parseFloat(KetQuaDanhGia_VI ?? 0);
        }
        // CASE 7 & 8: Number hoặc Text có công thức
        if ([CONSTANTS.COLUMN_TYPES.NUMBER, CONSTANTS.COLUMN_TYPES.TEXT].includes(GiaTriCotDiem)) {
            return '=' + replaceFormula(columnsCotDiem, Formula, rowIndex, freezeColumns);
        }
        return KetQuaDanhGia_VI;
    },
    isCase_DiemTBCK(groupCode, maCotDiem) {
        return [
            'DiemTBGK_HK1',
            'DiemTBGK_HK2',
            'DiemTBCK_HK1',
            'DiemTBCK_HK2',
        ].includes(groupCode) &&
            ![
                'DiemTBGK_HK1',
                'DiemTBCK_HK2',
                'DiemTBCK_HK1',
                'DiemTBCK_HK2'
            ].includes(maCotDiem) &&
            !maCotDiem.includes('DanhHieu');
    },
    isCase_Cap1_DanhHieu(maCotDiem, vueData) {
        return vueData.CapID === 1 &&
            [
                'DiemTBGK_HK1',
                'DiemTBCK_HK1',
                'DiemTBGK_HK2',
                'DiemTBCK_HK2',
                'DanhHieuGK_HK1',
                'DanhHieuCK_HK1',
                'DanhHieuGK_HK2',
                'DanhHieuCK_HK2'
            ].includes(maCotDiem);
    },
    isCase_EnglishThemeResult(column, isEnglish, filter) {
        return isEnglish && this.isGetResultTopic(column, filter);
    },
    isCase_STEM_TongDiem(groupCode, maCotDiem, monHocID) {
        return groupCode?.includes('DiemCK') &&
            monHocID === CONSTANTS.SUBJECT_IDS.STEM_36 &&
            ['TongDiem_CD1', 'TongDiem_CD2', 'TongDiem_CD3'].some(x => maCotDiem.includes(x));
    },
    isGetResultTopic(column, filter) {
        const groupCode = filter.MaNhomCotDiemItem?.MaNhomCotDiem;
        const { MaCotDiem } = column;
        const isInGradeGroup = groupCode?.includes('DiemGK_') || groupCode?.includes('DiemCK_');
        const isNotMainColumn = !MaCotDiem.includes('DiemGK_') &&
            !MaCotDiem.includes('DiemCK_') &&
            !MaCotDiem.includes('DiemTBGK_') &&
            !MaCotDiem.includes('DiemTBCK_');
        return isInGradeGroup && isNotMainColumn;
    }
};
// ==================== STYLE SERVICE ====================
const StyleService = {
    /**
     * Áp dụng background style
     */
    applyBackgroundStyles(students, gradeColumns, freezeColumns) {
        const styleSheet = {};
        students.forEach((row, rowIndex) => {
            gradeColumns.forEach((column, colIndex) => {
                const cellAddress = jspreadsheet.helpers.getCellNameFromCoords(
                    colIndex + freezeColumns,
                    rowIndex
                );
                // Màu nền cột
                if (column.HexBackground) {
                    styleSheet[cellAddress] = `background-color: ${column.HexBackground}`;
                }
                // Highlight ô trống
                const value = row[column.MaCotDiem];
                if (value === null || value === '') {
                    styleSheet[cellAddress] = 'background-color: #ffff0052';
                }
            });
        });
        return styleSheet;
    },
    /**
     * Áp dụng comments
     */
    applyComments(students, gradeColumns, apiData, freezeColumns) {
        const comments = {};
        students.forEach((row, rowIndex) => {
            gradeColumns.forEach((column, colIndex) => {
                const cellAddress = jspreadsheet.helpers.getCellNameFromCoords(
                    colIndex + freezeColumns,
                    rowIndex
                );
                const commentData = apiData.find(
                    x => x.HocSinhID === row.HocSinhID &&
                        x.MaCotDiem === column.MaCotDiem &&
                        x.Is_Comment
                );
                if (commentData) {
                    comments[cellAddress] = `Cột điểm do ${commentData.NhapDiemUser} đã nhập`;
                }
            });
        });
        return comments;
    }
};
// ==================== EXPORT SERVICE ====================
const ExportService = {
    /**
     * Export Excel
     */
    exportExcel(headers, data, fileName) {
        const headerNames = headers.map(x => x.name);
        const exportData = data.map(item =>
            headerNames.map(h => item[h] ?? "")
        );
        const worksheet = XLSX.utils.aoa_to_sheet([headerNames, ...exportData]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, fileName);
    },
    /**
     * Chuẩn bị dữ liệu export
     */
    prepareExportData(DSHocSinh, DSCotDiem_ByMaNhomCotDiem, instance, freezeColumns, filter) {
        const dataExcel = [];
        const isEnglish = FilterService.isEnglishSubject(filter.MonHocItem?.MonHocID);
        const isGroup76 = filter.MonHocItem?.MonHocID === 76;
        for (let i = 0; i < DSHocSinh.length; i++) {
            const cotDiem_HS = {
                HocSinhID: DSHocSinh[i].HocSinhID,
                HoVaTenHocSinh: DSHocSinh[i].HoVaTenHocSinh,
                SoDanhBo: DSHocSinh[i].SoDanhBo
            };
            if (isGroup76) {
                cotDiem_HS.TenLop = DSHocSinh[i].TenLop ?? '';
            }
            if (isEnglish) {
                cotDiem_HS.EnglishName = DSHocSinh[i].EnglishName ?? '';
            }
            for (let j = 0; j < DSCotDiem_ByMaNhomCotDiem.length; j++) {
                let giaTriCotDiem = DSHocSinh[i][DSCotDiem_ByMaNhomCotDiem[j].value];
                if (DSCotDiem_ByMaNhomCotDiem[j].LoaiCotDiem === CONSTANTS.FORMULA_COLUMN) {
                    giaTriCotDiem = instance[0].records[i][j + freezeColumns]?.element?.innerHTML;
                }
                if (DSCotDiem_ByMaNhomCotDiem[j].GiaTriCotDiem === 'number') {
                    if (giaTriCotDiem === null || giaTriCotDiem === NaN || giaTriCotDiem === '') {
                        giaTriCotDiem = '';
                    } else {
                        giaTriCotDiem = parseFloat(giaTriCotDiem);
                    }
                }
                cotDiem_HS[DSCotDiem_ByMaNhomCotDiem[j].value] = giaTriCotDiem;
            }
            dataExcel.push(cotDiem_HS);
        }
        return dataExcel;
    }
};
// ==================== UTILITY SERVICE ====================
const UtilityService = {
    /**
     * Lấy Tình Trạng để disable/enable UI
     */
    getTinhTrangStatus(DSHocSinh_API, vueData) {
        if (DSHocSinh_API.length === 0) {
            return {
                isDisabled: false,
                TinhTrang: null
            };
        }
        const priorityStudent = fn_ProrityTinhTrang(DSHocSinh_API);
        const tinhTrang = priorityStudent?.TinhTrang;
        const status = fn_IsDisabledTinhTrangDiem({
            TinhTrang: tinhTrang,
            type: 'GV',
            CapID: vueData.CapID
        });
        return {
            isDisabled: status.disabled,
            TinhTrang: tinhTrang,
            statusDetail: status
        };
    },
    /**
     * Lấy thông tin từ chối
     */
    getReasonReject(DSHocSinh_API, vueData) {
        const defaultObj = {
            disabled: false,
            NoiDungNhanXet: null,
            TinhTrang: null
        };
        if (DSHocSinh_API.length === 0) return defaultObj;
        const obj = DSHocSinh_API.find(x => x.TinhTrang === 3 || x.TinhTrang === 5 || x.TinhTrang === 7);
        if (obj) {
            defaultObj.disabled = true;
            defaultObj.NoiDungNhanXet = obj.NoiDungNhanXet ?? '';
            defaultObj.TinhTrang = obj.TinhTrang ?? '';
        }
        return defaultObj;
    },
    /**
     * Render text người từ chối
     */
    renderTextPersonReject(TinhTrang, vueData) {
        if (!TinhTrang) return '';
        let text = '';
        if (vueData.CapID === 1) {
            if (TinhTrang === 3) text = 'Giáo viên chủ nhiệm từ chối';
            if (TinhTrang === 5) text = 'Tổ trưởng từ chối';
            if (TinhTrang === 7) text = 'BGH chủ nhiệm từ chối';
        } else {
            if (TinhTrang === 3) text = 'BGH từ chối';
        }
        return text;
    },
    /**
     * Lấy điểm Test từ Theme
     */
    async getThemeTestScore(filter, DSHocSinh) {
        const maNhom = filter.MaNhomCotDiemItem.MaNhomCotDiem;
        const mapping = CONSTANTS.THEME_MAPPING[maNhom];
        if (!mapping) return DSHocSinh;
        const DSCotDiem_TA2 = await ApiService.fetchBangDiem(
            'lms/HocSinhBangDiem_Get_ByMonHocID_MaNhom',
            {
                LopID: filter.LopItem.LopID,
                MonHocID: filter.MonHocItem.MonHocID,
                TemplateBangDiemID: filter.MonHocItem.TemplateBangDiemID,
                MaNhomCotDiem: mapping.nhom
            }
        );
        const arrFilterDSCotDiemWithThemeTest = DSCotDiem_TA2.filter(
            x => x.MaCotDiem === mapping.cot
        );
        return DSHocSinh.map(hocSinh => {
            const cotDiemByHocSinh = arrFilterDSCotDiemWithThemeTest.find(
                x => x.HocSinhID === hocSinh.HocSinhID
            );
            if (cotDiemByHocSinh) {
                hocSinh[mapping.target] = cotDiemByHocSinh.KetQuaDanhGia_VI;
            }
            return hocSinh;
        });
    }
};
// ==================== TINH TRANG SERVICE ====================
const TinhTrangService = {
    /**
     * Cập nhật tình trạng cho các môn NLPC liên quan (Cấp 1)
     */
    async updateTinhTrangNLPC(filter, vueData, tinhTrang = CONSTANTS.TINH_TRANG.LUU_TAM) {
        const ListMonHoc = filter.MonHocItem?.List_MonHoc_NLPC_ID;
        if (!ListMonHoc) {
            console.log("⚠️ Không có môn NLPC liên quan");
            return { success: true, count: 0 };
        }
        const monHocIDArray = ListMonHoc.split(",").map(id => id.trim()).filter(Boolean);
        console.log(`🔄 Bắt đầu cập nhật tình trạng ${tinhTrang} cho ${monHocIDArray.length} môn NLPC`);
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        for (const monHocID of monHocIDArray) {
            try {
                const monHocLopList = await ApiService.getMonHocLopByMonHocID({
                    MonHocID: monHocID,
                    LopID: filter.LopItem.LopID,
                    NienKhoa: vueData.NienKhoa
                });
                const MonHocLopID = monHocLopList[0]?.MonHocLopID;
                if (!MonHocLopID) {
                    console.warn(`⚠️ Không tìm thấy MonHocLopID cho MonHocID: ${monHocID}`);
                    errorCount++;
                    errors.push({ monHocID, error: 'MonHocLopID not found' });
                    continue;
                }
                const apiMethod = tinhTrang === CONSTANTS.TINH_TRANG.GUI_BGH
                    ? ApiService.updateTinhTrang
                    : ApiService.updateTinhTrangLuuTam;
                await apiMethod({
                    NienKhoa: vueData.NienKhoa,
                    MonHocLopID: MonHocLopID,
                    LopID: filter.LopItem.LopID,
                    TinhTrang: tinhTrang,
                    MaNhomCotDiem: filter.MaNhomCotDiemItem.MaNhomCotDiem
                });
                successCount++;
                console.log(`✅ Đã cập nhật tình trạng ${tinhTrang} cho MonHocID: ${monHocID}`);
            } catch (error) {
                errorCount++;
                errors.push({ monHocID, error: error.message });
                console.error(`❌ Lỗi khi cập nhật MonHocID ${monHocID}:`, error);
            }
        }
        console.log(`📊 Kết quả: ${successCount}/${monHocIDArray.length} thành công`);
        return {
            success: errorCount === 0,
            total: monHocIDArray.length,
            successCount,
            errorCount,
            errors
        };
    },
    /**
     * Lưu tạm - Cập nhật tình trạng = 1
     */
    async saveDraft(filter, vueData) {
        try {
            console.log("💾 Bắt đầu lưu tạm...");
            if ([2, 3].includes(vueData.CapID)) {
                await ApiService.updateTinhTrangC2C3({
                    NienKhoa: vueData.NienKhoa,
                    LopID: filter.LopItem.LopID,
                    MonHocLopID: filter.MonHocItem.MonHocLopID,
                    MaNhomCotDiem: filter.MaNhomCotDiemItem.MaNhomCotDiem,
                    TinhTrang: CONSTANTS.TINH_TRANG.LUU_TAM
                });
            } else {
                await ApiService.updateTinhTrangLuuTam({
                    NienKhoa: vueData.NienKhoa,
                    MonHocLopID: filter.MonHocItem.MonHocLopID,
                    LopID: filter.LopItem.LopID,
                    TinhTrang: CONSTANTS.TINH_TRANG.LUU_TAM,
                    MaNhomCotDiem: filter.MaNhomCotDiemItem.MaNhomCotDiem
                });
                await this.updateTinhTrangNLPC(filter, vueData, CONSTANTS.TINH_TRANG.LUU_TAM);
            }
            return { success: true };
        } catch (error) {
            console.error("❌ Lỗi khi lưu tạm:", error);
            throw error;
        }
    },
    /**
     * Gửi BGH - Cập nhật tình trạng = 2
     */
    async sendToBGH(filter, vueData) {
        try {
            console.log("📤 Bắt đầu gửi BGH...");
            if ([2, 3].includes(vueData.CapID)) {
                await ApiService.updateTinhTrangC2C3({
                    NienKhoa: vueData.NienKhoa,
                    LopID: filter.LopItem.LopID,
                    MonHocLopID: filter.MonHocItem.MonHocLopID,
                    MaNhomCotDiem: filter.MaNhomCotDiemItem.MaNhomCotDiem,
                    TinhTrang: CONSTANTS.TINH_TRANG.GUI_BGH
                });
            } else {
                await ApiService.updateTinhTrang({
                    NienKhoa: vueData.NienKhoa,
                    MonHocLopID: filter.MonHocItem.MonHocLopID,
                    LopID: filter.LopItem.LopID,
                    TinhTrang: CONSTANTS.TINH_TRANG.GUI_BGH,
                    MaNhomCotDiem: filter.MaNhomCotDiemItem.MaNhomCotDiem
                });
                await this.updateTinhTrangNLPC(filter, vueData, CONSTANTS.TINH_TRANG.LUU_TAM);
            }
            return { success: true };
        } catch (error) {
            console.error("❌ Lỗi khi gửi BGH:", error);
            throw error;
        }
    }
};
// ==================== MAIN SERVICE ====================
const BangDiemService = {
    constants: CONSTANTS,
    api: ApiService,
    filter: FilterService,
    data: DataProcessor,
    header: HeaderBuilder,
    formula: FormulaProcessor,
    style: StyleService,
    export: ExportService,
    utility: UtilityService,
    tinhTrang: TinhTrangService, // THÊM DÒNG NÀY
    /**
     * Khởi tạo dữ liệu bảng điểm hoàn chỉnh
     */
    async initialize(filter, vueData) {
        try {
            // Validate filter
            if (!this.filter.isValidFilter(filter)) {
                return {
                    students: [],
                    headers: [],
                    nestedHeaders: [],
                    freezeColumns: 3,
                    styleSheet: {},
                    comments: {},
                    apiData: [],
                    lockedColumns: [],
                    DSCotDiem_ByMaNhomCotDiem: [],
                    tinhTrangStatus: { isDisabled: false, TinhTrang: null }
                };
            }
            // 1. Fetch data
            const action = this.filter.getBangDiemAction(filter);
            const apiData = await this.api.fetchBangDiem(action, {
                LopID: filter.LopItem.LopID,
                MonHocID: filter.MonHocItem.MonHocID,
                TemplateBangDiemID: filter.MonHocItem.TemplateBangDiemID,
                MaNhomCotDiem: filter.MaNhomCotDiemItem.MaNhomCotDiem,
                ThuTuNhom: filter.MaNhomCotDiemItem.ThuTuNhom,
                Semester: filter.MaNhomCotDiemItem.Semester
            });
            // 2. Lấy Tình Trạng ngay sau khi fetch data
            const tinhTrangStatus = this.utility.getTinhTrangStatus(apiData, vueData);
            // 3. Process students
            const students = this.data.processStudentList(apiData);
            // 4. Calculate freeze columns
            const isEnglish = this.filter.isEnglishSubject(filter.MonHocItem.MonHocID);
            const isGroup = this.filter.isGroupSubject(filter.MonHocItem.MonHocID);
            const freezeColumns = this.data.calculateFreezeColumns(
                filter.MonHocItem.MonHocID,
                isEnglish,
                isGroup
            );
            // 5. Get locked columns
            const lockedColumns = await this.api.getKhoaCotDiem({
                LopID: filter.LopItem.LopID,
                MonHocLopID: filter.MonHocItem.MonHocLopID,
                MaNhomCotDiem: filter.MaNhomCotDiemItem.MaNhomCotDiem,
                Semester: filter.MaNhomCotDiemItem.Semester,
                NienKhoa: vueData.NienKhoa
            });
            // 6. Build headers - Sử dụng tinhTrangStatus.isDisabled
            const firstStudent = fn_ProrityTinhTrang(students);
            const gradeColumns = apiData.filter(x => x.HocSinhID === firstStudent.HocSinhID);
            const DSCotDiem_ByMaNhomCotDiem = gradeColumns.map(x => ({
                title: x.TenCotDiem_VI,
                value: x.MaCotDiem
            }));
            console.log("gradeColumns", gradeColumns)
            const headers = [
                ...this.header.buildStudentInfoColumns(isGroup, isEnglish),
                ...gradeColumns.map(col =>
                    this.header.buildGradeColumn(
                        col,
                        isEnglish,
                        tinhTrangStatus.isDisabled, // Sử dụng isDisabled từ tinhTrangStatus
                        lockedColumns
                    )
                )
            ];
            const nestedHeaders = this.header.buildNestedHeaders(
                gradeColumns,
                apiData,
                freezeColumns,
                isGroup
            );
            //Build display columns with lock status
            const displayColumns = DSCotDiem_ByMaNhomCotDiem.map(cotDiem => {
                const lockedCol = lockedColumns.find(
                    x => x.MaCotDiem === cotDiem.value && x.TinhTrang === true
                );
                return {
                    title: cotDiem.title,
                    value: cotDiem.value,
                    isLocked: !!lockedCol
                };
            });
            // 7. Build data rows
            const dataRows = this.buildDataRows(
                students,
                apiData,
                filter,
                headers,
                freezeColumns,
                isEnglish,
                vueData
            );
            // 8. Apply styles and comments
            const styleSheet = this.style.applyBackgroundStyles(dataRows, gradeColumns, freezeColumns);
            const comments = this.style.applyComments(dataRows, gradeColumns, apiData, freezeColumns);
            return {
                students: dataRows,
                headers,
                nestedHeaders,
                freezeColumns,
                styleSheet,
                comments,
                apiData,
                lockedColumns,
                displayColumns,
                DSCotDiem_ByMaNhomCotDiem,
                tinhTrangStatus // Trả về tinhTrangStatus để component sử dụng
            };
        } catch (error) {
            console.error('BangDiemService.initialize error:', error);
            throw error;
        }
    },
    /**
     * Build data rows
     */
    buildDataRows(students, apiData, filter, headers, freezeColumns, isEnglish, vueData) {
        return students.map((student, rowIndex) => {
            const gradeColumns = apiData.filter(x => x.HocSinhID === student.HocSinhID);
            const rowData = {
                HocSinhID: student.HocSinhID,
                HoVaTenHocSinh: `${student.Ho} ${student.Ten}`,
                SoDanhBo: student.SoDanhBo
            };
            if (this.filter.isGroupSubject(filter.MonHocItem.MonHocID)) {
                rowData.TenLop = gradeColumns[0]?.TenLop;
            }
            if (isEnglish) {
                rowData.EnglishName = gradeColumns[0]?.EnglishName;
            }
            gradeColumns.forEach(column => {
                rowData[column.MaCotDiem] = this.processColumnValue(
                    column,
                    gradeColumns,
                    rowIndex + 1,
                    filter,
                    headers,
                    freezeColumns,
                    isEnglish,
                    vueData
                );
            });
            return rowData;
        });
    },
    /**
     * Process column value
     */
    processColumnValue(column, allColumns, rowIndex, filter, headers, freezeColumns, isEnglish, vueData) {
        if (column.LoaiCotDiem !== CONSTANTS.FORMULA_COLUMN) {
            return this.data.processNonFormulaValue(column);
        }
        return this.formula.processFormulaValue(
            column,
            allColumns,
            rowIndex,
            filter,
            headers,
            freezeColumns,
            isEnglish,
            vueData
        );
    },
    /**
     * Lưu dữ liệu
     */
    async saveData(editedCells, DSHocSinh, DSHocSinh_API, freezeColumns, filter, instance, vueData) {
        if (editedCells.length === 0) {
            Vue.$toast.warning("Bạn chưa điều chỉnh hoặc nhập điểm", { position: "top" })
            return
        }
        const data = this.data.processBeforePushAPI(
            editedCells,
            DSHocSinh,
            DSHocSinh_API,
            freezeColumns,
            filter,
            instance
        );
        if (!data) return false;
        const hasError = data.some(item => item.IsError === 1);
        if (hasError) {
            Vue.$toast.error('Cột điểm chỉ cho phép nhập thang điểm 10!', { position: 'top' });
            return false;
        }
        await this.api.saveGradeData({
            NienKhoa: vueData.NienKhoa,
            MonHocLopID: filter.MonHocItem.MonHocLopID,
            LopID: filter.LopItem.LopID,
            MonHocID: filter.MonHocItem.MonHocID,
            TemplateBangDiemID: filter.MonHocItem.TemplateBangDiemID,
            MaNhomCotDiem: filter.MaNhomCotDiemItem.MaNhomCotDiem,
            KetQuaObjArr: data
        });
        return true;
    },
    /**
     * Lưu tạm
     */
    async saveDraft(filter, vueData) {
        return await this.tinhTrang.saveDraft(filter, vueData);
    },
    /**
     * Gửi BGH - THAY THẾ METHOD CŨ
     */
    async sendToBGH(filter, vueData) {
        return await this.tinhTrang.sendToBGH(filter, vueData);
    }
}
// function convertDSHocSinh() {
//     let headers = []
//     let DSCotDiem_ByMaNhomCotDiem = []
//     vueData.DSHocSinh = [...new Set(vueData.DSCotDiem.map(x => x.HocSinhID))].map(id => {
//         const hs = vueData.DSCotDiem.find(y => y.HocSinhID === id)
//         return {
//             Ho: hs.Ho,
//             HocSinhID: hs.HocSinhID,
//             NgaySinh: hs.NgaySinh,
//             Nu: hs.Nu,
//             SoDanhBo: hs.SoDanhBo,
//             Ten: hs.Ten,
//             TinhTrang: hs.TinhTrang,
//         }
//     })
//     let SLCotDiem_OfFirstSTD = vueData.DSCotDiem.filter((item) => item.HocSinhID === fn_ProrityTinhTrang(vueData.DSHocSinh).HocSinhID) // lấy ra các cột điểm của học sinh đầu tiên
//     DSCotDiem_ByMaNhomCotDiem = SLCotDiem_OfFirstSTD
//     let DSMaNhomCotDiem = [...new Set(vueData.DSCotDiem.map(x => x.MaNhomCotDiem))]
//     let nestedHeader = [
//         [{
//             title: 'Thông tin học sinh',
//             colspan: 4
//         }]
//     ]
//     for (item of DSMaNhomCotDiem) {
//         nestedHeader[0].push(
//             {
//                 title: DSCotDiem_ByMaNhomCotDiem.find(item1 => item1.MaNhomCotDiem == item).TenNhomCotDiem_VI,
//                 colspan: DSCotDiem_ByMaNhomCotDiem.filter(item1 => item1.MaNhomCotDiem == item).length
//             }
//         )
//     }
//     vueData.nestedHeader = nestedHeader
//     //Xử lý động cột điểm header jexcel
//     const arrCotDiemWithAlignCenter = [
//         'MucDoDanhGia',
//         'DiemGK_HK2',
//         'DiemGK_HK1',
//         'DiemGK_HK2',
//         'DiemCK_HK1',
//         'Theme1_Result',
//         'Theme2_Result',
//         'Theme3_Result',
//         'Theme4_Result',
//         'Theme5_Result',
//         'Theme6_Result',
//         'Theme7_Result',
//         'Theme8_Result'
//     ]
//     const ListMonHoc = [5, 46, 76]
//     const isDisabled = vueData.TinhTrang.isDisabled
//     let columnsCotDiem = SLCotDiem_OfFirstSTD
//         .map((x) => {
//             if (x.GiaTriCotDiem === 'number') { // cấu hình header cột điểm có dạng number
//                 let column = {
//                     type: 'numeric',
//                     title: ListMonHoc.includes(vueData.MonHocItem.MonHocID) ? x.TenHienThi_EN : x.TenHienThi_VI,
//                     name: x.MaCotDiem,
//                     typeValue: x.GiaTriCotDiem,
//                     autoWidth: true,
//                     decimal: '.',
//                     // mask: '0.0',
//                     backGroundColor: x.HexBackground,
//                     width: x.WidthCSS,
//                     wrapText: true,
//                     readOnly: x.LoaiCotDiem === 'Công thức' || isDisabled ? true : false,
//                     align: 'center'
//                 }
//                 return column
//             }
//             else if (x.GiaTriCotDiem === 'text') { // cấu hình header cột điểm có dạng text
//                 let column = {
//                     type: 'text',
//                     title: x.TenHienThi_VI,
//                     name: x.MaCotDiem,
//                     width: x.WidthCSS,
//                     typeValue: x.GiaTriCotDiem,
//                     width: x.WidthCSS,
//                     backGroundColor: x.HexBackground,
//                     wrap: true,
//                     align: arrCotDiemWithAlignCenter.some(item => x.MaCotDiem.includes(item)) ? 'center' : 'left',
//                     readOnly: x.LoaiCotDiem === 'Công thức' || isDisabled ? true : false,
//                 }
//                 return column
//             }
//             else if (x.GiaTriCotDiem === 'ICO_Star') { // cấu hình header cột điểm có dạng ICO_Star
//                 let column = {
//                     type: 'html',
//                     title: x.TenHienThi_VI,
//                     name: x.MaCotDiem,
//                     width: x.WidthCSS,
//                     typeValue: x.GiaTriCotDiem,
//                     backGroundColor: x.HexBackground,
//                     wrap: true,
//                     align: 'center',
//                     // readOnly: x.LoaiCotDiem === 'Công thức' ? true : false,
//                 }
//                 return column
//             }
//             else if (x.GiaTriCotDiem === 'Dropdown_text') { // cấu hình header cột điểm có dạng ICO_Star
//                 let column = {
//                     type: 'dropdown',
//                     title: x.TenHienThi_VI,
//                     name: x.MaCotDiem,
//                     width: x.WidthCSS,
//                     typeValue: x.GiaTriCotDiem,
//                     backGroundColor: x.HexBackground,
//                     wrap: true,
//                     align: 'center',
//                     source: [{ id: '1', name: 'Done' }, { id: '0', name: 'Not Yet' }], //x.MaCotDiem === '' ? ['Done', 'Not Yet'] : ['Đ', 'T', 'H']
//                     readOnly: x.LoaiCotDiem === 'Công thức' || isDisabled ? true : false,
//                 }
//                 return column
//             } else if (x.GiaTriCotDiem === 'Dropdown_THC') { // cấu hình header cột điểm có dạng ICO_Star
//                 let column = {
//                     type: 'dropdown',
//                     title: x.TenHienThi_VI,
//                     name: x.MaCotDiem,
//                     width: x.WidthCSS,
//                     typeValue: x.GiaTriCotDiem,
//                     backGroundColor: x.HexBackground,
//                     wrap: true,
//                     align: 'center',
//                     source: ['T', 'H', 'C'], //x.MaCotDiem === '' ? ['Done', 'Not Yet'] : ['Đ', 'T', 'H']
//                     readOnly: x.LoaiCotDiem === 'Công thức' || isDisabled ? true : false,
//                 }
//                 return column
//             } else if (x.GiaTriCotDiem === 'Dropdown_TDC') { // cấu hình header cột điểm có dạng ICO_Star
//                 let column = {
//                     type: 'dropdown',
//                     title: x.TenHienThi_VI,
//                     name: x.MaCotDiem,
//                     width: x.WidthCSS,
//                     typeValue: x.GiaTriCotDiem,
//                     backGroundColor: x.HexBackground,
//                     wrap: true,
//                     align: 'center',
//                     source: ['T', 'Đ', 'C'], //x.MaCotDiem === '' ? ['Done', 'Not Yet'] : ['Đ', 'T', 'H']
//                     readOnly: x.LoaiCotDiem === 'Công thức' || isDisabled ? true : false,
//                 }
//                 return column
//             }
//             else if (x.GiaTriCotDiem === 'Dropdown_CD_D') { // cấu hình header cột điểm có dạng ICO_Star
//                 let column = {
//                     type: 'dropdown',
//                     title: x.TenHienThi_VI,
//                     name: x.MaCotDiem,
//                     width: x.WidthCSS,
//                     typeValue: x.GiaTriCotDiem,
//                     backGroundColor: x.HexBackground,
//                     wrap: true,
//                     align: 'center',
//                     source: ['CĐ', 'Đ'], //x.MaCotDiem === '' ? ['Done', 'Not Yet'] : ['Đ', 'T', 'H']
//                     readOnly: x.LoaiCotDiem === 'Công thức' || isDisabled ? true : false,
//                 }
//                 return column
//             }
//         })
//     //Nếu là gửi điểm thì freezecolumn = 4 để thêm cột từ chối
//     if (vueData.MonHocItem.MonHocID == 5 || vueData.MonHocItem.MonHocID == 46) {
//         vueData.freezeColumns = ListMonHoc.includes(vueData.MonHocItem.MonHocID) ? 4 : 3
//     }
//     else if (vueData.MonHocItem.MonHocID == 76) {
//         vueData.freezeColumns = ListMonHoc.includes(vueData.MonHocItem.MonHocID) ? 5 : 3
//     }
//     else if (vueData.MonHocItem.MonHocID == 101) {
//         vueData.freezeColumns = 4
//     } else {
//         vueData.freezeColumns = 3
//     }
//     let columnThongTinHocSinh = [
//         {
//             type: 'text',
//             title: 'Mã học sinh',
//             name: 'HocSinhID',
//             width: 100,
//             backGroundColor: null,
//             wrap: true,
//             readOnly: true
//         },
//         {
//             type: 'text',
//             title: 'Số Danh Bộ',
//             name: 'SoDanhBo',
//             width: 100,
//             backGroundColor: null,
//             wrap: true,
//             readOnly: true
//         },
//         {
//             type: 'text',
//             title: 'Họ tên học sinh',
//             name: 'HoVaTenHocSinh',
//             width: 200,
//             backGroundColor: null,
//             wrap: true,
//             align: "left",
//             readOnly: true
//         },
//     ]
//     const ListDSMonHocNhom = [101, 76]
//     if (ListDSMonHocNhom.includes(vueData.MonHocItem.MonHocID)) {
//         columnThongTinHocSinh.push(
//             {
//                 type: 'text',
//                 title: 'Lớp chủ nhiệm',
//                 name: 'TenLop',
//                 width: 70,
//                 backGroundColor: null,
//                 wrap: true,
//                 align: "left",
//                 readOnly: true
//             })
//     }
//     if (ListMonHoc.includes(vueData.MonHocItem.MonHocID)) {
//         columnThongTinHocSinh.push({
//             type: 'text',
//             title: 'English Name',
//             name: 'EnglishName',
//             width: 100,
//             backGroundColor: null,
//             wrap: true,
//             align: "left",
//             readOnly: true
//         })
//     }
//     headers = [...columnThongTinHocSinh, ...columnsCotDiem]
//     //Xử lý data jexcel
//     const dataJexcel = []
//     let indexRow = 1
//     for (var hocSinh of vueData.DSHocSinh) {
//         const arrCotDiemExist = vueData.DSCotDiem.filter((x) => x.HocSinhID === hocSinh.HocSinhID) // Lấy danh sách điểm của học sinh
//         if (arrCotDiemExist.length === 0) return
//         let obj = {
//             HocSinhID: arrCotDiemExist[0].HocSinhID,
//             HoVaTenHocSinh: arrCotDiemExist[0].Ho + ' ' + arrCotDiemExist[0].Ten,
//             SoDanhBo: arrCotDiemExist[0].SoDanhBo,
//         }
//         if (ListDSMonHocNhom.includes(vueData.MonHocItem.MonHocID)) obj.TenLop = arrCotDiemExist[0].TenLop
//         if (ListMonHoc.includes(vueData.MonHocItem.MonHocID)) obj.EnglishName = arrCotDiemExist[0].EnglishName;
//         if (vueData.MonHocItem.MonHocID === 76) obj.TenLop = arrCotDiemExist[0]?.TenLop ?? '';
//         //Xử lý nếu từ chối từ bên Tổ trưởng
//         for (var cotDiemExist of arrCotDiemExist) {
//             // if (cotDiemExist.MaCotDiem == 'DiemTBCK_HK1') {
//             //     debugger
//             // }
//             // console.log(" obj[cotDiemExist.MaCotDiem]", cotDiemExist.LoaiCotDiem, cotDiemExist.GiaTriCotDiem, cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'number')
//             if (cotDiemExist.LoaiCotDiem !== 'Công thức') {
//                 //Text
//                 obj[cotDiemExist.MaCotDiem] = cotDiemExist.GiaTriCotDiem === 'number' ? (
//                     (cotDiemExist.KetQuaDanhGia_VI === '' || cotDiemExist.KetQuaDanhGia_VI === null) ? null : parseFloat(cotDiemExist.KetQuaDanhGia_VI)
//                 ) : cotDiemExist.KetQuaDanhGia_VI
//                 //Set default giá trị nếu cột điểm Mức độ đánhg giá null hoặc rỗng
//                 if (cotDiemExist.MaCotDiem.includes('MucDoDanhGia') && cotDiemExist.KQHTID === 0) {
//                     if (obj[cotDiemExist.MaCotDiem] === null || obj[cotDiemExist.MaCotDiem] === '') obj[cotDiemExist.MaCotDiem] = 'T'
//                 }
//             } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.Formula !== null && (vueData.MaNhomCotDiemItem.MaNhomCotDiem == 'DiemTBCK_HK1' || vueData.MaNhomCotDiemItem.MaNhomCotDiem == 'DiemTBCK_HK2') && (cotDiemExist.MaCotDiem !== 'DiemTBCK_HK1' && cotDiemExist.MaCotDiem !== 'DiemTBCK_HK2' && !cotDiemExist.MaCotDiem.includes('DanhHieu'))) {
//                 //dùng cho formula để hiển thị
//                 obj[cotDiemExist.MaCotDiem] = cotDiemExist?.KetQuaDanhGia_VI
//             }
//             else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.Formula !== null && vueData.CapID == 1 && ['DiemTBCK_HK1', 'DiemTBCK_HK2', 'DanhHieu_HK1', 'DanhHieu_HK2'].includes(cotDiemExist.MaCotDiem)) {
//                 obj[cotDiemExist.MaCotDiem] = '=' + replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow, vueData.freezeColumns)
//             }
//             //Có sử dụng hàm isGetResultTopic => chỉ dùng cho các môn tiếng Anh
//             else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.Formula !== null && isGetResultTopic(cotDiemExist) && ListMonHoc.includes(vueData.MonHocItem.MonHocID)) {
//                 obj[cotDiemExist.MaCotDiem] = cotDiemExist?.KetQuaDanhGia_VI
//             }
//             //Sử dụng cho STEM
//             else if (
//                 cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.Formula !== null
//                 && (vueData.MaNhomCotDiemItem.MaNhomCotDiem.includes("DiemCK")
//                     && vueData.MonHocItem.MonHocID === 36
//                     && ['TongDiem_CD1', 'TongDiem_CD2', 'TongDiem_CD3'].some(x => cotDiemExist.MaCotDiem.includes(x))
//                 )
//             ) {
//                 obj[cotDiemExist.MaCotDiem] = cotDiemExist?.KetQuaDanhGia_VI
//             }
//             else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.Formula !== null && arrCotDiemExist.length === 1) {
//                 //dùng cho formula để hiển thị
//                 obj[cotDiemExist.MaCotDiem] = parseFloat(cotDiemExist?.KetQuaDanhGia_VI ?? 0)
//             } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'number') {
//                 //Công thức // parseFloat(cotDiemExist.KetQuaDanhGia_VI ?? 0) //
//                 obj[cotDiemExist.MaCotDiem] = '=' + replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow, vueData.freezeColumns)
//             } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'text') {
//                 //Công thức // parseFloat(cotDiemExist.KetQuaDanhGia_VI ?? 0) //
//                 obj[cotDiemExist.MaCotDiem] = '=' + replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow, vueData.freezeColumns)
//             }
//             else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'ICO_Star') {
//                 //Ngôi sao
//                 //obj[cotDiemExist.MaCotDiem] = `=RATING(${replaceFormula(columnsCotDiem, cotDiemExist.Formula.replace(/IIF/g, 'IF'), indexRow)})`
//                 obj[cotDiemExist.MaCotDiem] = parseFloat(cotDiemExist.KetQuaDanhGia_VI ?? 0)
//             }
//         }
//         indexRow++
//         dataJexcel.push(obj)
//     }
//     //BEGIN CREATE EXCEL
//     vueData.DataExcel = []
//     let indexRow1 = 2
//     for (var hocSinh of vueData.DSHocSinh) {
//         const arrCotDiemExist = vueData.DSCotDiem.filter((x) => x.HocSinhID === hocSinh.HocSinhID) // Lấy danh sách điểm của học sinh
//         if (arrCotDiemExist.length === 0) return
//         let obj = {
//             HocSinhID: arrCotDiemExist[0].HocSinhID,
//             HoVaTenHocSinh: arrCotDiemExist[0].Ho + ' ' + arrCotDiemExist[0].Ten,
//             SoDanhBo: arrCotDiemExist[0].SoDanhBo
//         }
//         if (ListMonHoc.includes(vueData.MonHocItem.MonHocID)) obj.EnglishName = arrCotDiemExist[0].EnglishName;
//         if (vueData.MonHocItem.MonHocID === 76) obj.TenLop = arrCotDiemExist[0]?.TenLop ?? '';
//         //Xử lý nếu từ chối từ bên Tổ trưởng
//         for (var cotDiemExist of arrCotDiemExist) {
//             if (cotDiemExist.LoaiCotDiem !== 'Công thức') {
//                 //Text
//                 obj[cotDiemExist.MaCotDiem] = cotDiemExist.GiaTriCotDiem === 'number' ? (
//                     (cotDiemExist.KetQuaDanhGia_VI === '' || cotDiemExist.KetQuaDanhGia_VI === null) ? null : parseFloat(cotDiemExist.KetQuaDanhGia_VI)
//                 ) : cotDiemExist.KetQuaDanhGia_VI
//                 //Set default giá trị nếu cột điểm Mức độ đánhg giá null hoặc rỗng
//                 if (cotDiemExist.MaCotDiem.includes('MucDoDanhGia') && cotDiemExist.KQHTID === 0) {
//                     if (obj[cotDiemExist.MaCotDiem] === null || obj[cotDiemExist.MaCotDiem] === '') obj[cotDiemExist.MaCotDiem] = 'T'
//                 }
//             } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.Formula !== null && (vueData.MaNhomCotDiemItem.MaNhomCotDiem == 'DiemTBCK_HK1' || vueData.MaNhomCotDiemItem.MaNhomCotDiem == 'DiemTBCK_HK2') && (cotDiemExist.MaCotDiem !== 'DiemTBCK_HK1' && cotDiemExist.MaCotDiem !== 'DiemTBCK_HK2' && !cotDiemExist.MaCotDiem.includes('DanhHieu'))) {
//                 //dùng cho formula để hiển thị
//                 obj[cotDiemExist.MaCotDiem] = cotDiemExist?.KetQuaDanhGia_VI
//             }
//             else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.Formula !== null && isGetResultTopic(cotDiemExist) && ListMonHoc.includes(vueData.MonHocItem.MonHocID)) {
//                 //dùng cho formula để hiển thị
//                 obj[cotDiemExist.MaCotDiem] = cotDiemExist?.KetQuaDanhGia_VI
//             }
//             //Sử dụng cho STEM
//             else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.Formula !== null && (cotDiemExist.MaNhomCotDiem.includes("DiemCK") && vueData.MonHocItem.MonHocID === 36)) {
//                 //dùng cho formula để hiển thị
//                 obj[cotDiemExist.MaCotDiem] = cotDiemExist?.KetQuaDanhGia_VI
//             }
//             else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.Formula !== null && arrCotDiemExist.length === 1) {
//                 //dùng cho formula để hiển thị
//                 obj[cotDiemExist.MaCotDiem] = parseFloat(cotDiemExist?.KetQuaDanhGia_VI ?? 0)
//             } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'number') {
//                 //Công thức // parseFloat(cotDiemExist.KetQuaDanhGia_VI ?? 0) //
//                 obj[cotDiemExist.MaCotDiem] = '=' + replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow1, vueData.freezeColumns)
//             } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'text') {
//                 //Công thức // parseFloat(cotDiemExist.KetQuaDanhGia_VI ?? 0) //
//                 obj[cotDiemExist.MaCotDiem] = '=' + replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow1, vueData.freezeColumns)
//             }
//             else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'ICO_Star') {
//                 //Ngôi sao
//                 //obj[cotDiemExist.MaCotDiem] = `=RATING(${replaceFormula(columnsCotDiem, cotDiemExist.Formula.replace(/IIF/g, 'IF'), indexRow)})`
//                 obj[cotDiemExist.MaCotDiem] = parseFloat(cotDiemExist.KetQuaDanhGia_VI ?? 0)
//             }
//         }
//         indexRow1++
//         vueData.DataExcel.push(obj)
//     }
//     console.log("vueData.DataExcel", vueData.DataExcel)
//     //END CREATE EXCEL
//     const firstStudent = dataJexcel[0]
//     const dsCotDiem = vueData.DSCotDiem.filter(x => x.HocSinhID === firstStudent.HocSinhID)
//     vueData.styleSheet = {}
//     vueData.comments = {}
//     for (var i = 0; i < dataJexcel.length; i++) {
//         for (var j = 0; j < dsCotDiem.length; j++) {
//             const cellAdresss = jspreadsheet.helpers.getCellNameFromCoords(j + vueData.freezeColumns, i) // (j+3) là địa chỉ cột điểm đầu tiên, i là row let
//             if (dsCotDiem[j].HexBackground) {
//                 vueData.styleSheet[cellAdresss] = `background-color: ${dsCotDiem[j].HexBackground ?? 'unset'}`
//             }
//             const giaTri = dataJexcel[i][dsCotDiem[j].MaCotDiem]
//             if (giaTri === null || giaTri === '') {
//                 vueData.styleSheet[cellAdresss] = `background-color : #ffff0052`
//             }
//         }
//     }
//     for (var i = 0; i < dataJexcel.length; i++) {
//         for (var j = 0; j < dsCotDiem.length; j++) {
//             const cellAdresss = jspreadsheet.helpers.getCellNameFromCoords(j + vueData.freezeColumns, i) // (j+3) là địa chỉ cột điểm đầu tiên, i là row let
//             const obj = vueData.DSCotDiem.find(x => x.HocSinhID === dataJexcel[i].HocSinhID && x.MaCotDiem === dsCotDiem[j].MaCotDiem && x.Is_Comment)
//             if (obj) {
//                 // vueData.styleSheet[cellAdresss] = 'color: red !important;'
//                 vueData.comments[cellAdresss] = 'Cột điểm do ' + obj.NhapDiemUser + ' đã nhập'
//             }
//         }
//     }
//     vueData.keyComp++
//     vueData.columnHeader = headers
//     vueData.DSHocSinh = dataJexcel
//     vueData.DSCotDiem_ByMaNhomCotDiem = DSCotDiem_ByMaNhomCotDiem
// }
// function validateSave(typeCell, value, min, max) {
//     if (value == null || value == '') return 0
//     if (typeCell === 'number' && (value < min || value > max)) return 1
//     else return 0
// }
// const page = {
//     isError: false,
//     process: processBeforePushAPI
// }
// function onLuuDiem(guiBGH) {
//     page.isError = false
//     if (guiBGH) {
//         vueData.StatusButton = 'guibgh'
//     } else {
//         vueData.StatusButton = 'luu'
//     }
//     processBeforePushAPI()
//     if (!page.isError) {
//         const dataFilter = vueData.dataBeforeInsertToDB
//             .filter(x =>
//                 (x.KQHTID && x.KQHTID > 0) || // Nếu KQHTID tồn tại và lớn hơn 0 thì giữ lại
//                 (
//                     x.KetQuaDanhGia_VI != null &&
//                     x.KetQuaDanhGia_VI !== '' &&
//                     !Number.isNaN(x.KetQuaDanhGia_VI)
//                 ) // Hoặc KetQuaDanhGia_VI hợp lệ thì giữ lại
//             );
//         console.log("dataFilter", dataFilter)
//         vueData.dataBeforeInsertToDB = dataFilter.filter(x => !Number.isNaN(x.KetQuaDanhGia_VI)) //Filter thêm lần nữa khi có Công thức ko có tính được 'Error: #VALUE!'
//         // Insert xong cập nhật tình trạng
//         CALL("insKQHT_MonHocLop")
//         vueData.keyComp++
//     }
// }
// function processBeforePushAPI() {
//     vueData.dataBeforeInsertToDB = []
//     let val = vueData.DSHocSinh
//     //val là dữ liệu trên sheet jexcel
//     let DSCotDiem = vueData.DSCotDiem_ByMaNhomCotDiem //DS cột điểm của nhóm bảng điểm
//     //Xử lý data mapping giá trị
//     //B1: Vòng lặp thứ nhất để lặp các học sinh
//     //B2: Vòng lặp bên trong để lặp các cột điểm của 1 học sinh
//     for (let i = 0; i < val.length; i++) {
//         for (let j = 0; j < DSCotDiem.length; j++) {
//             const cellAdresss = jspreadsheet.helpers.getCellNameFromCoords(j + vueData.freezeColumns, i) // (j+3) là địa chỉ cột điểm đầu tiên, i là row
//             let giaTriCotDiem = val[i][DSCotDiem[j].MaCotDiem] //vueData.instance[0].getValueFromCoords(j + vueData.freezeColumns, i)
//             const min = DSCotDiem[j]?.DiemMin
//             const max = DSCotDiem[j]?.DiemMax ?? 2000
//             if (DSCotDiem[j].LoaiCotDiem === 'Công thức') {
//                 giaTriCotDiem = vueData.instance[0].records[i][j + vueData.freezeColumns]?.element?.innerHTML
//             }
//             if (DSCotDiem[j].GiaTriCotDiem === 'number') {
//                 if (giaTriCotDiem === null || giaTriCotDiem === NaN || giaTriCotDiem === '') {
//                     giaTriCotDiem = ''
//                 } else {
//                 }
//             }
//             let cotDiem_HS = {
//                 HocSinhID: val[i].HocSinhID,
//                 LopID: vueData.LopItem.LopID,
//                 NienKhoa: vueData.NienKhoa,
//                 CotDiemID: DSCotDiem[j].CotDiemID,
//                 KetQuaDanhGia_VI: giaTriCotDiem,
//                 KetQuaDanhGia_EN: giaTriCotDiem,
//                 KQHTID: vueData.DSCotDiem.find(x => x.HocSinhID === val[i].HocSinhID && x.MaCotDiem === DSCotDiem[j].MaCotDiem)?.KQHTID ?? 0
//             }
//             let typeColumn = DSCotDiem[j].GiaTriCotDiem
//             let value = cotDiem_HS.KetQuaDanhGia_VI
//             cotDiem_HS.IsError = validateSave(typeColumn, value, min, max)
//             if (cotDiem_HS.IsError === 1) {
//                 vueData.instance[0].setStyle(cellAdresss, 'background-color', 'red')
//                 Vue.$toast.error(`Cột điểm chỉ cho phép nhập thang điểm từ ${min} đến ${max}!`, { position: 'top' })
//                 page.isError = true
//                 return
//             }
//             if (DSCotDiem[j].GiaTriCotDiem === 'text' && ['NhanXetGK_HK1', 'NhanXetCK_HK1', 'NhanXetGK_HK2', 'NhanXetCK_HK2'].includes(DSCotDiem[j].MaCotDiem) && vueData.CapID == 1 && giaTriCotDiem?.length > max) {
//                 cotDiem_HS.IsError = 1
//                 vueData.instance[0].setStyle(cellAdresss, 'background-color', 'red')
//                 Vue.$toast.error(`Cột điểm chỉ cho phép nhập tối đa ${max} kí tự!`, { position: 'top' })
//                 page.isError = true
//                 return
//             }
//             cotDiem_HS.KetQuaDanhGia_VI = cotDiem_HS.KetQuaDanhGia_VI === NaN ? null : cotDiem_HS.KetQuaDanhGia_VI
//             vueData.dataBeforeInsertToDB.push(cotDiem_HS)
//         }
//     }
//     let validIndex = vueData.dataBeforeInsertToDB.findIndex((item) => item.IsError === 1)
//     if (validIndex != -1) {
//         Vue.$toast.error('Lỗi kết quả cột điểm', { position: 'top' })
//         page.isError = true
//         return
//     }
// }
// const isShowReasonReject = () => {
//     let defaultObj = {
//         disabled: false,
//         NoiDungNhanXet: null
//     }
//     const DSHocSinh_Semester = vueData.DSCotDiem
//     if (DSHocSinh_Semester.length > 0) {
//         const obj = DSHocSinh_Semester.find(x => x.TinhTrang === 3 || x.TinhTrang === 5 || x.TinhTrang === 7)
//         defaultObj.disabled = obj ? true : false
//         defaultObj.NoiDungNhanXet = obj?.NoiDungNhanXet ?? ''
//         defaultObj.TinhTrang = obj?.TinhTrang ?? ''
//     }
//     return defaultObj
// }
// const renderText_Person_Reject = (TinhTrang) => {
//     if (!TinhTrang) return
//     let text = ''
//     if (vueData.CapID === 1) {
//         if (TinhTrang === 3) text = 'Giáo viên chủ nhiệm từ chối'
//         if (TinhTrang === 5) text = 'Tổ trưởng từ chối'
//         if (TinhTrang === 7) text = 'BGH chủ nhiệm từ chối'
//     } else {
//         if (TinhTrang === 3) text = 'BGH từ chối'
//     }
//     return text
// }
// function reloadBangDiem() {
//     const action = getBangDiemAction();
//     runAction(action);
// }
// function getBangDiemAction() {
//     try {
//         const monHocID = vueData.MonHocItem?.MonHocID;
//         const maNhom = vueData.MaNhomCotDiemItem?.MaNhomCotDiem;
//         // Trường hợp môn 5
//         if (monHocID === 5 && (maNhom?.includes('DiemCK') || maNhom?.includes('DiemGK'))) {
//             return 'HocSinhBangDiem_Get_ByThuTuNhom';
//         }
//         // Trường hợp môn 36 (STEM)
//         if (monHocID === 36 && maNhom?.includes('DiemCK')) {
//             return 'HocSinhBangDiem_STEM_CK_Get';   // <-- Action mới cho STEM
//         }
//         // Mặc định
//         return 'getHocSinhBangDiem';
//     } catch (error) {
//         console.log('error', error);
//         return 'getHocSinhBangDiem';
//     }
// }
// function isGetResultTopic(cotDiem) {
//     return (
//         vueData.MaNhomCotDiemItem.MaNhomCotDiem.includes('DiemGK_') || vueData.MaNhomCotDiemItem.MaNhomCotDiem.includes('DiemCK_')
//     )
//         &&
//         (
//             !cotDiem.MaCotDiem.includes('DiemGK_') || !cotDiem.MaCotDiem.includes('DiemCK_') || !cotDiem.MaCotDiem.includes('DiemTBGK_') || !cotDiem.MaCotDiem.includes('DiemTBCK_')
//         )
// }
// function isMonHocConvertWithStar(currentMonHocID) {
//     const arrMonHoc = [36, 37, 38, 40, 41, 42, 43, 106]
//     return arrMonHoc.includes(currentMonHocID)
// }
// async function exportExcel() {
//     const headers = vueData.columnHeader.map(x => x.name)
//     await processBeforeExport()
//     const data = vueData.DataExcel.map(item =>
//         headers.map(h => item[h] ?? "")
//     )
//     const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
//     const workbook = XLSX.utils.book_new()
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
//     XLSX.writeFile(workbook, `Bang_Diem_Lop${vueData.LopItem.TenLop}_${vueData.MonHocItem.MonHocName}.xlsx`)
// }
// function processBeforeExport() {
//     vueData.DataExcel = []
//     let val = vueData.DSHocSinh
//     const ListMonHoc = [5, 46, 76]
//     //val là dữ liệu trên sheet jexcel
//     let DSCotDiem = vueData.DSCotDiem_ByMaNhomCotDiem //DS cột điểm của nhóm bảng điểm
//     //Xử lý data mapping giá trị
//     //B1: Vòng lặp thứ nhất để lặp các học sinh
//     //B2: Vòng lặp bên trong để lặp các cột điểm của 1 học sinh
//     for (let i = 0; i < val.length; i++) {
//         let cotDiem_HS = {
//             HocSinhID: val[i].HocSinhID,
//             HoVaTenHocSinh: val[i].HoVaTenHocSinh,
//             SoDanhBo: val[i].SoDanhBo
//         }
//         if (vueData.MonHocItem.MonHocID == 76) cotDiem_HS.TenLop = val[i].TenLop ?? '';
//         if (ListMonHoc.includes(vueData.MonHocItem.MonHocID)) cotDiem_HS.EnglishName = val[i].EnglishName ?? '';
//         for (let j = 0; j < DSCotDiem.length; j++) {
//             let giaTriCotDiem = val[i][DSCotDiem[j].MaCotDiem]
//             if (DSCotDiem[j].LoaiCotDiem === 'Công thức') {
//                 giaTriCotDiem = vueData.instance[0].records[i][j + vueData.freezeColumns]?.element?.innerHTML
//             }
//             if (DSCotDiem[j].GiaTriCotDiem === 'number') {
//                 if (giaTriCotDiem === null || giaTriCotDiem === NaN || giaTriCotDiem === '') {
//                     giaTriCotDiem = ''
//                 } else {
//                     giaTriCotDiem = parseFloat(giaTriCotDiem)
//                 }
//             }
//             cotDiem_HS[DSCotDiem[j].MaCotDiem] = giaTriCotDiem
//         }
//         vueData.DataExcel.push(cotDiem_HS)
//     }
// }
// function isExistThemeHas_TA2() {
//     let flag = false
//     if (!vueData.MaNhomCotDiemItem) return flag
//     if (vueData.MonHocItem?.MonHocID == 76) {
//         if (vueData.MaNhomCotDiemItem.MaNhomCotDiem === 'Theme_2') flag = true
//         if (vueData.MaNhomCotDiemItem.MaNhomCotDiem === 'Theme_4') flag = true
//         if (vueData.MaNhomCotDiemItem.MaNhomCotDiem === 'Theme_6') flag = true
//         if (vueData.MaNhomCotDiemItem.MaNhomCotDiem === 'Theme_8') flag = true
//     }
//     return flag
// }
// async function onGetLayDiemThemeTest() {
//     let MaNhomCotDiem_TA2 = ''
//     let MaCotDiem_TA2 = ''
//     let MaCotDiem = ''
//     if (vueData.MaNhomCotDiemItem.MaNhomCotDiem === 'Theme_2') {
//         MaNhomCotDiem_TA2 = 'S1_Mid_TA2'
//         MaCotDiem_TA2 = "S1_Mid_TA2_Point"
//         MaCotDiem = 'Theme2_TST'
//     }
//     if (vueData.MaNhomCotDiemItem.MaNhomCotDiem === 'Theme_4') {
//         MaNhomCotDiem_TA2 = 'S1_Final_TA2'
//         MaCotDiem_TA2 = "S1_Final_TA2_Point"
//         MaCotDiem = 'Theme4_TST'
//     }
//     if (vueData.MaNhomCotDiemItem.MaNhomCotDiem === 'Theme_6') {
//         MaNhomCotDiem_TA2 = 'S2_Mid_TA2'
//         MaCotDiem_TA2 = "S2_Mid_TA2_Point"
//         MaCotDiem = 'Theme6_TST'
//     }
//     if (vueData.MaNhomCotDiemItem.MaNhomCotDiem === 'Theme_8') {
//         MaNhomCotDiem_TA2 = 'S2_Final_TA2'
//         MaCotDiem_TA2 = "S2_Final_TA2_Point"
//         MaCotDiem = 'Theme8_TST'
//     }
//     const DSCotDiem_TA2 = await ajaxCALLPromise("lms/HocSinhBangDiem_Get_ByMonHocID_MaNhom", {
//         LopID: vueData.LopItem.LopID,
//         MonHocID: vueData.MonHocItem.MonHocID,
//         TemplateBangDiemID: vueData.MonHocItem.TemplateBangDiemID,
//         MaNhomCotDiem: MaNhomCotDiem_TA2
//     })
//     const arrFilterDSCotDiemWithThemeTest = DSCotDiem_TA2.filter(x => x.MaCotDiem === MaCotDiem_TA2)
//     for (var hocSinh of vueData.DSHocSinh) {
//         const cotDiemByHocSinh = arrFilterDSCotDiemWithThemeTest.find(x => x.HocSinhID == hocSinh.HocSinhID)
//         hocSinh[MaCotDiem] = cotDiemByHocSinh.KetQuaDanhGia_VI
//     }
//     vueData.keyComp++
// }
// async function fn_udpKQHT_MonHocLop_TinhTrang_LuuTam() {
//     let ListMonHoc = vueData.MonHocItem.List_MonHoc_NLPC_ID
//     if (ListMonHoc) {
//         ListMonHoc = ListMonHoc.split(",")
//         for (var monHocID of ListMonHoc) {
//             const MonHocLop = await ajaxCALLPromise("lms/MonHocLop_Select_By_MonHocID", {
//                 MonHocID: monHocID,
//                 LopID: vueData.LopItem.LopID,
//                 NienKhoa: vueData.NienKhoa,
//             })
//             const MonHocLopID = MonHocLop[0]?.MonHocLopID
//             if (MonHocLopID) {
//                 await ajaxCALLPromise("lms/KQHT_MonHocLop_TinhTrang_Udp", {
//                     NienKhoa: vueData.NienKhoa,
//                     MonHocLopID: MonHocLopID,
//                     LopID: vueData.LopItem.LopID,
//                     TinhTrang: 1,
//                     MaNhomCotDiem: vueData.MaNhomCotDiemItem.MaNhomCotDiem,
//                     IsSendToManager: false
//                 })
//             }
//         }
//     }
//     console.log("fn_udpKQHT_MonHocLop_TinhTrang_LuuTam...")
//     CALL("udpKQHT_MonHocLop_TinhTrang_LuuTam")
// }
// function InputMaxLenght(maxLength) {
//     // Methods
//     this.closeEditor = function (cell, save) {
//         var value = cell.children[0].value;
//         cell.innerHTML = value;
//         return value;
//     },
//         this.openEditor = function (cell) {
//             console.log('cell', 1)
//             // Create input
//             var element = document.createElement('input');
//             element.maxLength = maxLength;
//             element.value = cell.innerHTML;
//             // // Update cell
//             cell.classList.add('editor');
//             cell.innerHTML = '';
//             cell.appendChild(element);
//             // // Focus on the element
//             element.focus();
//         },
//         this.getValue = function (cell) {
//             console.log('obteniendo valor');
//             return cell.innerHTML;
//         }
//     this.setValue = function (cell, value) {
//         console.log('estableciendo valor', { cell, value });
//         cell.innerHTML = value;
//     }
//     this.updateCell = function (cell, value) {
//         let instance = cell.parentNode.parentNode.parentNode.parentNode.parentNode.jexcel;
//         let y = cell.dataset.y;
//         let x = cell.dataset.x
//         cell.innerHTML = value;
//         instance.options.data[y][x] = value;
//         return value;
//     }
// }
// vueData.isMonHocConvertWithStar = isMonHocConvertWithStar
// vueData.exportExcel = exportExcel
// vueData.reloadBangDiem = reloadBangDiem
// vueData.isExistThemeHas_TA2 = isExistThemeHas_TA2
// vueData.onGetLayDiemThemeTest = onGetLayDiemThemeTest
// vueData.reloadBangDiem = reloadBangDiem