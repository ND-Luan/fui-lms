<template>
    <div>
        <hot-table ref="refHandsontable" :data="data" :settings="settings" v-bind="$attrs" :cell="cell">
            <slot></slot>
        </hot-table>

    </div>
</template>

<script>
export default {
    components: {
        HotTable: Handsontable.vue.HotTable,
    },
    props: {
        data: {
            type: Array,
            required: true,
            default: [],
        },
        height: {
            type: String,
            default: 'auto',
        },
        width: {
            type: String,
            default: 'auto',
        },
        colHeaders: {
            type: Array,
            default: [],
        },
        colWidths: {
            type: Array,
            default: [],
        },
    },
    data() {
        const heightTable = this.height
        const widthTable = this.width
        return {
            settings: {
                autoWrapCol: true,
                colHeaders: true,
                rowHeaders: true,
                height: heightTable,
                width: widthTable,
                licenseKey: 'non-commercial-and-evaluation',
                // enable the plugin with the default configuration
                contextMenu: true,
                copyPaste: {
                    copyColumnHeaders: true,
                    copyColumnGroupHeaders: true,
                    copyColumnHeadersOnly: true,
                },
                contextMenu: ['copy', 'copy_with_column_headers', 'copy_with_column_group_headers', 'copy_column_headers_only'],
                colHeaders: this.colHeaders,
                // enable filtering
                filters: true,
                // enable the column menu
                dropdownMenu: ['alignment', 'filter_by_condition', 'filter_by_value', 'filter_action_bar'],
                // colWidths: this.colWidths
            },
        }
    },
    methods: {
        cell(row, col) {
            console.log('runinng cell');
        }
    }
}
</script>