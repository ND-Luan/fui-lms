<template>
<a-form :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol">
	<a-form-item label="Activity name">
		<a-input v-model:value="formState.name" />
	</a-form-item>
	<a-form-item label="Instant delivery">
		<a-switch v-model:checked="formState.delivery" />
	</a-form-item>
	<a-form-item label="Activity type">
		<a-checkbox-group v-model:value="formState.type">
			<a-checkbox value="1" name="type">Online</a-checkbox>
			<a-checkbox value="2" name="type">Promotion</a-checkbox>
			<a-checkbox value="3" name="type">Offline</a-checkbox>
		</a-checkbox-group>
	</a-form-item>
	<a-form-item label="Resources">
		<a-radio-group v-model:value="formState.resource">
			<a-radio value="1">Sponsor</a-radio>
			<a-radio value="2">Venue</a-radio>
		</a-radio-group>
	</a-form-item>
	<a-form-item label="Activity form">
		<a-textarea v-model:value="formState.desc" />
	</a-form-item>
	<a-form-item :wrapper-col="{ span: 14, offset: 4 }">
		<a-button type="primary" @click="onSubmit">Create</a-button>
		<a-button style="margin-left: 10px">Cancel</a-button>
	</a-form-item>
</a-form>
<a-table :dataSource="dataSource" :columns="columns" />
</template>

<script>
	export default {
		props: [],
		data() {
			return {
			formState: {
			name: '',
			delivery: false,
			type: [],
			resource: '',
			desc: ''
			},
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
			dataSource: [],
			
			columns: [
				{
				title: 'Activity name',
				dataIndex: 'name',
				key: 'name',
				},
				{
				title: 'Instant delivery',
				dataIndex: 'delivery',
				key: 'delivery',
				},
				{
				title: 'Activity type',
				dataIndex: 'type',
				key: 'type',
				},
				{
				title: 'Resources',
				dataIndex: 'resource',
				key: 'resource',
				},
				{
				title: 'Activity form',
				dataIndex: 'desc',
				key: 'desc',
				},
			],
			}
		},
		mounted() {
			this.onLoadDS()
		},
		computed: {},
		watch: {},
		methods: {
			onLoadDS() {
					ajaxCALL('lms/Activities_Get',{},
							res => {
								this.dataSource = res.data
							}
						)
			}

		},
	}
</script>