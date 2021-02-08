function main() {
    console.log("Loading!");
    let start = Date.now();
    
    const COLORS = ["", "Dark Blue", "Dark Green", "Dark Aqua", "Dark Red", "Dark Purple", "Gold", "Gray", "Dark Gray", "Blue", "Green", "Aqua", "Red", "Light Purple", "Yellow", "White", "Black", "Brown"];
    
    let presetMap = {};
    let currentPresetID;
    
    function classify(str) {
        return str.toLowerCase().replace(/ /g, "-");
    }
    
    function addPreset(presetID, preset) {
        let id = "preset-option_" + classify(preset.title);
        $("<button>").addClass("preset-option " + id)
            .text(preset.title)
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
    
    let HeroPersonalityPreset = new Preset({
        "title": "HeroPersonality Generator",
        //"color": "#9fe3fc",
        "fields": [
            {
                "name": "Id",
                "type": "text",
                "default": "None",
                "tooltip": "TBA"
            },
            {
                "name": "Parent",
                "type": "text",
                "tooltip": "TBA"
            },
            {
                "name": "Heroes",
                "label": "Hero Classes",
                "type": "list",
                "default": ["None"],
                "tooltip": "TBA"
            },
            {
                "name": "Weight",
                "type": "number",
                "min_value": 0,
                "step_size": 0.1,
                "precision": 1,
                "tooltip": "TBA"
            },
            {
                "name": "OverridesSpeech",
                "label": "Overrides Speech",
                "type": "checkbox",
                "tooltip": "TBA"
            },
            {
                "name": "Speech",
                "type": "nest",
                "tooltip": "TBA",
                "nest": [
                    {
                        "name": "Intro",
                        "type": "long_list",
                        "placeholder": "Write Speech Lines here...",
                        "tooltip": "TBA"
                    },
                    {
                        "name": "Interact",
                        "type": "nest",
                        "tooltip": "TBA",
                        "nest": [
                            {
                                "name": "Trusted",
                                "type": "long_list",
                                "placeholder": "Write Speech Lines here...",
                                "tooltip": "TBA" 
                            },
                            {
                                "name": "Friend",
                                "type": "long_list",
                                "placeholder": "Write Speech Lines here...",
                                "tooltip": "TBA"
                            },
                            {
                                "name": "Ally",
                                "type": "long_list",
                                "placeholder": "Write Speech Lines here...",
                                "tooltip": "TBA"
                            },
                            {
                                "name": "Neutral",
                                "type": "long_list",
                                "placeholder": "Write Speech Lines here...",
                                "tooltip": "TBA"
                            },
                            {
                                "name": "Enemy",
                                "type": "long_list",
                                "placeholder": "Write Speech Lines here...",
                                "tooltip": "TBA"
                            }
                        ]
                    },
                    {
                        "name": "EnterCombat",
                        "type": "nest",
                        "tooltip": "TBA",
                        "nest": [
                            {
                                "name": "Generic",
                                "type": "long_list",
                                "placeholder": "Write Speech Lines here...",
                                "tooltip": "TBA"
                            },
                            {
                                "name": "Provoked",
                                "type": "long_list",
                                "placeholder": "Write Speech Lines here...",
                                "tooltip": "TBA"
                            },
                            {
                                "name": "AmbushOnPlayer",
                                "type": "long_list",
                                "placeholder": "Write Speech Lines here...",
                                "tooltip": "TBA"
                            },
                            {
                                "name": "ResearchAmbush",
                                "type": "long_list",
                                "placeholder": "Write Speech Lines here...",
                                "tooltip": "TBA"
                            },
                            {
                                "name": "AmbushOnHero",
                                "type": "long_list",
                                "placeholder": "Write Speech Lines here...",
                                "tooltip": "TBA"
                            }
                        ]
                    }
                ]
            },
            {
                "name": "IsUnique",
                "label": "Unique Personality",
                "type": "checkbox",
                "tooltip": "TBA (yes, I know your personality is unique)"
            },
            {
                "name": "IsDefault",
                "label": "Default Personality",
                "type": "checkbox",
                "tooltip": "TBA"
            },
            {
                "name": "Level",
                "label": "Level",
                "type": "range",
                "tooltip": "TBA. Defaults to [3, 30]",
                "min_value": 1,
                "max_value": 65,
                "step_size": 1,
                "precision": 0
            },
            {
                "name": "IsLevelFixed",
                "label": "Level Cannot Change",
                "type": "checkbox",
                "tooltip": "TBA"
            },
            {
                "name": "RequiredTraits",
                "label": "Required Traits",
                "type": "list",
                "tooltip": "TBA"
            },
            {
                "name": "IsGearFixed",
                "label": "Gear Cannot Change",
                "type": "checkbox",
                "tooltip": "TBA"
            },
            {
                "name": "Gear",
                "type": "nest",
                "nest": [
                    {
                        "name": "Helmet",
                        "label": "Helmet Gear Pool",
                        "type": "list",
                        "tooltip": "TBA"
                    },
                    {
                        "name": "Chestplate",
                        "label": "Helmet Gear Pool",
                        "type": "list",
                        "tooltip": "TBA"
                    },
                    {
                        "name": "Gauntlets",
                        "label": "Gauntlets Gear Pool",
                        "type": "list",
                        "tooltip": "TBA"
                    },
                    {
                        "name": "Leggings",
                        "label": "Leggings Gear Pool",
                        "type": "list",
                        "tooltip": "TBA"
                    },
                    {
                        "name": "MeleeWeapon",
                        "label": "Melee Weapon Pool",
                        "type": "list",
                        "tooltip": "TBA"
                    },
                    {
                        "name": "RangedWeapon",
                        "label": "Ranged Weapon Pool",
                        "type": "list",
                        "tooltip": "TBA"
                    }
                ]
            },
            {
                "name": "IsTraitsFixed",
                "label": "Traits Cannot Change",
                "type": "checkbox",
                "tooltip": "TBA"
            },
            {
                "name": "IsRequiredTraitsFixed",
                "label": "Required Traits Cannot Change",
                "type": "checkbox",
                "tooltip": "TBA"
            },
            {
                "name": "IsTitleFixed",
                "label": "Title Cannot Change",
                "type": "checkbox",
                "tooltip": "TBA"
            },
            {
                "name": "IsTitleRequired",
                "label": "Must Have Related Title",
                "type": "checkbox",
                "tooltip": "TBA"
            },
            {
                "name": "Titles",
                "label": "Titles",
                "type": "list",
                "tooltip": "TBA"
            }
            
        ],
        "sections": [
            [
                "Id",
                "Parent",
                "Heroes",
                "Weight",
                
                "Titles",
                "IsTitleFixed",
                "IsTitleRequired",
                
                "Level",
                "IsLevelFixed",
                
                "RequiredTraits",
                "IsTraitsFixed",
                "IsRequiredTraitsFixed",
                
                "IsUnique",
                "IsDefault"
            ],
            [
                "IsGearFixed",
                "Gear",
                "OverridesSpeech",
                "Speech"
            ]
        ]
    });
    
    let HeroTraitPreset = new Preset({
        "title": "HeroTrait Generator",
        //"color": "#ff9494",
        "fields": [
            {
                "name": "Id",
                "type": "text",
                "default": "None",
                "tooltip": "The ID of this trait. It should be exactly the same as the file name (without the extension), and should be in CamelCase."
            },
            {
                "name": "Name",
                "type": "text",
                "default": "None",
                "tooltip": "The display name of this trait."
            },
            {
                "name": "Category",
                "type": "dropdown",
                "choices": ["Hatred", "Immunity", "Blessing", "Combat", "Vulnerability", "Phobia", "MortalWeakness"],
                "default": "Hatred",
                "tooltip": "The trait's category."

            },
            {
                "name": "UniqueType",
                "label": "Unique Type",
                "type": "text",
                "tooltip": "The unique category this trait fills, if any. Heroes can only have one trait of each UniqueType."
            },
            {
                "name": "Description",
                "default": "None",
                "type": "component_builder",
                "tooltip": "The trait's description, which appears in Hero Profile and can use formatted text.",
                "component": [
                    {
                        "name": "Text",
                        "type": "text",
                        "tooltip": "The text of this component.",
                        "shortcut_if_alone": true,
                        "required": true
                    },
                    {
                        "name": "Color",
                        "type": "dropdown",
                        "tooltip": "The color of this component.",
                        "choices": COLORS
                    },
                    {
                        "name": "IsBold",
                        "label": "Bold",
                        "type": "checkbox",
                        "tooltip": "Whether this component should be bold."
                    },
                    {
                        "name": "IsItalics",
                        "label": "Italics",
                        "type": "checkbox",
                        "tooltip": "Whether this component should be italicized."
                    }
                ]
            },
            {
                "name": "Icon",
                "type": "text",
                "tooltip": "A reference to the .png file for this trait's display icon."
            },
            {
                "name": "Color",
                "type": "dropdown",
                "choices": COLORS,
                "tooltip": "The background color of this trait's icon."
            },
            {
                "name": "Weight",
                "type": "number",
                "min_value": 0,
                "step_size": 0.1,
                "precision": 1,
                "tooltip": "The trait's weight, used for random selection. Average is 1.0. Defaults to the trait's default category weight."
            },
            {
                "name": "IsEpic",
                "label": "Epic",
                "type": "checkbox",
                "tooltip": "Whether this trait is epic or not."
            },
            {
                "name": "IsSpecial",
                "label": "Remove From Pool",
                "type": "checkbox",
                "tooltip": "True if this trait should not appear in the normal pool."
            },
            {
                "name": "Titles",
                "type": "list",
                "tooltip": "A list of comma-separated titles associated with this trait."
            },
            {
                "name": "Criteria",
                "label": "Group Permissions",
                "type": "checkbox_table",
                "tooltip": "No tooltip (yet).",
                "row_labels": [ "Free", "Evil", "Man", "Hobbit", "Elf", "Dwarf", "Orc", "Beorning" ],
                "column_labels": [ "Include", "Exclude" ],
                "columns": [ "IncludeGroups", "ExcludeGroups" ],
                "output_type": 1
            },
            {
                "name": "VisibleCriteria",
                "label": "Criteria to be Visible",
                "tooltip": "No tooltip (yet).",
                "type": "nest",
                "nest": [
                    {
                        "name": "Followers",
                        "type": "checkbox",
                        "tooltip": "If this trait requires Followers to be visible."
                    },
                    {
                        "name": "Mount",
                        "type": "checkbox",
                        "tooltip": "If this trait requires a Mount to be visible."
                    },
                    {
                        "name": "Summoner",
                        "type": "checkbox",
                        "tooltip": "If this trait requires a Summoner to be visible."
                    },
                    {
                        "name": "MortalWeakness",
                        "label": "Mortal Weakness",
                        "type": "checkbox",
                        "tooltip": "If this trait requires Mortal Weakness to be visible."
                    },
                    {
                        "name": "Relationship",
                        "type": "dropdown",
                        "choices": ["", "Guardian", "Ward", "BloodBrother"],
                        "tooltip": "The required relationship this Hero must have for this trait to be visible."
                    }
                ]
            }
        ],
        "sections": [
            [
                "Name",
                "Id",
                "Category",
                "UniqueType",
                "Description",
                "Weight",
                "Icon", 
                "Color",
                "IsEpic",
                "IsSpecial",
                "Titles"
            ],
            [
                "Criteria",
                "VisibleCriteria"   
            ]
        ]
    }).setFileName(function(self) {
        if(self.data["Id"]) {
            return self.data["Id"];
        } else {
            return "Trait";
        }
    }).setOnLoad(function() {
        $(".text-input_name").on("blur", function () {
            if($(".text-input_id").val().length <= 0) {
                $(".text-input_id").val(toTitleCase($(".text-input_name").val()).replace(/ /g, ""));
            }
        });
    });
    
    addPreset("trait", HeroTraitPreset);
    addPreset("personality", HeroPersonalityPreset);
    
    setCurrentPreset("trait");
    
    let end = Date.now();
    console.log("Loaded in " + (end - start) + "ms!");
}

$(function() {
    main();
});