<template>
	<div class="lh-container-wrapper" style="min-height: 100dvh; position: relative;">
		<div v-if="canGoBack" style="position: absolute; top: 16px; left: 16px; z-index: 20;">
			<v-btn icon="mdi-arrow-left" variant="text" color="white" @click="goBack">
				<v-tooltip activator="parent" location="bottom">Quay lại</v-tooltip>
			</v-btn>
		</div>

		<div class="lh-container">
			<h1 class="lh-title">HỌC LIỆU SỐ</h1>
			<p class="lh-subtitle">Hệ thống tài liệu và học liệu trực tuyến</p>

			<div class="lh-levels-grid">
				<div class="lh-level-card" @click="onRedirect('/kham-pha?capid=1')">
					<span class="lh-level-icon">🎒</span>
					<h2 class="lh-level-title">Tiểu học</h2>
					<p class="lh-level-subtitle">Cấp 1</p>
					<p class="lh-level-description">Dành cho các khối từ 1 đến 5</p>
					<span class="lh-level-arrow">Khám phá</span>
				</div>

				<div class="lh-level-card" @click="onRedirect('/kham-pha?capid=2')">
					<span class="lh-level-icon">📚</span>
					<h2 class="lh-level-title">Trung học cơ sở</h2>
					<p class="lh-level-subtitle">Cấp 2</p>
					<p class="lh-level-description">Dành cho các khối từ 6 đến 9</p>
					<span class="lh-level-arrow">Khám phá</span>
				</div>

				<div class="lh-level-card" @click="onRedirect('/kham-pha?capid=3')">
					<span class="lh-level-icon">🎓</span>
					<h2 class="lh-level-title">Trung học phổ thông</h2>
					<p class="lh-level-subtitle">Cấp 3</p>
					<p class="lh-level-description">Dành cho các khối từ 10 đến 12</p>
					<span class="lh-level-arrow">Khám phá</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef'],
	data() {
		return {
			vueData,
			canGoBack: false
		}
	},
	mounted() {
		this.canGoBack = window.history.length > 1
	},
	methods: {
		goBack() {
			window.history.back()
		},
		onRedirect(url) {
			if (typeof redirect === 'function') {
				redirect(url)
			} else {
				window.location.href = url
			}
		}
	}
	}
</script>