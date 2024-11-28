<template>
    <v-layout>
        <div v-if="isAdmin"></div>
        <div v-else style="
           background-image: url('/_cdn/lhbs-lms/bg_report_thang.png'); 
           background-repeat: no-repeat; 
           background-size: cover;
           background-position: center center; 
           width: 100%; 
           min-height: 100vh; 
           position: relative; 
           z-index: 1;
           background-attachment: fixed;
        ">
            <v-app-bar ref="appBar" elevation="4" dense class="pa-2">
                <template v-slot:image>
                    <v-img src="/_cdn/lhbs-lms/lhbs_logo.jpg" contain position="left" class="ma-1"></v-img>
                </template>

            </v-app-bar>

            <v-main class="position-relative d-flex justify-center">
                <div class="screen-devices">
                    <slot></slot>
                </div>
            </v-main>
        </div>
    </v-layout>
</template>
<script>
export default {
    props: {
        isAdmin: {
            type: Boolean,
            default: true,
        },
    },
    created() {

    },
    mounted() {
        document.getElementsByClassName('v-col')[0].style.padding = '0px'
        document.getElementsByClassName('v-row')[0].style.margin = '0px'

    },
    methods: {
        toggleDrawer() {

        }
    },
}
</script>
