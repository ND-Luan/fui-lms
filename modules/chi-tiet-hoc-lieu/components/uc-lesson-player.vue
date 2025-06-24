<template>
    <v-dialog :model-value="isOpen" @update:modelValue="close" fullscreen transition="dialog-bottom-transition">
        <v-card v-if="item">
            <v-toolbar color="primary">
                <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
                <v-toolbar-title>{{ item.TenNoiDung }}</v-toolbar-title>
            </v-toolbar>
            <v-card-text class="pa-0">
                <!-- Nội dung của uc-trinh-xem-noi-dung được chuyển vào đây -->
                <div class="content-body pa-4">
                    <div v-if="parsedData" v-html="parsedData.htmlContent"></div>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'uc-lesson-player',
    props: {
        isOpen: Boolean,
        item: Object
    },
    emits: ['update:isOpen'],
    computed: {
        parsedData() {
            if (!this.item || !this.item.DataJson) return null;
            try { return JSON.parse(this.item.DataJson); }
            catch (e) { return null; }
        }
    },
    methods: {
        close() {
            this.$emit('update:isOpen', false);
        }
    }
}
</script>