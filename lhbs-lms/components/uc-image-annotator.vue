<template>
	<v-dialog :model-value="visible" @update:model-value="closeDialog" fullscreen hide-overlay
		transition="dialog-bottom-transition" scrim="false" persistent>
		<v-card>
			<v-toolbar dark color="primary" density="compact">
				<v-btn icon dark @click="closeDialog">
					<v-icon>mdi-close</v-icon>
				</v-btn>
				<v-toolbar-title>Chấm bài & Chú thích</v-toolbar-title>
				<v-spacer></v-spacer>

				<!-- Thanh công cụ chính -->
				<v-btn-toggle v-model="tool" mandatory density="compact" variant="outlined" divided>
					<v-btn value="text" title="Thêm nhận xét">
						<v-icon>mdi-format-text</v-icon>
					</v-btn>
					<v-btn value="correct" title="Đánh dấu Đúng">
						<v-icon color="success">mdi-check-circle-outline</v-icon>
					</v-btn>
					<v-btn value="incorrect" title="Đánh dấu Sai">
						<v-icon color="error">mdi-close-circle-outline</v-icon>
					</v-btn>
				</v-btn-toggle>

				<v-divider vertical class="mx-2"></v-divider>

				<!-- Nút Xóa (chỉ active khi có đối tượng được chọn) -->
				<v-btn @click="deleteSelectedObject" :disabled="!activeObject" icon title="Xóa đối tượng đã chọn">
					<v-icon color="red">mdi-delete-outline</v-icon>
				</v-btn>

				<v-btn class="ml-4" @click="saveAndUpload" variant="tonal" :loading="isSaving">
					Lưu và Đóng
				</v-btn>
			</v-toolbar>

			<!-- THANH CÔNG CỤ PHỤ (chỉ hiện khi đang chọn Text) -->
			<v-toolbar v-if="activeObject && activeObject.type === 'i-text'" density="compact" color="grey-lighten-3">
				<v-select :items="['Arial', 'Times New Roman', 'Courier New']" v-model="activeObjectProps.fontFamily"
					@update:model-value="updateActiveObject" density="compact" hide-details variant="solo"
					style="max-width: 150px;"></v-select>
				<v-text-field type="number" v-model.number="activeObjectProps.fontSize"
					@update:model-value="updateActiveObject" density="compact" hide-details variant="solo"
					style="max-width: 80px;"></v-text-field>
				<v-btn icon @click="toggleTextStyle('fontWeight', 'bold')">
					<v-icon :color="activeObjectProps.fontWeight === 'bold' ? 'primary' : ''">mdi-format-bold</v-icon>
				</v-btn>
				<v-btn icon @click="toggleTextStyle('fontStyle', 'italic')">
					<v-icon :color="activeObjectProps.fontStyle === 'italic' ? 'primary' : ''">mdi-format-italic
					</v-icon>
				</v-btn>
				<v-menu offset-y>
					<template v-slot:activator="{ props }">
						<v-btn v-bind="props" icon>
							<v-icon :color="activeObjectProps.fill">mdi-format-color-text</v-icon>
						</v-btn>
					</template>
					<v-color-picker v-model="activeObjectProps.fill" @update:model-value="updateActiveObject"
						hide-inputs show-swatches></v-color-picker>
				</v-menu>
			</v-toolbar>

			<v-card-text class="pa-0 annotator-body d-flex justify-center align-center">
				<canvas ref="canvasEl"></canvas>
			</v-card-text>
		</v-card>
	</v-dialog>
</template>

