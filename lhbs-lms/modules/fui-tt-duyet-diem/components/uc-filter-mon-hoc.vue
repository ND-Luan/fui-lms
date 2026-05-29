<template>
    <v-select v-model="vueData.DSMonHoc_Selected" :items="vueData.DSMonHoc" item-title="TenMonDuLieuNganh"
        item-value="MonHocID" label="Lọc môn học" multiple style="min-width: 400px;">
        <template #selection="{ item, index }">
            <v-chip v-if="index < limitChip" color="primary">
                {{ item.raw.TenMonDuLieuNganh }}
            </v-chip>

            <span v-if="index === limitChip" class="text-grey text-caption align-self-center">
                (+{{ vueData.DSMonHoc_Selected.length - limitChip }} các môn khác)
            </span>
        </template>
    </v-select>

</template>
<script>
export default {
    data() {
        return {
            vueData,
            limitChip: 3
        }
    }
}
</script>