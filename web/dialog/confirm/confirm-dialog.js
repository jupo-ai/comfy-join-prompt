import { $el } from "../../../../scripts/ui.js";
import { loadCss } from "../../utils.js";
import { BaseModal } from "../base/base-dialog.js";

loadCss("dialog/confirm/confirm-dialog.css");

// ==============================================
// Confirm Dialog
// ==============================================
export class ConfirmDialog extends BaseModal {
    constructor({ title = "", message = "", valueType = "string", onConfirm = null } = {}) {
        super();

        this.title = title;
        this.message = message;
        this.valueType = (valueType ?? "string").toString().toLowerCase();
        this.onConfirm = onConfirm;

        this.createUI();
    }

    // ------------------------------------------
    // UI作成
    // ------------------------------------------
    createUI() {
        this.element.classList.add("jupo-confirm-dialog");
        this.content.classList.add("jupo-confirm-dialog-content");

        // title
        const title = $el("span.jupo-confirm-dialog-title");
        if (!this.title) title.style.display = "none";
        title.textContent = this.title;

        // messageは改行ごとにp
        const messages = $el("div.jupo-confirm-dialog-message");
        if (!this.message) messages.style.display = "none";
        this.message.split("\n").forEach(m => {
            const message = $el("p", { textContent: m });
            messages.append(message);
        });

        const isMultiline = this.isMultiline();
        this.inputElement = isMultiline
            ? $el("textarea.jupo-confirm-dialog-input.jupo-confirm-dialog-textarea")
            : $el("input.jupo-confirm-dialog-input");
        this.inputElement.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && (!isMultiline || (e.ctrlKey || e.metaKey))) {
                e.preventDefault();
                e.stopPropagation();
                this.handleConfirm();
            }
        });

        const footer = $el("div.jupo-confirm-dialog-footer");
        const confirmButton = $el("button.jupo-confirm-dialog-button", {
            textContent: "OK", 
            onclick: () => this.handleConfirm()
        });
        const cancelButton = $el("button.jupo-confirm-dialog-button.secondary", {
            textContent: "Cancel", 
            onclick: () => this.close()
        });

        footer.append(confirmButton, cancelButton);

        this.content.append(title, messages, this.inputElement, footer);
    }

    // ------------------------------------------
    // ハンドラー
    // ------------------------------------------
    async handleConfirm() {
        if (!this.inputElement) return;

        const rawValue = this.inputElement.value;
        const parseResult = this.parseValue(rawValue);

        if (!parseResult.ok) return;

        await this.onConfirm?.(parseResult.value);

        this.close();
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
            case "multiline":
            case "multiline_string":
            case "text":
            default: {
                return { ok: true, value };
            }
        }
    }

    isMultiline() {
        return ["multiline", "multiline_string", "text"].includes(this.valueType);
    }

    // ------------------------------------------
    // 開く・閉じる
    // ------------------------------------------
    show(defaultValue) {
        super.show();

        this.inputElement.value = defaultValue ?? "";
        this.inputElement.focus();
        this.inputElement.select();
    }

    close() {
        super.close();
    }
}
