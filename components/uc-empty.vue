<template>
    <div class="d-flex flex-column justify-center align-center">
        <v-empty-state text-width="250">
            <template v-slot:media>
                <v-icon size="50">mdi-magnify</v-icon>
            </template>

            <template v-slot:title>
                <div class="text-h6 text-high-emphasis">Không tìm thấy dữ liệu</div>
            </template>
        </v-empty-state>
    </div>
</template>
<script>
export default {

}
</script>