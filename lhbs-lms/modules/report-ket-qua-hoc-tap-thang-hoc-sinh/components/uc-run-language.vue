<template>

</template>
<script>
export default {
    props: {},
    created() {
        const IsLanguage = JSON.parse(localStorage.getItem('IsLanguage')) ?? false
        this.$i18n.locale = IsLanguage ? "en" : "vi"
    }
}
</script>