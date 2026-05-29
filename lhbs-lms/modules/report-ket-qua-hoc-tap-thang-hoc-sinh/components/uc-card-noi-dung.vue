<template>
	<v-card class="custom-card mx-2 my-4 rounded-lg shadow-md transition-all duration-300"
		:class="{ 'hover:shadow-xl hover:-translate-y-1': enableHover }" elevation="0">
		<!-- Card Header -->
		<div class="card-header d-flex align-center gap-3 px-4 py-3 rounded-t-lg"
			:class="classHeader || 'bg-gradient-to-r from-blue-500 to-indigo-600'">
			<v-icon :color="iconColor" class="text-2xl" :icon="icon || 'mdi-text-box'" />
			<h3 class="title-text text-white font-semibold text-lg truncate">
				{{ title || 'Card Title' }}
			</h3>
		</div>

		<!-- Card Content -->
		<v-divider class="border-gray-200" />

		<v-card-text class="pa-0">
			<v-alert v-if="content" border="bottom" :border-color="color || 'blue'" class="rounded-md bg-gray-50">
				<!-- Main Content -->
				<div class="content-section">
					<div class="content-text text-gray-700 leading-relaxed" v-html="formattedText" />
				</div>
				<!-- Rating Section -->
				<div v-if="star > 0" class="rating-section d-flex justify-space-between align-center mt-2 pa-2">
					<span class="rating-label text-sm text-gray-600 font-medium " style="margin-bottom: 0">
						Sản phẩm học tập
					</span>
					<div class="stars-wrapper d-flex gap-1">
						<v-icon v-for="index in 5" :key="index" :icon="index <= star ? 'mdi-star' : 'mdi-star-outline'"
							:color="index <= star ? starColor : 'gray'"
							class="text-lg transition-colors duration-200" />
					</div>
				</div>
			</v-alert>
			<div v-else class="empty-state d-flex flex-column align-center justify-center py-6">
				<v-icon icon="mdi-information-outline" class="text-gray-400 text-3xl mb-2" />
				<span class="text-gray-500">No content available</span>
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
	            default: 'Card Title',
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
	            default: 'mdi-text-box',
	        },
	        color: {
	            type: String,
	            default: 'blue',
	        },
	        classHeader: {
	            type: String,
	            default: '',
	        },
	        iconColor: {
	            type: String,
	            default: 'white',
	        },
	        starColor: {
	            type: String,
	            default: '#F59E0B', // Amber-500 for a modern gold color
	        },
	        enableHover: {
	            type: Boolean,
	            default: true,
	        },
	    },
	    computed: {
	        formattedText() {
	            let string = '• ' + this.content.trim()
	            return string.replace(/\n/g, '<br> • ');
	        },
	    },
	}
</script>