varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vColor;
varying float vReflectionFactor;


uniform float timeMSec;
uniform float cameraMove;
uniform vec3 fresnelColor;

#include <fog_pars_fragment>
@import ./ExposureFragPars;
void main() {
  vec3 finalColor = fresnelColor;
  gl_FragColor = vec4(finalColor, vReflectionFactor);
  gl_FragColor.rb += 0.5 * vReflectionFactor * vNormal.rb;
  gl_FragColor *= 0.3;
  #ifdef USE_FOG

	#ifdef USE_LOGDEPTHBUF_EXT

		float depth = gl_FragDepthEXT / gl_FragCoord.w;

	#else

		float depth = gl_FragCoord.z / gl_FragCoord.w;

	#endif

	#ifdef FOG_EXP2
    float fogDensity1 = 0.007;
		const float LOG2 = 1.442695;
		float fogFactor = exp2( - fogDensity1 * fogDensity1 * depth * depth * LOG2 );
		fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );

	#else

		float fogFactor = smoothstep( fogNear, fogFar, depth );

	#endif
	
	gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );

#endif

gl_FragColor.rgb *= vColor;
@import ./ExposureFrag;
}