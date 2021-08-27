uniform float timeMSec;
uniform float cameraMove;
uniform float fresnelScale;
uniform float idleMove;

attribute vec3 color;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vReflectionFactor;

#include <fog_pars_vertex>

void main(){
  vec4 worldPos = modelMatrix * vec4(position, 1.0);

  worldPos.x += idleMove * 0.1 * sin(0.2*timeMSec + 0.1*worldPos.y);
  worldPos.z += idleMove * 0.15 * cos(0.1 + 0.3*timeMSec + 4.0 * worldPos.x);
  worldPos.y += idleMove * 0.15 * sin(0.1 + 0.3*timeMSec + worldPos.z);

  vWorldPos = worldPos.xyz;

  vec4 mvPosition = viewMatrix * worldPos;
  gl_Position = projectionMatrix * mvPosition;


  //FRESNEL
  vec3 I = worldPos.xyz - cameraPosition;
  vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normalize(normal) );
  vNormal = worldNormal;

  float mFresnelPower = 3.1;
  vReflectionFactor = fresnelScale * pow( abs(dot( normalize( I ), worldNormal )), mFresnelPower);

 #include <fog_vertex>
}