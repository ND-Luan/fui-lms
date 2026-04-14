<!-- uc-latex-view.vue -->
<template>
	<div ref="contentContainer" class="uc-latex-view d-flex align-center" style="min-width: 0; overflow-x: auto;" v-html="renderedContent" />
</template>
<script>
export default {
    name: 'uc-latex-view',
    props: {
        content: {
            type: String,
            default: ''
        },
        escapeHtml: {
            type: Boolean,
            default: true  // Mặc định là escape để an toàn
        }
    },
    data() {
        return {
            renderedContent: ''
        }
    },
    watch: {
        content: {
            handler(newContent) {
                this.renderContent(newContent)
            },
            immediate: true
        },
        escapeHtml: {
            handler() {
                this.renderContent(this.content)
            }
        }
    },
    async mounted() {
        await this.setupMathJax()
        // Immediate watcher fires before DOM is ready, so typeset again now that ref is available
        if (this.content && this.$refs.contentContainer) {
            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([this.$refs.contentContainer])
                    .catch(err => console.error('MathJax render error:', err))
            }
        }
    },
    methods: {
        escapeHtmlTags(content) {
            return content
                // Document metadata
                .replace(/<head/gi, '&lt;head')
                .replace(/<\/head>/gi, '&lt;/head&gt;')
                .replace(/<title/gi, '&lt;title')
                .replace(/<\/title>/gi, '&lt;/title&gt;')
                .replace(/<base/gi, '&lt;base')
                .replace(/<link/gi, '&lt;link')
                .replace(/<meta/gi, '&lt;meta')
                .replace(/<style/gi, '&lt;style')
                .replace(/<\/style>/gi, '&lt;/style&gt;')
                
                // Scripting
                .replace(/<script/gi, '&lt;script')
                .replace(/<\/script>/gi, '&lt;/script&gt;')
                .replace(/<noscript/gi, '&lt;noscript')
                .replace(/<\/noscript>/gi, '&lt;/noscript&gt;')
                
                // Sections
                .replace(/<body/gi, '&lt;body')
                .replace(/<\/body>/gi, '&lt;/body&gt;')
                .replace(/<article/gi, '&lt;article')
                .replace(/<\/article>/gi, '&lt;/article&gt;')
                .replace(/<section/gi, '&lt;section')
                .replace(/<\/section>/gi, '&lt;/section&gt;')
                .replace(/<nav/gi, '&lt;nav')
                .replace(/<\/nav>/gi, '&lt;/nav&gt;')
                .replace(/<aside/gi, '&lt;aside')
                .replace(/<\/aside>/gi, '&lt;/aside&gt;')
                .replace(/<header/gi, '&lt;header')
                .replace(/<\/header>/gi, '&lt;/header&gt;')
                .replace(/<footer/gi, '&lt;footer')
                .replace(/<\/footer>/gi, '&lt;/footer&gt;')
                .replace(/<main/gi, '&lt;main')
                .replace(/<\/main>/gi, '&lt;/main&gt;')
                
                // Grouping content
                .replace(/<div/gi, '&lt;div')
                .replace(/<\/div>/gi, '&lt;/div&gt;')
                .replace(/<p/gi, '&lt;p')
                .replace(/<\/p>/gi, '&lt;/p&gt;')
                .replace(/<hr/gi, '&lt;hr')
                .replace(/<pre/gi, '&lt;pre')
                .replace(/<\/pre>/gi, '&lt;/pre&gt;')
                .replace(/<blockquote/gi, '&lt;blockquote')
                .replace(/<\/blockquote>/gi, '&lt;/blockquote&gt;')
                .replace(/<ol/gi, '&lt;ol')
                .replace(/<\/ol>/gi, '&lt;/ol&gt;')
                .replace(/<ul/gi, '&lt;ul')
                .replace(/<\/ul>/gi, '&lt;/ul&gt;')
                .replace(/<li/gi, '&lt;li')
                .replace(/<\/li>/gi, '&lt;/li&gt;')
                .replace(/<dl/gi, '&lt;dl')
                .replace(/<\/dl>/gi, '&lt;/dl&gt;')
                .replace(/<dt/gi, '&lt;dt')
                .replace(/<\/dt>/gi, '&lt;/dt&gt;')
                .replace(/<dd/gi, '&lt;dd')
                .replace(/<\/dd>/gi, '&lt;/dd&gt;')
                .replace(/<figure/gi, '&lt;figure')
                .replace(/<\/figure>/gi, '&lt;/figure&gt;')
                .replace(/<figcaption/gi, '&lt;figcaption')
                .replace(/<\/figcaption>/gi, '&lt;/figcaption&gt;')
                
                // Text-level semantics
                .replace(/<a/gi, '&lt;a')
                .replace(/<\/a>/gi, '&lt;/a&gt;')
                .replace(/<em/gi, '&lt;em')
                .replace(/<\/em>/gi, '&lt;/em&gt;')
                .replace(/<strong/gi, '&lt;strong')
                .replace(/<\/strong>/gi, '&lt;/strong&gt;')
                .replace(/<small/gi, '&lt;small')
                .replace(/<\/small>/gi, '&lt;/small&gt;')
                .replace(/<s/gi, '&lt;s')
                .replace(/<\/s>/gi, '&lt;/s&gt;')
                .replace(/<cite/gi, '&lt;cite')
                .replace(/<\/cite>/gi, '&lt;/cite&gt;')
                .replace(/<q/gi, '&lt;q')
                .replace(/<\/q>/gi, '&lt;/q&gt;')
                .replace(/<dfn/gi, '&lt;dfn')
                .replace(/<\/dfn>/gi, '&lt;/dfn&gt;')
                .replace(/<abbr/gi, '&lt;abbr')
                .replace(/<\/abbr>/gi, '&lt;/abbr&gt;')
                .replace(/<data/gi, '&lt;data')
                .replace(/<\/data>/gi, '&lt;/data&gt;')
                .replace(/<time/gi, '&lt;time')
                .replace(/<\/time>/gi, '&lt;/time&gt;')
                .replace(/<code/gi, '&lt;code')
                .replace(/<\/code>/gi, '&lt;/code&gt;')
                .replace(/<var/gi, '&lt;var')
                .replace(/<\/var>/gi, '&lt;/var&gt;')
                .replace(/<samp/gi, '&lt;samp')
                .replace(/<\/samp>/gi, '&lt;/samp&gt;')
                .replace(/<kbd/gi, '&lt;kbd')
                .replace(/<\/kbd>/gi, '&lt;/kbd&gt;')
                .replace(/<sub/gi, '&lt;sub')
                .replace(/<\/sub>/gi, '&lt;/sub&gt;')
                .replace(/<sup/gi, '&lt;sup')
                .replace(/<\/sup>/gi, '&lt;/sup&gt;')
                .replace(/<i/gi, '&lt;i')
                .replace(/<\/i>/gi, '&lt;/i&gt;')
                .replace(/<b/gi, '&lt;b')
                .replace(/<\/b>/gi, '&lt;/b&gt;')
                .replace(/<u/gi, '&lt;u')
                .replace(/<\/u>/gi, '&lt;/u&gt;')
                .replace(/<mark/gi, '&lt;mark')
                .replace(/<\/mark>/gi, '&lt;/mark&gt;')
                .replace(/<ruby/gi, '&lt;ruby')
                .replace(/<\/ruby>/gi, '&lt;/ruby&gt;')
                .replace(/<rt/gi, '&lt;rt')
                .replace(/<\/rt>/gi, '&lt;/rt&gt;')
                .replace(/<rp/gi, '&lt;rp')
                .replace(/<\/rp>/gi, '&lt;/rp&gt;')
                .replace(/<bdi/gi, '&lt;bdi')
                .replace(/<\/bdi>/gi, '&lt;/bdi&gt;')
                .replace(/<bdo/gi, '&lt;bdo')
                .replace(/<\/bdo>/gi, '&lt;/bdo&gt;')
                .replace(/<span/gi, '&lt;span')
                .replace(/<\/span>/gi, '&lt;/span&gt;')
                .replace(/<br/gi, '&lt;br')
                .replace(/<wbr/gi, '&lt;wbr')
                
                // Edits
                .replace(/<ins/gi, '&lt;ins')
                .replace(/<\/ins>/gi, '&lt;/ins&gt;')
                .replace(/<del/gi, '&lt;del')
                .replace(/<\/del>/gi, '&lt;/del&gt;')
                
                // Embedded content
                .replace(/<img/gi, '&lt;img')
                .replace(/<iframe/gi, '&lt;iframe')
                .replace(/<\/iframe>/gi, '&lt;/iframe&gt;')
                .replace(/<embed/gi, '&lt;embed')
                .replace(/<object/gi, '&lt;object')
                .replace(/<\/object>/gi, '&lt;/object&gt;')
                .replace(/<param/gi, '&lt;param')
                .replace(/<video/gi, '&lt;video')
                .replace(/<\/video>/gi, '&lt;/video&gt;')
                .replace(/<audio/gi, '&lt;audio')
                .replace(/<\/audio>/gi, '&lt;/audio&gt;')
                .replace(/<source/gi, '&lt;source')
                .replace(/<track/gi, '&lt;track')
                .replace(/<canvas/gi, '&lt;canvas')
                .replace(/<\/canvas>/gi, '&lt;/canvas&gt;')
                .replace(/<map/gi, '&lt;map')
                .replace(/<\/map>/gi, '&lt;/map&gt;')
                .replace(/<area/gi, '&lt;area')
                .replace(/<svg/gi, '&lt;svg')
                .replace(/<\/svg>/gi, '&lt;/svg&gt;')
                
                // Tabular data
                .replace(/<table/gi, '&lt;table')
                .replace(/<\/table>/gi, '&lt;/table&gt;')
                .replace(/<caption/gi, '&lt;caption')
                .replace(/<\/caption>/gi, '&lt;/caption&gt;')
                .replace(/<colgroup/gi, '&lt;colgroup')
                .replace(/<\/colgroup>/gi, '&lt;/colgroup&gt;')
                .replace(/<col/gi, '&lt;col')
                .replace(/<tbody/gi, '&lt;tbody')
                .replace(/<\/tbody>/gi, '&lt;/tbody&gt;')
                .replace(/<thead/gi, '&lt;thead')
                .replace(/<\/thead>/gi, '&lt;/thead&gt;')
                .replace(/<tfoot/gi, '&lt;tfoot')
                .replace(/<\/tfoot>/gi, '&lt;/tfoot&gt;')
                .replace(/<tr/gi, '&lt;tr')
                .replace(/<\/tr>/gi, '&lt;/tr&gt;')
                .replace(/<td/gi, '&lt;td')
                .replace(/<\/td>/gi, '&lt;/td&gt;')
                .replace(/<th/gi, '&lt;th')
                .replace(/<\/th>/gi, '&lt;/th&gt;')
                
                // Forms
                .replace(/<form/gi, '&lt;form')
                .replace(/<\/form>/gi, '&lt;/form&gt;')
                .replace(/<label/gi, '&lt;label')
                .replace(/<\/label>/gi, '&lt;/label&gt;')
                .replace(/<input/gi, '&lt;input')
                .replace(/<button/gi, '&lt;button')
                .replace(/<\/button>/gi, '&lt;/button&gt;')
                .replace(/<select/gi, '&lt;select')
                .replace(/<\/select>/gi, '&lt;/select&gt;')
                .replace(/<datalist/gi, '&lt;datalist')
                .replace(/<\/datalist>/gi, '&lt;/datalist&gt;')
                .replace(/<optgroup/gi, '&lt;optgroup')
                .replace(/<\/optgroup>/gi, '&lt;/optgroup&gt;')
                .replace(/<option/gi, '&lt;option')
                .replace(/<\/option>/gi, '&lt;/option&gt;')
                .replace(/<textarea/gi, '&lt;textarea')
                .replace(/<\/textarea>/gi, '&lt;/textarea&gt;')
                .replace(/<output/gi, '&lt;output')
                .replace(/<\/output>/gi, '&lt;/output&gt;')
                .replace(/<progress/gi, '&lt;progress')
                .replace(/<\/progress>/gi, '&lt;/progress&gt;')
                .replace(/<meter/gi, '&lt;meter')
                .replace(/<\/meter>/gi, '&lt;/meter&gt;')
                .replace(/<fieldset/gi, '&lt;fieldset')
                .replace(/<\/fieldset>/gi, '&lt;/fieldset&gt;')
                .replace(/<legend/gi, '&lt;legend')
                .replace(/<\/legend>/gi, '&lt;/legend&gt;')
                
                // Interactive elements
                .replace(/<details/gi, '&lt;details')
                .replace(/<\/details>/gi, '&lt;/details&gt;')
                .replace(/<summary/gi, '&lt;summary')
                .replace(/<\/summary>/gi, '&lt;/summary&gt;')
                .replace(/<dialog/gi, '&lt;dialog')
                .replace(/<\/dialog>/gi, '&lt;/dialog&gt;')
                
                // Headings
                .replace(/<h1/gi, '&lt;h1')
                .replace(/<\/h1>/gi, '&lt;/h1&gt;')
                .replace(/<h2/gi, '&lt;h2')
                .replace(/<\/h2>/gi, '&lt;/h2&gt;')
                .replace(/<h3/gi, '&lt;h3')
                .replace(/<\/h3>/gi, '&lt;/h3&gt;')
                .replace(/<h4/gi, '&lt;h4')
                .replace(/<\/h4>/gi, '&lt;/h4&gt;')
                .replace(/<h5/gi, '&lt;h5')
                .replace(/<\/h5>/gi, '&lt;/h5&gt;')
                .replace(/<h6/gi, '&lt;h6')
                .replace(/<\/h6>/gi, '&lt;/h6&gt;')
                .replace(/<hgroup/gi, '&lt;hgroup')
                .replace(/<\/hgroup>/gi, '&lt;/hgroup&gt;')
                
                // Other
                .replace(/<html/gi, '&lt;html')
                .replace(/<\/html>/gi, '&lt;/html&gt;')
                .replace(/<address/gi, '&lt;address')
                .replace(/<\/address>/gi, '&lt;/address&gt;')
                .replace(/<template/gi, '&lt;template')
                .replace(/<\/template>/gi, '&lt;/template&gt;')
                .replace(/<slot/gi, '&lt;slot')
                .replace(/<\/slot>/gi, '&lt;/slot&gt;');
        },

        preprocessMathML(content) {
            let result = content;

            for (let i = 0; i < 10; i++) {
                const before = result;

                result = result.replace(
                    /<mfenced([^>]+open="\{"[^>]*)>([\s\S]*?)<\/mfenced>/g,
                    (fullMatch, attributes, innerContent) => {
                        const hasClosingBrace = /close="\}"/.test(attributes);

                        if (hasClosingBrace) {
                            return `<mo>{</mo><mrow>${innerContent}</mrow><mo>}</mo>`;
                        } else {
                            return `<mo>{</mo><mrow>${innerContent}</mrow>`;
                        }
                    }
                );

                if (before === result) break;
            }

            return result;
        },

        setupMathJax() {
            if (!window.MathJax) {
                window.MathJax = {
                    ...window.MathJax,
                    tex: {
                        inlineMath: [['$', '$'], ['\\(', '\\)']],
                        displayMath: [['$$', '$$'], ['\\[', '\\]']]
                    },
                    loader: { load: ['[mml]/mml3'] },
                    options: {
                        enableMenu: false,
                        enableExplorer: false,
                        enableAssistiveMml: false
                    },
                    startup: {
                        ready: () => {
                            window.MathJax.startup.defaultReady()
                            this.disableAllInteractions()
                        }
                    }
                }
            } else {
                window.MathJax = {
                    ...window.MathJax,
                    tex: {
                        inlineMath: [['$', '$'], ['\\(', '\\)']],
                        displayMath: [['$$', '$$'], ['\\[', '\\]']]
                    },
                    loader: { load: ['[mml]/mml3'] },
                    options: {
                        enableMenu: false,
                        enableExplorer: false,
                        enableAssistiveMml: false
                    },
                    startup: {
                        ready: () => {
                            window.MathJax.startup.defaultReady()
                            this.disableAllInteractions()
                        }
                    }
                }
                this.disableAllInteractions()
            }
        },

        disableAllInteractions() {
            this.addDisableStyles()
        },

        preventMathJaxMenu(event) {
            const target = event.target
        },

        preventMathJaxClick(event) {
            const target = event.target
        },

        addDisableStyles() {
        },

        renderContent(content) {
            if (!content) {
                this.renderedContent = ''
                return
            }

            // ✨ Chỉ escape HTML khi escapeHtml = true
            if (this.escapeHtml) {
                content = this.escapeHtmlTags(content);
            }

            // ✨ SAU ĐÓ mới preprocess MathML
            content = this.preprocessMathML(content)

            this.renderedContent = content

            this.$nextTick(() => {
                if (window.MathJax && window.MathJax.typesetPromise && this.$refs.contentContainer) {
                    window.MathJax.typesetPromise([this.$refs.contentContainer])
                        .then(() => {
                            this.forceDisableRenderedElements()
                        })
                        .catch(err => console.error('MathJax render error:', err))
                }
            })
        },

        forceDisableRenderedElements() {
        }
    },

    beforeUnmount() {
    }
}
</script>