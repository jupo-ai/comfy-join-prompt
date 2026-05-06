import { app } from "../../../scripts/app.js";
import { $el } from "../../../scripts/ui.js";
import { loadCss } from "../utils.js";
import { ToggleSwitch } from "./toggle-switch.js";
import { SelectorSeparator } from "./selector-widget.js";

loadCss("dom/css/selector-field.css");

// ==============================================
// Selector Field
//  : Selector Widgetを格納するフィールド
// ==============================================
export class SelectorField {
    constructor(comfyNode) {
        this.comfyNode = comfyNode;
        this.widgets = [];

        this.draggedWidget = null;
        this.placeholder = null;

        this.WidgetClass = null;
        this.element = null;
        
        this.createUI();
    }

    // ------------------------------------------
    // UI作成
    // ------------------------------------------
    createUI() {
        this.element = $el("div.jupo-selector-field");
        this._setupPointerEventForwarding();

        this._createHeader();
        this._createBody();
        this._createFooter();
    }

    _createHeader() {
        this.header = new SelectorHeader(this);
        this.element.append(this.header.element);
    }

    _createBody() {
        this.widgetContainer = $el("div.jupo-selector-field-container");
        this.element.append(this.widgetContainer);
    }

    _createFooter() {
        this.footer = new SelectorFooter(this);
        this.element.append(this.footer.element);
    }

    // ------------------------------------------
    // ポインターイベント転送
    // ------------------------------------------
    _setupPointerEventForwarding() {
        // イベントターゲットが子要素かどうか
        const isChildElement = (target) => {
            return target !== this.element && 
                    target !== this.widgetContainer && 
                    this.element.contains(target);
        }

        // 転送ヘルパー
        const forwardIfNeeded = (handler) => (e) => {
            if (isChildElement(e.target)) return;
            if (e.button !== 0) {
                e.preventDefault();
                e.stopPropagation();
                handler.call(app.canvas, e);
            }
        };

        this.element.addEventListener("pointerdown", forwardIfNeeded(app.canvas.processMouseDown));
        this.element.addEventListener("pointerup", forwardIfNeeded(app.canvas.processMouseUp));
        this.element.addEventListener("pointermove", forwardIfNeeded(app.canvas.processMouseMove));
        this.element.addEventListener("wheel", (e) => {
            app.canvas.processMouseWheel(e);
        });
    }

    // ------------------------------------------
    // ドラッグハンドラー
    // ------------------------------------------
    startDragging(widget) {
        this.draggedWidget = widget;
        const originalElement = this.draggedWidget.element;

        // ドロップ先の目印となる placeholder を作成
        this.placeholder = originalElement.cloneNode(true);
        this.placeholder.classList.add("jupo-selector-widget--dragging");

        // placeholder をドラッグ要素のあった場所に挿入
        this.widgetContainer.insertBefore(this.placeholder, originalElement);

        // ドラッグ要素自体は一時的に非表示にする
        originalElement.style.display = "none";

        // document 全体でマウスの動きと離した瞬間を監視
        this._onDragMove = (e) => this.handleDragMove(e);
        this._onDragEnd = (e) => this.handleDragEnd();
        document.addEventListener("mousemove", this._onDragMove);
        document.addEventListener("mouseup", this._onDragEnd);
        document.body.classList.add("jupo-body-grabbing");
    }

    handleDragMove(event) {
        if (!this.draggedWidget) return;

        const y = event.clientY;

        // ドラッグ対象以外のウィジェットを取得
        const otherWidgets = this.widgets.filter(w => w !== this.draggedWidget);

        let closestWidget = null;
        let smallestDistance = Infinity;

        // 最も違いウィジェットを探す
        otherWidgets.forEach(widget => {
            const rect = widget.element.getBoundingClientRect();
            const distance = Math.abs(y - (rect.top + rect.height / 2));
            if (distance < smallestDistance) {
                smallestDistance = distance;
                closestWidget = widget;
            }
        });

        // placeholder を最も近いウィジェットの前後に移動
        if (closestWidget) {
            const rect = closestWidget.element.getBoundingClientRect();
            if (y < rect.top + rect.height / 2) {
                // 上半分ならその要素の前に挿入
                this.widgetContainer.insertBefore(this.placeholder, closestWidget.element);
            } else {
                // 下半分ならその要素の次に挿入
                this.widgetContainer.insertBefore(this.placeholder, closestWidget.element.nextSibling);
            }
        } else if (this.widgets.length > 1) {
            // 他のウィジェットが無い場合 (1つだけドラッグ中など)
            this.widgetContainer.appendChild(this.placeholder);
        }
    }

