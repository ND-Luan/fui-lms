<template>
	<!-- Thanh công cụ -->
	<v-toolbar density="compact" class="toolbar" flat>
		<v-btn icon @click="zoomIn">
			<v-icon>mdi-magnify-plus-outline</v-icon>
		</v-btn>
		<v-btn icon @click="zoomOut">
			<v-icon>mdi-magnify-minus-outline</v-icon>
		</v-btn>
		<v-btn icon @click="resetZoom">
			<v-icon>mdi-refresh</v-icon>
		</v-btn>
	</v-toolbar>
	<div class="zoom-image">
		<!-- Hình ảnh -->
		<v-img :src="parsedImg" :style="{ transform: 'scale(' + zoomLevel + ')' }" class="image" />

		
	</div>
</template>

<script>
	export default {
  name: "ZoomImage",
  props: {
    img: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      zoomLevel: 1
    }
  },
  computed: {
    parsedImg() {
      return this.img ? this.img.replace(/^'|'$/g, "") : ""
    }
  },
  methods: {
    zoomIn() {
      this.zoomLevel += 0.2
    },
    zoomOut() {
      if (this.zoomLevel > 0.4) this.zoomLevel -= 0.2
    },
    resetZoom() {
      this.zoomLevel = 1
    }
  }
}
</script>

<style >
	.zoom-image {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.image {
		max-width: 500px;
		transition: transform 0.2s ease;
		border: 1px solid #ccc;
		border-radius: 8px;
	}

	.toolbar {
		margin-top: 8px;
		border-radius: 6px;
		background: #f5f5f5;
		justify-content: center;
	}
</style>