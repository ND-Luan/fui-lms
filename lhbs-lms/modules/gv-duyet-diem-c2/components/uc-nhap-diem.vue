<template>
    <uc-jexcel class="height-excel" v-if="vueData.DSHocSinh?.length > 0" v-model="vueData.instance"
        :freeze-columns="vueData.freezeColumns" v-model:dataSource="vueData.DSHocSinh" :columns="vueData.columnHeader"
        :updateTable="updateTable" :comments="vueData.comments" :key="vueData.keyComp" :styleSheet="vueData.styleSheet">
    </uc-jexcel>
    <div v-else>
        <uc-empty />
    </div>
</template>

<script>
export default {
    props: [],
    data() {
        return {
            vueData,
        }
    },
    mounted() { },
    computed: {},
    watch: {},
    methods: {
        updateTable(instance, cell, col, row, val, label, cellName) {
            cell.style.backgroundColor = vueData.columnHeader[col]?.backGroundColor
            vueData.columnHeader.forEach((x, index) => {
                if (x.type == 'numeric') {
                    if (col === index) cell.style.textAlign = 'right'
                } else if (x.type == 'text') {
                    if (col === index) cell.style.textAlign = 'left'
                }
            })
        },
    },
}
</script>