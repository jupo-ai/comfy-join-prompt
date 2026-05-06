import { $el } from "../../../../scripts/ui.js";
import { loadCss } from "../../utils.js";
import { IconButton } from "../../dom/icon.js";

loadCss("dialog/base/base-dialog-variables.css");
loadCss("dialog/base/base-dialog.css");

// ==============================================
// Base Dialog
// ==============================================
export class BaseDialog {
    constructor() {
        this.element = null;
        this.toolbar = null;
        this.content = null;

        this._createBaseUI();
        this.createToolButtons();
    }

    // ------------------------------------------
    // UI作成
    // ------------------------------------------
    _createBaseUI() {
        this.element = $el("div.jupo-dialog");
        this.toolbar = $el("div.jupo-dialog-toolbar");
        this.content = $el("div.jupo-dialog-content");
        this.element.append(this.toolbar, this.content);
    }

    createToolButtons() {
        this.addToolButton({
            icon: "close", 
            title: "閉じる", 
            onClick: () => this.close()
        });
    }

    // ------------------------------------------
    // ユーティリティ
    // ------------------------------------------
    addToolButton({ icon, title, onClick }) {
        if (!this.toolbar) return null;

        const button = new IconButton({
            icon: icon, 
            title: title ?? "", 
            size: 20, 
            onClick: (e) => onClick?.(e)
        });
        this.toolbar.prepend(button.element);
        return button;
    }

    // ------------------------------------------
    // 開く・閉じる
    // ------------------------------------------
    async show() {}

    async close() {}
}



// ==============================================
// Base Modal
// ==============================================
export class BaseModal extends BaseDialog {
    constructor() {
        super();
    }

    // ------------------------------------------
    // UI作成
    // ------------------------------------------
    _createBaseUI() {
        super._createBaseUI();

        this.overlay = $el("div.jupo-dialog-overlay");
        this.overlay.addEventListener("mousedown", async (e) => {
            if (e.target === this.overlay) {
                await this.close();
            }
        });

        // zIndexを決定するためのヘルパー関数
        const getMaxZIndex = function() {
            const elements = document.body.querySelectorAll(".jupo-dialog-overlay");
            const zIndexes = Array.from(elements).map(element => {
                return parseInt(window.getComputedStyle(element).zIndex, 10) || 0;
            });
            return zIndexes.length > 0 ? Math.max(...zIndexes) : 2000;
        };
        this.overlay.style.zIndex = getMaxZIndex() + 1;
        this.overlay.append(this.element);
    }

    // ------------------------------------------
    // 開く・閉じる
    // ------------------------------------------
    async show() {
        document.body.append(this.overlay);
    }

    async close() {
        this.overlay.remove();
    }
}