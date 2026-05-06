import { app } from "../../../scripts/app.js";
import { $el } from "../../../scripts/ui.js";
import { loadCss } from "../utils.js";
import { Icon, IconButton } from "./icon.js";
import { ToggleSwitch } from "./toggle-switch.js";
import { ConfirmDialog } from "../dialog/confirm/confirm-dialog.js";

loadCss("dom/css/selector-widget.css");

// ==============================================
// Selector Widget
// ==============================================
export class SelectorWidget {
    constructor({ parentField, valueOptions = {} }) {
        this.parentField = parentField;

        this.value = {
            enabled: true, 
        };
        this.valueUpdate(valueOptions);
        this.createUI();
    }

    // ------------------------------------------
    // UI作成
    // ------------------------------------------
    createUI() {
        this.element = $el("div.jupo-selector-widget");
        this.element.addEventListener("contextmenu", (e) => this.handleContextMenu(e));
        this._setupPointerEventForwarding();

        // ドラッグハンドル
        this.dragHandle = new Icon({ icon: "menu" });
        this.dragHandle.element.classList.add("jupo-selector-widget-drag-handle");
        this.dragHandle.element.addEventListener("mousedown", (e) => this.handleDragStart(e));
        this.element.append(this.dragHandle.element);

        // トグルスイッチ
        this.toggleSwitch = new ToggleSwitch({
            width: 32, 
            height: 16, 
            onChange: (newValue) => this.toggle(newValue)
        });
        this.toggleSwitch.value = this.value.enabled ?? true;
        this.element.append(this.toggleSwitch.element);

        // アイコンコンテナ
        this.iconContainer = $el("div.jupo-selector-widget-icon-container");
        this.element.append(this.iconContainer);

        // 表示名
        this.displayName = $el("div.jupo-selector-widget-display-name");
        this.displayName.addEventListener("click", () => this.handleNameClick());
        this.element.append(this.displayName);

        // 削除ボタン
        this.deleteButton = new IconButton({
            icon: "delete", 
            size: 16, 
            onClick: () => this.delete()
        });
        this.deleteButton.element.classList.add("jupo-selector-widget-delete");
        this.element.append(this.deleteButton.element);
    }

    // ------------------------------------------
    // ポインターイベント転送
    // ------------------------------------------
    _setupPointerEventForwarding() {
        // 中クリック(ホイールドラッグ)をキャンバスに転送
        const forwardIfNeeded = (handler) => (e) => {
            if (e.button === 1) {
                e.preventDefault();
                e.stopPropagation();
                handler.call(app.canvas, e);
            }
        };

        this.element.addEventListener("pointerdown", forwardIfNeeded(app.canvas.processMouseDown));
        this.element.addEventListener("pointerup", forwardIfNeeded(app.canvas.processMouseUp));
        this.element.addEventListener("pointermove", forwardIfNeeded(app.canvas.processMouseMove));
        this.element.addEventListener("wheel", (e) => app.canvas.processMouseWheel(e));
    }

    // ------------------------------------------
    // ハンドラー
    // ------------------------------------------
    // ウィジェットの右クリック
    handleContextMenu(e) {
        // 継承クラスで実装
    }

    // 表示名クリック時
    handleNameClick() {
        // 継承クラスで実装
    }

    // 親fieldにドラッグ開始を通知
    handleDragStart(e) {
        if (e.button === 0) {
            e.preventDefault();
            this.parentField.startDragging(this);
        }
    }

    // ------------------------------------------
    // ユーティリティ
    // ------------------------------------------
    valueUpdate(valueOptions = {}) {
        this.value = { ...this.value, ...valueOptions };
        this.parentField.save();
    }

    toggle(force = null) {
        const newValue = force === null ? !this.value.enabled : force;
        this.element.classList.toggle("jupo-selector-widget--disabled", !newValue);
        this.valueUpdate({ enabled: newValue });
        this.parentField.header.updateState();

        // selectModeがalwaysOneのとき、常に1つはTrue
        if (this.parentField.isAlwaysOneMode()) {
            if (newValue) {
                // OFF -> ON
                this.toggleSwitch.disable(); // ON状態で固定
                this.parentField.ensureOneWidget(this); // 自身以外をFalseに

            } else {
                // ON -> OFF
                this.toggleSwitch.enable(); // 固定解除
            }
        }
    }

    delete() {
        this.element.remove();
        this.parentField.deleteWidget(this);
    }

    setDisplayName(name) {
        const span = $el("span", { textContent: name });
        this.displayName.replaceChildren(span);
    }

    // ------------------------------------------
    // 更新
    // ------------------------------------------
    async refresh() {
        // 継承クラスで実装
    }
}



// ==============================================
// Selector Separator
// ==============================================
export class SelectorSeparator extends SelectorWidget {
    constructor({ parentField, valueOptions = {} }) {
        super({ parentField });

        this.value = {
            isSeparator: true, 
            displayName: "", 
        };
        this.valueUpdate(valueOptions);

        this.element.classList.add("jupo-selector-widget--separator");
        this.toggleSwitch.hide();
        this.iconContainer.style.display = "none";
        this.setDisplayName(this.value.displayName);

        this.dialog = new ConfirmDialog({
            title: "セパレータ", 
            message: "", 
            valueType: "string", 
            onConfirm: (result) => {
                this.setDisplayName(result);
                this.valueUpdate({ displayName: result });
            }
        });
    }

    // ------------------------------------------
    // 表示名クリック時
    // ------------------------------------------
    handleNameClick() {
        this.dialog.show(this.value.displayName);
    }
}