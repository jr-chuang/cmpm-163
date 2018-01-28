import { Pass } from "postprocessing";
import AssignmentMaterial from "./AssignmentMaterial.js";

export default class AssignmentPass extends Pass {

	constructor() {

		super();

		this.name = "AssignmentPass";
		this.needsSwap = true;
		this.material = new AssignmentMaterial();
		this.quad.material = this.material;

	}

	render(renderer, readBuffer, writeBuffer) {

		this.material.uniforms.tDiffuse.value = readBuffer.texture;
		renderer.render(this.scene, this.camera, this.renderToScreen ? null : writeBuffer);

	}

}
