/*
    MAP CLASS
    by Mrs. Christin Koss

A plane ( or any other Mesh)  will be covered with a Picture ( jpg photo )

*/

function triAngulationTargetMapClass(renderer, scene) {

    this.renderer = renderer; // give the renderer for Anistrophy
    this.scene = scene; // give the scene for some texture issue on CHROME!?  NOT jet fixed
    this.slObj = null; // cube etc as an Object for the scene
    this.textObj = null;

    this.iMax = 0;
    this.jMax = 0;
  
}

triAngulationTargetMapClass.constructor = triAngulationTargetMapClass;


//----------------------  METHODS -----------------------------------------------------------------------------

// neue textureLoad wegen Chrome..zeigte nur schwartes bild 

triAngulationTargetMapClass.prototype.buildPlaneMeshNew = function (meshName, posX, posY, posZ, PicPath) {

    THREE.ImageUtils.crossOrigin = "";
    var texture = new THREE.TextureLoader().load(PicPath);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;


    //PlaneGeometry(width, height, widthSegments, heightSegments)
    var geometry = new THREE.PlaneGeometry(100, 100, 32);
    var materials = new THREE.MeshLambertMaterial({
        map: texture       // This effort was for CHROME!! see my doc!!  - How2_HTML5_CSS3_JqueryMobileMin_V01           
    });

    planeImageMesh1 = new THREE.Mesh(geometry, materials);
    planeImageMesh1.name = meshName;
    scene.add(planeImageMesh1);
    planeImageMesh1.position.set(posX, posY, posZ);


};


triAngulationTargetMapClass.prototype.buildPlaneMesh = function (meshName,posX, posY, posZ, PicPath) {

  
    var maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();

    var p = PicPath;

    //PlaneGeometry(width, height, widthSegments, heightSegments)
    var geometry = new THREE.PlaneGeometry(100, 100, 32);
    var materials = new THREE.MeshBasicMaterial({
        map: loadImage(p)       // This effort was for CHROME!! see my doc!!  - How2_HTML5_CSS3_JqueryMobileMin_V01           
    });
    
    planeImageMesh1 = new THREE.Mesh(geometry, materials);
    planeImageMesh1.name = meshName;  
    scene.add(planeImageMesh1);
    planeImageMesh1.position.set(posX, posY, posZ);
       
     
};

// https://github.com/mrdoob/three.js/issues/687
// basically for the chrome issue - BUT also good for some further LAB on Picture 2D Canvas ETC

function loadImage(path) {
    var canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    //document.body.appendChild(canvas);

    var texture = new THREE.Texture(canvas);

    var img = new Image();
    img.crossOrigin = '';
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;

        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0);

        texture.needsUpdate = true;
    };
    img.src = path;
    return texture;
}

triAngulationTargetMapClass.prototype.getSliderText = function (slID, textLabel) {

    // sehr gut...bei bedarf ..beim cubeSlider "stehlen"..

};
