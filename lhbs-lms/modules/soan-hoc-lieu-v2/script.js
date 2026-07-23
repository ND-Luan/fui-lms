/**
 * Shared Quiz Data Helpers for soan-hoc-lieu-v2
 */
window.QuizHelpers = {
    ensureDataStructure(loaiNoiDung, data) {
        const parsedData = typeof data === 'string' ? (data ? JSON.parse(data) : {}) : (data || {});
        switch (loaiNoiDung) {
            case 'QUIZ_SINGLE_CHOICE':
                return {
                    prompt: parsedData.prompt || 'Nhập câu hỏi ở đây...',
                    options: parsedData.options || [
                        { id: 'opt_1', text: 'Lựa chọn 1' },
                        { id: 'opt_2', text: 'Lựa chọn 2' },
                    ],
                    correctAnswer: parsedData.correctAnswer || 'opt_1',
                    explanation: parsedData.explanation || '',
                    isAdvanced: parsedData.isAdvanced || false,
                };
            case 'QUIZ_MULTIPLE_CHOICE':
                return {
                    prompt: parsedData.prompt || 'Nhập câu hỏi ở đây...',
                    options: parsedData.options || [
                        { id: 'opt_1', text: 'Lựa chọn 1' },
                        { id: 'opt_2', text: 'Lựa chọn 2' },
                    ],
                    correctAnswers: parsedData.correctAnswers || ['opt_1'],
                    explanation: parsedData.explanation || '',
                    isAdvanced: parsedData.isAdvanced || false,
                };
            case 'QUIZ_MATCHING':
                return {
                    prompt: parsedData.prompt || 'Nối các mục ở cột A với cột B cho phù hợp:',
                    columnA: parsedData.columnA || [{ id: 'a1', text: 'Mục A1' }, { id: 'a2', text: 'Mục A2' }],
                    columnB: parsedData.columnB || [{ id: 'b1', text: 'Mục B1' }, { id: 'b2', text: 'Mục B2' }],
                    isAdvanced: parsedData.isAdvanced || false,
                };
            case 'QUIZ_ORDERING':
                return {
                    prompt: parsedData.prompt || 'Sắp xếp các mục sau theo thứ tự đúng:',
                    items: parsedData.items || [{ id: 'item_1', text: 'Bước 1' }, { id: 'item_2', text: 'Bước 2' }],
                    isAdvanced: parsedData.isAdvanced || false,
                };
            case 'QUIZ_DRAG_DROP_CATEGORIZE':
                return {
                    prompt: parsedData.prompt || 'Kéo thả các mục vào đúng nhóm:',
                    categories: parsedData.categories || [{ id: 'cat_1', name: 'Nhóm 1' }, { id: 'cat_2', name: 'Nhóm 2' }],
                    items: parsedData.items || [
                        { id: 'item_1', text: 'Mục 1', categoryId: 'cat_1' },
                        { id: 'item_2', text: 'Mục 2', categoryId: 'cat_2' },
                    ],
                };
            case 'QUIZ_FILL_IN_BLANK':
                return {
                    prompt: parsedData.prompt || 'Điền vào chỗ trống:',
                    parts: parsedData.parts || [
                        { type: 'text', value: 'Thủ đô của Việt Nam là ' },
                        { type: 'blank', correctAnswer: 'Hà Nội' },
                    ],
                };
            case 'QUIZ_CONNECTION':
                return {
                    prompt: parsedData.prompt || 'Nối các mục vào nhóm thích hợp:',
                    groups: parsedData.groups || [{ id: 'g1', text: 'Nhóm A' }, { id: 'g2', text: 'Nhóm B' }],
                    items: parsedData.items || [
                        { id: 'i1', text: 'Phần tử 1', groupId: 'g1' },
                        { id: 'i2', text: 'Phần tử 2', groupId: 'g2' },
                    ],
                };
            case 'QUIZ_TRUE_FALSE':
                return {
                    prompt: parsedData.prompt || 'Chọn Đúng hoặc Sai cho các nhận định sau:',
                    options: parsedData.options || [
                        { id: 'tf_1', text: 'Nhận định 1', isTrue: true },
                        { id: 'tf_2', text: 'Nhận định 2', isTrue: false },
                    ],
                    isAdvanced: parsedData.isAdvanced || false,
                };
            case 'QUIZ_COMPOSITE':
                return {
                    title: parsedData.title || 'Bài kiểm tra tổng hợp',
                    timeLimit: parsedData.timeLimit || 900,
                    totalPoints: parsedData.totalPoints || 10,
                    passingScore: parsedData.passingScore || 5,
                    hasGroups: parsedData.hasGroups || false,
                    groups: parsedData.groups || [],
                    questions: parsedData.questions || [],
                };
            default:
                return parsedData;
        }
    },
    generateId(prefix = 'id') {
        return `${prefix}_` + Math.random().toString(36).substr(2, 9);
    },
    cleanHtmlContent(content) {
        if (!content) return '';
        return content
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/>\s+</g, '><')
            .trim();
    },
    extractPromptHtml(block) {
        const regex = /^(<p[^>]*>\s*<strong>)?Câu\s*\d+\.?<\/strong>(.*?)((<p|<table|<figure|<img)[\s\S]*)/i;
        const match = block.match(regex);
        if (match) {
            let promptContent = `<p><strong>Câu hỏi.</strong>${match[2]}</p>` + match[3];
            return this.cleanHtmlContent(promptContent);
        }
        return this.cleanHtmlContent(block);
    },
    parseTrueFalseAnswers(text) {
        const result = {};
        const match = text.match(/Đáp án[:：]?([^<\n]+)/i);
        if (!match || !match[1]) return {};
        const pairs = match[1].split(/[;,]/).map((s) => s.trim());
        pairs.forEach((pair) => {
            const m = pair.match(/([a-dA-D])\s*[–\-]\s*([ĐSđs])/);
            if (m) {
                const optionId = m[1].toLowerCase();
                const isCorrect = m[2].toUpperCase() === 'Đ';
                result[optionId] = isCorrect;
            }
        });
        return result;
    },
    extractExplanation(text) {
        const match = text.match(/\([a-dA-D]\s*[–\-]\s*[^)]+\)/i);
        return match ? match[0] : '';
    },
    parseQuestionsByType(html, questionType, selectedGroupIndex = 0) {
        if (questionType === 'AUTO_DETECT') {
            if (/Đáp án[:\s]*[a-d][\s–\-]*[ĐS]/i.test(html)) {
                questionType = 'QUIZ_TRUE_FALSE';
            } else {
                const correctCount = (html.match(/<strong><u>[A-D]<\/u><\/strong>|<strong>[A-D]<\/strong>|<u>[A-D]<\/u>/gi) || []).length;
                questionType = correctCount > 1 ? 'QUIZ_MULTIPLE_CHOICE' : 'QUIZ_SINGLE_CHOICE';
            }
        }
        const blocks = html.split(/<p[^>]*><span[^>]*><strong>Câu\s*\d+\.?<\/strong>|<strong>Câu\s*\d+\.?<\/strong>|Câu\s*\d+\./gi);
        const numbered = html.match(/<p[^>]*><span[^>]*><strong>Câu\s*\d+\.?<\/strong>|<strong>Câu\s*\d+\.?<\/strong>|Câu\s*\d+\./gi) || [];
        const questions = [];
        for (let i = 1; i < blocks.length; i++) {
            const rawBlock = (numbered[i - 1] || `<p><strong>Câu ${i}.</strong></p>`) + blocks[i];
            try {
                const promptHtml = this.extractPromptHtml(rawBlock);
                let qObj = null;
                if (questionType === 'QUIZ_TRUE_FALSE') {
                    qObj = this.parseTrueFalseBlock(i, promptHtml);
                } else if (questionType === 'QUIZ_MULTIPLE_CHOICE') {
                    qObj = this.parseMultipleChoiceBlock(i, promptHtml, selectedGroupIndex);
                } else {
                    qObj = this.parseSingleChoiceBlock(i, promptHtml, selectedGroupIndex);
                }
                questions.push(qObj);
            } catch (e) {
                questions.push({
                    error: 'Lỗi phân tích câu hỏi',
                    errorDetail: e.toString(),
                    block: rawBlock.substring(0, 500) + '...',
                });
            }
        }
        return questions;
    },
    parseSingleChoiceBlock(i, html, selectedGroupIndex) {
        const optionRegex = /<strong[^>]*>(<u>)?([A-D])\.?(<\/u>)?<\/strong>([^<]*)/gi;
        const optionMatches = [...html.matchAll(optionRegex)];
        if (optionMatches.length < 2) {
            throw `Không đủ đáp án (chỉ tìm được ${optionMatches.length})`;
        }
        const options = [];
        let correctId = null;
        for (const match of optionMatches) {
            const id = match[2].toLowerCase();
            const labelHtml = match[0];
            let answerText = this.cleanHtmlContent(match[4].replace(/<[^>]+>/g, '').trim());
            if (/u>/.test(labelHtml)) correctId = id;
            options.push({ id, text: answerText });
        }
        const firstOptionPos = html.indexOf(optionMatches[0][0]);
        const promptHtml = html.slice(0, firstOptionPos).trim();
        return {
            id: `q_${selectedGroupIndex}_${i}`,
            type: 'QUIZ_SINGLE_CHOICE',
            points: 1,
            content: {
                prompt: promptHtml,
                options,
                correctAnswer: correctId || options[0]?.id || 'a',
            },
        };
    },
    parseMultipleChoiceBlock(i, html, selectedGroupIndex) {
        const optionRegex = /<strong[^>]*>(<u>)?([A-D])\.?(<\/u>)?<\/strong>([^<]*)/gi;
        const optionMatches = [...html.matchAll(optionRegex)];
        if (optionMatches.length < 2) {
            throw `Không đủ đáp án (chỉ tìm được ${optionMatches.length})`;
        }
        const options = [];
        const correctAnswers = [];
        for (const match of optionMatches) {
            const id = match[2].toLowerCase();
            const labelHtml = match[0];
            let answerText = this.cleanHtmlContent(match[4].replace(/<[^>]+>/g, '').trim());
            if (/u>/.test(labelHtml)) correctAnswers.push(id);
            options.push({ id, text: answerText });
        }
        const firstOptionPos = html.indexOf(optionMatches[0][0]);
        const promptHtml = html.slice(0, firstOptionPos).trim();
        return {
            id: `q_${selectedGroupIndex}_${i}`,
            type: 'QUIZ_MULTIPLE_CHOICE',
            points: 1,
            content: {
                prompt: promptHtml,
                options,
                correctAnswers: correctAnswers.length > 0 ? correctAnswers : [options[0]?.id || 'a'],
            },
        };
    },
    parseTrueFalseBlock(i, html) {
        const optionsRaw = [...html.matchAll(/<strong>\s*([A-D])\s*\.<\/strong>([\s\S]*?)(?=(<strong>\s*[A-D]\s*\.<\/strong>|<\/p>|<\/span>|$))/gi)];
        const options = optionsRaw.map((match) => ({
            id: match[1].toLowerCase(),
            text: match[2].replace(/<[^>]+>/g, '').trim(),
        }));
        if (options.length < 2) {
            throw `Không đủ lựa chọn True/False (chỉ tìm được ${options.length})`;
        }
        const answerKey = this.parseTrueFalseAnswers(html);
        const tfOptions = options.map((opt) => ({
            id: opt.id,
            text: opt.text,
            correctAnswer: !!answerKey?.[opt.id],
            inCorrectAnswer: answerKey?.[opt.id] === false,
        }));
        const firstOptionPos = html.indexOf(optionsRaw[0][0]);
        const promptHtml = html.slice(0, firstOptionPos).trim();
        const explanation = this.extractExplanation(html);
        return {
            id: `q${i}`,
            type: 'QUIZ_TRUE_FALSE',
            points: 1,
            content: {
                prompt: promptHtml,
                options: tfOptions,
                explanation,
            },
        };
    },
};