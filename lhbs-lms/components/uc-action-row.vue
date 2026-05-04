<template>
	<div class="d-flex" style="gap:8px">
		<v-btn v-if="isEditItem" variant="text" icon="" color="success" @click="editItem" size="small">
			<v-icon>mdi-square-edit-outline</v-icon>
			<v-tooltip activator="parent" location="top">Sửa</v-tooltip>
		</v-btn>
		<v-btn v-if="isDeleteItem" variant="text" icon="" color="red" @click="deleteItem" size="small">
			<v-icon>mdi-delete-outline</v-icon>
			<v-tooltip activator="parent" location="top">Xóa</v-tooltip>
		</v-btn>
	</div>
</template>
<script>
	export default {
    props: {
        onEditItem: {
            type: Function,
            default: null
        },
        onDeleteItem: {
            type: Function,
            default: null
        },
        isEditItem: {
            type: Boolean,
            default: true
        },
        isDeleteItem: {
            type: Boolean,
            default: true
        }
    },
    methods: {
        editItem(e) {
            this.$emit('onEditItem', e)
        },
        deleteItem(e) {
            this.$emit('onDeleteItem', e)
        }
    }
}
</script>