<template>
    <v-card>
        <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">{{ icon }}</v-icon>
            <span class="text-h6">{{ title }}</span>
        </v-card-title>
        <v-divider></v-divider>
        <v-list lines="two">
            <v-list-item v-if="!items || items.length === 0">
                <v-list-item-title class="text-grey">Không có dữ liệu</v-list-item-title>
            </v-list-item>
            <v-list-item v-for="(item, index) in items" :key="index" :title="item.Title || item.title"
                :subtitle="getSubtitle(item)">
                <template v-slot:append>
                    <div class="d-flex flex-column align-end">
                        <v-chip v-if="item.Status !== undefined" :color="item.Status === 1 ? 'blue' : 'green'"
                            size="small" variant="tonal" class="mb-1">
                            {{ item.Status === 1 ? 'Soạn thảo' : 'Đã xuất bản' }}
                        </v-chip>
                    </div>
                </template>
            </v-list-item>
        </v-list>
    </v-card>
</template>

<script>
    export default {
    name: 'uc-task-list',
    props: {
        title: { type: String, required: true },
        icon: { type: String, default: 'mdi-format-list-bulleted' },
        items: { type: Array, default: () => [] }
    },
    methods: {
        getSubtitle(item) {
            if (item.subtitle) {
                return item.subtitle;
            }
            if (item.TenLop && item.MonHocName) {
                const dueDate = item.DueDate ? new Date(item.DueDate).toLocaleDateString('vi-VN') : 'N/A';
                return `${item.TenLop} - ${item.MonHocName} | Hạn: ${dueDate}`;
            }
            return null;
        }
    }
}
</script>