    handleDragEnd() {
        if (!this.draggedWidget) return;

        // ドラッグ要素を表示に戻し、placeholder があった場所に移動
        this.widgetContainer.insertBefore(this.draggedWidget.element, this.placeholder);
        this.draggedWidget.element.style.display = "";

        // placeholder を削除
        this.placeholder.remove();

        // document からイベントリスナーを削除
        document.removeEventListener("mousemove", this._onDragMove);
        document.removeEventListener("mouseup", this._onDragEnd);
        document.body.classList.remove("jupo-body-grabbing");

        // ウィジェット配列の順序をDOMと同期させる
        this._updateWidgetOrder();

        this.draggedWidget = null;
        this.placeholder = null;
    }

    _updateWidgetOrder() {
        // widgets配列の順序を現在のDOMの順序に合わせる
        const orderedElements = Array.from(this.widgetContainer.children)
            .filter(el => el.classList.contains("jupo-selector-widget"));
        
        this.widgets.sort((a, b) => {
            return orderedElements.indexOf(a.element) - orderedElements.indexOf(b.element);
        });
        this.save();
    }

    // ------------------------------------------
    // 追加ボタンクリックイベント
    // ------------------------------------------
    onAddButtonClick() {
        // 継承クラスで実装
    }

    // ------------------------------------------
    // レイアウト
    // ------------------------------------------
    computeHeight() {
        let height = 0;
        Array.from(this.element.children).forEach(child => {
            height += child.offsetHeight;
        });
        return height + 24;
    }

    computeWidth() {
        let width = 0;

        if (this.widgets.length > 0) {
            const widget = this.widgets[0]; // 参照用
            Array.from(widget.element.children).forEach(child => {
                // displayName以外を加算
                if (child !== widget.displayName) {
                    width += child.offsetWidth;
                }
            });
        }
        return width;
    }

    // ------------------------------------------
    // ユーティリティ
    // ------------------------------------------
    addWidget(widget) {
        this.widgets.push(widget);
        this.widgetContainer.append(widget.element);

        // alwaysOneモードのとき、新規ウィジェットが有効なら、他を無効化
        if (this.isAlwaysOneMode()) {
            this.ensureOneWidget(widget);
        }

        this.save();
        this.comfyNode.updateNodeSize?.();
        this.header.updateState();
    }

    deleteWidget(widget) {
        this.widgets = this.widgets.filter(w => w !== widget);
        this.save();
        this.header.updateState();
        this.comfyNode.updateNodeSize();
    }

    addSeparator(displayName = "") {
        const separator = new SelectorSeparator({
            parentField: this, 
            valueOptions: { displayName }
        });
        this.addWidget(separator);
    }


    // ------------------------------------------
    // パブリックメソッド
    // ------------------------------------------
    save() {
        if (!this.comfyNode.valuesWidget) return;

        const values = this.widgets.map(w => w.value);
        this.comfyNode.valuesWidget.value = JSON.stringify(values);
    }

    load(v) {
        if (!v) return;

        this.clear();
        try {
            const values = JSON.parse(v);
            if (Array.isArray(values)) {
                values.forEach(value => {
                    const WidgetClass = value?.isSeparator ? SelectorSeparator : this.WidgetClass;
                    const widget = new WidgetClass({ parentField: this, valueOptions: value });
                    this.addWidget(widget);
                });
                this.header.updateState();
                this.applySelectMode();
            }
        } catch(e) {
            console.error("SelectorField: loadに失敗しました", v, e);
        }
    }

    clear() {
        this.widgets = [];
        this.widgetContainer.replaceChildren();
    }

    async refresh() {
        this.widgets.forEach(w => w.refresh?.());
    }


    // ------------------------------------------
    // SelectMode関連
    // ------------------------------------------
    // alwaysOneか確認
    isAlwaysOneMode() {
        return this.comfyNode.selectMode === "alwaysOne" || this.comfyNode.selectMode === "always_one";
    }

    // 指定ウィジェット以外をfalseに
    ensureOneWidget(widget) {
        if (widget.value.enabled) {
            this.widgets.forEach(w => {
                if (w !== widget) {
                    w.toggleSwitch.setState(false);
                }
            });
        }
    }

    applySelectMode() {
        const actionableWidgets = this.widgets.filter(w => !w.value?.isSeparator && w.toggleSwitch);

        if (actionableWidgets.length === 0) {
            this.header?.updateState();
            return;
        }

        actionableWidgets.forEach(w => w.toggleSwitch.enable());

        if (this.isAlwaysOneMode()) {
            const targetWidget = actionableWidgets.find(w => w.value.enabled) ?? actionableWidgets[0];
            targetWidget?.toggleSwitch.setState(true);
        }

        this.header?.updateState();
    }
}



// ==============================================
// Selector Header
// ==============================================
class SelectorHeader {
    constructor(parentField) {
        this.parentField = parentField;
        this.createUI();
    }

