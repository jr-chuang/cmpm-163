import { ShaderMaterial, Uniform } from "three";

export default class AssignmentMaterial extends ShaderMaterial {

	constructor() {

    const fragment = `
    uniform sampler2D tDiffuse;
    uniform float width;
    uniform float height;
    varying vec2 vUv;

    void main(void)
    {
      float kernel[9];
      kernel[0] = kernel[2] = kernel[6] = kernel[8] = 0.0;
      kernel[1] = kernel[3] = kernel[5] = kernel[7] = -1.0;
      kernel[4] = 25.0;

      int i = 0;
      vec4 sum = vec4(0.0);

      for (int i = 0; i < 9; i++)
      {
        vec2 coord = vec2(vUv.x, vUv.y);
        vec4 tmp = texture2D(tDiffuse, coord);
        sum += tmp * kernel[i];
        sum.a = 1.0;
      }

      gl_FragColor = sum;
    }
    `;

    const vertex = `
    varying vec2 vUv;

    void main() {
    	vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `;

		super({
			type: "AssignmentMaterial",
			uniforms: {
        tDiffuse: new Uniform(null),
        width: window.innerWidth,
        height: window.innerHeight
      },
			fragmentShader: fragment,
			vertexShader: vertex,
			depthWrite: false,
			depthTest: false
		});

	}

}
