<template>
    <v-container fluid>
        <!-- header và thanh tìm kiếm -->
        <v-row class="mb-6" no-gutters>
            <v-col :cols="cols[0]">
                <div class="mx-auto px-4">
                    <h1 class="text-primary">Giáo án</h1>
                </div>
            </v-col>
            <v-col :cols="cols[1]">
                <uc-search />
            </v-col>
        </v-row>

        <!-- danh sách giáo án  và button thêm giáo án-->
        <uc-lesson-plan />
    </v-container>



</template>

<script>
export default {
  components: { },
    props: [],
    data() {
        return {}
    },
    mounted() { },
    computed: {

        cols() {
            const { xl, lg, md, sm } = this.$vuetify.display
            return xl ? [9, 3] : lg ? [9, 3] : md ? [8, 4] : sm ? [12, 12] : [12, 12]
        }

    },
    watch: {},
    methods: {},
}
</script>