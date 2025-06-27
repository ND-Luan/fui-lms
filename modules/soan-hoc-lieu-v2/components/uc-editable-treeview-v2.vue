<template>
	<div class="tree-container" @drop.prevent="onDrop" @dragover.prevent="onDragOver" @dragleave="onDragLeave">
		<!-- Đường kẻ chỉ báo vị trí thả -->
		<div v-if="isDragging" class="drop-indicator" :style="{ top: dropIndicatorPosition + 'px' }"></div>

		<div v-for="(node, index) in nodes" :key="node.NoiDungID" class="node-wrapper"
			:class="{ 'is-dragging': index === draggedIndex }" :draggable="true" @dragstart="onDragStart(index, $event)"
			@dragend="onDragEnd">
			<div class="node-item">
				<v-icon class="drag-handle">mdi-drag-vertical</v-icon>
				<v-icon class="node-icon">{{ getIcon(node.LoaiNoiDung) }}</v-icon>
				<span class="node-title">{{ node.TenNoiDung }}</span>
				<v-spacer></v-spacer>
				<div class="node-actions">
					<v-tooltip text="Sửa mục này">
						<template v-slot:activator="{ props }">
							<v-btn v-bind="props" icon size="x-small" variant="text" class="action-btn edit-btn"
								@click.stop="$emit('edit', node)">
								<v-icon>mdi-pencil-outline</v-icon>
							</v-btn>
						</template>
					</v-tooltip>
					<v-tooltip text="Thêm mục con">
						<template v-slot:activator="{ props }">
							<v-btn v-bind="props" icon size="x-small" variant="text" class="action-btn add-btn"
								@click.stop="$emit('add-new', node)">
								<v-icon>mdi-plus</v-icon>
							</v-btn>
						</template>
					</v-tooltip>
					<v-tooltip text="Xóa mục này">
						<template v-slot:activator="{ props }">
							<v-btn v-bind="props" icon size="x-small" variant="text" class="action-btn delete-btn"
								@click.stop="$emit('delete', node)">
								<v-icon>mdi-delete-outline</v-icon>
							</v-btn>
						</template>
					</v-tooltip>
				</div>
			</div>

			<!-- Gọi đệ quy -->
			<uc-editable-treeview-v2 v-if="node.children && node.children.length > 0" class="nested-tree"
				:nodes="node.children" :hoc-lieu-id="hocLieuId" @update="handleChildUpdate(node, $event)"
				@edit="(n) => $emit('edit', n)" @add-new="(n) => $emit('add-new', n)"
				@delete="(n) => $emit('delete', n)" />
		</div>
	</div>
</template>

<script>
	export default {
		name: 'uc-editable-treeview-v2',
		props: {
			nodes: { type: Array, required: true },
			hocLieuId: { type: Number, required: true }
		},
		emits: ['update', 'add-new', 'edit', 'delete'],
		data() {
			return {
				draggedIndex: null,
				dropIndicatorPosition: null,
				isDragging: false,
			}
		},
		methods: {
			getIcon(loai) {
				switch ((loai || '').toUpperCase()) {
					case 'CHUONG': return 'mdi-folder-outline';
					case 'BAI': return 'mdi-notebook-outline';
					case 'VIDEO': return 'mdi-play-circle-outline';
					case 'HTML': return 'mdi-language-html5';
					case 'TAILIEU': return 'mdi-file-document-outline';
					case 'INTERACTIVE': return 'mdi-xml';
					case 'QUIZ_SINGLE_CHOICE': return 'mdi-radiobox-marked';
					case 'QUIZ_MULTIPLE_CHOICE': return 'mdi-checkbox-multiple-marked';
					case 'QUIZ_ORDERING': return 'mdi-order-numeric-ascending';
					case 'QUIZ_MATCHING': return 'mdi-connection';
					case 'QUIZ_DRAG_DROP_CATEGORIZE': return 'mdi-drag';
					case 'QUIZ_FILL_IN_BLANK': return 'mdi-form-textbox';
					case 'QUIZ_CONNECTION': return 'mdi-lan-connect';
					case 'QUIZ_COMPOSITE' : return 'mdi-format-list-checks';
					default: return 'mdi-bookmark-outline';
				}
			},
			handleChildUpdate(parentNode, updatedChildren) {
				const parentInCurrentList = this.nodes.find(n => n.NoiDungID === parentNode.NoiDungID);
				if (parentInCurrentList) {
					parentInCurrentList.children = updatedChildren;
					this.$emit('update', this.nodes);
				}
			},
	
			onDragStart(index, event) {
				this.draggedIndex = index;
				this.isDragging = true;
				event.dataTransfer.effectAllowed = 'move';
				event.dataTransfer.setData('text/plain', index);
			},
	
			onDragOver(event) {
				event.preventDefault();
				const containerRect = this.$el.getBoundingClientRect();
				const directChildren = Array.from(this.$el.children).filter(el => el.classList.contains('node-wrapper'));
				let newDropPosition = null;
	
				for (let i = 0; i < directChildren.length; i++) {
					const child = directChildren[i];
					const rect = child.getBoundingClientRect();
					if (event.clientY < rect.top + rect.height / 2) {
						newDropPosition = child.offsetTop;
						break;
					}
				}
	
				if (newDropPosition === null) {
					newDropPosition = this.$el.offsetHeight;
				}
				this.dropIndicatorPosition = newDropPosition;
			},
	
			onDragLeave(event) {
				// Chỉ reset nếu chuột đã thực sự rời khỏi container
				if (!this.$el.contains(event.relatedTarget)) {
					this.dropIndicatorPosition = null;
				}
			},
	
			onDragEnd() {
				this.isDragging = false;
				this.draggedIndex = null;
				this.dropIndicatorPosition = null;
			},
	
			onDrop(event) {
				event.preventDefault();
				const draggedIndex = this.draggedIndex;
	
				// Tìm vị trí thả dựa trên vị trí của đường kẻ
				const children = Array.from(this.$el.children).filter(el => el.classList.contains('node-wrapper'));
				let dropIndex = children.length;
				for (let i = 0; i < children.length; i++) {
					if (this.dropIndicatorPosition <= children[i].offsetTop) {
						dropIndex = i;
						break;
					}
				}
	
				if (draggedIndex === null || draggedIndex === dropIndex) {
					// Không làm gì nếu thả vào chính nó
				} else {
					const newNodes = [...this.nodes];
					const itemToMove = newNodes.splice(draggedIndex, 1)[0];
	
					if (draggedIndex < dropIndex) {
						// Nếu kéo xuống, index thả thực tế bị giảm đi 1
						newNodes.splice(dropIndex - 1, 0, itemToMove);
					} else {
						newNodes.splice(dropIndex, 0, itemToMove);
					}
	
					this.$emit('update', newNodes);
				}
	
				this.onDragEnd(); // Reset trạng thái
			}
		}
	}
</script>

<style scoped>

</style>