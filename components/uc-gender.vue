<template>
    <v-icon class="mb-1 ml-1" v-if="modelValue" color="pink">mdi-face-woman</v-icon>
    <v-icon class="mb-1 ml-1" v-else color="info">mdi-face-man</v-icon>
</template>
<script>
export default {
    props: {
        modelValue: {
            type: Boolean,
            default: false
        }
    }
}
</script>