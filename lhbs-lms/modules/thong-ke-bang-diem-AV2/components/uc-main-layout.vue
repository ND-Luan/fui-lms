<template>
	<v-toolbar color="white" style="position: sticky;
    top: 0;
    z-index: 1000;
    padding-top: 0px !important;">



        <div class="px-5">
            <v-tabs v-model="tabID" selected-class='bg-white text-primary'>
                <v-tab v-for="tab in DSTab" :text='tab.title' :value="tab.value" style="margin-top: 1px;">
                </v-tab>
            </v-tabs>
        </div>
    </v-toolbar>
    <v-tabs-window v-model="tabID" :key="schoolYearKey">
        <v-tabs-window-item v-for="tab in DSTab" :value="tab.value">
            <uc-tab-thong-ke-TA2 v-if="tab.value === 1" />
            <uc-tab-grade v-if="tab.value === 2" />
            <uc-tab-theme v-if="tab.value === 3" />
        </v-tabs-window-item>
    </v-tabs-window>
</template>

<script>
	export default {
		data() {

        return {
            vueData,
            tabID: 1,
            schoolYearKey: Number(vueData.NienKhoa) || 0,
            DSTab: [
                { title: "Thống kê TA2", value: 1 },
                { title: "Grade", value: 2 },
                { title: "Điểm TA2 từng HS", value: 3 }
            ]
        }
    },
    mounted() {
        window.addEventListener('lms-school-year-changed', this.onSchoolYearChanged)
    },
    beforeUnmount() {
        window.removeEventListener('lms-school-year-changed', this.onSchoolYearChanged)
    },
    watch: {
        'vueData.NienKhoa': function (value) {
            this.resetBySchoolYear(value)
        }
    },
    methods: {
        onSchoolYearChanged(event) {
            this.resetBySchoolYear(event?.detail?.NienKhoa)
        },
        resetBySchoolYear(nienKhoa) {
            const nextKey = Number(nienKhoa || vueData.NienKhoa) || 0
            if (this.schoolYearKey === nextKey) return
            this.schoolYearKey = nextKey
            this.tabID = 1
        }
    }
	}
</script>