<script>
	export default {
		name: 'uc-image-annotator',
		props: {
			visible: Boolean,
			fileUrl: String,
			initialAnnotations: Object,
			originalFile: Object
		},
		emits: ['update:visible', 'save'],
		data() {
			return {
				token: $awt,
				fabricCanvas: null,
				tool: 'text',
				isSaving: false,
				activeObject: null,
				activeObjectProps: {
					fontFamily: 'Arial',
					fontSize: 24,
					fontWeight: 'normal',
					fontStyle: 'normal',
					fill: '#E53935'
				}
			};
		},
		watch: {
			visible(newVal) {
				if (newVal) {
					this.$nextTick(() => {
						setTimeout(() => { this.initializeCanvas(); }, 100);
					});
				}
			}
		},
		mounted(){
			console.log('this.fileUrlll',this.fileUrl)
		},
		methods: {
			async initializeCanvas() {
				if (this.fabricCanvas) this.fabricCanvas.dispose();
				const canvasEl = this.$refs.canvasEl;
				const container = canvasEl.parentElement;
				this.fabricCanvas = new fabric.Canvas(canvasEl);
	
				const myHeaders = new Headers();
				myHeaders.append("Authorization", this.token);
	
				const requestOptions = {
					method: "GET",
					headers: myHeaders,
					redirect: "follow"
				};
	
				const response = await fetch(this.fileUrl, requestOptions)
				console.log('response',response)
				const blob = await response.blob();
				const url = URL.createObjectURL(blob);
	
				fabric.Image.fromURL(url, (img) => {
					const options = {
						scaleX: container.clientWidth / img.width,
						scaleY: container.clientHeight / img.height,
					};
					const scale = Math.min(options.scaleX, options.scaleY, 1);
					this.fabricCanvas.setWidth(img.width * scale);
					this.fabricCanvas.setHeight(img.height * scale);
					this.fabricCanvas.setBackgroundImage(img, this.fabricCanvas.renderAll.bind(this.fabricCanvas), {
						scaleX: scale,
						scaleY: scale,
					});
					if (this.initialAnnotations) {
						try {
							this.fabricCanvas.loadFromJSON(this.initialAnnotations, this.fabricCanvas.renderAll.bind(this.fabricCanvas));
						} catch (e) { console.error("Lỗi khi tải dữ liệu chú thích cũ:", e); }
					}
				}, { crossOrigin: 'anonymous' });
	
				this.fabricCanvas.on('mouse:down', this.handleCanvasClick);
				this.fabricCanvas.on('selection:created', this.updateActiveObjectState);
				this.fabricCanvas.on('selection:updated', this.updateActiveObjectState);
				this.fabricCanvas.on('selection:cleared', this.updateActiveObjectState);
			},
	
			updateActiveObjectState(e) {
				this.activeObject = this.fabricCanvas.getActiveObject();
				if (this.activeObject && this.activeObject.type === 'i-text') {
					this.activeObjectProps.fontFamily = this.activeObject.fontFamily;
					this.activeObjectProps.fontSize = this.activeObject.fontSize;
					this.activeObjectProps.fontWeight = this.activeObject.fontWeight;
					this.activeObjectProps.fontStyle = this.activeObject.fontStyle;
					this.activeObjectProps.fill = this.activeObject.fill;
				}
			},
			updateActiveObject() {
				if (!this.activeObject) return;
				this.activeObject.set(this.activeObjectProps);
				this.fabricCanvas.renderAll();
			},
			toggleTextStyle(prop, value) {
				if (!this.activeObject) return;
				const currentValue = this.activeObject.get(prop);
				this.activeObjectProps[prop] = (currentValue === value) ? 'normal' : value;
				this.updateActiveObject();
			},
			deleteSelectedObject() {
				if (this.activeObject) {
					this.fabricCanvas.remove(this.activeObject);
					this.fabricCanvas.discardActiveObject().renderAll();
					this.activeObject = null;
				}
			},
			handleCanvasClick(options) {
				if (options.target) return;
				const pointer = this.fabricCanvas.getPointer(options.e);
				switch (this.tool) {
					case 'text': this.addText(pointer.x, pointer.y); break;
					case 'correct': this.addIcon('check', pointer.x, pointer.y); break;
					case 'incorrect': this.addIcon('close', pointer.x, pointer.y); break;
				}
			},
			addText(x, y) {
				const text = new fabric.IText('Nhận xét...', {
					left: x, top: y, fontFamily: 'Arial',
					fontSize: 24, fill: '#E53935',
					padding: 7,
					backgroundColor: 'rgba(255, 255, 255, 0.8)',
					cornerColor: 'blue', cornerSize: 10, transparentCorners: false
				});
				this.fabricCanvas.add(text).setActiveObject(text);
				text.enterEditing();
				text.selectAll();
				this.fabricCanvas.renderAll();
			},
			addIcon(type, x, y) {
				const isCorrect = type === 'check';
				const color = isCorrect ? '#4CAF50' : '#F44336';
				const path = isCorrect
					? 'M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z'
					: 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z';
	
				const icon = new fabric.Path(path, {
					left: x, top: y, fill: color,
					originX: 'center', originY: 'center',
					scaleX: 2.5, scaleY: 2.5,
					stroke: 'white', strokeWidth: 0.5,
					cornerColor: 'blue', cornerSize: 10, transparentCorners: false
				});
				this.fabricCanvas.add(icon);
			},
	
			async saveAndUpload() {
				if (!this.fabricCanvas || this.isSaving || !this.originalFile) {
					return;
				}
				this.isSaving = true;
	
				try {
					// === BƯỚC 1: LẤY DỮ LIỆU CHÚ THÍCH (ANNOTATIONS) ===
					const annotations = this.fabricCanvas.toJSON(['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fill']);
					const annotationsJSON = JSON.stringify(annotations);
	
					// === BƯỚC 2: UPLOAD ẢNH ĐÃ CHÚ THÍCH NHƯ MỘT FILE MỚI ===
					const imageDataUrl = this.fabricCanvas.toDataURL({ format: 'png', quality: 0.9 });
					const newFile = this.dataURLtoFile(imageDataUrl, `[ANNOTATED]_${this.originalFile.name}`);
	
					const formData = new FormData();
					formData.append('file', newFile);
	
					if (!this.token) throw new Error("Không tìm thấy token xác thực.");
					// Gọi API upload thông thường (KHÔNG phải Update)
					const uploadResponse = await $.ajax({
						url: `https://file.lhbs.vn/lms/upload/LMS_FileData`,
						type: 'POST',
						data: formData,
						processData: false,
						contentType: false,
						headers: { 'Authorization': this.token }
					});
	
					if (!uploadResponse?.Files?.[0]?.FILE_ID) {
						throw new Error("Upload file tạm thời thất bại hoặc response không hợp lệ.");
					}
	
					const fileIdOverWrite = uploadResponse.Files[0].FILE_ID;
					console.log("Upload file tạm thành công. FileID mới (OverWrite):", fileIdOverWrite);
	
					// === BƯỚC 3: GỌI API GHI ĐÈ (File_OverWrite) ===
					const overWritePayload = {
						FileID_Origin: this.originalFile.id,
						FileID_OverWrite: fileIdOverWrite,
						Annotations: annotationsJSON // Thêm annotations vào payload
					};
	
					// Sử dụng ajaxCALL của Fast Project cho API nghiệp vụ này
					const fileOverWrite = await new Promise((resolve, reject) => {
						ajaxCALL("lms/File_OverWrite", overWritePayload, (response) => {
							resolve(response.data[0]);
						});
					});
	
					// === BƯỚC 4: EMIT KẾT QUẢ CHO COMPONENT CHA ===
					const finalFileObject = {
						id: fileOverWrite?.FileID ?? '',
						name: fileOverWrite?.FileName ?? '',
						source: vueData.v_Set.urlReturnFile + `${fileOverWrite.FILE_URL.split('&v=')[0]}?v=${Date.now()}`,
						annotations: annotationsJSON // Thêm annotations vào finalFileObject
					};
	
					console.log('finalFileObject', finalFileObject);
					this.$emit('save', finalFileObject);
					this.closeDialog();
	
				} catch (error) {
					console.error("Lỗi trong quá trình lưu và ghi đè:", error);
					Toast.error({ text: "Lưu chú thích thất bại." });
				} finally {
					this.isSaving = false;
				}
			},
	
			dataURLtoFile(dataurl, filename) {
				let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
					bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
				while (n--) { u8arr[n] = bstr.charCodeAt(n); }
				return new File([u8arr], filename, { type: mime });
			},
	
			getCookie(name) {
				const value = `; ${document.cookie}`;
				const parts = value.split(`; ${name}=`);
				if (parts.length === 2) return parts.pop().split(';').shift();
				return null;
			},
	
			closeDialog() {
				this.$emit('update:visible', false);
			}
		},
		beforeUnmount() {
			if (this.fabricCanvas) {
				this.fabricCanvas.dispose();
				this.fabricCanvas = null;
			}
		}
	}
</script>