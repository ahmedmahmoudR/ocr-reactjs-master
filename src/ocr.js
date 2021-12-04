class ocr {
    constructor(where, file, rawResultsCanvas, visualResultsCanvas) {
        this.isRemote = (where === "remote");
        this.file = file;
        this.rawResultsCanvas = rawResultsCanvas;
        this.visualResultsCanvas = visualResultsCanvas;

        if (this.isRemote) {
            this.service = {
                url: process.env.REACT_APP_BASE_OCR_URL,
                // secret: process.env.REACT_APP_BASE_OCR_SECRET
            };
        }
        else {
            this.service = {
                url: process.env.REACT_APP_LOCAL_ENDPOINT
            }
        
        };
    }

    loadImageAsync() {
        return new Promise((resolve) => {
            var reader = new FileReader();
            let img = new Image();
            img.onload = () => resolve(img);
            reader.onload = () => {
                img.src = reader.result;
            };
            reader.readAsDataURL(this.file);
        })
    }

    readImageBytes(){
        return new Promise((resolve) => {
            var reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.readAsArrayBuffer(this.file);
        })
    }

    async createJob() {
        var serviceSignature;
        serviceSignature = this.getLocalServiceSignature();

       fetch("http://40.114.204.9:18010/recognize_pdf", serviceSignature)
       .then(async response => {
           
        // const blob = new Blob(response.body, {type : 'application/pdf'});
        // var fileUrl = URL.createObjectURL(blob);
        // window.open(fileUrl);
const x = await response.blob();
        var fileUrl2 = URL.createObjectURL(x);
        
        window.open(fileUrl2);
           
       })
       .then(result => console.log(result))
       .catch(error => console.log('error', error))
    }

    async getRemoteServiceSignature(){
        let fileArrayByffer = await this.readImageBytes();
        return {
            method: "POST",
            body: fileArrayByffer,
            headers: {
                // 'Ocp-Apim-Subscription-Key': this.service.secret,
                'Content-Type': 'application/octet-stream',
                'Accept': 'application/json'
            }
        };
    }

    getLocalServiceSignature() {
        var formData = new FormData();
        formData.append("pdf", this.file);
        formData.append("format", "pdf");
        formData.append("threads", "1");
        formData.append("all_on_one", "1");
        formData.append("return_modified", "1");
        formData.append("save_type", "file");
        return {
            method: "POST",
            body: formData,
            headers: {
                'accept': 'application/json',
                
            
            }
        };
    }

    async checkJob(jobUrl) {
        return new Promise((resolve, reject) => {
            var poll = async() => {
                let response = await fetch(jobUrl,
                    {
                        method: "GET",
                        headers: {
                            'Ocp-Apim-Subscription-Key': this.service.secret
                            
                        },
                    });
                let json = await response.text();
                if (json.status === "Succeeded") {
                    // Return the boxes found with text on the document
                    resolve(json.recognitionResult);
                }
                else if (json.status === "Failed") {
                    reject("An error occured");
                }
                else {
                    setTimeout(poll, 1000);
                }
            };
            poll();
        });
    }

    async completeJob(json) {
        let img = await this.loadImageAsync();
        let allWords = [];
        // Set canvas width/height
        let ctx = this.visualResultsCanvas.getContext("2d");
        ctx.canvas.width = img.width;
        ctx.canvas.height = img.height;
        // Draw image
        ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);

        // For each box, x, y for each corners, clockwise
        json.lines.forEach(line => {
            line.words.forEach(word => {
                let x = word.boundingBox[0];
                let y = word.boundingBox[1];
                let width = word.boundingBox[2] - word.boundingBox[0];
                let height = word.boundingBox[7] - word.boundingBox[1];
                ctx.rect(x, y, width, height);
                ctx.stroke();
                allWords.push(
                    {
                        text: word.text,
                        x: x, 
                        y: y, 
                        w: width, 
                        h: height
                    }
                );
            });
        });
        // Write raw json in textarea
        this.rawResultsCanvas.value = JSON.stringify(json, null, 2);
        return allWords;
    }
}

export default ocr;