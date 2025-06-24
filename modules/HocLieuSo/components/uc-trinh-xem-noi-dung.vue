<!-- === uc-trinh-xem-noi-dung (Hiển thị HTML trong Iframe) === -->
<template>
	<div class="content-viewer-card">
		<template v-if="item">
			<h3 class="content-title">{{ item.TenHocLieu }}</h3>
			<div class="content-body">
                
				<div v-if="item.LoaiHocLieu === 'VIDEO'" class="video-container">
					<iframe 
                        width="100%" 
                        height="450" 
                        :src="embedVideoUrl" 
                        frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen>
                    </iframe>
				</div>

				<!-- [SỬA ĐỔI] Gộp 'HTML' và 'INTERACTIVE' vào cùng một khối xử lý bằng Iframe -->
				<div v-else-if="['HTML', 'INTERACTIVE'].includes(item.LoaiHocLieu)" class="interactive-container">
                    <iframe 
                        :srcdoc="item.NoiDung" 
                        frameborder="0"
                        scrolling="yes"
                        width="100%"
                        style="min-height: 80vh; border-radius: 8px;"
                    ></iframe>
                </div>

				<div v-else-if="item.LoaiHocLieu === 'TAILIEU'">
					<a :href="item.NoiDung" target="_blank" class="download-button">
                        <v-icon left>mdi-download</v-icon>
                        Tải về tài liệu: {{ item.TenHocLieu }}
                    </a>
				</div>
                
				<div v-else-if="['CHUONG', 'BAI'].includes(item.LoaiHocLieu)" class="placeholder-text">
					<p><strong>{{ item.TenHocLieu }}</strong></p>
					<p v-if="item.NoiDung">{{ item.NoiDung }}</p>
					<p class="instruction">Vui lòng chọn một nội dung cụ thể trong cây thư mục để xem chi tiết.</p>
				</div>
                
			</div>
		</template>
		<div v-else class="placeholder-text">
			<p>Vui lòng chọn một mục từ cây học liệu để xem nội dung.</p>
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
        if (!this.item || this.item.LoaiHocLieu !== 'VIDEO' || !this.item.NoiDung) return '';
        try {
            const url = new URL(this.item.NoiDung);
            if (url.hostname.includes('youtube.com')) {
                const videoId = url.searchParams.get('v');
                return `https://www.youtube.com/embed/${videoId}`;
            }
            if(url.hostname === 'youtu.be'){
                const videoId = url.pathname.slice(1);
                return `https://www.youtube.com/embed/${videoId}`;
            }
        } catch (e) { /* Fallback */ }
        return this.item.NoiDung;
    }
  }
}
</script>