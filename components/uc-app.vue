<template>
    <div>
        <div v-if="isAdmin"></div>
        <div v-else style="
           background-image: url('/_cdn/lhbs-lms/bg_report_thang.png'); 
           background-repeat: no-repeat; 
           background-size: cover; 
           width: 100%; 
           height: 100vh; 
           position: relative; 
           z-index: 1;
        ">
            <img src="/_cdn/lhbs-lms/bg_report_thang_2.png" style="
                width: 100%; 
                height: 60%;
                mix-blend-mode: multiply;
                position: absolute;
                bottom: 0;
                z-index: 1;
            " />
            <div class="pa-4" style="height: 40%; width:100%; ">
                <slot name="title">
                </slot>
            </div>
            <div class="pa-4" style="height: 60%; width:100%; z-index: 2;">
                <div class="mt-4">
                    <slot name="detail">
                    </slot>
                </div>
            </div>
        </div>
        <!-- <div style="
            background-image: url(''); background-repeat: no-repeat; background-size: cover; background-position: center; width: 100%; height: 100vh; position: absolute; top: 0; left: 0; z-index: 2;
        ">
            <slot></slot>
        </div> -->
    </div>
</template>
<script>
export default {
    props: {
        isAdmin: {
            type: Boolean,
            default: true,
        },
    },
    methods: {},
}
</script>
