<template> </template>
<script>
export default {
    props: {},
    data() {
        return {
            vueData
        }
    },
    created() {
        const IsLanguage = JSON.parse(localStorage.getItem('IsLanguage')) ?? false
        this.$i18n.locale = IsLanguage ? "en" : "vi"
        console.log(this.$i18n);
        const { t } = VueI18n.useI18n()
        vueData.t = t
        this.initdefColorResult()
        this.initdefColorActivities()
    },
    methods: {
        initdefColorResult,
        initdefColorActivities
    }
}
</script>