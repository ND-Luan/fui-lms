var soGvcnJspreadsheet = window.soGvcnJspreadsheet = {
	normalizeNestedHeaders(nestedHeaders, freezeCount) {
		if (!Array.isArray(nestedHeaders) || !freezeCount) return nestedHeaders || []
		return nestedHeaders.map((row) => {
			let columnIndex = 0
			const normalizedRow = []
			;(row || []).forEach((header) => {
				const colspan = Math.max(1, Number(header && header.colspan) || 1)
				const nextColumnIndex = columnIndex + colspan
				if (columnIndex < freezeCount && nextColumnIndex > freezeCount) {
					const frozenColspan = freezeCount - columnIndex
					const scrollingColspan = nextColumnIndex - freezeCount
					normalizedRow.push({
						...header,
						title: '',
						colspan: frozenColspan
					})
					normalizedRow.push({
						...header,
						colspan: scrollingColspan
					})
				} else {
					normalizedRow.push({ ...header, colspan })
				}
				columnIndex = nextColumnIndex
			})
			return normalizedRow
		})
	},
	syncNestedHeaders(container, freezeCounts) {
		if (!container) return
		const tables = container.querySelectorAll('table.jss_worksheet')
		tables.forEach((table, tableIndex) => {
			const freezeCount = Number(freezeCounts[tableIndex] || freezeCounts[0]) || 0
			if (!freezeCount) return
			const headerCells = table.querySelectorAll('thead td[data-x], thead th[data-x]')
			const frozenHeaderByColumn = new Map()
			headerCells.forEach((cell) => {
				const columnIndex = Number(cell.dataset.x)
				if (columnIndex < freezeCount && cell.classList.contains('jss_freezed')) {
					frozenHeaderByColumn.set(columnIndex, cell)
				}
			})
			table.querySelectorAll('thead tr.jss_nested td[data-column], thead tr.jss_nested th[data-column]')
				.forEach((cell) => {
					const columns = String(cell.dataset.column || '')
						.split(',')
						.map(Number)
						.filter(Number.isFinite)
					if (!columns.length || columns.some(columnIndex => columnIndex >= freezeCount)) return
					const firstHeader = frozenHeaderByColumn.get(columns[0])
					if (!firstHeader) return
					cell.classList.add('jss_freezed')
					cell.style.left = firstHeader.style.left || window.getComputedStyle(firstHeader).left
				})
		})
	},
	create(container, options) {
		const worksheets = (options.worksheets || []).map((worksheet) => {
			const freezeCount = Number(worksheet.freezeColumns) || 0
			return {
				...worksheet,
				nestedHeaders: this.normalizeNestedHeaders(worksheet.nestedHeaders, freezeCount)
			}
		})
		const originalOnload = options.onload
		const freezeCounts = worksheets.map(worksheet => Number(worksheet.freezeColumns) || 0)
		return jspreadsheet(container, {
			...options,
			worksheets,
			onload: (...args) => {
				this.syncNestedHeaders(container, freezeCounts)
				window.requestAnimationFrame(() => this.syncNestedHeaders(container, freezeCounts))
				if (typeof originalOnload === 'function') originalOnload(...args)
			}
		})
	}
}