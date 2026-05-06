import { $el } from "../../../scripts/ui.js";
import { loadCss } from "../utils.js";

loadCss("dom/css/dropdown.css");

// ==============================================
// Dropdown
// ==============================================
export class Dropdown {
    constructor({
        options = [], 
        selectName = "", 
        placeholder = "Select Option", 
        value = null, 
        onChange = null, 
    } = {}) {
        this.onChange = onChange;
        this.selectName = selectName;
        this.placeholderText = placeholder;
        
        this._options = [];
        this._isOpen = false;

        this.createUI();

        // オプションの設定
        this.options = options;
        
        // 値の設定（初期値があれば）
        if (value !== null) {
            this.value = value;
        } else {
            this.updateDisplay(null);
        }

        // 外部クリックで閉じる処理
        document.addEventListener("click", (e) => {
            if (this._isOpen && !this.element.contains(e.target)) {
                this.close();
            }
        });
    }

    // ------------------------------------------
    // プロパティ
    // ------------------------------------------
    get options() {
        return this._options;
    }

    set options(v) {
        this._options = v;
        const parsedOpts = this.parseOptions(v);
        
        // 1. ネイティブSelectの更新
        this.nativeSelect.replaceChildren();
        
        // プレースホルダー用の空オプション
        const defaultOpt = $el("option", {
            value: "",
            textContent: this.placeholderText,
            disabled: true,
            selected: true
        });
        this.nativeSelect.appendChild(defaultOpt);

        // 2. カスタムリストの更新
        this.customList.replaceChildren();

        // リスト生成ヘルパー
        const createItem = (text, value) => {
            // ネイティブOption
            const opt = $el("option", {
                textContent: text,
                value: value
            });
            this.nativeSelect.appendChild(opt);

            // カスタムItem
            const item = $el("div.jupo-dropdown-item", {
                textContent: text,
                dataset: { value: value }
            });
            
            item.addEventListener("click", (e) => {
                e.stopPropagation();
                this.value = value;
                this.close();
                if (typeof this.onChange === "function") {
                    this.onChange(value);
                }
            });

            return item;
        };

        parsedOpts.forEach(item => {
            if (item.isGroup) {
                // オプショングループの場合
                
                // カスタムUI: グループラベル
                const groupLabel = $el("div.jupo-dropdown-group-label", { 
                    textContent: item.label 
                });
                this.customList.appendChild(groupLabel);
                
                // ネイティブUI: OptGroup
                const optGroup = $el("optgroup", {
                    label: item.label
                });
                this.nativeSelect.appendChild(optGroup);

                item.options.forEach(subItem => {
                    // カスタムItem作成 (ついでにnativeSelect直下にoptionが追加される)
                    const el = createItem(subItem.text, subItem.value);
                    
                    // ネスト用クラスを追加（CSSで字下げを行うため）
                    el.classList.add("nested");
                    this.customList.appendChild(el);

                    // createItemはnativeSelectの直下に追加してしまうため、
                    // 直下のoptionを削除し、optGroupの中に新しく作り直して入れる
                    this.nativeSelect.lastChild.remove(); 
                    
                    const subOpt = $el("option", {
                        textContent: subItem.text,
                        value: subItem.value
                    });
                    optGroup.appendChild(subOpt);
                });
            } else {
                // 通常のオプション
                const el = createItem(item.text, item.value);
                this.customList.appendChild(el);
            }
        });
    }

    get value() {
        return this.nativeSelect.value;
    }

    set value(v) {
        this.nativeSelect.value = v;
        this.updateDisplay(v);
    }

    // ------------------------------------------
    // UI操作
    // ------------------------------------------
    toggle() {
        if (this._isOpen) this.close();
        else this.open();
    }

    open() {
        this.element.classList.add("active");
        this._isOpen = true;
    }

    close() {
        this.element.classList.remove("active");
        this._isOpen = false;
    }

    updateDisplay(value) {
        const items = this.customList.querySelectorAll(".jupo-dropdown-item");
        let selectedText = this.placeholderText;
        let found = false;

        items.forEach(item => {
            if (item.dataset.value === String(value)) {
                item.classList.add("selected");
                selectedText = item.textContent;
                found = true;
            } else {
                item.classList.remove("selected");
            }
        });

        this.displayLabel.textContent = selectedText;
        
        if (!found) {
            this.element.classList.remove("has-value");
        } else {
            this.element.classList.add("has-value");
        }
    }

    select(value, dispatchEvent = true) {
        this.value = value;
        if (dispatchEvent) this.onChange?.(this.value);
    }

    // ------------------------------------------
    // UI作成
    // ------------------------------------------
    createUI() {
        this.element = $el("div.jupo-dropdown-container");

        this.nativeSelect = $el("select", {
            name: this.selectName,
            style: { display: "none" }
        });

        this.displayLabel = $el("div.jupo-dropdown-placeholder", {
            textContent: this.placeholderText
        });

        this.customList = $el("div.jupo-dropdown-list");

        this.element.appendChild(this.nativeSelect);
        this.element.appendChild(this.displayLabel);
        this.element.appendChild(this.customList);

        this.element.addEventListener("click", () => {
            this.toggle();
        });
    }

    // ------------------------------------------
    // ユーティリティ
    // ------------------------------------------
    parseOptions(options) {
        if (!Array.isArray(options)) return [];

        return options.map(opt => {
            if (typeof opt === "object" && opt !== null && "options" in opt && !Array.isArray(opt)) {
                return {
                    isGroup: true,
                    label: opt.label,
                    options: this.parseInnerOptions(opt.options)
                };
            }
            if (Array.isArray(opt) && opt.length >= 2) {
                return { isGroup: false, text: opt[0], value: opt[1] };
            }
            return { isGroup: false, text: String(opt), value: String(opt) };
        });
    }

    parseInnerOptions(options) {
        if (!Array.isArray(options)) return [];
        return options.map(opt => {
            if (Array.isArray(opt) && opt.length >= 2) {
                return { text: opt[0], value: opt[1] };
            }
            return { text: String(opt), value: String(opt) };
        });
    }
}