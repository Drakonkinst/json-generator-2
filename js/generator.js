const Generator = (() => {
    const UPDATE_INTERVAL = 100;
    
    function copyToClipboard(text) {
        let $temp = $("<textarea>");
        $("body").append($temp);
        $temp.val(text).select();
        document.execCommand("copy");
        $temp.remove();
    }
    
    function downloadFile(name, contents, type) {
        type = type || "text/plain";

        var blob = new Blob([contents], { type: type });

        var link = document.createElement("a");
        link.download = name;
        link.href = window.URL.createObjectURL(blob);
        link.onclick = function (e) {
            // revokeObjectURL needs a delay to work properly
            var el = this;
            setTimeout(function () {
                window.URL.revokeObjectURL(el.href);
            }, 1500);
        };

        link.click();
        link.remove();
    }
    
    function createOutputSection(generator) {
        let output = $("<div>").addClass("output-content");
        let outputText = $("<textarea>").addClass("output-text")
            .attr("spellcheck", false)
            .appendTo(output);
        
        let controls = $("<div>").addClass("output-controls").appendTo(output);
        
        // Copy to Clipboard
        $("<button>").addClass("output-control copy-output")
            .text("Copy to Clipboard")
            .on("click", function() {
                copyToClipboard(outputText.val());
            }).appendTo(controls);
            
        // Download JSON
        $("<button>").addClass("output-control download-output")
            .text("Download JSON")
            .on("click", function() {
                generator.downloadOutput();
            }).appendTo(controls);
        
        // Reset All
        $("<button>").addClass("output-control download-output")
            .text("Reset All")
            .on("click", function () {
                generator.resetInput();        
            }).appendTo(controls);
        
        // Minify
        let minifyContainer = $("<span>").addClass("output-control")
            .appendTo(controls);
        $("<input type='checkbox'>").addClass("toggle-minify")
            .on("click", function() {
                generator.toggleMinify(this);
            }).appendTo(minifyContainer);
        $("<span>").text("Minify").appendTo(minifyContainer);
        
        return output;
    }
    
    function convertItemToText(item) {
        if(typeof item === "string") {
            return "QUOTE_PLACEHOLDER" + item + "QUOTE_PLACEHOLDER";
        } else {
            return item;
        }
    }
    function convertJSONToText(json, minify) {
        
        if(minify) {
            return JSON.stringify(json);
        }
        
        let output = JSON.stringify(json, function(k, v) {
            if(Array.isArray(v)) {
                if(v.length > 0 && (v[0] == null || typeof v[0] !== "object")) {
                    let str = "REMOVE_QUOTE[ ";
                    let first = true;
                    let numFound = 0;
                    for(let item of v) {
                        if(item == null) {
                            continue;
                        }
                        numFound++;
                        if(first) {
                            first = false;
                        } else {
                            str += ", ";
                        }

                        str += convertItemToText(item);
                    }
                    
                    str += " ]REMOVE_QUOTE";
                    
                    if(numFound > 0) {
                        return str;
                    } else {
                        return "";
                    }
                }
            }
            if(!isNaN(v)) {
                return "REMOVE_QUOTE" + v + "REMOVE_QUOTE";
            }
            return v;
        }, "\t").replaceAll("QUOTE_PLACEHOLDER", "\"")
            .replaceAll("\"REMOVE_QUOTE", "")
            .replaceAll("REMOVE_QUOTE\"", "");
        
        return output;
    }
    
    return class Generator {
        constructor(id, preset) {
            this.container = $("<div>")
                .addClass("generator-container generator_" + id)
            
            createOutputSection(this).appendTo(this.container);
            $("<div>").addClass("generator-title").appendTo(this.container);
            let content = $("<div>").addClass("input-content").appendTo(this.container);
            if(preset.color) {
                content.css("background-color", preset.color);
            }
            
            this.minify = false;
            this.preset = preset;
            this.preset.initialize(this);
        }
        
        start() {
            console.log("Opening " + this.preset.title);
            let self = this;
            this.loop = setInterval(function() {
                if(self.preset.edited) {
                    self.update();
                }
            }, UPDATE_INTERVAL);
            this.container.appendTo(".current-generator");
            this.update();
        }
        
        stop() {
            console.log("Closing " + this.preset.title);
            this.container.detach();
            clearInterval(this.loop);
        }
        
        update() {
            // update
            this.preset.edited = false;
            let output = this.preset.getOutput();
            
            let outputStr = convertJSONToText(output, this.minify);
            this.get(".output-text").val(outputStr);
            
        }
        
        get(element) {
            return this.container.find(element);    
        }
        
        setTitle(title) {
            this.get(".generator-title").html("<h3>" + title + "</h3>");
        }
        
        addSection(section) {
            section.appendTo(this.get(".input-content"));
        }
        
        wipeInput() {
            this.get(".input-content").empty();
        }
        
        downloadOutput() {
            downloadFile(this.preset.getFileName(), this.get(".output-text").val(), "application/json");
        }
        
        resetInput() {
            this.preset.initialize(this);
        }
        
        toggleMinify(element) {
            if(element.checked) {
                this.minify = true;
            } else {
                this.minify = false;
            }
            this.update();
        }
    };
})();