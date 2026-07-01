<template>
	<div class="tree-container" @drop.stop.prevent="onDrop" @dragover.stop.prevent="onDragOver" @dragleave="onDragLeave"
		:class="{ 'drag-active': isDragging }">

		<div v-if="isDragging && dropType === 'between'" class="drop-indicator"
			:style="{ top: dropIndicatorPosition + 'px' }"></div>

		<div v-for="(node, index) in nodes" :key="node.NoiDungID" class="node-wrapper"
			:class="{ 'is-dragging': index === draggedIndex }" :draggable="true" :data-node-id="node.NoiDungID"
			@dragstart="onDragStart(index, $event)" @dragend="onDragEnd">

			<div class="node-item" :class="{ 'drop-moved': node._dropMovedAt }">
				<v-icon class="drag-handle">mdi-drag-vertical</v-icon>
				<v-icon class="node-icon">{{ getIcon(node.LoaiNoiDung) }}</v-icon>
				<span class="node-title">{{ node.TenNoiDung }}</span>
				<v-spacer />
				<div class="node-actions">
					<v-tooltip text="Preview"
						v-if="node.LoaiNoiDung !== 'CHUONG' && node.LoaiNoiDung !== 'BAI' && node.LoaiNoiDung !== 'NHOM_KY_NANG'">
						<template v-slot:activator="{ props }">
							<v-btn v-bind="props" icon size="x-small" variant="text" class="action-btn edit-btn"
								@click.stop="onRedirect(node)">
								<v-icon>mdi-eye-arrow-right-outline</v-icon>
							</v-btn>
						</template>
					</v-tooltip>

					<v-tooltip text="Sửa mục này">
						<template v-slot:activator="{ props }">
							<v-btn v-bind="props" icon size="x-small" variant="text" class="action-btn edit-btn"
								@click.stop="emitEdit(node)">
								<v-icon>mdi-pencil-outline</v-icon>
							</v-btn>
						</template>
					</v-tooltip>

					<v-tooltip text="Thêm mục con">
						<template v-slot:activator="{ props }">
							<v-btn v-bind="props" icon size="x-small" variant="text" class="action-btn add-btn"
								@click.stop="emitAddNew(node)">
								<v-icon>mdi-plus</v-icon>
							</v-btn>
						</template>
					</v-tooltip>

					<v-tooltip text="Xóa mục này">
						<template v-slot:activator="{ props }">
							<v-btn v-bind="props" icon size="x-small" variant="text" class="action-btn delete-btn"
								@click.stop="emitDelete(node)">
								<v-icon>mdi-delete-outline</v-icon>
							</v-btn>
						</template>
					</v-tooltip>
				</div>
			</div>

			<uc-editable-treeview-v2 v-if="node.children && node.children.length > 0 && !isNodeCollapsed(node)"
				class="nested-tree" :class="{ 'drag-active': isDragging }" :nodes="node.children" :parent-node="node"
				:hoc-lieu-id="hocLieuId" :collapsed-node-ids="collapsedNodeIds" :drag-state="dragState"
				@update="handleChildUpdate(node, $event)" @edit="(n) => $emit('edit', n)"
				@add-new="(n) => $emit('add-new', n)" @delete="(n) => $emit('delete', n)" />
		</div>
	</div>
</template>

