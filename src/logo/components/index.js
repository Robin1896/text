import React from 'react';
import '../styles/main.scss';
// import fire from './fire';

const vision = require('react-cloud-vision-api');
vision.init({auth: 'AIzaSyAdJBBzi66kjNNwvPjCKcWBHpnR68IbIj8'});

class RuleOfThirds extends React.Component {

    constructor(props) {
    super(props);
    this.dimensions = React.createRef()
    this.state = {
        object : [],
        height:[],
        width:[],
        distanceLeftBottom:[],
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
        features: [new vision.Feature('LOGO_DETECTION', 1),]
        })

        vision.annotate(req)
        .then((res) => {
            var object = res.responses[0].logoAnnotations[0].boundingPoly.vertices;
            var x1object = object[0].x;
            var y1object = object[1].y;
            var y2object = object[2].y;
            var objecty = (y2object - y1object )
            const distanceY = this.state.height - objecty - y1object;
            const distanceX = x1object;
            const distanceLeftBottomPerc = 100-(Math.sqrt(Math.pow((distanceX/this.state.width)*100, 2) + Math.pow((distanceY/this.state.width)*100, 2) ));
            // const logo = <div style={{ borderStyle:"solid",  borderColor:"yellow", zIndex:10, height: height, width:width, position:"absolute", left: x1object, top:y1object}}></div>;

            this.setState({
                // logo : logo,
                distanceLeftBottom : distanceLeftBottomPerc,
                })

        }, (e) => {
        alert("foutje")
        });
    }

render() {
    console.log()
return (
<div className="rule-of-thirds">
    <div className="rule-of-thirds__image">
            {this.state.logo}
        <img ref={this.dimensions} onLoad={this.onImgLoad} src={this.state.base64} alt="afbeelding" />
        {"afstand tot linksonder tot logo:" }{this.state.distanceLeftBottom} %
    </div>

    <button onClick={this.handleSubmit}>Save</button>
    <input className="filetest" type="file" onChange={(e)=> {
    this.uploadImage(e);
    }} />
</div>
)};

};

export default RuleOfThirds;