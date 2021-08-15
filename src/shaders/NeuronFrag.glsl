varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vDist;
varying float vReflectionFactor;
varying float glitchFactor;


uniform float timeMSec;
uniform float playT;
uniform float cameraMove;
uniform vec3 fresnelColor;
#include <fog_pars_fragment>

#ifdef USE_MAP
	uniform sampler2D map;
	varying vec2 vUv;
#endif

vec3 generic_desaturate(vec3 color, float factor)
{
	vec3 lum = vec3(0.299, 0.587, 0.114);
	vec3 gray = vec3(dot(lum, color));
	return mix(color, gray, factor);
}

void main() {

	

  #ifdef USE_MAP
	vec4 texelColor = texture2D( map, vUv );
	vec2 p = vUv - vec2(0.5,0.5);
	float vignette = 2.0 * pow(length(p), 3.0);
	texelColor.rgb = generic_desaturate(texelColor.rgb, 0.5);

	float scan = 0.5 + 0.5 * sin(250.0*vUv.y + 30.0*timeMSec);
	texelColor.rgb += 0.1*max(scan, vignette) * fresnelColor;

	texelColor.rgb = mix(texelColor.rgb, fresnelColor, vignette);
	//texelColor = mapTexelToLinear( texelColor );
	vec4 finalColor = vec4(texelColor.rgb, 1.0);
  #else
    vec4 finalColor = vec4(fresnelColor * vReflectionFactor, vReflectionFactor + 0.5);
  #endif

  float brightness = 1.0 - min(abs(vDist - playT)/0.02, 1.0);
	vec3 fractBy3 = vec3(
		floor(fract(7. * timeMSec) + 0.5),
		floor(fract(7. * timeMSec+0.3) + 0.5),
		floor(fract(7. * timeMSec+0.6) + 0.5)
	);
  vec3 glitchColor = cameraMove * pow(glitchFactor, 12.0) * fractBy3;
  finalColor.rgb += glitchColor;
  finalColor.rgb += 10.0 * brightness * fresnelColor;
  
  gl_FragColor = finalColor;

  #include <fog_fragment>
}