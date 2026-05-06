import { $el } from "../../../scripts/ui.js";
import { loadCss } from "../utils.js";
import { ConfirmDialog } from "../dialog/confirm/confirm-dialog.js";

loadCss("dom/css/number-input.css");

// ==============================================
// Number Input
// ==============================================
export class NumberInput {
    constructor({
        defaultValue = 0, 
        min = -Infinity, 
        max = Infinity, 
        step = 1, 
        width = 16,
        height = 64, 
        fontSize = 11, 
        onChange = null, 
        dialogTitle = "数値を入力", 
        dialogMessage = "", 
    } = {}) {
        this.onChange = onChange;

        this.options = {
            min: min, 
            max: max, 
            step: step
        };
        this._decimalPlaces = this._getDecimalPlaces(step);

        this.createUI();

        this._isDragging = false;
        this._dragSensitivity = 10;
        
        // プロパティ初期化
        this.width = width;
        this.height = height;
        this.fontSize = fontSize;

        // 値の初期化
        this._updateValue(defaultValue, false);

        this.dialog = new ConfirmDialog({
            title: dialogTitle, 
            message: dialogMessage, 
            valueType: "number", 
            onConfirm: (value) => this.value = value
        });
    }

    // ------------------------------------------
    // プロパティ
    // ------------------------------------------
    get value() {
        return this._value;
    }
    set value(v) {
        this._updateValue(v);
    }

    setStep(step) {
        this.options.step = step;
        this._decimalPlaces = this._getDecimalPlaces(step);
        this._updateValue(this.value, false);
    }

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

    get fontSize() {
        return this._fontSize;
    }
    set fontSize(v) {
        this._fontSize = v;
        const value = typeof v === "number" ? `${v}px` : v;
        this.element.style.setProperty("--font-size", value);
    }

    // ------------------------------------------
    // UI作成
    // ------------------------------------------
    createUI() {
        this.element = $el("div.jupo-number-input");

        // マイナスボタン
        const downButton = $el("button.jupo-number-input-button", {
            onclick: () => this._handleArrowClick(-1)
        });

        this._valueElement = $el("span.jupo-number-input-value");
        this._valueElement.addEventListener("mousedown", (e) => this._handleDragStart(e));
        this._valueElement.addEventListener("click", () => this._handleValueClick());

        // プラスボタン
        const upButton = $el("button.jupo-number-input-button", {
            onclick: () => this._handleArrowClick(1)
        });

        this.element.append(downButton, this._valueElement, upButton);
    }

    // ------------------------------------------
    // 内部状態の更新
    // ------------------------------------------
    _updateValue(newValue, dispatchEvent = true) {
        const step = this._getSnapStep();
        const factor = Math.pow(10, this._decimalPlaces);

        const roundedValue = Math.round(newValue / step) * step;
        const clampedValue = Math.max(this.options.min, Math.min(this.options.max, roundedValue));
        
        // 浮動小数点誤差対策
        const finalValue = parseFloat((Math.round(clampedValue * factor) / factor).toFixed(this._decimalPlaces));

        this._value = finalValue;
        this._valueElement.textContent = this._value.toFixed(this._decimalPlaces);

        if (dispatchEvent) {
            this.onChange?.(this._value);
        }
    }

    // ------------------------------------------
    // ハンドラー
    // ------------------------------------------
    _handleArrowClick(direction) {
        this._updateValue(this.value + (this.options.step * direction));
    }

    _handleValueClick() {
        if (this._isDragging) return;
        this.dialog.show(this.value);
    }

    _handleDragStart(startEvent) {
        startEvent.preventDefault();
        this._isDragging = false;

        const startX = startEvent.clientX;
        const startValue = this.value;

        const handleDragMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            
            // ドラッグ判定の閾値
            if (Math.abs(deltaX) > 2 && !this._isDragging) {
                this._isDragging = true;
                this.element.classList.add("is-number-dragging"); // スタイル用クラス追加
            }

            if (this._isDragging) {
                const valueChange = Math.round(deltaX / this._dragSensitivity) * this.options.step;
                this._updateValue(startValue + valueChange);
            }
        };

        const handleDragEnd = () => {
            document.removeEventListener("mousemove", handleDragMove);
            document.removeEventListener("mouseup", handleDragEnd);
            document.body.style.cursor = "";
            
            this.element.classList.remove("is-number-dragging"); // スタイル用クラス削除

            // クリックイベントとの競合を防ぐため、少し遅延させてフラグを下ろす
            setTimeout(() => { this._isDragging = false; }, 0);
        };

        document.addEventListener("mousemove", handleDragMove);
        document.addEventListener("mouseup", handleDragEnd);
        document.body.style.cursor = "ew-resize";
    }

    // ------------------------------------------
    // ユーティリティ
    // ------------------------------------------
    _getDecimalPlaces(value) {
        if (typeof value !== "number" || !isFinite(value)) return 0;
        const stepString = String(value);
        return stepString.includes(".") ? stepString.split(".")[1].length : 0;
    }

    _getSnapStep() {
        const baseStep = this.options.step;
        if (typeof baseStep !== "number" || baseStep <= 0 || !isFinite(baseStep)) {
            return 1;
        }
        if (this._decimalPlaces <= 0) {
            return 1;
        }
        return 1 / Math.pow(10, this._decimalPlaces);
    }

    show() {
        this.element.style.display = "";
    }
    hide() {
        this.element.style.display = "none";
    }
}
