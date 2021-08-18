@import ./NoiseFx;

uniform float time;
uniform vec3 env_c1;
uniform vec3 env_c2;

varying vec3 vPos;

void main() {

  float freq = 0.00012;

  vec3 scrollingPos = vec3(vPos.x, vPos.y, vPos.z + time/100.0);
  float noise = cnoise(scrollingPos * 4.0) + 0.2;

  gl_FragColor = vec4(mix(env_c1, env_c2, noise), 1.0);
}