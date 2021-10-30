varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vDist;
varying float vReflectionFactor;
varying float glitchFactor;
varying float decay;

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

	

  #ifdef USE_MAP
	vec4 texelColor = texture2D( map, vUv ) * 0.7;
	vec2 p = vUv - vec2(0.5,0.5);
	float vignette = 2.0 * pow(length(p), 3.0);

	float scan = 0.5 + 0.5 * sin(250.0*vUv.y + 30.0*timeMSec);
	// texelColor.rgb = mix(texelColor.rgb, fresnelColor, vignette);
	texelColor.r = 3.5*pow(texelColor.r, 3.0);
	texelColor.g = 3.0*pow(texelColor.g, 3.0);
	texelColor.b = 3.5*pow(texelColor.b, 3.0);
	texelColor.rgb += 0.01*max(scan, vignette);
	vec4 finalColor = vec4(texelColor.rgb, 3.3);
  #else
    vec4 finalColor = vec4(fresnelColor * vReflectionFactor, vReflectionFactor + 0.5);
  #endif

  float brightness = 1.0 - min(abs(0.95 * vDist - playT)/0.02, 1.0);
  float flash = sin(3.14 * min(playT/0.025, 1.0));
	vec3 fractBy3 = vec3(
		floor(fract(7. * timeMSec) + 0.5),
		floor(fract(7. * timeMSec+0.3) + 0.5),
		floor(fract(7. * timeMSec+0.6) + 0.5)
	);
  vec3 glitchColor = cameraMove * pow(vReflectionFactor, 12.0) * fractBy3;
  finalColor.rgb += glitchColor;
  finalColor.rgb += 10.0 * (brightness + flash) * vec3(1.0, 1.0, 1.0);

  float m = glitchFactor + 0.3 * sin(3.0*vWorldPos.x) + 0.2 * cos(4.0*vWorldPos.y);

  float r = smoothstep (0.5, 1.0, floor(7.0 * m - 2.0)/7.0 );
  finalColor.rgb += decay * step(0.001,r) * spectral_jet(r);
  
  gl_FragColor = finalColor;

  #include <fog_fragment>
}