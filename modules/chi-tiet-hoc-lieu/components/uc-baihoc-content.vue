<template>
    <div v-if="item">
        <h2 class="text-h6 mb-4 d-flex align-center">
            <span>{{ item.TenNoiDung }}</span>
            <v-chip color="orange" class="ml-2" size="small" label>
                <v-icon start>mdi-send</v-icon>Giao bài
            </v-chip>
        </h2>
        <div v-if="item">
            <div v-for="nhom in item.children" :key="nhom.NoiDungID" class="lesson-box">
                <div class="lesson-header">
                    <span>{{ nhom.TenNoiDung }}</span>
                    <v-icon>mdi-send</v-icon>
                </div>
                <div v-for="(hoatDong, i) in nhom.children" :key="hoatDong.NoiDungID"
                    class="lesson-item d-flex justify-space-between" @click="handleClick(hoatDong)" style="cursor: pointer">
                    <div><strong>{{ i + 1 }}.</strong> {{ hoatDong.TenNoiDung }}</div>
                    <v-icon color="orange">mdi-send-circle-outline</v-icon>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
    name: 'uc-baihoc-content',
    props: {
        item: { type: Object, default: null },
        onHoatDongClick: { type: Function, default: () => {} }
    },
    methods: {
        handleClick(hoatDong) { if (this.onHoatDongClick) this.onHoatDongClick(hoatDong); }
    }
}
</script>
<style scoped>
.lesson-box {
border-radius: 12px;
overflow: hidden;
box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
margin-bottom: 16px;
}

/* Header của mỗi nhóm */
.lesson-header {
background-color: #e0f3ff;
padding: 12px 16px;
display: flex;
justify-content: space-between;
align-items: center;
font-weight: 600;
font-size: 15px;
border-top-left-radius: 12px;
border-top-right-radius: 12px;
border-bottom: 1px solid #cbe8f9;
}

/* Dòng nội dung */
.lesson-item {
background-color: white;
padding: 12px 16px;
border-bottom: 1px solid #cbe8f9;
transition: background-color 0.2s;
}

/* Hover xanh dịu */
.lesson-item:hover {
background-color: #f1faff;
}

/* Bỏ border dưới dòng cuối cùng của nhóm */
.lesson-box .lesson-item:last-child {
border-bottom: none;
}
</style>