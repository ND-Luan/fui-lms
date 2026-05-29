<!-- uc-latex-view.vue -->
<template>
	<div ref="contentContainer" class="uc-latex-view" v-html="renderedContent" />
</template>

<script>
	export default {
	  name: 'uc-latex-view',
	  props: {
	    content: {
	      type: String,
	      default: ''
	    }
	  },
	  data() {
	    return {
	      renderedContent: ''
	    }
	  },
	  watch: {
	    content: {
	      immediate: true,
	      handler(newContent) {
	        this.renderContent(newContent)
	      }
	    }
	  },
	  mounted() {
	    this.loadMathJax()
	  },
	  methods: {
	    loadMathJax() {
	      if (!window.MathJax) {
	        const script = document.createElement('script')
	        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-mml-chtml.min.js'
	        script.onload = () => {
	          this.configureMathJax()
	          this.renderContent(this.content)
	        }
	        document.head.appendChild(script)
	      } else {
	        this.renderContent(this.content)
	      }
	    },
	
	    configureMathJax() {
	      window.MathJax = {
	        tex: {
	          inlineMath: [['$', '$'], ['\\(', '\\)']],
	          displayMath: [['$$', '$$'], ['\\[', '\\]']]
	        },
	        svg: {
	          fontCache: 'global'
	        }
	      }
	    },
	
	    renderContent(content) {
	      if (!content) {
	        this.renderedContent = ''
	        return
	      }
	
	      this.renderedContent = content
	
	      // Force re-render MathJax với delay
	      this.$nextTick(() => {
	        setTimeout(() => {
	          if (window.MathJax && window.MathJax.typesetPromise && this.$refs.contentContainer) {
	            window.MathJax.typesetPromise([this.$refs.contentContainer])
	              .catch(err => console.error('MathJax render error:', err))
	          }
	        }, 50) // Delay ngắn để đảm bảo DOM ready
	      })
	    }
	  }
	}
</script>