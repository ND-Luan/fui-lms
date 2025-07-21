<template>
    <v-card>
        <v-card-title class="text-h5">
            <span class="text-uppercase">Cấu hình chỉ tiêu tiếng Anh</span>
        </v-card-title>
        <v-card-text>
            <uc-jexcel class="height-excel-tong-ket-hoc-ki hide-headers" v-if="vueData.DSLop.length > 0"
                :freeze-columns="1" :freeze-rows="1" v-model:dataSource="vueData.DSLop" v-model="instance"
                :columns="vueData.columnHeader" :nestedHeaders="vueData.nestedHeaders">
            </uc-jexcel>
        </v-card-text>
    </v-card>


</template>
<script>
export default {
    data() {
        return {
            vueData,
            instance: {}
        }
    },
    async mounted() {
        await this.ChiTieuGet()

    },
    methods: {
        ChiTieuGet() {
            ajaxCALL('/lms/ChiTieu_Get', {
                CapID: 2
            }, res => {
                if (res.data.length > 0) {
                    // vueData.DSLop = res.data;
                    let disctinctLop = [...new Set(res.data.map(item => item.TenLop))];
                    for (let i = 0; i < disctinctLop.length; i++) {
                        let lop = res.data.filter(item => item.TenLop == disctinctLop[i]);
                        let obj = {
                            TenLop: disctinctLop[i],
                        }
                        vueData.DSLop.push(obj)
                    }
                }
            })
        }
    }
}
</script>