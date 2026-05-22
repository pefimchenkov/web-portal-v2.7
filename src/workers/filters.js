
function filterHandler(filters, data, formatters) {
    console.time('filterHandler')

    const parsedFilters = JSON.parse(filters);
    const parsedData = JSON.parse(data);
    const parsedFormatters = JSON.parse(formatters);


    let filteredData = [];

    if (!Object.keys(parsedFilters).length) {
        filteredData = null
    }

    
    filteredData = parsedData.filter(row => {
        const result = [];

        Object
            .entries(parsedFilters)
            .forEach(([filter, search]) => {
                if (typeof search === 'string' && !search) {
                    return result.push(true)
                }

                /* ============ Bool ============== */
                if (typeof search === 'boolean') {

                    const data = parsedFormatters.find(i => i?.name === filter)

                    if (typeof data === 'object' && data?.formatter) {
                        const userFunc = new Function(`return ${data?.formatter}`)();
                        return result.push(search ? userFunc(row[filter]) : true)
                    }

                    return result.push(search ? row[filter] : true)
                }


                /* ============ Multi ============== */

                if (Array.isArray(search)
                        && search.length > 0
                        && search.every(i => (i && typeof i === 'string'))) {

                    const splittedData = !row[filter]
                        ? ['нет данных']
                        : row[filter]?.split(', ')

                    const data = parsedFormatters.find(i => i?.name === filter);

                    if (typeof data === 'object' && typeof data?.formatter === 'function') {
                        return result.push(
                            search.length
                            ? data.formatter(row[filter])?.split(', ').some(el => {
                                if (!el) return search.includes('нет данных')
                                return search.includes(el)
                            })
                            : true
                        )
                    }


                    return result.push(
                        search.length
                        ? splittedData.some(el => {
                            if (!el) return search.includes('нет данных')
                            return search.includes(el)
                        })
                        : true
                    )

                }

                /* ============ String ============== */

                if (typeof search === 'string' ?? search) {
                    
                    
                    if (search === 'нет данных') {
                       return result.push(!row[filter])
                    }

                    const data = parsedFormatters.find(i => i?.name === filter);


                    if (typeof data === 'object' && typeof data?.formatter === 'function') {
                        console.log('data?.formatter', data?.formatter)

                        return result.push((data?.formatter(row[filter]))?.toString())?.toLowerCase().includes(search.toString()?.toLowerCase())
                    }


                    return result.push(
                        row[filter]?.toString().toLowerCase().includes(search?.toString().toLowerCase())
                    )
                }

                /* ============ Number ============== */

                if (typeof search === 'number' ?? search) {

                    const data = parsedFormatters.find(i => i?.name === filter)
                    if (typeof data === 'object' && typeof data?.formatter === 'function') {
                        return result.push((data.formatter(row[filter]))?.toString())?.toLowerCase() === (search.toString()?.toLowerCase())
                    }

                    return result.push(
                        typeof row[filter] === 'string' && (row[filter]?.includes('.') || row[filter]?.includes(','))
                        ? (row[filter] === search?.toFixed(2))
                        : (row[filter]?.toString() === search?.toString())
                    )
                }

                /* ============ Date ============== */

                if (Array.isArray(search) && search.every(i => (i && (new Date(i).getFullYear() !== 1970)))) {

                    if (!search || !search.length) return true
                    const time = new Date(row[filter]).getTime();
                    return result.push((time >= search[0] && time <= search[1]))

                } else {
                    if (!search) return true

                    const min = Number(search[0]);
                    const max = Number(search[1]);
                    const rowValue = typeof row[filter] === 'object'
                        ? row[filter]?.data
                        : row[filter]

                    if (rowValue === undefined || rowValue === '') return false
                    return result.push((rowValue >= min && rowValue <= max))
                }

                /* ========================== */

            })

            return result.every(i => i)
    })

    console.timeEnd('filterHandler')
    console.log('filteredData', filteredData.length)
    return filteredData

}


module.exports = {
    filterHandler
}
