interface EditorOptions {
    editor?: string;
    textarea?: string;
    btn_h1?: string;
    btn_h2?: string;
    btn_bold?: string;
    btn_italic?: string;
}

const boldText = 'bold-text';
const italicText = 'italic-text';
const h1Text = 'header1-text';
const h2Text = 'header2-text';
const styles = [h1Text, h2Text];

type TextStyle = typeof h1Text | typeof h2Text | null;
type TextModifier = typeof boldText | typeof italicText;

interface Toolbar {
    [boldText]: boolean;
    [italicText]: boolean;
    style: TextStyle;
}

export class Editor {
    public editor: HTMLElement;
    public textarea: HTMLElement;
    public btn_h1: HTMLElement;
    public btn_h2: HTMLElement;
    public btn_bold: HTMLElement;
    public btn_italic: HTMLElement;
    public selection: any;
    public toolbar: Toolbar;
    private _toolbar: Toolbar = {
        [boldText]: false,
        [italicText]: false,
        style: null,
    }

    constructor(options: EditorOptions) {
        this.editor = document.querySelector(options?.editor ?? '.editor');
        this.textarea = this.editor.querySelector(options?.textarea ?? 'textarea');
        this.btn_h1 = this.editor.querySelector(options?.btn_h1 ?? 'btn_h1');
        this.btn_h2 = this.editor.querySelector(options?.btn_h2 ?? 'btn_h2');
        this.btn_bold = this.editor.querySelector(options?.btn_bold ?? 'btn_bold');
        this.btn_italic = this.editor.querySelector(options?.btn_italic ?? 'btn_italic');
        this.selection = null;
        this.toolbar = new Proxy(this._toolbar, {
            set: (t, p, v, r) => {
                if (p === 'style') {
                    if (v === h1Text) {
                        this.btn_h1.classList.add('active');
                        this.btn_h2.classList.remove('active');
                    }
                    if (v === h2Text) {
                        this.btn_h2.classList.add('active');
                        this.btn_h1.classList.remove('active');
                    }
                    if (v === null) {
                        this.btn_h2.classList.remove('active');
                        this.btn_h1.classList.remove('active');
                    }
                } else {
                    const action: 'add' | 'remove' = v ? 'add' : 'remove';
                    if (p === boldText) {
                        this.btn_bold.classList[action]('active');
                    }
                    if (p === italicText) {
                        this.btn_italic.classList[action]('active');
                    }
                }
                                
                return Reflect.set(t, p, v, r);
            }
        })
    }

    init() {
        this.textarea.setAttribute('tabindex', '1');
        this.textarea.setAttribute('contentEditable', 'true');
        this.btn_bold.addEventListener('click', this.makeBold);
        this.btn_italic.addEventListener('click', this.makeItalic);
        this.btn_h1.addEventListener('click', this.applyH1);
        this.btn_h2.addEventListener('click', this.applyH2);

        document.addEventListener('selectionchange', this.select);
        this.textarea.addEventListener('focus', () => {
            if (this.textarea.children.length === 0) {
                this.addParagraph();
                const span = this.textarea.lastElementChild.querySelector('span');
                this.moveCaretTo(span);
            }
        })

        // предотвращает удаление первого параграфа и спана внутри
        this.textarea.addEventListener('keydown', function (e) {
            if (this.innerText.length <= 1) {
                if (e.code === 'Backspace') {
                    e.preventDefault();
                }
            }
        });

        this.textarea.addEventListener('cut', function(e) {
            if (this.innerText.length <= 1) {
                // TODO: предотвратить удаление параграфа
            }
        })

        this.textarea.addEventListener('paste', (e) => {
            // TODO: вставка форматированного текста
            if (e.clipboardData.types.includes('text/plain')) {
                // console.log(e.clipboardData.getData('text/plain'))
            }
            if (e.clipboardData.types.includes('text/html')) {
                // console.log(e.clipboardData.getData('text/html'))
            }
        })
    }

    addParagraph = () => {
        const div = document.createElement('div');
        const span = document.createElement('span');
        span.innerHTML = '&#8203;';
        div.appendChild(span);
        div.classList.add('paragraph');
        this.textarea.appendChild(div);
    }

