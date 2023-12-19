type EventData = {
    status: 'added' | 'deleted' | 'updated'
    value: any
}


export const useEventSource = (eventData: EventData, datas: any[]) => {
    const data = ref(datas)

    switch (eventData.status) {
        case 'added':
            let arr = [eventData.value, ...datas]
            let uniqueArr = Array.from(new Set(arr.map(obj => obj.id))).map(id => arr.find(obj => obj.id === id));

            data.value = uniqueArr
            break;
        case 'deleted':
            data.value = datas.filter((todo: any) => todo.id !== eventData.value.id)
            break;
        case 'updated':
            data.value = datas.map((item: any) => {
                if (item.id === eventData.value.id) {
                    return eventData.value
                }
                return item
            })
            break;
        default:
            break;
    }

    return data

}