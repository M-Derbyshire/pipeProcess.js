# pipeProcess.js

**pipeProcess.js** is a JavaScript module created to make it easier for developers to write data-processing scripts in NodeJS.

The module provides the below functions for processing piped-in data:
 - ```line``` - Used to process data, line by line
 - ```whole``` - Used to process all of the data in one go

The module also provides a ```files``` function, that allows you to process multiple files from a directory, and then output them to another directory.

## Setting Up pipeProcess.js

To be able to use **pipeProcess.js** in your Node scripts, you will need to store it in one of your local *node_modules* directories. 

First, start a Node console from your command line (with the ```node``` command), and then enter ```module.paths```. This will give you the list of directories that Node will try to find modules in.

If you place **pipeProcess.js** in one of those directories, you will be able to use it in any of your Node scripts.

## Processing Piped-In Data

You can pipe data into a script from your command line. The below examples show how to pipe the contents of a text file into a Node script, and then output the results to another text file.

On Windows:
``` type input.txt | node process.js > output.txt ```
On Linux:
``` cat input.txt | node process.js > output.txt ```

Your script can then process the data that has been piped-in, using either the ```line``` or the ```whole``` function. 

Take the below example script, that will add chevron-braces ("<" and ">") around each line of the input:
``` 
require("pipeProcess").line((data, output) => {
    output("<" + data + ">");
}); 
```

This second script will add square-braces around the entire text that was piped-in, using the ```whole``` function:
```
require("pipeProcess").whole((data, output) => {
    output("[" + data + "]");
});
```

If you do not call the "output" parameter function, then that data will not be outputted.

## Processing Multiple Files

You can also use **pipeProcess** to process multiple files at once, using the ```files``` function.

The ```files``` function takes the below parameters:
 - ```srcDir``` - The path to the directory that contains the files to be processed.
 - ```outDir``` - The path to the directory that will contain the processed files (Each file in the source directory will have a corresponding file in this directory. If this directory doesn't exist, it will be created.).
 - ```extWhitelist``` - An array of file extensions. Any file with one of these extensions will be processed (unless their extension also appears in the extBlackList)
 - ```extBlackList``` - An array of file extensions. Any file with one of these extensions will not be processed.
 - ```processor``` - A callback function that will be ran for each file that is being processed. This function should take 2 parameters: ```line``` and ```whole``` (these parameters are both functions, and they work in the same way as the ```line```/```whole``` functions that are used to process piped-in data). 

Take a look at the below example script:
```
require("pipeProcess").files("./srcFolder", "./outFolder", ["js", "ts"], ["test.js", "test.ts"], (line, whole) => {
    
    //Process each line of each file seperately 
    //(to process the whole text of each file in one go, use the "whole" function instead)
    line((data, output) => {
        if(data.startsWith("//"))
        {
            const newText = data.slice(2).trimStart(); //Remove comment slashes
            output(newText);
        }
    });
});
```
This will load files from the "./srcFolder" directory, and store the results in the "./outFolder" directory. It will only process ".js" and ".ts" files (but will not process ".test.js" or ".test.ts" files).


[My Twitter: @mattdarbs](http://twitter.com/mattdarbs)  
[My Portfolio](http://md-developer.uk)
