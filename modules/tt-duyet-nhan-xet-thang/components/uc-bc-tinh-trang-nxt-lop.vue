<template>
    <v-card>
        <v-card-title class="d-flex bg-primary ">
            <span class="text-white">Tình Trạng Nhận Xét Tháng {{ vueData.ThangObj?.Thang }}</span>
            <v-spacer></v-spacer>
            <v-btn @click="onClose()" variant="text" icon="mdi-close"></v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
            <div class="w-100"></div>
            <v-card v-for="KhoiID in DSKhoiID" :key="KhoiID" class="border-b">
                <v-card-title>
                    <span class="text-primary">Khối {{ KhoiID }}</span>
                </v-card-title>
                <v-card-text class="d-flex flex-wrap ga-2">
                    <v-chip @click="NXTDetailClass(Lop.LopID)" style="cursor: pointer"
                        v-for="Lop in dataLopNXT.filter(item => item.KhoiID == KhoiID)" :color="Lop.MauTinhTrang">
                        {{ Lop.TenLop }} - {{ Lop.TenTinhTrang }}</v-chip>
                </v-card-text>
            </v-card>
        </v-card-text>
    </v-card>
</template>
<script>
export default {
    data() {
        return {
            dataLopNXT: [],
            DSKhoiID: [],
            vueData
        }
    },
    mounted() {
        this.getDataLopNXT()
    },
    methods: {
        onClose() {
            vueData.isOpenReport = false
        },
        getDataLopNXT() {
            ajaxCALL('/lms/NhanXetThang_Lop_Get_TinhTrang', {
                NienKhoa: vueData.NienKhoa,
                Thang: vueData.ThangObj.Thang,
                CapID: vueData.CapID,
            }, res => {
                if (res.data.length > 0) {
                    this.dataLopNXT = res.data
                    let DSKhoiID = [...new Set(this.dataLopNXT.map(item => item.KhoiID))];
                    this.DSKhoiID = DSKhoiID
                }
            })
        },
        NXTDetailClass(lopid) {
            vueData.isOpenReport = false
            vueData.LopID = lopid
        }
    }
}
</script>