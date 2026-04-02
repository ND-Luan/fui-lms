<!-- components/AppDataTable.vue -->
<template>
    <div v-if="enableAutoTableHeight" v-auto-table-height="autoTableHeightOptions">
        <v-data-table v-bind="tableAttrs" :style="tableStyle">
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
    </div>

    <v-data-table v-else v-bind="tableAttrs" :style="tableStyle">
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
    props: {
        vDataTableHeight: {
            type: String,
            default: '',
        },
        autoTableHeight: {
            type: [Boolean, Object],
            default: false,
        },
    },
    computed: {
        tableAttrs() {
            const attrs = { ...this.$attrs }
            delete attrs.style
            return attrs
        },
        tableStyle() {
            const originalStyle = this.$attrs.style
            if (!this.vDataTableHeight) return originalStyle

            const heightStyle = {
                maxHeight: this.vDataTableHeight,
                overflowY: 'auto',
            }
            return [originalStyle, heightStyle]
        },
        enableAutoTableHeight() {
            return this.autoTableHeight !== false
        },
        autoTableHeightOptions() {
            if (typeof this.autoTableHeight === 'object') return this.autoTableHeight
            return {}
        },
    },
}
</script>