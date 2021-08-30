uniform float timeMSec;
uniform float cameraMove;

attribute vec3 color;

varying vec3 vNormal;
varying float vDist;
varying vec3 vWorldPos;
varying float vReflectionFactor;

#include <fog_pars_vertex>

void main(){
  vec4 worldPos = modelMatrix * vec4(position, 1.0);

  worldPos.x += 2.0 * cameraMove * sin(0.01*timeMSec);
  worldPos.z += 5.0 * cameraMove * cos(0.1 + 0.02*timeMSec + 0.1*worldPos.x);

  vWorldPos = worldPos.xyz;

  vDist = color.r;

  vec4 mvPosition = viewMatrix * worldPos;
  gl_Position = projectionMatrix * mvPosition;


  //FRESNEL
  vec3 I = worldPos.xyz - cameraPosition;
  vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normalize(normal) );

  worldNormal.x += 0.5 + 0.5  * sin(0.2*worldPos.x);
  worldNormal.z +=  0.5 + 0.5  * sin(0.2*worldPos.z);
  vNormal = worldNormal;

  float mFresnelBias = 0.5;
  float mFresnelScale = 2.1;
  float mFresnelPower = 2.0;
  vReflectionFactor = mFresnelBias + mFresnelScale * abs(pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower ));


 #include <fog_vertex>
}