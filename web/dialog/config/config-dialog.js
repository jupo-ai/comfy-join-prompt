import { $el } from "../../../../scripts/ui.js";
import { loadCss } from "../../utils.js";
import { BaseModal } from "../base/base-dialog.js";

import { Input } from "../../dom/input.js";
import { NumberInput } from "../../dom/number-input.js";
import { Slider } from "../../dom/slider.js";
import { RangeSlider } from "../../dom/range-slider.js";
import { ToggleSwitch } from "../../dom/toggle-switch.js";
import { Dropdown } from "../../dom/dropdown.js";

loadCss("dialog/config/config-dialog.css");

// ==============================================
// Config Dialog
// ==============================================
export class ConfigDialog extends BaseModal {
    constructor() {
        super();

        this.createUI();
    }

    // ------------------------------------------
    // UI作成
    // ------------------------------------------
    createUI() {
        this.overlay.classList.add("jupo-config-overlay");
        this.element.classList.add("jupo-config-dialog");
        this.content.classList.add("jupo-config-content");

        this.items = $el("div.jupo-config-items");
        this.content.append(this.items);
    }

    
    // ------------------------------------------
    // ユーティリティ
    // ------------------------------------------
    addItem({
        label = "", 
        type = "string", // string, number, slider, range, boolean, dropdown, combo, 
        defaultValue = "", 
        attrs = {}, 
        onChange = null
    }) {
        const domType = (type ?? "string").toString().toLowerCase();
        let dom;
        switch(domType) {
            case "number":
                dom = new NumberInput({
                    defaultValue: defaultValue, 
                    min: attrs.min ?? -Infinity, 
                    max: attrs.max ?? Infinity, 
                    step: attrs.step ?? 1, 
                    dialogTitle: label, 
                    onChange: onChange
                });
                break;
            
            case "slider":
                dom = new Slider({
                    value: defaultValue, 
                    min: attrs.min ?? 0, 
                    max: attrs.max ?? 100, 
                    step: attrs.step ?? 1, 
                    restrict: attrs.restrict ?? false, 
                    onChange: onChange, 
                });
                break;
            
            case "range":
                dom = new RangeSlider({
                    start: attrs.start ?? 0, 
                    end: attrs.end ?? 100, 
                    min: attrs.min ?? 0, 
                    max: attrs.max ?? 100, 
                    step: attrs.step ?? 1, 
                    onChange: onChange, 
                    restrict: attrs.restrict ?? false, 
                })
                break;
            case "boolean":
                dom = new ToggleSwitch({
                    defaultValue: defaultValue, 
                    onChange: onChange, 
                });
                break;
            
            case "dropdown":
            case "combo":
                dom = new Dropdown({
                    value: defaultValue, 
                    options: attrs.options ?? [], 
                    placeholder: attrs.placeholder ?? "Select Option", 
                    onChange: onChange, 
                });
                break;
            
            case "string":
            default: 
                dom = new Input({
                    defaultValue: defaultValue, 
                    onChange: onChange, 
                });
        }

        const item = $el("div.jupo-config-item");
        const labelElement = $el("span.jupo-config-item-label", { textContent: label });
        dom.element.classList.add("jupo-config-item-element");
        item.append(labelElement, dom.element);
        this.items.append(item);
    }


    updatePosition(position) {
        const mouseX = position?.x ?? 0;
        const mouseY = position?.y ?? 0;
        const margin = 10;

        // 要素のサイズを取得
        const dialogRect = this.element.getBoundingClientRect();
        const width = dialogRect.width;
        const height = dialogRect.height;

        // 画面(ビューポート)のサイズを取得
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // --- 初期位置 --- 
        let left = mouseX - (width / 2);
        let top = mouseY;
        
        // --- 横位置の計算 ---
        // 右端からはみ出る場合: 画面幅 - 要素幅 - margin
        if (left + width > viewportWidth) {
            left = viewportWidth - width - margin;
        }
        // 左端からはみ出る場合：margin
        if (left < margin) {
            left = margin;
        }

        // --- 縦位置の計算 --- 
        // 下端からはみ出る場合: 画面高さ - 要素高さ - margin
        if (top + height > viewportHeight) {
            top = viewportHeight - height - margin;
        }
        // 上端からはみ出る場合: margin
        if (top < margin) {
            top = margin;
        }

        // ※もし要素が position: absolute で、ページがスクロールされている場合
        // ここで window.scrollX / scrollY を足す必要がある
        // position: fixed ならこのままでOK
        // left += window.scrollX;
        // top += window.scrollY;

        this.element.style.left = `${left}px`;
        this.element.style.top = `${top}px`;
    }


    // ------------------------------------------
    // 開く・閉じる
    // ------------------------------------------
    show(position) {
        super.show();
        this.updatePosition(position);
    }
}