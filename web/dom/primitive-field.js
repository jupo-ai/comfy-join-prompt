import { SelectorField } from "./selector-field.js";
import { NumberPrimitiveWidget, StringPrimitiveWidget } from "./primitive-widget.js";

// ==============================================
// Number Primitive Field
// ==============================================
export class NumberPrimitiveField extends SelectorField {
    constructor(comfyNode) {
        super(comfyNode);

        this.WidgetClass = NumberPrimitiveWidget;
        this.isLoading = false;
        this.header.element.style.display = "none";
    }

    // ------------------------------------------
    // ハンドラー
    // ------------------------------------------
    onAddButtonClick() {
        const widget = new this.WidgetClass({
            parentField: this,
            valueOptions: { value: 0 },
        });
        this.addWidget(widget);
    }

    addWidget(widget) {
        super.addWidget(widget);
        if (!this.isLoading) {
            widget.toggleSwitch?.setState(true);
        }
    }

    deleteWidget(widget) {
        super.deleteWidget(widget);

        if (this.widgets.length === 0) return;
        if (this.widgets.some(w => w.value.enabled)) return;

        this.widgets[0].toggleSwitch?.setState(true);
    }

    load(value) {
        this.isLoading = true;
        try {
            super.load(value);
        } finally {
            this.isLoading = false;
        }
    }

    getDecimalPlaces() {
        const value = Number(this.comfyNode.decimalPlacesWidget?.value ?? 2);
        return Math.max(0, Math.min(8, Number.isFinite(value) ? Math.trunc(value) : 2));
    }

    getStep() {
        const decimalPlaces = this.getDecimalPlaces();
        return decimalPlaces === 0 ? 1 : 1 / Math.pow(10, decimalPlaces);
    }

    applyDecimalPlaces() {
        this.widgets.forEach(w => w.applyDecimalPlaces?.());
        this.save();
    }
}


// ==============================================
// String Primitive Field
// ==============================================
export class StringPrimitiveField extends SelectorField {
    constructor(comfyNode) {
        super(comfyNode);

        this.WidgetClass = StringPrimitiveWidget;
        this.isLoading = false;
        this.header.element.style.display = "none";
    }

    // ------------------------------------------
    // ハンドラー
    // ------------------------------------------
    onAddButtonClick() {
        const widget = new this.WidgetClass({
            parentField: this,
            valueOptions: { value: "" },
        });
        this.addWidget(widget);
        widget.openDialog();
    }

    addWidget(widget) {
        super.addWidget(widget);
        if (!this.isLoading) {
            widget.toggleSwitch?.setState(true);
        }
    }

    deleteWidget(widget) {
        super.deleteWidget(widget);

        if (this.widgets.length === 0) return;
        if (this.widgets.some(w => w.value.enabled)) return;

        this.widgets[0].toggleSwitch?.setState(true);
    }

    load(value) {
        this.isLoading = true;
        try {
            super.load(value);
        } finally {
            this.isLoading = false;
        }
    }
}
