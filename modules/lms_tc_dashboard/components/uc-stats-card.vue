<template>
    <v-card :color="color" dark>
        <v-card-text>
            <div class="d-flex align-center">
                <v-icon size="40" class="mr-4">{{ icon }}</v-icon>
                <div>
                    <div class="text-h4 font-weight-bold">{{ value }}</div>
                    <div class="text-subtitle-1">{{ title }}</div>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: 'uc-stats-card',
    props: {
        title: { type: String, default: '' },
        value: { type: [String, Number], default: 0 },
        icon: { type: String, default: 'mdi-information' },
        color: { type: String, default: 'primary' }
    }
}
</script>