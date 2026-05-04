<template>
	<Teleport to="body">
		<template v-if="active">
			<!-- Full-screen click blocker (prevents interacting with app behind tour) -->
			<div style="position:fixed;inset:0;z-index:9997;pointer-events:all;" @click.stop />

			<!-- Spotlight highlight box (box-shadow creates the dark backdrop) -->
			<div v-if="targetRect" :style="spotlightStyle" />

			<!-- Tooltip card -->
			<div :style="tooltipStyle">
				<div class="d-flex align-center ga-2 mb-2">
					<v-chip size="x-small" color="primary" variant="tonal">
						{{ step + 1 }} / {{ totalSteps }}
					</v-chip>
					<span class="text-subtitle-2 font-weight-bold" style="line-height:1.3;">{{ title }}</span>
				</div>
				<p class="text-body-2 text-medium-emphasis mb-3" style="line-height:1.5;">{{ body }}</p>
				<div class="d-flex align-center ga-2">
					<v-btn v-if="step > 0" size="small" variant="outlined" @click="$emit('prev')">
						<v-icon start size="14">mdi-chevron-left</v-icon>Trước
					</v-btn>
					<v-spacer />
					<v-btn size="small" variant="text" color="grey" @click="$emit('close')">Kết thúc</v-btn>
					<v-btn v-if="step < totalSteps - 1" size="small" color="primary" @click="$emit('next')">
						Tiếp<v-icon end size="14">mdi-chevron-right</v-icon>
					</v-btn>
					<v-btn v-else size="small" color="success" variant="tonal" @click="$emit('close')">
						<v-icon start size="14">mdi-check</v-icon>Xong
					</v-btn>
				</div>
			</div>
		</template>
	</Teleport>
</template>

<script>
	export default {
		name: 'uc-tour-overlay',
	props: {
		active: Boolean,
		step: { type: Number, default: 0 },
		totalSteps: { type: Number, default: 1 },
		title: String,
		body: String,
		targetRect: Object, // { top, left, width, height }
	},
	emits: ['prev', 'next', 'close'],
	computed: {
		spotlightStyle() {
			if (!this.targetRect) return {}
			const { top, left, width, height } = this.targetRect
			const p = 7
			return {
				position: 'fixed',
				top: (top - p) + 'px',
				left: (left - p) + 'px',
				width: (width + p * 2) + 'px',
				height: (height + p * 2) + 'px',
				borderRadius: '10px',
				border: '2.5px solid rgba(255,255,255,0.9)',
				boxShadow: '0 0 0 9999px rgba(0,0,0,0.50)',
				zIndex: 9998,
				pointerEvents: 'none',
				transition: 'top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease',
			}
		},
		tooltipStyle() {
			const ttW = 320
			const ttH = 155

			if (!this.targetRect) {
				// Centered fallback when no target element is visible
				return {
					position: 'fixed',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					width: ttW + 'px',
					zIndex: 9999,
					background: '#fff',
					borderRadius: '12px',
					padding: '16px 18px 12px',
					boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
				}
			}

			const { top, left, width, height } = this.targetRect
			const p = 7
			const vpH = window.innerHeight
			const vpW = window.innerWidth
			const spotBottom = top + height + p
			const spotTop = top - p

			const ttTop = (spotBottom + 14 + ttH < vpH)
				? (spotBottom + 14)
				: Math.max(8, spotTop - ttH - 14)

			const ttLeft = Math.min(Math.max(8, left - p), vpW - ttW - 8)

			return {
				position: 'fixed',
				top: ttTop + 'px',
				left: ttLeft + 'px',
				width: ttW + 'px',
				zIndex: 9999,
				background: '#fff',
				borderRadius: '12px',
				padding: '16px 18px 12px',
				boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
				transition: 'top 0.25s ease, left 0.25s ease',
			}
		},
	},
	}
</script>