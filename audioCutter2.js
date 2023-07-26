//  Audio Cutter1 7 minutes  with 20
//  Audio Cutter1

let n = 0;

const inputFile = "everybody-hate-chris_s1e1.mkv";
const srtFile = "subtitles.srt";
const seriesAndInfo = inputFile.split(".")[0];
const seriesName = inputFile.split("_")[0];
const season = inputFile.match(/(?<=_s)\d+(?=e\d+.)/)[0];
const episode = inputFile.match(/(?<=_s\de)\d+(?=[.])/)[0];

function audioCutter() {
  const { exec } = require("child_process");
  const fs = require("fs");

  fs.readFile(srtFile, "utf8", (err, data) => {
    if (err) {
      console.error("Erro ao ler o arquivo:", err);
      return;
    }

    let regex = new RegExp(
      /\d\d:\d\d:\d\d,\d\d\d --> \d\d:\d\d:\d\d,\d\d\d/,
      "gm"
    );
    let texts = data.split(regex);
    let numbering = data.match(/^\d+(?==(\n|\r|\r\n)\d\d:\d\d:\d\d,\d\d\d --> \d\d:\d\d:\d\d,\d\d\d)/gm);
    let timings = data.match(
      /\d\d:\d\d:\d\d,\d\d\d --> \d\d:\d\d:\d\d,\d\d\d/gm
    );
    // removendo o ultimo numero
    texts = texts.map(function (text) {
      return reverseString(reverseString(text).replace(/\d+/, ""));
    });

    // cortando de n em n

    let time = timings[numbering[n] - 1].split("-->");
    let startTime = time[0].trim().replace(",", ".");
    let endTime = time[1].trim().replace(",", ".");

    // to copy just the audio
    let command = `ffmpeg -i ${inputFile} -vn -ss ${startTime} -to ${endTime} -q:a 0 ${seriesAndInfo}_${numbering[n]}.mp3`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao cortar o áudio: ${err} ` );
      } else {

        console.log(`corte concluido :${numbering[n]}`);
        n += 1;
        if (n == numbering.length ) {
          console.log(`todos os audio foram concluidos`);
        } else {
          audioCutter();
        }
      }
    });
  });
}

audioCutter();

// função que reverte uma string
function reverseString(string) {
  let reversedString = "";
  for (let i = string.length - 1; i >= 0; i--) {
    reversedString += string[i];
  }
  return reversedString;
}
