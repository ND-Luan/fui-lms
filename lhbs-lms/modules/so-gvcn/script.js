var soGvcnJspreadsheet = window.soGvcnJspreadsheet = {
    normalizeNestedHeaders(nestedHeaders, freezeCount) {
        if (!Array.isArray(nestedHeaders) || !freezeCount) return nestedHeaders || []
        return nestedHeaders.map((row) => {
            let columnIndex = 0
            const normalizedRow = []
                ; (row || []).forEach((header) => {
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
            let stickyTop = 0
            Array.from(table.querySelectorAll('thead tr')).forEach((row, rowIndex) => {
                row.style.setProperty('position', 'sticky', 'important')
                row.style.setProperty('top', `${stickyTop}px`, 'important')
                row.style.setProperty('z-index', `${33 - rowIndex}`, 'important')
                Array.from(row.children).forEach((cell) => {
                    cell.style.setProperty('position', 'sticky', 'important')
                    cell.style.setProperty('top', `${stickyTop}px`, 'important')
                    cell.style.setProperty('z-index', `${33 - rowIndex}`, 'important')
                    cell.style.setProperty('background-color', '#f5f5f5', 'important')
                })
                stickyTop += row.getBoundingClientRect().height || row.offsetHeight || 28
            })
            const freezeCount = Number(freezeCounts[tableIndex] || freezeCounts[0]) || 0
            if (!freezeCount) return
            table.classList.add('so-gvcn-manual-freeze')
            const tableColumns = Array.from(table.querySelectorAll('colgroup col'))
            const dataColumnWidths = tableColumns
                .slice(1)
                .map(column => Number(column.getAttribute('width')) || column.getBoundingClientRect().width || 0)
            const frozenLeftByColumn = new Map()
            let frozenWidth = 0
            for (let columnIndex = 0; columnIndex < freezeCount; columnIndex += 1) {
                frozenLeftByColumn.set(columnIndex, frozenWidth)
                frozenWidth += dataColumnWidths[columnIndex] || 0
            }
            table.querySelectorAll('thead [data-x], tbody [data-x]').forEach((cell) => {
                const columnIndex = Number(cell.dataset.x)
                if (!Number.isFinite(columnIndex) || columnIndex >= freezeCount) return
                cell.classList.add('jss_freezed')
                cell.style.setProperty('--so-gvcn-freeze-left', `${frozenLeftByColumn.get(columnIndex) || 0}px`)
                cell.style.setProperty('position', 'sticky', 'important')
                cell.style.setProperty('z-index', cell.closest('thead') ? '42' : '22', 'important')
                cell.style.setProperty('background-color', cell.closest('thead') ? '#f5f5f5' : '#fff', 'important')
            })
            table.querySelectorAll('thead tr.jss_nested td[data-column], thead tr.jss_nested th[data-column]')
                .forEach((cell) => {
                    const columns = String(cell.dataset.column || '')
                        .split(',')
                        .map(Number)
                        .filter(Number.isFinite)
                    if (!columns.length || columns.some(columnIndex => columnIndex >= freezeCount)) return
                    cell.classList.add('jss_freezed')
                    cell.style.setProperty('--so-gvcn-freeze-left', `${frozenLeftByColumn.get(columns[0]) || 0}px`)
                    cell.style.setProperty('position', 'sticky', 'important')
                    cell.style.setProperty('z-index', '43', 'important')
                    cell.style.setProperty('background-color', '#f5f5f5', 'important')
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