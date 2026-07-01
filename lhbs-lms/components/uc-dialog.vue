<template>
	<v-dialog v-model="isShow" :width="width" :close-on-back="false" v-bind="$attrs" persistent>
		<v-card rounded="lg">
			<v-card-title class="d-flex align-center ga-2 pt-4 pb-2 px-4">
				<slot name="title" v-if="!title"></slot>
				<div v-else class="flex-grow-1">
					<p :class="classTitle" class="text-body-1 font-weight-bold mb-0">
						{{ title }}
					</p>
					<p class="text-caption mb-0" v-if="$slots.subTitle">
						<slot name="subTitle"></slot>
					</p>
				</div>
				<v-spacer v-if="!title"></v-spacer>
				<v-btn icon size="small" variant="text" @click="onClose" color="grey">
					<v-icon>mdi-close</v-icon>
				</v-btn>
			</v-card-title>
			<v-divider />
			<v-card-text class="pt-3 px-4 pb-4">
				<slot></slot>
			</v-card-text>
			<v-divider />
			<v-card-actions class="justify-end ga-2 pa-3">
				<v-btn variant="text" color="grey" @click="onClose">{{ closeText }}</v-btn>
				<v-btn v-if="isShowDoneBtn" color="primary" variant="flat" prepend-icon="mdi-content-save"
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