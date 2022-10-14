fs = require("fs");
path = require("path");

/*
    Data to be processed with this library can either be piped-in, or loaded from files.
*/

let inStream = process.openStdin();
inStream.on("error", console.error);


/*
    There are 2 functions for handling piped-in data:

     - line
     - whole

    Each of these functions takes a "modifier" callback.
    
    The "modifier" callback -- which takes 2 parameters ("data" and "outputter") -- is the function that will process the data. The 
    "data" parameter is the data to be processed, and the "outputter" is a function used to output the processed data.
    
    If using the "line" function, the "modifier" will be called for each line of the input (being given the line as the 
    "data" parameter). If using the "whole" function, the "modifier" will be called once (with the whole data being given as the 
    "data" parameter).
*/

const stdOutputter = data => console.log(data);
newLineRegex = /\r?\n/; //REGEX explanation: Linux files have just LF for newlines, whereas Windows have CRLF



exports.line = modifier => inStream.on("data", chunk => {
    chunk.toString().split(newLineRegex).forEach(data => modifier(data, stdOutputter));
});

exports.whole = modifier => inStream.on("data", chunk => modifier(chunk.toString(), stdOutputter));



/*
    To process multiple files, this library also provides the "files" function.

    This function takes the following parameters:
     - srcDir (The directory containing the files to process)
     - outDir (The directory to output the processed files to)
     - extWhitelist (An array of file extensions. These determine which files will get processed)
     - extBlackList (An array of file extensions. These determine which files will not get processed)
     - processor (A callback function that processes the given data)

    If a file's extension matches a string in both the whitelist and the blacklist, the file will not be processed. This 
    means (as one possible example) you could process all ".js" files, while ignoring ".test.js" files.

    The "processor" function should take 2 parameters: "line" and "whole". These parameters will be functions, that each take a 
    "modifier" function as a parameter (they work just like the export's line/whole functions, defined above). These allow you to 
    process the data for each file, in the same way you would process piped-in data.
*/


//Does the given filename have an extension in the given array?
const fileNameMatchesExt = (name, extensionsArr) => {
    return !!extensionsArr.find(ext => name.endsWith(ext));
};


//Loads, processes, saves
//May throw an exception
const processFile = (srcPath, outPath, processor) => {

    const fileData = fs.readFileSync(srcPath);

    //Define the line/whole functions, to be passed to the processor
    dataToOutput = [];
    const outputter = (data) => dataToOutput.push(data);
    const lineFunc = (modifier) => fileData.toString().split(newLineRegex).forEach(data => modifier(data, outputter))
    const wholeFunc = (modifier) => modifier(fileData.toString(), outputter);

    //Call the given processor
    processor(lineFunc, wholeFunc);
    
    //Now save the outputted data to the new file
    fs.writeFileSync(outPath, dataToOutput.join("\n"));
};



exports.files = (srcDir, outDir, extWhitelist, extBlackList, processor) => {

    inStream.destroy() //We have to end this (as it's not otherwise being used). If we don't, the script will hang
    
    //Get all the file names in the src directory, and process them if they have the right file ext
    try {
        const srcFileList = fs.readdirSync(srcDir, { withFileTypes: true });
        
        //Generate list of files to be processed
        const filesToProccess = [];
        for(const srcFile of srcFileList) {
            if(fileNameMatchesExt(srcFile.name, extWhitelist) && !fileNameMatchesExt(srcFile.name, extBlackList))
            {
                filesToProccess.push({ 
                    src: path.join(srcDir, srcFile.name),
                    out: path.join(outDir, srcFile.name)
                });
            }
        }

        //Now create the output directory
        if(!fs.existsSync(outDir))
            fs.mkdirSync(outDir);
        
        //Now trigger the loading and processing of each file
        filesToProccess.forEach(f => processFile(f.src, f.out, processor));
        
    } catch (e) {
        console.error(e);
    }
};