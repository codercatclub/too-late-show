@import ./NoiseFx;
@import ./ExposureFragPars;

uniform float timeMSec;
uniform vec3 env_c1;
uniform vec3 env_c2;

varying vec3 vPos;

void main() {

  float freq = 0.00012;

  vec3 scrollingPos = vec3(vPos.x, vPos.y, vPos.z + timeMSec/100.0);
  float noise = 0.5 + cnoise(scrollingPos * 2.0);

  gl_FragColor = vec4(mix(env_c1, env_c2, noise), 1.0);
  @import ./ExposureFrag;
}