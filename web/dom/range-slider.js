import { $el } from "../../../scripts/ui.js";
import { loadCss } from "../utils.js";
import { NumberInput } from "./number-input.js";

loadCss("dom/css/range-slider.css");

// ==============================================
// Range Slider (Start - End)
// ==============================================
export class RangeSlider {
    constructor({
        label = "", 
        start = 0,
        end = 100,
        min = 0, 
        max = 100, 
        step = 1, 
        onChange = null,
        numberInputWidth = 80, // 2つ並ぶため少し狭めに
        restrict = false, // NumberInputのminmaxを制限するか
    } = {}) {
        this.onChange = onChange;
        this.label = label;
        
        // 内部状態
        this._min = min;
        this._max = max;
        this._step = step;
        this._restrict = restrict;
        
        // start/end のバリデーション
        this._start = Math.max(min, Math.min(start, end));
        this._end = Math.min(max, Math.max(end, start));

        this.createUI(numberInputWidth);

        // 初期値反映
        this.updateUI();
    }

    // ------------------------------------------
    // プロパティ
    // ------------------------------------------
    get start() { return this._start; }
    set start(v) {
        // endを超えないようにクランプ
        const val = Math.min(v, this._end);
        this._start = val;
        this.updateUI();
        this._triggerChange();
    }

    get end() { return this._end; }
    set end(v) {
        // startを下回らないようにクランプ
        const val = Math.max(v, this._start);
        this._end = val;
        this.updateUI();
        this._triggerChange();
    }

    get min() { return this._min; }
    set min(v) {
        this._min = v;
        this.inputLeft.min = v;
        this.inputRight.min = v;
        this.updateUI();
    }

    get max() { return this._max; }
    set max(v) {
        this._max = v;
        this.inputLeft.max = v;
        this.inputRight.max = v;
        this.updateUI();
    }

    // ------------------------------------------
    // UI作成
    // ------------------------------------------
    createUI(niWidth) {
        this.element = $el("div.jupo-range-container");

        // --- 上段: ラベル + NumberInputs ---
        const headerRow = $el("div.jupo-range-header");
        
        const labelEl = $el("span.jupo-range-label", {
            textContent: this.label
        });

        const inputsWrapper = $el("div.jupo-range-inputs");

        // Start用 Input
        this.numberStart = new NumberInput({
            value: this._start,
            min: this._restrict ? this._min : -Infinity, 
            max: this._restrict ? this._max : Infinity, 
            step: this._step,
            width: niWidth, height: 24, fontSize: 12,
            onChange: (val) => { this.start = val; }
        });

        // セパレーター
        const sep = $el("span", { textContent: "-" });

        // End用 Input
        this.numberEnd = new NumberInput({
            value: this._end,
            min: this._restrict ? this._min : -Infinity, 
            max: this._restrict ? this._max : Infinity, 
            step: this._step,
            width: niWidth, height: 24, fontSize: 12,
            onChange: (val) => { this.end = val; }
        });

        inputsWrapper.appendChild(this.numberStart.element);
        inputsWrapper.appendChild(sep);
        inputsWrapper.appendChild(this.numberEnd.element);

        headerRow.appendChild(labelEl);
        headerRow.appendChild(inputsWrapper);

        // --- 下段: スライダー本体 ---
        const bodyRow = $el("div.jupo-range-body");

        // 背景トラックとハイライトバー
        this.trackEl = $el("div.jupo-range-track");
        this.highlightEl = $el("div.jupo-range-highlight");
        this.trackEl.appendChild(this.highlightEl);

        // 2つのRange Input (Left:Start / Right:End)
        this.inputLeft = this._createRangeInput();
        this.inputRight = this._createRangeInput();

        // Left (Start) のイベント
        this.inputLeft.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            // 右側を超えようとしたら止める
            if (val > this._end) {
                e.target.value = this._end;
                this._start = this._end;
            } else {
                this._start = val;
            }
            this.updateUI(true); // skipInputUpdate = true
            this._triggerChange();
        });

        // Right (End) のイベント
        this.inputRight.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            // 左側を下回ろうとしたら止める
            if (val < this._start) {
                e.target.value = this._start;
                this._end = this._start;
            } else {
                this._end = val;
            }
            this.updateUI(true);
            this._triggerChange();
        });

        bodyRow.appendChild(this.trackEl);
        bodyRow.appendChild(this.inputLeft);
        bodyRow.appendChild(this.inputRight);

        this.element.appendChild(headerRow);
        this.element.appendChild(bodyRow);
    }

    _createRangeInput() {
        return $el("input.jupo-range-input", {
            type: "range",
            min: this._min,
            max: this._max,
            step: this._step
        });
    }

    // ------------------------------------------
    // 更新処理
    // ------------------------------------------
    updateUI(skipInputUpdate = false) {
        // 1. NumberInputの更新
        if (this.numberStart.value !== this._start) this.numberStart.value = this._start;
        if (this.numberEnd.value !== this._end) this.numberEnd.value = this._end;

        // 2. RangeInputの更新（ドラッグ中以外のみ更新）
        if (!skipInputUpdate) {
            this.inputLeft.value = this._start;
            this.inputRight.value = this._end;
        }

        // 3. ハイライトバーの位置計算
        const range = this._max - this._min;
        // ゼロ除算回避
        const dist = range === 0 ? 1 : range;

        let leftPercent = ((this._start - this._min) / dist) * 100;
        let rightPercent = ((this._end - this._min) / dist) * 100;
        
        // 0-1の範囲
        leftPercent = Math.min(Math.max(0, leftPercent), 100);
        rightPercent = Math.min(Math.max(0, rightPercent), 100);

        // CSS変数で位置を指定
        this.trackEl.style.setProperty("--l", `${leftPercent}%`);
        this.trackEl.style.setProperty("--r", `${rightPercent}%`);

        // Z-Index制御: 
        // 完全に重なったときや端にいるとき、操作したい方のつまみが上に来るようにする
        // 基本的に値が大きいとき(右側)は右のつまみを上に、左端付近なら左を上に微調整
        if (this._start > (this._max + this._min) / 2) {
            this.inputLeft.style.zIndex = 10;
        } else {
            this.inputLeft.style.zIndex = 11; // 左側優先
        }
    }

    _triggerChange() {
        if (typeof this.onChange === "function") {
            this.onChange({ start: this._start, end: this._end });
        }
    }
}