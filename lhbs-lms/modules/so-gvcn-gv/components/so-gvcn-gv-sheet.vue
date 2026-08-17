<template>
	<div ref="container" class="so-gvcn-sheet-host"></div>
</template>

<script>
	export default {
		props: {
			modelValue: { default: null }, dataSource: { type: Array, default: function () { return [] } }, columns: { type: Array, default: function () { return [] } }, nestedHeaders: { type: Array, default: function () { return [] } }, freezeColumns: { type: Number, default: 0 }, tableHeight: { type: String, default: '100%' }, tableWidth: { type: String, default: '100%' }, tableHeader: { type: Boolean, default: true }, disableLazyLoading: { type: Boolean, default: false }, styleSheet: { type: Object, default: function () { return {} } }, onLoad: { type: Function, default: null }
		},
		data: function () { return { instance: null } },
		mounted: function () { this.createSheet() },
		beforeUnmount: function () { this.destroySheet() },
		methods: {
			createSheet: function () {
				if (!this.$refs.container || !window.soGvcnJspreadsheet || typeof jspreadsheet !== 'function') return
				var self = this
				this.instance = window.soGvcnJspreadsheet.create(this.$refs.container, {
					worksheets: [{ data: this.dataSource, columns: this.columns, nestedHeaders: this.nestedHeaders, freezeColumns: this.freezeColumns, tableWidth: this.tableWidth, tableHeight: this.tableHeight, tableOverflow: true, lazyLoading: !this.disableLazyLoading, rowResize: true, columnDrag: false, columnSorting: true, contextMenu: function () { return false }, stripHTML: false, wordWrap: true, allowComments: true, allowInsertColumn: false, allowManualInsertColumn: false, allowInsertRow: false, allowManualInsertRow: false, showHeader: this.tableHeader, style: this.styleSheet }],
					onchange: function (worksheet) { self.$emit('update:dataSource', worksheet.getData()) },
					onload: function () { self.$emit('update:modelValue', self.instance); if (typeof self.onLoad === 'function') self.onLoad() }
				})
			},
			destroySheet: function () {
				if (this.$refs.container && typeof jspreadsheet !== 'undefined' && typeof jspreadsheet.destroy === 'function') jspreadsheet.destroy(this.$refs.container)
				this.instance = null
			}
		}
	}
</script>