/**
 * BangDiemService.js
 * Service xử lý nghiệp vụ bảng điểm
 * Version: 1.1.0
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
    /** Gọi API lấy dữ liệu bảng điểm */
    async fetchBangDiem(action, params) {
        return await ajaxCALLPromise(action, params);
    },
    /** Lưu dữ liệu điểm */
    async saveGradeData(params) {
        return await ajaxCALLPromise("lms/KQHT_MonHocLop_Ins", params);
    },
    /** Cập nhật tình trạng Cấp 1 */
    async updateTinhTrang(params) {
        return await ajaxCALLPromise("lms/KQHT_MonHocLop_TinhTrang_Udp", {
            ...params,
            IsSendToManager: true
        });
    },
    /** Cập nhật tình trạng Cấp 1 - Lưu tạm */
    async updateTinhTrangLuuTam(params) {
        return await ajaxCALLPromise("lms/KQHT_MonHocLop_TinhTrang_Udp", {
            ...params,
            IsSendToManager: false
        });
    },
    /** Lấy MonHocLop theo MonHocID */
    async getMonHocLopByMonHocID(params) {
        return await ajaxCALLPromise("lms/MonHocLop_Select_By_MonHocID", params);
    },
    /** Cập nhật tình trạng Cấp 2, Cấp 3 */
    async updateTinhTrangC2C3(params) {
        return await ajaxCALLPromise("lms/KQHT_MonHocLop_TinhTrang_Udp_C2_C3", params);
    },
    /** Lấy danh sách khóa cột điểm */
    async getKhoaCotDiem(params) {
        return await ajaxCALLPromise("lms/KhoaCotDiem_Get", params);
    },
    /** Khóa/Mở khóa cột điểm */
    async toggleKhoaCotDiem(params) {
        return await ajaxCALLPromise("lms/KhoaCotDiem_Ins_And_Upd", params);
    },
    /** Lấy config STEM theo niên khóa từ tblConfig_STEM */
    async getSTEMConfig(params) {
        return await ajaxCALLPromise("lms/Config_STEM_Get", params);
    },
};
// ==================== FILTER SERVICE ====================
const FilterService = {
    /** Xác định action API dựa trên filter */
    getBangDiemAction(filter, vueData, stemConfigList = []) {
        const monHocID = filter.MonHocItem?.MonHocID;
        const maNhom = filter.MaNhomCotDiemItem?.MaNhomCotDiem;
        const hocKi = filter.MaNhomCotDiemItem?.Semester;
        // Môn 5 (English) - DiemCK/DiemGK
        if (monHocID === 5 && (maNhom?.includes('DiemCK') || maNhom?.includes('DiemGK'))) {
            return 'lms/HocSinhBangDiem_Get_ByThuTuNhom';
        }
        // Môn 36 (STEM)
        if (monHocID === CONSTANTS.SUBJECT_IDS.STEM_36) {
            const stemConfig = stemConfigList.find(c => c.HocKi === hocKi && c.Enable);
            if (stemConfig) {
                if (maNhom?.includes(stemConfig.HocKi_LayTongDiemChuDe)) {
                    return 'lms/HocSinhBangDiem_STEM_CK_Get';
                }
            } else {
                if (maNhom?.includes('DiemCK') || maNhom?.includes('DiemGK')) {
                    return 'lms/HocSinhBangDiem_STEM_CK_Get';
                }
            }
        }
        return 'lms/HocSinhBangDiem_Get_ByMonHocID_MaNhom';
    },
    /** Kiểm tra môn học có phải Tiếng Anh */
    isEnglishSubject(monHocID) {
        return CONSTANTS.ENGLISH_SUBJECTS.includes(monHocID);
    },
    /** Kiểm tra môn học có phải môn nhóm */
    isGroupSubject(monHocID) {
        return CONSTANTS.GROUP_SUBJECTS.includes(monHocID);
    },
    /** Kiểm tra môn học có đổi sao */
    isMonHocConvertWithStar(monHocID) {
        return CONSTANTS.CONVERT_STAR_SUBJECTS.includes(monHocID);
    },
    /** Kiểm tra filter hợp lệ */
    isValidFilter(filter) {
        return filter.KhoiItem !== null &&
            filter.LopItem !== null &&
            filter.MonHocItem !== null &&
            filter.MaNhomCotDiemItem !== null;
    }
};
// ==================== DATA PROCESSOR ====================
const DataProcessor = {
    /** Xử lý danh sách học sinh duy nhất */
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
    /** Tính số cột freeze dựa trên môn học */
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
    /** Xử lý giá trị cột không có công thức */
    processNonFormulaValue(column) {
        const { GiaTriCotDiem, KetQuaDanhGia_VI, MaCotDiem, KQHTID } = column;
        if (GiaTriCotDiem === CONSTANTS.COLUMN_TYPES.NUMBER) {
            return (KetQuaDanhGia_VI === '' || KetQuaDanhGia_VI === null)
                ? null
                : parseFloat(KetQuaDanhGia_VI);
        }
        let value = KetQuaDanhGia_VI;
        if (MaCotDiem.includes('MucDoDanhGia') && KQHTID === 0) {
            value = value || 'T';
        }
        return value;
    },
    /** Validate dữ liệu trước khi lưu */
    validateSave(typeCell, value, min, max) {
        if (value == null || value === '') return 0;
        if (typeCell === 'number' && (value < min || value > max)) return 1;
        return 0;
    },
    /**
     * Kiểm tra các cột chưa khóa mà tất cả học sinh đã nhập đủ điểm
     * @returns {Array} Danh sách cột { value, title } đủ điều kiện gợi ý khóa
     */
    getColumnsReadyToLock(DSHocSinh, DSCotDiem_ByMaNhomCotDiem, displayColumns, apiData) {
        if (!DSHocSinh?.length || !DSCotDiem_ByMaNhomCotDiem?.length) return [];
        return DSCotDiem_ByMaNhomCotDiem.filter(cotDiem => {
            const display = displayColumns.find(d => d.value === cotDiem.value);
            if (display?.isLocked) return false;
            const sampleCol = apiData.find(x => x.MaCotDiem === cotDiem.value);
            if (sampleCol?.LoaiCotDiem === 'Công thức') return false;
            return DSHocSinh.every(hs => {
                const val = hs[cotDiem.value];
                return val !== null && val !== undefined && val !== '';
            });
        });
    },
    /** Xử lý dữ liệu trước khi push API */
    processBeforePushAPI(editedCells, DSHocSinh, DSHocSinh_API, freezeColumns, filter, instance) {
        console.log(
            "editedCells", editedCells,
            "\nDSHocSinh", DSHocSinh,
            "\nDSHocSinh_API", DSHocSinh_API,
            "\nfreezeColumns", freezeColumns,
            "\nfilter", filter,
            "\ninstance", instance
        );
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
                if (cotDiem.LoaiCotDiem === CONSTANTS.FORMULA_COLUMN) {
                    giaTriCotDiem = instance[0].records[exists.y][exists.x]?.element?.innerHTML;
                }
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
        return dataBeforeInsertToDB.filter(x =>
            (x.KQHTID && x.KQHTID > 0) ||
            (x.KetQuaDanhGia_VI != null && x.KetQuaDanhGia_VI !== '' && !Number.isNaN(x.KetQuaDanhGia_VI))
        ).filter(x => !Number.isNaN(x.KetQuaDanhGia_VI));
    }
};
// ==================== HEADER BUILDER ====================
const HeaderBuilder = {
    /** Build cột thông tin học sinh */
    buildStudentInfoColumns(isGroup, isEnglish) {
        const columns = [
            {
                type: 'text', title: 'Mã học sinh', name: 'HocSinhID',
                width: 100, backGroundColor: null, wrap: true, readOnly: true
            },
            {
                type: 'text', title: 'Số Danh Bộ', name: 'SoDanhBo',
                width: 100, backGroundColor: null, wrap: true, readOnly: true
            },
            {
                type: 'text', title: 'Họ tên học sinh', name: 'HoVaTenHocSinh',
                width: 200, backGroundColor: null, wrap: true, align: "left", readOnly: true
            }
        ];
        if (isGroup) {
            columns.push({
                type: 'text', title: 'Lớp chủ nhiệm', name: 'TenLop',
                width: 70, backGroundColor: null, wrap: true, align: "left", readOnly: true
            });
        }
        if (isEnglish) {
            columns.push({
                type: 'text', title: 'English Name', name: 'EnglishName',
                width: 100, backGroundColor: null, wrap: true, align: "left", readOnly: true
            });
        }
        return columns;
    },
    /** Build cột điểm */
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
            title, name: column.MaCotDiem, width,
            typeValue: column.GiaTriCotDiem, backGroundColor, wrap: true,
            readOnly: column.LoaiCotDiem === CONSTANTS.FORMULA_COLUMN || isDisabled || isLocked
        };
        return this.buildColumnByType(column.GiaTriCotDiem, config, column);
    },
    /** Build cấu hình cột theo type */
    buildColumnByType(valueType, baseConfig, columnData) {
        const builders = {
            [CONSTANTS.COLUMN_TYPES.NUMBER]: () => ({
                ...baseConfig, type: 'numeric', decimal: '.', autoWidth: true, align: 'center'
            }),
            [CONSTANTS.COLUMN_TYPES.TEXT]: () => ({
                ...baseConfig, type: 'text',
                align: this.shouldCenterAlign(columnData.MaCotDiem) ? 'center' : 'left'
            }),
            [CONSTANTS.COLUMN_TYPES.ICO_STAR]: () => ({
                ...baseConfig, type: 'html', align: 'center'
            }),
            [CONSTANTS.COLUMN_TYPES.DROPDOWN_TEXT]: () => ({
                ...baseConfig, type: 'dropdown', align: 'center',
                source: [{ id: '1', name: 'Done' }, { id: '0', name: 'Not Yet' }]
            }),
            [CONSTANTS.COLUMN_TYPES.DROPDOWN_THC]: () => ({
                ...baseConfig, type: 'dropdown', align: 'center', source: ['T', 'H', 'C']
            }),
            [CONSTANTS.COLUMN_TYPES.DROPDOWN_TDC]: () => ({
                ...baseConfig, type: 'dropdown', align: 'center', source: ['T', 'Đ', 'C']
            }),
            [CONSTANTS.COLUMN_TYPES.DROPDOWN_CD_D]: () => ({
                ...baseConfig, type: 'dropdown', align: 'center', source: ['CĐ', 'Đ']
            })
        };
        const builder = builders[valueType];
        return builder ? builder() : baseConfig;
    },
    shouldCenterAlign(columnCode) {
        return CONSTANTS.CENTER_ALIGN_COLUMNS.some(col => columnCode.includes(col));
    },
    /** Build nested headers */
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
    /** Xử lý cột có công thức */
    processFormulaValue(column, allColumns, rowIndex, filter, headers, freezeColumns, isEnglish, vueData) {
        const { Formula, GiaTriCotDiem, KetQuaDanhGia_VI, MaCotDiem } = column;
        const groupCode = filter.MaNhomCotDiemItem?.MaNhomCotDiem;
        const columnsCotDiem = headers.filter(h => h.typeValue);
        if (!Formula) {
            return GiaTriCotDiem === CONSTANTS.COLUMN_TYPES.NUMBER
                ? parseFloat(KetQuaDanhGia_VI ?? 0)
                : KetQuaDanhGia_VI;
        }
        if (this.isCase_DiemTBCK(groupCode, MaCotDiem)) return KetQuaDanhGia_VI;
        if (this.isCase_Cap1_DanhHieu(MaCotDiem, vueData)) {
            return '=' + replaceFormula(columnsCotDiem, Formula, rowIndex, freezeColumns);
        }
        if (this.isCase_EnglishThemeResult(column, isEnglish, filter)) return KetQuaDanhGia_VI;
        if (this.isCase_STEM_TongDiem(groupCode, MaCotDiem, filter.MonHocItem?.MonHocID)) return KetQuaDanhGia_VI;
        if (this.isCase_STEM_DiemCK(groupCode, MaCotDiem, filter.MonHocItem?.MonHocID)) {
            const expandedFormula = this.expandRangeInFormula(Formula, allColumns);
            return '=' + replaceFormula(columnsCotDiem, expandedFormula, rowIndex, freezeColumns);
        }
        if (allColumns.length === 1) return parseFloat(KetQuaDanhGia_VI ?? 0);
        if (GiaTriCotDiem === CONSTANTS.COLUMN_TYPES.ICO_STAR) return parseFloat(KetQuaDanhGia_VI ?? 0);
        if ([CONSTANTS.COLUMN_TYPES.NUMBER, CONSTANTS.COLUMN_TYPES.TEXT].includes(GiaTriCotDiem)) {
            return '=' + replaceFormula(columnsCotDiem, Formula, rowIndex, freezeColumns);
        }
        return KetQuaDanhGia_VI;
    },
    isCase_DiemTBCK(groupCode, maCotDiem) {
        return ['DiemTBGK_HK1', 'DiemTBGK_HK2', 'DiemTBCK_HK1', 'DiemTBCK_HK2'].includes(groupCode) &&
            !['DiemTBGK_HK1', 'DiemTBCK_HK2', 'DiemTBCK_HK1', 'DiemTBCK_HK2'].includes(maCotDiem) &&
            !maCotDiem.includes('DanhHieu');
    },
    isCase_Cap1_DanhHieu(maCotDiem, vueData) {
        return vueData.CapID === 1 && [
            'DiemTBGK_HK1', 'DiemTBCK_HK1', 'DiemTBGK_HK2', 'DiemTBCK_HK2',
            'DanhHieuGK_HK1', 'DanhHieuCK_HK1', 'DanhHieuGK_HK2', 'DanhHieuCK_HK2'
        ].includes(maCotDiem);
    },
    isCase_EnglishThemeResult(column, isEnglish, filter) {
        return isEnglish && this.isGetResultTopic(column, filter);
    },
    isCase_STEM_TongDiem(groupCode, maCotDiem, monHocID) {
        return (groupCode?.includes('DiemCK') || groupCode?.includes('DiemGK')) &&
            monHocID === CONSTANTS.SUBJECT_IDS.STEM_36 &&
            ['TongDiem_CD1', 'TongDiem_CD2', 'TongDiem_CD3'].some(x => maCotDiem.includes(x));
    },
    isCase_STEM_DiemCK(groupCode, maCotDiem, monHocID) {
        return (groupCode?.includes('DiemCK') || groupCode?.includes('DiemGK')) &&
            monHocID === CONSTANTS.SUBJECT_IDS.STEM_36 &&
            ['DiemCK_', 'DiemGK_', 'SaoCK_', 'SaoGK_'].some(x => maCotDiem.includes(x));
    },
    /** Expand range "ColA:ColB" → "ColA, ColB, ColC, ..." */
    expandRangeInFormula(formula, allColumns) {
        return formula.replace(/(\w+):(\w+)/g, (match, startCol, endCol) => {
            const colNames = allColumns.map(c => c.MaCotDiem);
            const startIdx = colNames.indexOf(startCol);
            const endIdx = colNames.indexOf(endCol);
            if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) return match;
            return colNames.slice(startIdx, endIdx + 1).join(', ');
        });
    },
    isGetResultTopic(column, filter) {
        const groupCode = filter.MaNhomCotDiemItem?.MaNhomCotDiem;
        const { MaCotDiem } = column;
        const isInGradeGroup = groupCode?.includes('DiemGK_') || groupCode?.includes('DiemCK_');
        const isNotMainColumn = !MaCotDiem.includes('DiemGK_') && !MaCotDiem.includes('DiemCK_') &&
            !MaCotDiem.includes('DiemTBGK_') && !MaCotDiem.includes('DiemTBCK_');
        return isInGradeGroup && isNotMainColumn;
    }
};
// ==================== STYLE SERVICE ====================
const StyleService = {
    /** Áp dụng background style */
    applyBackgroundStyles(students, gradeColumns, freezeColumns) {
        const styleSheet = {};
        students.forEach((row, rowIndex) => {
            gradeColumns.forEach((column, colIndex) => {
                const cellAddress = jspreadsheet.helpers.getCellNameFromCoords(
                    colIndex + freezeColumns, rowIndex
                );
                if (column.HexBackground) {
                    styleSheet[cellAddress] = `background-color: ${column.HexBackground}`;
                }
                const value = row[column.MaCotDiem];
                if (value === null || value === '') {
                    styleSheet[cellAddress] = 'background-color: #ffff0052';
                }
            });
        });
        return styleSheet;
    },
    /** Áp dụng comments */
    applyComments(students, gradeColumns, apiData, freezeColumns) {
        const comments = {};
        // Build lookup map O(n) thay vì find() O(n) trong double loop
        const commentMap = {};
        apiData.forEach(x => {
            if (x.Is_Comment) {
                commentMap[`${x.HocSinhID}_${x.MaCotDiem}`] = x.NhapDiemUser;
            }
        });
        students.forEach((row, rowIndex) => {
            gradeColumns.forEach((column, colIndex) => {
                const user = commentMap[`${row.HocSinhID}_${column.MaCotDiem}`];
                if (user) {
                    const cellAddress = jspreadsheet.helpers.getCellNameFromCoords(
                        colIndex + freezeColumns, rowIndex
                    );
                    comments[cellAddress] = `Cột điểm do ${user} đã nhập`;
                }
            });
        });
        return comments;
    }
};
// ==================== EXPORT SERVICE ====================
const ExportService = {
    /** Export Excel */
    exportExcel(headers, data, fileName) {
        const headerNames = headers.map(x => x.name);
        const exportData = data.map(item => headerNames.map(h => item[h] ?? ""));
        const worksheet = XLSX.utils.aoa_to_sheet([headerNames, ...exportData]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, fileName);
    },
    /** Chuẩn bị dữ liệu export */
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
            if (isGroup76) cotDiem_HS.TenLop = DSHocSinh[i].TenLop ?? '';
            if (isEnglish) cotDiem_HS.EnglishName = DSHocSinh[i].EnglishName ?? '';
            for (let j = 0; j < DSCotDiem_ByMaNhomCotDiem.length; j++) {
                let giaTriCotDiem = DSHocSinh[i][DSCotDiem_ByMaNhomCotDiem[j].value];
                if (DSCotDiem_ByMaNhomCotDiem[j].LoaiCotDiem === CONSTANTS.FORMULA_COLUMN) {
                    giaTriCotDiem = instance[0].records[i][j + freezeColumns]?.element?.innerHTML;
                }
                if (DSCotDiem_ByMaNhomCotDiem[j].GiaTriCotDiem === 'number') {
                    giaTriCotDiem = (giaTriCotDiem === null || giaTriCotDiem === NaN || giaTriCotDiem === '')
                        ? ''
                        : parseFloat(giaTriCotDiem);
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
    /** Lấy Tình Trạng để disable/enable UI */
    getTinhTrangStatus(DSHocSinh_API, vueData) {
        if (DSHocSinh_API.length === 0) {
            return { isDisabled: false, TinhTrang: null };
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
    /** Lấy thông tin từ chối */
    getReasonReject(DSHocSinh_API, vueData) {
        const defaultObj = { disabled: false, NoiDungNhanXet: null, TinhTrang: null };
        if (DSHocSinh_API.length === 0) return defaultObj;
        const obj = DSHocSinh_API.find(x => x.TinhTrang === 3 || x.TinhTrang === 5 || x.TinhTrang === 7);
        if (obj) {
            defaultObj.disabled = true;
            defaultObj.NoiDungNhanXet = obj.NoiDungNhanXet ?? '';
            defaultObj.TinhTrang = obj.TinhTrang ?? '';
        }
        return defaultObj;
    },
    /** Render text người từ chối */
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
    /** Lấy điểm Test từ Theme */
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
        const arrFilterDSCotDiemWithThemeTest = DSCotDiem_TA2.filter(x => x.MaCotDiem === mapping.cot);
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
    /** Cập nhật tình trạng cho các môn NLPC liên quan (Cấp 1) */
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
                    MonHocLopID,
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
        return { success: errorCount === 0, total: monHocIDArray.length, successCount, errorCount, errors };
    },
    /** Lưu tạm - Cập nhật tình trạng = 1 */
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
    /** Gửi BGH - Cập nhật tình trạng = 2 */
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
// ==================== LOCK SERVICE ====================
const LockService = {
    /**
     * Khóa một danh sách cột điểm của môn chính
     * @param {Array} columns - [{ value: MaCotDiem, title }]
     * @param {object} filter
     */
    async lockColumns(columns, filter) {
        for (const cotDiem of columns) {
            await ApiService.toggleKhoaCotDiem({
                LopID: filter.LopItem.LopID,
                MonHocLopID: filter.MonHocItem.MonHocLopID,
                MaCotDiem: cotDiem.value,
                IsKhoaCotDiem: true
            });
        }
    },
    /**
     * Khóa toàn bộ cột điểm của các môn NLPC đi kèm
     * @param {object} filter
     * @param {object} vueData
     * @param {Array} dsHocSinhAPI - để lấy danh sách MaCotDiem theo MonHocID
     * @returns {{ count: number }}
     */
    async lockNLPCColumns(filter, vueData, dsHocSinhAPI) {
        const nlpcIDList = filter.MonHocItem?.List_MonHoc_NLPC_ID
            ? filter.MonHocItem.List_MonHoc_NLPC_ID.split(',').map(id => id.trim()).filter(Boolean)
            : [];
        if (!nlpcIDList.length) return { count: 0 };
        let lockedCount = 0;
        for (const monHocID of nlpcIDList) {
            try {
                const monHocIDNum = parseInt(monHocID);
                const monHocLopList = await ApiService.getMonHocLopByMonHocID({
                    MonHocID: monHocIDNum,
                    LopID: filter.LopItem.LopID,
                    NienKhoa: vueData.NienKhoa
                });
                const MonHocLopID = monHocLopList?.[0]?.MonHocLopID;
                if (!MonHocLopID) {
                    console.warn(`⚠️ Không tìm thấy MonHocLopID cho MonHocID: ${monHocIDNum}`);
                    continue;
                }
                const maCotDiemList = [
                    ...new Set(
                        dsHocSinhAPI
                            .filter(x => x.MonHocID === monHocIDNum)
                            .map(x => x.MaCotDiem)
                    )
                ];
                for (const maCotDiem of maCotDiemList) {
                    await ApiService.toggleKhoaCotDiem({
                        LopID: filter.LopItem.LopID,
                        MonHocLopID,
                        MaCotDiem: maCotDiem,
                        IsKhoaCotDiem: true
                    });
                }
                lockedCount++;
                console.log(`✅ Đã khóa ${maCotDiemList.length} cột môn NLPC MonHocID: ${monHocIDNum}`);
            } catch (error) {
                console.error(`❌ Lỗi khi khóa môn NLPC MonHocID ${monHocID}:`, error);
            }
        }
        return { count: lockedCount };
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
    tinhTrang: TinhTrangService,
    lock: LockService,
    /** Khởi tạo dữ liệu bảng điểm hoàn chỉnh */
    async initialize(filter, vueData) {
        try {
            if (!this.filter.isValidFilter(filter)) {
                return {
                    students: [], headers: [], nestedHeaders: [], freezeColumns: 3,
                    styleSheet: {}, comments: {}, apiData: [], lockedColumns: [],
                    DSCotDiem_ByMaNhomCotDiem: [],
                    tinhTrangStatus: { isDisabled: false, TinhTrang: null }
                };
            }
            // 1. Fetch STEM config
            let stemConfigList = [];
            if (filter.MonHocItem.MonHocID === CONSTANTS.SUBJECT_IDS.STEM_36) {
                stemConfigList = await this.api.getSTEMConfig({
                    NienKhoa: vueData.NienKhoa,
                    KhoiID: filter.KhoiItem.KhoiID
                });
            }
            // 2. Fetch data
            const action = this.filter.getBangDiemAction(filter, vueData, stemConfigList);
            const apiData = await this.api.fetchBangDiem(action, {
                LopID: filter.LopItem.LopID,
                MonHocID: filter.MonHocItem.MonHocID,
                TemplateBangDiemID: filter.MonHocItem.TemplateBangDiemID,
                MaNhomCotDiem: filter.MaNhomCotDiemItem.MaNhomCotDiem,
                ThuTuNhom: filter.MaNhomCotDiemItem.ThuTuNhom,
                Semester: filter.MaNhomCotDiemItem.Semester,
                NienKhoa: vueData.NienKhoa,
                KhoiID: filter.KhoiItem?.KhoiID
            });
            // 3. Tình trạng
            const tinhTrangStatus = this.utility.getTinhTrangStatus(apiData, vueData);
            // 4. Students
            const students = this.data.processStudentList(apiData);
            // 5. Freeze columns
            const isEnglish = this.filter.isEnglishSubject(filter.MonHocItem.MonHocID);
            const isGroup = this.filter.isGroupSubject(filter.MonHocItem.MonHocID);
            const freezeColumns = this.data.calculateFreezeColumns(filter.MonHocItem.MonHocID, isEnglish, isGroup);
            // 6. Locked columns
            const lockedColumns = await this.api.getKhoaCotDiem({
                LopID: filter.LopItem.LopID,
                MonHocLopID: filter.MonHocItem.MonHocLopID,
                MaNhomCotDiem: filter.MaNhomCotDiemItem.MaNhomCotDiem,
                Semester: filter.MaNhomCotDiemItem.Semester,
                NienKhoa: vueData.NienKhoa
            });
            // 7. Headers
            const firstStudent = fn_ProrityTinhTrang(students);
            const gradeColumns = apiData.filter(x => x.HocSinhID === firstStudent.HocSinhID);
            const DSCotDiem_ByMaNhomCotDiem = gradeColumns.map(x => ({
                title: x.TenCotDiem_VI,
                value: x.MaCotDiem,
                LoaiCotDiem: x.LoaiCotDiem,
                GiaTriCotDiem: x.GiaTriCotDiem
            }));
            console.log("gradeColumns", gradeColumns);
            const headers = [
                ...this.header.buildStudentInfoColumns(isGroup, isEnglish),
                ...gradeColumns.map(col =>
                    this.header.buildGradeColumn(col, isEnglish, tinhTrangStatus.isDisabled, lockedColumns)
                )
            ];
            const nestedHeaders = this.header.buildNestedHeaders(gradeColumns, apiData, freezeColumns, isGroup);
            const displayColumns = DSCotDiem_ByMaNhomCotDiem.map(cotDiem => {
                const lockedCol = lockedColumns.find(x => x.MaCotDiem === cotDiem.value && x.TinhTrang === true);
                return { title: cotDiem.title, value: cotDiem.value, isLocked: !!lockedCol };
            });
            // 8. Data rows
            const dataRows = this.buildDataRows(students, apiData, filter, headers, freezeColumns, isEnglish, vueData);
            // 9. Styles & comments
            const styleSheet = this.style.applyBackgroundStyles(dataRows, gradeColumns, freezeColumns);
            const comments = this.style.applyComments(dataRows, gradeColumns, apiData, freezeColumns);
            return {
                students: dataRows, headers, nestedHeaders, freezeColumns,
                styleSheet, comments, apiData, lockedColumns,
                displayColumns, DSCotDiem_ByMaNhomCotDiem, tinhTrangStatus
            };
        } catch (error) {
            console.error('BangDiemService.initialize error:', error);
            throw error;
        }
    },
    /** Build data rows */
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
                    column, gradeColumns, rowIndex + 1,
                    filter, headers, freezeColumns, isEnglish, vueData
                );
            });
            return rowData;
        });
    },
    /** Process column value */
    processColumnValue(column, allColumns, rowIndex, filter, headers, freezeColumns, isEnglish, vueData) {
        if (column.LoaiCotDiem !== CONSTANTS.FORMULA_COLUMN) {
            return this.data.processNonFormulaValue(column);
        }
        return this.formula.processFormulaValue(
            column, allColumns, rowIndex, filter, headers, freezeColumns, isEnglish, vueData
        );
    },
    /** Lưu dữ liệu */
    async saveData(editedCells, DSHocSinh, DSHocSinh_API, freezeColumns, filter, instance, vueData) {
        if (editedCells.length === 0) {
            Vue.$toast.warning("Bạn chưa điều chỉnh hoặc nhập điểm", { position: "top" });
            return;
        }
        const data = this.data.processBeforePushAPI(
            editedCells, DSHocSinh, DSHocSinh_API, freezeColumns, filter, instance
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
    /** Lưu tạm */
    async saveDraft(filter, vueData) {
        return await this.tinhTrang.saveDraft(filter, vueData);
    },
    /** Gửi BGH */
    async sendToBGH(filter, vueData) {
        return await this.tinhTrang.sendToBGH(filter, vueData);
    }
};