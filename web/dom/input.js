import { $el } from "../../../scripts/ui.js";
import { loadCss } from "../utils.js";

loadCss("dom/css/input.css");

// ==============================================
// Input
// ==============================================
export class Input {
    constructor({
        defaultValue = "", 
        type = "string", 
        onChange = null, 
    }) {
        this.onChange = onChange;
        this.valueType = (type ?? "string").toString().toLowerCase();
        this.createUI();
        this.value = defaultValue;
    }

    // ------------------------------------------
    // プロパティ
    // ------------------------------------------
    get value() {
        return this.element.value;
    }
    set value(v) {
        const parsed = this.parseValue(v);
        if (!parsed.ok) return;

        this.element.value = parsed.value.toString();
    }

    // ------------------------------------------
    // UI作成
    // ------------------------------------------
    createUI() {
        this.element = $el("input.jupo-input");
        this.element.addEventListener("change", () => this.handleChange());
    }

    // ------------------------------------------
    // ハンドラー
    // ------------------------------------------
    handleChange() {
        const parsed = this.parseValue(this.element.value);
        if (!parsed.ok) return;

        this.onChange?.(parsed.value);
    }

    // ------------------------------------------
    // ユーティリティ
    // ------------------------------------------
    parseValue(value) {
        const normalized = value.trim();
        switch (this.valueType) {
            case "number":
            case "float":
            case "double":
            case "int": 
            case "integer": {
                const parsed = Number(normalized);
                if (Number.isNaN(parsed)) {
                    return { ok: false };
                }
                return { ok: true, value: parsed };
            }
            case "boolean":
            case "bool": {
                const lower = normalized.toLowerCase();
                if ([ "true", "1", "yes", "on" ].includes(lower)) {
                    return { ok: true, value: true };
                }
                if ([ "false", "0", "no", "off" ].includes(lower)) {
                    return { ok: true, value: false };
                }
                return { ok: false };
            }
            case "string":
            default: {
                return { ok: true, value };
            }
        }
    }
}