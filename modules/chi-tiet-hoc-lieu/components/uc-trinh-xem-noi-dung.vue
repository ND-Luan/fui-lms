<!-- === uc-trinh-xem-noi-dung (Nâng cấp đa dạng) === -->
<template>
    <div class="content-viewer-card">
        <div v-if="item && item.DataJson" class="content-body">
            <!-- 1. Loại HTML / Reading -->
            <div v-if="['HTML', 'READING'].includes(item.LoaiNoiDung)">
                <div v-html="item.DataJson.htmlContent"></div>
            </div>

            <!-- 2. Loại VIDEO -->
            <div v-else-if="item.LoaiNoiDung === 'VIDEO'" class="video-container">
                <iframe 
                    width="100%" 
                    height="100%" 
                    :src="embedVideoUrl" 
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    style="aspect-ratio: 16 / 9;">
                </iframe>
            </div>

            <!-- 3. Loại QUIZ_MULTIPLE_CHOICE -->
            <div v-else-if="item.LoaiNoiDung === 'QUIZ_MULTIPLE_CHOICE'">
                <p class="quiz-prompt">{{ item.DataJson.prompt }}</p>
                <v-radio-group>
                    <v-radio v-for="option in item.DataJson.options" :key="option.id" :label="option.text" :value="option.id"></v-radio>
                </v-radio-group>
            </div>

            <!-- 4. Loại QUIZ_MATCHING -->
            <div v-else-if="item.LoaiNoiDung === 'QUIZ_MATCHING'">
                <p class="quiz-prompt">{{ item.DataJson.prompt }}</p>
                <!-- Giao diện cho quiz matching sẽ phức tạp, tạm thời hiển thị JSON -->
                <pre>{{ item.DataJson }}</pre>
            </div>
            
            <!-- ... Thêm các v-else-if cho các loại quiz khác ... -->

            <!-- Trường hợp không xác định -->
            <div v-else>
                <p>Không hỗ trợ xem trước cho loại nội dung: <strong>{{ item.LoaiNoiDung }}</strong></p>
                <pre>{{ item.DataJson }}</pre>
            </div>
        </div>
        
        <!-- Trạng thái loading hoặc không có item -->
        <div v-else class="placeholder-text">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p class="mt-4">Đang tải nội dung...</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'uc-trinh-xem-noi-dung',
    props: {
        item: { type: Object, default: null }
    },
    computed: {
        embedVideoUrl() {
            if (!this.item || this.item.LoaiNoiDung !== 'VIDEO' || !this.item.DataJson) return '';
            const urlStr = this.item.DataJson.url || '';
            try {
                const url = new URL(urlStr);
                if (url.hostname.includes('youtube.com')) {
                    const videoId = url.searchParams.get('v');
                    return `https://www.youtube.com/embed/${videoId}`;
                }
                if(url.hostname === 'youtu.be'){
                    const videoId = url.pathname.slice(1);
                    return `https://www.youtube.com/embed/${videoId}`;
                }
            } catch (e) { /* Fallback */ }
            return urlStr;
        }
    }
}
</script>

<style scoped>
.content-viewer-card {
    padding: 24px;
}
.quiz-prompt {
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 16px;
}
/* ... các style khác ... */
</style>