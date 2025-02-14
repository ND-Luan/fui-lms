<template>
    <!-- Container cho Quill Editor -->
    <div :ref="'quillContainer_' + uniqueId" v-bind="$attrs" class="fpScrollbar " style="height: 250px"></div>
</template>

<script>
export default {
    props: {
        modelValue: {
            type: String,
            default: ''
        },
        readOnly: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            quill: null, // Biến lưu trữ instance của Quill
            uniqueId: _.uniqueId(), // Tạo unique id cho Quill Editor
            toolbar: ['bold', 'italic', 'underline'] // Thanh công cụ
        };
    },
    mounted() {
        this.initializeEditor(); // Khởi tạo Quill Editor khi component được gắn vào DOM
    },
    methods: {
        // Phương thức khởi tạo Quill Editor
        initializeEditor() {
            this.quill = Vue.markRaw(new Quill(this.$refs['quillContainer_' + this.uniqueId], {
                theme: 'bubble', // Sử dụng theme 'bubble'
                modules: {
                    toolbar: this.toolbar
                },
                readOnly: this.readOnly
            }));

            // Xử lý sự kiện 'text-change' của Quill
            this.quill.on('text-change', () => {
                const content = this.quill.root.innerHTML;
                this.$emit('update:modelValue', content); // Phát sự kiện để cập nhật modelValue
            });

            this.quill.root.innerHTML = '';
            this.quill.clipboard.dangerouslyPasteHTML(0, this.modelValue);
        }
    },
    beforeDestroy() {
        // Hủy bỏ instance của Quill khi component bị hủy
        if (this.quill) {
            this.quill = null;
        }
    }
}
</script>