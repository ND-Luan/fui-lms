<template>
	<v-card border class="ma-2">
		<p class="pa-2 font-weight-medium text-h6 border-e-sm border-b-sm text-primary" style="width: fit-content;">
			{{title}}</p>
		<v-card-text class=" d-flex align-center" :class="content ? ' justify-space-between' : 'justify-center'">
			<p v-html="content" v-if="content"></p>
			<uc-empty v-else />
			<div class="text-center" v-if="star">
				<p class="mb-2">Sản phẩm <br /> học tập</p>
				<v-icon v-for="i in Number(star)" color="#fde00d" size="small">mdi-star-four-points</v-icon>
			</div>
		</v-card-text>
	</v-card>
</template>

<script>
	export default {
	    props: {
	        title: {
	            type: String
	        },
	        content: {
	            type: String
	        },
	        star: {
	            type: Number
	        }
	    },
	    data() {
	        return {}
	    },
	    mounted() { },
	    computed: {},
	    watch: {},
	    methods: {},
	}
</script>