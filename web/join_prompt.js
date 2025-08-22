import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
import { $el } from "../../scripts/ui.js";
import { debug, _name, _endpoint, api_get, api_post } from "./utils.js";

/**
 * JoinPrompt 拡張機能
 * PrefixとSuffixプロパティを追加
 */
const extension = {
    name: _name("JoinPrompt"),

    init: async function(app) {},
    setup: async function(app) {},

    beforeRegisterNodeDef: async function(nodeType, nodeData, app) {
        const isStringNode = nodeType.comfyClass === _name("JoinPrompt");
        
        if (isStringNode) {
            this.enhanceStringNode(nodeType);
        }
    },

    /**
     * 文字列ノードにprefixとsuffixプロパティを追加
     */
    enhanceStringNode(nodeType) {
        const originalOnNodeCreated = nodeType.prototype.onNodeCreated;

        // ==================== ノードライフサイクル ====================
        
        nodeType.prototype.onNodeCreated = function() {
            const result = originalOnNodeCreated?.apply(this, arguments);
            
            this.initializeStringProperties();
            this.overrideSerializeValue();
            
            return result;
        };

        // ==================== 初期化処理 ====================
        
        nodeType.prototype.initializeStringProperties = function() {
            this.properties ||= {};
            this.addStringProperties();
        };

        nodeType.prototype.addStringProperties = function() {
            // prefix プロパティ
            this.addProperty("prefix", "", "string", {
                callback: (_, value) => {
                    this.properties.prefix = value || "";
                }
            });

            // suffix プロパティ
            this.addProperty("suffix", "", "string", {
                callback: (_, value) => {
                    this.properties.suffix = value || "";
                }
            });
        };

        // ==================== serializeValue オーバーライド ====================
        
        nodeType.prototype.overrideSerializeValue = function() {
            const widget = this.widgets.find(w => w.name === "text"); // String入力ウィジェット
            if (!widget) return;
            
            if (widget.serializeValue) {
                const originalSerializeValue = widget.serializeValue.bind(widget);
                widget.serializeValue = async () => {
                    try {
                        // 元の値を取得（Promiseの場合はawait）
                        const originalValue = await originalSerializeValue();
                        const stringValue = String(originalValue || "");
                        
                        const prefix = this.properties.prefix || "";
                        const suffix = this.properties.suffix || "";
                        
                        if (stringValue) return prefix + stringValue + suffix;
                        else return stringValue;
                    
                    } catch (error) {
                        console.error("serializeValue error:", error);
                        // エラー時は元の値をそのまま返す
                        return originalSerializeValue();
                    }
                };
            }
        };
    }
};

app.registerExtension(extension);