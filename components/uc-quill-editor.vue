<template>
	<div>
		<!-- Container cho Quill Editor -->
		<div :ref="'quillContainer_' + uniqueId" v-bind="$attrs" class="fpScrollbar " style="
    height: 200px; 
    white-space: pre-wrap;
  word-wrap: break-word; 
  overflow-wrap: break-word;">
		</div>
		<div v-if="maxLength" style="text-align: right; font-size: 11px; padding-right: 4px; margin-top: 2px;"
			:style="{ color: charCount >= maxLength ? '#d32f2f' : charCount >= maxLength * 0.9 ? '#e65100' : '#9e9e9e' }">
			{{ charCount }} / {{ maxLength }}
		</div>
	</div>
</template>

<script>
	export default {
	    inheritAttrs: false,
	    props: {
	        modelValue: {
	            type: String,
	            default: ''
	        },
	        readOnly: {
	            type: Boolean,
	            default: false
	        },
	        maxLength: {
	            type: Number,
	            default: null
	        }
	    },
	    data() {
	        return {
	            quill: null, // Biến lưu trữ instance của Quill
	            uniqueId: _.uniqueId(), // Tạo unique id cho Quill Editor
	            toolbar: ['bold', 'italic', 'underline'], // Thanh công cụ
	            charCount: 0
	        };
	    },
	    mounted() {
	        this.initializeEditor(); // Khởi tạo Quill Editor khi component được gắn vào DOM
	    },
	    methods: {
	        // Phương thức khởi tạo Quill Editor
	        // initializeEditor() {
	        //     this.quill = Vue.markRaw(new Quill(this.$refs['quillContainer_' + this.uniqueId], {
	        //         theme: 'bubble', // Sử dụng theme 'bubble'
	        //         modules: {
	        //             toolbar: false//this.toolbar,
	        //         },
	        //         readOnly: this.readOnly
	        //     }));
	
	        //     // Xử lý sự kiện 'text-change' của Quill
	        //     this.quill.on('text-change', () => {
	        //         const content = this.quill.root.innerHTML;
	        //         const plainText = this.quill.getText(); // Lấy nội dung dạng chuỗi thuần
	
	        //         // console.log()
	        //         this.$emit('update:modelValue', JSON.stringify(plainText)); // Phát sự kiện để cập nhật modelValue
	        //     });
	
	        //     // this.quill.root.innerHTML = '';
	        //     // this.quill.clipboard.dangerouslyPasteHTML(0, this.modelValue);
	        //     this.quill.setText(this.modelValue || ''); // Chèn văn bản thuần
	        // }
	        initializeEditor() {
	            this.quill = Vue.markRaw(new Quill(this.$refs['quillContainer_' + this.uniqueId], {
	                theme: 'bubble',
	                modules: {
	                    toolbar: false, // Không cho phép định dạng
	                },
	                readOnly: this.readOnly
	            }));
	
	            if (this.isHTML(this.modelValue)) {
	                this.quill.root.innerHTML = '';
	                this.quill.clipboard.dangerouslyPasteHTML(0, this.modelValue);
	            } else {
	                // Gán văn bản thuần vào trình soạn thảo
	                this.quill.setText(this.modelValue || '');
	            }
	
	
	            // this.quill.root.innerHTML = '';
	            // // this.quill.clipboard.dangerouslyPasteHTML(0, this.modelValue);
	            // this.quill.setText(this.modelValue || ''); // Chèn văn bản thuần
	
            // Khởi tạo charCount từ nội dung ban đầu
            this.charCount = Math.max(0, this.quill.getText().length - 1)

            // Lắng nghe thay đổi và phát ra dữ liệu văn bản
            this.quill.on('text-change', () => {
                const text = this.quill.getText()
                const length = Math.max(0, text.length - 1)

                if (this.maxLength && length > this.maxLength) {
                    this.quill.deleteText(this.maxLength, text.length)
                    this.charCount = this.maxLength
                    return
                }

                this.charCount = length
	                const plainText = this.quill.getText().trim(); // Văn bản dạng plain text
	                this.$emit('update:modelValue', plainText);
	            });
	        },
	        isHTML(str) {
	            const doc = new DOMParser().parseFromString(str, 'text/html');
	            return Array.from(doc.body.childNodes).some(node => node.nodeType === 1); // 1 là ELEMENT_NODE
	        }
	    },
	    beforeDestroy() {
	        // Hủy bỏ instance của Quill khi component bị hủy
	        if (this.quill) {
	            this.quill = null;
	        }
	    },
	
	}
</script>