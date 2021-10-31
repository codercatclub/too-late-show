varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vDist;
varying float vReflectionFactor;
uniform float ignoreReflection; 

uniform float timeMSec;
uniform float turnOnT;
uniform vec3 fresnelColor;
varying float blackout;

varying float vId;

#include <fog_pars_fragment>
@import ./NoiseFx; 

vec3 spectral_jet(float w)
{
	w = 400.0 + 300.0 * w;
    // w: [0, 1]
	// x: [0,   1]
	float x = saturate((w - 400.0)/ 300.0);
	vec3 c;

	if (x < 0.25)
		c = vec3(0.0, 4.0 * x, 1.0);
	else if (x < 0.5)
		c = vec3(0.0, 1.0, 1.0 + 4.0 * (0.25 - x));
	else if (x < 0.75)
		c = vec3(4.0 * (x - 0.5), 1.0, 0.0);
	else
		c = vec3(1.0, 1.0 + 4.0 * (0.75 - x), 0.0);

	// Clamp colour components in [0,1]
	return saturate(c);
}
void main() {
  float jetFactor = max(vReflectionFactor - 0.2 - 1.8*(blackout), 0.0);
  vec3 finalColor = fresnelColor * jetFactor * spectral_jet(jetFactor - 0.4);
  finalColor *= max(jetFactor-0.4, 0.0);
  float whiteout1 = 0.83 + 0.3 * smoothstep(0.7,0.8,turnOnT);
  float whiteout2 = smoothstep(0.9,1.0,turnOnT);
  gl_FragColor.rgb = 3.0*(0.5 + 0.5*turnOnT) * finalColor + 0.08*fresnelColor;
  gl_FragColor.a = whiteout1;
  gl_FragColor.rgb += whiteout2 * ignoreReflection * fresnelColor;
  #include <fog_fragment>
}