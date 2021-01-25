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
    public textdelete: CustomEvent;
    private _toolbar: Toolbar = {
        [boldText]: false,
        [italicText]: false,
        style: null,
    };

    constructor(options: EditorOptions) {
        this.editor = document.querySelector(options?.editor ?? '.editor');
        this.textarea = this.editor.querySelector(options?.textarea ?? 'textarea');
        this.btn_h1 = this.editor.querySelector(options?.btn_h1 ?? 'btn_h1');
        this.btn_h2 = this.editor.querySelector(options?.btn_h2 ?? 'btn_h2');
        this.btn_bold = this.editor.querySelector(options?.btn_bold ?? 'btn_bold');
        this.btn_italic = this.editor.querySelector(options?.btn_italic ?? 'btn_italic');
        this.selection = null;
        this.textdelete = new CustomEvent('textdelete');
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
            },
        });
    }

    init() {
        this.textarea.setAttribute('tabindex', '1');
        this.textarea.setAttribute('contentEditable', 'true');
        this.btn_bold.addEventListener('click', this.makeBold);
        this.btn_italic.addEventListener('click', this.makeItalic);
        this.btn_h1.addEventListener('click', this.applyH1);
        this.btn_h2.addEventListener('click', this.applyH2);

        document.addEventListener('selectionchange', this.select);
        this.addPStyle();
        this.textarea.addEventListener('focus', () => {
            if (this.textarea.children.length === 0) {
                this.addParagraph();
                const span = this.textarea.lastElementChild.querySelector('span');
                this.moveCaretTo(span);
            }
        });

        this.textarea.addEventListener('textdelete', () => {
            setTimeout(() => {
                if (this.textarea.innerText == "\n" || this.textarea.innerText === "") {
                    this.textarea.innerHTML = '';
                    this.addParagraph();
                } else {
                    const pars = this.textarea.querySelectorAll('.' + Array.from(this.textarea.classList).join('.') + ' .paragraph');
                    pars.forEach(this.wrapText);
                }
            }, 0)
        })

        // предотвращает удаление первого параграфа и спана внутри
        this.textarea.addEventListener('keydown', (e) => {
            if (this.textarea.innerText === '\u200b' || this.textarea.innerText.length === 0) {
                if (e.code === 'Backspace') {
                    e.preventDefault();
                }
            }

            if (e.code === 'Backspace' || e.code === 'Delete') {
                if (this.selection) {
                    this.textarea.dispatchEvent(this.textdelete);
                }
            }
        });

        this.textarea.addEventListener('keyup', (e) => {
            if (e.code === 'Backspace' || e.code === 'Delete') {
                const pars = this.textarea.querySelectorAll('.paragraph');
                pars.forEach(p => {
                    if (!p.querySelector('span')) {
                        // FIXME подумать как сделать чтобы сохранять курсор 
                        this.textarea.dispatchEvent(new CustomEvent('emptyparagraph', {detail: {p} }));
                    }
                })
            }
            
        })

        this.textarea.addEventListener('emptyparagraph', (e: any) => {
            e.detail.p.remove()
        });

        this.textarea.addEventListener('blur', () => {
            if (this.textarea.innerText === '\u200b' || this.textarea.innerText === "") {
                this.textarea.innerHTML = '';
            }
        });

        this.textarea.addEventListener('cut', (e) => {
            this.applyStylesToParagraphs();
            setTimeout(() => {
                this.textarea.dispatchEvent(this.textdelete);
            }, 0)
            
        });

        this.textarea.addEventListener('paste', (e) => {
            console.log(e.clipboardData.getData('text/html'))
            setTimeout(() => {
                const pars = this.textarea.querySelectorAll('.' + Array.from(this.textarea.classList).join('.') + ' .paragraph');
                pars.forEach(this.upParagraphs);
                pars.forEach(this.wrapText);
                pars.forEach(par => {
                    if (par.textContent.length === 0) {
                        par.remove();
                    }
                })
            }, 50);
        });

        this.textarea.addEventListener('copy', (e) => {
            this.applyStylesToParagraphs();
        })
    }

    upParagraphs = (par) => {
        let last = par;
        par.querySelectorAll('.paragraph').forEach(p => {
            console.log(p)
            last.after(p);
            last = p
        })
    }
    wrapText = (par) => {
        par.childNodes.forEach(n => {
            if (n.nodeType === 3) {
                const span = document.createElement('span');
                span.innerText = n.textContent;
                n.replaceWith(span);
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
    };

    addPStyle() {
        const style = document.createElement('style');
        style.innerHTML = '.paragraph {font-size: 1rem;}';
        document.head.append(style);
    }

    moveCaretTo(node: HTMLSpanElement): void {
        const range = document.createRange();
        range.selectNodeContents(node);
        range.collapse(true);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    select = () => {
        const selection = document.getSelection();
        // console.log(selection)
        if (this.textarea.contains(selection.anchorNode)) {
            if (selection.isCollapsed) {
                const span = selection.anchorNode.parentElement;

                if (span && span.nodeName === 'SPAN') {
                    // выделение кнопок
                    this.toolbar[boldText] = span.classList.contains(boldText);
                    this.toolbar[italicText] = span.classList.contains(italicText);

                    const p = span.closest('.paragraph');

                    this.toolbar.style = p.classList.contains(h1Text)
                        ? h1Text
                        : p.classList.contains(h2Text)
                        ? h2Text
                        : null;
                }
                

                if (this.selection) {
                    this.selection = null;
                }
            } else {
                this.selection = selection;

                const container = selection.getRangeAt(0).commonAncestorContainer;

                // выделение кнопок
                if (container.nodeType === 3) {
                    const span = container.parentElement;
                    this.toolbar[boldText] = span.classList.contains(boldText);
                    this.toolbar[italicText] = span.classList.contains(italicText);

                    const p = span.closest('.paragraph');
                    
                    this.toolbar.style = p.classList.contains(h1Text)
                        ? h1Text
                        : p.classList.contains(h2Text)
                        ? h2Text
                        : null;

                } else if (container.nodeName === 'SPAN') {
                    this.toolbar[boldText] = (container as HTMLElement).classList.contains(boldText);
                    this.toolbar[italicText] = (container as HTMLElement).classList.contains(italicText);
                    
                    const p = (container as HTMLElement).closest('.paragraph');

                    this.toolbar.style = p.classList.contains(h1Text)
                        ? h1Text
                        : p.classList.contains(h2Text)
                        ? h2Text
                        : null;
                } else {
                    const fr = this.selection.getRangeAt(0).cloneContents();
                    const spans = fr.querySelectorAll('span');
                    const spansAr = Array.from(spans);

                    this.toolbar[boldText] = spansAr.length > 0 && spansAr.every((span) =>
                        (span as HTMLElement).classList.contains(boldText)
                    );
                    this.toolbar[italicText] = spansAr.length > 0 && spansAr.every((span) =>
                        (span as HTMLElement).classList.contains(italicText)
                    );

                    if ((container as HTMLElement).classList.contains('paragraph')) {
                        const p = container as HTMLElement;

                        this.toolbar.style = p.classList.contains(h1Text)
                            ? h1Text
                            : p.classList.contains(h2Text)
                            ? h2Text
                            : null;
                    } else {
                        const paragraphs = new Set<HTMLElement>();
                        spans.forEach(span => {
                            paragraphs.add(span.closest('.paragraph'))
                        });

                        const ar = Array.from(paragraphs);

                        this.toolbar.style = ar.every((p) => p.classList.contains(h1Text))
                            ? h1Text
                            : ar.every((p) => p.classList.contains(h2Text))
                            ? h2Text
                            : null;
                    }
                }
            }
        } else {
            if (this.selection) {
                this.selection = null;
            }
        }
    };

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
    };

    makeBold = this.applyModifier(boldText);
    makeItalic = this.applyModifier(italicText);

    applyStyle = (style: TextStyle) => () => {
        const spans = this.processSelection();

        if (spans[0] !== spans[0].closest('.paragraph').firstElementChild) {
            const parToSplit = spans[0].closest('.paragraph');
            const newPar = document.createElement('div');
            newPar.classList.add('paragraph')
            parToSplit.after(newPar);
            parToSplit.childNodes.forEach(ch => {
                if (spans.includes(ch as HTMLElement)) {
                    newPar.append(ch);
                }
            });
        }

        if (spans[spans.length - 1] !== spans[spans.length - 1].closest('.paragraph').lastElementChild) {
            const parToSplit = spans[spans.length - 1].closest('.paragraph');
            const newPar = document.createElement('div');
            newPar.classList.add('paragraph')
            parToSplit.before(newPar);
            parToSplit.childNodes.forEach(ch => {
                if (spans.includes(ch as HTMLElement)) {
                    newPar.append(ch);
                }
            });
        }


        const paragraphs = new Set<HTMLElement>();
        spans.forEach(span => {
            paragraphs.add(span.closest('.paragraph'))
        });

        const ar = Array.from(paragraphs);

        const isStyled = ar.every((p) => p.classList.contains(style));
        const filteredStyles = styles.filter((s) => s !== style);

        if (isStyled) {
            ar.forEach((p) => p.classList.toggle(style));
            this.toolbar.style = null;
        } else {
            ar.forEach((p) => {
                filteredStyles.forEach((fStyle) => p.classList.remove(fStyle));
                p.classList.add(style);
                this.toolbar.style = style;
            });
        }
    };

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
                    let span = range.startContainer.parentElement;
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
                output.push(...getSpans(wrap, range));
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

    applyStylesToParagraphs() {
        document.querySelectorAll('.paragraph').forEach(p => {
            const computedProps = getComputedStyle(p);

            getAppliedStyleProps(p as HTMLElement).forEach(prop => {
                (p as HTMLElement).style[prop] = computedProps[prop];
            });
            
        })
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

    const spans = [fSpan, mSpan, lSpan].filter((span) => {
        return typeof span !== 'undefined' && span.textContent !== "\n" && span.textContent !== "\u200b"
    });
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
        output.push(next);
        next = next.nextElementSibling as HTMLElement;
    }

    if (endSpan) {
        output.push(endSpan);
    }

    return output;
}

function getAppliedStyleProps(el: HTMLElement): Array<string> {
    const appliedRules = new Set<string>();
    for (let i = 0; i < document.styleSheets.length; i++) {
        const rules = document.styleSheets[i].cssRules;
        for (let j = 0; j < rules.length; j++) {
            const rule = rules[j] as CSSStyleRule;
            if (el.matches(rule.selectorText)) {
                for (let k = 0; k < rule.style.length; k++) {
                    const styleProp = rule.style[k];
                    appliedRules.add(styleProp);
                }
                
            }
        }
    }
    return Array.from(appliedRules);
}
