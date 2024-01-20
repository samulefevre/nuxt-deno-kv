export type EventData = {
    status: 'added' | 'deleted' | 'updated'
    value: any
}

export const useEventDataSource = (eventData: EventData, datas: any[]) => {
    const newDatas = ref(datas)

    switch (eventData.status) {
        case 'added':
            let arr = [eventData.value, ...datas]
            let uniqueArr = Array.from(new Set(arr.map(obj => obj.id))).map(id => arr.find(obj => obj.id === id));

            newDatas.value = uniqueArr
            break;
        case 'deleted':
            newDatas.value = datas.filter((item: any) => item.id !== eventData.value.id)
            break;
        case 'updated':
            newDatas.value = datas.map((item: any) => {
                if (item.id === eventData.value.id) {
                    return eventData.value
                }
                return item
            })
            break;
        default:
            break;
    }

    return newDatas
}