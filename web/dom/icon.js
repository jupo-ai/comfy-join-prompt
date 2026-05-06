import { $el } from "../../../scripts/ui.js";
import { loadCss } from "../utils.js";

loadCss("dom/css/icon.css");

// ==============================================
// Icon
// ==============================================
export class Icon {
    constructor({ icon, size = "" }) {
        this.createUI(icon);
        if (size) this.size = size;
    }

    get size() {
        return this._size;
    }
    set size(v) {
        this._size = v;
        const sizeValue = typeof v === "number" ? `${v}px` : v;
        this.element.style.fontSize = sizeValue;
    }

    createUI(icon) {
        // mdi クラス等はプロジェクトのアイコンセットに合わせてください
        this.element = $el(`i.mdi.mdi-${icon}.jupo-icon`);
    }
}


// ==============================================
// Icon Button
// ==============================================
export class IconButton {
    constructor({ icon, title = "", size = 16, padding = 4, onClick = null }) {
        this.onClick = onClick;
        this.createUI(icon, title);
        this.size = size;
        this.padding = padding;
    }

    get size() {
        return this._size;
    }
    set size(v) {
        this._size = v;
        const sizeValue = typeof v === "number" ? `${v}px` : v;
        // CSS変数 --icon-size をセットする
        this.element.style.setProperty("--icon-size", sizeValue);
    }

    get padding() {
        return this._padding;
    }
    set padding(v) {
        this._padding = v;
        const paddingValue = typeof v === "number" ? `${v}px` : v;
        this.element.style.setProperty("--button-padding", paddingValue);
    }

    createUI(icon, title) {
        this.element = $el("button.jupo-icon-button", {
            title: title, 
            onclick: (e) => {
                // ボタンのフォーカスが残り続けるのを防ぐ（見た目上の好み）
                this.element.blur();
                this.onClick?.(e);
            }
        });
        const iconInstance = new Icon({ icon: icon });
        // Iconクラスのスタイルが優先されないよう、font-size制御は親(Button)に任せる
        iconInstance.element.style.fontSize = ""; 
        
        this.element.append(iconInstance.element);
    }
}


// ==============================================
// Icon Toggle
// ==============================================
export class IconToggle {
    constructor({ icon, title = "", size = 16, padding = 4, value = false, onChange = null }) {
        this.onChange = onChange;
        this.createUI(icon, title);

        this.size = size;
        this.padding = padding;
        
        // 初期状態セット (イベント発火なし)
        this.setState(value, false);
    }

    get size() {
        return this._size;
    }
    set size(v) {
        this._size = v;
        const sizeValue = typeof v === "number" ? `${v}px` : v;
        this.element.style.setProperty("--icon-size", sizeValue);
    }

    get padding() {
        return this._padding;
    }
    set padding(v) {
        this._padding = v;
        const paddingValue = typeof v === "number" ? `${v}px` : v;
        this.element.style.setProperty("--button-padding", paddingValue);
    }

    get value() {
        return this._value;
    }
    set value(bool) {
        this.setState(bool);
    }

    createUI(icon, title) {
        this.element = $el("button.jupo-icon-toggle", {
            title: title, 
            onclick: () => this._handleClick()
        });

        const iconInstance = new Icon({ icon: icon });
        iconInstance.element.style.fontSize = ""; // 親に任せる
        this.element.append(iconInstance.element);
    }

    _handleClick() {
        if (this.element.disabled) return;
        this.toggle();
    }

    _handleChange() {
        this.onChange?.(this.value);
    }

    setState(state, dispatchEvent = true) {
        this._value = !!state;
        
        // クラスの着脱のみを行う（不透明度操作はCSSに任せる）
        this._updateClass();
        
        if (dispatchEvent) this._handleChange();
    }

    _updateClass() {
        this.element.classList.toggle("jupo-icon-toggle--enabled", this.value);
    }
    
    toggle(force = null) {
        const newValue = force === null ? !this.value : force;
        this.value = newValue;
    }

    indeterminate() {
        this.setState("indeterminate");
    }

    enable() {
        this.element.disabled = false;
    }

    disable() {
        this.element.disabled = true;
    }

    show() {
        this.element.style.display = "";
    }

    hide() {
        this.element.style.display = "none";
    }
}