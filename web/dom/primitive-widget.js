import { NumberInput } from "./number-input.js";
import { SelectorWidget } from "./selector-widget.js";
import { ConfirmDialog } from "../dialog/confirm/confirm-dialog.js";

// ==============================================
// Number Primitive Widget
// ==============================================
export class NumberPrimitiveWidget extends SelectorWidget {
    constructor({ parentField, valueOptions = {} }) {
        super({ parentField, valueOptions });

        this.value = {
            enabled: true,
            value: 0,
        };

        this.valueUpdate(valueOptions);
        this.createAdditionalUI();
    }

    // ------------------------------------------
    // UI作成
    // ------------------------------------------
    createAdditionalUI() {
        this.element.classList.add("jupo-selector-widget--number-primitive");
        this.element.style.display = "grid";
        this.element.style.gridTemplateColumns = "16px 32px 1fr auto 1fr 24px";
        this.element.style.alignItems = "center";

        this.iconContainer.style.display = "none";
        this.displayName.style.display = "none";
        this.deleteButton.element.style.gridColumn = "6";

        this.numberInput = new NumberInput({
            defaultValue: this.value.value,
            step: this.parentField.getStep(),
            width: 88,
            height: 20,
            dialogTitle: "Number",
            onChange: (value) => {
                this.valueUpdate({ value });
            }
        });
        this.numberInput.element.style.gridColumn = "4";
        this.element.insertBefore(this.numberInput.element, this.deleteButton.element);
    }

    // ------------------------------------------
    // ハンドラー
    // ------------------------------------------
    handleContextMenu(e) {
        e.preventDefault();
        e.stopPropagation();

        const menuOptions = [
            {
                content: "数値を編集",
                callback: () => this.numberInput.dialog.show(this.value.value),
            },
        ];

        new LiteGraph.ContextMenu(menuOptions, {
            event: e,
            title: String(this.value.value),
            className: "custom-lora-menu",
            node: this.parentField.comfyNode,
            filter: false,
        }, window);
    }

    handleNameClick() {
        this.numberInput.dialog.show(this.value.value);
    }

    // ------------------------------------------
    // ユーティリティ
    // ------------------------------------------
    applyDecimalPlaces() {
        this.numberInput.setStep(this.parentField.getStep());
        this.valueUpdate({ value: this.numberInput.value });
    }
}


// ==============================================
// String Primitive Widget
// ==============================================
export class StringPrimitiveWidget extends SelectorWidget {
    constructor({ parentField, valueOptions = {} }) {
        super({ parentField, valueOptions });

        this.value = {
            enabled: true,
            value: "",
        };

        this.valueUpdate(valueOptions);
        this.createAdditionalUI();
        this.updateDisplayName();
    }

    // ------------------------------------------
    // UI作成
    // ------------------------------------------
    createAdditionalUI() {
        this.iconContainer.style.display = "none";
        this.dialog = new ConfirmDialog({
            title: "String",
            valueType: "multiline",
            onConfirm: (value) => {
                this.valueUpdate({ value });
                this.updateDisplayName();
            },
        });
    }

    // ------------------------------------------
    // ハンドラー
    // ------------------------------------------
    handleContextMenu(e) {
        e.preventDefault();
        e.stopPropagation();

        const menuOptions = [
            {
                content: "テキストを編集",
                callback: () => this.openDialog(),
            },
        ];

        new LiteGraph.ContextMenu(menuOptions, {
            event: e,
            title: this.getDisplayText(),
            className: "custom-lora-menu",
            node: this.parentField.comfyNode,
            filter: false,
        }, window);
    }

    handleNameClick() {
        this.openDialog();
    }

    openDialog() {
        this.dialog.show(this.value.value);
    }

    // ------------------------------------------
    // ユーティリティ
    // ------------------------------------------
    getDisplayText() {
        const value = String(this.value.value ?? "");
        return value.split("\n").find(line => line.trim()) || "(empty)";
    }

    updateDisplayName() {
        this.setDisplayName(this.getDisplayText());
    }
}
