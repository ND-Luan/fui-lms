<template>
    <v-text-field v-model="input" label="Tìm kiếm" prepend-inner-icon="mdi-magnify" variant="solo-filled" flat
        single-line style="max-width:300px"></v-text-field>
</template>
<script>
export default {
    props: {
        modelValue: {
            type: String,
            required: true
        },
    },
    data() {
        return {
            input: this.modelValue
        }
    },
    watch: {
        input(val) {
            if (val) {
                this.$emit('update:modelValue', val)
            } else {
                this.$emit('update:modelValue', '')
            }
        }
    },
}
</script>