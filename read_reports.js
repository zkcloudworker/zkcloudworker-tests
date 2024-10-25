
const StreamZip = require('node-stream-zip');
const zip = new StreamZip({
    file: 'logs.zip',
    storeEntries: true
});

zip.on('ready', () => {
    // Take a look at the files
    console.log('Entries read: ' + zip.entriesCount);
    for (const entry of Object.values(zip.entries())) {
        const desc = entry.isDirectory ? 'directory' : `${entry.size} bytes`;
	if(entry.isDirectory) {
	}
	else
	{
	    if (entry.name.includes("node")) {

		let Contents = zip.entryDataSync(entry.name).toString('utf8');
		
		for (l of Contents.split("\n")) {
		    if (l.includes("Tests:")){
			for (p of l.split(",")) {
			    if (p.includes("total")) {
				parts = p.split(" ");
				total = parseInt(parts[1])
				if (total == 32){
				}
				else {
				    // extract hash
				    myhash = entry.name.split(",")[0].split("#")[1].split("/")[0];
				    console.log(myhash);
				    //console.log(parts[1]);
				}
				
			    }
			}
		    }
		}
	    }
	}
    }

    // Read a file in memory

//    console.log("The content of path/inside/zip.txt is: " + zipDotTxtContents);

    // Do not forget to close the file once you're done
    zip.close()
});
