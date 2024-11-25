<template>
    <div class="wrapper-jexcel">
        <div id="spreadsheet" class="w-100" ref="spreadsheet" :style="styleExcel"></div>

        <v-dialog v-model="isOpen" max-width="300px">
            <v-card>
                <v-card-title>
                    Cập nhật tên cột
                </v-card-title>
                <v-text-field v-model="newName" density="compact" :hide-details="false"></v-text-field>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="isOpen = false">Hủy</v-btn>
                    <v-btn @click="onRenameColumn()">Xác nhận</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>

</template>
<script>
export default {
    emits: ['onChange', 'update:modelValue', 'update:dataSource'],
    props: {
        modelValue: {},
        dataSource: {
            type: Array,
            default: []
        },
        columns: {
            type: Array,
            default: []
        },
        nestedHeaders: {
            type: Array,
            default: []
        },
        tableWidth: {
            type: String,
            default: "100%"
        },
        tableHeight: {
            type: String,
            default: "100%"
        },
        minDimensions: {
            type: Array,
            default: [0, 0]
        },
        freezeColumns: {
            type: Number,
            default: 1
        },
        exportExcel: {
            type: Boolean,
            default: false
        },
        updateTable: {
            type: Function,
        },
        styleExcel: {
            type: String
        }
    },
    data() {
        return {
            isOpen: false,
        }
    },
    watch: {
        exportExcel: function (val) {
            if (val) {
                this.ExportExcel()
            }
        },
        isSubmit: function (val) {
            if (val) {
                this.onSubmit()
            }
        },
    },
    mounted: function () {
        const jExcelObj = jexcel(this.$refs["spreadsheet"], this.jExcelOptions);
        Object.assign(this, { jExcelObj }); // tucks all methods under jExcelObj object in component instance
        this.$emit('update:modelValue', jExcelObj)
    },
    computed: {
        jExcelOptions() {

            const $this = this
            return {
                data: this.dataSource,
                columns: this.columns,
                rowResize: true,
                columnDrag: true,
                nestedHeaders: this.nestedHeaders,
                minDimensions: this.minDimensions,
                tableWidth: this.tableWidth,
                tableOverflow: true,
                tableHeight: this.tableHeight,
                lazyLoading: true,
                freezeColumns: this.freezeColumns,
                columnSorting: false,
                contextMenu: false,
                stripHTML: false,
                onchange: this.changed,
                onselection: this.onselection,
                onload: this.onload,
                wordWrap: true,
                updateTable: (instance, cell, col, row, val, label, cellName) => this.updateTable(instance, cell, col, row, val, label, cellName)
            };
        }
    },
    methods: {

        ExportExcel() {
            this.jExcelObj.download()
        },
        onRenameColumn() {

        },
        changed(instance, cell, x, y, value) {
            this.$emit('onChange', { instance, cell, x, y, value })
            this.$emit('update:dataSource', this.jExcelObj.getJson())
        },
        onselection(instance, x1, y1, x2, y2, origin) {
            console.log(this.jExcelObj.getValueFromCoords(x1, y1))
            let cellName = jexcel.getColumnNameFromId([x1, y1])
            console.log(this.jExcelObj.getCell(cellName).innerHTML)
        },
        onblur() {

        },
        onload() {
            // this.$nextTick(() => {
            //     this.jExcelObj.setHeight(0, 45)
            // })
        }
    }
}
</script>