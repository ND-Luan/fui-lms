<template>
	<v-card class="custom-card ma-2" elevation="1" :class="{'card-hover': enableHover}">
		<!-- Card Header -->
		<div class="card-header">
			<div class="title-container">
				<v-icon :color="iconColor" class="title-icon" :icon="icon || 'mdi-text-box'" />
				<h3 class="title-text">{{ title }}</h3>
			</div>
		</div>

		<!-- Card Content -->
		<v-divider class="divider" />

		<v-card-text class="card-content">
			<!-- Main Content -->
			<div class="content-section">
				<div v-if="content" class="content-text" v-html="content" />
				<div v-else class="empty-state">
					<uc-empty />
				</div>
			</div>

			<!-- Rating Section -->
			<div v-if="star" class="rating-section">
				<div class="rating-badge">
					<span class="rating-label">Sản phẩm học tập</span>
					<div class="stars-wrapper">
						<v-icon v-for="index in Number(star)" :key="index" class="star-icon" icon="mdi-star"
							:color="starColor" />
					</div>
				</div>
			</div>
		</v-card-text>
	</v-card>
</template>

<script>
	export default {
	    name: 'CustomCard',
	
	    props: {
	        title: {
	            type: String,
	            default: '',
	        },
	        content: {
	            type: String,
	            default: '',
	        },
	        star: {
	            type: Number,
	            default: 0,
	            validator: (value) => value >= 0 && value <= 5,
	        },
	        icon: {
	            type: String,
	            default: '',
	        },
	        iconColor: {
	            type: String,
	            default: 'primary',
	        },
	        starColor: {
	            type: String,
	            default: '#FFD700', // Màu vàng đẹp hơn cho sao
	        },
	        enableHover: {
	            type: Boolean,
	            default: true,
	        },
	    },
	}
</script>