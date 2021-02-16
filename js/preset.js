const Preset = (() => {
    const DEFAULT_MAX_COMPONENTS = 99;
    
    /* HELPERS */
    function classify(str) {
        return str.toLowerCase().replace(/ /g, "-");
    }
    
    function findFieldInfoByName(name, schema) {
        for(let obj of schema) {
            if(obj.name == name) {
                return obj;
            }
        }
        return null;
    }

    function filterNonNull(arr) {
        let result = [];
        for(let item of arr) {
            if(item != null) {
                result.push(item);
            }
        }
        return result;
    }
    
    function trimExtraSpaces(str) {
        return str.replace(/\s+/g, " ");
    }
    
    /* FIELD ELEMENT CREATION */
    function parseField(field, preset, data = preset.data) {
        let type = field.type;
        let fieldElement;
        
        if(type === "text") {
            fieldElement = createTextInput(field, preset, data);
        } else if(type === "checkbox") {
            fieldElement = createCheckboxInput(field, preset, data);
        } else if(type === "list") {
            fieldElement = createListInput(field, preset, data);
        } else if(type === "long_list") {
            // for dialogue - textarea separated by newlines
            fieldElement = createLongListInput(field, preset, data);
        } else if(type === "long_text") {
            fieldElement = createLongTextInput(field, preset, data);
        } else if(type === "number") {
            fieldElement = createNumberInput(field, preset, data);
        } else if(type === "range") {
            fieldElement = createRangeInput(field, preset, data);
        } else if(type === "dropdown") {
            fieldElement = createDropdownInput(field, preset, data);
        } else if(type === "component_builder") {
            fieldElement = createComponentBuilder(field, preset, data);
        } else if(type === "checkbox_table") {
            fieldElement = createCheckboxTable(field, preset, data);
        } else if(type === "nest") {
            // object
            fieldElement = handleNestedInput(field, preset, data);
        } else {
            console.log("Unknown type: " + type + "!");
            return;
        }
        
        return fieldElement;
    }

    function createTextInput(field, preset, data) {
        let id = "text-input_" + classify(field.name);
        let label = field.label ? field.label : field.name;
        
        if(field.default) {
            // is required
            label += "*";
        }
        
        let elem = $("<div>").addClass("input-block");
        let labelEl = $("<label>").addClass("input-label")
            .text(label)
            .attr("for", id)
            .appendTo(elem);
        
        if(field.tooltip) {
            labelEl.attr("title", field.tooltip);
            labelEl.addClass("has_tooltip");
        }
        
        $("<input>").addClass("input text-input " + id)
            .attr({
                "spellcheck": false,
                "type": "text",
                "id": id
            })
            .on("input", function() {
                let text = trimExtraSpaces($(this).val());
                if(text.trim().length) {
                    data[field.name] = text;
                } else {
                    delete data[field.name];
                }
                
                preset.onUpdate();
            }).appendTo(elem);
        return elem;
    }
    
    function createCheckboxInput(field, preset, data) {
        let id = "checkbox-input_" + classify(field.name);
        let label = field.label ? field.label : field.name;
        
        if(data.default) {
            label += "*";
        }
        
        let elem = $("<div>").addClass("input-block");
        let labelEl = $("<label>").addClass("input-label")
            .text(label)
            .attr("for", id)
            .appendTo(elem);
            
        if(field.tooltip) {
            labelEl.attr("title", field.tooltip);
            labelEl.addClass("has_tooltip");
        }
        $("<input type='checkbox'>").addClass("input checkbox-input " + id)
            .on("click", function() {
                if(!this.checked && !data.default) {
                    delete data[field.name];
                } else {
                    data[field.name] = this.checked || false;
                }
                
                preset.onUpdate();
            })
            .appendTo(elem);
        return elem;
    }
    
    function createListInput(field, preset, data) {
        let id = "list-input_" + classify(field.name);
        let label = field.label ? field.label : field.name;
        
        if(field.default) {
            label += "*";
        }
        
        let elem = $("<div>").addClass("input-block");
        let labelEl = $("<label>").addClass("input-label")
            .text(label)
            .attr("for", id)
            .appendTo(elem);
        
        if(field.tooltip) {
            labelEl.attr("title", field.tooltip);
            labelEl.addClass("has_tooltip");
        }
        
        $("<input>").addClass("input list-input " + id)
            .attr({
                "spellcheck": false,
                "type": "text",
                "id": id
            }).on("input", function() {
                let list = trimExtraSpaces($(this).val());
                
                let extraLists = [];
                let searchIndex = 0;
                while(list.indexOf("[", searchIndex) > -1) {
                    let start = list.indexOf("[");
                    searchIndex = start + 1;
                    
                    if(start + 1 >= list.length) {
                        break;
                    }
                    
                    let end = list.indexOf("]", start + 1);
                    
                    if(end > start + 1) {
                        let innerStr = list.substring(start + 1, end);
                        console.log("Innerstr: " + innerStr, "start", (start + 1), "end", end-1)
                        if(innerStr.length > 0) {
                            extraLists.push(innerStr.split(","));
                            list = list.substring(0, start) + list.substring(end + 1);
                            console.log(list);
                        }
                        break;
                    }
                }
                
                list = list.split(",");
                
                for(let i = list.length - 1; i >= 0; --i) {
                    let item = list[i];
                    if(!item.trim().length) {
                        list.splice(i, 1);
                    }
                }
                
                for(let extra of extraLists) {
                    list.push(extra);
                }
                
                if(list.length > 0) {
                    data[field.name] = list;
                } else {
                    delete data[field.name];
                }
                
                preset.onUpdate();
            }).appendTo(elem);
        return elem;
    }
    
    function createLongListInput(field, preset, data) {
        let id = "long-list-input_" + classify(field.name);
        let label = field.label ? field.label : field.name;

        if(field.default) {
            label += "*";
        }

        let elem = $("<div>").addClass("input-block");
        let labelEl = $("<label>").addClass("input-label")
            .text(label)
            .attr("for", id)
            .appendTo(elem);

        if(field.tooltip) {
            labelEl.attr("title", field.tooltip);
            labelEl.addClass("has_tooltip");
        }

        let input = $("<textarea>").addClass("input long-list-input " + id)
            .attr({
                "spellcheck": false,
                "type": "text",
                "id": id
            }).on("input", function () {
                let list = $(this).val().trim().split("\n");

                for(let i = list.length - 1; i >= 0; --i) {
                    if(!list[i].length) {
                        list.splice(i, 1);
                    }
                }

                if(list.length) {
                    data[field.name] = list;
                } else {
                    delete data[field.name];
                }

                preset.onUpdate();
            }).appendTo(elem);
        
        if(field.placeholder) {
            input.attr("placeholder", field.placeholder);
        }
        
        return elem;
    }
    
    function createLongTextInput(field, preset, data) {
        let id = "long-text-input_" + classify(field.name);
        let label = field.label ? field.label : field.name;

        if(field.default) {
            label += "*";
        }

        let elem = $("<div>").addClass("input-block");
        let labelEl = $("<label>").addClass("input-label")
            .text(label)
            .attr("for", id)
            .appendTo(elem);

        if(field.tooltip) {
            labelEl.attr("title", field.tooltip);
            labelEl.addClass("has_tooltip");
        }

        let input = $("<textarea>").addClass("input long-text-input " + id)
            .attr({
                "spellcheck": false,
                "type": "text",
                "id": id
            }).on("input", function () {
                let list = $(this).val();

                if(list.length) {
                    data[field.name] = list;
                } else {
                    delete data[field.name];
                }

                preset.onUpdate();
            }).appendTo(elem);

        if(field.placeholder) {
            input.attr("placeholder", field.placeholder);
        }

        return elem;
    }
    
    function createNumberInput(field, preset, data) {
        let id = "number-input_" + classify(field.name);
        let label = field.label ? field.label : field.name;

        if(field.default) {
            // is required
            label += "*";
        }

        let elem = $("<div>").addClass("input-block");
        let labelEl = $("<label>").addClass("input-label")
            .text(label)
            .attr("for", id)
            .appendTo(elem);

        if(field.tooltip) {
            labelEl.attr("title", field.tooltip);
            labelEl.addClass("has_tooltip");
        }

        let input = $("<input>").addClass("input number-input " + id)
            .attr({
                "type": "number",
                "step": 1,
                "id": id
            })
            .on("input", function () {
                
                let text = $(this).val().trim();
                if(text.length > 0 && !isNaN(text)) {
                    let val = parseFloat(text);
                    
                    if(field.min_value != null && val < field.min_value) {
                        val = field.min_value;
                    } else if(field.max_value != null && val > field.max_value) {
                        val = field.max_value;
                    }
                    
                    if(field.precision != null) {
                        val = val.toFixed(field.precision);
                    }
                    data[field.name] = val;
                } else {
                    delete data[field.name];
                }
                
                preset.onUpdate();
            }).appendTo(elem);
            
        if(field.min_value != null) {
            input.attr("min", field.min_value);
        }
        
        if(field.max_value != null) {
            input.attr("max", field.max_value);
        }
        
        if(field.step_size != null) {
            input.attr("step", field.step_size);
        }
        
        return elem;
    }
    
    function createRangeInput(field, preset, data) {
        let label = field.label ? field.label : field.name;
        let container = $("<div>").addClass("range-container");
        
        let minField = JSON.parse(JSON.stringify(field));
        let maxField = JSON.parse(JSON.stringify(field));
        
        minField.name = "Min" + field.name;
        minField.label = "Min " + label;
        
        maxField.name = "Max" + field.name;
        maxField.label = "Max " + label;
        
        let memory = {
            "data": {},
            onUpdate() {
                let min = this.data[minField.name];
                let max = this.data[maxField.name];
                
                console.log("min", min);
                console.log("max", max)
                
                if(min != null && max != null) {
                    min = parseFloat(min);
                    max = parseFloat(max);
                    if(max < min) {
                        // invalid
                        max = min;
                    }
                    if(max == min) {
                        data[field.name] = min;
                    } else {
                        data[field.name] = [min, max];
                    }
                } else {
                    delete data[field.name];
                }
                preset.onUpdate();
            }
        }
        
        createNumberInput(minField, memory, memory.data).appendTo(container);
        createNumberInput(maxField, memory, memory.data).appendTo(container);
        
        return container;
    }
    
    function createDropdownInput(field, preset, data) {
        let id = "dropdown-input_" + classify(field.name);
        let label = field.label ? field.label : field.name;

        if(field.default) {
            // is required
            label += "*";
        }

        let elem = $("<div>").addClass("input-block");
        let labelEl = $("<label>").addClass("input-label")
            .text(label)
            .attr("for", id)
            .appendTo(elem);

        if(field.tooltip) {
            labelEl.attr("title", field.tooltip);
            labelEl.addClass("has_tooltip");
        }

        let select = $("<select>").addClass("input dropdown-input " + id)
            .attr({
                "spellcheck": false,
                "type": "text",
                "id": id
            })
            .on("input", function () {
                let text = $(this).val().trim();
                if(text.length) {
                    data[field.name] = text;
                } else {
                    delete data[field.name];
                }

                preset.onUpdate();
            }).appendTo(elem);
        
        for(let choice of field.choices) {
            $("<option>").text(choice).appendTo(select);
        }
        return elem;
    }
    
    function createComponentBuilder(field, preset, data) {
        let id = "text-input_" + classify(field.name);
        let label = field.label ? field.label : field.name;
        
        let maxComponents = field.max_components || DEFAULT_MAX_COMPONENTS;
        let numComponents = 0;
        let componentBuilder = {
            "data": [],
            onUpdate() {
                // custom update behavior
                
                // clean array
                for(let i = this.data.length - 1; i >= 0; --i) {
                    if(this.data[i].shouldDelete) {
                        this.data.splice(i, 1);
                        numComponents--;
                    }
                }
                
                let output = this.data.slice();
                for(let i = output.length - 1; i >= 0; --i) {
                    let outputVal = output[i];
                    let shouldDelete = false;
                    
                    // do not display empty objects
                    if($.isEmptyObject(outputVal)) {
                        shouldDelete = true;
                    }
                    
                    // check for all required components
                    for(let componentField of field.component) {
                        if(componentField.required
                            && !outputVal.hasOwnProperty(componentField.name)) {
                            shouldDelete = true;
                        }
                    }
                    
                    if(shouldDelete) {
                        output.splice(i, 1);
                    }
                }
                
                if(output.length > 0) {
                    if(output.length === 1) {
                        // check for shortcut value
                        let shortcutVal = null;
                        let canShortcut = true;
                        let outputVal = output[0];
                        
                        for(let k in outputVal) {
                            fieldInfo = findFieldInfoByName(k, field.component);
                            if(fieldInfo != null && fieldInfo.shortcut_if_alone) {
                                shortcutVal = outputVal[k];
                            } else {
                                canShortcut = false;
                                break;
                            }
                        }
                        
                        if(canShortcut && shortcutVal != null) {
                            data[field.name] = shortcutVal;
                            preset.onUpdate();
                            return;
                        }
                    }
                    data[field.name] = output;
                } else {
                    delete data[field.name];
                }
                
                preset.onUpdate();
            }
        }

        if(field.default) {
            // is required
            label += "*";
        }

        let elem = $("<div>").addClass("input-block");
        let labelEl = $("<label>").addClass("input-label")
            .text(label)
            .attr("for", id)
            .appendTo(elem);

        if(field.tooltip) {
            labelEl.attr("title", field.tooltip);
            labelEl.addClass("has_tooltip");
        }
        
        let componentsElem = $("<div>").addClass("components");
        $("<button>").addClass("component-input")
            .text("+ Component")
            .on("click", function() {
                if(numComponents >= maxComponents) {
                    return;
                }
                numComponents++;
                addComponent(field.component, componentBuilder).appendTo(componentsElem);
            }).appendTo(elem);
        
        componentsElem.appendTo(elem);
        
        return elem;
    }
    
    function createCheckboxTable(field, preset, data) {
        let id = "checkbow-input_" + classify(field.name);
        let label = field.label ? field.label : field.name;
        let xAxis = field.column_labels;
        let yAxis = field.row_labels;
        
        let leftmostColumn = $("<th>").text(label);
        
        if(field.tooltip) {
            leftmostColumn.attr("title", field.tooltip);
            leftmostColumn.addClass("has_tooltip");
        }
        
        let elem = $("<table>").addClass("input-block");
        $("<tr>").appendTo(elem);
        $(leftmostColumn).appendTo(elem);
        for(let rowItem of xAxis) {
            $("<th>").text(rowItem).appendTo(elem);
        }
        
        let memory = null;
        
        for(let i = 0; i < yAxis.length; ++i) {
            let rowIndex = i;
            let rowItem = yAxis[i];
            let row = $("<tr>");
            $("<th>" + rowItem + "</th>").appendTo(row);
            
            for(let j = 0; j < xAxis.length; ++j) {
                let columnIndex = j;
                let columnItem = xAxis[j];
                let cellID = "cbt_" + classify(rowItem) + "-" + classify(columnItem);
                
                
                let cell = $("<td>").addClass("cbt-cell " + cellID)
                    .on("click", function() {
                        let checkbox = $(this).find(".checkbox-input");
                        checkbox.prop("checked", !checkbox.prop("checked"));
                        let isChecked = checkbox.prop("checked");
                        
                        if(field.output_type == 1) {
                            
                            // change memory
                            let arr = memory[field.columns[columnIndex]];
                            if(isChecked) {
                                arr[rowIndex] = rowItem;
                            } else {
                                arr[rowIndex] = null;
                            }
                            
                            // create new data
                            data[field.name] = {};
                            let isEmpty = true;
                            for(let category of field.columns) {
                                let itemsPresent = filterNonNull(memory[category]);
                                if(itemsPresent.length > 0) {
                                    isEmpty = false;
                                    data[field.name][category] = itemsPresent;
                                }
                            }
                            if(isEmpty) {
                                delete data[field.name];
                            }
                            
                        }
                        preset.onUpdate();
                    })
                    .appendTo(row);
                $("<input type='checkbox'>").addClass("checkbox-input " + id)
                    .on("click", function() {
                        // reverse click operation
                        this.checked = !this.checked;
                    })
                    .appendTo(cell);
            }
            row.appendTo(elem);
        }
        
        if(field.output_type == 1) {
            memory = {};
            for(let category of field.columns) {
                let arr = [];
                for(let i = 0; i < yAxis.length; ++i) {
                    arr.push(null);
                }
                memory[category] = arr;
            }
        }
        
        return elem;
    }
    
    function handleNestedInput(field, preset, data) {
        let id = "nested-input_" + classify(field.name);
        let label = field.label ? field.label : field.name;
        
        let container = $("<div>").addClass("input-block nested-input " + id);
        let labelEl = $("<div>").addClass("input-label nested-input-label")
            .text(label + ":")
            .appendTo(container);
            
        if(field.tooltip) {
            labelEl.attr("title", field.tooltip);
            labelEl.addClass("has_tooltip");
        }
        
        let content = $("<div>").addClass("nested-content");
        
        let isHidden = true;
        $("<button>").addClass("nested-input-control")
            .text("+ Expand")
            .on("click", function() {
                if(isHidden) {
                    isHidden = false;
                    $(this).text("- Hide");
                } else {
                    isHidden = true;
                    $(this).text("+ Expand");
                }
                content.toggle();
            })
            .appendTo(container);
            
        content.appendTo(container);
        content.toggle();
        
        let memory = {
            "data": {},
            onUpdate() {
                if($.isEmptyObject(this.data)) {
                    delete data[field.name];
                } else {
                    data[field.name] = this.data;
                }
                preset.onUpdate();
            }
        };
        for(let innerField of field.nest) {
            parseField(innerField, memory).appendTo(content);
        }
        
        return container;
    }
    
    function createSection() {
        return $("<fieldset class=section>");
    }
    
    function addComponent(component, preset) {
        let container = $("<div>").addClass("component");
        
        let data = {};
        preset.data.push(data);
        
        for(let field of component) {
            parseField(field, preset, data).appendTo(container);
        }
        
        $("<button>").addClass("component-input delete-component")
            .text("^ Delete Component ^")
            .on("click", function() {
                container.remove();
                data.shouldDelete = true;
                preset.onUpdate();
            })
            .appendTo(container);
        
        preset.onUpdate();
        
        return container;
    }
    
    return class Preset {
        constructor(schema) {
            this.schema = schema;
            this.title = this.schema.title;
            this.color = this.schema.color;
            this.data = {};
            this.latestOutput = "";
            this.edited = false;
            this.loaded = false;
        }
        
        /* LOGIC & FUNCTIONS */
        initialize(generator, data = {}) {
            this.data = data;
            generator.wipeInput();
            
            this.onInit();
            
            generator.setTitle(this.schema.title);
            
            let fields = this.schema.fields;
            let idToFieldMap = {};
            
            for(let field of fields) {
                let fieldElement = parseField(field, this);
                if(fieldElement != null) {
                    idToFieldMap[field.name] = fieldElement;
                }
            }
            
            let sections = this.schema.sections;
            for(let section of sections) {
                let sectionElement = createSection();
                for(let fieldName of section) {
                    if(idToFieldMap.hasOwnProperty(fieldName)) {
                        idToFieldMap[fieldName].appendTo(sectionElement);
                    }
                }
                generator.addSection(sectionElement);
            }
            
            this.onUpdate();
        }
        
        /* MUTATORS */
        
        setOnInit(callback) {
            this.initCallback = callback;
            return this;
        }
        
        setOnLoad(callback) {
            this.loadCallback = callback;
            return this;
        }
        
        /* EVENTS */
        onInit() {
            if(typeof this.initCallback === "function") {
                this.initCallback();
            }
        }
        
        onLoad() {
            if(this.loaded) {
                return;
            }
            
            if(typeof this.loadCallback === "function") {
                this.loadCallback();
                this.loaded = true;
            }
        }
        
        onUpdate() {
            this.latestOutput = {};
            this.edited = true;
            
            for(let field of this.schema.fields) {
                let id = field.name;
                if(this.data.hasOwnProperty(id)) {
                    this.latestOutput[id] = this.data[id];
                } else if(field.default) {
                    // default only works for top-level
                    this.latestOutput[id] = field.default;
                }
            }
        }
        
        /* ACCESSORS */
        
        getFileName() {
            if(!this.schema.hasOwnProperty("file_name")) {
                return "file";
            }
            
            let fileNameInfo = this.schema.file_name;
            let keyToSearch = fileNameInfo.field;
            let defaultName = fileNameInfo.default;
            
            if(this.data.hasOwnProperty(keyToSearch)) {
                return this.data[keyToSearch];
            } else {
                return defaultName;
            }
        }
        
        getOutput() {
            return this.latestOutput;
        }
    };
})();