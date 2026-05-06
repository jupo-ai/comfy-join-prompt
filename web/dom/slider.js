import { $el } from "../../../scripts/ui.js";
import { loadCss } from "../utils.js";
import { NumberInput } from "./number-input.js";

loadCss("dom/css/slider.css");

// ==============================================
// Slider
// ==============================================
export class Slider {
    constructor({
        label = "", 
        labelTitle = "", 
        value = 0, 
        min = 0, 
        max = 100, 
        step = 1, 
        onChange = null,
        numberInputWidth = 80,
        restrict = false, // NumberInputのminmaxを制限するか
    } = {}) {
        this.onChange = onChange;
        this.label = label;
        this.labelTitle = labelTitle;
        
        // 内部状態
        this._min = min;
        this._max = max;
        this._step = step;
        this._value = value;
        this._restrict = restrict;

        this.createUI(numberInputWidth);

        // 初期値反映
        this.value = value;
    }

    // ------------------------------------------
    // プロパティ
    // ------------------------------------------
    get value() {
        return this._value;
    }

    set value(v) {
        this._value = v;

        // 1. NumberInput更新
        if (this.numberInput.value !== v) {
            this.numberInput.value = v;
        }

        // 2. RangeInput更新
        // HTML仕様でmin/maxにクランプされるが、それでOK
        this.rangeInput.value = v;

        // 3. プログレスバー(背景色)の更新
        this._updateProgress();

        // コールバック
        if (typeof this.onChange === "function") {
            this.onChange(v);
        }
    }

    get min() { return this._min; }
    set min(v) {
        this._min = v;
        this.rangeInput.min = v;
        this._updateProgress();
    }

    get max() { return this._max; }
    set max(v) {
        this._max = v;
        this.rangeInput.max = v;
        this._updateProgress();
    }

    // ------------------------------------------
    // UI作成
    // ------------------------------------------
    createUI(niWidth) {
        this.element = $el("div.jupo-slider-container");

        // --- 上段: ラベル + NumberInput ---
        const headerRow = $el("div.jupo-slider-header");
        
        const labelEl = $el("span.jupo-slider-label", {
            textContent: this.label, 
            title: this.labelTitle || this.label
        });

        // 修正: NumberInputのサイズを少し大きく設定
        this.numberInput = new NumberInput({
            value: this._value,
            min: this._restrict ? this._min : -Infinity, 
            max: this._restrict ? this._max : Infinity,
            step: this._step,
            width: niWidth,
            height: 24,      
            fontSize: 12, 
            onChange: (val) => {
                this.value = val;
            }
        });

        headerRow.appendChild(labelEl);
        headerRow.appendChild(this.numberInput.element);

        // --- 下段: スライダー ---
        const bodyRow = $el("div.jupo-slider-body");

        this.rangeInput = $el("input.jupo-slider-range", {
            type: "range",
            min: this._min,
            max: this._max,
            step: this._step
        });

        this.rangeInput.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            this.value = val;
        });

        bodyRow.appendChild(this.rangeInput);

        this.element.appendChild(headerRow);
        this.element.appendChild(bodyRow);
    }

    // ------------------------------------------
    // 内部処理: プログレスバー更新
    // ------------------------------------------
    _updateProgress() {
        if (!this.rangeInput) return;

        // 現在値がmin〜maxのどこにあるかを計算 (0% 〜 100%)
        let percent = ((this._value - this._min) / (this._max - this._min)) * 100;

        // 範囲外の値(NumberInputからの入力)の場合の表示制御
        if (percent < 0) percent = 0;
        if (percent > 100) percent = 100;

        this.rangeInput.style.setProperty("--percent", `${percent}%`);
    }
}
