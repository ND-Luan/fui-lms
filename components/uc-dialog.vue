<template>
	<v-dialog v-model="isShow" :width="width" :close-on-back="false" v-bind="$attrs">
		<v-card>
			<v-card-title class="d-flex">
				<slot name="title" v-if="!title"></slot>
				<div v-else>
					<p :class="classTitle">
						{{ title }}
					</p>
					<p class="text-caption">
						<slot name="subTitle"></slot>
					</p>
				</div>
				<v-spacer></v-spacer>
				<v-icon @click="onClose" color="grey">mdi-close</v-icon>
			</v-card-title>
			<v-card-text style="padding: 16px 24px 16px">
				<slot></slot>
			</v-card-text>
			<v-card-actions>
				<v-btn text @click="onClose" prepend-icon="mdi-close" variant="plain">{{ closeText }}</v-btn>
				<v-btn v-if="isShowDoneBtn" text color="primary" variant="elevated" prepend-icon="mdi-content-save"
					@click="handleSubmit">
					{{ doneText }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>
<script>
	export default {
	    props: {
	        modelValue: {
	            type: Boolean,
	            required: true,
	        },
	        title: {
	            type: String,
	            default: '',
	        },
	        doneText: {
	            type: String,
	            default: 'OK',
	        },
	        closeText: {
	            type: String,
	            default: 'Đóng',
	        },
	        onSubmit: {
	            type: Function,
	        },
	        classTitle: {
	            type: String,
	            default: 'primary-text',
	        },
	        width: {
	            default: 500,
	        },
	        isShowDoneBtn: {
	            type: Boolean,
	            default: true,
	        },
	    },
	    data() {
	        return {
	            isShow: false
	        }
	    },
	    watch: {
	        modelValue: function (modelValue) {
	            this.isShow = modelValue
	        },
	        isShow: function (isShow) {
	            this.$emit('update:modelValue', isShow)
	        },
	    },
	    methods: {
	        onClose() {
	            this.$emit('update:modelValue', false)
	        },
	        handleSubmit(e) {
	            this.$emit('onSubmit', e)
	        },
	    },
	}
</script>