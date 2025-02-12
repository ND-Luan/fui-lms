<template>
    <div>
        {{ content }}
        <quill-editor refs="quill" v-model:content="content"></quill-editor>
    </div>
</template>
<script>
export default {
    props: {
        modelValue: {
            type: Object,
        }
    },
    components: {
        QuillEditor: VueQuill.QuillEditor
    },
    data() {
        return {
            content: [{ "insert": "12312312321\n" }]
        }
    }

}
</script>