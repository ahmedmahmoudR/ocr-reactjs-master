import React, { Component } from 'react';
import { Loader } from 'react-overlay-loader';
import './App.css';
import ocr from './ocr';
import { PrimaryButton, Dropdown } from '@fluentui/react';


const options = [{key: "ocrlocal", text: "OCR Local"}, {key: "ocrfile", text: "OCR File"}]

var wordsInDocument = null;

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      picture: null,
      action: null,
      apiResult: ""
    }
  }

  setPicture = e => {
    this.setState({ picture: e.target.files[0] })
  }

  setAction =e => {
    if (e.target.value === "local") {
      this.setState({ action: e.target.value })
    }
    else {
      this.setState({ action: e.target.value })
    }
  }

  compute = e => {
    console.log("hello !! ")
    this.setState({loading: true}, () => {
      let o = new ocr(
          this.state.action, 
          this.state.picture,  
          document.getElementById("raw-output"), 
          document.getElementById("visual-output"));
      


            var serviceSignature;
        serviceSignature = o.getLocalServiceSignature();

       fetch("http://40.114.204.9:18010/recognize_pdf", serviceSignature)
       .then(async response => {
           
        // const blob = new Blob(response.body, {type : 'application/pdf'});
        // var fileUrl = URL.createObjectURL(blob);
        // window.open(fileUrl);
const x = await response.blob();
        var fileUrl2 = URL.createObjectURL(x);
        
        window.open(fileUrl2);
        this.setState({loading: false});

       })
       .then(result => console.log(result))
       .catch(error => console.log('error', error))
          })
      
  }

  canvasClick = e => {
    let canvas = document.getElementById("visual-output");
    const rect = canvas.getBoundingClientRect();
    let coordinates = {
      y: e.clientY - rect.top,
      x: e.clientX - rect.left
    }

    wordsInDocument.forEach(item => {
      if (coordinates.x > item.x && coordinates.x < item.x + item.w && coordinates.y > item.y && coordinates.y < item.y + item.h) {
        var tooltipSpan = document.getElementById('tooltip-span');
        tooltipSpan.innerText = item.text;
        tooltipSpan.style.top = (e.clientY + 5) + 'px';
        tooltipSpan.style.left = (e.clientX + 5) + 'px';
        tooltipSpan.style.display = "block";
        return;
      }
    });
  }

  canvasMoveOut = e => {
    var tooltipSpan = document.getElementById('tooltip-span');
    tooltipSpan.innerText = "";
    tooltipSpan.style.display = "none";
  }

  clear = e => {
    location.reload();
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src="https://i.imgur.com/y8zFncn.png" className="App-logo" alt="logo" />
        </div>
        <div className="App-intro">
          <fieldset className="form-wrapper">
            <legend>What do you want to compute?</legend>
            <div className="doc-upload">
              <h3> Upload File </h3>
            <label className="labelfile" htmlFor="FileName">
              
             <input type="file" id="FileName" onChange={this.setPicture}/> Upload
            </label>
            </div>
            <br /><br />

            <div className="computation-section">
            <label>
              <h3>Type of computation</h3>
              <Dropdown className="dropdown" options= {options} placeholder="Select Item" onChange={this.setAction} id="select-action">
                {/* <option>Select action</option>
                <option value="remote">OCR file</option>
                <option value="local">OCR Local</option> */}
              </Dropdown>
            </label>
            </div>


            <br /><br />
            <PrimaryButton value="Compute!" onClick={this.compute}> Compute! </PrimaryButton> &nbsp;
            <PrimaryButton value="Clear" onClick={this.clear} >Clear</PrimaryButton> 
          </fieldset>
    
            <img src="https://i.imgur.com/1LCLn9q.png" className="pic" alt="logoo"/>
       
          {/* /* <fieldset className="results-wrapper">
            <legend>Raw results</legend>
            <textarea id="raw-output" readOnly={true}></textarea>
          </fieldset> */
          <br />
          /* <fieldset className="results-wrapper">
            <legend>Visual results</legend>
            <div className="tooltip">
              <canvas id="visual-output" onClick={this.canvasClick} onMouseOut={this.canvasMoveOut}></canvas>
              <span id="tooltip-span"></span>
            </div>
          </fieldset> */} 
        </div>
        <Loader fullPage loading={this.state.loading} containerStyle={{background: "rgba(255, 255, 255, 0.9)"}}/>
      </div>
    );
  }
}

export default App;
