<template>
    <v-card>
        <v-row>
            <v-col v-for="(item, index) in List_TinhTrang">
                <v-card class="text-center">
                    <p :class="'text-' + item.MauTinhTrang">{{ item.TenTinhTrang }}</p>
                    <v-chip :class="'text-' + item.MauTinhTrang">{{ item.Content }}</v-chip>
                </v-card>
                <v-divider vertical if="index !== List_TinhTrang.length - 1"></v-divider>
            </v-col>
        </v-row>
    </v-card>
</template>
<script>
export default {
    props: {
        modelValue: {
            type: Array
        }
    },
    computed: {
        List_TinhTrang: function () {
            const list_TinhTrang = [
                { TinhTrang: 0, TenTinhTrang: 'Chưa lưu', MauTinhTrang: '' },
                { TinhTrang: 1, TenTinhTrang: 'Lưu tạm', MauTinhTrang: 'yellow' },
                { TinhTrang: 2, TenTinhTrang: 'GVBM gửi điểm', MauTinhTrang: 'orange' },
                { TinhTrang: 3, TenTinhTrang: 'GVCN từ chối điểm GVBM', MauTinhTrang: 'error' },
                { TinhTrang: 4, TenTinhTrang: 'GVCN gửi điểm', MauTinhTrang: 'primary' },
                { TinhTrang: 5, TenTinhTrang: 'Tổ trưởng từ chối GVCN', MauTinhTrang: 'error' },
                { TinhTrang: 6, TenTinhTrang: 'Tổ trưởng gửi BGH', MauTinhTrang: 'primary' },
                { TinhTrang: 7, TenTinhTrang: 'BGH từ chối Tổ trưởng', MauTinhTrang: 'error' },
                { TinhTrang: 8, TenTinhTrang: 'BGH duyệt (Công bố phụ huynh)', MauTinhTrang: 'success' }
            ]
            for (var item of list_TinhTrang) {
                item.Content = this.modelValue.filter(x => x.TinhTrang === item.TinhTrang).length
            }
            return list_TinhTrang
        }
    }
}
</script>