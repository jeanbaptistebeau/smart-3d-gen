import * as THREE from "three";

export var exportOBJ = scene => {
  let outputOBJ = "";
  let outputMTL = "";

  var indexVertex = 0;
  var vertex = new THREE.Vector3();

  var i,
    j,
    l,
    m,
    face = [];

  scene.traverse(child => {
    if (child instanceof THREE.Mesh) {
      // Color
      const color = child.material.color;
      const r = color.r.toFixed(3);
      const g = color.g.toFixed(3);
      const b = color.b.toFixed(3);
      outputMTL += `newmtl ${child.name} \n`;
      outputMTL += `Kd ${r} ${g} ${b} \n`;

      // Object
      outputOBJ += `usemtl ${child.name} \n`;
      outputOBJ += `o ${child.name} \n`;
      const geometry = child.geometry;

      // Vertices
      var nbVertex = 0;
      const vertices = geometry.attributes["position"];
      for (i = 0, l = vertices.count; i < l; i++, nbVertex++) {
        vertex.x = vertices.getX(i);
        vertex.y = vertices.getY(i);
        vertex.z = vertices.getZ(i);

        vertex.applyMatrix4(child.matrixWorld);
        outputOBJ += `v ${vertex.x} ${vertex.y} ${vertex.z} \n`;
      }

      // Faces
      for (i = 0, l = vertices.count; i < l; i += 3) {
        for (m = 0; m < 3; m++) {
          j = i + m + 1;
          face[m] = indexVertex + j;
        }

        // transform the face to export format
        outputOBJ += "f " + face.join(" ") + "\n";
      }

      // Update index
      indexVertex += nbVertex;
    }
  });

  download(outputOBJ, "scene.obj");
  download(outputMTL, "scene.mtl");
};

/// Download the given data
var download = (data, filename) => {
  var element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + data);
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};
