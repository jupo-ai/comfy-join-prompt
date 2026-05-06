import { $el } from "../../../scripts/ui.js";
import { loadCss } from "../utils.js";

loadCss("dom/css/toggle-switch.css");

// ==============================================
// Toggle Switch
// ==============================================
export class ToggleSwitch {
    constructor({
        defaultValue = false, 
        width = 48, 
        height = 24, 
        onChange = null
    } = {}) {
        this.onChange = onChange;
        this.createUI();

        this.width = width;
        this.height = height;
        this.setState(defaultValue, false);
    }

    // ------------------------------------------
    // プロパティ
    // ------------------------------------------
    get width() {
        return this._width;
    }
    set width(v) {
        this._width = v;
        const widthValue = typeof v === "number" ? `${v}px` : v;
        this.element.style.setProperty("--width", widthValue);
    }

    get height() {
        return this._height;
    }
    set height(v) {
        this._height = v;
        const heightValue = typeof v === "number" ? `${v}px` : v;
        this.element.style.setProperty("--height", heightValue);
    }

    get value() {
        return this.inputElement.checked;
    }
    set value(v) {
        this.setState(v);
    }

    get isIndeterminate() {
        return this.inputElement.indeterminate;
    }



    // ------------------------------------------
    // UI作成
    // ------------------------------------------
    createUI() {
        this.element = $el("label.jupo-toggle");

        this.inputElement = $el("input.jupo-toggle-input", { type: "checkbox" });
        this.inputElement.addEventListener("click", () => this._handleClick());
        this.inputElement.addEventListener("change", () => this._handleChange());

        const slider = $el("span.jupo-toggle-slider");

        this.element.append(this.inputElement, slider);
    }

    // ------------------------------------------
    // 内部状態の更新
    // ------------------------------------------
    setState(state, dispatchEvent = true) {
        if (state === "indeterminate") {
            this.inputElement.indeterminate = true;
            this.inputElement.checked = false;
            if (dispatchEvent) this.inputElement.dispatchEvent(new Event("change"));
        } else {
            const newState = !!state;
            this.inputElement.indeterminate = false;
            this.inputElement.checked = newState;
            if (dispatchEvent) this.inputElement.dispatchEvent(new Event("change"));
        }
    }
    

    // ------------------------------------------
    // ハンドラー
    // ------------------------------------------
    _handleClick() {
        if (this.isIndeterminate) {
            this.inputElement.indeterminate = false;
        }
    }

    _handleChange() {
        if (this.isIndeterminate) return;
        this.onChange?.(this.value);
    }

    // ------------------------------------------
    // ユーティリティ
    // ------------------------------------------
    toggle(force = null) {
        const newValue = force === null ? !this.value : force;
        this.value = newValue;
    }

    indeterminate() {
        this.setState("indeterminate");
    }

    enable() {
        this.inputElement.disabled = false;
        this.element.classList.remove("jupo-toggle--disabled");
    }
    disable() {
        this.inputElement.disabled = true;
        this.element.classList.add("jupo-toggle--disabled");
    }

    show() {
        this.element.style.display = "";
    }
    hide() {
        this.element.style.display = "none";
    }
}