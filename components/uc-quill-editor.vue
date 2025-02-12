<template>
    <div>
        <quill-editor ref="quill" v-model:content="content" content-type="html" v-bind="$attrs"></quill-editor>
    </div>
</template>
<script>
export default {
    props: {
        modelValue: {
            type: String,
        }
    },
    components: {
        QuillEditor: VueQuill.QuillEditor
    },
    data() {
        return {
            content: this.modelValue
        }
    },
    watch: {
        modelValue: function (content) {
            this.content = content;
        },
        content: function (content) {
            this.$emit('update:modelValue', content);
        }
    }
}
</script>
