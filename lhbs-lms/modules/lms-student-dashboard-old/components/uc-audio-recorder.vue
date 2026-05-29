<template>
    <f-audio-recorder></f-audio-recorder>
    <v-btn v-if="audioFile" :href="URL.createObjectURL(audioFile)" download>Tải âm thanh</v-btn>
</template>
<script>
export default {
    data() {
        return {
            audioFile: null
        }
    }
}
</script>