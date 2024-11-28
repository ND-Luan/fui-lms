<template>
    <div class="d-flex ga-4 justify-center align-center">
        <v-empty-state text-width="250">
            <template v-slot:media>
                <v-icon size="20">mdi-magnify</v-icon>
            </template>

            <template v-slot:title>
                <div class="text-caption text-high-emphasis">{{ text }}</div>
            </template>
        </v-empty-state>
    </div>
</template>
<script>
export default {
    props: {
        text: {
            type: String,
            default: 'Không tìm thấy dữ liệu',
        },
    },
}
</script>