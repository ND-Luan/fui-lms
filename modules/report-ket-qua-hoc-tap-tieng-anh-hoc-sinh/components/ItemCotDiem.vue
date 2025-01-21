<template>
    <v-list-item :title="item?.TenCotDiem_VI">
        <template v-slot:append>
            <v-chip color="primary" size="small" v-if="ketQuaDanhGia"> {{ ketQuaDanhGia }}</v-chip>
        </template>
    </v-list-item>
</template>
<script>
export default {
    props: {
        item: {
            type: Object
        }
    },
    computed: {
        ketQuaDanhGia: function () {
            let item = this.item
            let ketQua = null
            if (item.LoaiCotDiem === 'Nhập') {
                //Kiểm tra tồn tại
                if (!!item.KetQuaDanhGia_VI) ketQua = parseFloat(item.KetQuaDanhGia_VI)
            }
            else if (item.LoaiCotDiem === 'Công thức') {
                ketQua = item.KetQuaDanhGia_VI
            }
            return ketQua
        }
    }
}
</script>