<template>
	<div class="pdf-book-reader" ref="bookContainer">
		<!-- Loading State -->
		<div v-if="this.isLoading" class="book-loading">
			<v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
			<p class="mt-4">Đang tải sách...</p>
		</div>

		<!-- Error State -->
		<div v-else-if="this.error" class="book-error">
			<v-icon size="64" color="error">mdi-book-alert</v-icon>
			<p class="mt-2 error--text">{{ this.error }}</p>
			<v-btn @click="retryLoad" color="primary" class="mt-2">Thử lại</v-btn>
		</div>

		<!-- Book Reader -->
		<div v-else class="book-container">
			<!-- Book Spine and Binding -->
			<div class="book-spine"></div>

			<!-- Book Pages Container -->
			<div class="book-pages" ref="bookPages">
				<!-- Thumbnails Sidebar -->
				<div v-if="this.showThumbnails" class="book-thumbnails">
					<div class="thumbnails-header">
						<h4>Mục lục</h4>
						<v-btn icon small @click="showThumbnails = false">
							<v-icon>mdi-close</v-icon>
						</v-btn>
					</div>
					<div class="thumbnails-list">
						<div v-for="page in this.totalPages" :key="page" class="thumbnail-item"
							:class="{ 'active': page === this.currentPage }" @click="goToPage(page)">
							<div class="thumbnail-preview">
								<div class="thumbnail-placeholder">{{ page }}</div>
							</div>
							<div class="thumbnail-number">{{ page }}</div>
						</div>
					</div>
				</div>

				<!-- Main Book Area -->
				<div class="main-book-area" :style="{ marginLeft: this.showThumbnails ? '250px' : '0' }">
					<!-- Left Page (Even pages) -->
					<div class="page-left" :class="{ 'page-visible': this.isDoublePage && this.currentPage > 1 }">
						<canvas ref="leftCanvas" class="page-canvas" @click="prevPage"></canvas>
						<div class="page-number left">{{ this.isDoublePage && this.currentPage > 1 ? this.currentPage -
							1 : '' }}</div>
					</div>

					<!-- Right Page (Odd pages) -->
					<div class="page-right page-visible">
						<canvas ref="rightCanvas" class="page-canvas" @click="nextPage"></canvas>
						<div class="page-number right">{{ this.currentPage }}</div>
					</div>
				</div>
			</div>

			<!-- Controls -->
			<div class="book-controls">
				<!-- Navigation -->
				<div class="nav-controls">
					<v-btn icon :disabled="this.currentPage <= (this.isDoublePage ? 2 : 1)" @click="prevPage"
						title="Trang trước">
						<v-icon>mdi-chevron-left</v-icon>
					</v-btn>

					<div class="page-info">
						<span v-if="this.isDoublePage && this.currentPage > 1">
							{{ this.currentPage - 1 }}-{{ this.currentPage }} / {{ this.totalPages }}
						</span>
						<span v-else>
							{{ this.currentPage }} / {{ this.totalPages }}
						</span>
					</div>

					<v-btn icon :disabled="this.currentPage >= this.totalPages" @click="nextPage" title="Trang sau">
						<v-icon>mdi-chevron-right</v-icon>
					</v-btn>
				</div>

				<!-- View Controls -->
				<div class="view-controls">
					<v-btn icon @click="toggleDoublePage" :color="this.isDoublePage ? 'primary' : 'default'"
						title="Chế độ 2 trang">
						<v-icon>mdi-book-open-page-variant</v-icon>
					</v-btn>

					<v-btn icon @click="showThumbnails = !showThumbnails"
						:color="this.showThumbnails ? 'primary' : 'default'" title="Mục lục">
						<v-icon>mdi-view-list</v-icon>
					</v-btn>

					<v-btn icon @click="toggleFullscreen" title="Toàn màn hình">
						<v-icon>{{ this.isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}</v-icon>
					</v-btn>
				</div>

				<!-- Zoom Controls -->
				<div class="zoom-controls">
					<v-btn icon @click="zoomOut" title="Thu nhỏ">
						<v-icon>mdi-minus</v-icon>
					</v-btn>
					<span class="zoom-level">{{ Math.round(this.scale * 100) }}%</span>
					<v-btn icon @click="zoomIn" title="Phóng to">
						<v-icon>mdi-plus</v-icon>
					</v-btn>
					<v-btn icon @click="fitToPage" title="Vừa trang">
						<v-icon>mdi-fit-to-page</v-icon>
					</v-btn>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
	name: 'uc-pdf-book-reader',
	props: {
		pdfUrl: {
			type: String,
			required: true
		},
		initialPage: {
			type: Number,
			default: 1
		}
	},
	emits: ['page-changed'],
	data() {
		return {
			// UI State
			currentPage: 2, // Start at page 2 to show pages 1-2
			totalPages: 0,
			isLoading: true,
			error: null,
			scale: 1.0,
			isDoublePage: true, // Start with double page mode
			showThumbnails: false,
			isFullscreen: false,
			
			// Page flip animation
			isFlipping: false,
			flipDirection: 'next',
			
			// Throttling
			lastEmitTime: 0,
			emitThrottle: 1000
		}
	},
	async mounted() {
		console.log('🚀 Component mounted');
		
		// Initialize PDF components directly in component
		this.initPDFComponents();
		
		// Load PDF
		await this.initializePDF();
		
		// Setup keyboard shortcuts
		this.setupKeyboardShortcuts();
		
		// Add manual render button to window for debugging (remove in production)
		if (typeof window !== 'undefined') {
			window.manualRender = () => this.manualRender();
		}
	},
	beforeDestroy() {
		this.cleanup();
	},
	methods: {
		initPDFComponents() {
			// Store non-reactive PDF components
			this._pdfDocument = null;
			this._pageCache = new Map();
			this._isReady = false;
		},

		async ensurePDFJSLoaded() {
			if (this._isReady) return true;

			try {
				if (!window.pdfjsLib) {
					const script = document.createElement('script');
					script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
					
					await new Promise((resolve, reject) => {
						script.onload = resolve;
						script.onerror = reject;
						document.head.appendChild(script);
					});
				}

				if (window.pdfjsLib) {
					window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
						'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
					this._isReady = true;
					return true;
				}
				return false;
			} catch (error) {
				console.error('Failed to load PDF.js:', error);
				return false;
			}
		},

		async loadPDFDocument(url, onProgress) {
			if (!this._isReady) {
				throw new Error('PDF.js not ready');
			}

			try {
				const loadingTask = window.pdfjsLib.getDocument({
					url: url,
					disableWorker: true,
					disableRange: true,
					disableStream: true,
					isEvalSupported: false
				});

				if (onProgress) {
					loadingTask.onProgress = onProgress;
				}

				this._pdfDocument = await loadingTask.promise;
				return this._pdfDocument.numPages;
			} catch (error) {
				console.error('PDF loading error:', error);
				throw error;
			}
		},

		async renderPageToCanvas(pageNumber, canvas, scale = 1.0) {
			if (!this._pdfDocument || !canvas) {
				throw new Error('PDF document or canvas not available');
			}

			try {
				// Check cache
				const cacheKey = `${pageNumber}_${scale}`;
				const cached = this._pageCache.get(cacheKey);
				
				if (cached) {
					const ctx = canvas.getContext('2d');
					canvas.width = cached.width;
					canvas.height = cached.height;
					ctx.putImageData(cached.imageData, 0, 0);
					return;
				}

				// Get page
				const page = await this._pdfDocument.getPage(pageNumber);
				const viewport = page.getViewport({ scale });
				
				// Setup canvas
				const context = canvas.getContext('2d');
				canvas.width = viewport.width;
				canvas.height = viewport.height;
				
				// Clear canvas
				context.fillStyle = 'white';
				context.fillRect(0, 0, canvas.width, canvas.height);

				// Render
				const renderContext = {
					canvasContext: context,
					viewport: viewport
				};

				await page.render(renderContext).promise;

				// Cache result
				try {
					const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
					this._pageCache.set(cacheKey, {
						width: canvas.width,
						height: canvas.height,
						imageData: imageData
					});
				} catch (e) {
					console.warn('Caching failed:', e);
				}

			} catch (error) {
				console.error(`Error rendering page ${pageNumber}:`, error);
				this.renderErrorToCanvas(canvas, pageNumber);
			}
		},

		renderErrorToCanvas(canvas, pageNumber) {
			const ctx = canvas.getContext('2d');
			canvas.width = 400;
			canvas.height = 300;
			
			ctx.fillStyle = '#f5f5f5';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			
			ctx.fillStyle = '#666';
			ctx.font = '16px Arial';
			ctx.textAlign = 'center';
			ctx.fillText(`Lỗi tải trang ${pageNumber}`, canvas.width / 2, canvas.height / 2);
		},

		async initializePDF() {
			try {
				this.isLoading = true;
				this.error = null;

				// Initialize PDF.js
				const pdfReady = await this.ensurePDFJSLoaded();
				if (!pdfReady) {
					throw new Error('Failed to initialize PDF.js');
				}

				// Load PDF with progress callback
				const totalPages = await this.loadPDFDocument(
					this.pdfUrl,
					(progress) => {
						if (progress.total > 0) {
							const percent = Math.round((progress.loaded / progress.total) * 100);
							console.log(`Loading: ${percent}%`);
						}
					}
				);

				this.totalPages = totalPages;
				this.currentPage = Math.max(2, Math.min(this.initialPage || 2, totalPages)); // Start at page 2 to show 1-2

				console.log(`PDF loaded: ${totalPages} pages`);

				// Set initial page for double page mode (show pages 1-2)
				if (this.isDoublePage) {
					this.currentPage = Math.min(2, totalPages);
				} else {
					this.currentPage = 1;
				}

				console.log(`Starting with page: ${this.currentPage} (double page: ${this.isDoublePage})`);

				// Stop loading state to show the UI first
				this.isLoading = false;

				// Wait for Vue to render the template with canvas elements
				await this.$nextTick();
				await this.$nextTick(); // Double nextTick to ensure complete render
				await new Promise(resolve => setTimeout(resolve, 1000)); // Extra wait for DOM
				
				// Now try to render with canvas elements available
				let renderSuccess = false;
				for (let attempt = 1; attempt <= 5; attempt++) {
					console.log(`🎯 Render attempt ${attempt}/5`);
					
					// Check if canvas elements exist
					const leftCanvas = this.$refs.leftCanvas;
					const rightCanvas = this.$refs.rightCanvas;
					
					console.log('Canvas availability:', { 
						left: !!leftCanvas, 
						right: !!rightCanvas,
						leftParent: leftCanvas?.parentElement?.tagName,
						rightParent: rightCanvas?.parentElement?.tagName
					});
					
					if (!rightCanvas) {
						console.warn(`❌ Right canvas not found on attempt ${attempt}, waiting...`);
						await new Promise(resolve => setTimeout(resolve, 1000));
						continue;
					}
					
					try {
						// Force canvas to be visible and properly sized
						this.setupCanvasElements();
						
						// Wait a bit more after setup
						await new Promise(resolve => setTimeout(resolve, 500));
						
						// Try rendering
						await this.renderCurrentPages();
						
						// Verify render success
						if (rightCanvas.width > 0 && rightCanvas.height > 0) {
							console.log('✅ Render successful!');
							renderSuccess = true;
							break;
						}
						
					} catch (error) {
						console.error(`❌ Render attempt ${attempt} failed:`, error);
					}
					
					// Progressive wait time
					await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
				}
				
				if (!renderSuccess) {
					console.error('❌ All render attempts failed - will render on user interaction');
				}
				
				// Auto focus the container for keyboard navigation
				this.$nextTick(() => {
					if (this.$refs.bookContainer) {
						this.$refs.bookContainer.focus();
						this.$refs.bookContainer.setAttribute('tabindex', '0');
					}
				});
				
				// Emit page change
				this.emitPageChange();

			} catch (error) {
				console.error('PDF initialization error:', error);
				this.error = this.formatError(error);
			} finally {
				// Ensure loading is stopped even if render fails
				this.isLoading = false;
			}
		},

		formatError(error) {
			if (error.name === 'InvalidPDFException') {
				return 'File PDF không hợp lệ';
			} else if (error.name === 'MissingPDFException') {
				return 'Không tìm thấy file PDF';
			} else if (error.name === 'UnexpectedResponseException') {
				return 'Lỗi tải PDF - kiểm tra đường dẫn';
			} else if (error.message && error.message.includes('fetch')) {
				return 'Lỗi kết nối - không thể tải PDF';
			}
			return `Lỗi: ${error.message || 'Không xác định'}`;
		},

		async retryLoad() {
			await this.initializePDF();
		},

		async renderCurrentPages() {
			try {
				console.log('🎨 Starting renderCurrentPages...', { 
					currentPage: this.currentPage, 
					totalPages: this.totalPages,
					isDoublePage: this.isDoublePage 
				});
				
				const leftCanvas = this.$refs.leftCanvas;
				const rightCanvas = this.$refs.rightCanvas;
				
				if (this.isDoublePage) {
					// Double page mode: show page (currentPage-1) on left, currentPage on right
					
					// Left page (currentPage - 1)
					if (leftCanvas && this.currentPage > 1) {
						const leftPageNum = this.currentPage - 1;
						console.log(`📄 Rendering LEFT page: ${leftPageNum}`);
						
						if (leftPageNum >= 1 && leftPageNum <= this.totalPages) {
							await this.renderPageToCanvas(leftPageNum, leftCanvas, this.scale);
							console.log(`✅ LEFT page ${leftPageNum} rendered`);
						} else {
							console.log(`⚠️ LEFT page ${leftPageNum} out of range`);
							this.clearCanvas(leftCanvas);
						}
					} else if (leftCanvas) {
						console.log('🧹 Clearing left canvas (no page to show)');
						this.clearCanvas(leftCanvas);
					}
					
					// Right page (currentPage)
					if (rightCanvas) {
						const rightPageNum = this.currentPage;
						console.log(`📄 Rendering RIGHT page: ${rightPageNum}`);
						
						if (rightPageNum >= 1 && rightPageNum <= this.totalPages) {
							await this.renderPageToCanvas(rightPageNum, rightCanvas, this.scale);
							console.log(`✅ RIGHT page ${rightPageNum} rendered`);
						} else {
							console.log(`⚠️ RIGHT page ${rightPageNum} out of range`);
							this.clearCanvas(rightCanvas);
						}
					}
				} else {
					// Single page mode: only show currentPage on right
					if (leftCanvas) {
						console.log('🧹 Clearing left canvas (single page mode)');
						this.clearCanvas(leftCanvas);
					}
					
					if (rightCanvas && this.currentPage >= 1 && this.currentPage <= this.totalPages) {
						console.log(`📄 Rendering SINGLE page: ${this.currentPage}`);
						await this.renderPageToCanvas(this.currentPage, rightCanvas, this.scale);
						console.log(`✅ SINGLE page ${this.currentPage} rendered`);
					}
				}
				
				console.log('✅ renderCurrentPages completed successfully');
				
			} catch (error) {
				console.error('❌ Error in renderCurrentPages:', error);
				throw error;
			}
		},

		clearCanvas(canvas) {
			if (canvas) {
				console.log('🧹 Clearing canvas');
				const ctx = canvas.getContext('2d');
				
				// Set default size if canvas has no dimensions
				if (canvas.width === 0 || canvas.height === 0) {
					canvas.width = 400;
					canvas.height = 500;
				}
				
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				// Set a light background to indicate empty page
				ctx.fillStyle = '#f8f9fa';
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				
				// Add a subtle border
				ctx.strokeStyle = '#dee2e6';
				ctx.lineWidth = 1;
				ctx.strokeRect(0, 0, canvas.width, canvas.height);
			}
		},

		setupCanvasElements() {
			console.log('🔧 Setting up canvas elements...');
			
			const leftCanvas = this.$refs.leftCanvas;
			const rightCanvas = this.$refs.rightCanvas;
			
			if (rightCanvas) {
				// Ensure canvas is visible and has proper parent
				const container = rightCanvas.closest('.page-right');
				if (container) {
					container.style.display = 'flex';
					container.style.visibility = 'visible';
				}
				
				// Set minimum dimensions
				if (rightCanvas.width === 0 || rightCanvas.height === 0) {
					rightCanvas.width = 400;
					rightCanvas.height = 500;
					rightCanvas.style.width = '100%';
					rightCanvas.style.height = '100%';
				}
				
				console.log('✅ Right canvas setup:', rightCanvas.width, 'x', rightCanvas.height);
			}
			
			if (leftCanvas) {
				const container = leftCanvas.closest('.page-left');
				if (container) {
					container.style.display = 'flex';
					container.style.visibility = 'visible';
				}
				
				if (leftCanvas.width === 0 || leftCanvas.height === 0) {
					leftCanvas.width = 400;
					leftCanvas.height = 500;
					leftCanvas.style.width = '100%';
					leftCanvas.style.height = '100%';
				}
				
				console.log('✅ Left canvas setup:', leftCanvas.width, 'x', leftCanvas.height);
			}
		},

		// Add method to manually trigger render (useful for debugging)
		async manualRender() {
			this.setupCanvasElements();
			await this.renderCurrentPages();
			this.emitPageChange();
		},

		// Navigation methods with page flip animation
		async nextPage() {
			if (this.currentPage >= this.totalPages || this.isFlipping) return;
			
			// Ensure canvas elements are ready before animation
			this.setupCanvasElements();
			
			await this.animatePageFlip('next', () => {
				if (this.isDoublePage) {
					this.currentPage = Math.min(this.currentPage + 2, this.totalPages);
				} else {
					this.currentPage++;
				}
			});
		},

		async prevPage() {
			if (this.currentPage <= (this.isDoublePage ? 2 : 1) || this.isFlipping) return;
			
			// Ensure canvas elements are ready before animation
			this.setupCanvasElements();
			
			await this.animatePageFlip('prev', () => {
				if (this.isDoublePage) {
					this.currentPage = Math.max(this.currentPage - 2, 2);
				} else {
					this.currentPage--;
				}
			});
		},

		async goToPage(pageNum) {
			if (pageNum === this.currentPage || this.isFlipping) return;
			
			// Adjust page number for double page mode
			if (this.isDoublePage && pageNum === 1) {
				pageNum = 2; // Show pages 1-2
			}
			
			// Ensure canvas elements are ready
			this.setupCanvasElements();
			
			const direction = pageNum > this.currentPage ? 'next' : 'prev';
			
			await this.animatePageFlip(direction, () => {
				this.currentPage = Math.max(this.isDoublePage ? 2 : 1, Math.min(pageNum, this.totalPages));
			});
		},

		async animatePageFlip(direction, updatePageCallback) {
			if (this.isFlipping) return;
			
			this.isFlipping = true;
			this.flipDirection = direction;
			
			try {
				// Get the main book area for animation
				const mainBookArea = this.$refs.bookPages?.querySelector('.main-book-area');
				const pageLeft = this.$refs.bookPages?.querySelector('.page-left');
				const pageRight = this.$refs.bookPages?.querySelector('.page-right');
				
				console.log('Starting page flip animation:', direction);
				
				// Add animation classes
				if (mainBookArea) {
					mainBookArea.classList.add('page-flipping', `flip-${direction}`);
				}
				
				if (pageLeft && pageRight) {
					pageLeft.classList.add('flipping');
					pageRight.classList.add('flipping');
				}
				
				// Wait for half the animation
				await new Promise(resolve => setTimeout(resolve, 300));
				
				// Update page number in the middle of animation
				updatePageCallback();
				
				// Render new pages
				await this.renderCurrentPages();
				
				// Complete the animation
				await new Promise(resolve => setTimeout(resolve, 300));
				
				// Remove animation classes
				if (mainBookArea) {
					mainBookArea.classList.remove('page-flipping', `flip-${direction}`);
				}
				
				if (pageLeft && pageRight) {
					pageLeft.classList.remove('flipping');
					pageRight.classList.remove('flipping');
				}
				
				this.emitPageChange();
				
				console.log('Page flip animation completed. New page:', this.currentPage);
				
			} catch (error) {
				console.error('Page flip animation error:', error);
			} finally {
				this.isFlipping = false;
			}
		},

		// View controls
		async toggleDoublePage() {
			console.log('Toggling double page mode from:', this.isDoublePage, 'to:', !this.isDoublePage);
			this.isDoublePage = !this.isDoublePage;
			this._pageCache.clear();
			
			await this.$nextTick();
			// Longer timeout to ensure DOM updates
			setTimeout(async () => {
				await this.renderCurrentPages();
			}, 300);
		},

		toggleFullscreen() {
			if (!this.isFullscreen) {
				if (this.$refs.bookContainer.requestFullscreen) {
					this.$refs.bookContainer.requestFullscreen();
				}
			} else {
				if (document.exitFullscreen) {
					document.exitFullscreen();
				}
			}
		},

		// Zoom controls
		async zoomIn() {
			this.scale = Math.min(this.scale * 1.25, 3.0);
			this._pageCache.clear();
			await this.renderCurrentPages();
		},

		async zoomOut() {
			this.scale = Math.max(this.scale * 0.8, 0.5);
			this._pageCache.clear();
			await this.renderCurrentPages();
		},

		async fitToPage() {
			const container = this.$refs.bookPages;
			if (container) {
				const containerWidth = container.clientWidth - (this.showThumbnails ? 250 : 0);
				const targetWidth = this.isDoublePage ? containerWidth / 2 : containerWidth;
				this.scale = Math.max(0.5, Math.min(targetWidth / 595, 2.0));
				this._pageCache.clear();
				await this.renderCurrentPages();
			}
		},

		// Event handling
		emitPageChange() {
			const now = Date.now();
			if (now - this.lastEmitTime < this.emitThrottle) {
				return;
			}
			
			this.lastEmitTime = now;
			
			this.$emit('page-changed', {
				page: this.currentPage,
				total: this.totalPages,
				timestamp: new Date().toISOString()
			});
		},

		setupKeyboardShortcuts() {
			this.keyHandler = (e) => {
				if (!this.$refs.bookContainer?.contains(document.activeElement)) return;

				switch(e.key) {
					case 'ArrowRight':
					case ' ':
						e.preventDefault();
						this.nextPage();
						break;
					case 'ArrowLeft':
						e.preventDefault();
						this.prevPage();
						break;
					case 'Home':
						e.preventDefault();
						this.goToPage(1);
						break;
					case 'End':
						e.preventDefault();
						this.goToPage(this.totalPages);
						break;
					case 'f':
						e.preventDefault();
						this.toggleFullscreen();
						break;
					case 'Escape':
						if (this.isFullscreen) {
							e.preventDefault();
							this.toggleFullscreen();
						}
						break;
				}
			};
			document.addEventListener('keydown', this.keyHandler);

			this.fullscreenHandler = () => {
				this.isFullscreen = !!document.fullscreenElement;
			};
			document.addEventListener('fullscreenchange', this.fullscreenHandler);
		},

		cleanup() {
			// Remove event listeners
			if (this.keyHandler) {
				document.removeEventListener('keydown', this.keyHandler);
			}
			if (this.fullscreenHandler) {
				document.removeEventListener('fullscreenchange', this.fullscreenHandler);
			}
			
			// Cleanup PDF document
			if (this._pdfDocument) {
				try {
					this._pdfDocument.destroy();
				} catch (error) {
					console.warn('Error destroying PDF:', error);
				}
				this._pdfDocument = null;
			}
			
			// Clear cache
			if (this._pageCache) {
				this._pageCache.clear();
			}
		}
	}
}
</script>
