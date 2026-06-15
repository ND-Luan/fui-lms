<template>
	<div class="tree-container" @drop.prevent="onDrop" @dragover.prevent="onDragOver" @dragleave="onDragLeave"
		:class="{ 'drag-active': isDragging }">

		<div v-if="isDragging && dropType === 'between'" class="drop-indicator"
			:style="{ top: dropIndicatorPosition + 'px' }"></div>

		<div v-for="(node, index) in nodes" :key="node.NodeID" class="node-wrapper"
			:class="{ 'is-dragging': index === draggedIndex }" :draggable="true" :data-node-id="node.NodeID"
			@dragstart="onDragStart(index, $event)" @dragend="onDragEnd">

			<div class="node-item">
				<v-icon class="drag-handle">mdi-drag-vertical</v-icon>
				<v-icon class="node-icon" :color="node.NodeType === 'CHAPTER' ? 'primary' : 'teal'">
					{{ node.NodeType === 'CHAPTER' ? 'mdi-folder-outline' : 'mdi-notebook-outline' }}
				</v-icon>
				<span class="node-title font-weight-medium">{{ node.Title }}</span>
				<v-spacer />
				<div class="node-actions">
					<v-tooltip :text="$i18n.locale == 'en' ? 'Rename' : 'Sửa tên'">
						<template v-slot:activator="{ props }">
							<v-btn v-bind="props" icon size="x-small" variant="text" class="action-btn edit-btn"
								@click.stop="emitEdit(node)">
								<v-icon>mdi-pencil-outline</v-icon>
							</v-btn>
						</template>
					</v-tooltip>

					<v-tooltip :text="$i18n.locale == 'en' ? 'Add sub-item' : 'Thêm mục con'"
						v-if="node.NodeType === 'CHAPTER'">
						<template v-slot:activator="{ props }">
							<v-btn v-bind="props" icon size="x-small" variant="text" class="action-btn add-btn"
								@click.stop="emitAddNew(node)">
								<v-icon>mdi-plus</v-icon>
							</v-btn>
						</template>
					</v-tooltip>

					<v-tooltip :text="$i18n.locale == 'en' ? 'Delete' : 'Xóa'">
						<template v-slot:activator="{ props }">
							<v-btn v-bind="props" icon size="x-small" variant="text" class="action-btn delete-btn"
								@click.stop="emitDelete(node)">
								<v-icon color="error">mdi-delete-outline</v-icon>
							</v-btn>
						</template>
					</v-tooltip>
				</div>
			</div>

			<uc-editable-treeview-syllabus v-if="node.children && node.children.length > 0" class="nested-tree"
				:class="{ 'drag-active': isDragging }" :nodes="node.children" :parent-node="node"
				:syllabus-id="syllabusId" @update="handleChildUpdate(node, $event)" @edit="(n) => $emit('edit', n)"
				@add-new="(n) => $emit('add-new', n)" @delete="(n) => $emit('delete', n)" />
		</div>
	</div>
</template>

