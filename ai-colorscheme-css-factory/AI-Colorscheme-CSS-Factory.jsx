﻿/* by Anselm Bradford http://twitter.com/anselmbradford */// constantsvar COLORSCHEME_NAME = null;var OUTPUT_FILENAME = null;//variables var doc = app.activeDocument; // the active documentvar folderPath;var filePath;var configFile;var parsed = true; // whether config file was parsed correctlyvar errorMsg = "There is a problem in the configuration file. "; // error message if something goes wrong with reading config filevar readConfig; // holds reference to the configuration filevar swatches; // color scheme swatchesvar cssoutput = {}; // contents of output filefilePath = doc.path+"/ai-colorscheme-css-factory-config.yml";configFile = new File(filePath);// if config file is not found, create default configif (configFile.open('r') == false) createDefaultConfig();    configFile.open('r');        // read the config file and parse out values    readConfig = configFile.read();    COLORSCHEME_NAME = parseConfig( "colorscheme_name" );    OUTPUT_FILENAME = parseConfig( "output_filename" );    // if it wasn't parsed, abort    if (!parsed) { alert( errorMsg ); };    else    {             // create build directory             folderPath = new Folder(doc.path+"/build");             folderPath.create();                          parseSwatchGroups();             if (!parsed) { errorMsg="No colorscheme swatch set found! Check colorscheme swatch group name against name in configuration file."; alert( errorMsg ); }             else             {                parseTransparency();                writeCSS(cssoutput);             }    }function parseSwatchGroups(){    parsed = false;    var numSwatchGroups = app.activeDocument.swatchGroups.length;    //var cssoutput = "";        for (var g = 0; g<numSwatchGroups;g++)    {        if (app.activeDocument.swatchGroups[g].name == COLORSCHEME_NAME)        {            parsed = true; // a colorscheme name was found            swatches = app.activeDocument.swatchGroups[g].getAllSwatches();                        var rgb;            var name;            for (var s = 0; s < swatches.length; s++)            {                rgb = swatches[s].color;                name = swatches[s].name;                name = name.split(' ').join('_');                name = name.split('=').join('-');                cssoutput[name] = {"id":"$"+name,"value":"rgb("+rgb.red+","+rgb.green+","+rgb.blue+")"};                           }        }    }    //prompt("Generated SCSS: ", cssoutput);}function parseTransparency(){    if ( app.documents.length > 0 && doc.pathItems.length > 0 ) {        var numSwatches = swatches.length;        var swatchColor;        var swatchName;        var rgb;                for (var i = 0; i < doc.pathItems.length; i++ ) {            pathRef = doc.pathItems[i];            for (var c = 0; c < numSwatches; c++)            {                swatchColor = swatches[c].color;                if (pathRef.fillColor.red == swatchColor.red &&                     pathRef.fillColor.green == swatchColor.green &&                     pathRef.fillColor.blue == swatchColor.blue)                {                    if (pathRef.opacity != 100)                    {                        swatchName = swatches[c].name+"_alpha"+pathRef.opacity;                        rgb = swatches[s].color;                        cssoutput[swatchName] = {"id":"$"+swatchName,"value":"rgba("+rgb.red+","+rgb.green+","+rgb.blue+","+(pathRef.opacity/100)+")"};                    }                }            }        }    }}// write CSS output filefunction writeCSS(output){    var filePath = folderPath+"/"+OUTPUT_FILENAME+".css";    var outputFile =new File(filePath);     var finalOutput = "";       outputFile.open('w');        var css = "";        // convert to an array for alphabetizing    var tuples = [];    var obj = output;    for (var key in obj) tuples.push([key, obj[key]]);    tuples.sort(function(a, b) {        a = a[0];        b = b[0];            return a < b ? -1 : (a > b ? 1 : 0);    });    for (var i = 0; i < tuples.length; i++) {        var key = tuples[i][0];        var value = tuples[i][1];        css += "$"+key+": "+value["value"]+"\r";    }        outputFile.write( css );    outputFile.close();}// regex parse config file// value = value to search for in config file// type = type to cast tofunction parseConfig( value , type ){    var reg = value + "[ ]*:[ ]*(.*)";    var pattern = new RegExp(reg);    var result = pattern.exec(readConfig);    var returnVal;    if (!result) { parsed = false; errorMsg += (" Check near '"+value+"'.") }    else    {        returnVal = result[1];        if (type) returnVal = type(returnVal);    }    if (returnVal == '' || returnVal == null || (type == Number && isNaN(returnVal) ) ) { parsed = false; errorMsg += (" Check value of '"+value+"'.")}        return returnVal;}// create default configuration filefunction createDefaultConfig(){    var contents = '# Default color scheme group name\n';       contents += 'colorscheme_name : app_scheme\n\r';       contents += '# output file name\n';       contents += 'output_filename : colorscheme\n\r';        var outputFile =new File(filePath);           outputFile.open('w');          outputFile.write(contents);          outputFile.close();}