    // ------------------------------------------
    // UI作成
    // ------------------------------------------
    createUI() {
        this.element = $el("div.jupo-selector-header");
        this._setupPointerEventForwarding();

        // トグルスイッチ
        this.toggleSwitch = new ToggleSwitch({
            width: 32, 
            height: 16, 
            onChange: (newValue) => this.toggleAll(newValue)
        });
        this.element.append(this.toggleSwitch.element);

        // フレキシブルエリア
        this.flexArea = $el("div.jupo-selector-header-flexarea");
        this.element.append(this.flexArea);

        // 末尾に削除ボタン分の固定エリア
        // size(16) + padding(4) * 2 = 24
        const deleteArea = this.addArea({ key: "delete", width: 24 });
        deleteArea.style.order = "1";
    }

    // ------------------------------------------
    // ポインターイベント転送
    // ------------------------------------------
    _setupPointerEventForwarding() {
        const forwardIfNeeded = (handler) => (e) => {
            if (e.button !== 0) {
                e.preventDefault();
                e.stopPropagation();
                handler.call(app.canvas, e);
            }
        };

        this.element.addEventListener("pointerdown", forwardIfNeeded(app.canvas.processMouseDown));
        this.element.addEventListener("pointerup", forwardIfNeeded(app.canvas.processMouseUp));
        this.element.addEventListener("pointermove", forwardIfNeeded(app.canvas.processMouseMove));
        this.element.addEventListener("wheel", (e) => {
            app.canvas.processMouseWheel(e);
        });
    }

    // ------------------------------------------
    // ユーティリティ
    // ------------------------------------------
    // newValue を field の全ウィジェットのトグルスイッチに適用
    toggleAll(newValue) {
        const widgets = this.parentField.widgets.filter(w => w.constructor !== SelectorSeparator);
        widgets.forEach(w => w.toggleSwitch?.toggle?.(newValue));
    }

    // field の全ウイジェットの状態を、自身のトグルスイッチに適用
    updateState() {
        const widgets = this.parentField.widgets.filter(w => w.constructor !== SelectorSeparator);
        if (widgets.length === 0) {
            this.toggleSwitch.setState(false, false);
            return;
        }

        const isEveryTrue = widgets.every(w => w.toggleSwitch.value);
        const isSomeTrue = widgets.some(w => w.toggleSwitch.value);
        const isEveryFalse = widgets.every(w => !w.toggleSwitch.value);

        if (isEveryTrue) this.toggleSwitch.setState(true, false);
        else if (isSomeTrue) this.toggleSwitch.setState("indeterminate", false);
        else if (isEveryFalse) this.toggleSwitch.setState(false, false);
    }

    // ヘッダーに固定幅エリアを追加
    addArea({ key, width, title = "" }) {
        const areaClass = title ? "jupo-selector-header-fixarea--named" : "jupo-selector-header-fixarea--empty";
        const area = $el(`div.${areaClass}`);
        area.textContent = title;
        area.style.width = `${width}px`;
        area.setAttribute("area-key", key);
        
        this.element.append(area);
        return area;
    }

    // 追加した固定幅エリア要素を取得
    getArea(key) {
        return this.element.querySelector(`[area-key="${key}"]`);
    }

    // エリアに名前を設定
    setAreaTitle(key, title) {
        const area = this.getArea(key);
        if (area) {
            area.textContent = title;
        }
    }

    // エリアの表示を切り替え
    toggleArea(key, force = null) {
        const area = this.getArea(key);
        if (!area) return;

        let newDisplay;
        if (force === null) {
            const current = area.style.display;
            newDisplay = current === "" ? "none" : "";
        } else {
            newDisplay = force ? "" : "none";
        }
        area.style.display = newDisplay;
    }
}



// ==============================================
// Selector Footer
// ==============================================
class SelectorFooter {
    constructor(parentField) {
        this.parentField = parentField;
        this.createUI();
    }

    // ------------------------------------------
    // UI作成
    // ------------------------------------------
    createUI() {
        this.element = $el("div.jupo-selector-footer");

        this.button = $el("div.jupo-selector-footer-button");
        this.button.textContent = "追加";
        this.button.addEventListener("click", () => this._handleClick());
        this.button.addEventListener("contextmenu", (e) => this._handleContextMenu(e));
        this._setupPointerEventForwarding();

        this.element.append(this.button);
    }

    // ------------------------------------------
    // ポインターイベント転送
    // ------------------------------------------
    _setupPointerEventForwarding() {
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
        this.element.addEventListener("wheel", (e) => {
            app.canvas.processMouseWheel(e);
        });
    }

    // ------------------------------------------
    // ボタンハンドラー
    // ------------------------------------------
    _handleClick() {
        this.parentField.onAddButtonClick();
    }

    _handleContextMenu(e) {
        e.preventDefault();
        e.stopPropagation();

        const menuItems = [
            {
                content: "セパレータを追加", 
                callback: () => this.parentField.addSeparator()
            }, 
        ];

        new LiteGraph.ContextMenu(menuItems, {
            event: e, 
            node: app.canvas?.graph, 
        }, window);
    }
}