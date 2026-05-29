<template>
    <v-card>
        <v-card-title class="d-flex bg-primary ">
            <span class="text-white">Tình Trạng Nhận Xét Tháng {{ ThangObj?.Thang }}</span>
            <v-spacer></v-spacer>
            <v-btn @click="$emit('close')" variant="text" icon="mdi-close"></v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
            <div class="w-100"></div>
            <v-card v-for="KhoiID in DSKhoiID" :key="KhoiID" class="border-b">
                <v-card-title>
                    <span class="text-primary">Khối {{ KhoiID }}</span>
                </v-card-title>
                <v-card-text class="d-flex flex-wrap ga-2">
                    <v-chip @click="onSelectLop(Lop.LopID)" style="cursor: pointer"
                        v-for="Lop in dataLopNXT.filter(item => item.KhoiID == KhoiID)" :color="Lop.MauTinhTrang">
                        {{ Lop.TenLop }} - {{ Lop.TenTinhTrang }}</v-chip>
                </v-card-text>
            </v-card>
        </v-card-text>
    </v-card>
</template>
<script>
export default {
    props: ['ThangObj', 'CapID'],
    emits: ['close', 'select-lop'],
    data() {
        return {
            vueData,
            dataLopNXT: [],
            DSKhoiID: [],
        }
    },
    mounted() {
        this.getDataLopNXT()
    },
    methods: {
        onSelectLop(lopid) {
            this.$emit('select-lop', lopid)
            this.$emit('close')
        },
        getDataLopNXT() {
            ajaxCALL('/lms/NhanXetThang_Lop_Get_TinhTrang', {
                NienKhoa: vueData.NienKhoa,
                Thang: this.ThangObj?.Thang,
                CapID: this.CapID,
            }, res => {
                if (res.data.length > 0) {
                    this.dataLopNXT = res.data
                    this.DSKhoiID = [...new Set(this.dataLopNXT.map(item => item.KhoiID))]
                }
            })
        },
    }
}
</script>