    moveCaretTo(node: HTMLSpanElement):void {
        const range = document.createRange();
        range.selectNodeContents(node);
        range.collapse(true);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    select = () => {
        const selection = document.getSelection();
        if (selection.isCollapsed) {
            const span = selection.anchorNode.parentElement;
            // выделение кнопок
            this.toolbar[boldText] = span.classList.contains(boldText);
            this.toolbar[italicText] = span.classList.contains(italicText);
            this.toolbar.style = span.classList.contains(h1Text) ? h1Text : span.classList.contains(h2Text) ? h2Text : null;

            if (this.selection) {
                this.selection = null;
            }
        } else {
            if (this.textarea.contains(selection.anchorNode)) {

                this.selection = selection;

                const container = selection.getRangeAt(0).commonAncestorContainer;

                // выделение кнопок
                if (container.nodeType === 3) {
                    const span = container.parentElement;
                    this.toolbar[boldText] = span.classList.contains(boldText);
                    this.toolbar[italicText] = span.classList.contains(italicText);
                    this.toolbar.style = span.classList.contains(h1Text) ? h1Text : span.classList.contains(h2Text) ? h2Text : null;
                } else if (container.nodeName === 'SPAN') {
                    this.toolbar[boldText] = (container as HTMLElement).classList.contains(boldText);
                    this.toolbar[italicText] = (container as HTMLElement).classList.contains(italicText);
                    this.toolbar.style = (container as HTMLElement).classList.contains(h1Text) ? h1Text : (container as HTMLElement).classList.contains(h2Text) ? h2Text : null;
                } else {
                    const fr = this.selection.getRangeAt(0).cloneContents();
                    const spans = fr.querySelectorAll('span');
                    const spansAr = Array.from(spans);

                    this.toolbar[boldText] = spansAr.every(span => (span as HTMLElement).classList.contains(boldText));
                    this.toolbar[italicText] = spansAr.every(span => (span as HTMLElement).classList.contains(italicText));
                    this.toolbar.style = spansAr.every(span => (span as HTMLElement).classList.contains(h1Text)) 
                                            ? h1Text 
                                            : spansAr.every(span => (span as HTMLElement).classList.contains(h2Text))
                                                ? h2Text
                                                : null;
                }

            } else {
                if (this.selection) {
                    this.selection = null;
                }
            }
        }
    }

    applyModifier = (mod: TextModifier) => () => {
        const spans = this.processSelection();
        const isAllSelectedSpansModified = spans.every((span) => span.classList.contains(mod));

        if (isAllSelectedSpansModified) {
            spans.forEach((span) => span.classList.toggle(mod));
            this.toolbar[mod] = !this.toolbar[mod];
        } else {
            spans.forEach((span) => span.classList.add(mod));
            this.toolbar[mod] = true;
        }
    }

    makeBold = this.applyModifier(boldText);
    makeItalic = this.applyModifier(italicText);

    applyStyle = (style: TextStyle) => () => {
        const spans = this.processSelection();
        const isStyled = spans.every((span) => span.classList.contains(style));
        const filteredStyles = styles.filter(s => s !== style);
        
        if (isStyled) {
            spans.forEach(span => span.classList.toggle(style));
            this.toolbar.style = null;
        } else {
            spans.forEach(span => {
                filteredStyles.forEach(fStyle => span.classList.remove(fStyle));
                span.classList.add(style);
                this.toolbar.style = style;
            })
        }
    }

    applyH1 = this.applyStyle(h1Text);
    applyH2 = this.applyStyle(h2Text);
    
    processSelection(): HTMLElement[] {
        const selection = this.selection;
        const range: Range = selection.getRangeAt(0);
        const output: HTMLElement[] = [];
        
        if (range.startContainer === range.endContainer) {
            // выделение внутри одного узла
            if (range.startContainer.nodeType === 3) {
                // выделили текстовый узел
                if (range.startOffset === 0 && range.endOffset === (range.endContainer as Text).length) {
                    // выделен весь узел полностью
                    // все текстовые узлы должны быть в спанах
                    const span = range.startContainer.parentElement;
                    output.push(span);
                } else {
                    // узел выделен не полностью разбить на спаны
                    const span = range.startContainer.parentElement;
                    const mSpan = splitSpan(span, range.startOffset, range.endOffset);
                    output.push(mSpan);
                }
            } else {
                // выделен либо span либо параграф
                if (range.startContainer.nodeName === 'SPAN') {
                    output.push(range.startContainer as HTMLElement);
                } else if ((range.startContainer as HTMLElement).classList.contains('paragraph')) {
                    for (let i = range.startOffset; i < range.endOffset; i++) {
                        output.push((range.startContainer as HTMLElement).children.item(i) as HTMLElement);
                    }
                }

                // TODO: добавить проверку на див
            }
        } else {
            // выделение в разных узлах
            const wrap = range.commonAncestorContainer as HTMLElement;
            // wrap должен быть либо .paragraph либо textarea;
            // FIXME hardcode
            if (wrap.classList.contains('paragraph')) {
                output.push(...getSpans(wrap, range))
            }

            // FIXME hardcode
            if (wrap.classList.contains('edit-area')) {
                // внутри textarea должны быть только параграфы
                let firstP: HTMLElement;
                let lastP: HTMLElement;

                if (range.startContainer.nodeType === 3) {
                    const el = range.startContainer.parentElement;
                    if (el.classList.contains('paragraph')) {
                        firstP = el;
                    } else {
                        firstP = el.closest('.paragraph');
                    }
                } else {
                    if ((range.startContainer as HTMLElement).classList.contains('paragraph')) {
                        firstP = range.startContainer as HTMLElement;
                    } else {
                        firstP = (range.startContainer as HTMLElement).closest('.paragraph');
                    }
                }

                if (range.endContainer.nodeType === 3) {
                    const el = range.endContainer.parentElement;
                    if (el.classList.contains('paragraph')) {
                        lastP = el;
                    } else {
                        lastP = el.closest('.paragraph');
                    }
                } else {
                    if ((range.endContainer as HTMLElement).classList.contains('paragraph')) {
                        lastP = range.endContainer as HTMLElement;
                    } else {
                        lastP = (range.endContainer as HTMLElement).closest('.paragraph');
                    }
                }

                let next = firstP;

                while (next && next !== lastP) {
                    output.push(...getSpans(next, range));
                    next = next.nextElementSibling as HTMLElement;
                }

                output.push(...getSpans(lastP, range));
            }
        }

        const newRange = new Range();
        newRange.setStartBefore(output[0]);
        newRange.setEndAfter(output[output.length - 1]);

        const sel = document.getSelection();
        sel.removeAllRanges();
        sel.addRange(newRange);

        return output;
    }
}

function splitSpan(span: HTMLElement, startOffset: number, endOffset: number): HTMLElement {
    let fSpan: Node;
    let mSpan: HTMLElement = span.cloneNode(true) as HTMLElement; // выделенный спан
    let lSpan: Node;

    // выделение не сначала
    if (startOffset !== 0) {
        fSpan = span.cloneNode(true);
        (fSpan.firstChild as Text).splitText(startOffset);
        fSpan.lastChild.remove();

        (mSpan.firstChild as Text).splitText(startOffset);
        mSpan.firstChild.remove();
    }

    // выделение не до конца
    if (endOffset !== (span.firstChild as Text).length) {
        (mSpan.firstChild as Text).splitText(endOffset - startOffset);
        mSpan.lastChild.remove();

        lSpan = span.cloneNode(true);
        (lSpan.firstChild as Text).splitText(endOffset);
        lSpan.firstChild.remove();
    }

    const spans = [fSpan, mSpan, lSpan].filter(span => typeof span !== 'undefined');
    span.replaceWith(...spans);

    return mSpan;
}

function getSpans(wrap: HTMLElement, range: Range): HTMLElement[] {
    const output: HTMLElement[] = [];
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    let startSpan: HTMLElement;
    let endSpan: HTMLElement;

    if (wrap.contains(startContainer)) {
        if (startContainer.nodeType === 3) {
            startSpan = splitSpan(startContainer.parentElement, range.startOffset, (startContainer as Text).length);
        } else {
            if (startContainer.nodeName === 'SPAN') {
                startSpan = startContainer as HTMLElement;
            } else {
                startSpan = (startContainer as HTMLElement).querySelector('span');
            }
            // другие варианты?
        }
        output.push(startSpan);
    }
    
    if (wrap.contains(endContainer)) {
        if (endContainer.nodeType === 3) {
            endSpan = splitSpan(endContainer.parentElement, 0, range.endOffset);
        } else {
            if (endContainer.nodeName === 'SPAN') {
                endSpan = endContainer as HTMLElement;
            } else {
                endSpan = (endContainer as HTMLElement).querySelector('span:last-child');
            }
            // другие варианты?
        }
    }

    let next = (startSpan ? startSpan.nextElementSibling : wrap.firstElementChild) as HTMLElement;

    while (next && next !== endSpan) {
        output.push(next)
        next = next.nextElementSibling as HTMLElement;
    }

    if (endSpan) {
        output.push(endSpan);
    }

    return output;
}
