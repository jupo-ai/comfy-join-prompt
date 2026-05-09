import { app } from "../../../scripts/app.js";
import { mkName } from "../utils.js";
import { ConfigDialog } from "../dialog/config/config-dialog.js";

const PACKAGE_NAME = "JoinPrompt";
const CLASS_NAMES = [
    mkName(PACKAGE_NAME, "JoinPrompt"), 
];
const COMMAND_OPEN_CONFIG = mkName(PACKAGE_NAME, "OpenConfigDialog");

function isJoinPromptNode(node) {
    return CLASS_NAMES.includes(node?.comfyClass) || CLASS_NAMES.includes(node?.type);
}

function nodePositionToClientPosition(node) {
    const canvas = app.canvas;
    const canvasElement = canvas?.canvas;
    const rect = canvasElement?.getBoundingClientRect?.();
    const ds = canvas?.ds;
    const scale = ds?.scale ?? 1;
    const offset = ds?.offset ?? [0, 0];
    const nodeSize = node.size ?? [0, 0];
    const graphX = node.pos[0] + (nodeSize[0] / 2);
    const graphY = node.pos[1];

    if (!rect) {
        return { x: graphX, y: graphY };
    }

    return {
        x: rect.left + ((graphX + offset[0]) * scale),
        y: rect.top + ((graphY + offset[1]) * scale),
    };
}

const extension = {
    name: mkName(PACKAGE_NAME, "JoinPrompt"), 
    commands: [
        {
            id: COMMAND_OPEN_CONFIG,
            label: "Open JoinPrompt Config",
            icon: "pi pi-cog",
            function: (selectedItem) => {
                const node = isJoinPromptNode(selectedItem)
                    ? selectedItem
                    : Array.from(app.canvas?.selectedItems ?? []).find(isJoinPromptNode);
                node?._openConfigDialog?.();
            },
        },
    ],

    beforeRegisterNodeDef: function(nodeType, nodeData, app) {
        if (!CLASS_NAMES.includes(nodeType.comfyClass)) return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function() {
            const res = onNodeCreated?.apply(this, arguments);

            this._optionsWidget = this.widgets.find(w => w.name === "options");
            this._hideOptionsWidget();
            this._initializeProperties();
            this._updateOptionsValue();
        }


        nodeType.prototype._hideOptionsWidget = function() {
            this._optionsWidget ??= this.widgets.find(w => w.name === "options");
            if (this._optionsWidget) {
                this._optionsWidget.options ??= {};
                this._optionsWidget.options.hidden = true;
                this._optionsWidget.hidden = true;
                this._optionsWidget.computeSize = () => [, 0];
            }

            let inputIndex = this.inputs?.findIndex(i => i.name === "options") ?? -1;
            while (inputIndex >= 0) {
                if (typeof this.removeInput === "function") {
                    this.removeInput(inputIndex);
                } else {
                    this.inputs.splice(inputIndex, 1);
                }
                inputIndex = this.inputs?.findIndex(i => i.name === "options") ?? -1;
            }
        }

        
        nodeType.prototype._initializeProperties = function() {
            this.addProperty("delimiter", "", "string", {
                callback: (_, value) => {
                    this._updateOptionsValue("delimiter", value);
                }
            });

            this.addProperty("cleanup", false, "boolean", {
                callback: (_, value) => {
                    this._updateOptionsValue("cleanup", value);
                }
            });
        }


        nodeType.prototype._updateOptionsValue = function(key, value) {
            if (!this._optionsWidget) return;
            const options = {
                delimiter: this.properties?.delimiter || "", 
                cleanup: this.properties?.cleanup || false, 
            };
            if (key) {
                options[key] = value;
            }
            this._optionsWidget.value = JSON.stringify(options);
        }


        nodeType.prototype._openConfigDialog = function() {
            const position = nodePositionToClientPosition(this);
            const dialog = new ConfigDialog();

            dialog.addItem({
                label: "delimiter", 
                type: "string", 
                defaultValue: this.properties.delimiter, 
                onChange: (v) => {
                    this.properties.delimiter = v;
                    this._updateOptionsValue("delimiter", v);
                }
            });

            dialog.addItem({
                label: "cleanup", 
                type: "boolean", 
                defaultValue: this.properties.cleanup, 
                onChange: (v) => {
                    this.properties.cleanup = v;
                    this._updateOptionsValue("cleanup", v);
                }
            });

            dialog.show(position);
        }
    }, 

    getNodeMenuItems(node) {
        const items = [];

        if (!isJoinPromptNode(node)) return items;

        items.push({
            content: "Open Config Dialog", 
            callback: () => {
                node._openConfigDialog?.()
            }
        });

        return items;
    },

    getSelectionToolboxCommands(selectedItem) {
        return isJoinPromptNode(selectedItem) ? [COMMAND_OPEN_CONFIG] : [];
    }
};

app.registerExtension(extension);
