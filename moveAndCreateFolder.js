const { exec } = require("child_process");

const ls = `ls *.mkv`;
function moveAndCreateFolder() {
  exec(ls, (err, stdout, stderr) => {
    if (err) {
      console.log(`Erro ao ler o arquivo : ${err}`);
    } else {
      let allFiles = stdout.split(/\n/);
      allFiles.pop();

      allFiles.forEach((e, i) => {
        const episode = e.match(/(?<=_s\de)\d+(?=[.])/)[0];
        if (episode) {
          // create folder
          let createFolder = `mkdir e${episode}`;
          exec(createFolder, (err, stdout, stderr) => {
            if (err) {
              console.log(`Erro ao criar pasta : ${err}`);
            }

            // move to folder
            let moveToFolder = `mv ${e} e${episode}`;
            exec(moveToFolder, (err, stdout, stderr) => {
              if(err){
                console.log(`Error ao criar pasta : ${err}`);
              } 
            });
          });
        }
        // move videos to folder
      });
    }
  });
}

// executin function
moveAndCreateFolder();
