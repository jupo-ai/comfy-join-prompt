import { $el } from "../../../scripts/ui.js";
import { loadCss } from "../utils.js";

loadCss("dom/css/textarea.css");

// ==============================================
// Textarea
// ==============================================
export class Textarea {
    constructor({
        defaultValue = "", 
        onChange = null, 
        readonly = false, 
    } = {}) {
        this.onChange = onChange;
        this.createUI();
        this.value = defaultValue;
        this.readonly = readonly;
    }

    // ------------------------------------------
    // プロパティ
    // ------------------------------------------
    get value() {
        return this.element.value;
    }
    set value(v) {
        this.element.value = v.toString();
    }

    get readonly() {
        return this.element.readonly;
    }
    set readonly(v) {
        this.element.readonly = v;
        this.element.classList.toggle("jupo-textarea-readonly", v);
    }

    // ------------------------------------------
    // UI作成
    // ------------------------------------------
    createUI() {
        this.element = $el("textarea.jupo-textarea");
        this.element.addEventListener("change", () => this.handleChange());
    }

    // ------------------------------------------
    // ハンドラー
    // ------------------------------------------
    handleChange() {
        this.onChange?.(this.element.value);
    }
}
