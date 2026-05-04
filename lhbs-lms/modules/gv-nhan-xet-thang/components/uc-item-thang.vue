<template>
    <v-list-item :title="item.raw.Thang_HienThi" v-bind="$attrs">
        <template v-slot:append>
            <v-chip :color="item.raw.MauTinhTrang">{{ item.raw.TenTinhTrang }}</v-chip>
        </template>
    </v-list-item>
</template>
<script>
export default {
    props: {
        item: {
            type: Object,
            default: () => { }
        }
    }
}
</script>