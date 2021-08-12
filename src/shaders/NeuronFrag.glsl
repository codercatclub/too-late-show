varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vDist;
varying float vReflectionFactor;


uniform float timeMSec;
uniform float playT;
uniform float cameraMove;

void main() {
  float brightness = 1.0 - min(abs(vDist - playT)/0.05, 1.0);
	vec3 fractBy3 = vec3(
		floor(fract(7. * timeMSec) + 0.5),
		floor(fract(7. * timeMSec+0.3) + 0.5),
		floor(fract(7. * timeMSec+0.6) + 0.5)
	);
	
  vec3 finalColor = vReflectionFactor * vec3(1.0, 0.0 , 0.0);
  vec3 glitchColor = cameraMove * pow(vReflectionFactor, 12.0) * fractBy3;
  finalColor += glitchColor;
  
  gl_FragColor = vec4(finalColor, 1.0);
}