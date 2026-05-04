<template>
    <div v-if="item">
        <h2 class="text-h6 mb-4 d-flex align-center">
            <span>{{ item.TenNoiDung }}</span>
            <!-- <v-chip color="orange" class="ml-2" size="small" label>
                <v-icon start>mdi-send</v-icon>Giao bài
            </v-chip> -->
        </h2>
        <div v-if="item">
            <div v-for="nhom in item.children" :key="nhom.NoiDungID" class="lesson-box">
                <div class="lesson-header">
                    <span>{{ nhom.TenNoiDung }}</span>
                    <v-icon>mdi-send</v-icon>
                </div>
                <div v-for="(hoatDong, i) in nhom.children" :key="hoatDong.NoiDungID"
                    class="lesson-item d-flex justify-space-between" @click="handleClick(hoatDong)" style="cursor: pointer">
                    <div><strong>{{ i + 1 }}.</strong> <v-icon class="node-icon">{{ getIcon(hoatDong.LoaiNoiDung) }}</v-icon> {{ hoatDong.TenNoiDung }}</div>
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
        handleClick(hoatDong) { if (this.onHoatDongClick) this.onHoatDongClick(hoatDong); },

        getIcon(loai) {
				switch ((loai || '').toUpperCase()) {
					case 'CHUONG': return 'mdi-folder-outline';
					case 'BAI': return 'mdi-notebook-outline';
					case 'VIDEO': return 'mdi-play-circle-outline';
					case 'HTML': return 'mdi-language-html5';
					case 'TAILIEU': return 'mdi-file-document-outline';
					case 'INTERACTIVE': return 'mdi-xml';
					case 'QUIZ_SINGLE_CHOICE': return 'mdi-radiobox-marked';
					case 'QUIZ_MULTIPLE_CHOICE': return 'mdi-checkbox-multiple-marked';
					case 'QUIZ_ORDERING': return 'mdi-order-numeric-ascending';
					case 'QUIZ_MATCHING': return 'mdi-connection';
					case 'QUIZ_DRAG_DROP_CATEGORIZE': return 'mdi-drag';
					case 'QUIZ_FILL_IN_BLANK': return 'mdi-form-textbox';
					case 'QUIZ_CONNECTION': return 'mdi-lan-connect';
					case 'QUIZ_COMPOSITE' : return 'mdi-format-list-checks';
					case 'SLIDE' : return 'mdi-notebook-outline';
					default: return 'mdi-bookmark-outline';
				}
			},
    }
}
</script>
