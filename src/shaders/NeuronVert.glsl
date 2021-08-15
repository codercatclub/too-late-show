uniform float timeMSec;
uniform float cameraMove;

attribute vec3 color;

varying vec3 vNormal;
varying float vDist;
varying vec3 vWorldPos;
varying float vReflectionFactor;
varying float glitchFactor;

 #include <fog_pars_vertex>

 #ifdef USE_MAP
	varying vec2 vUv;
#endif
void main(){
  vNormal = normal;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);

  worldPos.x += 2.0 * cameraMove * sin(0.01*timeMSec);
  worldPos.z += 3.0 * cameraMove * cos(0.1 + 0.02*timeMSec + worldPos.x);

  vWorldPos = worldPos.xyz;

  vDist = color.r;

 #ifdef USE_MAP
	vUv = uv;
#endif


  //FRESNEL
  vec3 I = worldPos.xyz - cameraPosition;
  vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normalize(normal) );

  float mFresnelBias = 0.3;
  float mFresnelScale = 2.1;
  float mFresnelPower = 3.1;
  vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );
  glitchFactor = vReflectionFactor;
  float x = smoothstep(60.0,150.0,length(I));
  vReflectionFactor += x;
  vReflectionFactor = min(vReflectionFactor, 1.0);
  worldPos.xyz += 0.08 * x * worldNormal;
  
  vec4 mvPosition = viewMatrix * worldPos;
  gl_Position = projectionMatrix * mvPosition;

  #include <fog_vertex>


}