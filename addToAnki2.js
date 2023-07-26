const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const inputFile = "everybody-hate-chris_s1e1.mkv";
const srtFile = "subtitles.srt";
const transSrt = "translated.srt";
const seriesAndInfo = inputFile.split(".")[0];
const seriesName = inputFile.split("_")[0];
const season = inputFile.match(/(?<=_s)\d+(?=e\d+.)/)[0];
const episode = inputFile.match(/(?<=_s\de)\d+(?=[.])/)[0];

let n = 0;

fs.readFile(transSrt, "utf8", (transErr, transData) => {
  fs.readFile(srtFile, "utf8", (err, dataSrt) => {
    if (err || transErr) {
      console.error("Erro ao ler o arquivo:", err);
      console.error("Erro ao ler o arquivo:", transErr);
      return;
    }
    let regex = new RegExp(
      /\d\d:\d\d:\d\d,\d\d\d --> \d\d:\d\d:\d\d,\d\d\d/,
      "gm"
    );
    let texts = dataSrt.split(regex);
    let numbering = dataSrt.match(/^\d+(?==(\n|\r|\r\n)\d\d:\d\d:\d\d,\d\d\d --> \d\d:\d\d:\d\d,\d\d\d)/gm);

    let transText = transData.split(regex);
    // removendo o ultimo numero
    texts = texts.map(function (text) {
      return reverseString(reverseString(text).replace(/\d+/, ""));
    });
    transText = transText.map(function (text) {
      return reverseString(reverseString(text).replace(/\d+/, ""));
    });

    async function addCardWithAudio(
      deckName = seriesAndInfo,
      frontText = texts[numbering[n]],
      backText = transText[numbering[n]],
      audioFilePath = `/home/antonio/series/${seriesName}/s${season}/e${episode}/${seriesAndInfo}_${numbering[n]}.mp3`
    ) {
      // Read the MP3 audio file
      const audioFile = audioFilePath ; // Replace with your audio file path
      const audioData = fs.readFileSync(audioFile);

      // Create a new form data instance
      const formData = new FormData();
      formData.append("file", audioData, `${seriesAndInfo}_${numbering[n]}.mp3`); // Replace 'audio.mp3' with a suitable filename for your audio

      const buffer = formData.getBuffer() ;
      // Make a POST request to the AnkiConnect API to add the audio to the media collection
      axios
        .post("http://localhost:8765", {
          action: "storeMediaFile",
          version: 6,
          params: {
            filename: `${seriesAndInfo}_${numbering[n]}.mp3`, // Replace with the same filename used above
            data: buffer.toString('base64'),
          },
        })
        .then((response) => {
          console.log("Audio added to Anki media collection:", response.data);
        })
        .catch((error) => {
          console.error("Error adding audio to Anki media collection:", error);
        });

      // Prepare the data for the AnkiConnect API
      const data = {
        action: "addNote",
        version: 6,
        params: {
          note: {
            deckName: deckName,
            modelName: "Basic",
            fields: {
              Back: `${backText}`,
              Front: `${frontText}
              [sound:${seriesAndInfo}_${numbering[n]}.mp3]`,
            },
            options: {
              allowDuplicate: false,
            },
            tags: [],
          },
        },
      };

      // Send a POST request to AnkiConnect API
      try {
        const response = await axios.post("http://localhost:8765", data);
        if (response.data.error) {
          console.log(
            "Error occurred while adding the card:",
            response.data.error
          );
        }

        if (n == numbering.length - 1) {
          console.log("Todos os cards Foram Adiciondas ao Anki");
        } else {
          console.log(`card added successfully ${numbering[n]}`);
          n += 1;
          addCardWithAudio(
            seriesAndInfo,
            texts[numbering[n]],
            transText[numbering[n]],
            `/home/antonio/series/${seriesName}/s${season}/e${episode}/${seriesAndInfo}_${numbering[n]}.mp3`
          );
        }
      } catch (error) {
        console.error(
          "Error occurred while communicating with AnkiConnect:",
          error.message
        );
      }
    }

    addCardWithAudio();
  });
});
// função que reverte uma string
function reverseString(string) {
  let reversedString = "";
  for (let i = string.length - 1; i >= 0; i--) {
    reversedString += string[i];
  }
  return reversedString;
}
