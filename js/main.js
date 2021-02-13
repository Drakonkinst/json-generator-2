let FILE_PATH = "https://drakonkinst.github.io/json-generator-2/data/";

function main() {
    console.log("Loading!");
    let start = Date.now();
    
    // need to add name of file (w/out .json) to this list
    let allPresets = [ "HeroTrait", "HeroPersonality" ];
    let presetMap = {};
    let currentPresetID;
    
    /* HELPERS */
    function classify(str) {
        return str.toLowerCase().replace(/ /g, "-");
    }
    
    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }
    
    /* PRESET LOADER */
    
    function loadPresets() {
        let first = null;
        let numFound = 0;
        for(let presetName of allPresets) {
            $.getJSON(FILE_PATH + presetName + ".json", function(json) {
                let id = classify(presetName);
                if(first == null) {
                    first = id;
                }
                let preset = new Preset(json);
                addPreset(id, preset.title, preset);
                numFound++;
                
                if(numFound >= allPresets.length) {
                    onInit(first);
                }
            });
        }
    }
    
    function addPreset(presetID, presetTitle, preset) {
        let id = "preset-option_" + classify(presetTitle);
        $("<button>").addClass("preset-option " + id)
            .text(presetTitle)
            .on("click", function() {
                setCurrentPreset(presetID)
            })
            .appendTo(".preset-options");
        
        presetMap[presetID] = new Generator(presetID, preset);
    }
    
    /* PRESET MANAGER */
    
    function setCurrentPreset(presetID) {
        if(!presetMap.hasOwnProperty(presetID)) {
            console.log("Error: Unknown preset " + presetID);
            return;
        }
        
        if(presetID == currentPresetID) {
            return;
        }
        
        let preset = presetMap[presetID];
        
        if(currentPresetID != null) {
            presetMap[currentPresetID].stop();
        }
        
        currentPresetID = presetID;
        preset.start();
    }
    
    function getPreset(presetID) {
        return presetMap[presetID.toLowerCase()].preset;
    }
    
    /* INIT */
    function onInit(initialPresetID) {
        getPreset("HeroTrait").setOnLoad(function() {
            $(".text-input_name").on("blur", function () {
                if($(".text-input_id").val().length <= 0) {
                    $(".text-input_id").val(toTitleCase($(".text-input_name").val()).replace(/ /g, ""));
                }
            });
        });
        
        setCurrentPreset(initialPresetID);
        let end = Date.now();
        console.log("Loaded in " + (end - start) + "ms!");
    }
    
    loadPresets();
}

$(function() {
    main();
});