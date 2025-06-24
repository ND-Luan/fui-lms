<template>
    <v-list nav dense class="py-2">
        <v-list-item v-for="bai in items" :key="bai.NoiDungID" :value="bai" :active="isActive(bai)" class="mb-1"
            rounded="lg" @click="handleClick(bai)">
            <template v-slot:prepend>
                <v-icon>mdi-notebook-outline</v-icon>
            </template>
            <v-list-item-title class="font-weight-medium">{{ bai.TenNoiDung }}</v-list-item-title>
        </v-list-item>
    </v-list>
</template>
<script>
    export default {
    name: 'uc-mucluc-treeview',
    props: {
        items: { type: Array, default: () => [] },
        selectedId: { type: [String, Number], default: null },
        onNodeClick: { type: Function, default: () => {} }
    },
    methods: {
        handleClick(node) { if (this.onNodeClick) this.onNodeClick(node); },
        isActive(node) { return this.selectedId === node.NoiDungID; }
    }
}
</script>