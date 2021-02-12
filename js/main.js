function main() {
    console.log("Loading!");
    let start = Date.now();
    
    let presetMap = {};
    let currentPresetID;
    
    function classify(str) {
        return str.toLowerCase().replace(/ /g, "-");
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
    
    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }
    
    
    //"color": "#9fe3fc",
    // TODO: May convert Enraged/PhobiaExposed into nested categories
    let HeroPersonalityPreset = new Preset("HeroPersonality.json");
    
    //"color": "#ff9494",
    let HeroTraitPreset = new Preset("HeroTrait.json").setOnLoad(function() {
        $(".text-input_name").on("blur", function () {
            if($(".text-input_id").val().length <= 0) {
                $(".text-input_id").val(toTitleCase($(".text-input_name").val()).replace(/ /g, ""));
            }
        });
    });
    
    setTimeout(function() {
        addPreset("trait", "HeroTrait", HeroTraitPreset);
        addPreset("personality", "HeroPersonality", HeroPersonalityPreset);

        setCurrentPreset("trait");
    }, 50);
    
    let end = Date.now();
    console.log("Loaded in " + (end - start) + "ms!");
}

$(function() {
    main();
});