<script>
	export default {
		name: 'uc-editable-treeview-v2',
		props: {
			nodes: { type: Array, required: true },
			hocLieuId: { type: Number, required: true },
			parentNode: { type: Object, default: null },
			collapsedNodeIds: { type: Object, default: () => ({}) },
			dragState: { type: Object, default: () => ({ info: null }) }
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
		computed: {
			activeDragInfo() {
				return this.dragState.info || this.dragInfo;
			}
		},
		methods: {
			onRedirect(node) {
				window.open(`/hoc-lieu-view-v2?hoclieuid=${this.hocLieuId}&noidungid=${node.NoiDungID}`)
			},
	
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
					case 'QUIZ_COMPOSITE': return 'mdi-format-list-checks';
					case 'SLIDE': return 'mdi-notebook-outline';
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

			getDirectNodeWrappers() {
				return Array.from(this.$el.children).filter(el => el.classList.contains('node-wrapper'));
			},

			getNodeByWrapper(wrapper) {
				const nodeId = Number(wrapper?.dataset?.nodeId);
				return this.nodes.find(node => Number(node.NoiDungID) === nodeId) || null;
			},

			isNodeCollapsed(node) {
				return !!this.collapsedNodeIds[node.NoiDungID];
			},

			markNodeMoved(node) {
				node._dropMovedAt = Date.now();
				window.setTimeout(() => {
					if (node._dropMovedAt) {
						delete node._dropMovedAt;
					}
				}, 900);
			},
	
			onDragStart(index, event) {
				event.stopPropagation();
	
				this.draggedIndex = index;
				const info = {
					node: this.nodes[index],
					index,
					parent: this.parentNode,
					sourceNodes: this.nodes
				};
				this.dragInfo = info;
				this.dragState.info = info;
				this.isDragging = true;
				event.dataTransfer.effectAllowed = 'move';
				event.dataTransfer.setData('text/plain', String(this.nodes[index].NoiDungID));
			},
	
			onDragOver(event) {
				event.preventDefault();
	
				this.detectDropZone(event);
	
				if (this.dropType === 'between') {
					const directChildren = this.getDirectNodeWrappers();
					let newDropPosition = null;
	
					for (let i = 0; i < directChildren.length; i++) {
						const child = directChildren[i]; const
							rect = child.getBoundingClientRect();
						if (event.clientY < rect.top + rect.height / 2) {
							newDropPosition = child.offsetTop; break;
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
				const nodeElements = this.getDirectNodeWrappers();
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
							dropType = 'on'; dropTarget = nodeEl;
						}
						else { dropType = 'between'; }
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
	
						// 🆕 Thêm class để phân biệt loại drop
						const targetNode = this.getNodeByWrapper(target);
						const draggedNode = this.activeDragInfo?.node;
	
						if (draggedNode && targetNode) {
							if (this.wouldCreateCircularReference(draggedNode, targetNode)) {
								nodeItem.classList.add('invalid-drop');
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
				this.dragInfo = null;
				this.dragState.info = null;
				this.dropIndicatorPosition = null;
				this.isDropOnNode = false;
				this.dropTargetNode = null;
				this.dropType = 'between';
				this.clearVisualFeedback();
			},
	
			onDrop(event) {
				event.preventDefault();
	
				if (!this.activeDragInfo) return;
	
				// 🆕 Kiểm tra invalid drop trước khi thực hiện
				if (this.isDropOnNode && this.dropTargetNode) {
					const targetNode = this.getNodeByWrapper(this.dropTargetNode);
	
					if (!targetNode || this.wouldCreateCircularReference(this.activeDragInfo.node, targetNode)) {
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
				const draggedNode = this.activeDragInfo.node;
				const targetNodeElement = this.dropTargetNode;
	
				const targetNode = this.getNodeByWrapper(targetNodeElement);
	
				if (!targetNode) return;
	
				// 🚨 VALIDATION: Tránh circular reference
				if (this.wouldCreateCircularReference(draggedNode, targetNode)) {
					console.log('❌ Cannot drop: Would create circular reference');
					// TODO: Show user notification
					return;
				}
	
				this.handleNormalChildDrop(draggedNode, targetNode);
			},
			
			findNodeInTree(nodeId) {
				const search = (nodes) => {
					for (const node of nodes) {
						if (node.NoiDungID === nodeId) return node;
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
				// Check BOTH directions for swap functionality
	
				// Case 1: targetNode is child of draggedNode (parent → child)
				const targetIsChild = draggedNode.children &&
					draggedNode.children.some(child => child.NoiDungID === targetNode.NoiDungID);
	
				// Case 2: draggedNode is child of targetNode (child → parent)
				const draggedIsChild = targetNode.children &&
					targetNode.children.some(child => child.NoiDungID === draggedNode.NoiDungID);
	
				return targetIsChild || draggedIsChild;
			},
	
			wouldCreateCircularReference(draggedNode, targetNode) {
				if (!draggedNode || !targetNode) return false;
				if (draggedNode.NoiDungID === targetNode.NoiDungID) return true;

				const containsNode = (nodes) => {
					for (const node of nodes || []) {
						if (node.NoiDungID === targetNode.NoiDungID) {
							return true;
						}
						if (containsNode(node.children)) {
							return true;
						}
					}
					return false;
				};
	
				return containsNode(draggedNode.children);
			},
	
	
			// 🆕 Xử lý kéo cha vào con (SWAP positions)
			handleParentToChildDrop(parentNode, childNode) {
				console.log(`🔄 Swapping "${parentNode.TenNoiDung}" with "${childNode.TenNoiDung}"`);
	
				// Bước 1: Lưu lại thông tin cần thiết
				const parentIndex = this.nodes.findIndex(n => n.NoiDungID === parentNode.NoiDungID);
				const childIndex = parentNode.children.findIndex(c => c.NoiDungID === childNode.NoiDungID);
				const otherChildren = parentNode.children.filter(c => c.NoiDungID !== childNode.NoiDungID);
	
				// Bước 2: Chuẩn bị childNode thành parent mới
				const newParent = {
					...childNode,
					ParentID: this.parentNode?.NoiDungID || null,
					ThuTu: parentIndex,
					children: [
						// ParentNode cũ thành con đầu tiên
						{
							...parentNode,
							ParentID: childNode.NoiDungID,
							ThuTu: 0,
							children: otherChildren.map((child, index) => ({
								...child,
								ThuTu: index
							}))
						},
						// Các con cũ của childNode (nếu có)
						...(childNode.children || []).map((child, index) => ({
							...child,
							ThuTu: index + 1
						}))
					]
				};
	
				// Bước 3: Thay thế trong nodes
				this.nodes.splice(parentIndex, 1, newParent);
	
				// Bước 4: Reorder
				this.reorderSiblings();
	
				this.$emit('update', this.nodes);
			},
	
			// 🔄 Logic cũ cho trường hợp bình thường
			handleNormalChildDrop(draggedNode, targetNode) {
				if (draggedNode.NoiDungID === targetNode.NoiDungID) return;
				const dragInfo = this.activeDragInfo;
				const sourceNodes = dragInfo.sourceNodes;

				if (sourceNodes === targetNode.children) return;

				if (!targetNode.children) {
					targetNode.children = [];
				}
	
				const sourceIndex = sourceNodes.findIndex(node => node.NoiDungID === draggedNode.NoiDungID);
				if (sourceIndex === -1) return;
				const [itemToMove] = sourceNodes.splice(sourceIndex, 1);

				const updatedNode = {
					...itemToMove,
					ParentID: targetNode.NoiDungID,
					ThuTu: targetNode.children.length
				};
				this.markNodeMoved(updatedNode);
	
				targetNode.children.push(updatedNode);
				this.reorderNodes(sourceNodes);
				this.reorderNodes(targetNode.children);
				this.$emit('update', this.nodes);
			},
	
			handleDropBetween() {
				const dragInfo = this.activeDragInfo;
				if (!dragInfo) return;

				const children = this.getDirectNodeWrappers();
				let dropIndex = children.length;
	
				for (let i = 0; i < children.length; i++) {
					if (this.dropIndicatorPosition <= children[i].offsetTop) {
						dropIndex = i; break;
					}
				}

				const sourceNodes = dragInfo.sourceNodes;
				const sourceIndex = sourceNodes.findIndex(node => node.NoiDungID === dragInfo.node.NoiDungID);
				if (sourceIndex === -1) return;

				const sameLevel = sourceNodes === this.nodes;
				if (sameLevel && (sourceIndex === dropIndex || sourceIndex + 1 === dropIndex)) return;

				const [itemToMove] = sourceNodes.splice(sourceIndex, 1);
				let insertIndex = dropIndex;
				if (sameLevel && sourceIndex < dropIndex) {
					insertIndex -= 1;
				}
				const movedNode = {
					...itemToMove,
					ParentID: this.parentNode?.NoiDungID || null
				};
				this.markNodeMoved(movedNode);
				this.nodes.splice(insertIndex, 0, movedNode);

				this.reorderNodes(sourceNodes);
				this.reorderNodes(this.nodes);
				this.$emit('update', this.nodes);
			},

			reorderNodes(nodes) {
				nodes.forEach((node, index) => {
					node.ThuTu = index;
				});
			},
	
			reorderSiblings() {
				this.reorderNodes(this.nodes);
			},
	
			clearVisualFeedback() {
				this.$el.querySelectorAll('.drop-target').forEach(el => {
					el.classList.remove('drop-target', 'parent-to-child', 'invalid-drop');
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