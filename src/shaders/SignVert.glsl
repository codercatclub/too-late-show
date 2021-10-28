uniform float ignoreReflection; 
uniform float timeMSec; 
uniform float turnOnT;

attribute vec3 color;

varying float vId;
varying vec3 vNormal;
varying float vDist;
varying vec3 vWorldPos;
varying float vReflectionFactor;
varying float blackout;

#include <fog_pars_vertex>
@import ./NoiseFx; 

void main(){
  vec3 center = vec3(0.0, 1.0, 0.0);
  float distToCenter = length(position-center);
  blackout = smoothstep(0.01,0.2, distToCenter - turnOnT);
  float distToTurnOnRing = min(length(distToCenter - turnOnT)*12.0, 1.0);


  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;

  vec4 mvPosition = viewMatrix * worldPos;
  gl_Position = projectionMatrix * mvPosition;

  //FRESNEL
  vec3 I = worldPos.xyz - cameraPosition;
  vNormal = normal;
  vNormal.x += 0.2*sin(timeMSec);
  vNormal.y += (0.1*blackout + 0.2)*cos(timeMSec);
  vNormal.z += (0.1*blackout + 0.1)*cos(0.3*timeMSec);
  vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normalize(vNormal) );

  float mFresnelBias = 0.5;
  float mFresnelScale = 2.1;
  float mFresnelPower = 2.0;
  vReflectionFactor = mFresnelBias + mFresnelScale * abs(pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower ));
  vReflectionFactor += 0.5*(1.0 - distToTurnOnRing) + 4.0*(1.0 - distToTurnOnRing) * cnoise(5.0*position + timeMSec);
  vId = color.r;
  #include <fog_vertex>
}