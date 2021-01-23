import {Editor} from './wysiwig';

const editor = new Editor({
    editor: '.editor',
    textarea: '.edit-area',
    btn_h1: '.head-1',
    btn_h2: '.head-2',
    btn_bold: '.bold',
    btn_italic: '.italic',
});

editor.init();
