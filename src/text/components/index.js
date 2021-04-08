import React from 'react';
import '../styles/main.scss';
// import fire from './fire';

const vision = require('react-cloud-vision-api');
vision.init({auth: 'AIzaSyAdJBBzi66kjNNwvPjCKcWBHpnR68IbIj8'});

class Text extends React.Component {

    constructor(props) {
    super(props);
    this.dimensions = React.createRef()
    this.state = {
        object : [],
        height:[],
        width:[],
        distanceLeftBottom:[],
        border: [],
        plotters:[],
        totalPercentage: [],
    };
    this.imageRef = React.createRef()
    this.onImgLoad = this.onImgLoad.bind(this);
    }

    onImgLoad = ({target: img}) => {
       this.setState({height: img.offsetHeight, width: img.offsetWidth})
    }

    convertBase64 = (file) => {
        return new Promise((resolve, reject) =>{
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = (()=> {
                resolve(fileReader.result);
            });
            fileReader.onerror = ((error) => {
                reject(error);
            });
        });
    };

    uploadImage = async (e) => {
        const file = e.target.files[0];
        const base64 = await this.convertBase64(file);
        this.setState({base64: base64, imageProps: file});
        this.apiRequest();
    }

    apiRequest() {      
        const req = new vision.Request({
        image: new vision.Image({
            base64: this.state.base64,
        }),
        features: [new vision.Feature('TEXT_DETECTION', 2),]
        })

        vision.annotate(req)
        .then((res) => {
            // var object = res.responses[0].textAnnotations[0].boundingPoly.vertices;
            // var object = res.responses[0].fullTextAnnotation.pages[0].blocks[2].boundingBox.vertices
            var object = res.responses[0].fullTextAnnotation.pages[0]
            this.setState({object : object})
                this.objectPlotting(object)
        }, (e) => {
        alert("foutje")
        });
    }

    objectPlotting = (object) => {
        var objective = object.blocks
        var totalPercentage = 0;
        for(let i = 0; i < objective.length; i++){ 
            var width = objective[i].boundingBox.vertices[1].x - objective[i].boundingBox.vertices[0].x;
            var height = objective[i].boundingBox.vertices[2].y - objective[i].boundingBox.vertices[1].y;
            if(isNaN(width)) {
                width = objective[i].boundingBox.vertices[1].x;
            }
            if(isNaN(height)) {
                height = objective[i].boundingBox.vertices[2].y;
            }
            
            var surfaceText = width*height;
            var surfaceTotal = this.state.height*this.state.width;
            var individualPercentage = (surfaceText/surfaceTotal)*100
            totalPercentage = totalPercentage + individualPercentage 
        }
        
        this.setState({totalPercentage: totalPercentage})
 

        const plotters = object.blocks?.map((plotItems) => {
            var width = plotItems.boundingBox.vertices[1].x - plotItems.boundingBox.vertices[0].x;
            var height = plotItems.boundingBox.vertices[2].y - plotItems.boundingBox.vertices[1].y;
            if(isNaN(width)) {
                width = plotItems.boundingBox.vertices[1].x;
            }
            if(isNaN(height)) {
                height = plotItems.boundingBox.vertices[2].y;
            }
            
            return(
            <div>
                <div style={{ borderStyle:"solid",  borderColor:"yellow", zIndex:10, height: height, width:width, position:"absolute", left: plotItems.boundingBox.vertices[0].x, top:plotItems.boundingBox.vertices[1].y}}></div>
            </div>
            )}
    );
    this.setState({plotters : plotters})

    }

render() {


return (
<div className="text">
    <div className="text__image">
            {this.state.plotters}
        <img ref={this.dimensions} onLoad={this.onImgLoad} src={this.state.base64} alt="afbeelding" />
        {"Percentage opname text" + this.state.totalPercentage } %
    </div>

    <button onClick={this.handleSubmit}>Save</button>
    <input className="filetest" type="file" onChange={(e)=> {
    this.uploadImage(e);
    }} />
</div>
)};

};

export default Text;