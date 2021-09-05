uniform float timeMSec;
uniform float cameraMove;

attribute vec3 color;
attribute float _id;

varying float vId;
varying vec3 vNormal;
varying float vDist;
varying vec3 vWorldPos;
varying float vReflectionFactor;

#include <fog_pars_vertex>

void main(){
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;

  vec4 mvPosition = viewMatrix * worldPos;
  gl_Position = projectionMatrix * mvPosition;

  //FRESNEL
  vec3 I = worldPos.xyz - cameraPosition;
  vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normalize(normal) );
  vNormal = worldNormal;

  float mFresnelBias = 0.5;
  float mFresnelScale = 2.1;
  float mFresnelPower = 2.0;
  vReflectionFactor = mFresnelBias + mFresnelScale * abs(pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower ));

  vId = _id;
 #include <fog_vertex>
}