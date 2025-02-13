<template>
    <div>
        {{ modelValue }}
        <div ref="quillContainer">
            <p>Hello World!</p>
            <p>Some initial <strong>bold</strong> text</p>
            <p><br /></p>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        modelValue: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            quill: null
        }
    },
    mounted() {
        this.buildEditor()
    },
    watch: {
        modelValue: function (newValue) {
            console.log('newValue', newValue)
            if (this.quill && this.quill.root.innerHTML !== newValue) {
                this.quill.root.innerHTML = newValue
            }
        }
    },
    methods: {
        buildEditor() {
            this.quill = new Quill(this.$refs.quillContainer, {
                theme: 'bubble',
                modules: {
                    toolbar: ['bold', 'italic', 'underline']
                }
            });

            this.quill.on('text-change', () => {
                this.$emit('update:modelValue', this.quill.root.innerHTML)
            });

            // Gán nội dung ban đầu
            this.quill.root.innerHTML = this.modelValue
        }
    }
}
</script>
