<template>

    <div v-if="!FocusTaskListFilter || FocusTaskListFilter.length === 0"
        class="text-center pa-5 grey--text rounded border mx-3">
        <p class="mb-0">{{ $t('message.NoAssignmentToGrade') }}</p>
    </div>
    <div class="pa-2" style="height: fit-content; " v-else>
        <div class="d-flex w-100  ga-2 h-100" style="height: 600px;">
            <div class=" d-flex flex-column rounded border h-100 elevation-1 bg-white" style="flex: 0 0 20%;">
                <div class="border-b pa-2" style="min-height: fit-content;flex: 0 0 auto;">
                    <v-select v-model="KhoiIDSelected" label="Khối" :items="DSKhoi" item-title="TenKhoi"
                        item-value="KhoiID"></v-select>
                </div>
                <div style="flex: 1 1 100%; overflow-y: auto; scrollbar-width: thin;">
                    <v-list density="compact" class="d-flex flex-column ga-2 pa-2">
                        <v-list-item v-for="item in DSLop" :key="item.LopNhomID" :value="item.LopNhomID"
                            :active="LopNhomIDSelected == item.LopNhomID" active-class="text-primary" class="pa-2"
                            rounded border density="compact" @click="LopNhomIDSelected = item.LopNhomID">
                            <v-list-item-title class=" d-flex align-center ">
                                <span class="text-body-1 font-weight-medium">{{ item.TenLop }}</span>
                                <v-spacer></v-spacer>
                                <v-chip color="primary" size="small">{{ item.TongBT }} bài tập</v-chip>
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </div>
            </div>
            <div class=" d-flex flex-column rounded border pa-2 elevation-1 bg-white" style="flex: 1 0 70%; ">
                <div class="w-100 d-flex mb-3" style="min-height: fit-content;flex: 0 0 auto;">
                    <span class="text-subtitle-1 font-weight-medium my-2">Bài tập
                        cần chấm</span>
                    <v-spacer></v-spacer>
                    <v-text-field label="Tìm kiếm " v-model="search" density="compact" style="max-width: 350px;"
                        prepend-inner-icon="mdi-magnify"></v-text-field>
                </div>
                <div style="flex: 1 1 100%; overflow-y: auto;overflow-x: hidden; scrollbar-width: thin;">
                    <v-row dense>
                        <v-col cols="12" md="3" v-for="asm in FocusTaskListFilter">
                            <uc-teacher-focus-card :task="asm" />
                        </v-col>
                    </v-row>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['isOpen'],
    emits: ['update:isOpen'],
    data() {
        const items = [
            { id: 1, action: '15 min', headline: 'Brunch this weekend?', subtitle: `I'll be in your neighborhood doing errands this weekend. Do you want to hang out?`, title: 'Ali Connors' },
            { id: 2, action: '2 hr', headline: 'Summer BBQ', subtitle: `Wish I could come, but I'm out of town this weekend.`, title: 'me, Scrott, Jennifer' },
            { id: 3, action: '6 hr', headline: 'Oui oui', subtitle: 'Do you have Paris recommendations? Have you ever been?', title: 'Sandra Adams' },
            { id: 4, action: '12 hr', headline: 'Birthday gift', subtitle: 'Have any ideas about what we should get Heidi for her birthday?', title: 'Trevor Hansen' },
            { id: 5, action: '18hr', headline: 'Recipe to try', subtitle: 'We should eat this: Grate, Squash, Corn, and tomatillo Tacos.', title: 'Britta Holt' },
        ]
        return { items, DSKhoi: [], KhoiIDSelected: null, vueData, DSLop: [], LopNhomIDSelected: null, FocusTaskList: [], search: '' }
    },
    mounted() {
        console.log('eee')
        this.GET_EL_Teacher_GetMyClasses()
    },
    watch: {
        KhoiIDSelected: function (val) {
            if (val) {
                this.GET_EL_Teacher_Dashboard_Lop_Get_ByKhoiID()
            }
        },
        LopNhomIDSelected: function (val) {
            if (val) {
                this.GET_EL_Teacher_Dashboard_Assignment_Get_ByLopID()
            }
        }
    },
    computed: {
        FocusTaskListFilter: function () {

            return this.FocusTaskList.filter(item => item.Title.toLowerCase().includes(this.search.toLowerCase()))
        }
    },
    methods: {
        async GET_EL_Teacher_GetMyClasses() {
            let params = {
                HocKi: vueData.NienKhoaItem.HocKi
            }
            let response = await this.API_Promise('EL_Teacher_GetMyClasses', params)
            this.DSKhoi = response.reduce((result, item) => {
                let obj = result.find(i => i.KhoiID == item.KhoiID)
                if (!obj) {
                    result.push({ TenKhoi: 'Khối ' + item.KhoiID, KhoiID: item.KhoiID, CapID: item.CapID })
                }
                return result
            }, [])
            this.KhoiIDSelected = this.DSKhoi[0]?.KhoiID ?? null
        },
        async GET_EL_Teacher_Dashboard_Lop_Get_ByKhoiID() {
            let params = {
                KhoiID: this.KhoiIDSelected,
                NienKhoa: vueData.NienKhoa,
                HocKi: vueData.NienKhoaItem.HocKi
            }
            let response = await this.API_Promise('EL_Teacher_Dashboard_Lop_Get_ByKhoiID', params)
            this.DSLop = response
            this.LopNhomIDSelected = this.DSLop[0]?.LopNhomID ?? null
        },
        async GET_EL_Teacher_Dashboard_Assignment_Get_ByLopID() {
            let params = {
                LopID: this.LopNhomIDSelected,
                NienKhoa: vueData.NienKhoa,
                HocKi: vueData.NienKhoaItem.HocKi
            }
            let response = await this.API_Promise('EL_Teacher_Dashboard_Assignment_Get_ByLopID', params)
            this.FocusTaskList = response

        },
        API_Promise(url, params) {
            return new Promise((resolve, reject) => {
                ajaxCALL('lms/' + url, params, res => {
                    resolve(res.data)
                })
            })
        }
    }
}
</script>