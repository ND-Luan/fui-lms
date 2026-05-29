<template>
    <v-card>
        <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-history</v-icon>
            <span class="text-h6">{{ title }}</span>
        </v-card-title>
        <v-divider></v-divider>
        <v-list lines="two">
            <v-list-item v-if="!activities || activities.length === 0">
                <v-list-item-title class="text-grey">Chưa có hoạt động nào</v-list-item-title>
            </v-list-item>

            <v-list-item v-for="(activity, index) in activities" :key="index" :subtitle="activity.time">
                <template v-slot:prepend>
                    <v-avatar color="grey-lighten-1" class="mr-3">
                        <v-icon color="white">mdi-account-circle</v-icon>
                    </v-avatar>
                </template>

                <v-list-item-title v-html="activity.title"></v-list-item-title>
            </v-list-item>
        </v-list>
    </v-card>
</template>

<script>
    export default {
    name: 'uc-activity-feed',
    props: {
        title: { type: String, default: 'Hoạt động gần đây' },
        activities: { type: Array, default: () => [] }
    }
}
</script>