<!-- components/AppDataTable.vue -->
<template>
    <v-data-table v-bind="$attrs">
        <template #no-data>
            <div class="d-flex flex-column align-center py-6">
                <v-icon size="48" color="grey-lighten-2">mdi-inbox</v-icon>
                <div class="text-grey mt-2">Chưa có dữ liệu</div>
            </div>
        </template>
        <template v-for="(_, name) in $slots" #[name]="slotProps">
            <slot :name="name" v-bind="slotProps ?? {}" />
        </template>
    </v-data-table>
</template>

<script>
export default {
    name: 'GlobalDataTable',
    inheritAttrs: false,
}
</script>