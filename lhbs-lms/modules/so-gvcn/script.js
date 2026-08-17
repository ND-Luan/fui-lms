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
    syncNestedHeaders(container, freezeCounts, options) {
        if (!container) return
        const tables = container.querySelectorAll('table.jss_worksheet')
        tables.forEach((table, tableIndex) => {
            const thead = table.querySelector('thead')
            const planTable = !!table.closest('.so-gvcn-plan-tab')
            if (thead) {
                thead.style.setProperty('position', 'sticky', 'important')
                thead.style.setProperty('top', '0px', 'important')
                thead.style.setProperty('z-index', '50', 'important')
                thead.style.setProperty('background-color', '#f5f5f5', 'important')
            }
            let stickyTop = 0
            Array.from(table.querySelectorAll('thead tr')).forEach((row, rowIndex) => {
                row.style.setProperty('position', planTable ? 'static' : 'sticky', 'important')
                row.style.setProperty('top', planTable ? 'auto' : `${stickyTop}px`, 'important')
                row.style.setProperty('z-index', `${33 - rowIndex}`, 'important')
                Array.from(row.children).forEach((cell) => {
                    cell.style.setProperty('position', planTable ? 'static' : 'sticky', 'important')
                    cell.style.setProperty('top', planTable ? 'auto' : `${stickyTop}px`, 'important')
                    cell.style.setProperty('z-index', `${33 - rowIndex}`, 'important')
                    cell.style.setProperty('background-color', '#f5f5f5', 'important')
                })
                stickyTop += row.getBoundingClientRect().height || row.offsetHeight || 28
            })
            const freezeCount = Number(freezeCounts[tableIndex] || freezeCounts[0]) || 0
            if (!freezeCount) return
            table.classList.add('so-gvcn-manual-freeze')
            const tableColumns = Array.from(table.querySelectorAll('colgroup col'))
            const wsCols = (options && options.worksheets && options.worksheets[tableIndex] && options.worksheets[tableIndex].columns) || []
            const dataCols = wsCols.length && tableColumns.length > wsCols.length
                ? tableColumns.slice(tableColumns.length - wsCols.length)
                : tableColumns
            const frozenLeftByColumn = new Map()
            let frozenWidth = 0
            for (let columnIndex = 0; columnIndex < freezeCount; columnIndex += 1) {
                frozenLeftByColumn.set(columnIndex, frozenWidth)
                let colW = 0
                if (dataCols[columnIndex]) {
                    colW = Number(dataCols[columnIndex].getAttribute('width')) || dataCols[columnIndex].getBoundingClientRect().width || 0
                }
                if (!colW && wsCols[columnIndex]) {
                    colW = Number(wsCols[columnIndex].width) || 0
                }
                if (!colW) {
                    const sampleCell = table.querySelector(`[data-x="${columnIndex}"]`)
                    if (sampleCell) colW = sampleCell.getBoundingClientRect().width || 0
                }
                frozenWidth += colW || 0
            }
            table.querySelectorAll('thead [data-x], tbody [data-x]').forEach((cell) => {
                const columnIndex = Number(cell.dataset.x)
                if (!Number.isFinite(columnIndex) || columnIndex >= freezeCount) return
                const leftPos = `${frozenLeftByColumn.get(columnIndex) || 0}px`
                cell.classList.add('jss_freezed')
                cell.style.setProperty('--so-gvcn-freeze-left', leftPos)
                cell.style.setProperty('left', leftPos, 'important')
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
                    const leftPos = `${frozenLeftByColumn.get(columns[0]) || 0}px`
                    cell.classList.add('jss_freezed')
                    cell.style.setProperty('--so-gvcn-freeze-left', leftPos)
                    cell.style.setProperty('left', leftPos, 'important')
                    cell.style.setProperty('position', 'sticky', 'important')
                    cell.style.setProperty('z-index', '43', 'important')
                    cell.style.setProperty('background-color', '#f5f5f5', 'important')
                })
        })
    },
    create(container, options) {
        const worksheets = (options.worksheets || []).map((worksheet) => {
            const freezeCount = Number(worksheet.freezeColumns) || 0;
            const originalOnbeforepaste = worksheet.onbeforepaste;
            const injectedOnbeforepaste = function(ws, data, x, y) {
                const col = ws.options.columns ? ws.options.columns[x] : null;
                let processedData = data;
                if (Array.isArray(data)) {
                    processedData = data.map(row => row.map(cell => {
                        if (cell === null || cell === undefined) return '';
                        if (typeof cell === 'string' || typeof cell === 'number') return String(cell);
                        if (typeof cell === 'object') {
                            return cell.innerHTML || cell.textContent || cell.innerText || cell.value || cell.v || '';
                        }
                        return String(cell);
                    }));
                    if (col && (col.type === 'note' || col.type === 'html')) {
                        let text = processedData.map(row => row.join('\t')).join('\n');
                        if (text.startsWith('"') && text.endsWith('"')) {
                            text = text.substring(1, text.length - 1).replace(/""/g, '"');
                        }
                        processedData = [[text]];
                    }
                }
                if (typeof originalOnbeforepaste === 'function') {
                    return originalOnbeforepaste(ws, processedData, x, y);
                }
                return processedData;
            };
            return {
                ...worksheet,
                onbeforepaste: injectedOnbeforepaste,
                nestedHeaders: this.normalizeNestedHeaders(worksheet.nestedHeaders, freezeCount)
            }
        })
        const originalOnload = options.onload
        const freezeCounts = worksheets.map(worksheet => Number(worksheet.freezeColumns) || 0)
        return jspreadsheet(container, {
            ...options,
            worksheets,
            onload: (...args) => {
                this.syncNestedHeaders(container, freezeCounts, options)
                window.requestAnimationFrame(() => this.syncNestedHeaders(container, freezeCounts, options))
                if (typeof originalOnload === 'function') originalOnload(...args)
            }
        })
    }
}