<script>
	export default {
		name: 'uc-editable-treeview-syllabus',
		props: {
			nodes: { type: Array, required: true },
			syllabusId: { type: Number, required: true },
			parentNode: { type: Object, default: null }
		},
		emits: ['update', 'add-new', 'edit', 'delete'],
		data() {
			return {
				draggedIndex: null,
				dropIndicatorPosition: null,
				isDragging: false,
				dragInfo: null,
				isDropOnNode: false,
				dropTargetNode: null,
				dropType: 'between'
			}
		},
		methods: {
			handleChildUpdate(parentNode, updatedChildren) {
				const parentInCurrentList = this.nodes.find(n => n.NodeID === parentNode.NodeID);
				if (parentInCurrentList) {
					parentInCurrentList.children = updatedChildren;
					this.$emit('update', this.nodes);
				}
			},
	
			onDragStart(index, event) {
				event.stopPropagation();
	
				this.draggedIndex = index;
				this.dragInfo = {
					node: this.nodes[index],
					index,
					parent: this.parentNode
				}
				this.isDragging = true;
				event.dataTransfer.effectAllowed = 'move';
				event.dataTransfer.setData('text/plain', index);
			},
	
			onDragOver(event) {
				event.preventDefault();
	
				this.detectDropZone(event);
	
				if (this.dropType === 'between') {
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
				}
				else {
					this.dropIndicatorPosition = null;
				}
			},
			detectDropZone(event) {
				const nodeElements = this.$el.querySelectorAll('.node-wrapper');
				let dropTarget = null;
				let dropType = 'between';
				nodeElements.forEach(nodeEl => {
					const nodeItem = nodeEl.querySelector('.node-item');
					if (!nodeItem) return;
	
					const rect = nodeItem.getBoundingClientRect();
					const nodeY = event.clientY;
	
					if (nodeY >= rect.top && nodeY <= rect.bottom) {
						const relativeY = (nodeY - rect.top) / rect.height;
						if (relativeY >= 0.3 && relativeY <= 0.7) {
							dropType = 'on'; 
							dropTarget = nodeEl;
						}
						else { 
							dropType = 'between'; 
						}
					}
				});
				this.dropTargetNode = dropTarget;
				this.dropType = dropType;
				this.isDropOnNode = (dropType === 'on');
				this.updateVisualFeedback(dropTarget, dropType);
			},
	
			updateVisualFeedback(target, type) {
				this.$el.querySelectorAll('.drop-target').forEach(el => {
					el.classList.remove('drop-target', 'parent-to-child', 'invalid-drop');
				});
	
				if (target && type === 'on') {
					const nodeItem = target.querySelector('.node-item');
					if (nodeItem) {
						nodeItem.classList.add('drop-target');
	
						const targetNodeIndex = Array.from(this.$el.querySelectorAll('.node-wrapper')).indexOf(target);
						const targetNode = this.nodes[targetNodeIndex];
						const draggedNode = this.dragInfo?.node;
	
						if (draggedNode && targetNode) {
							if (this.wouldCreateCircularReference(draggedNode, targetNode)) {
								nodeItem.classList.add('invalid-drop');
							} else if (this.isParentChildRelation(draggedNode, targetNode)) {
								nodeItem.classList.add('parent-to-child');
							}
						}
					}
				}
			},
	
			onDragLeave(event) {
				if (!this.$el.contains(event.relatedTarget)) {
					this.dropIndicatorPosition = null;
					this.clearVisualFeedback();
				}
			},
	
			onDragEnd() {
				this.isDragging = false;
				this.draggedIndex = null;
				this.dropIndicatorPosition = null;
				this.isDropOnNode = false;
				this.dropTargetNode = null;
				this.dropType = 'between';
				this.clearVisualFeedback();
			},
	
			onDrop(event) {
				event.preventDefault();
	
				if (!this.dragInfo) return;
	
				if (this.isDropOnNode && this.dropTargetNode) {
					const targetNodeIndex = Array.from(this.$el.querySelectorAll('.node-wrapper')).indexOf(this.dropTargetNode);
					const targetNode = this.nodes[targetNodeIndex];
	
					if (this.wouldCreateCircularReference(this.dragInfo.node, targetNode)) {
						console.log('❌ Drop cancelled - Would create circular reference');
						this.onDragEnd();
						return;
					}
	
					this.handleDropAsChild();
				} else {
					this.handleDropBetween();
				}
	
				this.onDragEnd();
			},
	
			handleDropAsChild() {
				const draggedNode = this.dragInfo.node;
				const targetNodeElement = this.dropTargetNode;
	
				const targetNodeIndex = Array.from(this.$el.querySelectorAll('.node-wrapper')).indexOf(targetNodeElement);
				const targetNode = this.nodes[targetNodeIndex];
	
				if (!targetNode) return;
	
				if (this.wouldCreateCircularReference(draggedNode, targetNode)) {
					console.log('❌ Cannot drop: Would create circular reference');
					return;
				}
	
				if (this.isParentChildRelation(draggedNode, targetNode)) {
					this.handleParentToChildDrop(draggedNode, targetNode);
				} else {
					this.handleNormalChildDrop(draggedNode, targetNode);
				}
			},
			
			findNodeInTree(nodeId) {
				const search = (nodes) => {
					for (const node of nodes) {
						if (node.NodeID === nodeId) return node;
						if (node.children && node.children.length > 0) {
							const found = search(node.children);
							if (found) return found;
						}
					}
					return null;
				};
				return search(this.nodes);
			},
	
			isParentChildRelation(draggedNode, targetNode) {
				const targetIsChild = draggedNode.children &&
					draggedNode.children.some(child => child.NodeID === targetNode.NodeID);
	
				const draggedIsChild = targetNode.children &&
					targetNode.children.some(child => child.NodeID === draggedNode.NodeID);
	
				return targetIsChild || draggedIsChild;
			},
	
			wouldCreateCircularReference(draggedNode, targetNode) {
				const isAncestor = (potentialChild, ancestorId) => {
					let currentParentId = potentialChild.ParentID;
	
					while (currentParentId) {
						if (currentParentId === ancestorId) {
							return true;
						}
						const parentNode = this.findNodeInTree(currentParentId);
						currentParentId = parentNode?.ParentID;
					}
					return false;
				};
	
				return isAncestor(targetNode, draggedNode.NodeID);
			},
	
			handleParentToChildDrop(parentNode, childNode) {
				console.log(`🔄 Swapping "${parentNode.Title}" with "${childNode.Title}"`);
	
				const parentIndex = this.nodes.findIndex(n => n.NodeID === parentNode.NodeID);
				const childIndex = parentNode.children.findIndex(c => c.NodeID === childNode.NodeID);
				const otherChildren = parentNode.children.filter(c => c.NodeID !== childNode.NodeID);
	
				const newParent = {
					...childNode,
					ParentID: this.parentNode?.NodeID || null,
					SortOrder: parentIndex * 10,
					children: [
						{
							...parentNode,
							ParentID: childNode.NodeID,
							SortOrder: 0,
							children: otherChildren.map((child, index) => ({
								...child,
								SortOrder: index * 10
							}))
						},
						...(childNode.children || []).map((child, index) => ({
							...child,
							SortOrder: (index + 1) * 10
						}))
					]
				};
	
				this.nodes.splice(parentIndex, 1, newParent);
				this.reorderSiblings();
				this.$emit('update', this.nodes);
			},
	
			handleNormalChildDrop(draggedNode, targetNode) {
				if (!targetNode.children) {
					targetNode.children = [];
				}
	
				const updatedNode = {
					...draggedNode,
					ParentID: targetNode.NodeID,
					SortOrder: targetNode.children.length * 10
				};
	
				targetNode.children.push(updatedNode);
	
				const draggedIndex = this.dragInfo.index;
				this.nodes.splice(draggedIndex, 1);
	
				this.reorderSiblings();
				this.$emit('update', this.nodes);
			},
	
			handleDropBetween() {
				const draggedIndex = this.draggedIndex;
				const children = Array.from(this.$el.children).filter(el => el.classList.contains('node-wrapper'));
				let dropIndex = children.length;
	
				for (let i = 0; i < children.length; i++) {
					if (this.dropIndicatorPosition <= children[i].offsetTop) {
						dropIndex = i; 
						break;
					}
				} 
				if (draggedIndex === null || draggedIndex === dropIndex) return;
				const newNodes = [...this.nodes];
				const itemToMove = newNodes.splice(draggedIndex, 1)[0];
				if (draggedIndex < dropIndex) { 
					newNodes.splice(dropIndex - 1, 0, itemToMove); 
				} else {
					newNodes.splice(dropIndex, 0, itemToMove);
				}
				newNodes.forEach((node, index) => {
					node.SortOrder = index * 10;
				});
	
				this.$emit('update', newNodes);
			},
	
			reorderSiblings() {
				this.nodes.forEach((node, index) => {
					node.SortOrder = index * 10;
				});
			},
	
			clearVisualFeedback() {
				this.$el.querySelectorAll('.drop-target').forEach(el => {
					el.classList.remove('drop-target');
				});
			},
	
			emitAddNew(node) {
				this.$emit('add-new', node);
			},
	
			emitEdit(node) {
				this.$emit('edit', node);
			},
	
			emitDelete(node) {
				this.$emit('delete', node);
			}
		}
	}
</script>