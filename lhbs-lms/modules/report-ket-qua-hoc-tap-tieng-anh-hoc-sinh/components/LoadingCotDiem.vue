<template>
    <div style="min-height: 300px; display: flex; flex-direction: column;">
        <template v-if="loading">
            <v-skeleton-loader type="list-item-avatar" />
            <v-skeleton-loader type="heading" />
            <v-skeleton-loader type="list-item-three-line" v-for="item in 4" />
        </template>
        <slot />
    </div>
</template>
<script>
export default {
    props: {
        loading: {
            type: Boolean
        }
    },
    data() {
        return {
            vueData
        }
    }
}
</script>