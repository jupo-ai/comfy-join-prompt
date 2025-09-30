import { app } from "../../scripts/app.js";
import { mk_name } from "./utils.js";

const classNames = [mk_name("JoinPrompt")];

const extension = {
    name: mk_name("JoinPrompt"), 

    beforeRegisterNodeDef: function(nodeType, nodeData, app) {
        if (!classNames.includes(nodeType.comfyClass)) return;

        // --------------------------------------
        // onNodeCreated
        // --------------------------------------
        const origOnNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function() {
            const res = origOnNodeCreated?.apply(this, arguments);

            this.hideWidgets();
            this.initializeProperties();
            this.updateOptionsValue();

            return res;
        }


        // --------------------------------------
        // hideWidgets
        // --------------------------------------
        nodeType.prototype.hideWidgets = function() {
            const hide = (name) => {
                const widget = this.widgets.find(w => w.name === name);
                if (widget) {
                    widget.hidden = true;
                    widget.computeSize = (width) => [width, 0];

                    const index = this.inputs.findIndex(i => i.name === name);
                    if (index !== -1) {
                        this.inputs.splice(index, 1);
                    }
                }
            }

            hide("options");
        }


        // --------------------------------------
        // initializeProperties
        // --------------------------------------
        nodeType.prototype.initializeProperties = function() {

            // prefix
            this.addProperty("prefix", "", "string", {
                callback: (_, value) => {
                    this.updateOptionsValue("prefix", value);
                }
            });

            // suffix
            this.addProperty("suffix", "", "string", {
                callback: (_, value) => {
                    this.updateOptionsValue("suffix", value);
                }
            });

            // separator
            this.addProperty("separator", "", "string", {
                callback: (_, value) => {
                    this.updateOptionsValue("separator", value);
                }
            });

            // join_with_newline
            this.addProperty("join_with_newline", false, "boolean", {
                callback: (_, value) => {
                    this.updateOptionsValue("join_with_newline", value);
                }
            });

            // cleanup
            this.addProperty("cleanup", false, "boolean", {
                callback: (_, value) => {
                    this.updateOptionsValue("cleanup", value);
                }
            });
        }


        // --------------------------------------
        // updateOptionValue
        // --------------------------------------
        nodeType.prototype.updateOptionsValue = function(key, value) {
            const widget = this.widgets.find(w => w.name === "options");
            const options = {
                prefix: this.properties.prefix, 
                suffix: this.properties.suffix, 
                separator: this.properties.separator, 
                join_with_newline: this.properties.join_with_newline, 
                cleanup: this.properties.cleanup
            };
            options[key] = value;
            if (widget) {
                widget.value = JSON.stringify(options);
            }
        }
        
        
    }
};

app.registerExtension(extension);